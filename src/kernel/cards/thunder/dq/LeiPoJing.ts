import type { Core } from '../../../core/Core'
import { StackedEffect } from '../../../utils/StackedEffect'
import { Card } from '../../Card'
import { CARD_IDS } from '../../cardIds'

const TOTAL_DAMAGE = [16100, 17252, 18404, 19556, 20708, 21860, 23012]

export class LeiPoJing extends Card {
  declare private _damagePerHit: number
  declare private _effect: StackedEffect

  constructor(core: Core, level: number) {
    super(core, 'passive', CARD_IDS.leiPoJing, '雷魄晶', level)
  }

  protected init() {
    this._damagePerHit = TOTAL_DAMAGE[this.level] / 4
    this._effect = new StackedEffect(this.core.queue, {
      interval: 2,
      duration: 8,
      onTick: (layers) => {
        this.core.thunder.add(
          this._damagePerHit * layers,
          1,
          '静电过载',
        )
      },
    })
  }

  onChain(count: number) {
    this._effect.add(count)
  }

  reset() {
    this._effect.reset()
  }
}
