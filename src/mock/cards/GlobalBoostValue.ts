import type { Core } from '../core/Core'
import { type TCardIds } from '../dataBase/dataBase'
import { Card } from './Card'

export class GlobalBoost extends Card {
  private _boostValue: number
  constructor(core: Core) {
    const id: TCardIds = 'xueDiXiong'
    const key = '雪地熊'
    super(core, id, key)

    const basicDamage = this._core.coreOptions.basicDamage
    const { attackPowerBoostValue, attributeBoostValue, globalBoostValue } = this._core.options
    this._boostValue = attackPowerBoostValue * attributeBoostValue * basicDamage * (globalBoostValue / 100)
  }

  action() {
    if (!this._boostValue) return
    this.settle()
  }

  settle() {
    const count = this._core.ice.getIncrementInTime(10)
    this._core.dps.add(this._boostValue * count, 1, this._key)
  }

  reset() {}
}
