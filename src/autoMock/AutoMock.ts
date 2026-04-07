import { cardCatalog } from '@/domain/cards/cardCatalog'
import type { CardId } from '@/domain/cards/cardIds'
import {
  deriveSimulationCoreOptions,
  runSimulation,
  type SimulationCore,
  type SimulationMockOptions,
} from '@/engine/Simulation'
import { AUTO_MOCK_MAX_COMBINATIONS, AUTO_MOCK_TOP_RESULT_COUNT } from '@/domain/config/simulatorDefaults'

export class AutoMock {
  private _MAX = AUTO_MOCK_MAX_COMBINATIONS
  private _options: SimulationMockOptions
  private _data: { id: CardId; cost: number }[] = []
  private _totalCost = 0
  private _comboCount = 0
  private _result: SimulationCore[] = []
  private _executed = false

  constructor(totalCost: number, options: SimulationMockOptions, excludes: CardId[] = []) {
    this._options = options
    this._totalCost = totalCost
    this._data = getData([...options.cards.map((card) => card.id), ...excludes])
    this._comboCount = countCardsComboByCost(totalCost, this._data)
  }

  public exec() {
    if (this._executed) {
      return this.getResult()
    }

    if (this._comboCount > this._MAX) {
      console.log('超出上限')
      this._result = [mockByCardsCombo([], this._options)]
      this._executed = true
      return this.getResult()
    }

    const result: SimulationCore[] = []
    let hasCombo = false
    iterateCardsComboByCost(this._totalCost, this._data, (cardsCombo) => {
      hasCombo = true
      pushTopResult(result, mockByCardsCombo(cardsCombo, this._options), AUTO_MOCK_TOP_RESULT_COUNT)
    })

    if (!hasCombo) {
      result.push(mockByCardsCombo([], this._options))
    }

    this._executed = true
    this._result = result
    return this.getResult()
  }

  public getResult() {
    return this._result
  }

  public getLength() {
    return this._comboCount
  }

  public isOverMax() {
    return this._comboCount > this._MAX
  }
}

const getOptionByCardsCombo = (cardsCombo: CardId[], options: SimulationMockOptions): SimulationMockOptions => {
  const cards = cardsCombo.map((cardId) => ({ id: cardId, level: 6 }))
  const newCards = [...options.cards, ...cards]
  return { ...options, cards: newCards }
}

const mockByCardsCombo = (cardsCombo: CardId[], options: SimulationMockOptions) => {
  const coreOptions = deriveSimulationCoreOptions(getOptionByCardsCombo(cardsCombo, options))
  return runSimulation(coreOptions).core
}

const getData = (excludes: CardId[]) => {
  return Object.values(cardCatalog)
    .filter((card) => !excludes.includes(card.id))
    .map((card) => ({ id: card.id, cost: card.cost }))
}

function countCardsComboByCost<T>(totalCost: number, data: { id: T; cost: number }[]) {
  let count = 0
  iterateComboByCost(data, totalCost, () => {
    count++
  })
  return count
}

function iterateCardsComboByCost<T>(totalCost: number, data: { id: T; cost: number }[], onCombo: (combo: T[]) => void) {
  iterateComboByCost(data, totalCost, onCombo)
}

function iterateComboByCost<T>(data: { id: T; cost: number }[], totalCost: number, onCombo: (combo: T[]) => void) {
  if (totalCost <= 0) return

  const sortedData = [...data].sort((a, b) => a.cost - b.cost)
  const n = sortedData.length

  function backtrack(start: number, currentSum: number, currentIds: T[]) {
    if (currentSum === totalCost) {
      onCombo([...currentIds])
      return
    }

    for (let i = start; i < n; i++) {
      const item = sortedData[i]
      const nextSum = currentSum + item.cost
      if (nextSum > totalCost) {
        break
      }

      currentIds.push(item.id)
      backtrack(i + 1, nextSum, currentIds)
      currentIds.pop()
    }
  }

  backtrack(0, 0, [])
}

function pushTopResult(result: SimulationCore[], candidate: SimulationCore, limit: number) {
  const candidateDps = candidate.dps.getDPS()
  if (result.length >= limit && candidateDps <= result[result.length - 1].dps.getDPS()) {
    return
  }

  let index = 0
  while (index < result.length && result[index].dps.getDPS() >= candidateDps) {
    index++
  }

  result.splice(index, 0, candidate)
  if (result.length > limit) {
    result.pop()
  }
}
