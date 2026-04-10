import type { CardOptions, CoreOptions } from '@/kernel/core/Core'
import { cardCatalog } from '@/domain/cards/cardCatalog'
import type { CardId } from '@/domain/cards/cardIds'
import {
  DEFAULT_ATTRIBUTE_YIELD,
  DEFAULT_CORE_ATTRIBUTE_EXTRA_GAIN,
  SIMULATION_CONFIG_DEFAULTS,
} from '@/domain/config/simulatorDefaults'
import { cardParams, getChanceValue, getScaledValue } from '@/domain/cards/cardParams'
import { fixed } from '@/kernel/utils/math'

interface Buffs {
  taXue?: boolean
  anJi?: boolean
}

interface AttributeValues {
  huiXin?: number
  zhuanJing?: number
  tiaoXi?: number
}

export interface MockOptions {
  cards: CardOptions[]
  coreAttribute: number
  basicDamage: number
  coreAttributeExtraGain?: number
  attributeValues?: AttributeValues
  buffs?: Buffs
  duration: number
  useRandom?: boolean
}

export interface Options {
  attackPowerBoostValue: number
  attributeBoostValue: number
  globalBoostValue: number
  huoFuValue: number
  gongJianValue: number
  zhengDaLiValue: number
  liuHeJingValue: number
  liuHeJingChance: number
  zuoGuiValue: number
  iceDamage: number
  pulseDamage: number
  fireDamage: number
  erWeiDamage: number
  shenMuTouDamage: number
  linFengValueIce: number
  linFengValueFire: number
  shangGuanCeValue: number
  suiShouValue: number
  qiHaoDamage: number
  liuWeiDamage: number
}

const TAXUE_VALUE = 1.031
const ANJI_VALUE = 1.0523
const CORE_ATTR_A = 224.4
const CORE_ATTR_B = 11.1
const ATTRIBUTE_CARD_VALUES: Record<'haiGui' | 'xiaoHuan' | 'fengZheng', keyof AttributeValues> = {
  haiGui: 'zhuanJing',
  xiaoHuan: 'huiXin',
  fengZheng: 'tiaoXi',
}

export function deriveCoreOptions(mockOptions: MockOptions): CoreOptions {
  const {
    coreAttribute,
    basicDamage,
    coreAttributeExtraGain = DEFAULT_CORE_ATTRIBUTE_EXTRA_GAIN,
    attributeValues,
    buffs = {},
    duration,
    useRandom = SIMULATION_CONFIG_DEFAULTS.useRandom,
  } = mockOptions
  const cards = normalizeCards(mockOptions.cards)
  const newCoreAttribute = fixed(getCoreAttribute(cards, coreAttribute, coreAttributeExtraGain))

  const { taXue = false, anJi = false } = buffs
  const buffValue = anJi ? ANJI_VALUE : taXue ? TAXUE_VALUE : 1
  const attackPowerBoostValue = fixed(getAttackPowerBoostValue(cards), 4)
  const attackPower = fixed(getAttackPower(newCoreAttribute, buffValue) * attackPowerBoostValue)

  const newBasicDamage = fixed(basicDamage * (newCoreAttribute / coreAttribute))

  return {
    cards,
    cost: getCost(cards),
    coreAttribute: newCoreAttribute,
    _coreAttribute: coreAttribute,
    attackPower,
    _attackPowerBoostValue: attackPowerBoostValue,
    basicDamage: newBasicDamage,
    _basicDamage: basicDamage,
    attributeValues,
    duration,
    useRandom,
  }
}

export function getOptions(coreOptions: CoreOptions): Options {
  const attackPowerBoostValue = coreOptions._attackPowerBoostValue
  const attributeBoostValue = fixed(getAttributeBoostValue(coreOptions), 4)
  const globalBoostValue = fixed(getGlobalBoostValue(coreOptions), 4)

  const huoFuValue = fixed(getPassiveValue(coreOptions, 'huoFu'))
  const gongJianValue = fixed(getPassiveValue(coreOptions, 'gongJian'))
  const zhengDaLiValue = fixed(getPassiveValue(coreOptions, 'zhengDaLi'))
  const liuHeJingValue = fixed(getPassiveValue(coreOptions, 'liuHeJing'))
  const liuHeJingChance = fixed(getChanceValue('liuHeJing'))
  const zuoGuiValue = fixed(getPassiveValue(coreOptions, 'zuoGui'))
  const iceDamage = fixed(getLegacyBaseDamageRatio(coreOptions, 'yanHong') * (1 + zuoGuiValue))
  const pulseDamage = fixed(getLegacyBaseDamageRatio(coreOptions, 'zheShan') * (1 + zuoGuiValue) * (1 + gongJianValue))
  const fireDamage = fixed(getLegacyBaseDamageRatio(coreOptions, 'xingHongJuYi') * (1 + zuoGuiValue))
  const erWeiDamage = fixed(getDamageRatio(coreOptions, 'erWeiYaoHu'))
  const shenMuTouDamage = fixed(getDamageRatio(coreOptions, 'shenMuTou'))
  const linFengValue = fixed(getPassiveValue(coreOptions, 'linFeng'))
  const shangGuanCeValue = fixed(getPassiveValue(coreOptions, 'shangGuanCe'))
  const suiShouValue = fixed(getPassiveValue(coreOptions, 'suiShou'))
  const qiHaoDamage = fixed(getDamageRatio(coreOptions, 'qiHao') * (1 + zuoGuiValue))
  const liuWeiDamage = fixed(getDamageRatio(coreOptions, 'liuWeiMoHu'))

  return {
    attackPowerBoostValue,
    attributeBoostValue,
    globalBoostValue,
    huoFuValue,
    gongJianValue,
    zhengDaLiValue,
    liuHeJingValue,
    liuHeJingChance,
    zuoGuiValue,
    iceDamage,
    pulseDamage,
    fireDamage,
    erWeiDamage,
    shenMuTouDamage,
    linFengValueIce: linFengValue,
    linFengValueFire: linFengValue * 0.6,
    shangGuanCeValue,
    suiShouValue,
    qiHaoDamage,
    liuWeiDamage,
  }
}

