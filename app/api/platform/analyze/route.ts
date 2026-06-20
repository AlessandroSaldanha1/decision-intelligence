import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { env, isClaudeMockMode, isMockMode } from '@/lib/config/env'
import { ClickUpService } from '@/services/clickup/clickup.service'
import { cleanTranscript } from '@/lib/utils/clean-transcript'
import { getTranscriptContext } from '@/lib/utils/summarize-transcript'
import type { ClickUpTask } from '@/types/clickup'

const FALLBACK: { sections: { q: string; a: string }[] } = {
  sections: [
    { q: 'O que estamos esquecendo?', a: 'Não foi possível gerar a análise. Verifique a conexão e tente novamente.' },
    { q: 'O que pode dar errado?', a: '' },
    { q: 'Quem será impactado?', a: '' },
    { q: 'Quais erros já aconteceram antes?', a: '' },
    { q: 'Quais soluções já funcionaram?', a: '' },
  ],
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
      console.error('[analyze] ClickUp search failed:', err)
      orgContext = 'Erro ao buscar histórico organizacional no ClickUp.'
    }
  } else {
    orgContext = 'Nenhum workspace conectado — análise baseada apenas na demanda.'
  }

  const client = new Anthropic({ apiKey: env.anthropic.apiKey })

  const prompt = `Você é um analista sênior de uma plataforma de Inteligência Organizacional.

Demanda nova: "${demand}"

Conhecimento organizacional encontrado no ClickUp:
${orgContext}

ATENÇÃO: Baseie suas respostas EXCLUSIVAMENTE na demanda acima e no contexto do ClickUp fornecido. Nunca mencione, invente ou referencie tópicos que não estão presentes na demanda (como PL/Cota, Atlas Fundos, vigência de fundos, classes de ativos, subclasses ou qualquer outro assunto externo).

Produza uma análise de contexto baseada no conteúdo real acima. Responda APENAS com JSON válido, sem markdown, no formato exato:
{"sections":[{"q":"O que estamos esquecendo?","a":"..."},{"q":"O que pode dar errado?","a":"..."},{"q":"Quem será impactado?","a":"..."},{"q":"Quais erros já aconteceram antes?","a":"..."},{"q":"Quais soluções já funcionaram?","a":"..."}]}
Cada "a" deve ter 1-2 frases específicas em português, fundamentadas no conteúdo fornecido.`

  try {
    const message = await client.messages.create({
      model: env.anthropic.model,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const match = text.match(/\{[\s\S]*\}/)
    const data = match ? (JSON.parse(match[0]) as { sections: { q: string; a: string }[] }) : null

    if (data && Array.isArray(data.sections) && data.sections.length) {
      return NextResponse.json(data)
    }
    console.error('[analyze] Claude returned invalid JSON:', text.slice(0, 200))
    return NextResponse.json(FALLBACK)
  } catch (err) {
    console.error('[analyze] Claude API error:', err)
    return NextResponse.json(FALLBACK)
  }
}
