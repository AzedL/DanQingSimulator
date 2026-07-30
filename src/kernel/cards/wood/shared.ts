import type { Core } from '../../core/Core'
import { CARD_IDS } from '../cardIds'
import { getCard } from '../shared'
import {
  LIN_FENG_PULSE_DAMAGE_MULTIPLIER,
  type LinFeng,
} from './dq/LinFeng'
import type { LiuHeJing } from './dq/LiuHeJing'
import type { QingLiangZhu } from './dq/QingLiangZhu'
import type { ShenMuTouDanQing } from './dq/ShenMuTouDanQing'
import type { ZheShan } from './dq/ZheShan'
import type {
  PulseState,
  ShenMuTouLingYun,
} from './ly/ShenMuTouLingYun'

export const DEFAULT_PULSE_DAMAGE = 9092
export const DEFAULT_PULSE_KEY = '脉冲'

interface PulseOptions {
  key?: string
  efficiency?: number
  allowLiuHeJing?: boolean
}

const DEFAULT_PULSE_STATE: PulseState = {
  damageMultiplier: 1,
  triggerDice: false,
}

export function triggerPulse(
  core: Core,
  options: PulseOptions = {},
) {
  const {
    key = DEFAULT_PULSE_KEY,
    efficiency = 1,
    allowLiuHeJing = true,
  } = options
  const baseDamage =
    getCard<ZheShan>(core, CARD_IDS.zheShan)?.pulseDamage ??
    DEFAULT_PULSE_DAMAGE
  const linFengMultiplier =
    getCard<LinFeng>(core, CARD_IDS.linFeng)
      ?.pulseDamageMultiplier ??
    LIN_FENG_PULSE_DAMAGE_MULTIPLIER
  const dice = getCard<ShenMuTouLingYun>(
    core,
    CARD_IDS.shenMuTou_ly,
  )
  const pulseState = dice?.nextPulse() ?? DEFAULT_PULSE_STATE

  core.wood.add(
    baseDamage *
      efficiency *
      linFengMultiplier *
      pulseState.damageMultiplier,
    1,
    key,
  )

  getCard<QingLiangZhu>(
    core,
    CARD_IDS.qingLiangZhu,
  )?.onPulse()
  getCard<ShenMuTouDanQing>(
    core,
    CARD_IDS.shenMuTou_dq,
  )?.onPulse()
  dice?.afterPulse(pulseState)

  if (allowLiuHeJing) {
    getCard<LiuHeJing>(
      core,
      CARD_IDS.liuHeJing,
    )?.onPulse()
  }
}
