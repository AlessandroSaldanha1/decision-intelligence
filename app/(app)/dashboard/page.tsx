import Link from 'next/link'

const RECENT_DEMANDS = [
  {
    id: 'demand-001',
    title: 'Implementar autenticação OAuth',
    status: 'published',
    riskScore: 42,
    createdAt: '2024-01-20',
  },
  {
    id: 'demand-002',
    title: 'Refatorar módulo de pagamentos',
    status: 'analyzing',
    riskScore: 78,
    createdAt: '2024-01-22',
  },
  {
    id: 'demand-003',
    title: 'Dashboard de métricas em tempo real',
    status: 'draft',
    riskScore: null,
    createdAt: '2024-01-23',
  },
]

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  published: { label: 'Publicado', color: 'text-green-400 bg-green-400/10' },
  analyzing: { label: 'Analisando', color: 'text-blue-400 bg-blue-400/10' },
  draft: { label: 'Rascunho', color: 'text-gray-400 bg-gray-400/10' },
  generated: { label: 'Gerado', color: 'text-violet-400 bg-violet-400/10' },
}

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 space-y-10">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400">Workspace: <span className="text-violet-300">Produto Digital</span></p>
        </div>
        <Link
          href="/demand/new"
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500 transition-colors"
        >
          + Nova Demanda
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Demandas Processadas', value: '3' },
          { label: 'Documentos Indexados', value: '2.070' },
          { label: 'Tasks Criadas no ClickUp', value: '1' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-white/10 bg-gray-900 p-5">
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Demandas Recentes</h2>
        <div className="space-y-3">
          {RECENT_DEMANDS.map((demand) => {
            const status = STATUS_LABELS[demand.status] ?? STATUS_LABELS.draft
            return (
              <Link
                key={demand.id}
                href={`/demand/${demand.id}/insights`}
                className="flex items-center gap-4 rounded-xl border border-white/10 bg-gray-900 p-4 hover:border-violet-500/30 hover:bg-gray-800/50 transition-all group"
              >
                <div className="flex-1">
                  <div className="font-medium text-white group-hover:text-violet-300 transition-colors">
                    {demand.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{demand.createdAt}</div>
                </div>
                <div className="flex items-center gap-3">
                  {demand.riskScore !== null && (
                    <div className={`text-xs font-medium ${demand.riskScore >= 70 ? 'text-red-400' : demand.riskScore >= 40 ? 'text-yellow-400' : 'text-green-400'}`}>
                      Risco {demand.riskScore}%
                    </div>
                  )}
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${status.color}`}>
                    {status.label}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
