import type { Core } from '../../../core/Core'
import { Card } from '../../Card'
import { CARD_IDS } from '../../cardIds'
import { enqueueRepeated, forEachIndependentCount } from '../../shared'

const TOTAL_DAMAGE = [16100, 17252, 18404, 19556, 20708, 21860, 23012]

export class LeiPoJing extends Card {
  declare private _damagePerHit: number

  constructor(core: Core, level: number) {
    super(core, 'passive', CARD_IDS.leiPoJing, '雷魄晶', level)
  }

  protected init() {
    this._damagePerHit = TOTAL_DAMAGE[this.level] / 4
  }

  onChain(count: number) {
    forEachIndependentCount(count, (weight) => {
      enqueueRepeated(this.core, 4, 2, () => {
        this.core.thunder.add(
          this._damagePerHit * weight,
          weight,
          '静电过载',
        )
      })
    })
  }

  reset() {}
}
