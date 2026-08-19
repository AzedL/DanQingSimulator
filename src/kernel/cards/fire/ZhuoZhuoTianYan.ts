import type { Core } from '../../core/Core'
import { CooldownTime } from '../../utils/CooldownTime'
import { handleProbability } from '../../utils/probability'
import { RefreshableBuff } from '../../utils/RefreshableBuff'
import { Card } from '../Card'
import { CARD_IDS } from '../cardIds'
import { SKILL_UPGRADES } from '../skillUpgrades'
import { deductBaseDamageDuringCast, getCard } from '../shared'
import type { MengHu } from './dq/MengHu'
import type { LieHuoLiaoYuan } from './ly/LieHuoLiaoYuan'
import type { LieYanFenShen } from './ly/LieYanFenShen'

const DAMAGES = [105000, 105000, 105000, 105000, 105000, 168014]
const CAST_DURATION = 5

export class ZhuoZhuoTianYan extends Card {
  declare private _cooldown: CooldownTime
  declare private _damageBuff: RefreshableBuff

  constructor(core: Core, level: number) {
    super(core, 'active', CARD_IDS.zhuoZhuoTianYan, '灼灼天炎', level)
  }

  protected init() {
    this._cooldown = new CooldownTime(120, true)
    this._damageBuff = new RefreshableBuff(this.core.queue, {
      onStart: () => this.core.damage.addSkillBoost(0.12),
      onEnd: () => this.core.damage.removeSkillBoost(0.12),
    })
    this.addInitialInsight()
  }

  get activationDamageBoost() {
    return this.upgrade === SKILL_UPGRADES.benZhen && this.level >= 2 ? 0.1 : 0
  }

  onActivation() {
    if (this.upgrade === SKILL_UPGRADES.benZhen && this.level >= 3) {
      this._damageBuff.refresh(5)
    }
  }

  onResonanceDamage() {
    if (this.upgrade !== SKILL_UPGRADES.lingTong || this.level < 1) return

    const count = handleProbability(
      0.1,
      this.core.coreOptions.useRandom,
    )
    if (!count) return

    this.core.fire.add(18352 * count, count, '焚心')
    if (this.level >= 3) this.core.damage.addInsight(count)
  }

  tick() {
    if (this._cooldown.settle()) this.cast()
    this._cooldown.tick()
  }

  private cast() {
    deductBaseDamageDuringCast(this.core, CAST_DURATION)
    const insightMultiplier =
      this.core.damage.consumeInsightMultiplier()
    getCard<LieHuoLiaoYuan>(
      this.core,
      CARD_IDS.lieHuoLiaoYuan,
    )?.onSkillStart()
    this.settleDamage(0, insightMultiplier)

    for (let index = 1; index < DAMAGES.length; index++) {
      this.core.queue.enqueue(() => {
        this.settleDamage(index, insightMultiplier)
        if (index === DAMAGES.length - 1) {
          getCard<LieHuoLiaoYuan>(
            this.core,
            CARD_IDS.lieHuoLiaoYuan,
          )?.onSkillEnd()
        }
      }, index)
    }
  }

  private settleDamage(index: number, insightMultiplier: number) {
    const skillMultiplier =
      this.upgrade === SKILL_UPGRADES.lingTong && this.level >= 2 ? 1.1 : 1
    this.core.fire.add(
      DAMAGES[index] * skillMultiplier * insightMultiplier,
      1,
      '灼灼天炎',
    )
    getCard<LieYanFenShen>(
      this.core,
      CARD_IDS.lieYanFenShen,
    )?.onSkillDamage()
    if (this.upgrade === SKILL_UPGRADES.benZhen && this.level >= 1) {
      getCard<MengHu>(this.core, CARD_IDS.mengHu)?.addFireValue(
        index === DAMAGES.length - 1 ? 2000 : 600,
      )
    }
  }

  reset() {
    this._cooldown.reset()
    this._damageBuff.reset()
    this.addInitialInsight()
  }

  private addInitialInsight() {
    if (this.upgrade === SKILL_UPGRADES.lingTong && this.level >= 3) {
      this.core.damage.addInsight(15)
    }
  }
}
