import type { Core } from '../../../core/Core'
import { CooldownTime } from '../../../utils/CooldownTime'
import { StackedEffect } from '../../../utils/StackedEffect'
import { Card } from '../../Card'
import { CARD_IDS } from '../../cardIds'
import { triggerPulse } from '../shared'

const TOTAL_DAMAGE = [12005, 12865, 13725, 14585, 15445, 16305, 17165]

export class ShenMuTouDanQing extends Card {
  declare private _damagePerHit: number
  declare private _cooldown: CooldownTime
  declare private _initialPulseCount: number
  declare private _effect: StackedEffect

  constructor(core: Core, level: number) {
    super(core, 'active', CARD_IDS.shenMuTou_dq, '神木骰', level)
  }

  protected init() {
    this._damagePerHit = TOTAL_DAMAGE[this.level] / 5
    this._cooldown = new CooldownTime(3, true)
    this._initialPulseCount = 0
    this._effect = new StackedEffect(this.core.queue, {
      interval: 2,
      duration: 10,
      onTick: (layers) => {
        this.core.wood.add(
          this._damagePerHit * layers,
          1,
          '震荡',
        )
      },
    })
  }

  tick() {
    if (
      this._initialPulseCount < 3 &&
      this._cooldown.settle()
    ) {
      this._initialPulseCount++
      triggerPulse(this.core, { key: '脉冲-神木骰' })
    }

    if (this._initialPulseCount < 3) this._cooldown.tick()
  }

  onPulse() {
    this._effect.add()
  }

  reset() {
    this._cooldown.reset()
    this._initialPulseCount = 0
    this._effect.reset()
  }
}
