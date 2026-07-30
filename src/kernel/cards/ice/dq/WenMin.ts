import type { Core } from '../../../core/Core'
import { CooldownTime } from '../../../utils/CooldownTime'
import { Card } from '../../Card'
import { CARD_IDS } from '../../cardIds'
import { getCard } from '../../shared'
import { settleIceArrow } from '../shared'
import { YAN_HONG_DEFAULT_DAMAGE, type YanHong } from './YanHong'

const DAMAGE_BOOST = [0.28, 0.3, 0.32, 0.34, 0.36, 0.38, 0.4]
const COOLDOWN = [16, 15, 14, 13, 12, 11, 10]

export class WenMin extends Card {
  declare private _arrowDamageMultiplier: number
  declare private _cooldown: CooldownTime

  constructor(core: Core, level: number) {
    super(core, 'active', CARD_IDS.wenMin, '文敏', level)
  }

  protected init() {
    this._arrowDamageMultiplier = 1 + DAMAGE_BOOST[this.level]
    this._cooldown = new CooldownTime(COOLDOWN[this.level])
  }

  get arrowDamageMultiplier() {
    return this._arrowDamageMultiplier
  }

  tick() {
    if (this._cooldown.settle()) {
      const damage =
        getCard<YanHong>(this.core, CARD_IDS.yanHong)?.arrowDamage ??
        YAN_HONG_DEFAULT_DAMAGE
      settleIceArrow(this.core, damage, 3, '冰箭-文敏')
    }
    this._cooldown.tick()
  }

  reset() {
    this._cooldown.reset()
  }
}
