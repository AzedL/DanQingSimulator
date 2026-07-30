import type { Core } from '../../../core/Core'
import { handleProbability } from '../../../utils/probability'
import { Card } from '../../Card'
import { CARD_IDS } from '../../cardIds'
import { getCard } from '../../shared'
import type { XingHongJuYi } from './XingHongJuYi'

const SPEED = [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]
const PROBABILITY = [0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1]

export const SUI_SHOU_DEFAULT_BURN_SPEED_BONUS = 0

export class SuiShou extends Card {
  declare private _speed: number
  declare private _probability: number

  constructor(core: Core, level: number) {
    super(core, 'passive', CARD_IDS.suiShou, '岁兽', level)
  }

  protected init() {
    this._speed = SPEED[this.level]
    this._probability = PROBABILITY[this.level]
  }

  get burnSpeed() {
    return this._speed
  }

  onBurnDamage() {
    const count = handleProbability(
      this._probability,
      this.core.coreOptions.useRandom,
    )
    getCard<XingHongJuYi>(
      this.core,
      CARD_IDS.xingHongJuYi,
    )?.addBurn(count)
  }

  reset() {}
}
