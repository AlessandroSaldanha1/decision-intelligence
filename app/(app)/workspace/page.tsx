import Link from 'next/link'

const MOCK_WORKSPACES = [
  { id: 'ws-001', name: 'Produto Digital', color: '#7C3AED', memberCount: 12 },
  { id: 'ws-002', name: 'Engenharia', color: '#2563EB', memberCount: 8 },
]

export default function WorkspacePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white">Selecionar Workspace</h1>
        <p className="text-gray-400">Escolha o workspace que deseja analisar.</p>
      </div>

      <div className="space-y-3">
        {MOCK_WORKSPACES.map((ws) => (
          <Link
            key={ws.id}
            href="/knowledge-sources"
            className="flex items-center gap-4 rounded-xl border border-white/10 bg-gray-900 p-5 hover:border-violet-500/50 hover:bg-gray-800/50 transition-all group"
          >
            <div
              className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
              style={{ backgroundColor: ws.color }}
            >
              {ws.name[0]}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-white group-hover:text-violet-300 transition-colors">
                {ws.name}
              </div>
              <div className="text-sm text-gray-500">{ws.memberCount} membros</div>
            </div>
            <svg
              className="h-5 w-5 text-gray-600 group-hover:text-violet-400 transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  )
}
