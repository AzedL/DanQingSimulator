import type { Core } from '../core/Core'
import { dataBase, type TCardIds } from '../dataBase/dataBase'
import { CoolDownTime } from '../utils/CoolDownTime'
import { Card } from './Card'

export class HanBingJian extends Card {
  private _cd: CoolDownTime
  private _cdTime: number
  constructor(core: Core, level: number) {
    const id: TCardIds = 'hanBingJian'
    const key = '寒冰剑'
    const data = dataBase[id]
    super(core, id, key)

    const [a, b] = data.values
    const cd = a + b * level
    this._cdTime = cd
    this._cd = new CoolDownTime(cd, false, 0)
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
    this._core.pulse.add(1, this._key)
  }

  reset() {
    this._cd.reset()
  }
}
