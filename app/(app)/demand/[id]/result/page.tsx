import Link from 'next/link'

export default async function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const mockTaskUrl = 'https://app.clickup.com/t/mock-task-001'

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 space-y-8">
      <div className="text-center space-y-4 py-8">
        <div className="text-6xl">&#10003;</div>
        <h1 className="text-3xl font-bold text-white">Publicado com Sucesso!</h1>
        <p className="text-gray-400">A User Story e as subtasks foram criadas no ClickUp.</p>
      </div>

      <div className="rounded-xl border border-green-500/20 bg-green-600/10 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-green-300">Resumo da Publicação</h2>
        <div className="space-y-2 text-sm text-green-200">
          <div className="flex justify-between">
            <span>Task principal criada</span>
            <span className="text-green-400 font-medium">&#10003;</span>
          </div>
          <div className="flex justify-between">
            <span>3 subtasks de Backend</span>
            <span className="text-green-400 font-medium">&#10003;</span>
          </div>
          <div className="flex justify-between">
            <span>2 subtasks de Frontend</span>
            <span className="text-green-400 font-medium">&#10003;</span>
          </div>
          <div className="flex justify-between">
            <span>1 subtask de QA</span>
            <span className="text-green-400 font-medium">&#10003;</span>
          </div>
          <div className="flex justify-between">
            <span>1 subtask de Produto</span>
            <span className="text-green-400 font-medium">&#10003;</span>
          </div>
          <div className="flex justify-between">
            <span>1 subtask de DevOps</span>
            <span className="text-green-400 font-medium">&#10003;</span>
          </div>
          <div className="flex justify-between">
            <span>Comentário com contexto adicionado</span>
            <span className="text-green-400 font-medium">&#10003;</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <a
          href={mockTaskUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full rounded-lg border border-white/10 px-4 py-2.5 text-center text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
        >
          Abrir no ClickUp &rarr;
        </a>
        <Link
          href="/demand/new"
          className="w-full rounded-lg bg-violet-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-violet-500 transition-colors"
        >
          Processar Nova Demanda
        </Link>
        <Link
          href="/dashboard"
          className="w-full rounded-lg border border-white/10 px-4 py-2.5 text-center text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          Voltar ao Dashboard
        </Link>
      </div>
    </div>
  )
}
