import type { Core } from '../../../core/Core'
import { CooldownTime } from '../../../utils/CooldownTime'
import { handleProbability } from '../../../utils/probability'
import { Card } from '../../Card'
import { CARD_IDS } from '../../cardIds'

const COPY_PROBABILITY = [0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1]
const FURY_EFFICIENCY = [0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.2]

export class ZiDianChiWen extends Card {
  declare private _copyProbability: number
  declare private _furyEfficiency: number
  declare private _furyRefresh: CooldownTime
  declare private _furyReady: boolean

  constructor(core: Core, level: number) {
    super(core, 'active', CARD_IDS.ziDianChiWen, '紫电螭吻', level)
  }

  protected init() {
    this._copyProbability = COPY_PROBABILITY[this.level]
    this._furyEfficiency = FURY_EFFICIENCY[this.level]
    this._furyRefresh = new CooldownTime(30, true)
    this._furyReady = true
  }

  get furyEfficiency() {
    return this._furyEfficiency
  }

  copyCount(count: number) {
    return handleProbability(
      this._copyProbability,
      this.core.coreOptions.useRandom,
      count,
    )
  }

  consumeFury() {
    if (!this._furyReady) return false
    this._furyReady = false
    return true
  }

  tick() {
    if (this._furyRefresh.settle()) this._furyReady = true
    this._furyRefresh.tick()
  }

  reset() {
    this._furyRefresh.reset()
    this._furyReady = true
  }
}
