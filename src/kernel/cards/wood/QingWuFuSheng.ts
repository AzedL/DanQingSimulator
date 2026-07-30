import type { Core } from '../../core/Core'
import { CooldownTime } from '../../utils/CooldownTime'
import { Card } from '../Card'
import { CARD_IDS } from '../cardIds'
import { deductBaseDamageDuringCast, getCard } from '../shared'
import type { FuMuZhangFeng } from './ly/FuMuZhangFeng'
import type { LieDiBeng } from './ly/LieDiBeng'
import type { MuYinQingLing } from './ly/MuYinQingLing'

const DAMAGE = 279564
const ATTACK_DAMAGE = 36667
const CAST_DURATION = 2

export class QingWuFuSheng extends Card {
  declare private _cooldown: CooldownTime

  constructor(core: Core, level: number) {
    super(core, 'active', CARD_IDS.qingWuFuSheng, '青芜浮生', level)
  }

  protected init() {
    this._cooldown = new CooldownTime(120, true)
  }

  tick() {
    if (this._cooldown.settle()) this.cast()
    this._cooldown.tick()
  }

  reduceCooldown(time: number) {
    this._cooldown.tick(time)
  }

  private cast() {
    deductBaseDamageDuringCast(this.core, CAST_DURATION)
    const insightMultiplier =
      this.core.damage.consumeInsightMultiplier()

    this.core.queue.enqueue(() => {
      this.core.wood.add(
        DAMAGE * insightMultiplier,
        1,
        '青芜浮生',
      )

      const collapse = getCard<LieDiBeng>(
        this.core,
        CARD_IDS.lieDiBeng,
      )
      collapse?.onSkillDamageSettled()
      getCard<FuMuZhangFeng>(
        this.core,
        CARD_IDS.fuMuZhangFeng,
      )?.onSkillDamageSettled()
      getCard<MuYinQingLing>(
        this.core,
        CARD_IDS.muYinQingLing,
      )?.onSkillDamageSettled()

      const attackCount = collapse ? 5 : 6
      for (let index = 1; index <= attackCount; index++) {
        this.core.queue.enqueue(() => {
          this.core.wood.add(
            ATTACK_DAMAGE,
            1,
            '青芜浮生 · 攻击',
          )
          collapse?.onSummonAttack()
        }, index * 3)
      }
    }, 4)
  }

  reset() {
    this._cooldown.reset()
  }
}
