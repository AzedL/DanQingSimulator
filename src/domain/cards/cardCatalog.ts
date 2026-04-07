import type { CardBehaviorKind, CardGroup, CardId } from './cardIds'

export interface CardCatalogEntry {
  id: CardId
  name: string
  cost: number
  group: CardGroup
  behaviorKind: CardBehaviorKind
  displayOrder: number
}

export const cardCatalog: Record<CardId, CardCatalogEntry> = {
  haiGui: { id: 'haiGui', name: '海龟', cost: 1, group: 'animal', behaviorKind: 'passive', displayOrder: 0 },
  xiaoHuan: { id: 'xiaoHuan', name: '小环', cost: 1, group: 'human', behaviorKind: 'passive', displayOrder: 1 },
  muJian: { id: 'muJian', name: '木剑', cost: 1, group: 'utensil', behaviorKind: 'derived', displayOrder: 2 },
  fengZheng: { id: 'fengZheng', name: '风筝', cost: 1, group: 'utensil', behaviorKind: 'passive', displayOrder: 3 },
  yanHong: { id: 'yanHong', name: '燕虹', cost: 1, group: 'human', behaviorKind: 'active', displayOrder: 4 },
  xingHongJuYi: {
    id: 'xingHongJuYi',
    name: '猩红巨蚁',
    cost: 1,
    group: 'animal',
    behaviorKind: 'active',
    displayOrder: 5,
  },
  zheShan: { id: 'zheShan', name: '折扇', cost: 1, group: 'utensil', behaviorKind: 'active', displayOrder: 6 },
  mengHu: { id: 'mengHu', name: '猛虎', cost: 2, group: 'animal', behaviorKind: 'passive', displayOrder: 7 },
  zhouYiXian: { id: 'zhouYiXian', name: '周一仙', cost: 2, group: 'human', behaviorKind: 'passive', displayOrder: 8 },
  xianRenBuFan: {
    id: 'xianRenBuFan',
    name: '仙人布幡',
    cost: 2,
    group: 'utensil',
    behaviorKind: 'passive',
    displayOrder: 9,
  },
  wenMin: { id: 'wenMin', name: '文敏', cost: 2, group: 'human', behaviorKind: 'active', displayOrder: 10 },
  shenMuTou: { id: 'shenMuTou', name: '神木骰', cost: 2, group: 'utensil', behaviorKind: 'passive', displayOrder: 11 },
  erWeiYaoHu: { id: 'erWeiYaoHu', name: '二尾妖狐', cost: 2, group: 'animal', behaviorKind: 'passive', displayOrder: 12 },
  youMingQuan: { id: 'youMingQuan', name: '幽冥犬', cost: 2, group: 'animal', behaviorKind: 'active', displayOrder: 13 },
  shangGuanCe: { id: 'shangGuanCe', name: '上官策', cost: 2, group: 'human', behaviorKind: 'passive', displayOrder: 14 },
  linFeng: { id: 'linFeng', name: '林峰', cost: 3, group: 'human', behaviorKind: 'passive', displayOrder: 15 },
  suiShou: { id: 'suiShou', name: '岁兽', cost: 3, group: 'animal', behaviorKind: 'passive', displayOrder: 16 },
  hanBingJian: { id: 'hanBingJian', name: '寒冰剑', cost: 3, group: 'utensil', behaviorKind: 'active', displayOrder: 17 },
  zuoGui: { id: 'zuoGui', name: '左归', cost: 4, group: 'human', behaviorKind: 'passive', displayOrder: 18 },
  xueDiXiong: { id: 'xueDiXiong', name: '雪地熊', cost: 4, group: 'animal', behaviorKind: 'passive', displayOrder: 19 },
  qiHao: { id: 'qiHao', name: '齐昊', cost: 5, group: 'human', behaviorKind: 'active', displayOrder: 20 },
  liuWeiMoHu: { id: 'liuWeiMoHu', name: '六尾魔狐', cost: 5, group: 'animal', behaviorKind: 'active', displayOrder: 21 },
}

export const orderedCardCatalog = Object.values(cardCatalog).sort((a, b) => a.displayOrder - b.displayOrder)
