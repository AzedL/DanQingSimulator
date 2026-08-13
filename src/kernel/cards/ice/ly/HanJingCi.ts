import type { Core } from '../../../core/Core'
import { Card } from '../../Card'
import { CARD_IDS } from '../../cardIds'
import { settleFracture } from '../dq/ZuoGui'
import { getCard } from '../../shared'
import type { NingBingShuangHua } from '../NingBingShuangHua'

const MULTIPLIER = [0, 1, 1.375, 1.75, 2.125, 2.5]

export class HanJingCi extends Card {
  declare private _damageMultiplier: number
  declare private _iceArrowCount: number
  declare private _layers: number

  constructor(core: Core, level: number) {
    super(core, 'passive', CARD_IDS.hanJingCi, '寒晶刺', level)
  }

  protected init() {
    this._damageMultiplier = MULTIPLIER[this.level]
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
    this.addLayers(2)
  }

  addLayers(count: number) {
    this._layers += count
    this.consumeLayers()
  }

  private consumeLayers() {
    while (this._layers > 0) {
      this._layers--
      const skill = getCard<NingBingShuangHua>(
        this.core,
        CARD_IDS.ningBingShuangHua,
      )
      const damage = 10992 *
        (this._damageMultiplier + (skill?.coldSpikeBaseDamageBoost ?? 0))
      this.core.ice.add(damage * 3, 3, '寒晶刺')
      skill?.onColdSpikeDamage(3)
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
