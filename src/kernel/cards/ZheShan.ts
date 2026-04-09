import type { Core } from '../core/Core'
import type { CardId } from '@/domain/cards/cardIds'
import { CooldownTime } from '../utils/CooldownTime'
import { Card } from './Card'
import { getCooldown } from '@/domain/rules/deriveStats'

export class ZheShan extends Card {
  private _cd: CooldownTime

  constructor(core: Core, _: number) {
    const id: CardId = 'zheShan'
    const key = '折扇'
    super(core, id, key)

    this._cd = new CooldownTime(getCooldown(id, 0))
  }

  action() {
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
