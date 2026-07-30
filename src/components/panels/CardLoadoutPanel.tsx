import SelectField from '@/components/form/SelectField'
import Button from '@/components/form/Button'
import type { CardId } from '@/kernel'
import { cn } from '@/lib/utils'

type Theme = 'danQing' | 'lingYun'

interface CardOption {
  value: CardId
  label: string
  group?: string
}

interface Props {
  title: string
  addLabel: string
  theme: Theme
  cards: { id: CardId | ''; level: number }[]
  currentValue: number
  maxValue?: number
  quickGroups: { label: string; ids: CardId[] }[]
  maxQuickLevel: number
  levelValues: { label: string; value: string }[]
  getCardList: (id: string) => CardOption[]
  handleAdd: () => void
  handleDelete: (index: number) => void
  handleCardChange: (index: number, value: CardId) => void
  handleLevelChange: (index: number, value: string) => void
  handleGroupSelect: (ids: CardId[]) => void
  handleAllLevelChange: (level: number) => void
}

const themes: Record<
  Theme,
  {
    panel: string
    title: string
    value: string
    heading: string
    add: string
  }
> = {
  danQing: {
    panel:
      'border-emerald-100 bg-linear-to-br from-emerald-50 to-teal-50',
    title: 'text-emerald-950',
    value: 'text-emerald-700',
    heading: 'text-emerald-800',
    add: 'border-emerald-300 text-emerald-700 hover:bg-emerald-100/70',
  },
  lingYun: {
    panel:
      'border-amber-100 bg-linear-to-br from-amber-50 to-orange-50',
    title: 'text-amber-950',
    value: 'text-amber-700',
    heading: 'text-amber-800',
    add: 'border-amber-300 text-amber-700 hover:bg-amber-100/70',
  },
}

export default function CardLoadoutPanel(props: Props) {
  const theme = themes[props.theme]
  const overflow =
    props.maxValue !== undefined && props.currentValue > props.maxValue

  return (
    <section
      className={`flex min-w-0 flex-col gap-3 rounded-xl border p-5 shadow-lg ${theme.panel}`}
    >
      <header className="mb-1 flex items-center justify-between gap-3">
        <h2 className={`text-xl font-bold ${theme.title}`}>{props.title}</h2>
        <span
          className={cn(
            'text-sm font-semibold tabular-nums',
            theme.value,
            overflow && 'text-red-600',
          )}
        >
          {props.currentValue}
          {props.maxValue !== undefined && `/${props.maxValue}`}
        </span>
      </header>

      <div className="grid gap-2 px-1">
        <div className="grid grid-cols-[4rem_minmax(0,1fr)] items-center gap-2">
          <span className={`text-xs font-medium ${theme.heading}`}>
            快速选择
          </span>
          <div className="flex flex-wrap gap-1.5">
            {props.quickGroups.map((group) => (
              <Button
                key={group.label}
                variant="primary"
                aria-label={`选择${group.label}整系`}
                className="size-7 rounded px-0 text-[10px] leading-none shadow-none"
                onClick={() => props.handleGroupSelect(group.ids)}
              >
                {group.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-[4rem_minmax(0,1fr)] items-center gap-2">
          <span aria-hidden="true" />
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: props.maxQuickLevel + 1 }, (_, level) => (
              <Button
                key={level}
                variant="primary"
                aria-label={`全部设为${level}级`}
                className="size-7 rounded px-0 text-[10px] leading-none tabular-nums shadow-none"
                onClick={() => props.handleAllLevelChange(level)}
              >
                {level}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div
        className={`grid grid-cols-[minmax(0,1fr)_5rem_2.25rem] gap-2 px-1 text-xs font-medium ${theme.heading}`}
      >
        <span>名称</span>
        <span>等级</span>
        <span className="sr-only">操作</span>
      </div>

      <div className="flex flex-col gap-2">
        {props.cards.map(({ id, level }, index) => (
          <div
            className="grid grid-cols-[minmax(0,1fr)_5rem_2.25rem] items-center gap-2"
            key={index}
          >
            <SelectField
              value={id}
              onChange={(value) =>
                props.handleCardChange(index, value as CardId)
              }
              list={props.getCardList(id)}
              placeholder="请选择"
            />
            <SelectField
              value={String(level)}
              onChange={(value) => props.handleLevelChange(index, value)}
              list={props.levelValues}
            />
            <Button
              variant="danger"
              aria-label={`删除${props.title}条目`}
              className="size-9 px-0"
              onClick={() => props.handleDelete(index)}
            >
              <svg
                aria-hidden="true"
                className="size-4"
                fill="none"
                viewBox="0 0 16 16"
              >
                <path
                  d="m4 4 8 8m0-8-8 8"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="1.7"
                />
              </svg>
            </Button>
          </div>
        ))}
      </div>

      <Button
        className={`mt-1 h-10 border-dashed bg-white/40 ${theme.add}`}
        onClick={props.handleAdd}
      >
        ＋ {props.addLabel}
      </Button>
    </section>
  )
}
