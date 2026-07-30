import type { Core } from '../../../core/Core'
import { Card } from '../../Card'
import { CARD_IDS } from '../../cardIds'
import {
  enqueueRepeated,
  forEachIndependentCount,
  getCard,
} from '../../shared'
import type { QingWuFuSheng } from '../QingWuFuSheng'
import type { LieDiBeng } from './LieDiBeng'

const MULTIPLIER = [0, 1, 1.125, 1.25, 1.375, 1.5]

export class MuYinQingLing extends Card {
  declare private _damage: number

  constructor(core: Core, level: number) {
    super(core, 'passive', CARD_IDS.muYinQingLing, '木引青灵', level)
  }

  protected init() {
    this._damage = 5992 * MULTIPLIER[this.level]
  }

  summon(count: number) {
    forEachIndependentCount(count, (weight) => {
      enqueueRepeated(this.core, 14, 2, () => {
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
      })
    })
  }

  onSkillDamageSettled() {
    if (this.level >= 5) this.summon(2)
  }

  reset() {}
}
