import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { env, isClaudeMockMode, isMockMode } from '@/lib/config/env'
import { ClickUpService } from '@/services/clickup/clickup.service'
import { cleanTranscript } from '@/lib/utils/clean-transcript'
import { getTranscriptContext } from '@/lib/utils/summarize-transcript'
import type { ClickUpTask } from '@/types/clickup'

interface InsightsProject {
  name: string
  produto: string
  modulo: string | null
  sprint: string | null
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
  projects: [],
  people: [],
  teams: [],
  lessons: ['Não foi possível gerar insights. Verifique a conexão e tente novamente.'],
  counts: { projetos: 0, incidentes: 0, regras: 0, solucoes: 0 },
}

function buildTaskContext(tasks: ClickUpTask[]): string {
  if (!tasks.length) return 'Nenhuma task similar encontrada.'
  return tasks.slice(0, 12).map((t, i) => {
    const desc = t.description ? ` — ${t.description.slice(0, 180)}` : ''
    const status = t.status?.status ?? 'desconhecido'
    const assignees = t.assignees?.map((a) => a.username).join(', ') ?? ''
    const tags = t.tags?.map((tg) => (typeof tg === 'string' ? tg : tg.name)).join(', ') ?? ''
    const list = t.list?.name ? ` [lista: ${t.list.name}]` : ''
    const folder = t.folder?.name && !t.folder.hidden ? ` [pasta: ${t.folder.name}]` : ''
    return `${i + 1}. [${status.toUpperCase()}] ${t.name}${folder}${list}${desc}${assignees ? ` (responsáveis: ${assignees})` : ''}${tags ? ` (tags: ${tags})` : ''}`
  }).join('\n')
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { demand: string; workspaceId?: string }
  const rawDemand = cleanTranscript(body.demand ?? '')
  const { workspaceId } = body

  // Summarize long transcripts to avoid context dilution
  const demand = isClaudeMockMode()
    ? rawDemand
    : await getTranscriptContext(rawDemand, env.anthropic.apiKey, env.anthropic.model)

  let orgContext = ''
  let tasks: ClickUpTask[] = []

  if (workspaceId && !isMockMode()) {
    try {
      const svc = new ClickUpService()
      const searchQuery = demand.split(/[\n.!?]/)[0].trim().slice(0, 150)
      tasks = await svc.searchTasks(workspaceId, searchQuery)
      orgContext = buildTaskContext(tasks)
    } catch (err) {
      console.error('[insights] ClickUp search failed:', err)
      orgContext = 'Erro ao buscar histórico no ClickUp.'
    }
  } else {
    orgContext = 'Nenhum workspace conectado.'
  }

  if (isClaudeMockMode()) return NextResponse.json(FALLBACK)

  const client = new Anthropic({ apiKey: env.anthropic.apiKey })

  const prompt = `Você é um analista de Inteligência Organizacional. Analise as tasks do ClickUp abaixo relacionadas à demanda e extraia insights estruturados.

Demanda: "${demand}"

Tasks encontradas no ClickUp:
${orgContext}

ATENÇÃO: Baseie seus insights EXCLUSIVAMENTE na demanda e nas tasks acima. Nunca mencione, invente ou referencie tópicos que não estão presentes na demanda (como PL/Cota, Atlas Fundos, vigência de fundos, classes de ativos, subclasses ou qualquer outro assunto externo).

Retorne APENAS JSON válido, sem markdown, no formato exato:
{
  "projects": [
    { "name": "nome da task ou lista", "produto": "nome do produto/sistema (use o nome da pasta ou domínio maior inferido do nome das tasks)", "modulo": "nome do módulo ou subdomínio (use o nome da pasta se disponível, senão null)", "sprint": "nome da lista se for uma sprint (ex: 'Sprint 12'), senão null", "sim": 85, "kind": "Problema encontrado|Solução aplicada|Contexto relevante", "detail": "descrição em 1 frase", "result": "resultado em 1 frase", "tc": "var(--clay)" }
  ],
  "people": [
    { "name": "nome completo", "role": "cargo ou área", "initials": "XX" }
  ],
  "teams": ["time1", "time2"],
  "lessons": ["lição 1 em 1 frase", "lição 2"],
  "counts": { "projetos": 2, "incidentes": 1, "regras": 3, "solucoes": 1 }
}

Regras:
- "projects": máximo 3; sim entre 60-99 baseado na relevância real; tc="var(--clay)" para problemas/incidentes, tc="var(--sage)" para soluções; só inclua um card se houver uma task real correspondente na lista acima; "produto" deve ser o sistema/produto maior (use o nome da pasta quando disponível); "modulo" é o subdomínio ou módulo funcional (use pasta mais específica ou null); "sprint" é o nome da lista apenas se for uma sprint (contém "Sprint" ou número de versão), senão null
- "people": use SOMENTE nomes que aparecem no campo "responsáveis" das tasks acima, máximo 4; se não houver, retorne array vazio
- "teams": times ou áreas impactadas — use SOMENTE nomes de equipes, áreas ou departamentos que aparecem nas tasks (ex: "Time de Dados", "Backend", "Produto"). Nunca inclua nomes de sprints, listas, datas ou versões. Se não houver times identificáveis, retorne array vazio
- "lessons": máximo 4 lições concretas e diretas derivadas das tasks — sem generalizar além do que está escrito
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
    if (data && Array.isArray(data.projects)) {
      return NextResponse.json(data)
    }
    console.error('[insights] Claude returned invalid JSON:', text.slice(0, 200))
    return NextResponse.json(FALLBACK)
  } catch (err) {
    console.error('[insights] Claude API error:', err)
    return NextResponse.json(FALLBACK)
  }
}
