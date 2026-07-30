import type { Core } from '../../../core/Core'
import { Card } from '../../Card'
import { CARD_IDS } from '../../cardIds'
import { triggerPulse } from '../shared'

const INTERVAL_REDUCTION = [2, 2.5, 3, 3.5, 4, 4.5, 5]
const PULSE_EFFICIENCY = [0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1]

export const LIU_HE_JING_FAN_INTERVAL_REDUCTION = 0

export class LiuHeJing extends Card {
  declare private _fanIntervalReduction: number
  declare private _pulseEfficiency: number

  constructor(core: Core, level: number) {
    super(core, 'passive', CARD_IDS.liuHeJing, '六合镜', level)
  }

  protected init() {
    this._fanIntervalReduction = INTERVAL_REDUCTION[this.level]
    this._pulseEfficiency = PULSE_EFFICIENCY[this.level]
  }

  get fanIntervalReduction() {
    return this._fanIntervalReduction
  }

  onPulse() {
    for (let delay = 1; delay <= 2; delay++) {
      this.core.queue.enqueue(() => {
        triggerPulse(this.core, {
          key: '脉冲-六合镜',
          efficiency: this._pulseEfficiency,
          allowLiuHeJing: false,
        })
      }, delay)
    }
  }

  reset() {}
}
