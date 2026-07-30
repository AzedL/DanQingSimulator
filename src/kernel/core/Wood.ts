import type { Damage } from './Damage'

export class Wood {
  private readonly _damage: Damage
  private _boost = 0

  constructor(damage: Damage) {
    this._damage = damage
  }

  add(damage: number, count: number, ...keys: string[]) {
    const value = damage * (1 + this._damage.boost) * (1 + this._boost)
    this._damage.add(value, count, ...keys)
  }

  addBoost(boost: number) {
    this._boost += boost
  }

  removeBoost(boost: number) {
    this._boost -= boost
  }

  reset() {
    this._boost = 0
  }
}
