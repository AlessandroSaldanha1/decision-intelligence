import Link from 'next/link'

export default async function PublishPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 space-y-8">
      <div className="space-y-1">
        <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">
          Publicar no ClickUp
        </div>
        <h1 className="text-2xl font-bold text-white">Configurar Publicação</h1>
        <p className="text-gray-400">Revise e confirme o que será criado no ClickUp.</p>
      </div>

      <div className="rounded-xl border border-white/10 bg-gray-900 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-300">O que será criado</h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-300">
            <span className="text-violet-400">&#9679;</span>
            <strong>1 Task principal</strong>: Implementar autenticação OAuth
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <span className="text-gray-500">&#9679;</span>
            <strong>7 Subtasks</strong> distribuídas por frente (Backend, Frontend, QA, Produto,
            DevOps)
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <span className="text-gray-500">&#9679;</span>
            <strong>1 Comentário</strong> com contexto da demanda original
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Lista de destino</label>
        <select className="w-full rounded-lg border border-white/10 bg-gray-900 px-4 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500">
          <option value="l-001">Sprint 2024-Q1 / Backlog</option>
          <option value="l-002">Produto Digital / Backlog</option>
        </select>
      </div>

      <div className="rounded-xl border border-amber-500/20 bg-amber-600/10 p-4">
        <p className="text-sm text-amber-300">
          <strong>Modo demo:</strong> A publicação será simulada. Configure CLICKUP_API_TOKEN no
          .env para publicar de verdade.
        </p>
      </div>

      <div className="flex gap-3">
        <Link
          href={`/demand/${id}/result`}
          className="flex-1 rounded-lg bg-violet-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-violet-500 transition-colors"
        >
          Publicar Agora
        </Link>
        <Link
          href={`/demand/${id}/delivery-plan`}
          className="rounded-lg border border-white/10 px-4 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          Voltar
        </Link>
      </div>
    </div>
  )
}
