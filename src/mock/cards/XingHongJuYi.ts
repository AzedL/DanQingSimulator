import type { Core } from '../core/Core'
import type { TCardIds } from '../dataBase/dataBase'
import { CoolDownTime } from '../utils/CoolDownTime'
import { Card } from './Card'
import { getCooldown } from '@/domain/rules/deriveStats'

export class XingHongJuYi extends Card {
  private _cd: CoolDownTime

  constructor(core: Core, _: number) {
    const id: TCardIds = 'xingHongJuYi'
    const key = '猩红巨蚁'
    super(core, id, key)

    this._cd = new CoolDownTime(getCooldown(id, 0), true)
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
