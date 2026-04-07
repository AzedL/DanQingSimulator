import { cardCatalog } from '@/domain/cards/cardCatalog'
import { cardParams } from '@/domain/cards/cardParams'
import type { TCardIds, TCardIds1 } from '@/domain/cards/cardIds'

interface Data {
  id: TCardIds
  name: string
  values: number[]
  cost: number
  group: 'human' | 'animal' | 'utensil'
  _type: 0 | 1 | 2 | 3
}

const activeCardIds: TCardIds1[] = [
  'yanHong',
  'wenMin',
  'xingHongJuYi',
  'youMingQuan',
  'zheShan',
  'hanBingJian',
  'qiHao',
  'liuWeiMoHu',
]

const type2CardIds: TCardIds[] = [
  'haiGui',
  'xiaoHuan',
  'fengZheng',
  'mengHu',
  'zhouYiXian',
  'xianRenBuFan',
  'xueDiXiong',
]
const derivedCardIds: TCardIds[] = ['muJian']

function getValues(id: TCardIds) {
  if (id === 'yanHong') return [cardParams.yanHong.base, cardParams.yanHong.perLevel, cardParams.yanHong.cooldown]
  if (id === 'wenMin') return [cardParams.wenMin.cooldownBase, cardParams.wenMin.cooldownPerLevel]
  if (id === 'xingHongJuYi') {
    return [
      cardParams.xingHongJuYi.base,
      cardParams.xingHongJuYi.perLevel,
      cardParams.xingHongJuYi.cooldown,
      cardParams.xingHongJuYi.maxCount,
    ]
  }
  if (id === 'youMingQuan') return [cardParams.youMingQuan.cooldownBase, cardParams.youMingQuan.cooldownPerLevel]
  if (id === 'zheShan') return [cardParams.zheShan.base, cardParams.zheShan.perLevel, cardParams.zheShan.cooldown]
  if (id === 'hanBingJian') return [cardParams.hanBingJian.cooldownBase, cardParams.hanBingJian.cooldownPerLevel]
  if (id === 'qiHao') return [cardParams.qiHao.base, cardParams.qiHao.perLevel, cardParams.qiHao.cooldown]
  const params = cardParams[id]
  if ('base' in params && 'perLevel' in params) return [params.base, params.perLevel]
  return []
}

function getType(id: TCardIds): 0 | 1 | 2 | 3 {
  if (activeCardIds.includes(id as TCardIds1)) return 1
  if (derivedCardIds.includes(id)) return 3
  if (type2CardIds.includes(id)) return 2
  return 0
}

export const dataBase: Record<TCardIds, Data> = Object.fromEntries(
  Object.values(cardCatalog).map((card) => {
    return [
      card.id,
      {
        id: card.id,
        name: card.name,
        values: getValues(card.id),
        cost: card.cost,
        group: card.group,
        _type: getType(card.id),
      },
    ]
  }),
) as Record<TCardIds, Data>

export type { TCardIds, TCardIds1 }
