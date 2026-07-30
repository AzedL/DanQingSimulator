import type { Core } from '../../../core/Core'
import { DiscreteState } from '../../../utils/probability'
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
  declare private _states: DiscreteState<PulseState>

  constructor(core: Core, level: number) {
    super(core, 'passive', CARD_IDS.shenMuTou_ly, '神木骰', level)
  }

  protected init() {
    this._damageBoost = DAMAGE_BOOST[this.level]
    this._maxLayers = this.level >= 3 ? 6 : 3
    this._states = this.createStates()
  }

  private createStates() {
    let firstCycle = true

    return new DiscreteState<PulseState>(() => {
      let probabilities: number[]

      if (firstCycle) {
        probabilities = Array(6).fill(0)
        firstCycle = false
      } else if (this.core.coreOptions.useRandom) {
        const layers =
          Math.floor(Math.random() * this._maxLayers) + 1
        probabilities = Array.from(
          { length: 6 },
          (_, index) => +(index < layers),
        )
      } else {
        probabilities = Array.from(
          { length: 6 },
          (_, index) =>
            Math.max(this._maxLayers - index, 0) /
            this._maxLayers,
        )
      }

      return probabilities.map((probability, index) => ({
        damageMultiplier: 1 + this._damageBoost * probability,
        triggerDice: index === 5,
      }))
    })
  }

  nextPulse() {
    return this._states.next()
  }

  afterPulse(state: PulseState) {
    if (this.level >= 3) {
      getCard<QingLiangZhu>(
        this.core,
        CARD_IDS.qingLiangZhu,
      )?.addWoodValue(200)
    }

    if (state.triggerDice && this.level >= 5) {
      this.core.wood.add(111451, 1, '神木骰')
    }
  }

  reset() {
    this._states = this.createStates()
  }
}
