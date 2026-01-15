import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface Props<T> {
  value: T
  onChange: (value: T) => void
  label?: string
  tip?: string
  placeholder?: string
  list: { value: T; label: string }[]
  width?: number
  maxWidth?: number
  minWidth?: number
}

// const w = 'w-[180px] w-[120px] max-w-[180px] min-w-[120px]'

const MySelect = <T extends string>({
  value,
  onChange,
  label,
  tip,
  placeholder,
  list,
  width,
  maxWidth,
  minWidth,
}: Props<T>) => {
  return (
    <>
      <div className="grid w-full max-w-sm items-center gap-2">
        {!!label && (
          <div className="grid gap-2">
            <Label>{label}</Label>
            {!!tip && <p className="text-muted-foreground text-sm">{tip}</p>}
          </div>
        )}
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger
            className={cn(
              'w-full',
              width && `w-[${width}px]`,
              maxWidth && `max-w-[${maxWidth}px]`,
              minWidth && `min-w-[${minWidth}px]`
            )}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {list.map(({ value, label }) => {
                return (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                )
              })}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </>
  )
}

export default MySelect
