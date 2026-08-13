import type { Core } from '../../core/Core'
import { CooldownTime } from '../../utils/CooldownTime'
import { RefreshableBuff } from '../../utils/RefreshableBuff'
import { Card } from '../Card'
import { CARD_IDS } from '../cardIds'
import { SKILL_UPGRADES } from '../skillUpgrades'
import { deductBaseDamageDuringCast, getCard } from '../shared'
import type { TianLeiHuYou } from './ly/TianLeiHuYou'
import { triggerChainLightning } from './shared'

const DAMAGE = 187960
const CAST_DURATION = 1.3

export class LeiYouLingGuang extends Card {
  declare private _cooldown: CooldownTime
  declare private _activationBuff: RefreshableBuff
  declare private _spearHits: number
  declare private _lingTongActive: boolean

  constructor(core: Core, level: number) {
    super(core, 'active', CARD_IDS.leiYouLingGuang, '雷佑灵光', level)
  }

  protected init() {
    this._cooldown = new CooldownTime(60, true)
    this._spearHits = 0
    this._lingTongActive = false
    this._activationBuff = new RefreshableBuff(this.core.queue, {
      onStart: () => this.core.damage.addBoost(0.2),
      onEnd: () => this.core.damage.removeBoost(0.2),
    })
  }

  get activationDamageMultiplier() {
    return this.upgrade === SKILL_UPGRADES.benZhen && this.level >= 2 ? 1.1 : 1
  }

  get activationValueMultiplier() {
    return this.upgrade === SKILL_UPGRADES.benZhen && this.level >= 3 ? 2 : 1
  }

  get extraSpearCount() {
    return this.upgrade === SKILL_UPGRADES.lingTong &&
      this.level >= 3 &&
      this._lingTongActive
      ? 1
      : 0
  }

  onSpearHit(count: number) {
    if (this.upgrade !== SKILL_UPGRADES.lingTong || this.level < 1) return

    this._spearHits += count
    while (this._spearHits >= 50) {
      this._spearHits -= 50
      this.core.thunder.add(68154, 1, '雷暴')
    }
  }

  onActivation() {
    if (this.upgrade === SKILL_UPGRADES.benZhen && this.level >= 1) {
      this._activationBuff.refresh(5)
    }
  }

  tick() {
    if (this._cooldown.settle()) this.cast()
    this._cooldown.tick()
  }

  private cast() {
    deductBaseDamageDuringCast(this.core, CAST_DURATION)
    const insightMultiplier = this.core.damage.consumeInsightMultiplier()

    this.core.queue.enqueue(() => {
      for (let index = 1; index <= 5; index++) {
        this.core.queue.enqueue(() => {
          triggerChainLightning(this.core, {
            key: '连锁闪电-雷佑灵光',
            allowOverload: false,
          })
        }, index * 2)
      }

      getCard<TianLeiHuYou>(
        this.core,
        CARD_IDS.tianLeiHuYou,
      )?.onSkillDamage()

      this.core.thunder.add(
        DAMAGE *
          (this.upgrade === SKILL_UPGRADES.lingTong && this.level >= 2 ? 1.1 : 1) *
          insightMultiplier,
        1,
        '雷佑灵光',
      )
      if (this.upgrade === SKILL_UPGRADES.lingTong && this.level >= 3) {
        this._lingTongActive = true
        this.core.queue.enqueue(() => {
          this._lingTongActive = false
        }, 10)
      }
    }, 1)
  }

  reset() {
    this._cooldown.reset()
    this._activationBuff.reset()
    this._spearHits = 0
    this._lingTongActive = false
  }
}
