import type { Core } from '../../../core/Core'
import { StackedBuffState } from '../../../utils/StackedBuffState'
import { Card } from '../../Card'
import { CARD_IDS } from '../../cardIds'
import { getCard } from '../../shared'
import type { QingLiangZhu } from '../dq/QingLiangZhu'

const DAMAGE_BOOST = [0, 0.4, 0.55, 0.7, 0.85, 1]

export interface PulseState {
  damageMultiplier: number
  triggerDice: boolean
}

export class ShenMuTouLingYun extends Card {
  declare private _damageBoost: number
  declare private _maxLayers: number
  declare private _buff: StackedBuffState
  declare private _pulseCount: number

  constructor(core: Core, level: number) {
    super(core, 'passive', CARD_IDS.shenMuTou_ly, '神木骰', level)
  }

  protected init() {
    this._damageBoost = DAMAGE_BOOST[this.level]
    this._maxLayers = this.level >= 3 ? 6 : 3
    this._buff = new StackedBuffState(
      this.core.coreOptions.useRandom,
    )
    this._pulseCount = 0
  }

  nextPulse() {
    this._pulseCount++
    return {
      damageMultiplier:
        1 + this._damageBoost * this._buff.consume(),
      triggerDice: this._pulseCount === 6,
    }
  }

  afterPulse(state: PulseState) {
    if (this.level >= 3) {
      getCard<QingLiangZhu>(
        this.core,
        CARD_IDS.qingLiangZhu,
      )?.addWoodValue(200)
    }

    if (!state.triggerDice) return

    this._pulseCount = 0
    this._buff.addUniform(1, this._maxLayers)
    if (this.level >= 5) this.core.wood.add(114514, 1, '神木骰')
  }

  triggerFixed() {
    this._buff.addFixed(this._maxLayers)
    if (this.level >= 5) this.core.wood.add(114514, 1, '神木骰')
  }

  reset() {
    this._buff.reset()
    this._pulseCount = 0
  }
}
