import { afterEach, describe, expect, it, vi } from 'vitest'
import { Card, type CardId } from '../cards/Card'
import { cards } from '../cards'
import { Core, type CoreOptions } from './Core'

const TEST_CARD_IDS = {
  active: 'dq-active' as CardId,
  passive: 'ly-passive' as CardId,
  unselected: 'dq-unselected' as CardId,
}

function createOptions(duration = 1): CoreOptions {
  return {
    cards: [
      { id: TEST_CARD_IDS.passive, level: 2 },
      { id: TEST_CARD_IDS.active, level: 4 },
    ],
    duration,
    burstDps: 0,
    sustainedDps: 0,
    useRandom: false,
  }
}

const events: string[] = []

class ActiveTestCard extends Card {
  constructor(core: Core, level: number) {
    super(core, 'active', TEST_CARD_IDS.active, '主动测试卡片', level)
  }

  protected init() {}

  tick() {
    events.push('active')
    this.core.queue.enqueue(() => events.push('after-active'), 0.5)
  }

  reset() {
    events.push('reset-active')
  }
}

class PassiveTestCard extends Card {
  constructor(core: Core, level: number) {
    super(core, 'passive', TEST_CARD_IDS.passive, '被动测试卡片', level)
  }

  protected init() {}

  reset() {
    events.push('reset-passive')
  }
}

afterEach(() => {
  delete cards[TEST_CARD_IDS.active]
  delete cards[TEST_CARD_IDS.unselected]
  delete cards[TEST_CARD_IDS.passive]
  events.length = 0
  vi.restoreAllMocks()
})

describe('Core', () => {
  it('按 cards 对象顺序创建实例并建立 cardsMap 和 actions', () => {
    cards[TEST_CARD_IDS.active] = ActiveTestCard
    cards[TEST_CARD_IDS.passive] = PassiveTestCard

    const core = new Core(createOptions())

    expect([...core.cardsMap.keys()]).toEqual([
      TEST_CARD_IDS.active,
      TEST_CARD_IDS.passive,
    ])
    expect(core.cardsMap.get(TEST_CARD_IDS.active)?.level).toBe(4)
    expect(core.cardsMap.get(TEST_CARD_IDS.passive)?.level).toBe(2)
    expect(core.actions).toEqual([core.cardsMap.get(TEST_CARD_IDS.active)])
  })

  it('按 Queue 前半段、Active、Queue 后半段、Damage 的顺序执行', () => {
    cards[TEST_CARD_IDS.active] = ActiveTestCard
    cards[TEST_CARD_IDS.passive] = PassiveTestCard

    const core = new Core(createOptions())
    core.queue.enqueue(() => events.push('before-active'), 0.5)
    vi.spyOn(core.damage, 'commitTick').mockImplementation(() => {
      events.push('damage')
    })

    core.exec()

    expect(events).toEqual(['before-active', 'active', 'after-active', 'damage'])
  })

  it('按照 duration 执行指定次数', () => {
    cards[TEST_CARD_IDS.active] = ActiveTestCard

    const core = new Core(createOptions(2))
    core.exec()

    expect(events.filter((event) => event === 'active')).toHaveLength(2)
    expect(core.damage.output().tickCount).toBe(2)
  })

  it('忽略无法匹配的卡片选项和卡片类', () => {
    cards[TEST_CARD_IDS.unselected] = ActiveTestCard

    const core = new Core(createOptions())

    expect(core.cardsMap.size).toBe(0)
    expect(core.actions).toEqual([])
  })

  it('reset 按顺序清空 Queue、Damage 和全部卡片', () => {
    cards[TEST_CARD_IDS.active] = ActiveTestCard
    cards[TEST_CARD_IDS.passive] = PassiveTestCard

    const core = new Core(createOptions())
    const task = vi.fn()
    core.queue.enqueue(task, 0.5)
    core.fire.add(100, 1, '伤害', TEST_CARD_IDS.active)

    core.reset()
    core.queue.process(0.5)

    expect(task).not.toHaveBeenCalled()
    expect(core.damage.output().totalDamage).toBe(0)
    expect(events).toEqual(['reset-active', 'reset-passive'])
  })
})
