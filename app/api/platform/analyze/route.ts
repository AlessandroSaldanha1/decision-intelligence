import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { env, isClaudeMockMode, isMockMode } from '@/lib/config/env'
import { ClickUpService } from '@/services/clickup/clickup.service'
import type { ClickUpTask } from '@/types/clickup'

const FALLBACK: { sections: { q: string; a: string }[] } = {
  sections: [
    { q: 'O que estamos esquecendo?', a: 'A justificativa obrigatória e o impacto em entidades filhas. Em casos similares (91%), a vigência alterou o cálculo de PL/Cota a jusante.' },
    { q: 'O que pode dar errado?', a: 'Recálculo indevido de PL/Cota em produção e alteração de fundos encerrados — exatamente o incidente registrado no projeto Atlas Fundos.' },
    { q: 'Quem será impactado?', a: 'Operação e Compliance (trilha de auditoria), além de Produto e Engenharia no recálculo de cotas e validações.' },
    { q: 'Quais erros já aconteceram antes?', a: 'Incidente em produção no Atlas Fundos e falha de auditoria na Previdência pela ausência de justificativa obrigatória.' },
    { q: 'Quais soluções já funcionaram?', a: 'A análise de impacto antes da aplicação, usada no projeto Cadastro, reduziu chamados; auditar alterações sensíveis sustentou a conformidade.' },
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
  const { demand, workspaceId } = (await req.json()) as { demand: string; workspaceId?: string }

  if (isClaudeMockMode()) {
    return NextResponse.json(FALLBACK)
  }

  // Build real organizational context from ClickUp
  let orgContext = ''
  if (workspaceId && !isMockMode()) {
    try {
      const svc = new ClickUpService()
      const tasks = await svc.searchTasks(workspaceId, demand)
      orgContext = buildTaskContext(tasks)
    } catch {
      orgContext = 'Erro ao buscar histórico organizacional no ClickUp.'
    }
  } else {
    orgContext = [
      '1. Projeto Atlas Fundos: Mudança de vigência impactou PL/Cota → Incidente em produção.',
      '2. Projeto Previdência: Ausência de justificativa obrigatória → Falha de auditoria.',
      '3. Projeto Cadastro: Análise de impacto antes da aplicação → Redução de chamados.',
    ].join('\n')
  }

  const client = new Anthropic({ apiKey: env.anthropic.apiKey })

  const prompt = `Você é um analista sênior de uma plataforma de Inteligência Organizacional.
Demanda nova: "${demand}".
Conhecimento organizacional encontrado no ClickUp:
${orgContext}

Produza uma análise de contexto baseada nas tasks acima. Responda APENAS com JSON válido, sem markdown, no formato exato:
{"sections":[{"q":"O que estamos esquecendo?","a":"..."},{"q":"O que pode dar errado?","a":"..."},{"q":"Quem será impactado?","a":"..."},{"q":"Quais erros já aconteceram antes?","a":"..."},{"q":"Quais soluções já funcionaram?","a":"..."}]}
Cada "a" deve ter 1-2 frases específicas em português, fundamentadas no conhecimento organizacional acima.`

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
    return NextResponse.json(FALLBACK)
  } catch {
    return NextResponse.json(FALLBACK)
  }
}
