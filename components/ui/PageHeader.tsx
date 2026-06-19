interface PageHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  action?: React.ReactNode
}

export default function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        {eyebrow && (
          <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">{eyebrow}</div>
        )}
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {description && <p className="text-gray-400">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
