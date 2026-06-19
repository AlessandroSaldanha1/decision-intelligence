import Link from 'next/link'

const SOURCES = [
  { id: 'tasks', label: 'Tasks e Sprints', description: 'Histórico de tasks e sprints concluídas', count: 247, enabled: true },
  { id: 'comments', label: 'Comentários', description: 'Discussões e decisões registradas em tasks', count: 1823, enabled: true },
  { id: 'subtasks', label: 'Subtasks', description: 'Detalhamento técnico de implementações', count: 0, enabled: false },
  { id: 'docs', label: 'Docs', description: 'Documentação técnica e de produto', count: 0, enabled: false },
]

export default function KnowledgeSourcesPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white">Fontes de Conhecimento</h1>
        <p className="text-gray-400">Selecione as fontes que serão usadas para construir a memória organizacional.</p>
      </div>

      <div className="space-y-3">
        {SOURCES.map((source) => (
          <div
            key={source.id}
            className={`flex items-start gap-4 rounded-xl border p-5 transition-colors ${
              source.enabled
                ? 'border-violet-500/30 bg-violet-600/10'
                : 'border-white/10 bg-gray-900 opacity-60'
            }`}
          >
            <div className={`mt-0.5 h-5 w-5 rounded flex items-center justify-center flex-shrink-0 ${
              source.enabled ? 'bg-violet-600' : 'border border-white/20 bg-transparent'
            }`}>
              {source.enabled && (
                <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-white">{source.label}</span>
                {source.count > 0 && (
                  <span className="text-xs text-gray-500">{source.count.toLocaleString()} docs</span>
                )}
              </div>
              <p className="text-sm text-gray-400 mt-0.5">{source.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-blue-500/20 bg-blue-600/10 p-4">
        <p className="text-sm text-blue-300">
          <strong>2 fontes ativas</strong> — 2.070 documentos indexados e prontos para busca semântica.
        </p>
      </div>

      <div className="flex gap-3">
        <Link href="/dashboard" className="flex-1 rounded-lg bg-violet-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-violet-500 transition-colors">
          Construir Memória e Continuar
        </Link>
      </div>
    </div>
  )
}
