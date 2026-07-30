import { describe, expect, it } from 'vitest'
import { Core, type CoreOptions } from '../core/Core'
import { Card, type CardId } from './Card'

const TEST_CARD_ID = 'dq-test' as CardId

const options: CoreOptions = {
  cards: [],
  duration: 1,
  burstDps: 0,
  sustainedDps: 0,
  useRandom: false,
}

class TestCard extends Card {
  declare initialized: boolean
  resetCount = 0

  constructor(core: Core) {
    super(core, 'passive', TEST_CARD_ID, '测试卡片', 3)
  }

  protected init() {
    this.initialized = true
  }

  reset() {
    this.resetCount++
  }
}

describe('Card', () => {
  it('暴露卡片公共信息并执行子类初始化', () => {
    const core = new Core(options)
    const card = new TestCard(core)

    expect(card.type).toBe('passive')
    expect(card.id).toBe(TEST_CARD_ID)
    expect(card.key).toBe('测试卡片')
    expect(card.level).toBe(3)
    expect(card.core).toBe(core)
    expect(card.initialized).toBe(true)
  })
})
