import type { Core } from '../../../core/Core'
import { StackedEffect } from '../../../utils/StackedEffect'
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
  declare private _activation: StackedEffect
  declare private _bloom: StackedEffect

  constructor(core: Core, level: number) {
    super(core, 'passive', CARD_IDS.qingLiangZhu, '清凉珠', level)
  }

  protected init() {
    this._pulseValue = PULSE_VALUE[this.level]
    this._woodValue = 0
    this._activation = new StackedEffect(this.core.queue, {
      interval: 1,
      duration: 9,
      onTick: (layers) => {
        const multiplier = this.activationDamageMultiplier
        this.core.wood.add(
          24916 * multiplier * layers,
          1,
          '苍木激化',
        )
      },
    })
    this._bloom = new StackedEffect(this.core.queue, {
      interval: 3,
      duration: 9,
      onTick: (layers) => {
        const plague = getCard<FuMuZhangFeng>(
          this.core,
          CARD_IDS.fuMuZhangFeng,
        )
        const multiplier = this.activationDamageMultiplier
        this.core.wood.add(
          72108 * multiplier * layers,
          1,
          '苍木激化 · 绽放',
        )
        plague?.onBloom(layers)
      },
    })
  }

  get woodValue() {
    return this._woodValue
  }

  private get activationDamageMultiplier() {
    return getCard<FuMuZhangFeng>(
      this.core,
      CARD_IDS.fuMuZhangFeng,
    )?.activationDamageMultiplier ?? FU_MU_ACTIVATION_DAMAGE_MULTIPLIER
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
    getCard<MuYinQingLing>(
      this.core,
      CARD_IDS.muYinQingLing,
    )?.summon(1)

    this._activation.add()
    this._bloom.add()
  }

  reset() {
    this._woodValue = 0
    this._activation.reset()
    this._bloom.reset()
  }
}
