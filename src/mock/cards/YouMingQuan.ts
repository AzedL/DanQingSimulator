import type { Core } from '../core/Core'
import type { TCardIds } from '../dataBase/dataBase'
import { CoolDownTime } from '../utils/CoolDownTime'
import { Card } from './Card'
import { getCooldown } from '@/domain/rules/deriveStats'

export class YouMingQuan extends Card {
  private _cd: CoolDownTime

  constructor(core: Core, level: number) {
    const id: TCardIds = 'youMingQuan'
    const key = '幽冥犬'
    super(core, id, key)

    this._cd = new CoolDownTime(getCooldown(id, level), true)
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
