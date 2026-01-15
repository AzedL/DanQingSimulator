import type { Core } from '../core/Core'
import { dataBase, type TCardIds } from '../dataBase/dataBase'
import { CoolDownTime } from '../utils/CoolDownTime'
import { Card } from './Card'

export class WenMin extends Card {
  private _cd: CoolDownTime
  constructor(core: Core, level: number) {
    const id: TCardIds = 'wenMin'
    const key = '文敏'
    const data = dataBase[id]
    super(core, id, key)

    const [a, b] = data.values
    const cd = a + b * level
    this._cd = new CoolDownTime(cd)
  }

  action() {
    const isReady = this._cd.settle()
    if (isReady) this.settle()

    this._cd.tick()
  }

  settle() {
    this._core.ice.add(3, this._key)
  }

  reset() {
    this._cd.reset()
  }
}
