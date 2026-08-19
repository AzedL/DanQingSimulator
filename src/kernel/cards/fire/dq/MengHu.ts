import type { Core } from '../../../core/Core'
import { RefreshablePeriodicEffect } from '../../../utils/RefreshablePeriodicEffect'
import { Card } from '../../Card'
import { CARD_IDS } from '../../cardIds'
import type { ChiYanTianHuan } from '../ly/ChiYanTianHuan'
import type { ShenHuoBengFa } from '../ly/ShenHuoBengFa'
import { getCard } from '../../shared'
import type { TianHuoYunXing } from '../ly/TianHuoYunXing'
import type { ZhuoZhuoTianYan } from '../ZhuoZhuoTianYan'
import { triggerFireResonance } from '../shared'

const BURN_VALUE = [98, 105, 112, 119, 126, 133, 140]
const EXPLOSION_VALUE = [532, 570, 608, 646, 684, 722, 760]

export const MENG_HU_ACTIVATION_INTERVAL = 2
export const MENG_HU_ACTIVATION_DURATION = 10
export const MENG_HU_ACTIVATION_DAMAGE_MULTIPLIER = 1

export class MengHu extends Card {
  declare private _burnValue: number
  declare private _explosionValue: number
  declare private _fireValue: number
  declare private _activation: RefreshablePeriodicEffect

  constructor(core: Core, level: number) {
    super(core, 'passive', CARD_IDS.mengHu, '猛虎', level)
  }

  protected init() {
    this._burnValue = BURN_VALUE[this.level]
    this._explosionValue = EXPLOSION_VALUE[this.level]
    this._fireValue = 0
    this._activation = new RefreshablePeriodicEffect(
      this.core.queue,
      {
        onTick: () => this.settleActivationDamage(),
      },
    )
  }

  get fireValue() {
    return this._fireValue
  }

  onBurnDamage() {
    this.addFireValue(this._burnValue)
  }

  onExplosion() {
    this.addFireValue(this._explosionValue)
  }

  addFireValue(value: number) {
    this._fireValue += value * this.core.lingYunValueMultiplier

    while (this._fireValue >= 10000) {
      this._fireValue -= 10000
      this.activate()
    }
  }

  private activate() {
    const skill = getCard<ZhuoZhuoTianYan>(
      this.core,
      CARD_IDS.zhuoZhuoTianYan,
    )
    skill?.onActivation()
    const ring = getCard<ChiYanTianHuan>(
      this.core,
      CARD_IDS.chiYanTianHuan,
    )
    const interval =
      ring?.activationInterval ?? MENG_HU_ACTIVATION_INTERVAL
    const duration =
      ring?.activationDuration ?? MENG_HU_ACTIVATION_DURATION
    const times = duration / interval
    const coveredRemainingTicks = this._activation.refresh(
      interval,
      times,
    )

    if (coveredRemainingTicks === 1) {
      this.settleActivationDamage()
    }

    getCard<ShenHuoBengFa>(
      this.core,
      CARD_IDS.shenHuoBengFa,
    )?.onActivation()
    getCard<TianHuoYunXing>(
      this.core,
      CARD_IDS.tianHuoYunXing,
    )?.onActivation()
  }

  private settleActivationDamage() {
    getCard<ChiYanTianHuan>(
      this.core,
      CARD_IDS.chiYanTianHuan,
    )?.onActivationDamage()

    const shenHuoBoost =
      getCard<ShenHuoBengFa>(
        this.core,
        CARD_IDS.shenHuoBengFa,
      )?.activationDamageBoost ?? 0
    const zhuoZhuoBoost =
      getCard<ZhuoZhuoTianYan>(
        this.core,
        CARD_IDS.zhuoZhuoTianYan,
      )?.activationDamageBoost ?? 0
    const multiplier =
      MENG_HU_ACTIVATION_DAMAGE_MULTIPLIER *
      (1 + shenHuoBoost) *
      (1 + zhuoZhuoBoost)
    this.core.fire.add(39181 * multiplier, 1, '天火激化')
    triggerFireResonance(this.core)
  }

  reset() {
    this._fireValue = 0
    this._activation.reset()
  }
}
