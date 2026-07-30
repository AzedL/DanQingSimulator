import type { Core } from '../../../core/Core'
import { CooldownTime } from '../../../utils/CooldownTime'
import { Card } from '../../Card'
import { CARD_IDS } from '../../cardIds'
import { getCard } from '../../shared'
import type { ZiDianChiWen } from '../dq/ZiDianChiWen'
import { triggerFury } from '../shared'

const MULTIPLIER = [0, 1, 1.375, 1.75, 2.125, 2.5]

export class WuLeiZhu extends Card {
  declare private _damage: number
  declare private _cooldown: CooldownTime

  constructor(core: Core, level: number) {
    super(core, 'active', CARD_IDS.wuLeiZhu, '五雷珠', level)
  }

  protected init() {
    this._damage = 10832 * MULTIPLIER[this.level]
    this._cooldown = new CooldownTime(20, true)
  }

  tick() {
    if (this._cooldown.settle()) this.trigger()
    this._cooldown.tick()
  }

  private trigger() {
    this.core.thunder.add(this._damage, 1, '五雷珠')

    if (this.level >= 3) {
      this.core.thunder.add(64900, 1, '五雷珠-爆炸')
    }

    if (this.level < 5) return

    const ziDian = getCard<ZiDianChiWen>(
      this.core,
      CARD_IDS.ziDianChiWen,
    )
    if (!ziDian) return

    triggerFury(
      this.core,
      '五雷珠-连锁闪电',
      ziDian.furyEfficiency * 0.8,
      false,
    )
  }

  reset() {
    this._cooldown.reset()
  }
}
