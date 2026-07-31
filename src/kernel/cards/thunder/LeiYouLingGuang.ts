import type { Core } from '../../core/Core'
import { CooldownTime } from '../../utils/CooldownTime'
import { Card } from '../Card'
import { CARD_IDS } from '../cardIds'
import { deductBaseDamageDuringCast, getCard } from '../shared'
import type { TianLeiHuYou } from './ly/TianLeiHuYou'
import { triggerChainLightning } from './shared'

const DAMAGE = 187960
const CAST_DURATION = 1.3

export class LeiYouLingGuang extends Card {
  declare private _cooldown: CooldownTime

  constructor(core: Core, level: number) {
    super(core, 'active', CARD_IDS.leiYouLingGuang, '雷佑灵光', level)
  }

  protected init() {
    this._cooldown = new CooldownTime(60, true)
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
        DAMAGE * insightMultiplier,
        1,
        '雷佑灵光',
      )
    }, 1)
  }

  reset() {
    this._cooldown.reset()
  }
}
