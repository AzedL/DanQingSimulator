import type { Core } from '../../core/Core'
import { CARD_IDS } from '../cardIds'
import { getCard } from '../shared'
import type { LeiPoJing } from './dq/LeiPoJing'
import type { LianLeiBi } from './dq/LianLeiBi'
import type { YinLeiFan } from './dq/YinLeiFan'
import type { ZiDianChiWen } from './dq/ZiDianChiWen'
import type { ZiXiaoHu } from './dq/ZiXiaoHu'
import type { JingLeiJi } from './ly/JingLeiJi'
import type { TianLeiHuYou } from './ly/TianLeiHuYou'

export const DEFAULT_CHAIN_LIGHTNING_DAMAGE = 8970
export const DEFAULT_CHAIN_LIGHTNING_KEY = '连锁闪电'
export const ZI_DIAN_CHAIN_LIGHTNING_KEY = '连锁闪电-紫电螭吻'

interface ChainLightningOptions {
  key?: string
  count?: number
  efficiency?: number
  allowOverload?: boolean
  useFury?: boolean
}

interface ChainLightningGroupOptions {
  key: string
  count: number
  efficiency: number
  allowOverload: boolean
}

function chainDamage(core: Core) {
  return (
    getCard<YinLeiFan>(core, CARD_IDS.yinLeiFan)?.chainDamage ??
    DEFAULT_CHAIN_LIGHTNING_DAMAGE
  )
}

function chainMultiplier(core: Core) {
  const wall =
    getCard<LianLeiBi>(core, CARD_IDS.lianLeiBi)
      ?.chainDamageMultiplier ?? 1
  const blessing =
    getCard<TianLeiHuYou>(core, CARD_IDS.tianLeiHuYou)
      ?.chainDamageMultiplier ?? 1
  return wall * blessing
}

function settleChainLightningGroup(
  core: Core,
  options: ChainLightningGroupOptions,
) {
  const { key, count, efficiency, allowOverload } = options
  const damage = chainDamage(core) * chainMultiplier(core) * efficiency

  core.thunder.add(damage * count, count, key)
  getCard<ZiXiaoHu>(core, CARD_IDS.ziXiaoHu)?.onChain(count)
  getCard<JingLeiJi>(core, CARD_IDS.jingLeiJi)?.onChain(count)
  if (allowOverload) {
    getCard<LeiPoJing>(core, CARD_IDS.leiPoJing)?.onChain(count)
  }

  const copies =
    getCard<ZiDianChiWen>(core, CARD_IDS.ziDianChiWen)
      ?.copyCount(count) ?? 0
  if (!copies) return

  settleCopiedChainLightning(core, {
    key: ZI_DIAN_CHAIN_LIGHTNING_KEY,
    count: copies,
    efficiency,
    allowOverload,
  })
}

function settleCopiedChainLightning(
  core: Core,
  options: ChainLightningGroupOptions,
) {
  const { key, count, efficiency, allowOverload } = options
  const damage = chainDamage(core) * chainMultiplier(core) * efficiency

  core.thunder.add(damage * count, count, key)
  getCard<ZiXiaoHu>(core, CARD_IDS.ziXiaoHu)?.onChain(count)
  getCard<JingLeiJi>(core, CARD_IDS.jingLeiJi)?.onChain(count)
  if (allowOverload) {
    getCard<LeiPoJing>(core, CARD_IDS.leiPoJing)?.onChain(count)
  }
}

export function triggerChainLightning(
  core: Core,
  options: ChainLightningOptions = {},
) {
  const {
    key = DEFAULT_CHAIN_LIGHTNING_KEY,
    count = 1,
    efficiency = 1,
    allowOverload = true,
    useFury = true,
  } = options
  const ziDian = getCard<ZiDianChiWen>(
    core,
    CARD_IDS.ziDianChiWen,
  )

  if (useFury && ziDian?.consumeFury()) {
    settleChainLightningGroup(core, {
      key: ZI_DIAN_CHAIN_LIGHTNING_KEY,
      count: count * 3,
      efficiency: efficiency * ziDian.furyEfficiency,
      allowOverload,
    })
    return
  }

  settleChainLightningGroup(core, {
    key,
    count,
    efficiency,
    allowOverload,
  })
}

export function triggerFury(
  core: Core,
  key: string,
  efficiency: number,
  allowOverload: boolean,
) {
  settleChainLightningGroup(core, {
    key,
    count: 3,
    efficiency,
    allowOverload,
  })
}
