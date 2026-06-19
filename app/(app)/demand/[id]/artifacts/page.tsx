import Link from 'next/link'

const MOCK_ARTIFACTS = {
  userStory: {
    asA: 'usuário da plataforma',
    iWant: 'poder fazer login usando minha conta Google ou GitHub',
    soThat: 'eu não precise criar e lembrar uma senha separada',
    acceptanceCriteria: [
      'Dado que o usuário está na tela de login, quando clicar em "Entrar com Google", então é redirecionado para o fluxo OAuth',
      'Dado que o OAuth foi completado com sucesso, quando retornar, então o usuário deve estar autenticado',
      'Dado que o token de sessão expirou, quando acessar rota protegida, então é redirecionado para login',
    ],
  },
  bddCount: 2,
  testCasesCount: 3,
  dod: {
    technical: ['Código revisado por pelo menos 1 pessoa', 'TypeScript sem erros', 'Cobertura >= 80%'],
    quality: ['Todos os cenários BDD passando', 'Testes E2E em staging'],
    documentation: ['Fluxo documentado', 'Variáveis no .env.example'],
    deployment: ['Deploy em staging validado', 'Feature flag configurada'],
  },
}

export default async function ArtifactsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 space-y-8">
      <div className="space-y-1">
        <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Artefatos Gerados</div>
        <h1 className="text-2xl font-bold text-white">Artefatos de Produto e Engenharia</h1>
      </div>

      <div className="rounded-xl border border-white/10 bg-gray-900 p-6 space-y-4">
        <h2 className="text-base font-semibold text-white">User Story</h2>
        <div className="space-y-2 text-sm text-gray-300">
          <p><span className="text-gray-500">Como</span> {MOCK_ARTIFACTS.userStory.asA},</p>
          <p><span className="text-gray-500">eu quero</span> {MOCK_ARTIFACTS.userStory.iWant}</p>
          <p><span className="text-gray-500">para que</span> {MOCK_ARTIFACTS.userStory.soThat}.</p>
        </div>
        <div className="space-y-2 mt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Critérios de Aceite</h3>
          {MOCK_ARTIFACTS.userStory.acceptanceCriteria.map((c, i) => (
            <div key={i} className="flex gap-2 text-sm text-gray-300">
              <span className="text-violet-400 flex-shrink-0">&#10003;</span>
              <span>{c}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Cenários BDD', value: MOCK_ARTIFACTS.bddCount, color: 'text-blue-400' },
          { label: 'Casos de Teste', value: MOCK_ARTIFACTS.testCasesCount, color: 'text-green-400' },
          { label: 'Itens na DoD', value: Object.values(MOCK_ARTIFACTS.dod).flat().length, color: 'text-violet-400' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-white/10 bg-gray-900 p-4 text-center">
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-white/10 bg-gray-900 p-6 space-y-4">
        <h2 className="text-base font-semibold text-white">Definition of Done</h2>
        {Object.entries(MOCK_ARTIFACTS.dod).map(([category, items]) => (
          <div key={category}>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">{category}</h3>
            <div className="space-y-1">
              {items.map((item, i) => (
                <div key={i} className="flex gap-2 text-sm text-gray-300">
                  <span className="text-gray-600">&#9633;</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Link href={`/demand/${id}/delivery-plan`} className="flex-1 rounded-lg bg-violet-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-violet-500 transition-colors">
          Gerar Plano de Entrega
        </Link>
      </div>
    </div>
  )
}
