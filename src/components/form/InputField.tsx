import { useEffect, useId, useRef } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  value: string
  onChange: (value: string) => void
  label?: string
  tip?: string
  suffix?: string
  placeholder?: string
  type?: React.HTMLInputTypeAttribute
  width?: number
  maxWidth?: number
  minWidth?: number
}

export default function InputField({
  value,
  onChange,
  label,
  tip,
  suffix,
  placeholder,
  type,
  width,
  maxWidth,
  minWidth,
}: Props) {
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const inputEl = inputRef.current
    if (!inputEl) return

    const handleWheel: EventListener = (event) => {
      event.preventDefault()
    }

    inputEl.addEventListener('wheel', handleWheel, { passive: false })
    return () => inputEl.removeEventListener('wheel', handleWheel)
  }, [])

  return (
    <div className="grid w-full items-center gap-2">
      {!!label && (
        <div className="grid gap-2">
          <label htmlFor={id} className="text-sm font-medium leading-none">
            {label}
          </label>
          {!!tip && <p className="text-sm opacity-65">{tip}</p>}
        </div>
      )}
      <div className="relative">
        <input
          id={id}
          ref={inputRef}
          className={cn(
            'form-control px-3 text-base placeholder:text-slate-400 md:text-sm',
            !!suffix && 'pr-10',
          )}
          style={{ width, maxWidth, minWidth }}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        {!!suffix && (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm opacity-65">
            {suffix}
          </span>
        )}
      </div>
    </div>
  )
}
