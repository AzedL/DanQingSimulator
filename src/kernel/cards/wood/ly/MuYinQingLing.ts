import type { Core } from '../../../core/Core'
import { Card } from '../../Card'
import { CARD_IDS } from '../../cardIds'
import {
  forEachIndependentCount,
  getCard,
} from '../../shared'
import type { QingWuFuSheng } from '../QingWuFuSheng'
import type { LieDiBeng } from './LieDiBeng'

const MULTIPLIER = [0, 1, 1.125, 1.25, 1.375, 1.5]
const ACTIVATION_COOLDOWN = 10

export class MuYinQingLing extends Card {
  declare private _damage: number
  declare private _activationReady: boolean

  constructor(core: Core, level: number) {
    super(core, 'passive', CARD_IDS.muYinQingLing, '木引青灵', level)
  }

  protected init() {
    this._damage = 5992 * MULTIPLIER[this.level]
    this._activationReady = true
  }

  onActivation() {
    if (!this._activationReady) return

    this._activationReady = false
    this.summon(1)
    this.core.queue.enqueue(() => {
      this._activationReady = true
    }, ACTIVATION_COOLDOWN)
  }

  summon(count: number) {
    const skill = getCard<QingWuFuSheng>(
      this.core,
      CARD_IDS.qingWuFuSheng,
    )
    forEachIndependentCount(count, (weight) => {
      skill?.beginSummon('spirit')
      const attackCount = 14 + (skill?.summonAttackBonus ?? 0) * 2
      for (let index = 0; index < attackCount; index++) {
        this.core.queue.enqueue(() => {
          this.core.wood.add(
            this._damage * weight,
            weight,
            '木引青灵',
          )
          if (this.level >= 3) {
            getCard<QingWuFuSheng>(
              this.core,
              CARD_IDS.qingWuFuSheng,
            )?.reduceCooldown(1)
          }
          getCard<LieDiBeng>(
            this.core,
            CARD_IDS.lieDiBeng,
          )?.onSummonAttack()
        }, 1 + index * 2)
      }
      skill?.expireSummon(
        'spirit',
        30 * skill.summonDurationMultiplier,
      )
    })
  }

  onSkillCastCompleted() {
    if (this.level >= 5) this.summon(2)
  }

  reset() {
    this._activationReady = true
  }
}
