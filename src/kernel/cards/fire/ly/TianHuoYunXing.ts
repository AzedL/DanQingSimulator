import type { Core } from '../../../core/Core'
import { CooldownTime } from '../../../utils/CooldownTime'
import { Card } from '../../Card'
import { CARD_IDS } from '../../cardIds'
import type { MengHu } from '../dq/MengHu'
import { enqueueRepeated, getCard } from '../../shared'

const MULTIPLIER = [0, 1, 1.375, 1.75, 2.125, 2.5]

export class TianHuoYunXing extends Card {
  declare private _damage: number
  declare private _cooldown: CooldownTime

  constructor(core: Core, level: number) {
    super(core, 'active', CARD_IDS.tianHuoYunXing, '天火陨星', level)
  }

  protected init() {
    this._damage = 26594 * MULTIPLIER[this.level]
    this._cooldown = new CooldownTime(20, true)
  }

  tick() {
    if (this._cooldown.settle()) this.trigger()
    this._cooldown.tick()
  }

  onActivation() {
    if (this.level >= 5) this.trigger()
  }

  private trigger() {
    this.core.fire.add(this._damage, 1, '天火陨星')
    getCard<MengHu>(this.core, CARD_IDS.mengHu)?.addFireValue(2000)

    if (this.level < 3) return

    enqueueRepeated(this.core, 5, 2, () => {
      this.core.fire.add(5342, 1, '天火陨星3')
      getCard<MengHu>(this.core, CARD_IDS.mengHu)?.addFireValue(200)
    })
  }

  reset() {
    this._cooldown.reset()
  }
}
