import { DEFAULT_DAMAGE_MULTIPLIER } from '../../../core/Damage'
import type { Core } from '../../../core/Core'
import { Card } from '../../Card'
import { CARD_IDS } from '../../cardIds'

const MULTIPLIER = [0, 1, 1.375, 1.75, 2.125, 2.5]

export class ShuangCiHanYu extends Card {
  declare private _damage: number

  constructor(core: Core, level: number) {
    super(core, 'passive', CARD_IDS.shuangCiHanYu, '霜刺寒雨', level)
  }

  protected init() {
    this._damage = 81740 * MULTIPLIER[this.level]
  }

  get skillDamageMultiplier() {
    return this.level >= 3 ? 1.3 : DEFAULT_DAMAGE_MULTIPLIER
  }

  onFreeze() {
    if (this.level >= 5) this.core.damage.addInsight(3)
    this.core.queue.enqueue(() => {
      this.core.ice.add(this._damage, 5, '霜刺寒雨')
    }, 1)
  }

  reset() {}
}
