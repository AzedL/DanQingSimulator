import type { Core } from '../../../core/Core'
import { Card } from '../../Card'
import { CARD_IDS } from '../../cardIds'
import { getCard } from '../../shared'
import {
  SHANG_GUAN_CE_ACTIVATION_DAMAGE_MULTIPLIER,
  type ShangGuanCe,
} from '../dq/ShangGuanCe'

const MULTIPLIER = [0, 1, 1.375, 1.75, 2.125, 2.5]

export class LinShuangHanYong extends Card {
  declare private _damage: number

  constructor(core: Core, level: number) {
    super(core, 'passive', CARD_IDS.linShuangHanYong, '凛霜寒涌', level)
  }

  protected init() {
    this._damage = 75540 * MULTIPLIER[this.level]
  }

  get activationDamageMultiplier() {
    return this.level >= 3
      ? 1.5
      : SHANG_GUAN_CE_ACTIVATION_DAMAGE_MULTIPLIER
  }

  onFreeze() {
    this.core.ice.add(this._damage, 1, '凛霜寒涌')
    if (this.level >= 5) {
      getCard<ShangGuanCe>(
        this.core,
        CARD_IDS.shangGuanCe,
      )?.addIceValue(3000)
    }
  }

  reset() {}
}
