import type { Core } from '../core/Core'
import { type TCardIds } from '../dataBase/dataBase'
import { Card } from './Card'

export class AttributeBoost extends Card {
  private _boostValue: number
  constructor(core: Core) {
    const id: TCardIds = 'xiaoHuan'
    const key = '属性增益(海龟/小环/风筝)'
    super(core, id, key)

    const basicDamage = this._core.coreOptions.basicDamage
    const { attackPowerBoostValue, attributeBoostValue } = this._core.options
    this._boostValue = (attributeBoostValue - 1) * basicDamage * attackPowerBoostValue
  }

  action() {
    if (!this._boostValue) return
    this.settle()
  }

  settle() {
    this._core.dps.add(this._boostValue, 1, this._key)
  }

  reset() {}
}
