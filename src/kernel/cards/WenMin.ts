import type { Core } from '../core/Core'
import type { CardId } from '@/domain/cards/cardIds'
import { CooldownTime } from '../utils/CooldownTime'
import { Card } from './Card'
import { getCooldown } from '@/domain/rules/deriveStats'

export class WenMin extends Card {
  private _cd: CooldownTime

  constructor(core: Core, level: number) {
    const id: CardId = 'wenMin'
    const key = '文敏'
    super(core, id, key)

    this._cd = new CooldownTime(getCooldown(id, level))
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
