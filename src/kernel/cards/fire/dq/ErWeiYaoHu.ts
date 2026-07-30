import type { Core } from '../../../core/Core'
import { Card } from '../../Card'
import { CARD_IDS } from '../../cardIds'

const DAMAGE = [3696, 3960, 4224, 4488, 4752, 5016, 5280]

export class ErWeiYaoHu extends Card {
  declare private _damage: number

  constructor(core: Core, level: number) {
    super(core, 'passive', CARD_IDS.erWeiYaoHu, '二尾妖狐', level)
  }

  protected init() {
    this._damage = DAMAGE[this.level]
  }

  onBurnAttempt(count: number) {
    if (!count) return
    this.core.fire.add(this._damage * count, count, '引燃')
  }

  reset() {}
}
