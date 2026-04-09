import type { Core } from '@/kernel/core/Core'
import type { Card } from '@/kernel/cards/Card'
import { AttackPowerBoost } from '@/kernel/cards/AttackPowerBoost'
import { AttributeBoost } from '@/kernel/cards/AttributeBoost'
import { GlobalBoost } from '@/kernel/cards/GlobalBoostValue'
import { HanBingJian } from '@/kernel/cards/HanBingJian'
import { LiuWeiMoHu } from '@/kernel/cards/LiuWeiMoHu'
import { QiHao } from '@/kernel/cards/QiHao'
import { WenMin } from '@/kernel/cards/WenMin'
import { XingHongJuYi } from '@/kernel/cards/XingHongJuYi'
import { YanHong } from '@/kernel/cards/YanHong'
import { YouMingQuan } from '@/kernel/cards/YouMingQuan'
import { ZheShan } from '@/kernel/cards/ZheShan'
import { cardCatalog } from '@/domain/cards/cardCatalog'
import type { ActiveCardId, CardBehaviorKind, CardId } from '@/domain/cards/cardIds'

type RuntimeCardFactory = (core: Core, level?: number) => Card

export interface CardDefinition {
  id: CardId
  behaviorKind: CardBehaviorKind
  sortOrder: number
  createRuntimeCard?: RuntimeCardFactory
  isEnabled?: (core: Core) => boolean
}

const hasAny = (core: Core, ids: CardId[]) => core.coreOptions.cards.some((card) => ids.includes(card.id))

export const cardDefinitions: Record<CardId, CardDefinition> = {
  huoFu: { id: 'huoFu', behaviorKind: 'passive', sortOrder: 0 },
  haiGui: { id: 'haiGui', behaviorKind: 'passive', sortOrder: 0 },
  xiaoHuan: { id: 'xiaoHuan', behaviorKind: 'passive', sortOrder: 0 },
  muJian: { id: 'muJian', behaviorKind: 'derived', sortOrder: 0 },
  fengZheng: { id: 'fengZheng', behaviorKind: 'passive', sortOrder: 0 },
  yanHong: {
    id: 'yanHong',
    behaviorKind: 'active',
    sortOrder: 0,
    createRuntimeCard: (core, level) => new YanHong(core, level || 0),
  },
  xingHongJuYi: {
    id: 'xingHongJuYi',
    behaviorKind: 'active',
    sortOrder: 4,
    createRuntimeCard: (core, level) => new XingHongJuYi(core, level || 0),
  },
  zheShan: {
    id: 'zheShan',
    behaviorKind: 'active',
    sortOrder: 3,
    createRuntimeCard: (core, level) => new ZheShan(core, level || 0),
  },
  mengHu: { id: 'mengHu', behaviorKind: 'passive', sortOrder: 0 },
  zhouYiXian: { id: 'zhouYiXian', behaviorKind: 'passive', sortOrder: 0 },
  xianRenBuFan: { id: 'xianRenBuFan', behaviorKind: 'passive', sortOrder: 0 },
  wenMin: {
    id: 'wenMin',
    behaviorKind: 'active',
    sortOrder: 1,
    createRuntimeCard: (core, level) => new WenMin(core, level || 0),
  },
  shenMuTou: { id: 'shenMuTou', behaviorKind: 'passive', sortOrder: 0 },
  erWeiYaoHu: { id: 'erWeiYaoHu', behaviorKind: 'passive', sortOrder: 0 },
  youMingQuan: {
    id: 'youMingQuan',
    behaviorKind: 'active',
    sortOrder: 5,
    createRuntimeCard: (core, level) => new YouMingQuan(core, level || 0),
  },
  shangGuanCe: { id: 'shangGuanCe', behaviorKind: 'passive', sortOrder: 0 },
  zhengDaLi: { id: 'zhengDaLi', behaviorKind: 'passive', sortOrder: 0 },
  gongJian: { id: 'gongJian', behaviorKind: 'passive', sortOrder: 0 },
  linFeng: { id: 'linFeng', behaviorKind: 'passive', sortOrder: 0 },
  suiShou: { id: 'suiShou', behaviorKind: 'passive', sortOrder: 0 },
  hanBingJian: {
    id: 'hanBingJian',
    behaviorKind: 'active',
    sortOrder: 2,
    createRuntimeCard: (core, level) => new HanBingJian(core, level || 0),
  },
  zuoGui: { id: 'zuoGui', behaviorKind: 'passive', sortOrder: 0 },
  xueDiXiong: { id: 'xueDiXiong', behaviorKind: 'passive', sortOrder: 0 },
  qiHao: {
    id: 'qiHao',
    behaviorKind: 'active',
    sortOrder: 6,
    createRuntimeCard: (core, level) => new QiHao(core, level || 0),
  },
  liuWeiMoHu: {
    id: 'liuWeiMoHu',
    behaviorKind: 'active',
    sortOrder: 7,
    createRuntimeCard: (core, level) => new LiuWeiMoHu(core, level || 0),
  },
  liuHeJing: { id: 'liuHeJing', behaviorKind: 'passive', sortOrder: 0 },
}

const passiveRuntimeDefinitions: CardDefinition[] = [
  {
    id: 'zhouYiXian',
    behaviorKind: 'passive',
    sortOrder: 100,
    createRuntimeCard: (core) => new AttackPowerBoost(core),
    isEnabled: (core) => hasAny(core, ['zhouYiXian', 'mengHu', 'xianRenBuFan']),
  },
  {
    id: 'xiaoHuan',
    behaviorKind: 'passive',
    sortOrder: 101,
    createRuntimeCard: (core) => new AttributeBoost(core),
    isEnabled: (core) => hasAny(core, ['haiGui', 'xiaoHuan', 'fengZheng']),
  },
  {
    id: 'xueDiXiong',
    behaviorKind: 'passive',
    sortOrder: 102,
    createRuntimeCard: (core) => new GlobalBoost(core),
    isEnabled: (core) => hasAny(core, ['xueDiXiong']),
  },
]

export function getCardDefinition(cardId: CardId) {
  return cardDefinitions[cardId]
}

export function getRuntimeCards(core: Core) {
  const activeCards = core.coreOptions.cards
    .filter(({ id }) => getCardDefinition(id).behaviorKind === 'active')
    .sort((a, b) => getCardDefinition(a.id).sortOrder - getCardDefinition(b.id).sortOrder)
    .flatMap(({ id, level }) => {
      const definition = getCardDefinition(id as ActiveCardId)
      return definition.createRuntimeCard ? [definition.createRuntimeCard(core, level)] : []
    })

  const passiveCards = passiveRuntimeDefinitions.flatMap((definition) => {
    if (!definition.createRuntimeCard || (definition.isEnabled && !definition.isEnabled(core))) {
      return []
    }
    return [definition.createRuntimeCard(core)]
  })

  return [...activeCards, ...passiveCards]
}

export const orderedCardDefinitions = Object.values(cardDefinitions).sort((a, b) => {
  return cardCatalog[a.id].displayOrder - cardCatalog[b.id].displayOrder
})
