import type { Core } from '../../../core/Core'
import { CooldownTime } from '../../../utils/CooldownTime'
import { Card } from '../../Card'
import { CARD_IDS } from '../../cardIds'
import { enqueueRepeated, getCard } from '../../shared'
import type { QingLiangZhu } from '../dq/QingLiangZhu'
import type { LieDiBeng } from './LieDiBeng'

const MULTIPLIER = [0, 1, 1.125, 1.25, 1.375, 1.5]

export class CangLinFuSheng extends Card {
  declare private _attackDamage: number
  declare private _stormDamage: number
  declare private _cooldown: CooldownTime

  constructor(core: Core, level: number) {
    super(core, 'active', CARD_IDS.cangLinFuSheng, '苍林浮生', level)
  }

  protected init() {
    this._attackDamage = 10022 * MULTIPLIER[this.level]
    this._stormDamage = 4513 * MULTIPLIER[this.level]
    this._cooldown = new CooldownTime(20, true)
  }

  tick() {
    if (this._cooldown.settle()) this.summon()
    this._cooldown.tick()
  }

  private summon() {
    if (this.level < 3) {
      enqueueRepeated(this.core, 6, 1.5, () => {
        this.settleAttack()
      })
      return
    }

    for (let tick = 1; tick <= 6; tick++) {
      this.core.queue.enqueue(() => {
        const count = tick === 1 ? 1 : 2
        this.core.wood.add(
          this._stormDamage * count,
          count,
          '小纸人-纸人风暴',
        )
        if (this.level >= 5) {
          getCard<QingLiangZhu>(
            this.core,
            CARD_IDS.qingLiangZhu,
          )?.addWoodValue(80 * count)
        }
      }, tick)
    }

    for (let index = 1; index <= 3; index++) {
      this.core.queue.enqueue(() => {
        this.settleAttack()
      }, 6 + index * 1.5)
    }
  }

  private settleAttack() {
    this.core.wood.add(
      this._attackDamage,
      1,
      '小纸人-攻击',
    )
    getCard<LieDiBeng>(
      this.core,
      CARD_IDS.lieDiBeng,
    )?.onSummonAttack()
  }

  reset() {
    this._cooldown.reset()
  }
}
