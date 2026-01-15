import { mock, normalizeOption } from '../mock'
import type { Core } from '../mock/core/Core'
import { dataBase, type TCardIds } from '../mock/dataBase/dataBase'
import type { MockOptions } from '../mock/utils/normalizeMockOptions'

export class AutoMock {
  private _MAX = 9999
  private _options: MockOptions | null = null
  private _list: TCardIds[][] = []
  private _result: Core[] = []
  private _executed = false
  constructor() {}

  public getCardsCombo(totalCost: number, options: MockOptions, excludes: TCardIds[] = []) {
    this.reset()

    const exist = options.cards.map((card) => card.id)
    const list = getCardsComboByCost(totalCost, [...exist, ...excludes])
    this._options = options
    this._list = list

    return list.length
  }

  public exec() {
    if (this._executed) {
      return this.getResult()
    }

    const options = this._options
    if (!options) {
      return []
    }

    let list = this._list
    if (!list.length) {
      list = [[]]
    }

    if (list.length > this._MAX) {
      console.log('超出上限')
      list = [[]]
    }

    const result = list
      .map((cardsCombo) => {
        return mockByCardsCombo(cardsCombo, options)
      })
      .sort((a, b) => b.dps.getDPS() - a.dps.getDPS())

    this._executed = true
    this._result = result
    return this.getResult()
  }

  public getResult() {
    return this._result.slice(0, 10)
  }

  public getListLength() {
    return this._list.length
  }
  public isOverMax() {
    return this._list.length > this._MAX
  }

  public reset() {
    this._options = null
    this._list = []
    this._result = []
    this._executed = false
  }
}

const getOptionByCardsCombo = (cardsCombo: TCardIds[], options: MockOptions): MockOptions => {
  const cards = cardsCombo.map((cardId) => ({ id: cardId, level: 6 }))
  const newCards = [...options.cards, ...cards]
  return { ...options, cards: newCards }
}
const mockByCardsCombo = (cardsCombo: TCardIds[], options: MockOptions) => {
  const mockOptions = normalizeOption(getOptionByCardsCombo(cardsCombo, options))
  return mock(mockOptions)
}

const getCardsComboByCost = (totalCost: number, excludes: TCardIds[]) => {
  if (totalCost <= 0) return []

  const data = getData(excludes)
  return getComboByCost(data, totalCost)
}
const getData = (excludes: TCardIds[]) => {
  const data: { id: TCardIds; cost: number }[] = []
  for (let id in dataBase) {
    if (excludes.includes(id as TCardIds)) continue

    const card = dataBase[id as TCardIds]
    data.push({ id: card.id, cost: card.cost })
  }
  return data
}
function getComboByCost<T>(data: { id: T; cost: number }[], totalCost: number) {
  const result: T[][] = []
  const n = data.length

  function backtrack(start: number, currentSum: number, currentIds: T[]) {
    if (currentSum === totalCost) {
      result.push([...currentIds])
      return
    }

    if (currentSum > totalCost || start >= n) {
      return
    }

    for (let i = start; i < n; i++) {
      const item = data[i]
      if (currentIds.includes(item.id)) {
        continue
      }

      if (currentSum + item.cost <= totalCost) {
        currentIds.push(item.id)

        backtrack(i + 1, currentSum + item.cost, currentIds)

        currentIds.pop()
      }
    }
  }

  data.sort((a, b) => a.cost - b.cost)

  backtrack(0, 0, [])

  return result
}
