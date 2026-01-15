import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface Props {
  value: boolean
  onChange: (value: boolean) => void
  label: string
  tip?: string
}

const MyCheckbox = ({ value, onChange, label, tip = '' }: Props) => {
  return (
    <>
      <div className="flex items-start gap-3">
        <Checkbox id={label} checked={value} onCheckedChange={onChange} />
        <div className="grid gap-2">
          <Label htmlFor={label}>{label}</Label>
          {!!tip && <p className="text-muted-foreground text-sm">{tip}</p>}
        </div>
      </div>
    </>
  )
}

export default MyCheckbox
