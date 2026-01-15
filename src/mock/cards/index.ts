import type { Core } from '../core/Core'
import { dataBase, type TCardIds, type TCardIds1 } from '../dataBase/dataBase'
import { AttackPowerBoost } from './AttackPowerBoost'
import { AttributeBoost } from './AttributeBoost'
import { GlobalBoost } from './GlobalBoostValue'
import { HanBingJian } from './HanBingJian'
import { LiuWeiMoHu } from './LiuWeiMoHu'
import { QiHao } from './QiHao'
import { WenMin } from './WenMin'
import { XingHongJuYi } from './XingHongJuYi'
import { YanHong } from './YanHong'
import { YouMingQuan } from './YouMingQuan'
import { ZheShan } from './ZheShan'

export function getCards(core: Core) {
  const boosts = [new AttackPowerBoost(core), new AttributeBoost(core), new GlobalBoost(core)]
  const cardsType1 = core.coreOptions.cards
    .filter(({ id }) => {
      const data = dataBase[id]
      return data && data._type === 1
    })
    .sort((a, b) => (sortMap[a.id] || 0) - (sortMap[b.id] || 0))

  return [
    ...cardsType1.flatMap(({ id, level }) => {
      const CardConstructor = cardsMap[id as TCardIds1]
      if (!CardConstructor) return []

      return new CardConstructor(core, level)
    }),
    ...boosts,
  ]
}

const cardsMap = {
  yanHong: YanHong,
  wenMin: WenMin,
  xingHongJuYi: XingHongJuYi,
  youMingQuan: YouMingQuan,
  zheShan: ZheShan,
  hanBingJian: HanBingJian,
  qiHao: QiHao,
  liuWeiMoHu: LiuWeiMoHu,
}

const sortMap: Partial<Record<TCardIds, number>> = {
  yanHong: 0,
  wenMin: 1,
  hanBingJian: 2,
  zheShan: 3,
  xingHongJuYi: 4,
  youMingQuan: 5,
  qiHao: 6,
  liuWeiMoHu: 7,
}
