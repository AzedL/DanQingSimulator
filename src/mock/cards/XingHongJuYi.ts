import type { Core } from '../core/Core'
import { dataBase, type TCardIds } from '../dataBase/dataBase'
import { CoolDownTime } from '../utils/CoolDownTime'
import { Card } from './Card'

export class XingHongJuYi extends Card {
  private _cd: CoolDownTime
  constructor(core: Core, level: number) {
    const id: TCardIds = 'xingHongJuYi'
    const key = '猩红巨蚁'
    const data = dataBase[id]
    super(core, id, key)

    const cd = data.values[2]
    this._cd = new CoolDownTime(cd, true)
  }

  action() {
    const isReady = this._cd.settle()
    if (isReady) this.settle()

    this._cd.tick()
  }

  settle() {
    this._core.fire.add(1)
  }

  reset() {
    this._cd.reset()
  }
}
