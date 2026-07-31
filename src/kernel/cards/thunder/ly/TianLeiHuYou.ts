import type { Core } from '../../../core/Core'
import { Card } from '../../Card'
import { CARD_IDS } from '../../cardIds'
import { enqueueRepeated } from '../../shared'

const CHAIN_BOOST = [0, 0.08, 0.16, 0.24, 0.32, 0.4]
const DAMAGE_BOOST = 0.7
const DURATION = 10

export class TianLeiHuYou extends Card {
  declare private _active: boolean
  declare private _chainBoost: number

  constructor(core: Core, level: number) {
    super(core, 'passive', CARD_IDS.tianLeiHuYou, '天雷护佑', level)
  }

  protected init() {
    this._active = false
    this._chainBoost = CHAIN_BOOST[this.level]
  }

  get chainDamageMultiplier() {
    return this._active ? 1 + this._chainBoost : 1
  }

  onSkillDamage() {
    this._active = true

    if (this.level >= 3) {
      enqueueRepeated(this.core, DURATION, 1, () => {
        this.core.damage.add(
          this.core.coreOptions.burstDps * 0.05,
          1,
          '本体伤害增幅',
        )
      })
    }

    if (this.level >= 5) {
      this.core.damage.addBoost(DAMAGE_BOOST)
    }

    this.core.queue.enqueue(() => {
      this._active = false
      if (this.level >= 5) {
        this.core.damage.removeBoost(DAMAGE_BOOST)
      }
    }, DURATION)
  }

  reset() {
    this._active = false
  }
}
