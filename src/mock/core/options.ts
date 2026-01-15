import { dataBase } from '../dataBase/dataBase'
import { fixed } from '../utils/math'
import type { CoreOptions } from './Core'

export interface Options {
  attackPowerBoostValue: number
  attributeBoostValue: number
  globalBoostValue: number
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

export function getOptions(coreOptions: CoreOptions): Options {
  const attackPowerBoostValue = fixed(getAttackPowerBoostValue(coreOptions), 4)
  coreOptions.attackPower = coreOptions.attackPower * attackPowerBoostValue
  const attributeBoostValue = fixed(getAttributeBoostValue(coreOptions), 4)
  const globalBoostValue = fixed(getGlobalBoostValue(coreOptions), 4)

  const zuoGuiValue = fixed(getOptionZuoGuiValue(coreOptions))
  const iceDamage = fixed(getOptionIceDamage(coreOptions) * (1 + zuoGuiValue))
  const pulseDamage = fixed(getOptionPulseDamage(coreOptions) * (1 + zuoGuiValue))
  const fireDamage = fixed(getOptionFireDamage(coreOptions) * (1 + zuoGuiValue))
  const erWeiDamage = fixed(getOptionErWeiDamage(coreOptions))
  const shenMuTouDamage = fixed(getOptionShenMuTouDamage(coreOptions))
  const linFengValue = fixed(getOptionLinFengValue(coreOptions))
  const shangGuanCeValue = fixed(getOptionShangGuanCeValue(coreOptions))
  const suiShouValue = fixed(getOptionSuiShouValue(coreOptions))

  const qiHaoDamage = fixed(getOptionQiHaoDamage(coreOptions) * (1 + zuoGuiValue))
  const liuWeiDamage = fixed(getOptionLiuWeiDamage(coreOptions))

  return {
    attackPowerBoostValue,
    attributeBoostValue,
    globalBoostValue,
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

const getAttackPowerBoostValue = (coreOptions: CoreOptions) => {
  const { cards } = coreOptions

  let valueZhouYiXian = 0,
    valueMengHu = 0,
    valueXianRenBuFan = 0
  let humanCount = 0,
    animalCount = 0,
    utensilCount = 0
  cards.forEach((card) => {
    const { id, level } = card
    const data = dataBase[id]
    if (!data) return

    const group = data.group
    if (group === 'human') {
      humanCount++
    } else if (group === 'animal') {
      animalCount++
    } else {
      utensilCount++
    }

    if (id === 'zhouYiXian') {
      const [a, b] = data.values
      valueZhouYiXian = a + b * level
    } else if (id === 'mengHu') {
      const [a, b] = data.values
      valueMengHu = a + b * level
    } else if (id === 'xianRenBuFan') {
      const [a, b] = data.values
      valueXianRenBuFan = a + b * level
    }
  })

  return 1 + (valueZhouYiXian * humanCount + valueMengHu * animalCount + valueXianRenBuFan * utensilCount) / 100
}
const ATTRIBUTE_VALUE = 0.008
const ATTRIBUTE_CARDS = ['haiGui', 'xiaoHuan', 'fengZheng']
const getAttributeBoostValue = (coreOptions: CoreOptions) => {
  const { cards } = coreOptions
  let result = 1
  cards.forEach((card) => {
    const { id, level } = card
    const data = dataBase[id]
    if (!data) return

    if (ATTRIBUTE_CARDS.includes(id)) {
      const [a, b] = data.values
      const value = a + b * level
      result = result * (1 + (ATTRIBUTE_VALUE * value) / 400)
    }
  })
  return result
}
const getGlobalBoostValue = (coreOptions: CoreOptions) => {
  const id = 'xueDiXiong'

  const { cards } = coreOptions
  const card = cards.find((card) => card.id === id)
  if (!card) return 0

  const level = card.level
  const [a, b] = dataBase[id].values
  return a + b * level
}
const getOptionZuoGuiValue = (coreOptions: CoreOptions) => {
  const id = 'zuoGui'

  const { cards } = coreOptions
  const card = cards.find((card) => card.id === id)
  if (!card) return 0

  const level = card.level
  const [a, b] = dataBase[id].values
  return a + b * level
}
const getOptionIceDamage = (coreOptions: CoreOptions) => {
  const id = 'yanHong'

  const { cards, attackPower } = coreOptions
  const card = cards.find((card) => card.id === id)

  let level = -1
  if (card) level = card.level

  const [a, b] = dataBase[id].values
  return (a + b * level) * attackPower
}
const getOptionPulseDamage = (coreOptions: CoreOptions) => {
  const id = 'zheShan'

  const { cards, attackPower } = coreOptions
  const card = cards.find((card) => card.id === id)

  let level = -1
  if (card) level = card.level

  const [a, b] = dataBase[id].values
  return (a + b * level) * attackPower
}
const getOptionFireDamage = (coreOptions: CoreOptions) => {
  const id = 'xingHongJuYi'

  const { cards, attackPower } = coreOptions
  const card = cards.find((card) => card.id === id)

  let level = -1
  if (card) level = card.level

  const [a, b] = dataBase[id].values
  return (a + b * level) * attackPower
}
const getOptionErWeiDamage = (coreOptions: CoreOptions) => {
  const id = 'erWeiYaoHu'

  const { cards, attackPower } = coreOptions
  const card = cards.find((card) => card.id === id)
  if (!card) return 0

  const level = card.level
  const [a, b] = dataBase[id].values
  return (a + b * level) * attackPower
}
const getOptionShenMuTouDamage = (coreOptions: CoreOptions) => {
  const id = 'shenMuTou'

  const { cards, attackPower } = coreOptions
  const card = cards.find((card) => card.id === id)
  if (!card) return 0

  const level = card.level
  const [a, b] = dataBase[id].values
  return (a + b * level) * attackPower
}
const getOptionLinFengValue = (coreOptions: CoreOptions) => {
  const id = 'linFeng'

  const { cards } = coreOptions
  const card = cards.find((card) => card.id === id)
  if (!card) return 0

  const level = card.level
  const [a, b] = dataBase[id].values
  return a + b * level
}
const getOptionShangGuanCeValue = (coreOptions: CoreOptions) => {
  const id = 'shangGuanCe'

  const { cards } = coreOptions
  const card = cards.find((card) => card.id === id)
  if (!card) return 0

  const level = card.level
  const [a, b] = dataBase[id].values
  return a + b * level
}
const getOptionSuiShouValue = (coreOptions: CoreOptions) => {
  const id = 'suiShou'

  const { cards } = coreOptions
  const card = cards.find((card) => card.id === id)
  if (!card) return 0

  const level = card.level
  const [a, b] = dataBase[id].values
  return a + b * level
}
const getOptionQiHaoDamage = (coreOptions: CoreOptions) => {
  const id = 'qiHao'

  const { cards, attackPower } = coreOptions
  const card = cards.find((card) => card.id === id)
  if (!card) return 0

  const level = card.level
  const [a, b] = dataBase[id].values
  return (a + b * level) * attackPower
}
const getOptionLiuWeiDamage = (coreOptions: CoreOptions) => {
  const id = 'liuWeiMoHu'

  const { cards, attackPower } = coreOptions
  const card = cards.find((card) => card.id === id)
  if (!card) return 0

  const level = card.level
  const [a, b] = dataBase[id].values
  return (a + b * level) * attackPower
}
