import Link from 'next/link'

const MOCK_INSIGHTS = {
  similarTasks: [
    {
      title: 'Implementar autenticação OAuth',
      score: 0.89,
      project: 'Produto Digital',
      date: '2024-01-20',
    },
    {
      title: 'Refatorar módulo de pagamentos',
      score: 0.72,
      project: 'Engenharia',
      date: '2024-01-18',
    },
    {
      title: 'Integração com API de email',
      score: 0.61,
      project: 'Produto Digital',
      date: '2023-12-05',
    },
  ],
  decisions: [
    { title: 'NextAuth v5 como padrão de autenticação', confidence: 0.98 },
    { title: 'httpOnly cookies para tokens sensíveis', confidence: 0.92 },
  ],
  patterns: [
    'Usar camada de abstração para APIs externas',
    'Implementar retry com exponential backoff em chamadas críticas',
  ],
  risks: ['Integração com SQS requer políticas IAM cuidadosas'],
  teamInsights: [
    '3 tasks similares encontradas no histórico',
    '2 decisões técnicas relacionadas identificadas',
    '2 padrões do time que devem ser respeitados',
    '1 risco histórico identificado nessa área',
  ],
}

export default async function InsightsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 space-y-8">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">
            Organizational Insights
          </div>
          <h1 className="text-2xl font-bold text-white">Contexto Organizacional Recuperado</h1>
          <p className="text-gray-400">
            Conhecimento relevante encontrado no histórico do time para enriquecer a análise.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {MOCK_INSIGHTS.teamInsights.map((insight, i) => (
          <div key={i} className="rounded-lg border border-white/10 bg-gray-900 p-3 text-center">
            <p className="text-xs text-gray-400 leading-snug">{insight}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
          Tasks Similares
        </h2>
        <div className="space-y-2">
          {MOCK_INSIGHTS.similarTasks.map((task, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-lg border border-white/10 bg-gray-900 p-4"
            >
              <div className="flex-1">
                <div className="text-sm font-medium text-white">{task.title}</div>
                <div className="text-xs text-gray-500">
                  {task.project} · {task.date}
                </div>
              </div>
              <div className="text-sm font-semibold text-violet-400">
                {(task.score * 100).toFixed(0)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-blue-500/20 bg-blue-600/10 p-5 space-y-2">
          <h3 className="text-sm font-semibold text-blue-300">Decisões Técnicas Relacionadas</h3>
          {MOCK_INSIGHTS.decisions.map((d, i) => (
            <div key={i} className="text-sm text-blue-200">
              <span className="text-blue-400 font-medium">{(d.confidence * 100).toFixed(0)}%</span>{' '}
              {d.title}
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-600/10 p-5 space-y-2">
          <h3 className="text-sm font-semibold text-amber-300">Riscos Históricos</h3>
          {MOCK_INSIGHTS.risks.map((r, i) => (
            <div key={i} className="text-sm text-amber-200">
              {r}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          href={`/demand/${id}/analysis`}
          className="flex-1 rounded-lg bg-violet-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-violet-500 transition-colors"
        >
          Executar Claude Analysis
        </Link>
      </div>
    </div>
  )
}
