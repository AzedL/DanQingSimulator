import type { Core } from '../../../core/Core'
import { Card } from '../../Card'
import { CARD_IDS } from '../../cardIds'
import { MENG_HU_ACTIVATION_DAMAGE_MULTIPLIER } from '../dq/MengHu'

const MULTIPLIER = [0, 1, 1.375, 1.75, 2.125, 2.5]

export class ShenHuoBengFa extends Card {
  declare private _damage: number

  constructor(core: Core, level: number) {
    super(core, 'passive', CARD_IDS.shenHuoBengFa, '神火迸发', level)
  }

  protected init() {
    this._damage = 65290 * MULTIPLIER[this.level]
  }

  get activationDamageMultiplier() {
    return this.level >= 3
      ? 1.2
      : MENG_HU_ACTIVATION_DAMAGE_MULTIPLIER
  }

  onActivation() {
    this.settleDamage()
    if (this.level >= 5) {
      this.core.queue.enqueue(() => this.settleDamage(), 2)
    }
  }

  private settleDamage() {
    this.core.fire.add(this._damage, 1, '神火迸发')
  }

  reset() {}
}
