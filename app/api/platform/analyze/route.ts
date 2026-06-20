import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { env, isClaudeMockMode, isMockMode } from '@/lib/config/env'
import { ClickUpService } from '@/services/clickup/clickup.service'
import { cleanTranscript } from '@/lib/utils/clean-transcript'
import { getTranscriptContext } from '@/lib/utils/summarize-transcript'
import type { ClickUpTask } from '@/types/clickup'

function buildTaskContext(tasks: ClickUpTask[]): string {
  if (!tasks.length) return ''
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
    return NextResponse.json({ error: 'Claude não configurado (ANTHROPIC_API_KEY ausente)' }, { status: 503 })
  }

  const demand = await getTranscriptContext(rawDemand, env.anthropic.apiKey, env.anthropic.model)

  let orgContext = ''
  if (workspaceId && !isMockMode()) {
    try {
      const svc = new ClickUpService()
      const searchQuery = demand.split(/[\n.!?]/)[0].trim().slice(0, 150)
      const tasks = await svc.searchTasks(workspaceId, searchQuery)
      const ctx = buildTaskContext(tasks)
      if (ctx) orgContext = `\nTasks relacionadas no ClickUp:\n${ctx}`
    } catch (err) {
      console.error('[analyze] ClickUp search failed:', err)
    }
  }

  const client = new Anthropic({ apiKey: env.anthropic.apiKey })

  const prompt = `Você é um analista sênior de uma plataforma de Inteligência Organizacional.

Demanda: "${demand}"
${orgContext}

ATENÇÃO: Baseie suas respostas EXCLUSIVAMENTE na demanda acima e no contexto fornecido. Nunca mencione tópicos ausentes do contexto (como PL/Cota, Atlas Fundos, vigência de fundos, classes de ativos, subclasses).

Responda APENAS com JSON válido sem markdown:
{"sections":[{"q":"O que estamos esquecendo?","a":"..."},{"q":"O que pode dar errado?","a":"..."},{"q":"Quem será impactado?","a":"..."},{"q":"Quais erros já aconteceram antes?","a":"..."},{"q":"Quais soluções já funcionaram?","a":"..."}]}
Cada resposta: 1-2 frases específicas em português baseadas no conteúdo fornecido.`

  try {
    const message = await client.messages.create({
      model: env.anthropic.model,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    console.log('[analyze] Claude raw response (first 300):', text.slice(0, 300))

    const match = text.match(/\{[\s\S]*\}/)
    if (!match) {
      console.error('[analyze] No JSON found:', text.slice(0, 500))
      return NextResponse.json({ error: 'Claude não retornou JSON válido' }, { status: 502 })
    }

    let data: { sections: { q: string; a: string }[] }
    try {
      data = JSON.parse(match[0]) as { sections: { q: string; a: string }[] }
    } catch (parseErr) {
      console.error('[analyze] JSON.parse failed:', parseErr)
      return NextResponse.json({ error: 'Falha ao parsear resposta do Claude' }, { status: 502 })
    }

    if (!Array.isArray(data.sections) || data.sections.length === 0) {
      console.error('[analyze] Invalid structure:', JSON.stringify(data).slice(0, 200))
      return NextResponse.json({ error: 'Estrutura da análise inválida' }, { status: 502 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('[analyze] Claude API error:', err)
    return NextResponse.json({ error: 'Erro na chamada ao Claude' }, { status: 502 })
  }
}
