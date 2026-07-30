import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'neutral' | 'danger'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: ButtonVariant
}

export default function Button({
  children,
  className,
  type = 'button',
  variant = 'neutral',
  ...props
}: Props) {
  return (
    <button
      type={type}
      className={cn('control-button', `control-button-${variant}`, className)}
      {...props}
    >
      {children}
    </button>
  )
}
