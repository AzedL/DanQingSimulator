import type { Core } from '../../../core/Core'
import { CooldownTime } from '../../../utils/CooldownTime'
import { Card } from '../../Card'
import { CARD_IDS } from '../../cardIds'
import { settleIceArrow } from '../shared'

const DAMAGE = [4830, 5175, 5520, 5865, 6210, 6555, 6900]

export const YAN_HONG_DEFAULT_DAMAGE = 4485

export class YanHong extends Card {
  declare private _damage: number
  declare private _cooldown: CooldownTime

  constructor(core: Core, level: number) {
    super(core, 'active', CARD_IDS.yanHong, '燕虹', level)
  }

  protected init() {
    this._damage = DAMAGE[this.level]
    this._cooldown = new CooldownTime(6, true)
  }

  get arrowDamage() {
    return this._damage
  }

  tick() {
    if (this._cooldown.settle()) {
      settleIceArrow(this.core, this._damage, 1, '冰箭-燕虹')
    }
    this._cooldown.tick()
  }

  reset() {
    this._cooldown.reset()
  }
}
