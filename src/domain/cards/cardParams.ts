import type { CardId } from './cardIds'

interface Scale2 {
  base: number
  perLevel: number
}

export interface CardParams {
  huoFu: Scale2
  erWeiYaoHu: Scale2
  shenMuTou: Scale2
  liuHeJing: { chance: number } & Scale2
  linFeng: Scale2
  shangGuanCe: Scale2
  zhengDaLi: Scale2
  gongJian: Scale2
  suiShou: Scale2
  zuoGui: Scale2
  yanHong: Scale2 & { cooldown: number }
  wenMin: { cooldownBase: number; cooldownPerLevel: number }
  xingHongJuYi: Scale2 & { cooldown: number; maxCount: number }
  youMingQuan: { cooldownBase: number; cooldownPerLevel: number }
  zheShan: Scale2 & { cooldown: number }
  hanBingJian: { cooldownBase: number; cooldownPerLevel: number }
  qiHao: Scale2 & { cooldown: number }
  liuWeiMoHu: Scale2
  haiGui: Scale2
  xiaoHuan: Scale2
  fengZheng: Scale2
  mengHu: Scale2
  zhouYiXian: Scale2
  xianRenBuFan: Scale2
  xueDiXiong: Scale2
  muJian: Scale2
}

export const cardParams: CardParams = {
  huoFu: { base: 0.4, perLevel: 0.1 },
  erWeiYaoHu: { base: 0.28, perLevel: 0.02 },
  shenMuTou: { base: 0.7, perLevel: 0.05 },
  liuHeJing: { chance: 0.5, base: 1.4, perLevel: 0.1 },
  linFeng: { base: 0.7, perLevel: 0.05 },
  shangGuanCe: { base: 0.38, perLevel: 0.02 },
  zhengDaLi: { base: 0.19, perLevel: 0.01 },
  gongJian: { base: 0.35, perLevel: 0.025 },
  suiShou: { base: 0.7, perLevel: 0.05 },
  zuoGui: { base: 0.28, perLevel: 0.02 },
  yanHong: { base: 0.28, perLevel: 0.02, cooldown: 6 },
  wenMin: { cooldownBase: 16, cooldownPerLevel: -1 },
  xingHongJuYi: { base: 0.014, perLevel: 0.001, cooldown: 8, maxCount: 12 },
  youMingQuan: { cooldownBase: 10, cooldownPerLevel: -1 },
  zheShan: { base: 0.4, perLevel: 0.02, cooldown: 15 },
  hanBingJian: { cooldownBase: 16, cooldownPerLevel: -1 },
  qiHao: { base: 10.4, perLevel: 0.6, cooldown: 60 },
  liuWeiMoHu: { base: 0.5, perLevel: 0.03 },
  haiGui: { base: 280, perLevel: 20 },
  xiaoHuan: { base: 280, perLevel: 20 },
  fengZheng: { base: 280, perLevel: 20 },
  mengHu: { base: 0.56, perLevel: 0.04 },
  zhouYiXian: { base: 0.56, perLevel: 0.04 },
  xianRenBuFan: { base: 0.56, perLevel: 0.04 },
  xueDiXiong: { base: 0.38, perLevel: 0.02 },
  muJian: { base: 0.56, perLevel: 0.04 },
}

export function getScaledValue(cardId: CardId, level: number) {
  const params = cardParams[cardId]
  if ('base' in params && 'perLevel' in params) {
    return params.base + params.perLevel * level
  }
  return 0
}

export function getChanceValue(cardId: CardId) {
  const params = cardParams[cardId]
  if ('chance' in params) return params.chance
  return 0
}
