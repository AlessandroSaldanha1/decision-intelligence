type BadgeVariant = 'success' | 'info' | 'warning' | 'error' | 'neutral' | 'violet' | 'orange'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  success: 'text-green-400 bg-green-400/10',
  info: 'text-blue-400 bg-blue-400/10',
  warning: 'text-yellow-400 bg-yellow-400/10',
  error: 'text-red-400 bg-red-400/10',
  neutral: 'text-gray-400 bg-gray-400/10',
  violet: 'text-violet-400 bg-violet-400/10',
  orange: 'text-orange-400 bg-orange-400/10',
}

export default function Badge({ variant = 'neutral', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
