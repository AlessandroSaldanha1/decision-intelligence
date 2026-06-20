import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { env, isClaudeMockMode, isMockMode } from '@/lib/config/env'
import { ClickUpService } from '@/services/clickup/clickup.service'
import type { ClickUpTask } from '@/types/clickup'

interface InsightsProject {
  name: string
  sim: number
  kind: string
  detail: string
  result: string
  tc: string
}

interface InsightsPerson {
  name: string
  role: string
  initials: string
}

interface InsightsData {
  projects: InsightsProject[]
  people: InsightsPerson[]
  teams: string[]
  lessons: string[]
  counts: { projetos: number; incidentes: number; regras: number; solucoes: number }
}

const FALLBACK: InsightsData = {
  projects: [
    { name: 'Histórico relevante', sim: 85, kind: 'Contexto encontrado', detail: 'Tasks relacionadas encontradas no ClickUp', result: 'Contexto disponível', tc: 'var(--clay)' },
  ],
  people: [],
  teams: ['Engenharia', 'Produto'],
  lessons: ['Verifique impactos em entidades relacionadas', 'Documente justificativas antes de alterações sensíveis'],
  counts: { projetos: 1, incidentes: 0, regras: 2, solucoes: 0 },
}

function buildTaskContext(tasks: ClickUpTask[]): string {
  if (!tasks.length) return 'Nenhuma task similar encontrada.'
  return tasks.slice(0, 12).map((t, i) => {
    const desc = t.description ? ` — ${t.description.slice(0, 180)}` : ''
    const status = t.status?.status ?? 'desconhecido'
    const assignees = t.assignees?.map((a) => a.username).join(', ') ?? ''
    const tags = t.tags?.map((tg) => (typeof tg === 'string' ? tg : tg.name)).join(', ') ?? ''
    return `${i + 1}. [${status.toUpperCase()}] ${t.name}${desc}${assignees ? ` (responsáveis: ${assignees})` : ''}${tags ? ` (tags: ${tags})` : ''}`
  }).join('\n')
}

export async function POST(req: NextRequest) {
  const { demand, workspaceId } = (await req.json()) as { demand: string; workspaceId?: string }

  let orgContext = ''
  let tasks: ClickUpTask[] = []

  if (workspaceId && !isMockMode()) {
    try {
      const svc = new ClickUpService()
      tasks = await svc.searchTasks(workspaceId, demand)
      orgContext = buildTaskContext(tasks)
    } catch {
      orgContext = 'Erro ao buscar histórico no ClickUp.'
    }
  } else {
    orgContext = 'Nenhum workspace selecionado.'
  }

  if (isClaudeMockMode()) return NextResponse.json(FALLBACK)

  const client = new Anthropic({ apiKey: env.anthropic.apiKey })

  const prompt = `Você é um analista de Inteligência Organizacional. Analise as tasks do ClickUp abaixo relacionadas à demanda "${demand}" e extraia insights estruturados.

Tasks encontradas:
${orgContext}

Retorne APENAS JSON válido, sem markdown, no formato exato:
{
  "projects": [
    { "name": "nome do projeto ou área", "sim": 85, "kind": "Problema encontrado|Solução aplicada|Contexto relevante", "detail": "descrição em 1 frase", "result": "resultado em 1 frase", "tc": "var(--clay)" }
  ],
  "people": [
    { "name": "nome completo", "role": "cargo ou área", "initials": "XX" }
  ],
  "teams": ["time1", "time2"],
  "lessons": ["lição 1 em 1 frase", "lição 2"],
  "counts": { "projetos": 2, "incidentes": 1, "regras": 3, "solucoes": 1 }
}

Regras:
- "projects": máximo 3, com sim entre 60-99 (baseado na relevância real), tc="var(--clay)" para problemas, tc="var(--sage)" para soluções
- "people": extraia dos assignees reais das tasks, máximo 4
- "teams": deduza dos espaços/tags/contexto, máximo 5
- "lessons": máximo 4 lições concretas derivadas das tasks
- "counts.incidentes": tasks com status de erro/bug/incident
- "counts.regras": tasks com regras de negócio identificadas
- Tudo em português`

  try {
    const msg = await client.messages.create({
      model: env.anthropic.model,
      max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }],
    })
    const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
    const match = text.match(/\{[\s\S]*\}/)
    const data = match ? (JSON.parse(match[0]) as InsightsData) : null
    if (data && Array.isArray(data.projects) && data.projects.length) {
      return NextResponse.json(data)
    }
    return NextResponse.json(FALLBACK)
  } catch {
    return NextResponse.json(FALLBACK)
  }
}
