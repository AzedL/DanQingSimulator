import type { Core } from '../../../core/Core'
import { Card } from '../../Card'
import { CARD_IDS } from '../../cardIds'
import { enqueueRepeated, getCard } from '../../shared'
import type { ZiLeiHu } from '../dq/ZiLeiHu'

const MULTIPLIER = [0, 1, 1.375, 1.75, 2.125, 2.5]

export class LeiTingZhenJi extends Card {
  declare private _damage: number
  declare private _countPerTick: number

  constructor(core: Core, level: number) {
    super(core, 'passive', CARD_IDS.leiTingZhenJi, '雷霆震击', level)
  }

  protected init() {
    this._damage = 1302 * MULTIPLIER[this.level]
    this._countPerTick = this.level >= 3 ? 2 : 1
  }

  onActivation() {
    let tick = 0
    enqueueRepeated(this.core, 30, 1, () => {
      tick++
      this.core.thunder.add(
        this._damage * this._countPerTick,
        this._countPerTick,
        '雷霆震击',
      )

      if (tick === 30 && this.level >= 5) {
        this.core.thunder.add(142055, 1, '雷霆震击-爆炸')
        getCard<ZiLeiHu>(
          this.core,
          CARD_IDS.ziLeiHu,
        )?.addThunderValue(500)
      }
    })
  }

  reset() {}
}
