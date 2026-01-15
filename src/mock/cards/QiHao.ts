import type { Core } from '../core/Core'
import { dataBase, type TCardIds } from '../dataBase/dataBase'
import { CoolDownTime } from '../utils/CoolDownTime'
import { Card } from './Card'

export class QiHao extends Card {
  private _cd: CoolDownTime
  private _cdTime: number
  private _damage: number
  constructor(core: Core, _: number) {
    const id: TCardIds = 'qiHao'
    const key = '齐昊'
    const data = dataBase[id]
    super(core, id, key)

    this._damage = this._core.options.qiHaoDamage
    const cd = data.values[2]
    this._cdTime = cd
    this._cd = new CoolDownTime(cd, true)
  }

  action() {
    let iceCount = this._core.ice.getIncrement()
    if (iceCount >= this._cdTime) {
      const times = Math.floor(iceCount / this._cdTime)
      iceCount = iceCount % this._cdTime
      for (let i = 0; i < times; i++) {
        this.settle()
      }
    }

    this._cd.tick(iceCount)
    const isReady = this._cd.settle()
    if (isReady) this.settle()

    this._cd.tick()
  }

  settle() {
    const key = '玄冰风暴'
    ;[1, 2].forEach((delay) => {
      this._core.queue.enqueue(() => {
        this._core.dps.add(this._damage / 2, 10, key)
      }, delay)
    })
  }

  reset() {
    this._cd.reset()
  }
}
