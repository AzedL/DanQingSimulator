import type { Core } from '../../../core/Core'
import { CooldownTime } from '../../../utils/CooldownTime'
import { min } from '../../../utils/math'
import { Card } from '../../Card'
import { CARD_IDS } from '../../cardIds'
import type { ErWeiYaoHu } from './ErWeiYaoHu'
import type { LiuWeiMoHu } from './LiuWeiMoHu'
import type { MengHu } from './MengHu'
import {
  SUI_SHOU_DEFAULT_BURN_SPEED_BONUS,
  type SuiShou,
} from './SuiShou'
import { getCard } from '../../shared'

const DAMAGE = [2209, 2369, 2529, 2689, 2849, 3009, 3169]

export class XingHongJuYi extends Card {
  declare private _damage: number
  declare private _burnLayers: number
  declare private _addCooldown: CooldownTime
  declare private _burnCooldown: CooldownTime

  constructor(core: Core, level: number) {
    super(core, 'active', CARD_IDS.xingHongJuYi, '猩红巨蚁', level)
  }

  protected init() {
    this._damage = DAMAGE[this.level]
    this._burnLayers = 0
    this._addCooldown = new CooldownTime(8, true)
    this._burnCooldown = new CooldownTime(3)
  }

  get burnLayers() {
    return this._burnLayers
  }

  tick() {
    if (this._addCooldown.settle()) this.addBurn(1)
    this._addCooldown.tick()

    if (this._burnCooldown.settle()) this.settleBurn()
    const speed =
      getCard<SuiShou>(this.core, CARD_IDS.suiShou)?.burnSpeed ??
      SUI_SHOU_DEFAULT_BURN_SPEED_BONUS
    this._burnCooldown.tick(1 + speed)
  }

  addBurn(count: number) {
    if (!count) return

    getCard<ErWeiYaoHu>(
      this.core,
      CARD_IDS.erWeiYaoHu,
    )?.onBurnAttempt(count)
    this._burnLayers = min(this._burnLayers + count, 8)
    getCard<LiuWeiMoHu>(
      this.core,
      CARD_IDS.liuWeiMoHu,
    )?.onBurnChanged()
  }

  retainOneBurnLayer() {
    this._burnLayers = 1
    getCard<ErWeiYaoHu>(
      this.core,
      CARD_IDS.erWeiYaoHu,
    )?.onBurnAttempt(1)
  }

  private settleBurn() {
    const damage = this._damage * (1 + 0.05 * (this._burnLayers - 1))
    this.core.fire.add(damage, 1, '燃烧')
    getCard<MengHu>(this.core, CARD_IDS.mengHu)?.onBurnDamage()
    getCard<SuiShou>(this.core, CARD_IDS.suiShou)?.onBurnDamage()
  }

  reset() {
    this._burnLayers = 0
    this._addCooldown.reset()
    this._burnCooldown.reset()
  }
}
