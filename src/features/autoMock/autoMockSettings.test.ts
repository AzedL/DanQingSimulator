import { describe, expect, it } from 'vitest'
import { CARD_IDS } from '../../kernel'
import {
  AUTO_MOCK_RECOMMENDED_WHITELIST,
  mergeAutoMockCardIds,
} from './autoMockSettings'

describe('自动模拟白名单设置', () => {
  const groupCardIds = [
    CARD_IDS.lieYanFenShen,
    CARD_IDS.lieHuoLiaoYuan,
  ]

  it('未启用时只使用模拟范围内的天工', () => {
    expect(
      mergeAutoMockCardIds(
        groupCardIds,
        false,
        [CARD_IDS.cangLinFuSheng],
      ),
    ).toEqual(groupCardIds)
  })

  it('启用时合并白名单并去除重复卡片', () => {
    expect(
      mergeAutoMockCardIds(
        groupCardIds,
        true,
        [
          CARD_IDS.lieYanFenShen,
          CARD_IDS.cangLinFuSheng,
        ],
      ),
    ).toEqual([
      ...groupCardIds,
      CARD_IDS.cangLinFuSheng,
    ])
  })

  it('标记五张推荐的跨系天工', () => {
    expect(AUTO_MOCK_RECOMMENDED_WHITELIST).toEqual([
      CARD_IDS.lieYanFenShen,
      CARD_IDS.tianHuoYunXing,
      CARD_IDS.hanChaoBingYong,
      CARD_IDS.wuLeiZhu,
      CARD_IDS.cangLinFuSheng,
    ])
  })
})
