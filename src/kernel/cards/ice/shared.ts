import { DEFAULT_DAMAGE_MULTIPLIER } from '../../core/Damage'
import type { Core } from '../../core/Core'
import { getCard } from '../shared'
import type { QiHao } from './dq/QiHao'
import type { ShangGuanCe } from './dq/ShangGuanCe'
import type { WenMin } from './dq/WenMin'
import type { ZuoGui } from './dq/ZuoGui'
import type { HanJingCi } from './ly/HanJingCi'
import type { ShuangHanPoLie } from './ly/ShuangHanPoLie'
import { CARD_IDS } from '../cardIds'

export function settleIceArrow(
  core: Core,
  baseDamage: number,
  count: number,
  key: string,
) {
  const wenMinMultiplier =
    getCard<WenMin>(core, CARD_IDS.wenMin)?.arrowDamageMultiplier ??
    DEFAULT_DAMAGE_MULTIPLIER
  const zuoGui = getCard<ZuoGui>(core, CARD_IDS.zuoGui)
  const zuoGuiMultiplier =
    zuoGui?.arrowStormDamageMultiplier ?? DEFAULT_DAMAGE_MULTIPLIER

  core.ice.add(
    baseDamage * count * wenMinMultiplier * zuoGuiMultiplier,
    count,
    key,
  )

  zuoGui?.onHit(count)
  getCard<ShangGuanCe>(core, CARD_IDS.shangGuanCe)?.onIceArrow(count)
  getCard<QiHao>(core, CARD_IDS.qiHao)?.onIceArrow(count)
  getCard<HanJingCi>(core, CARD_IDS.hanJingCi)?.onIceArrow(count)
}

export function summonFrostElement(
  core: Core,
  stormDamage: number,
  stormKey: string,
) {
  getCard<ShuangHanPoLie>(
    core,
    CARD_IDS.shuangHanPoLie,
  )?.onFrostElement()
  getCard<HanJingCi>(core, CARD_IDS.hanJingCi)?.onFrostElement()

  const zuoGui = getCard<ZuoGui>(core, CARD_IDS.zuoGui)
  const multiplier =
    zuoGui?.arrowStormDamageMultiplier ?? DEFAULT_DAMAGE_MULTIPLIER
  const damage = stormDamage * multiplier

  for (let index = 0; index < 4; index++) {
    core.queue.enqueue(() => {
      core.ice.add(damage / 4, 5, stormKey)
      zuoGui?.onHit(5)
      getCard<ShangGuanCe>(
        core,
        CARD_IDS.shangGuanCe,
      )?.onStorm(0.25)
    }, 1 + index * 0.5)
  }
}
