interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
}

const PADDING = { sm: 'p-4', md: 'p-5', lg: 'p-6' }

export default function Card({ children, className = '', padding = 'lg' }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-white/10 bg-gray-900 ${PADDING[padding]} ${className}`}
    >
      {children}
    </div>
  )
}
