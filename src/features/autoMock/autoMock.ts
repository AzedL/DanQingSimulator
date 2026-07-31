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
  combinationIndex: number
}

export interface AutoMockResult {
  length: number
  overflow: boolean
  items: AutoMockItem[]
}

export function countAutoMockCards(
  baseCards: CardOptions[],
  targetCardIds: CardId[],
  additionalValue: number,
) {
  if (additionalValue < 0) return 0
  return countDistributions(
    getCapacities(baseCards, targetCardIds),
    additionalValue,
  )
}

export function buildAutoMockCards(
  baseCards: CardOptions[],
  targetCardIds: CardId[],
  additionalValue: number,
) {
  if (additionalValue < 0) return []

  const capacities = getCapacities(baseCards, targetCardIds)
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
  return runAutoMockPartition(input, 0, 1)
}

export function runAutoMockPartition(
  input: AutoMockInput,
  workerIndex: number,
  workerCount: number,
): AutoMockResult {
  if (
    !Number.isInteger(workerIndex) ||
    !Number.isInteger(workerCount) ||
    workerCount < 1 ||
    workerIndex < 0 ||
    workerIndex >= workerCount
  ) {
    throw new RangeError('Invalid auto mock worker partition')
  }

  const generatedLength = countAutoMockCards(
    input.coreOptions.cards,
    input.targetCardIds,
    input.additionalValue,
  )
  const length = generatedLength || 1

  if (length > input.maxCombinations) {
    return { length, overflow: true, items: [] }
  }

  const items: AutoMockItem[] = []
  const resultIds = new Set(input.resultCardIds)

  const simulate = (cards: CardOptions[], combinationIndex: number) => {
    const options: CoreOptions = {
      ...input.coreOptions,
      cards,
      useRandom: false,
      useLightMode: true,
    }
    const core = new Core(options)
    core.exec()
    const output = core.damage.output()
    const item = {
      cards: cards.filter((card) => resultIds.has(card.id)),
      dps: fixed(calculateDps(output, options)),
      combinationIndex,
    }

    insertTop(items, item, input.topCount)
  }

  if (generatedLength === 0) {
    if (workerIndex === 0) {
      simulate(input.coreOptions.cards, 0)
    }
    return { length, overflow: false, items }
  }

  const capacities = getCapacities(
    input.coreOptions.cards,
    input.targetCardIds,
  )
  let combinationIndex = 0
  iterateDistributions(
    capacities,
    input.additionalValue,
    (increments) => {
      const currentIndex = combinationIndex
      combinationIndex += 1
      if (currentIndex % workerCount !== workerIndex) return

      simulate(
        applyIncrements(
          input.coreOptions.cards,
          input.targetCardIds,
          increments,
        ),
        currentIndex,
      )
    },
  )

  return { length, overflow: false, items }
}

export function mergeAutoMockResults(
  results: AutoMockResult[],
  topCount: number,
): AutoMockResult {
  if (results.length === 0) {
    return { length: 0, overflow: false, items: [] }
  }

  const length = results[0].length
  const overflow = results.some((result) => result.overflow)
  if (overflow) return { length, overflow: true, items: [] }

  const items: AutoMockItem[] = []
  results.forEach((result) => {
    result.items.forEach((item) => {
      insertTop(items, item, topCount)
    })
  })
  return { length, overflow: false, items }
}

function getCapacities(
  baseCards: CardOptions[],
  targetCardIds: CardId[],
) {
  const currentLevels = new Map(
    baseCards.map((card) => [card.id, card.level]),
  )
  return targetCardIds.map((id) =>
    Math.max(
      0,
      MAX_CARD_LEVEL - (currentLevels.get(id) ?? 0),
    ),
  )
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

function countDistributions(
  capacities: number[],
  total: number,
) {
  const counts = Array<number>(total + 1).fill(0)
  counts[0] = 1

  capacities.forEach((capacity) => {
    const next = Array<number>(total + 1).fill(0)
    counts.forEach((count, currentTotal) => {
      if (count === 0) return
      const maxValue = Math.min(
        capacity,
        total - currentTotal,
      )
      for (let value = 0; value <= maxValue; value += 1) {
        next[currentTotal + value] += count
      }
    })
    counts.splice(0, counts.length, ...next)
  })

  return counts[total]
}

function insertTop(
  items: AutoMockItem[],
  item: AutoMockItem,
  limit: number,
) {
  if (limit <= 0) return
  const index = items.findIndex(
    (current) =>
      item.dps > current.dps ||
      (item.dps === current.dps &&
        item.combinationIndex < current.combinationIndex),
  )
  items.splice(index === -1 ? items.length : index, 0, item)
  if (items.length > limit) items.pop()
}
