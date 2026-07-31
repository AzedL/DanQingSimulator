import { describe, expect, it } from 'vitest'
import {
  CARD_IDS,
  Core,
  type CardId,
  type CoreOptions,
} from '../../kernel'
import { fixed } from '../../kernel/utils/math'
import { calculateDps } from '../simulator/result'
import {
  buildAutoMockCards,
  countAutoMockCards,
  mergeAutoMockResults,
  runAutoMock,
  runAutoMockPartition,
  type AutoMockInput,
  type AutoMockItem,
  type AutoMockResult,
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

function runLegacyAutoMock(
  input: AutoMockInput,
): AutoMockResult {
  const generatedCombinations = buildAutoMockCards(
    input.coreOptions.cards,
    input.targetCardIds,
    input.additionalValue,
  )
  const combinations = generatedCombinations.length
    ? generatedCombinations
    : [input.coreOptions.cards]
  const length = combinations.length
  if (length > input.maxCombinations) {
    return { length, overflow: true, items: [] }
  }

  const resultIdSet = new Set(input.resultCardIds)
  const items: AutoMockItem[] = []
  combinations.forEach((cards, combinationIndex) => {
    const options: CoreOptions = {
      ...input.coreOptions,
      cards,
      useRandom: false,
      useLightMode: true,
    }
    const core = new Core(options)
    core.exec()
    const item: AutoMockItem = {
      cards: cards.filter((card) =>
        resultIdSet.has(card.id),
      ),
      dps: fixed(
        calculateDps(core.damage.output(), options),
      ),
      combinationIndex,
    }
    const index = items.findIndex(
      (current) => item.dps > current.dps,
    )
    items.splice(index === -1 ? items.length : index, 0, item)
    if (items.length > input.topCount) items.pop()
  })

  return { length, overflow: false, items }
}

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

  it('不创建卡片对象即可统计组合数', () => {
    expect(
      countAutoMockCards(baseOptions.cards, targetIds, 2),
    ).toBe(2)
    expect(
      countAutoMockCards(baseOptions.cards, targetIds, 7),
    ).toBe(0)
    expect(
      countAutoMockCards(baseOptions.cards, targetIds, 0),
    ).toBe(1)
  })

  it('两个分片合并后与单线程结果完全一致', () => {
    const input = {
      coreOptions: baseOptions,
      targetCardIds: targetIds,
      resultCardIds: resultIds,
      additionalValue: 2,
      maxCombinations: 10,
      topCount: 20,
    }
    const serial = runAutoMock(input)
    const parallel = mergeAutoMockResults(
      [
        runAutoMockPartition(input, 0, 2),
        runAutoMockPartition(input, 1, 2),
      ],
      input.topCount,
    )

    expect(parallel).toEqual(serial)
  })

  it('四个分片合并后与单线程结果完全一致', () => {
    const input = {
      coreOptions: baseOptions,
      targetCardIds: targetIds,
      resultCardIds: resultIds,
      additionalValue: 2,
      maxCombinations: 10,
      topCount: 20,
    }
    const serial = runAutoMock(input)
    const parallel = mergeAutoMockResults(
      Array.from({ length: 4 }, (_, workerIndex) =>
        runAutoMockPartition(input, workerIndex, 4),
      ),
      input.topCount,
    )

    expect(parallel).toEqual(serial)
  })

  it('没有可追加组合时只由首个分片模拟原始配置', () => {
    const cards = targetIds.map((id) => ({ id, level: 5 }))
    const input: AutoMockInput = {
      coreOptions: { ...baseOptions, cards },
      targetCardIds: targetIds,
      resultCardIds: targetIds,
      additionalValue: 5,
      maxCombinations: 10,
      topCount: 20,
    }
    const first = runAutoMockPartition(input, 0, 2)
    const second = runAutoMockPartition(input, 1, 2)

    expect(first.items).toHaveLength(1)
    expect(second.items).toEqual([])
    expect(mergeAutoMockResults([first, second], input.topCount))
      .toEqual(runAutoMock(input))
  })

  it('拒绝无效的 Worker 分片参数', () => {
    const input: AutoMockInput = {
      coreOptions: baseOptions,
      targetCardIds: targetIds,
      resultCardIds: resultIds,
      additionalValue: 2,
      maxCombinations: 10,
      topCount: 20,
    }

    expect(() => runAutoMockPartition(input, 2, 2))
      .toThrow(RangeError)
    expect(mergeAutoMockResults([], input.topCount)).toEqual({
      length: 0,
      overflow: false,
      items: [],
    })
  })

  it('新版流式模型与旧版物化模型的 Top 20 完全一致', () => {
    const fiveTargetIds: CardId[] = [
      CARD_IDS.shuangHanPoLie,
      CARD_IDS.hanChaoBingYong,
      CARD_IDS.linShuangHanYong,
      CARD_IDS.hanJingCi,
      CARD_IDS.shuangCiHanYu,
    ]
    const input: AutoMockInput = {
      coreOptions: baseOptions,
      targetCardIds: fiveTargetIds,
      resultCardIds: [
        CARD_IDS.ningBingShuangHua,
        ...fiveTargetIds,
        CARD_IDS.lieYanFenShen,
      ],
      additionalValue: 7,
      maxCombinations: 1000,
      topCount: 20,
    }

    expect(countAutoMockCards(
      input.coreOptions.cards,
      input.targetCardIds,
      input.additionalValue,
    )).toBe(184)
    const legacy = runLegacyAutoMock(input)
    const serial = runAutoMock(input)
    const parallel = mergeAutoMockResults(
      Array.from({ length: 4 }, (_, workerIndex) =>
        runAutoMockPartition(input, workerIndex, 4),
      ),
      input.topCount,
    )

    expect(serial).toEqual(legacy)
    expect(parallel).toEqual(legacy)
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
