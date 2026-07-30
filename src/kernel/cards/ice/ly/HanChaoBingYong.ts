import type { Core } from '../../../core/Core'
import { CooldownTime } from '../../../utils/CooldownTime'
import { Card } from '../../Card'
import { CARD_IDS } from '../../cardIds'
import { getCard } from '../../shared'
import type { ShangGuanCe } from '../dq/ShangGuanCe'

const MULTIPLIER = [0, 1, 1.375, 1.75, 2.125, 2.5]

export class HanChaoBingYong extends Card {
  declare private _damage: number
  declare private _cooldown: CooldownTime

  constructor(core: Core, level: number) {
    super(core, 'active', CARD_IDS.hanChaoBingYong, '寒潮冰涌', level)
  }

  protected init() {
    this._damage = 38144 * MULTIPLIER[this.level]
    this._cooldown = new CooldownTime(this.level >= 3 ? 20 : 30, true)
  }

  tick() {
    if (this._cooldown.settle()) this.trigger()
    this._cooldown.tick()
  }

  onSkillDamageGroup() {
    if (this.level >= 5) this.trigger()
  }

  private trigger() {
    this.core.ice.add(this._damage, 1, '寒潮冰涌')
    if (this.level >= 3) {
      getCard<ShangGuanCe>(
        this.core,
        CARD_IDS.shangGuanCe,
      )?.addIceValue(2000)
    }
  }

  reset() {
    this._cooldown.reset()
  }
}
