import type { Core } from '../../../core/Core'
import { Card } from '../../Card'
import { CARD_IDS } from '../../cardIds'
import { getCard } from '../../shared'
import type { JiuXiaoLeiDong } from '../ly/JiuXiaoLeiDong'
import type { LeiTingZhenJi } from '../ly/LeiTingZhenJi'

const CHAIN_VALUE = [392, 420, 448, 476, 504, 532, 560]

export class ZiXiaoHu extends Card {
  declare private _chainValue: number
  declare private _thunderValue: number

  constructor(core: Core, level: number) {
    super(core, 'passive', CARD_IDS.ziXiaoHu, '紫霄葫', level)
  }

  protected init() {
    this._chainValue = CHAIN_VALUE[this.level]
    this._thunderValue = 0
  }

  get thunderValue() {
    return this._thunderValue
  }

  onChain(count: number) {
    this.addThunderValue(this._chainValue * count)
  }

  addThunderValue(value: number) {
    this._thunderValue += value

    while (this._thunderValue >= 10000) {
      this._thunderValue -= 10000
      this.activate()
    }
  }

  private activate() {
    this.core.thunder.add(93805, 1, '神雷激化')
    getCard<LeiTingZhenJi>(
      this.core,
      CARD_IDS.leiTingZhenJi,
    )?.onActivation()
    getCard<JiuXiaoLeiDong>(
      this.core,
      CARD_IDS.jiuXiaoLeiDong,
    )?.onActivation()
  }

  reset() {
    this._thunderValue = 0
  }
}
