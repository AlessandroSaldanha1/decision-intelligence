import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Decision Intelligence · Orla',
  description: 'Transformamos conhecimento organizacional em software entregável.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
