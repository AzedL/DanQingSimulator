import { cardCatalog } from '@/domain/cards/cardCatalog'
import type { CardId } from '@/domain/cards/cardIds'
import {
  deriveSimulationCoreOptions,
  runSimulation,
  type SimulationCore,
  type SimulationMockOptions,
} from '@/engine/Simulation'
import { AUTO_MOCK_MAX_COMBINATIONS, AUTO_MOCK_TOP_RESULT_COUNT } from '@/domain/config/simulatorDefaults'

export interface LightMockResult {
  cardsCombo: CardId[]
  dps: number
}

export class AutoMock {
  private _MAX = AUTO_MOCK_MAX_COMBINATIONS
  private _options: SimulationMockOptions
  private _data: { id: CardId; cost: number }[] = []
  private _totalCost = 0
  private _comboCount = 0
  private _top: LightMockResult[] = []
  private _topReady = false
  private _result: SimulationCore[] = []
  private _executed = false

  constructor(totalCost: number, options: SimulationMockOptions, excludes: CardId[] = []) {
    this._options = options
    this._totalCost = totalCost
    this._data = getData([...options.cards.map((card) => card.id), ...excludes])
    this._comboCount = Math.max(countCardsComboByCost(totalCost, this._data), 1)
  }

  public exec() {
    if (this._executed) {
      return this.getResult()
    }

    const top = this.getTop()
    this._result = top.map((lightMockResult) => mockByCardsCombo(lightMockResult.cardsCombo, this._options))
    this._executed = true
    return this.getResult()
  }

  public getTop() {
    if (this._topReady) {
      return this._top
    }

    if (this._comboCount > this._MAX) {
      console.log('超出上限')
      this._top = [createEmptyLightMockResult()]
      this._topReady = true
      return this._top
    }

    const result: LightMockResult[] = []
    iterateCardsComboByCost(this._totalCost, this._data, (cardsCombo) => {
      pushTopResult(result, lightMockByCardsCombo(cardsCombo, this._options), AUTO_MOCK_TOP_RESULT_COUNT)
    })

    if (!result.length) {
      result.push(createEmptyLightMockResult())
    }

    this._top = result
    this._topReady = true
    return this._top
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

export const mockByCardsCombo = (cardsCombo: CardId[], options: SimulationMockOptions): SimulationCore => {
  return runMockByCardsCombo(cardsCombo, options)
}

const lightMockByCardsCombo = (cardsCombo: CardId[], options: SimulationMockOptions): LightMockResult => {
  const core = runMockByCardsCombo(cardsCombo, options, true)
  return {
    cardsCombo,
    dps: core.dps.getDPS(),
  }
}

const createEmptyLightMockResult = (): LightMockResult => {
  return {
    cardsCombo: [],
    dps: 0,
  }
}

const getOptionByCardsCombo = (cardsCombo: CardId[], options: SimulationMockOptions): SimulationMockOptions => {
  const cards = cardsCombo.map((cardId) => ({ id: cardId, level: 6 }))
  const newCards = [...options.cards, ...cards]
  return { ...options, cards: newCards }
}

const runMockByCardsCombo = (
  cardsCombo: CardId[],
  options: SimulationMockOptions,
  useLightMode = false,
): SimulationCore => {
  const coreOptions = deriveSimulationCoreOptions(getOptionByCardsCombo(cardsCombo, options))
  return runSimulation({ ...coreOptions, useLightMode }).core
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

function pushTopResult(result: LightMockResult[], candidate: LightMockResult, limit: number) {
  if (result.length >= limit && candidate.dps <= result[result.length - 1].dps) {
    return
  }

  let index = 0
  while (index < result.length && result[index].dps >= candidate.dps) {
    index++
  }

  result.splice(index, 0, candidate)
  if (result.length > limit) {
    result.pop()
  }
}
