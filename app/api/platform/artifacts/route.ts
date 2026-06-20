import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { env, isClaudeMockMode, isMockMode } from '@/lib/config/env'
import { ClickUpService } from '@/services/clickup/clickup.service'
import { cleanTranscript } from '@/lib/utils/clean-transcript'
import { getTranscriptContext } from '@/lib/utils/summarize-transcript'
import type { ClickUpTask } from '@/types/clickup'

const FALLBACK = {
  userStory: 'Não foi possível gerar os artefatos. Verifique a conexão e tente novamente.',
  bdd: ['Dado que a demanda foi processada', 'Quando o sistema retornar os artefatos', 'Então eles estarão disponíveis aqui'],
  testCases: ['Verificar geração de artefatos com conexão ativa'],
  dod: ['Artefatos gerados com base na demanda real'],
  dependencies: [],
  subtasks: [],
}

function buildTaskContext(tasks: ClickUpTask[]): string {
  if (!tasks.length) return 'Nenhuma task similar encontrada no histórico organizacional.'

  return tasks
    .slice(0, 10)
    .map((t, i) => {
      const desc = t.description ? ` — ${t.description.slice(0, 200)}` : ''
      const status = t.status?.status ?? 'desconhecido'
      const tags = t.tags?.map((tg) => (typeof tg === 'string' ? tg : tg.name)).join(', ') ?? ''
      return `${i + 1}. [${status.toUpperCase()}] ${t.name}${desc}${tags ? ` (tags: ${tags})` : ''}`
    })
    .join('\n')
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { demand: string; workspaceId?: string }
  const rawDemand = cleanTranscript(body.demand ?? '')
  const { workspaceId } = body

  if (isClaudeMockMode()) {
    return NextResponse.json(FALLBACK)
  }

  // Summarize long transcripts to avoid context dilution
  const demand = await getTranscriptContext(rawDemand, env.anthropic.apiKey, env.anthropic.model)

  // Build real organizational context from ClickUp
  let orgContext = ''
  if (workspaceId && !isMockMode()) {
    try {
      const svc = new ClickUpService()
      const searchQuery = demand.split(/[\n.!?]/)[0].trim().slice(0, 150)
      const tasks = await svc.searchTasks(workspaceId, searchQuery)
      orgContext = buildTaskContext(tasks)
    } catch (err) {
      console.error('[artifacts] ClickUp search failed:', err)
      orgContext = 'Erro ao buscar histórico organizacional no ClickUp.'
    }
  } else {
    orgContext = 'Nenhum workspace conectado — artefatos baseados apenas na demanda.'
  }

  const client = new Anthropic({ apiKey: env.anthropic.apiKey })

  const prompt = `Você é um analista sênior de produto. Com base na demanda abaixo e no histórico organizacional do ClickUp, gere artefatos de especificação.

Demanda: "${demand}"

Histórico organizacional (ClickUp):
${orgContext}

ATENÇÃO: Baseie os artefatos EXCLUSIVAMENTE na demanda acima. Nunca mencione, invente ou referencie tópicos que não estão presentes na demanda (como PL/Cota, Atlas Fundos, vigência de fundos, classes de ativos, subclasses ou qualquer outro assunto externo).

Gere artefatos de especificação enriquecidos. Responda APENAS com JSON válido, sem markdown, no formato exato:
{"userStory":"Como ... eu quero ... para ...","bdd":["Dado ...","Quando ...","Então ...","E ..."],"testCases":["...","...","...","..."],"dod":["...","...","...","..."],"dependencies":["...","...","..."],"subtasks":["...","...","...","..."]}
Tudo em português. O BDD em Gherkin (Dado/Quando/Então/E). 3 a 5 itens por lista.`

  try {
    const message = await client.messages.create({
      model: env.anthropic.model,
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const match = text.match(/\{[\s\S]*\}/)
    const data = match ? JSON.parse(match[0]) : null

    if (data && data.userStory && Array.isArray(data.bdd)) {
      return NextResponse.json(data)
    }
    console.error('[artifacts] Claude returned invalid JSON:', text.slice(0, 200))
    return NextResponse.json(FALLBACK)
  } catch (err) {
    console.error('[artifacts] Claude API error:', err)
    return NextResponse.json(FALLBACK)
  }
}
