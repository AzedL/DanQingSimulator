import type { Core } from '../../../core/Core'
import { CooldownTime } from '../../../utils/CooldownTime'
import { Card } from '../../Card'
import { CARD_IDS } from '../../cardIds'
import { getCard } from '../../shared'
import {
  LIU_HE_JING_FAN_INTERVAL_REDUCTION,
  type LiuHeJing,
} from './LiuHeJing'
import { triggerPulse } from '../shared'

const DAMAGE = [9792, 10492, 11192, 11892, 12592, 13292, 13992]

export const ZHE_SHAN_INTERVAL = 15

export class ZheShan extends Card {
  declare private _damage: number
  declare private _cooldown: CooldownTime | undefined

  constructor(core: Core, level: number) {
    super(core, 'active', CARD_IDS.zheShan, '折扇', level)
  }

  protected init() {
    this._damage = DAMAGE[this.level]
    this._cooldown = undefined
  }

  get pulseDamage() {
    return this._damage
  }

  tick() {
    if (!this._cooldown) {
      const reduction =
        getCard<LiuHeJing>(this.core, CARD_IDS.liuHeJing)
          ?.fanIntervalReduction ??
        LIU_HE_JING_FAN_INTERVAL_REDUCTION
      this._cooldown = new CooldownTime(
        ZHE_SHAN_INTERVAL - reduction,
      )
    }

    if (this._cooldown.settle()) triggerPulse(this.core)
    this._cooldown.tick()
  }

  reset() {
    this._cooldown = undefined
  }
}
