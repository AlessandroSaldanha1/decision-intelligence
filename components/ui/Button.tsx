import Link from 'next/link'

type ButtonVariant = 'primary' | 'ghost'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

interface LinkButtonProps {
  href: string
  variant?: ButtonVariant
  children: React.ReactNode
  className?: string
  fullWidth?: boolean
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-violet-600 text-white hover:bg-violet-500',
  ghost: 'border border-white/10 text-gray-400 hover:text-white hover:bg-white/5',
}

const BASE =
  'rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors text-center disabled:opacity-50 disabled:cursor-not-allowed'

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  return (
    <button className={`${BASE} ${VARIANT_CLASSES[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

export function LinkButton({
  href,
  variant = 'primary',
  children,
  className = '',
  fullWidth,
}: LinkButtonProps) {
  return (
    <Link
      href={href}
      className={`${BASE} ${VARIANT_CLASSES[variant]} ${fullWidth ? 'block w-full' : 'inline-block'} ${className}`}
    >
      {children}
    </Link>
  )
}