function normalizeCards(cards: CardOptions[]) {
  const map: Record<string, boolean> = {}
  return cards.filter(({ id }) => {
    if (!cardCatalog[id]) return false
    if (map[id]) return false
    map[id] = true
    return true
  })
}

function getCost(cards: CardOptions[]) {
  return cards.reduce((res, cur) => {
    return res + cardCatalog[cur.id].cost
  }, 0)
}

function getCoreAttribute(cards: CardOptions[], coreAttribute: number, coreAttributeExtraGain: number) {
  const result = cards.reduce((res, cur) => {
    return res + getCardCoreAttribute(cur, coreAttributeExtraGain)
  }, coreAttribute)

  const muJian = cards.find(({ id }) => id === 'muJian')
  if (!muJian) return result

  const value = getScaledValue(muJian.id, muJian.level)
  return result + (result * value) / 100 / (1 + coreAttributeExtraGain)
}
function getCardCoreAttribute(card: CardOptions, coreAttributeExtraGain: number) {
  const { id, level } = card
  return (CORE_ATTR_A + CORE_ATTR_B * level) * cardCatalog[id].cost * (1 + coreAttributeExtraGain)
}

function getAttackPower(newCoreAttribute: number, buff: number) {
  return (newCoreAttribute / 5) * buff
}

function getAttackPowerBoostValue(cards: CardOptions[]) {
  let valueZhouYiXian = 0
  let valueMengHu = 0
  let valueXianRenBuFan = 0
  let humanCount = 0
  let animalCount = 0
  let utensilCount = 0

  cards.forEach(({ id, level }) => {
    const card = cardCatalog[id]
    if (card.group === 'human') humanCount++
    else if (card.group === 'animal') animalCount++
    else utensilCount++

    if (id === 'zhouYiXian') valueZhouYiXian = getScaledValue(id, level)
    else if (id === 'mengHu') valueMengHu = getScaledValue(id, level)
    else if (id === 'xianRenBuFan') valueXianRenBuFan = getScaledValue(id, level)
  })

  return 1 + (valueZhouYiXian * humanCount + valueMengHu * animalCount + valueXianRenBuFan * utensilCount) / 100
}

function getAttributeBoostValue(coreOptions: CoreOptions) {
  let result = 1
  coreOptions.cards.forEach(({ id, level }) => {
    const attributeKey = getAttributeValueKey(id)
    if (!attributeKey) return

    const value = getScaledValue(id, level)
    const attributeValue = coreOptions.attributeValues?.[attributeKey] ?? DEFAULT_ATTRIBUTE_YIELD
    result = result * (1 + (attributeValue * value) / 400)
  })
  return result
}

function getAttributeValueKey(cardId: CardId) {
  if (cardId in ATTRIBUTE_CARD_VALUES) {
    return ATTRIBUTE_CARD_VALUES[cardId as keyof typeof ATTRIBUTE_CARD_VALUES]
  }
  return null
}

function getGlobalBoostValue(coreOptions: CoreOptions) {
  return getPassiveValue(coreOptions, 'xueDiXiong')
}

function getPassiveValue(coreOptions: CoreOptions, cardId: CardId) {
  const card = coreOptions.cards.find((item) => item.id === cardId)
  if (!card) return 0
  return getScaledValue(cardId, card.level)
}

function getDamageRatio(coreOptions: CoreOptions, cardId: CardId) {
  const card = coreOptions.cards.find((item) => item.id === cardId)
  if (!card) return 0
  return getScaledValue(cardId, card.level) * coreOptions.attackPower
}

function getLegacyBaseDamageRatio(coreOptions: CoreOptions, cardId: 'yanHong' | 'zheShan' | 'xingHongJuYi') {
  const card = coreOptions.cards.find((item) => item.id === cardId)
  const level = card ? card.level : -1
  return getScaledValue(cardId, level) * coreOptions.attackPower
}

export function getCooldown(cardId: CardId, level: number) {
  const params = cardParams[cardId]
  if ('cooldown' in params) return params.cooldown
  if ('cooldownBase' in params && 'cooldownPerLevel' in params) {
    return params.cooldownBase + params.cooldownPerLevel * level
  }
  return 0
}
