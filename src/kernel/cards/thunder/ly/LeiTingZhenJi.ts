import type { Core } from '../../../core/Core'
import { RefreshablePeriodicEffect } from '../../../utils/RefreshablePeriodicEffect'
import { Card } from '../../Card'
import { CARD_IDS } from '../../cardIds'
import { getCard } from '../../shared'
import type { ZiXiaoHu } from '../dq/ZiXiaoHu'

const MULTIPLIER = [0, 1, 1.375, 1.75, 2.125, 2.5]

export class LeiTingZhenJi extends Card {
  declare private _damage: number
  declare private _countPerTick: number
  declare private _activation: RefreshablePeriodicEffect

  constructor(core: Core, level: number) {
    super(core, 'passive', CARD_IDS.leiTingZhenJi, '雷霆震击', level)
  }

  protected init() {
    this._damage = 1302 * MULTIPLIER[this.level]
    this._countPerTick = this.level >= 3 ? 2 : 1
    this._activation = new RefreshablePeriodicEffect(
      this.core.queue,
      {
        onTick: () => this.settleDamage(),
        onEnd: () => this.explode(),
      },
    )
  }

  onActivation() {
    const coveredRemainingTicks = this._activation.refresh(1, 30)
    if (coveredRemainingTicks !== undefined) this.explode()
  }

  private settleDamage() {
    this.core.thunder.add(
      this._damage * this._countPerTick,
      this._countPerTick,
      '雷霆震击',
    )
  }

  private explode() {
    if (this.level < 5) return

    this.core.thunder.add(142055, 1, '雷霆震击-爆炸')
    getCard<ZiXiaoHu>(
      this.core,
      CARD_IDS.ziXiaoHu,
    )?.addThunderValue(500)
  }

  reset() {
    this._activation.reset()
  }
}
