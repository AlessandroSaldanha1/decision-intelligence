'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/demand/new', label: 'Nova Demanda' },
  { href: '/knowledge-sources', label: 'Base de Conhecimento' },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-white/10 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-white">
            <span className="text-violet-400">&#9670;</span>
            <span>Decision Intelligence</span>
          </Link>
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-violet-600/20 text-violet-300'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400 font-medium">
              Mock Mode
            </span>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}
