import type { Core } from '../../../core/Core'
import { Card } from '../../Card'
import { CARD_IDS } from '../../cardIds'
import { getCard } from '../../shared'
import type { QingLiangZhu } from '../dq/QingLiangZhu'

const MULTIPLIER = [0, 1, 1.375, 1.75, 2.125, 2.5]

export const FU_MU_ACTIVATION_DAMAGE_MULTIPLIER = 1

export class FuMuZhangFeng extends Card {
  declare private _damage: number
  declare private _activationDamageMultiplier: number

  constructor(core: Core, level: number) {
    super(core, 'passive', CARD_IDS.fuMuZhangFeng, '腐木瘴风', level)
  }

  protected init() {
    this._damage = 25042 * MULTIPLIER[this.level]
    this._activationDamageMultiplier =
      this.level >= 3 ? 1.4 : 1
  }

  get activationDamageMultiplier() {
    return this._activationDamageMultiplier
  }

  onPulse(count: number) {
    if (!count) return
    this.settleDamage(count)
  }

  onBloom() {
    this.settleDamage(1)
  }

  private settleDamage(count: number) {
    this.core.wood.add(
      this._damage * this._activationDamageMultiplier * count,
      count,
      '腐木瘴风',
    )
  }

  onSkillDamageSettled() {
    if (this.level < 5) return
    getCard<QingLiangZhu>(
      this.core,
      CARD_IDS.qingLiangZhu,
    )?.addWoodValue(10000)
  }

  reset() {}
}
