import type { Core } from '../core/Core'
import type { CardId } from '@/domain/cards/cardIds'
import { CooldownTime } from '../utils/CooldownTime'
import { Card } from './Card'
import { getCooldown } from '@/domain/rules/deriveStats'

export class XingHongJuYi extends Card {
  private _cd: CooldownTime

  constructor(core: Core, _: number) {
    const id: CardId = 'xingHongJuYi'
    const key = '猩红巨蚁'
    super(core, id, key)

    this._cd = new CooldownTime(getCooldown(id, 0), true)
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
