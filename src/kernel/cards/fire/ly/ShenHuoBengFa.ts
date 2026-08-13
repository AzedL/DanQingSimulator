import type { Core } from '../../../core/Core'
import { Card } from '../../Card'
import { CARD_IDS } from '../../cardIds'
import { MENG_HU_ACTIVATION_DAMAGE_MULTIPLIER } from '../dq/MengHu'

const MULTIPLIER = [0, 1, 1.375, 1.75, 2.125, 2.5]
const FIRST_DAMAGE_DELAY = 1
const SECOND_DAMAGE_DELAY = 2

export class ShenHuoBengFa extends Card {
  declare private _damage: number

  constructor(core: Core, level: number) {
    super(core, 'passive', CARD_IDS.shenHuoBengFa, '神火迸发', level)
  }

  protected init() {
    this._damage = 65290 * MULTIPLIER[this.level]
  }

  get activationDamageBoost() {
    return this.level >= 3 ? 0.2 : 0
  }

  get activationDamageMultiplier() {
    return MENG_HU_ACTIVATION_DAMAGE_MULTIPLIER +
      this.activationDamageBoost
  }

  onActivation() {
    this.core.queue.enqueue(
      () => this.settleDamage(),
      FIRST_DAMAGE_DELAY,
    )
    if (this.level >= 5) {
      this.core.queue.enqueue(
        () => this.settleDamage(),
        SECOND_DAMAGE_DELAY,
      )
    }
  }

  private settleDamage() {
    this.core.fire.add(this._damage, 1, '神火迸发')
  }

  reset() {}
}
