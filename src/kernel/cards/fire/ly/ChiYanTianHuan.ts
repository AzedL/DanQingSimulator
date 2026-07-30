import type { Core } from '../../../core/Core'
import { handleProbability } from '../../../utils/probability'
import { Card } from '../../Card'
import { CARD_IDS } from '../../cardIds'
import {
  MENG_HU_ACTIVATION_DURATION,
  MENG_HU_ACTIVATION_INTERVAL,
} from '../dq/MengHu'
import type { XingHongJuYi } from '../dq/XingHongJuYi'
import { enqueueRepeated, getCard } from '../../shared'

const MULTIPLIER = [0, 1, 1.375, 1.75, 2.125, 2.5]

export class ChiYanTianHuan extends Card {
  declare private _damage: number

  constructor(core: Core, level: number) {
    super(core, 'passive', CARD_IDS.chiYanTianHuan, '赤焰天环', level)
  }

  protected init() {
    this._damage = 3038 * MULTIPLIER[this.level]
  }

  get activationInterval() {
    return this.level >= 5 ? 1.5 : MENG_HU_ACTIVATION_INTERVAL
  }

  get activationDuration() {
    return this.level >= 5 ? 12 : MENG_HU_ACTIVATION_DURATION
  }

  onActivation() {
    const times = this.activationDuration / this.activationInterval
    const triggerCount = this.level >= 3 ? 2 : 1

    enqueueRepeated(this.core, times, this.activationInterval, () => {
      for (let index = 0; index < triggerCount; index++) {
        this.core.fire.add(this._damage, 1, '赤焰天环')
        const count = handleProbability(
          0.2,
          this.core.coreOptions.useRandom,
        )
        getCard<XingHongJuYi>(
          this.core,
          CARD_IDS.xingHongJuYi,
        )?.addBurn(count)
      }
    })
  }

  reset() {}
}
