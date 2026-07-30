import type { Core } from '../../../core/Core'
import { Card } from '../../Card'
import { CARD_IDS } from '../../cardIds'
import { settleFracture } from '../dq/ZuoGui'

const MULTIPLIER = [0, 1, 1.375, 1.75, 2.125, 2.5]

export class HanJingCi extends Card {
  declare private _damage: number
  declare private _iceArrowCount: number
  declare private _layers: number

  constructor(core: Core, level: number) {
    super(core, 'passive', CARD_IDS.hanJingCi, '寒晶刺', level)
  }

  protected init() {
    this._damage = 10992 * MULTIPLIER[this.level]
    this._iceArrowCount = 0
    this._layers = 0
  }

  onIceArrow(count: number) {
    this._iceArrowCount += count

    while (this._iceArrowCount >= 10) {
      this._iceArrowCount -= 10
      this._layers++
    }

    this.consumeLayers()
  }

  onFrostElement() {
    if (this.level < 5) return
    this._layers += 2
    this.consumeLayers()
  }

  private consumeLayers() {
    while (this._layers > 0) {
      this._layers--
      this.core.ice.add(this._damage * 3, 3, '寒晶刺')
      if (this.level >= 3) {
        settleFracture(this.core, 3, '碎裂-寒晶刺')
      }
    }
  }

  reset() {
    this._iceArrowCount = 0
    this._layers = 0
  }
}
