import type { Core } from '../core/Core'
import { type TCardIds } from '../dataBase/dataBase'
import { Card } from './Card'

export class AttackPowerBoost extends Card {
  private _boostValue: number
  constructor(core: Core) {
    const id: TCardIds = 'zhouYiXian'
    const key = '攻击力增益(周一仙/猛虎/仙人布幡)'
    super(core, id, key)

    const basicDamage = this._core.coreOptions.basicDamage
    const { attackPowerBoostValue } = this._core.options
    this._boostValue = (attackPowerBoostValue - 1) * basicDamage
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
