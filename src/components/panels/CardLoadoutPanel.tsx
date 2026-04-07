import SelectField from '@/components/form/SelectField'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { CardId } from '@/domain/cards/cardIds'
import lang from '@/lang/lang'

interface Props {
  cards: { id: CardId | ''; level: number }[]
  cardLevelValues: { label: string; value: string }[]
  getCardList: (id: string) => { value: CardId; label: string }[]
  handleAdd: () => void
  handleDelete: (index: number) => void
  handleCardChange: (index: number, value: CardId) => void
  handleLevelChange: (index: number, value: string) => void
}

export default function CardLoadoutPanel(props: Props) {
  return (
    <div className="flex-2 flex max-h-full min-h-full min-w-80 flex-col gap-3 overflow-hidden rounded-xl border border-emerald-100 bg-linear-to-br from-emerald-50 to-teal-50 p-6 shadow-lg">
      <h2 className="mb-2 text-xl font-bold text-emerald-900">{lang.cardsConfig}</h2>
      <div className="flex w-full items-center justify-center gap-3 rounded-lg bg-emerald-100/50 p-3">
        <div className="flex-1">
          <Label className="font-medium text-emerald-800">{lang.card}</Label>
        </div>
        <div className="flex-1">
          <Label className="font-medium text-emerald-800">{lang.level}</Label>
        </div>
        <Button
          className="rounded-lg bg-linear-to-r from-emerald-500 to-teal-500 px-3 py-2 font-medium text-white shadow-md transition-all duration-200 hover:from-emerald-600 hover:to-teal-600 hover:shadow-lg"
          onClick={props.handleAdd}
        >
          {lang.add}
        </Button>
      </div>
      {props.cards.map(({ id, level }, index) => {
        return (
          <div className="flex w-full items-center justify-center gap-3 py-2 pr-3" key={index}>
            <SelectField
              value={id}
              onChange={(value) => props.handleCardChange(index, value as CardId)}
              list={props.getCardList(id)}
            />
            <SelectField
              value={String(level)}
              onChange={(value) => props.handleLevelChange(index, value)}
              list={props.cardLevelValues}
            />
            <Button
              variant="destructive"
              className="rounded-lg bg-linear-to-r from-red-500 to-rose-500 px-3 py-2 font-medium text-white shadow-sm transition-all duration-200 hover:from-red-600 hover:to-rose-600 hover:shadow-md"
              onClick={() => props.handleDelete(index)}
            >
              {lang.delete}
            </Button>
          </div>
        )
      })}
    </div>
  )
}