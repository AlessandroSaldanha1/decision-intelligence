import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { env, isClaudeMockMode, isMockMode } from '@/lib/config/env'
import { ClickUpService } from '@/services/clickup/clickup.service'
import { cleanTranscript } from '@/lib/utils/clean-transcript'
import type { ClickUpTask } from '@/types/clickup'

interface ArtifactsInput {
  userStory?: string
  bdd?: string[]
  testCases?: string[]
  dod?: string[]
  dependencies?: string[]
  subtasks?: string[]
}

interface AnalysisSection {
  q: string
  a: string
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
  risk: { score: number; label: string; factors: string[] }
  reuse: { n: string; l: string }[]
}

function buildContext(
  tasks: ClickUpTask[],
  artifacts: ArtifactsInput | null,
  analysis: AnalysisSection[] | null,
): string {
  const parts: string[] = []

  if (analysis?.length) {
    const analysisText = analysis
      .filter((s) => s.a)
      .map((s) => `${s.q}\n${s.a}`)
      .join('\n\n')
    parts.push(`Análise realizada:\n${analysisText}`)
  }

  if (artifacts?.userStory) parts.push(`User Story: ${artifacts.userStory}`)
  if (artifacts?.bdd?.length) parts.push(`BDD: ${artifacts.bdd.join(' / ')}`)
  if (artifacts?.dependencies?.length) parts.push(`Dependências identificadas: ${artifacts.dependencies.join(', ')}`)
  if (artifacts?.subtasks?.length) parts.push(`Subtarefas identificadas: ${artifacts.subtasks.join(', ')}`)

  if (tasks.length) {
    parts.push('Tasks similares no ClickUp:')
    tasks.slice(0, 6).forEach((t, i) => {
      const status = t.status?.status ?? 'desconhecido'
      parts.push(`${i + 1}. [${status}] ${t.name}${t.description ? ' — ' + t.description.slice(0, 120) : ''}`)
    })
  }
  return parts.join('\n\n')
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    demand: string
    workspaceId?: string
    artifacts?: ArtifactsInput
    analysis?: AnalysisSection[]
  }
  const demand = cleanTranscript(body.demand ?? '')
  const { workspaceId, artifacts, analysis } = body

  if (isClaudeMockMode()) {
    return NextResponse.json({ error: 'Claude não configurado (ANTHROPIC_API_KEY ausente)' }, { status: 503 })
  }

  let tasks: ClickUpTask[] = []
  if (workspaceId && !isMockMode()) {
    try {
      const svc = new ClickUpService()
      const searchQuery = demand.split(/[\n.!?]/)[0].trim().slice(0, 150)
      tasks = await svc.searchTasks(workspaceId, searchQuery)
    } catch (err) {
      console.error('[plan] ClickUp search failed:', err)
    }
  }

  const context = buildContext(tasks, artifacts ?? null, analysis ?? null)
  const client = new Anthropic({ apiKey: env.anthropic.apiKey })

  const prompt = `Você é um analista sênior de produto. Gere um plano de entrega baseado exclusivamente no contexto abaixo.

Demanda: "${demand.slice(0, 800)}"

${context}

ATENÇÃO: Baseie o plano EXCLUSIVAMENTE no conteúdo acima. Nunca mencione tópicos ausentes do contexto (como PL/Cota, Atlas Fundos, vigência de fundos, classes de ativos, subclasses).

Retorne APENAS JSON válido sem markdown:
{
  "epic": "nome curto do épico (5-8 palavras)",
  "usTitle": "Como [perfil], eu quero [ação] para [objetivo]",
  "usDesc": "Descrição expandida da user story em 2-3 frases",
  "groups": [
    { "frente": "Backend", "items": ["item 1", "item 2", "item 3"] },
    { "frente": "Frontend", "items": ["item 1", "item 2", "item 3"] },
    { "frente": "QA", "items": ["item 1", "item 2"] },
    { "frente": "Produto", "items": ["item 1", "item 2"] }
  ],
  "deps": ["dep1", "dep2", "dep3"],
  "risk": {
    "score": 65,
    "label": "Médio",
    "factors": ["fator que eleva o risco 1", "fator que eleva o risco 2", "fator que eleva o risco 3"]
  },
  "reuse": [
    { "n": "2", "l": "projetos semelhantes considerados" },
    { "n": "1", "l": "incidentes históricos considerados" },
    { "n": "3", "l": "regras organizacionais aplicadas" },
    { "n": "1", "l": "soluções validadas reutilizadas" }
  ]
}

Regras: risk.score 0-100; label "Baixo" (<40), "Médio" (40-70), "Alto" (>70); risk.factors são 2-4 frases curtas explicando os principais motivos do score (ex: "Dependência de time externo", "Integração com sistema sem documentação"); 3-4 itens por grupo; tudo em português.`

  try {
    const msg = await client.messages.create({
      model: env.anthropic.model,
      max_tokens: 1600,
      messages: [{ role: 'user', content: prompt }],
    })
    const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
    console.log('[plan] Claude raw response (first 300):', text.slice(0, 300))

    const match = text.match(/\{[\s\S]*\}/)
    if (!match) {
      console.error('[plan] No JSON found in Claude response:', text.slice(0, 500))
      return NextResponse.json({ error: 'Claude não retornou JSON válido' }, { status: 502 })
    }

    let data: PlanData
    try {
      data = JSON.parse(match[0]) as PlanData
    } catch (parseErr) {
      console.error('[plan] JSON.parse failed:', parseErr, '| raw:', match[0].slice(0, 300))
      return NextResponse.json({ error: 'Falha ao parsear resposta do Claude' }, { status: 502 })
    }

    if (!data.epic || !Array.isArray(data.groups) || data.groups.length === 0) {
      console.error('[plan] Invalid structure from Claude:', JSON.stringify(data).slice(0, 300))
      return NextResponse.json({ error: 'Estrutura do plano inválida retornada pelo Claude' }, { status: 502 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('[plan] Claude API error:', err)
    return NextResponse.json({ error: 'Erro na chamada ao Claude' }, { status: 502 })
  }
}
