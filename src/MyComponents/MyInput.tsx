import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useEffect, useRef } from 'react'

interface Props {
  value: string
  onChange: (value: string) => void
  label?: string
  tip?: string
  placeholder?: string
  type?: React.HTMLInputTypeAttribute
  width?: number
  maxWidth?: number
  minWidth?: number
}

const MyInput = ({ value, onChange, label, tip, placeholder, type, width, maxWidth, minWidth }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const inputEl = inputRef.current
    if (!inputEl) return

    const handleWheel: EventListener = (e) => {
      e.preventDefault()
    }

    inputEl.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      if (inputEl) {
        inputEl.removeEventListener('wheel', handleWheel)
      }
    }
  }, [])

  return (
    <div className="grid w-full max-w-sm items-center gap-2">
      {!!label && (
        <div className="grid gap-2">
          <Label>{label}</Label>
          {!!tip && <p className="text-muted-foreground text-sm">{tip}</p>}
        </div>
      )}
      <Input
        ref={inputRef}
        className={cn(
          'w-full',
          width && `w-[${width}px]`,
          maxWidth && `max-w-[${maxWidth}px]`,
          minWidth && `min-w-[${minWidth}px]`
        )}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

export default MyInput
