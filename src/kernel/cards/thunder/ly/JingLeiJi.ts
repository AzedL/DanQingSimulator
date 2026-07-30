import type { Core } from '../../../core/Core'
import { Card } from '../../Card'
import { CARD_IDS } from '../../cardIds'
import { enqueueRepeated, forEachIndependentCount } from '../../shared'

const MULTIPLIER = [0, 1, 1.375, 1.75, 2.125, 2.5]

export class JingLeiJi extends Card {
  declare private _damage: number
  declare private _countPerTrigger: number

  constructor(core: Core, level: number) {
    super(core, 'passive', CARD_IDS.jingLeiJi, '惊雷戟', level)
  }

  protected init() {
    this._damage = 1816 * MULTIPLIER[this.level]
    this._countPerTrigger = this.level >= 5 ? 3 : 1
  }

  onChain(count: number) {
    const spearCount = count * this._countPerTrigger
    this.core.thunder.add(
      this._damage * spearCount,
      spearCount,
      '惊雷戟',
    )

    if (this.level < 3) return

    forEachIndependentCount(spearCount, (weight) => {
      enqueueRepeated(this.core, 16, 0.5, () => {
        this.core.thunder.add(95 * weight, weight, '惊雷戟3')
      })
    })
  }

  reset() {}
}
