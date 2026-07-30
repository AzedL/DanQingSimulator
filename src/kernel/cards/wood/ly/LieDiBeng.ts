import type { Core } from '../../../core/Core'
import { Card } from '../../Card'
import { CARD_IDS } from '../../cardIds'
import { enqueueRepeated } from '../../shared'

const MULTIPLIER = [0, 1, 1.375, 1.75, 2.125, 2.5]

export class LieDiBeng extends Card {
  declare private _damage: number
  declare private _echoActive: boolean

  constructor(core: Core, level: number) {
    super(core, 'passive', CARD_IDS.lieDiBeng, '裂地崩', level)
  }

  protected init() {
    this._damage = 207708 * MULTIPLIER[this.level]
    this._echoActive = false
  }

  onSkillDamageSettled() {
    this.core.wood.add(this._damage, 1, '裂地崩')

    if (this.level >= 3) {
      this._echoActive = true
      enqueueRepeated(this.core, 30, 1, () => {
        this.settleEcho()
      })
      this.core.queue.enqueue(() => {
        this._echoActive = false
      }, 30)
    }
  }

  onSummonAttack() {
    if (this.level >= 5 && this._echoActive) {
      this.settleEcho()
    }
  }

  private settleEcho() {
    this.core.wood.add(2887, 1, '裂地崩 · 回响')
  }

  reset() {
    this._echoActive = false
  }
}
