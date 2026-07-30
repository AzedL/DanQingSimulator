import type { Core } from '../../../core/Core'
import { Card } from '../../Card'
import { CARD_IDS } from '../../cardIds'

const BOOST = [0.56, 0.6, 0.64, 0.68, 0.72, 0.76, 0.8]

export const LIN_FENG_PULSE_DAMAGE_MULTIPLIER = 1

export class LinFeng extends Card {
  declare private _pulseDamageMultiplier: number

  constructor(core: Core, level: number) {
    super(core, 'passive', CARD_IDS.linFeng, '林峰', level)
  }

  protected init() {
    this._pulseDamageMultiplier = 1 + BOOST[this.level]
  }

  get pulseDamageMultiplier() {
    return this._pulseDamageMultiplier
  }

  reset() {}
}
