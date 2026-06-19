import Link from 'next/link'

export default function OnboardingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-2">
          <div className="text-5xl font-bold text-violet-400">&#9670;</div>
          <h1 className="text-3xl font-bold text-white">Decision Intelligence</h1>
          <p className="text-gray-400">Transformamos conhecimento organizacional em software entregável.</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-gray-900 p-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-white">Conectar ao ClickUp</h2>
            <p className="text-sm text-gray-400">
              Conecte seu workspace para indexar o conhecimento organizacional do seu time.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">ClickUp API Token</label>
              <input
                type="password"
                placeholder="pk_xxxxxxxxxxxxxxxx"
                className="w-full rounded-lg border border-white/10 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Encontre em ClickUp &rarr; Configurações &rarr; Apps &rarr; API Token
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Link
              href="/workspace"
              className="w-full rounded-lg bg-violet-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-violet-500 transition-colors"
            >
              Conectar e Continuar
            </Link>
            <Link
              href="/workspace"
              className="w-full rounded-lg border border-white/10 px-4 py-2.5 text-center text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Continuar no modo demo
            </Link>
          </div>
        </div>

        <p className="text-xs text-gray-600">
          Seu token é usado apenas server-side e nunca é exposto no frontend.
        </p>
      </div>
    </div>
  )
}
