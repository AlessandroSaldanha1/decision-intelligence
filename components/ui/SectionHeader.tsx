interface SectionHeaderProps {
  children: React.ReactNode
  className?: string
}

export default function SectionHeader({ children, className = '' }: SectionHeaderProps) {
  return (
    <h2 className={`text-sm font-semibold uppercase tracking-wide text-gray-400 ${className}`}>
      {children}
    </h2>
  )
}
