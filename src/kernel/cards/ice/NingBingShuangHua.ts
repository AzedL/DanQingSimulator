import { DEFAULT_DAMAGE_MULTIPLIER } from '../../core/Damage'
import type { Core } from '../../core/Core'
import { CooldownTime } from '../../utils/CooldownTime'
import { RefreshableBuff } from '../../utils/RefreshableBuff'
import { StackedEffect } from '../../utils/StackedEffect'
import { Card } from '../Card'
import { CARD_IDS } from '../cardIds'
import { SKILL_UPGRADES } from '../skillUpgrades'
import { deductBaseDamageDuringCast, getCard } from '../shared'
import type { HanChaoBingYong } from './ly/HanChaoBingYong'
import type { ShuangCiHanYu } from './ly/ShuangCiHanYu'
import type { ShuangHanPoLie } from './ly/ShuangHanPoLie'
import type { HanJingCi } from './ly/HanJingCi'

const DAMAGE_PER_HIT = 70715
const CAST_DURATION = 4

export class NingBingShuangHua extends Card {
  declare private _cooldown: CooldownTime
  declare private _deepActivation: StackedEffect
  declare private _valueBuff: RefreshableBuff

  constructor(core: Core, level: number) {
    super(core, 'active', CARD_IDS.ningBingShuangHua, '玄冰霜华', level)
  }

  protected init() {
    this._cooldown = new CooldownTime(90, true)
    this._deepActivation = new StackedEffect(this.core.queue, {
      interval: 1,
      duration: 3,
      onTick: (layers) => {
        this.core.ice.add(15342 * layers, 1, '深度激化')
      },
    })
    this._valueBuff = new RefreshableBuff(this.core.queue, {
      onStart: () => this.core.addLingYunValueBoost(0.15),
      onEnd: () => this.core.removeLingYunValueBoost(0.15),
    })
  }

  get activationDamageMultiplier() {
    return this.upgrade === SKILL_UPGRADES.benZhen && this.level >= 2 ? 1.2 : 1
  }

  get coldSpikeBaseDamageBoost() {
    return this.upgrade === SKILL_UPGRADES.lingTong && this.level >= 2 ? 0.05 : 0
  }

  get fractureDamageMultiplier() {
    return this.upgrade === SKILL_UPGRADES.lingTong && this.level >= 2 ? 1.05 : 1
  }

  reduceCooldown(time: number) {
    this._cooldown.tick(time)
  }

  onFreeze() {
    if (this.upgrade === SKILL_UPGRADES.benZhen && this.level >= 1) {
      this._deepActivation.add()
    }
  }

  onColdSpikeDamage(count: number) {
    if (this.upgrade === SKILL_UPGRADES.lingTong && this.level >= 3) {
      this.reduceCooldown(count * 0.8)
    }
  }

  tick() {
    if (this._cooldown.settle()) this.cast()
    this._cooldown.tick()
  }

  private cast() {
    deductBaseDamageDuringCast(this.core, CAST_DURATION)
    if (this.upgrade === SKILL_UPGRADES.benZhen && this.level >= 3) {
      this._valueBuff.refresh(60)
    }
    if (this.upgrade === SKILL_UPGRADES.lingTong && this.level >= 1) {
      getCard<HanJingCi>(
        this.core,
        CARD_IDS.hanJingCi,
      )?.addLayers(2)
    }
    const skillMultiplier =
      getCard<ShuangCiHanYu>(this.core, CARD_IDS.shuangCiHanYu)
        ?.skillDamageMultiplier ?? DEFAULT_DAMAGE_MULTIPLIER
    const insightMultiplier =
      this.core.damage.consumeInsightMultiplier()
    const multiplier = skillMultiplier * insightMultiplier

    getCard<ShuangHanPoLie>(
      this.core,
      CARD_IDS.shuangHanPoLie,
    )?.onSkillCast()
    this.settleDamage(1, multiplier)

    for (let delay = 1; delay <= 3; delay++) {
      this.core.queue.enqueue(() => {
        this.settleDamage(2, multiplier)
      }, delay)
    }
  }

  private settleDamage(count: number, multiplier: number) {
    this.core.ice.add(
      DAMAGE_PER_HIT * count * multiplier,
      count,
      '玄冰霜华',
    )
    getCard<HanChaoBingYong>(
      this.core,
      CARD_IDS.hanChaoBingYong,
    )?.onSkillDamageGroup()
  }

  reset() {
    this._cooldown.reset()
    this._deepActivation.reset()
    this._valueBuff.reset()
  }
}
