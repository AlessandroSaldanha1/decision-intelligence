import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { env, isClaudeMockMode, isMockMode } from '@/lib/config/env'
import { ClickUpService } from '@/services/clickup/clickup.service'
import { cleanTranscript } from '@/lib/utils/clean-transcript'
import { getTranscriptContext } from '@/lib/utils/summarize-transcript'
import type { ClickUpTask } from '@/types/clickup'

interface AnalysisSection {
  q: string
  a: string
}

function buildTaskContext(tasks: ClickUpTask[]): string {
  if (!tasks.length) return ''
  return tasks
    .slice(0, 8)
    .map((t, i) => {
      const desc = t.description ? ` — ${t.description.slice(0, 180)}` : ''
      const status = t.status?.status ?? 'desconhecido'
      return `${i + 1}. [${status.toUpperCase()}] ${t.name}${desc}`
    })
    .join('\n')
}

function buildAnalysisContext(analysis: AnalysisSection[]): string {
  return analysis
    .filter((s) => s.a)
    .map((s) => `${s.q}\n${s.a}`)
    .join('\n\n')
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    demand: string
    workspaceId?: string
    analysis?: AnalysisSection[]
  }
  const rawDemand = cleanTranscript(body.demand ?? '')
  const { workspaceId, analysis } = body

  if (isClaudeMockMode()) {
    return NextResponse.json({ error: 'Claude não configurado (ANTHROPIC_API_KEY ausente)' }, { status: 503 })
  }

  // Summarize long transcripts — skip if we already have analysis context
  let demandContext: string
  if (analysis?.length) {
    // Use the analysis Q&A as a compact, already-processed context
    demandContext = `Demanda original: ${rawDemand.slice(0, 800)}\n\nAnálise já realizada:\n${buildAnalysisContext(analysis)}`
  } else {
    demandContext = await getTranscriptContext(rawDemand, env.anthropic.apiKey, env.anthropic.model)
  }

  // Build optional ClickUp context
  let orgContext = ''
  if (workspaceId && !isMockMode()) {
    try {
      const svc = new ClickUpService()
      const searchQuery = rawDemand.split(/[\n.!?]/)[0].trim().slice(0, 150)
      const tasks = await svc.searchTasks(workspaceId, searchQuery)
      const ctx = buildTaskContext(tasks)
      if (ctx) orgContext = `\nTasks similares no ClickUp:\n${ctx}`
    } catch (err) {
      console.error('[artifacts] ClickUp search failed:', err)
    }
  }

  const client = new Anthropic({ apiKey: env.anthropic.apiKey })

  const prompt = `Você é um analista sênior de produto. Gere artefatos de especificação baseados exclusivamente no contexto abaixo.

${demandContext}${orgContext}

ATENÇÃO: Baseie os artefatos EXCLUSIVAMENTE no conteúdo acima. Nunca mencione tópicos ausentes do contexto (como PL/Cota, Atlas Fundos, vigência de fundos, classes de ativos, subclasses).

Responda APENAS com JSON válido sem markdown:
{"userStory":"Como [perfil], eu quero [ação] para [objetivo]","bdd":["Dado ...","Quando ...","Então ...","E ...","E ..."],"testCases":["TC01 — ...","TC02 — ...","TC03 — ...","TC04 — ..."],"dod":["...","...","...","..."],"dependencies":["...","...","..."],"subtasks":["...","...","...","...","..."]}

Regras: tudo em português; BDD em Gherkin (Dado/Quando/Então/E); 4-5 itens em cada lista; testCases com prefixo TC0N.`

  try {
    const message = await client.messages.create({
      model: env.anthropic.model,
      max_tokens: 1800,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    console.log('[artifacts] Claude raw response (first 300):', text.slice(0, 300))

    const match = text.match(/\{[\s\S]*\}/)
    if (!match) {
      console.error('[artifacts] No JSON found in Claude response. Full text:', text.slice(0, 500))
      return NextResponse.json({ error: 'Claude não retornou JSON válido' }, { status: 502 })
    }

    let data: Record<string, unknown>
    try {
      data = JSON.parse(match[0]) as Record<string, unknown>
    } catch (parseErr) {
      console.error('[artifacts] JSON.parse failed:', parseErr, '| raw:', match[0].slice(0, 300))
      return NextResponse.json({ error: 'Falha ao parsear resposta do Claude' }, { status: 502 })
    }

    if (!data.userStory || !Array.isArray(data.bdd) || data.bdd.length === 0) {
      console.error('[artifacts] Invalid structure from Claude:', JSON.stringify(data).slice(0, 300))
      return NextResponse.json({ error: 'Estrutura de artefatos inválida retornada pelo Claude' }, { status: 502 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('[artifacts] Claude API error:', err)
    return NextResponse.json({ error: 'Erro na chamada ao Claude' }, { status: 502 })
  }
}
