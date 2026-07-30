import type { Core } from '../../../core/Core'
import { CooldownTime } from '../../../utils/CooldownTime'
import { Card } from '../../Card'
import { CARD_IDS } from '../../cardIds'
import { summonFrostElement } from '../shared'

const DAMAGE = [128000, 137340, 146680, 156020, 165360, 174700, 184040]

export const QI_HAO_DEFAULT_DAMAGE = 118660
export const QI_HAO_COOLDOWN_REDUCTION_PER_ARROW = 2

export class QiHao extends Card {
  declare private _damage: number
  declare private _cooldown: CooldownTime

  constructor(core: Core, level: number) {
    super(core, 'active', CARD_IDS.qiHao, '齐昊', level)
  }

  protected init() {
    this._damage = DAMAGE[this.level]
    this._cooldown = new CooldownTime(60, true)
  }

  get stormDamage() {
    return this._damage
  }

  onIceArrow(count: number) {
    this._cooldown.tick(count * QI_HAO_COOLDOWN_REDUCTION_PER_ARROW)
  }

  tick() {
    if (this._cooldown.settle()) {
      summonFrostElement(this.core, this._damage, '玄冰风暴')
    }
    this._cooldown.tick()
  }

  reset() {
    this._cooldown.reset()
  }
}
