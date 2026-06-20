import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { env, isClaudeMockMode, isMockMode } from '@/lib/config/env'
import { ClickUpService } from '@/services/clickup/clickup.service'
import type { ClickUpTask } from '@/types/clickup'

interface ArtifactsInput {
  userStory?: string
  bdd?: string[]
  testCases?: string[]
  dod?: string[]
  dependencies?: string[]
  subtasks?: string[]
}

interface PlanGroup {
  frente: string
  items: string[]
}

interface PlanData {
  epic: string
  usTitle: string
  usDesc: string
  groups: PlanGroup[]
  deps: string[]
  risk: { score: number; label: string }
  reuse: { n: string; l: string }[]
}

const FALLBACK: PlanData = {
  epic: 'Entrega em construção',
  usTitle: 'Carregando plano de entrega…',
  usDesc: 'O plano será gerado com base na demanda e no conhecimento organizacional encontrado.',
  groups: [
    { frente: 'Backend', items: ['Implementar lógica de negócio', 'Criar endpoints necessários'] },
    { frente: 'Frontend', items: ['Criar interface de usuário', 'Integrar com o backend'] },
    { frente: 'QA', items: ['Criar cenários de teste', 'Validar critérios de aceite'] },
    { frente: 'Produto', items: ['Validar regras de negócio', 'Alinhar com stakeholders'] },
  ],
  deps: ['API de backend', 'Banco de dados'],
  risk: { score: 50, label: 'Médio' },
  reuse: [
    { n: '0', l: 'projetos semelhantes usados' },
    { n: '0', l: 'incidentes históricos considerados' },
    { n: '0', l: 'regras organizacionais aplicadas' },
    { n: '0', l: 'soluções validadas reutilizadas' },
  ],
}

function buildContext(tasks: ClickUpTask[], artifacts: ArtifactsInput | null): string {
  const parts: string[] = []
  if (artifacts?.userStory) parts.push(`User Story: ${artifacts.userStory}`)
  if (artifacts?.bdd?.length) parts.push(`BDD: ${artifacts.bdd.join(' / ')}`)
  if (artifacts?.dependencies?.length) parts.push(`Dependências identificadas: ${artifacts.dependencies.join(', ')}`)
  if (tasks.length) {
    parts.push('Tasks similares no ClickUp:')
    tasks.slice(0, 8).forEach((t, i) => {
      const status = t.status?.status ?? 'desconhecido'
      parts.push(`${i + 1}. [${status}] ${t.name}${t.description ? ' — ' + t.description.slice(0, 150) : ''}`)
    })
  }
  return parts.join('\n')
}

export async function POST(req: NextRequest) {
  const { demand, workspaceId, artifacts } = (await req.json()) as {
    demand: string
    workspaceId?: string
    artifacts?: ArtifactsInput
  }

  let tasks: ClickUpTask[] = []
  if (workspaceId && !isMockMode()) {
    try {
      const svc = new ClickUpService()
      tasks = await svc.searchTasks(workspaceId, demand)
    } catch { /* ok */ }
  }

  if (isClaudeMockMode()) return NextResponse.json(FALLBACK)

  const context = buildContext(tasks, artifacts ?? null)
  const client = new Anthropic({ apiKey: env.anthropic.apiKey })

  const prompt = `Você é um analista sênior de produto. Gere um plano de entrega para a demanda: "${demand}".

Contexto:
${context}

Retorne APENAS JSON válido, sem markdown, no formato:
{
  "epic": "nome curto do épico",
  "usTitle": "título da user story principal (Como... eu quero... para...)",
  "usDesc": "descrição mais longa da user story em 2-3 frases",
  "groups": [
    { "frente": "Backend", "items": ["item 1", "item 2", "item 3"] },
    { "frente": "Frontend", "items": ["item 1", "item 2", "item 3"] },
    { "frente": "QA", "items": ["item 1", "item 2"] },
    { "frente": "Produto", "items": ["item 1", "item 2"] }
  ],
  "deps": ["dep1", "dep2", "dep3"],
  "risk": { "score": 65, "label": "Médio" },
  "reuse": [
    { "n": "3", "l": "projetos semelhantes usados" },
    { "n": "2", "l": "incidentes históricos considerados" },
    { "n": "4", "l": "regras organizacionais aplicadas" },
    { "n": "1", "l": "soluções validadas reutilizadas" }
  ]
}

Regras:
- risk.score: 0-100, risk.label: "Baixo" (<40), "Médio" (40-70), "Alto" (>70)
- 3-4 itens por grupo
- 3-5 dependências
- reuse.n: número real baseado no contexto das tasks encontradas
- Tudo em português`

  try {
    const msg = await client.messages.create({
      model: env.anthropic.model,
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    })
    const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
    const match = text.match(/\{[\s\S]*\}/)
    const data = match ? (JSON.parse(match[0]) as PlanData) : null
    if (data && data.epic && Array.isArray(data.groups)) return NextResponse.json(data)
    return NextResponse.json(FALLBACK)
  } catch {
    return NextResponse.json(FALLBACK)
  }
}
