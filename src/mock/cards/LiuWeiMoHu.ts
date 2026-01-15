import type { Core } from '../core/Core'
import { type TCardIds } from '../dataBase/dataBase'
import { Card } from './Card'

export class LiuWeiMoHu extends Card {
  private _lock: boolean = false
  private _damage: number
  constructor(core: Core, level: number) {
    const id: TCardIds = 'liuWeiMoHu'
    const key = '六尾魔狐'
    super(core, id, key)

    this._damage = this._core.options.liuWeiDamage
  }

  action() {
    if (this._lock) return

    const count = this._core.fire.count
    if (count >= 8) this.settle()
  }

  settle() {
    this._lock = true
    const key = '爆燃'
    this._core.queue.enqueue(() => {
      const count = this._core.fire.count
      this._core.dps.add(this._damage * count, 1, key)
      this._core.fire.resetCount()
      this._lock = false
    }, 2)
  }

  reset() {
    this._lock = false
  }
}
