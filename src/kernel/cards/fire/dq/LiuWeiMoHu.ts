import type { Core } from '../../../core/Core'
import { Card } from '../../Card'
import { CARD_IDS } from '../../cardIds'
import type { LieYanFenShen } from '../ly/LieYanFenShen'
import { getCard } from '../../shared'
import type { MengHu } from './MengHu'
import type { XingHongJuYi } from './XingHongJuYi'

const DAMAGE = [8055, 8630, 9205, 9780, 10355, 10930, 11505]

export class LiuWeiMoHu extends Card {
  declare private _damage: number
  declare private _locked: boolean

  constructor(core: Core, level: number) {
    super(core, 'passive', CARD_IDS.liuWeiMoHu, '六尾魔狐', level)
  }

  protected init() {
    this._damage = DAMAGE[this.level]
    this._locked = false
  }

  onBurnChanged() {
    if (this._locked) return

    const ant = getCard<XingHongJuYi>(this.core, CARD_IDS.xingHongJuYi)
    if (!ant || ant.burnLayers < 6) return

    this._locked = true
    this.core.queue.enqueue(() => {
      const layers = ant.burnLayers
      this.core.fire.add(this._damage * (layers - 1), 1, '爆燃')
      ant.retainOneBurnLayer()
      this._locked = false
      getCard<MengHu>(this.core, CARD_IDS.mengHu)?.onExplosion()
      getCard<LieYanFenShen>(
        this.core,
        CARD_IDS.lieYanFenShen,
      )?.onExplosion()
    }, 1.5)
  }

  reset() {
    this._locked = false
  }
}
