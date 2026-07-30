import type { Core } from '../../../core/Core'
import { Card } from '../../Card'
import { CARD_IDS } from '../../cardIds'
import type { MengHu } from '../dq/MengHu'
import { enqueueRepeated, getCard } from '../../shared'

const MULTIPLIER = [0, 1, 1.375, 1.75, 2.125, 2.5]

export class LieHuoLiaoYuan extends Card {
  declare private _damage: number

  constructor(core: Core, level: number) {
    super(core, 'passive', CARD_IDS.lieHuoLiaoYuan, '烈火燎原', level)
  }

  protected init() {
    this._damage = 29308 * MULTIPLIER[this.level]
  }

  onSkillStart() {
    if (this.level < 5) return

    this.core.damage.addBoost(0.33)
    this.core.queue.enqueue(() => {
      this.core.damage.removeBoost(0.33)
    }, 15)
  }

  onSkillEnd() {
    enqueueRepeated(this.core, 8, 1, () => {
      this.core.fire.add(this._damage, 1, '烈火燎原')
      if (this.level >= 3) {
        getCard<MengHu>(this.core, CARD_IDS.mengHu)?.addFireValue(1500)
      }
    })
  }

  reset() {}
}
