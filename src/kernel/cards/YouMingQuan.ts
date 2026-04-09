import type { Core } from '../core/Core'
import type { CardId } from '@/domain/cards/cardIds'
import { CooldownTime } from '../utils/CooldownTime'
import { Card } from './Card'
import { getCooldown } from '@/domain/rules/deriveStats'

export class YouMingQuan extends Card {
  private _cd: CooldownTime

  constructor(core: Core, level: number) {
    const id: CardId = 'youMingQuan'
    const key = '幽冥犬'
    super(core, id, key)

    this._cd = new CooldownTime(getCooldown(id, level), true)
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
