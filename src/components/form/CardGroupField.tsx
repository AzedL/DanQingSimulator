import Button from '@/components/form/Button'
import {
  cardGroups,
  type CardGroup,
} from '@/features/config/simulatorUi'
import { cn } from '@/lib/utils'

interface Props {
  label: string
  value: CardGroup
  onChange: (value: CardGroup) => void
}

export default function CardGroupField({ label, value, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <span className="shrink-0 text-sm font-medium leading-none">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {cardGroups.map((group) => (
          <Button
            key={group}
            variant="primary"
            aria-pressed={value === group}
            className={cn(
              'h-8 px-3 text-xs shadow-none',
              value === group &&
                'ring-2 ring-[#1cc5b3] ring-offset-2 ring-offset-pink-50',
            )}
            onClick={() => onChange(group)}
          >
            {group}
          </Button>
        ))}
      </div>
    </div>
  )
}
