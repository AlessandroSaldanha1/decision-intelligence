import Link from 'next/link'

const MOCK_ANALYSIS = {
  riskScore: 65,
  summary:
    'A demanda é viável tecnicamente mas requer clareza em alguns pontos de escopo antes de iniciar. Os principais riscos estão relacionados a integrações externas e volume de dados.',
  ambiguities: [
    'O escopo de "notificações" não está claro — push, email ou ambos?',
    'Qual é o volume esperado de usuários simultâneos?',
    'Existe integração com sistemas legados que precisa ser considerada?',
  ],
  risks: [
    {
      description: 'Complexidade de integração com APIs externas',
      severity: 'high',
      mitigation: 'Criar camada de abstração e circuit breaker',
    },
    {
      description: 'Performance com grande volume de dados históricos',
      severity: 'medium',
      mitigation: 'Implementar paginação e cache',
    },
    {
      description: 'Falta de especificação de edge cases de autenticação',
      severity: 'low',
      mitigation: 'Revisar fluxo com time de produto',
    },
  ],
  dependencies: [
    { name: 'Serviço de autenticação', type: 'technical' },
    { name: 'Time de dados', type: 'team' },
    { name: 'API de pagamentos externa', type: 'external' },
  ],
  openQuestions: [
    'Qual é o prazo esperado de entrega?',
    'Existe algum constraint de tecnologia que precisa ser respeitado?',
    'Como será o rollout — feature flag, deploy gradual?',
  ],
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'text-red-400 bg-red-400/10 border-red-500/20',
  high: 'text-orange-400 bg-orange-400/10 border-orange-500/20',
  medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-500/20',
  low: 'text-green-400 bg-green-400/10 border-green-500/20',
}

export default async function AnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const riskColor =
    MOCK_ANALYSIS.riskScore >= 70
      ? 'text-red-400'
      : MOCK_ANALYSIS.riskScore >= 40
        ? 'text-yellow-400'
        : 'text-green-400'

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 space-y-8">
      <div className="space-y-1">
        <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">
          Claude Analysis
        </div>
        <h1 className="text-2xl font-bold text-white">Análise Inteligente da Demanda</h1>
      </div>

      <div className="flex items-center gap-6 rounded-xl border border-white/10 bg-gray-900 p-6">
        <div className="text-center">
          <div className={`text-4xl font-bold ${riskColor}`}>{MOCK_ANALYSIS.riskScore}</div>
          <div className="text-xs text-gray-500 mt-1">Score de Risco</div>
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-300">{MOCK_ANALYSIS.summary}</p>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
          Ambiguidades ({MOCK_ANALYSIS.ambiguities.length})
        </h2>
        <div className="space-y-2">
          {MOCK_ANALYSIS.ambiguities.map((a, i) => (
            <div
              key={i}
              className="flex gap-3 rounded-lg border border-yellow-500/20 bg-yellow-600/10 p-3"
            >
              <span className="text-yellow-400 font-bold flex-shrink-0">?</span>
              <span className="text-sm text-yellow-200">{a}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Riscos</h2>
        <div className="space-y-2">
          {MOCK_ANALYSIS.risks.map((r, i) => (
            <div
              key={i}
              className={`rounded-lg border p-4 space-y-1 ${SEVERITY_COLORS[r.severity]}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{r.description}</span>
                <span
                  className={`text-xs font-semibold uppercase rounded-full px-2 py-0.5 ${SEVERITY_COLORS[r.severity]}`}
                >
                  {r.severity}
                </span>
              </div>
              <p className="text-xs opacity-80">{r.mitigation}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
          Perguntas em Aberto
        </h2>
        <div className="space-y-2">
          {MOCK_ANALYSIS.openQuestions.map((q, i) => (
            <div key={i} className="flex gap-3 rounded-lg border border-white/10 bg-gray-900 p-3">
              <span className="text-gray-500 flex-shrink-0">{i + 1}.</span>
              <span className="text-sm text-gray-300">{q}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          href={`/demand/${id}/artifacts`}
          className="flex-1 rounded-lg bg-violet-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-violet-500 transition-colors"
        >
          Gerar Artefatos
        </Link>
      </div>
    </div>
  )
}
