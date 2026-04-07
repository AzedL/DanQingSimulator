import type { Core } from '../core/Core'
import type { TCardIds } from '../dataBase/dataBase'
import { CoolDownTime } from '../utils/CoolDownTime'
import { Card } from './Card'
import { getCooldown } from '@/domain/rules/deriveStats'

export class HanBingJian extends Card {
  private _cd: CoolDownTime
  private _cdTime: number

  constructor(core: Core, level: number) {
    const id: TCardIds = 'hanBingJian'
    const key = '寒冰剑'
    super(core, id, key)

    this._cdTime = getCooldown(id, level)
    this._cd = new CoolDownTime(this._cdTime, false, 0)
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
