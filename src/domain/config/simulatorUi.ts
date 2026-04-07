import lang from '@/lang/lang'
import { orderedCardCatalog } from '@/domain/cards/cardCatalog'
import type { CardId } from '@/domain/cards/cardIds'

export type SimulatorTab = 'mock' | 'autoMock'
export type ChartMetric = 'damage' | 'dps' | 'count' | 'fireCount'

export const cardsList: { value: CardId; label: string }[] = orderedCardCatalog.map((card) => {
  return {
    value: card.id,
    label: card.name,
  }
})

export const treasureLevelValues = Array.from({ length: 11 }).map((_, i) => {
  return { label: String(i), value: String(i) }
})

export const cardLevelValues = Array.from({ length: 7 }).map((_, i) => {
  return { label: String(i), value: String(i) }
})

export const tabValues: { value: SimulatorTab; label: string }[] = [
  { label: lang.mock, value: 'mock' },
  { label: lang.autoMock, value: 'autoMock' },
]

export const chartOptionValues: { value: ChartMetric; label: string }[] = [
  { label: lang.dps, value: 'dps' },
  { label: lang.damage, value: 'damage' },
  { label: lang.count, value: 'count' },
  { label: lang.fireCount, value: 'fireCount' },
]