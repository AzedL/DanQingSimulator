import type { Core } from '../../core/Core'
import { CARD_IDS } from '../cardIds'
import { getCard } from '../shared'
import type { ZhuoZhuoTianYan } from './ZhuoZhuoTianYan'

export function triggerFireResonance(core: Core) {
  getCard<ZhuoZhuoTianYan>(
    core,
    CARD_IDS.zhuoZhuoTianYan,
  )?.onResonanceDamage()
}
