import type { CardOptions, CoreOptions } from '../core/Core'
import { dataBase } from '../dataBase/dataBase'
import { fixed } from './math'

interface Buffs {
  taXue?: boolean
  anJi?: boolean
}
export interface MockOptions {
  cards: CardOptions[]
  coreAttribute: number
  basicDamage: number
  treasureLevel?: number
  buffs?: Buffs
  duration: number
  useRandom?: boolean
}

const TAXUE_VALUE = 1.031
const ANJI_VALUE = 1.0523

export function normalizeMockOptions(mockOptions: MockOptions): CoreOptions {
  const { coreAttribute, basicDamage, treasureLevel = 10, buffs = {}, duration, useRandom = false } = mockOptions
  const cards = normalizeCards(mockOptions.cards)
  const newCoreAttribute = fixed(getCoreAttribute(cards, coreAttribute, treasureLevel))

  const { taXue = false, anJi = false } = buffs
  const buffValue = anJi ? ANJI_VALUE : taXue ? TAXUE_VALUE : 1

  const newBasicDamage = fixed(basicDamage * (newCoreAttribute / coreAttribute))

  return {
    cards,
    cost: getCost(cards),
    coreAttribute: newCoreAttribute,
    _coreAttribute: coreAttribute,
    attackPower: fixed(getAttackPower(newCoreAttribute, buffValue)),
    basicDamage: newBasicDamage,
    _basicDamage: basicDamage,
    duration,
    useRandom,
  }
}

const normalizeCards = (cards: CardOptions[]) => {
  const map: Record<string, boolean> = {}
  cards.filter(({ id }) => {
    if (!dataBase[id]) return false

    if (map[id]) return false

    map[id] = true
    return true
  })
  return cards
}

const getCost = (cards: CardOptions[]) => {
  return cards.reduce((res, cur) => {
    return res + (dataBase[cur.id]?.cost || 0)
  }, 0)
}

const A = 224.4
const B = 11.1
const TREASURE_LEVEL_VALUE = 0.004
const getCoreAttribute = (cards: CardOptions[], coreAttribute: number, treasureLevel: number) => {
  const result = cards.reduce((res, cur) => {
    return res + getCardCoreAttribute(cur, treasureLevel)
  }, coreAttribute)

  const muJian = cards.find(({ id }) => id === 'muJian')
  if (!muJian) return result

  const { level } = muJian
  const [a, b] = dataBase[muJian.id].values
  const value = a + b * level
  return result + (result * value) / 100 / (1 + TREASURE_LEVEL_VALUE * treasureLevel)
}
const getCardCoreAttribute = (card: CardOptions, treasureLevel: number) => {
  const { id, level } = card
  const cost = dataBase[id]?.cost || 0
  return (A + B * level) * cost * (1 + TREASURE_LEVEL_VALUE * treasureLevel)
}

const getAttackPower = (newCoreAttribute: number, buff: number) => {
  return (newCoreAttribute / 5) * buff
}
