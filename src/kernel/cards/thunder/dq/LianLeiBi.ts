import type { Core } from '../../../core/Core'
import { Card } from '../../Card'
import { CARD_IDS } from '../../cardIds'

const BOOST = [0.42, 0.45, 0.48, 0.51, 0.54, 0.57, 0.6]

export class LianLeiBi extends Card {
  declare private _chainDamageMultiplier: number

  constructor(core: Core, level: number) {
    super(core, 'passive', CARD_IDS.lianLeiBi, '连雷璧', level)
  }

  protected init() {
    this._chainDamageMultiplier = 1 + BOOST[this.level]
  }

  get chainDamageMultiplier() {
    return this._chainDamageMultiplier
  }

  reset() {}
}
