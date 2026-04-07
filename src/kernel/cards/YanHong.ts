import type { Core } from '../core/Core'
import type { CardId } from '@/domain/cards/cardIds'
import { CoolDownTime } from '../utils/CoolDownTime'
import { Card } from './Card'
import { getCooldown } from '@/domain/rules/deriveStats'

export class YanHong extends Card {
  private _cd: CoolDownTime

  constructor(core: Core, _: number) {
    const id: CardId = 'yanHong'
    const key = '燕虹'
    super(core, id, key)

    this._cd = new CoolDownTime(getCooldown(id, 0), true)
  }

  action() {
    const isReady = this._cd.settle()
    if (isReady) this.settle()

    this._cd.tick()
  }

  settle() {
    this._core.ice.add(1, this._key)
  }

  reset() {
    this._cd.reset()
  }
}
