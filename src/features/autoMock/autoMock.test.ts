import { describe, expect, it } from 'vitest'
import {
  CARD_IDS,
  type CardId,
  type CoreOptions,
} from '../../kernel'
import {
  buildAutoMockCards,
  runAutoMock,
} from './autoMock'

const baseOptions: CoreOptions = {
  cards: [
    { id: CARD_IDS.ningBingShuangHua, level: 0 },
    { id: CARD_IDS.yanHong, level: 6 },
    { id: CARD_IDS.shuangHanPoLie, level: 4 },
    { id: CARD_IDS.lieYanFenShen, level: 2 },
  ],
  duration: 10,
  burstDps: 0,
  sustainedDps: 0,
  useRandom: false,
}

const targetIds: CardId[] = [
  CARD_IDS.shuangHanPoLie,
  CARD_IDS.hanChaoBingYong,
]
const resultIds: CardId[] = [
  CARD_IDS.ningBingShuangHua,
  ...targetIds,
  CARD_IDS.lieYanFenShen,
]

describe('自动模拟', () => {
  it('只在目标系内基于当前等级追加并用完额度', () => {
    const combinations = buildAutoMockCards(
      baseOptions.cards,
      targetIds,
      2,
    )

    expect(combinations).toHaveLength(2)
    expect(combinations.map((cards) =>
      cards.filter((card) => targetIds.includes(card.id)),
    )).toEqual([
      [
        { id: CARD_IDS.shuangHanPoLie, level: 4 },
        { id: CARD_IDS.hanChaoBingYong, level: 2 },
      ],
      [
        { id: CARD_IDS.shuangHanPoLie, level: 5 },
        { id: CARD_IDS.hanChaoBingYong, level: 1 },
      ],
    ])
    expect(combinations[0]).toContainEqual({
      id: CARD_IDS.lieYanFenShen,
      level: 2,
    })
  })

  it('额外额度为0时仅模拟当前配置', () => {
    expect(buildAutoMockCards(baseOptions.cards, targetIds, 0)).toEqual([
      baseOptions.cards,
    ])
  })

  it('额度超过目标系剩余容量时没有追加组合', () => {
    expect(buildAutoMockCards(baseOptions.cards, targetIds, 7)).toEqual([])
  })

  it('没有追加组合时使用原始配置模拟一次', () => {
    const cards = targetIds.map((id) => ({ id, level: 5 }))
    const result = runAutoMock({
      coreOptions: { ...baseOptions, cards },
      targetCardIds: targetIds,
      resultCardIds: targetIds,
      additionalValue: 5,
      maxCombinations: 10,
      topCount: 1,
    })

    expect(result.length).toBe(1)
    expect(result.overflow).toBe(false)
    expect(result.items).toHaveLength(1)
    expect(result.items[0].cards).toEqual(cards)
  })

  it('按秒伤保留指定数量的最优结果', () => {
    const result = runAutoMock({
      coreOptions: baseOptions,
      targetCardIds: targetIds,
      resultCardIds: resultIds,
      additionalValue: 2,
      maxCombinations: 10,
      topCount: 1,
    })

    expect(result.length).toBe(2)
    expect(result.overflow).toBe(false)
    expect(result.items).toHaveLength(1)
    expect(result.items[0].cards[0]).toEqual({
      id: CARD_IDS.ningBingShuangHua,
      level: 0,
    })
    expect(result.items[0].cards).toContainEqual({
      id: CARD_IDS.lieYanFenShen,
      level: 2,
    })
  })

  it('组合数超限时不执行模拟', () => {
    const result = runAutoMock({
      coreOptions: baseOptions,
      targetCardIds: targetIds,
      resultCardIds: resultIds,
      additionalValue: 2,
      maxCombinations: 1,
      topCount: 1,
    })

    expect(result.length).toBe(2)
    expect(result.overflow).toBe(true)
    expect(result.items).toEqual([])
  })

  it('按照页面传入的模拟时间计算秒伤', () => {
    const cards = [
      { id: CARD_IDS.ningBingShuangHua, level: 0 },
    ]
    const run = (duration: number) =>
      runAutoMock({
        coreOptions: {
          ...baseOptions,
          cards,
          duration,
        },
        targetCardIds: [],
        resultCardIds: [],
        additionalValue: 0,
        maxCombinations: 1,
        topCount: 1,
      })

    expect(run(1).items[0].dps).toBe(70715)
    expect(run(2).items[0].dps).toBe(106072.5)
  })
})
