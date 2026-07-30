import { DEFAULT_DAMAGE_MULTIPLIER } from '../../../core/Damage'
import type { Core } from '../../../core/Core'
import { Card } from '../../Card'
import { CARD_IDS } from '../../cardIds'
import { getCard } from '../../shared'
import type { LinShuangHanYong } from '../ly/LinShuangHanYong'
import type { ShuangCiHanYu } from '../ly/ShuangCiHanYu'

const ICE_ARROW_VALUE = [140, 150, 160, 170, 180, 190, 200]
const FRACTURE_VALUE = [140, 150, 160, 170, 180, 190, 200]
const STORM_VALUE = [1400, 1500, 1600, 1700, 1800, 1900, 2000]

export const SHANG_GUAN_CE_ACTIVATION_DAMAGE_MULTIPLIER =
  DEFAULT_DAMAGE_MULTIPLIER

export class ShangGuanCe extends Card {
  declare private _iceArrowValue: number
  declare private _fractureValue: number
  declare private _stormValue: number
  declare private _iceValue: number

  constructor(core: Core, level: number) {
    super(core, 'passive', CARD_IDS.shangGuanCe, '上官策', level)
  }

  protected init() {
    this._iceArrowValue = ICE_ARROW_VALUE[this.level]
    this._fractureValue = FRACTURE_VALUE[this.level]
    this._stormValue = STORM_VALUE[this.level]
    this._iceValue = 0
  }

  get iceValue() {
    return this._iceValue
  }

  onIceArrow(count: number) {
    this.addIceValue(this._iceArrowValue * count)
  }

  onFracture(count: number) {
    this.addIceValue(this._fractureValue * count)
  }

  onStorm(progress: number) {
    this.addIceValue(this._stormValue * progress)
  }

  addIceValue(value: number) {
    this._iceValue += value

    while (this._iceValue >= 10000) {
      this._iceValue -= 10000
      this.activate()
    }
  }

  private activate() {
    const cold = getCard<LinShuangHanYong>(
      this.core,
      CARD_IDS.linShuangHanYong,
    )
    const multiplier =
      cold?.activationDamageMultiplier ??
      SHANG_GUAN_CE_ACTIVATION_DAMAGE_MULTIPLIER

    this.core.ice.add(43534 * multiplier, 1, '玄冰激化')
    this.core.queue.enqueue(() => {
      this.core.ice.add(85327 * multiplier, 1, '玄冰激化')
      cold?.onFreeze()
      getCard<ShuangCiHanYu>(
        this.core,
        CARD_IDS.shuangCiHanYu,
      )?.onFreeze()
    }, 2)
  }

  reset() {
    this._iceValue = 0
  }
}
