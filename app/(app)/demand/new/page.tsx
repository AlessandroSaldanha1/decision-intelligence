import Link from 'next/link'

export default function NewDemandPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white">Nova Demanda</h1>
        <p className="text-gray-400">Descreva o que precisa ser construído. Quanto mais contexto, melhor a análise.</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Título da demanda</label>
          <input
            type="text"
            placeholder="Ex: Implementar notificações em tempo real"
            className="w-full rounded-lg border border-white/10 bg-gray-900 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Descrição detalhada</label>
          <textarea
            rows={8}
            placeholder="Descreva o problema que precisa resolver, o comportamento esperado, contexto de negócio, restrições técnicas conhecidas..."
            className="w-full rounded-lg border border-white/10 bg-gray-900 px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Fontes de Conhecimento</label>
          <p className="text-xs text-gray-500 mb-3">Selecione quais fontes serão consultadas para enriquecer a análise.</p>
          <div className="space-y-2">
            {[
              { id: 'tasks', label: 'Tasks e Sprints', count: '247 docs' },
              { id: 'comments', label: 'Comentários', count: '1.823 docs' },
            ].map((source) => (
              <label key={source.id} className="flex items-center gap-3 cursor-pointer group">
                <div className="h-4 w-4 rounded bg-violet-600 flex items-center justify-center flex-shrink-0">
                  <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{source.label}</span>
                <span className="text-xs text-gray-500">{source.count}</span>
              </label>
            ))}
          </div>
        </div>

        <Link
          href="/demand/demo-001/insights"
          className="block w-full rounded-lg bg-violet-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-violet-500 transition-colors"
        >
          Analisar Demanda
        </Link>
      </div>
    </div>
  )
}
