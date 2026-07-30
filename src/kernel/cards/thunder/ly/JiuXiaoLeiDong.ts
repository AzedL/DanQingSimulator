import type { Core } from '../../../core/Core'
import { Card } from '../../Card'
import { CARD_IDS } from '../../cardIds'
import { getCard } from '../../shared'
import type { ZiLeiHu } from '../dq/ZiLeiHu'

const MULTIPLIER = [0, 1, 1.375, 1.75, 2.125, 2.5]

export class JiuXiaoLeiDong extends Card {
  declare private _damage: number
  declare private _count: number

  constructor(core: Core, level: number) {
    super(core, 'passive', CARD_IDS.jiuXiaoLeiDong, '九霄雷动', level)
  }

  protected init() {
    this._damage = 27506 * MULTIPLIER[this.level]
    this._count = this.level >= 5 ? 4 : this.level >= 3 ? 3 : 2
  }

  onActivation() {
    this.core.queue.enqueue(() => {
      this.core.thunder.add(
        this._damage * this._count,
        this._count,
        '九霄雷动',
      )
      if (this.level >= 3) {
        getCard<ZiLeiHu>(
          this.core,
          CARD_IDS.ziLeiHu,
        )?.addThunderValue(100)
      }
    }, 2)
  }

  reset() {}
}
