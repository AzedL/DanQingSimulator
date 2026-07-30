import { DEFAULT_DAMAGE_MULTIPLIER } from '../../core/Damage'
import type { Core } from '../../core/Core'
import { CooldownTime } from '../../utils/CooldownTime'
import { Card } from '../Card'
import { CARD_IDS } from '../cardIds'
import { deductBaseDamageDuringCast, getCard } from '../shared'
import type { HanChaoBingYong } from './ly/HanChaoBingYong'
import type { ShuangCiHanYu } from './ly/ShuangCiHanYu'
import type { ShuangHanPoLie } from './ly/ShuangHanPoLie'

const DAMAGE_PER_HIT = 70715
const CAST_DURATION = 4

export class NingBingShuangHua extends Card {
  declare private _cooldown: CooldownTime

  constructor(core: Core, level: number) {
    super(core, 'active', CARD_IDS.ningBingShuangHua, '凝冰霜华', level)
  }

  protected init() {
    this._cooldown = new CooldownTime(90, true)
  }

  tick() {
    if (this._cooldown.settle()) this.cast()
    this._cooldown.tick()
  }

  private cast() {
    deductBaseDamageDuringCast(this.core, CAST_DURATION)
    const skillMultiplier =
      getCard<ShuangCiHanYu>(this.core, CARD_IDS.shuangCiHanYu)
        ?.skillDamageMultiplier ?? DEFAULT_DAMAGE_MULTIPLIER
    const insightMultiplier =
      this.core.damage.consumeInsightMultiplier()
    const multiplier = skillMultiplier * insightMultiplier

    getCard<ShuangHanPoLie>(
      this.core,
      CARD_IDS.shuangHanPoLie,
    )?.onSkillCast()
    this.settleDamage(1, multiplier)

    for (let delay = 1; delay <= 3; delay++) {
      this.core.queue.enqueue(() => {
        this.settleDamage(2, multiplier)
      }, delay)
    }
  }

  private settleDamage(count: number, multiplier: number) {
    this.core.ice.add(
      DAMAGE_PER_HIT * count * multiplier,
      count,
      '凝冰霜华',
    )
    getCard<HanChaoBingYong>(
      this.core,
      CARD_IDS.hanChaoBingYong,
    )?.onSkillDamageGroup()
  }

  reset() {
    this._cooldown.reset()
  }
}
