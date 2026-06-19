import Link from 'next/link'

const MOCK_PLAN = {
  epic: { title: 'Autenticação OAuth — Google e GitHub', estimateDays: 5 },
  totalEstimateHours: 22,
  criticalPath: [
    'Configurar OAuth Apps',
    'Configurar variáveis de ambiente',
    'Configurar NextAuth',
    'Criar tela de login',
    'Testes E2E',
  ],
  subtasks: {
    backend: [
      { title: 'Configurar NextAuth com providers OAuth', hours: 4, priority: 'critical' },
      { title: 'Implementar rate limiting no callback', hours: 2, priority: 'high' },
      { title: 'Configurar proteção de rotas', hours: 2, priority: 'high' },
    ],
    frontend: [
      { title: 'Criar tela de login', hours: 4, priority: 'critical' },
      { title: 'Adicionar UserMenu no header', hours: 2, priority: 'medium' },
    ],
    qa: [
      { title: 'Escrever testes E2E do fluxo de login', hours: 6, priority: 'high' },
    ],
    product: [
      { title: 'Configurar OAuth Apps em Google e GitHub', hours: 1, priority: 'critical' },
    ],
    devops: [
      { title: 'Configurar variáveis de ambiente', hours: 1, priority: 'critical' },
    ],
  },
}

const PRIORITY_COLORS: Record<string, string> = {
  critical: 'text-red-400 bg-red-400/10',
  high: 'text-orange-400 bg-orange-400/10',
  medium: 'text-yellow-400 bg-yellow-400/10',
  low: 'text-gray-400 bg-gray-400/10',
}

const TEAM_LABELS: Record<string, string> = {
  backend: 'Backend',
  frontend: 'Frontend',
  qa: 'QA',
  product: 'Produto',
  devops: 'DevOps',
}

export default async function DeliveryPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 space-y-8">
      <div className="space-y-1">
        <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Plano de Entrega</div>
        <h1 className="text-2xl font-bold text-white">{MOCK_PLAN.epic.title}</h1>
        <div className="flex gap-4 text-sm text-gray-400">
          <span>{MOCK_PLAN.epic.estimateDays} dias</span>
          <span>{MOCK_PLAN.totalEstimateHours}h total</span>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-gray-900 p-5 space-y-2">
        <h2 className="text-sm font-semibold text-gray-300">Caminho Crítico</h2>
        <div className="flex flex-wrap gap-2">
          {MOCK_PLAN.criticalPath.map((step, i) => (
            <span key={i} className="text-xs rounded-full bg-violet-600/20 text-violet-300 px-3 py-1">
              {i + 1}. {step}
            </span>
          ))}
        </div>
      </div>

      {Object.entries(MOCK_PLAN.subtasks).map(([team, tasks]) => (
        <div key={team} className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">{TEAM_LABELS[team]}</h2>
          <div className="space-y-2">
            {tasks.map((task, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-white/10 bg-gray-900 p-4">
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{task.title}</div>
                </div>
                <div className="flex items-center gap-2 text-xs flex-shrink-0">
                  <span className="text-gray-500">{task.hours}h</span>
                  <span className={`rounded-full px-2 py-0.5 font-medium ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex gap-3">
        <Link href={`/demand/${id}/publish`} className="flex-1 rounded-lg bg-violet-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-violet-500 transition-colors">
          Publicar no ClickUp
        </Link>
      </div>
    </div>
  )
}
