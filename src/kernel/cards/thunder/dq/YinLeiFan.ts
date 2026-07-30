import type { Core } from '../../../core/Core'
import { CooldownTime } from '../../../utils/CooldownTime'
import { Card } from '../../Card'
import { CARD_IDS } from '../../cardIds'
import { triggerChainLightning } from '../shared'

const DAMAGE = [9660, 10350, 11040, 11730, 12420, 13110, 13800]

export class YinLeiFan extends Card {
  declare private _damage: number
  declare private _cooldown: CooldownTime

  constructor(core: Core, level: number) {
    super(core, 'active', CARD_IDS.yinLeiFan, '引雷幡', level)
  }

  protected init() {
    this._damage = DAMAGE[this.level]
    this._cooldown = new CooldownTime(12, true)
  }

  get chainDamage() {
    return this._damage
  }

  tick() {
    if (this._cooldown.settle()) triggerChainLightning(this.core)
    this._cooldown.tick()
  }

  reset() {
    this._cooldown.reset()
  }
}
