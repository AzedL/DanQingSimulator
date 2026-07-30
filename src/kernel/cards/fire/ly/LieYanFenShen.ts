import type { Core } from '../../../core/Core'
import { CooldownTime } from '../../../utils/CooldownTime'
import { Card } from '../../Card'
import { CARD_IDS } from '../../cardIds'
import { enqueueRepeated } from '../../shared'

const MULTIPLIER = [0, 1, 1.375, 1.75, 2.125, 2.5]

export class LieYanFenShen extends Card {
  declare private _damage: number
  declare private _cooldown: CooldownTime

  constructor(core: Core, level: number) {
    super(core, 'active', CARD_IDS.lieYanFenShen, '烈焰焚身', level)
  }

  protected init() {
    this._damage = 1082 * MULTIPLIER[this.level]
    this._cooldown = new CooldownTime(15)
  }

  tick() {
    if (this._cooldown.settle()) this.addLayers(3)
    this._cooldown.tick()
  }

  addLayers(layers: number) {
    for (let layer = 0; layer < layers; layer++) {
      enqueueRepeated(this.core, 12, 1, () => {
        this.core.fire.add(this._damage, 1, '烈焰焚身')
      })
    }
  }

  onExplosion() {
    if (this.level >= 3) this.addLayers(2)
  }

  onSkillDamage() {
    if (this.level >= 5) this.addLayers(2)
  }

  reset() {
    this._cooldown.reset()
  }
}
