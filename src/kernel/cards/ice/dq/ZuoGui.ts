import { DEFAULT_DAMAGE_MULTIPLIER } from '../../../core/Damage'
import type { Core } from '../../../core/Core'
import { handleProbability } from '../../../utils/probability'
import { Card } from '../../Card'
import { CARD_IDS } from '../../cardIds'
import { getCard } from '../../shared'
import type { ShangGuanCe } from './ShangGuanCe'

const DAMAGE_BOOST = [0.14, 0.15, 0.16, 0.17, 0.18, 0.19, 0.2]
const FRACTURE_DAMAGE = [8484, 9090, 9696, 10302, 10908, 11514, 12120]

export const ZUO_GUI_DEFAULT_FRACTURE_DAMAGE = 7878

export function settleFracture(
  core: Core,
  count: number,
  key = '碎裂',
) {
  if (!count) return

  const damage =
    getCard<ZuoGui>(core, CARD_IDS.zuoGui)?.fractureDamage ??
    ZUO_GUI_DEFAULT_FRACTURE_DAMAGE
  core.ice.add(damage * count, count, key)
  getCard<ShangGuanCe>(core, CARD_IDS.shangGuanCe)?.onFracture(count)
}

export class ZuoGui extends Card {
  declare private _damageMultiplier: number
  declare private _fractureDamage: number

  constructor(core: Core, level: number) {
    super(core, 'passive', CARD_IDS.zuoGui, '左归', level)
  }

  protected init() {
    this._damageMultiplier =
      DEFAULT_DAMAGE_MULTIPLIER + DAMAGE_BOOST[this.level]
    this._fractureDamage = FRACTURE_DAMAGE[this.level]
  }

  get arrowStormDamageMultiplier() {
    return this._damageMultiplier
  }

  get fractureDamage() {
    return this._fractureDamage
  }

  onHit(count: number) {
    const fractureCount = handleProbability(
      0.3,
      this.core.coreOptions.useRandom,
      count,
    )
    settleFracture(this.core, fractureCount)
  }

  reset() {}
}
