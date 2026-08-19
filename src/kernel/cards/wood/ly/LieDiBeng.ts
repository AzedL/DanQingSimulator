import type { Core } from '../../../core/Core'
import { Card } from '../../Card'
import { CARD_IDS } from '../../cardIds'
import { enqueueRepeated, getCard } from '../../shared'
import type { QingWuFuSheng } from '../QingWuFuSheng'

const DAMAGE = 207708
const ECHO_DAMAGE = 10896
const DAMAGE_MULTIPLIER = [0, 1, 1.375, 1.75, 2.125, 2.5]
const ECHO_DURATION = 30

export class LieDiBeng extends Card {
  declare private _damage: number
  declare private _echoActive: boolean

  constructor(core: Core, level: number) {
    super(core, 'passive', CARD_IDS.lieDiBeng, '裂地崩', level)
  }

  protected init() {
    this._damage = DAMAGE * DAMAGE_MULTIPLIER[this.level]
    this._echoActive = false
  }

  onAttackStarted() {
    const skill = getCard<QingWuFuSheng>(
      this.core,
      CARD_IDS.qingWuFuSheng,
    )

    this.core.queue.enqueue(() => {
      this.core.wood.add(
        this._damage * (skill?.treeSkillDamageMultiplier ?? 1),
        1,
        '裂地崩',
      )
      if (this.level >= 3) {
        let echoDuration = ECHO_DURATION
        if (skill) echoDuration += skill.echoDurationBonus

        this._echoActive = true
        enqueueRepeated(this.core, echoDuration, 1, () => {
          this.settleEcho()
        })
        this.core.queue.enqueue(() => {
          this._echoActive = false
        }, echoDuration)
      }
    }, 2)
  }

  onSummonAttack(count = 1) {
    if (this.level >= 5 && this._echoActive) {
      for (let index = 0; index < count; index++) {
        this.settleEcho()
      }
    }
  }

  private settleEcho() {
    const multiplier = getCard<QingWuFuSheng>(
      this.core,
      CARD_IDS.qingWuFuSheng,
    )?.echoDamageMultiplier ?? 1
    this.core.wood.add(
      ECHO_DAMAGE * multiplier,
      1,
      '裂地崩 · 回响',
    )
  }

  reset() {
    this._echoActive = false
  }
}
