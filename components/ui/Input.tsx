'use client'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: string
}

const INPUT_CLASS =
  'w-full rounded-lg border border-white/10 bg-gray-900 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500'
const LABEL_CLASS = 'block text-sm font-medium text-gray-300 mb-1.5'
const HINT_CLASS = 'mt-1 text-xs text-gray-500'

export function Input({ label, hint, id, className = '', ...props }: InputProps) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className={LABEL_CLASS}>
          {label}
        </label>
      )}
      <input id={id} className={`${INPUT_CLASS} ${className}`} {...props} />
      {hint && <p className={HINT_CLASS}>{hint}</p>}
    </div>
  )
}

export function Textarea({ label, hint, id, className = '', ...props }: TextareaProps) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className={LABEL_CLASS}>
          {label}
        </label>
      )}
      <textarea id={id} className={`${INPUT_CLASS} resize-none ${className}`} {...props} />
      {hint && <p className={HINT_CLASS}>{hint}</p>}
    </div>
  )
}
