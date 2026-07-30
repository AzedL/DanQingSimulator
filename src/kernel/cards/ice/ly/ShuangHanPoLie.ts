import type { Core } from '../../../core/Core'
import { Card } from '../../Card'
import { CARD_IDS } from '../../cardIds'
import { enqueueRepeated, getCard } from '../../shared'
import { QI_HAO_DEFAULT_DAMAGE, type QiHao } from '../dq/QiHao'
import { summonFrostElement } from '../shared'

const MULTIPLIER = [0, 1, 1.375, 1.75, 2.125, 2.5]

export class ShuangHanPoLie extends Card {
  declare private _damage: number

  constructor(core: Core, level: number) {
    super(core, 'passive', CARD_IDS.shuangHanPoLie, '霜寒破裂', level)
  }

  protected init() {
    this._damage = 60632 * MULTIPLIER[this.level]
  }

  onFrostElement() {
    this.core.ice.add(this._damage, 1, '霜寒破裂')

    if (this.level >= 3) {
      enqueueRepeated(this.core, 3, 2, () => {
        this.core.ice.add(76692 / 3, 1, '霜寒破裂3')
      })
    }
  }

  onSkillCast() {
    if (this.level < 5) return

    const damage =
      getCard<QiHao>(this.core, CARD_IDS.qiHao)?.stormDamage ??
      QI_HAO_DEFAULT_DAMAGE
    summonFrostElement(
      this.core,
      damage,
      '玄冰风暴-霜寒破裂',
    )
  }

  reset() {}
}
