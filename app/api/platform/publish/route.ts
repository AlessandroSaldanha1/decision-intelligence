import { NextRequest, NextResponse } from 'next/server'
import { env, isMockMode } from '@/lib/config/env'

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

interface PublishBody {
  demand: string
  publishConfig: {
    listId: string
    status: string
    priority: string
    tags: string
    optTask: boolean
    optSubtasks: boolean
    optComment: boolean
    optBdd: boolean
    optDod: boolean
  }
  artifacts?: ArtifactsInput
  analysis?: AnalysisSection[]
  forceMock?: boolean
}

function buildSubtasks(artifacts: ArtifactsInput | undefined) {
  if (artifacts?.subtasks?.length) {
    const groups = ['Backend', 'Frontend', 'QA', 'Produto']
    return artifacts.subtasks.map((name, i) => ({
      group: groups[i % groups.length],
      name,
    }))
  }
  return [
    { group: 'Backend', name: 'Análise de impacto' },
    { group: 'Backend', name: 'Aplicação de vigência' },
    { group: 'Backend', name: 'Auditoria' },
    { group: 'Frontend', name: 'Modal de alteração' },
    { group: 'Frontend', name: 'Lista de impactos' },
    { group: 'QA', name: 'Cenários BDD' },
    { group: 'Produto', name: 'Validação de regra' },
  ]
}

function buildDescription(demand: string, cfg: PublishBody['publishConfig'], artifacts: ArtifactsInput | undefined): string {
  const us = artifacts?.userStory ?? `Como usuário, quero ${demand.toLowerCase()} para melhorar a operação.`
  const parts = [
    `# User Story\n\n${us}`,
    `# Contexto de negócio\n\nDemanda original: ${demand}`,
  ]
  if (cfg.optBdd && artifacts?.bdd?.length) {
    parts.push(`# Critérios BDD\n\n${artifacts.bdd.map((s) => `- ${s}`).join('\n')}`)
  }
  if (artifacts?.testCases?.length) {
    parts.push(`# Casos de teste\n\n${artifacts.testCases.map((t) => `- ${t}`).join('\n')}`)
  }
  if (cfg.optDod && artifacts?.dod?.length) {
    parts.push(`# Definition of Done\n\n${artifacts.dod.map((d) => `- ${d}`).join('\n')}`)
  }
  if (artifacts?.dependencies?.length) {
    parts.push(`# Dependências\n\n${artifacts.dependencies.map((d) => `- ${d}`).join('\n')}`)
  }
  return parts.join('\n\n')
}

function buildComment(demand: string, analysis: AnalysisSection[] | undefined): string {
  const lines = [
    'Análise crítica gerada pelo Decision Intelligence.',
    '',
    `Demanda: ${demand}`,
    '',
  ]
  if (analysis?.length) {
    for (const s of analysis) {
      lines.push(`${s.q}\n${s.a}`, '')
    }
  } else {
    lines.push('Análise de contexto não disponível para esta publicação.')
  }
  return lines.join('\n').trim()
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as PublishBody
  const { demand, publishConfig: cfg, artifacts, analysis, forceMock } = body
  const listId = cfg.listId.trim()
  const useMock = forceMock || isMockMode() || !listId

  const subtasks = buildSubtasks(artifacts)

  if (useMock) {
    return NextResponse.json({
      mode: 'mock',
      taskId: 'DEMO-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
      taskUrl: null,
      subtasksCreated: cfg.optSubtasks ? subtasks.length : 0,
      commentCreated: cfg.optComment,
    })
  }

  const token = env.clickup.apiToken
  const base = 'https://api.clickup.com/api/v2'
  const headers = { Authorization: token, 'Content-Type': 'application/json' }
  const tags = cfg.tags.split(',').map((t) => t.trim()).filter(Boolean)

  const taskName = artifacts?.userStory
    ? artifacts.userStory.replace(/^Como [^,]+, eu quero /i, '').split(' para ')[0].slice(0, 120)
    : demand.slice(0, 120)

  try {
    const taskRes = await fetch(`${base}/list/${encodeURIComponent(listId)}/task`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: taskName,
        description: buildDescription(demand, cfg, artifacts),
        status: cfg.status,
        priority: Number(cfg.priority),
        tags,
      }),
    })
    if (!taskRes.ok) {
      const status = taskRes.status
      if (status === 401) return NextResponse.json({ error: 'Token inválido (401)' }, { status: 401 })
      if (status === 404) return NextResponse.json({ error: 'List ID inválido (404)' }, { status: 404 })
      if (status === 403) return NextResponse.json({ error: 'Sem permissão (403)' }, { status: 403 })
      return NextResponse.json({ error: `ClickUp error ${status}` }, { status: 502 })
    }
    const task = (await taskRes.json()) as { id: string; url?: string }

    let subtasksCreated = 0
    if (cfg.optSubtasks) {
      for (const st of subtasks) {
        const r = await fetch(`${base}/list/${encodeURIComponent(listId)}/task`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            name: `${st.group} — ${st.name}`,
            parent: task.id,
            status: cfg.status,
            priority: Number(cfg.priority),
            tags: ['decision-intelligence'],
          }),
        })
        if (r.ok) subtasksCreated++
      }
    }

    let commentCreated = false
    if (cfg.optComment) {
      const r = await fetch(`${base}/task/${task.id}/comment`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ comment_text: buildComment(demand, analysis) }),
      })
      commentCreated = r.ok
    }

    return NextResponse.json({
      mode: 'real',
      taskId: task.id,
      taskUrl: task.url ?? null,
      subtasksCreated,
      commentCreated,
    })
  } catch {
    return NextResponse.json({ error: 'Erro de rede' }, { status: 502 })
  }
}
