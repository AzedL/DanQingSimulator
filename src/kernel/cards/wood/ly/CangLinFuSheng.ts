import type { Core } from '../../../core/Core'
import { CooldownTime } from '../../../utils/CooldownTime'
import { Card } from '../../Card'
import { CARD_IDS } from '../../cardIds'
import { getCard } from '../../shared'
import type { QingLiangZhu } from '../dq/QingLiangZhu'
import type { LieDiBeng } from './LieDiBeng'
import type { QingWuFuSheng } from '../QingWuFuSheng'

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
    this._stormDamage = 9026 * MULTIPLIER[this.level]
    this._cooldown = new CooldownTime(20, true)
  }

  tick() {
    if (this._cooldown.settle()) this.summon()
    this._cooldown.tick()
  }

  private summon() {
    const skill = getCard<QingWuFuSheng>(
      this.core,
      CARD_IDS.qingWuFuSheng,
    )
    skill?.beginSummon('paper')
    const attackBonus = skill?.summonAttackBonus ?? 0
    if (this.level < 3) {
      for (let index = 0; index < 6 + attackBonus * 2; index++) {
        this.core.queue.enqueue(
          () => this.settleAttack(),
          1 + index * 1.5,
        )
      }
      skill?.expireSummon(
        'paper',
        10 * skill.summonDurationMultiplier,
      )
      return
    }

    for (let tick = 1; tick <= 6; tick++) {
      this.core.queue.enqueue(() => {
        const count = tick === 1 ? 1 : 2
        this.core.wood.add(
          this._stormDamage * count,
          count,
          '小纸人-旋风收割',
        )
        if (this.level >= 5) {
          getCard<QingLiangZhu>(
            this.core,
            CARD_IDS.qingLiangZhu,
          )?.addWoodValue(80 * count)
        }
      }, tick)
    }

    for (let index = 0; index < 3 + attackBonus; index++) {
      this.core.queue.enqueue(() => {
        this.settleAttack()
      }, 7 + index * 1.5)
    }
    skill?.expireSummon(
      'paper',
      10 * skill.summonDurationMultiplier,
    )
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
