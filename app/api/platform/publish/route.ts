import { NextRequest, NextResponse } from 'next/server'
import { env, isMockMode } from '@/lib/config/env'

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
  forceMock?: boolean
}

const subtasks = [
  { group: 'Backend', name: 'Análise de impacto' },
  { group: 'Backend', name: 'Aplicação de vigência' },
  { group: 'Backend', name: 'Auditoria' },
  { group: 'Frontend', name: 'Modal de alteração' },
  { group: 'Frontend', name: 'Lista de impactos' },
  { group: 'QA', name: 'Cenários BDD' },
  { group: 'Produto', name: 'Validação de regra' },
]

function buildDescription(demand: string, cfg: PublishBody['publishConfig']): string {
  const parts = [
    `# User Story\n\nComo operador autorizado\nQuero alterar a data de início e fim de vigência de uma classe\nPara corrigir informações cadastrais sem abertura de GMUD`,
    `# Contexto de negócio\n\nAlterações cadastrais sensíveis precisam ser feitas com rastreabilidade, análise de impacto e histórico auditável.\n\nDemanda original: ${demand}`,
  ]
  if (cfg.optBdd) {
    parts.push(`# Critérios BDD\n\n## Cenário: Alteração de vigência com sucesso\nDado que existe uma classe ativa\nE o usuário possui permissão de edição\nE informou justificativa válida\nQuando aplicar nova data de vigência\nEntão o sistema atualiza a vigência da classe\nE registra a alteração no histórico\n\n## Cenário: Tentativa sem justificativa\nDado que existe uma classe ativa\nQuando o usuário tentar aplicar nova vigência sem justificativa\nEntão o sistema bloqueia a alteração\nE exibe mensagem de justificativa obrigatória`)
  }
  parts.push(`# Casos de teste\n\n- Deve permitir alteração com usuário autorizado\n- Deve bloquear alteração sem justificativa\n- Deve listar entidades impactadas antes da aplicação\n- Deve registrar histórico da alteração`)
  if (cfg.optDod) {
    parts.push(`# Definition of Done\n\n- US revisada pelo PM\n- Critérios BDD aprovados pelo QA\n- Logs e auditoria implementados\n- Testes automatizados criados\n- Documentação atualizada`)
  }
  parts.push(`# Conhecimento organizacional reaproveitado\n\n- Projeto Atlas Fundos: alteração semelhante impactou PL/Cota\n- Projeto Previdência: ausência de justificativa gerou falha de auditoria\n- Projeto Cadastro: análise de impacto reduziu chamados`)
  return parts.join('\n\n')
}

function buildComment(demand: string): string {
  return [
    'Análise crítica gerada pelo Decision Intelligence.',
    '',
    `Demanda: ${demand}`,
    'Ambiguidades: escopo de "vigência" não distingue claramente data de início e fim; comportamento para entidades filhas (subclasses) indefinido.',
    'Riscos: inconsistência em PL/Cota · histórico incompleto · propagação indevida · falha de auditoria.',
    'Stakeholders impactados: Operação, Compliance, Produto, Engenharia.',
    'Score de risco: 82/100 (Alto).',
    'Contextos históricos usados: Atlas Fundos (incidente de PL/Cota), Previdência (falha de auditoria), Cadastro (análise de impacto reduziu chamados).',
  ].join('\n')
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as PublishBody
  const { demand, publishConfig: cfg, forceMock } = body
  const listId = cfg.listId.trim()
  const useMock = forceMock || isMockMode() || !listId

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

  try {
    const taskRes = await fetch(`${base}/list/${encodeURIComponent(listId)}/task`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'Operador pode alterar vigência de classe para corrigir dados cadastrais',
        description: buildDescription(demand, cfg),
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
        body: JSON.stringify({ comment_text: buildComment(demand) }),
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
