import type { Core } from '../../../core/Core'
import { Card } from '../../Card'
import { CARD_IDS } from '../../cardIds'
import { getCard } from '../../shared'
import {
  FU_MU_ACTIVATION_DAMAGE_MULTIPLIER,
  type FuMuZhangFeng,
} from '../ly/FuMuZhangFeng'
import type { MuYinQingLing } from '../ly/MuYinQingLing'

const PULSE_VALUE = [280, 300, 320, 340, 360, 380, 400]

export class QingLiangZhu extends Card {
  declare private _pulseValue: number
  declare private _woodValue: number

  constructor(core: Core, level: number) {
    super(core, 'passive', CARD_IDS.qingLiangZhu, '清凉珠', level)
  }

  protected init() {
    this._pulseValue = PULSE_VALUE[this.level]
    this._woodValue = 0
  }

  get woodValue() {
    return this._woodValue
  }

  onPulse() {
    this.addWoodValue(this._pulseValue)
  }

  addWoodValue(value: number) {
    this._woodValue += value

    while (this._woodValue >= 10000) {
      this._woodValue -= 10000
      this.activate()
    }
  }

  private activate() {
    const plague = getCard<FuMuZhangFeng>(
      this.core,
      CARD_IDS.fuMuZhangFeng,
    )
    const multiplier =
      plague?.activationDamageMultiplier ??
      FU_MU_ACTIVATION_DAMAGE_MULTIPLIER

    getCard<MuYinQingLing>(
      this.core,
      CARD_IDS.muYinQingLing,
    )?.summon(1)

    for (let tick = 1; tick <= 9; tick++) {
      this.core.queue.enqueue(() => {
        this.core.wood.add(
          24916 * multiplier,
          1,
          '苍木激化',
        )

        if (tick % 3 === 0) {
          this.core.wood.add(
            72108 * multiplier,
            1,
            '苍木激化 · 绽放',
          )
          plague?.onBloom()
        }
      }, tick)
    }
  }

  reset() {
    this._woodValue = 0
  }
}
