import type { Core } from '../../core/Core'
import { CooldownTime } from '../../utils/CooldownTime'
import { handleProbability } from '../../utils/probability'
import { Card } from '../Card'
import { CARD_IDS } from '../cardIds'
import { SKILL_UPGRADES } from '../skillUpgrades'
import { deductBaseDamageDuringCast, getCard } from '../shared'
import {
  DEFAULT_FU_MU_DAMAGE,
  type FuMuZhangFeng,
} from './ly/FuMuZhangFeng'
import type { LieDiBeng } from './ly/LieDiBeng'
import type { MuYinQingLing } from './ly/MuYinQingLing'
import type { ShenMuTouLingYun } from './ly/ShenMuTouLingYun'

const DAMAGE = 279564
const ATTACK_DAMAGE = 36667
const CAST_DURATION = 2
const COOLDOWN = 120
const TOTAL_COOLDOWN = COOLDOWN + CAST_DURATION
const ECHO_DURATION_BONUS = 5
type SummonType = 'paper' | 'tree' | 'spirit'

export class QingWuFuSheng extends Card {
  declare private _cooldown: CooldownTime
  declare private _summons: Record<SummonType, number>
  declare private _isFirstCast: boolean

  constructor(core: Core, level: number) {
    super(core, 'active', CARD_IDS.qingWuFuSheng, '青芜浮生', level)
  }

  protected init() {
    this._isFirstCast = true
    this._cooldown = new CooldownTime(TOTAL_COOLDOWN, true)
    this._summons = { paper: 0, tree: 0, spirit: 0 }
  }

  get summonDurationMultiplier() {
    return this.upgrade === SKILL_UPGRADES.lingTong && this.level >= 1 ? 1.2 : 1
  }

  get summonAttackBonus() {
    return this.upgrade === SKILL_UPGRADES.lingTong && this.level >= 1 ? 1 : 0
  }

  get treeSkillDamageMultiplier() {
    return this.upgrade === SKILL_UPGRADES.lingTong && this.level >= 2 ? 1.1 : 1
  }

  get bloomDamageBoost() {
    return this.upgrade === SKILL_UPGRADES.benZhen && this.level >= 2 ? 0.1 : 0
  }

  get echoDurationBonus() {
    return this.upgrade === SKILL_UPGRADES.lingTong && this.level >= 3
      ? ECHO_DURATION_BONUS
      : 0
  }

  get echoDamageMultiplier() {
    if (this.upgrade !== SKILL_UPGRADES.lingTong || this.level < 3) return 1

    const types = Object.values(this._summons).filter(
      (count) => count > 0,
    ).length
    return 1 + types * 0.1
  }

  onPulse() {
    if (this.upgrade !== SKILL_UPGRADES.benZhen || this.level < 1) return

    const count = handleProbability(
      0.1,
      this.core.coreOptions.useRandom,
    )
    if (!count) return

    const plague = getCard<FuMuZhangFeng>(
      this.core,
      CARD_IDS.fuMuZhangFeng,
    )
    if (plague) {
      plague.onPulse(count)
    } else {
      this.core.wood.add(
        DEFAULT_FU_MU_DAMAGE * count,
        count,
        '腐木瘴风',
      )
    }
  }

  beginSummon(type: SummonType) {
    if (this.upgrade !== SKILL_UPGRADES.lingTong || this.level < 3) return
    this._summons[type]++
  }

  expireSummon(type: SummonType, delay: number) {
    if (this.upgrade !== SKILL_UPGRADES.lingTong || this.level < 3) return
    this.core.queue.enqueue(() => {
      this._summons[type]--
    }, delay)
  }

  tick() {
    if (this._cooldown.settle()) this.cast()
    this._cooldown.tick()
  }

  reduceCooldown(time: number) {
    this._cooldown.tick(time)
  }

  private cast() {
    const insightMultiplier =
      this.core.damage.consumeInsightMultiplier()
    if (this.upgrade === SKILL_UPGRADES.benZhen && this.level >= 3) {
      getCard<ShenMuTouLingYun>(
        this.core,
        CARD_IDS.shenMuTou_ly,
      )?.triggerFixed()
    }

    if (this._isFirstCast) {
      this._isFirstCast = false
      this._cooldown.tick(CAST_DURATION)
      this.completeCast(insightMultiplier)
      return
    }

    deductBaseDamageDuringCast(this.core, CAST_DURATION)
    this.core.queue.enqueue(() => {
      this.completeCast(insightMultiplier)
    }, CAST_DURATION)
  }

  private completeCast(insightMultiplier: number) {
    this.beginSummon('tree')
    getCard<MuYinQingLing>(
      this.core,
      CARD_IDS.muYinQingLing,
    )?.onSkillCastCompleted()

    this.core.queue.enqueue(() => {
      this.core.wood.add(
        DAMAGE * this.treeSkillDamageMultiplier * insightMultiplier,
        1,
        '青芜浮生',
      )

      const collapse = getCard<LieDiBeng>(
        this.core,
        CARD_IDS.lieDiBeng,
      )
      collapse?.onAttackStarted()
      getCard<FuMuZhangFeng>(
        this.core,
        CARD_IDS.fuMuZhangFeng,
      )?.onSkillDamageSettled()
      const firstAttackIndex = collapse ? 2 : 1
      const lastAttackIndex = 6 + this.summonAttackBonus
      for (let index = firstAttackIndex; index <= lastAttackIndex; index++) {
        this.core.queue.enqueue(() => {
          this.core.wood.add(
            ATTACK_DAMAGE * this.treeSkillDamageMultiplier,
            1,
            '青芜浮生 · 攻击',
          )
          collapse?.onSummonAttack()
        }, index * 3)
      }
      this.expireSummon(
        'tree',
        20 * this.summonDurationMultiplier - 2,
      )
    }, 2)
  }

  reset() {
    this._isFirstCast = true
    this._cooldown.reset()
    this._summons = { paper: 0, tree: 0, spirit: 0 }
  }
}
