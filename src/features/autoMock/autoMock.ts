import {
  Core,
  type CardId,
  type CardOptions,
  type CoreOptions,
} from '../../kernel'
import { fixed } from '../../kernel/utils/math'
import { calculateDps } from '../simulator/result'

const MAX_CARD_LEVEL = 5

export interface AutoMockInput {
  coreOptions: CoreOptions
  targetCardIds: CardId[]
  resultCardIds: CardId[]
  additionalValue: number
  maxCombinations: number
  topCount: number
}

export interface AutoMockItem {
  cards: CardOptions[]
  dps: number
}

export interface AutoMockResult {
  length: number
  overflow: boolean
  items: AutoMockItem[]
}

export function buildAutoMockCards(
  baseCards: CardOptions[],
  targetCardIds: CardId[],
  additionalValue: number,
) {
  if (additionalValue < 0) return []

  const currentLevels = new Map(
    baseCards.map((card) => [card.id, card.level]),
  )
  const capacities = targetCardIds.map(
    (id) => Math.max(0, MAX_CARD_LEVEL - (currentLevels.get(id) ?? 0)),
  )
  const combinations: CardOptions[][] = []

  iterateDistributions(
    capacities,
    additionalValue,
    (increments) => {
      combinations.push(
        applyIncrements(
          baseCards,
          targetCardIds,
          increments,
        ),
      )
    },
  )

  return combinations
}

export function runAutoMock(input: AutoMockInput): AutoMockResult {
  const generatedCombinations = buildAutoMockCards(
    input.coreOptions.cards,
    input.targetCardIds,
    input.additionalValue,
  )
  const combinations = generatedCombinations.length
    ? generatedCombinations
    : [input.coreOptions.cards]
  const length = combinations.length

  if (length > input.maxCombinations) {
    return { length, overflow: true, items: [] }
  }

  const items: AutoMockItem[] = []
  combinations.forEach((cards) => {
    const options: CoreOptions = {
      ...input.coreOptions,
      cards,
      useRandom: false,
      useLightMode: true,
    }
    const core = new Core(options)
    core.exec()
    const output = core.damage.output()
    const resultIds = new Set(input.resultCardIds)
    const item = {
      cards: cards.filter((card) => resultIds.has(card.id)),
      dps: fixed(calculateDps(output, options)),
    }

    insertTop(items, item, input.topCount)
  })

  return { length, overflow: false, items }
}

function applyIncrements(
  baseCards: CardOptions[],
  targetCardIds: CardId[],
  increments: number[],
) {
  const targetLevels = new Map<CardId, number>()
  targetCardIds.forEach((id, index) => {
    const currentLevel =
      baseCards.find((card) => card.id === id)?.level ?? 0
    targetLevels.set(id, currentLevel + increments[index])
  })

  const result = baseCards.map((card) => {
    const level = targetLevels.get(card.id)
    return level === undefined ? { ...card } : { ...card, level }
  })
  const existingIds = new Set(result.map((card) => card.id))

  targetCardIds.forEach((id) => {
    const level = targetLevels.get(id) ?? 0
    if (level > 0 && !existingIds.has(id)) {
      result.push({ id, level })
    }
  })

  return result
}

function iterateDistributions(
  capacities: number[],
  total: number,
  onDistribution: (distribution: number[]) => void,
) {
  const distribution = Array(capacities.length).fill(0)

  function visit(index: number, remain: number) {
    if (index === capacities.length) {
      if (remain === 0) onDistribution([...distribution])
      return
    }

    const maxValue = Math.min(capacities[index], remain)
    for (let value = 0; value <= maxValue; value++) {
      distribution[index] = value
      visit(index + 1, remain - value)
    }
  }

  visit(0, total)
}

function insertTop(
  items: AutoMockItem[],
  item: AutoMockItem,
  limit: number,
) {
  if (limit <= 0) return
  const index = items.findIndex((current) => item.dps > current.dps)
  items.splice(index === -1 ? items.length : index, 0, item)
  if (items.length > limit) items.pop()
}
