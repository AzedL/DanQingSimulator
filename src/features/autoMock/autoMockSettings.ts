import {
  CARD_IDS,
  type CardId,
} from '../../kernel'
import { AUTO_MOCK_MAX_COMBINATIONS } from '../config/simulatorDefaults'

declare global {
  interface Window {
    AUTO_MOCK_MAX_COMBINATIONS?: number
  }
}

export const AUTO_MOCK_RECOMMENDED_WHITELIST: CardId[] = [
  CARD_IDS.lieYanFenShen,
  CARD_IDS.tianHuoYunXing,
  CARD_IDS.hanChaoBingYong,
  CARD_IDS.wuLeiZhu,
  CARD_IDS.cangLinFuSheng,
]

if (
  typeof window !== 'undefined' &&
  window.AUTO_MOCK_MAX_COMBINATIONS === undefined
) {
  window.AUTO_MOCK_MAX_COMBINATIONS =
    AUTO_MOCK_MAX_COMBINATIONS
}

export function getAutoMockMaxCombinations() {
  if (typeof window === 'undefined') {
    return AUTO_MOCK_MAX_COMBINATIONS
  }

  const value = window.AUTO_MOCK_MAX_COMBINATIONS
  return Number.isSafeInteger(value) && Number(value) > 0
    ? Number(value)
    : AUTO_MOCK_MAX_COMBINATIONS
}

export function mergeAutoMockCardIds(
  groupCardIds: CardId[],
  whitelistEnabled: boolean,
  whitelistCardIds: CardId[],
) {
  if (!whitelistEnabled) return groupCardIds
  return [...new Set([...groupCardIds, ...whitelistCardIds])]
}
