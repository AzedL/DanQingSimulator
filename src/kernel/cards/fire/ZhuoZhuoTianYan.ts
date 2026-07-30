import type { Core } from '../../core/Core'
import { CooldownTime } from '../../utils/CooldownTime'
import { Card } from '../Card'
import { CARD_IDS } from '../cardIds'
import type { LieHuoLiaoYuan } from './ly/LieHuoLiaoYuan'
import type { LieYanFenShen } from './ly/LieYanFenShen'
import { deductBaseDamageDuringCast, getCard } from '../shared'

const DAMAGES = [105000, 105000, 105000, 105000, 105000, 168014]
const CAST_DURATION = 5

export class ZhuoZhuoTianYan extends Card {
  declare private _cooldown: CooldownTime

  constructor(core: Core, level: number) {
    super(core, 'active', CARD_IDS.zhuoZhuoTianYan, '灼灼天炎', level)
  }

  protected init() {
    this._cooldown = new CooldownTime(120, true)
  }

  tick() {
    if (this._cooldown.settle()) this.cast()
    this._cooldown.tick()
  }

  private cast() {
    deductBaseDamageDuringCast(this.core, CAST_DURATION)
    const insightMultiplier =
      this.core.damage.consumeInsightMultiplier()
    getCard<LieHuoLiaoYuan>(
      this.core,
      CARD_IDS.lieHuoLiaoYuan,
    )?.onSkillStart()
    this.settleDamage(0, insightMultiplier)

    for (let index = 1; index < DAMAGES.length; index++) {
      this.core.queue.enqueue(() => {
        this.settleDamage(index, insightMultiplier)
        if (index === DAMAGES.length - 1) {
          getCard<LieHuoLiaoYuan>(
            this.core,
            CARD_IDS.lieHuoLiaoYuan,
          )?.onSkillEnd()
        }
      }, index)
    }
  }

  private settleDamage(index: number, insightMultiplier: number) {
    this.core.fire.add(
      DAMAGES[index] * insightMultiplier,
      1,
      '灼灼天炎',
    )
    getCard<LieYanFenShen>(
      this.core,
      CARD_IDS.lieYanFenShen,
    )?.onSkillDamage()
  }

  reset() {
    this._cooldown.reset()
  }
}
