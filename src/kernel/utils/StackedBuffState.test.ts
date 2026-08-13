import { afterEach, describe, expect, it, vi } from 'vitest'
import { StackedBuffState } from './StackedBuffState'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('StackedBuffState', () => {
  it('固定层数叠加后逐次消耗', () => {
    const state = new StackedBuffState(false)

    state.addFixed(3)
    state.addFixed(2)

    expect(Array.from({ length: 6 }, () => state.consume()))
      .toEqual([1, 1, 1, 1, 1, 0])
  })

  it('期望模式精确计算均匀随机层数', () => {
    const state = new StackedBuffState(false)

    state.addUniform(1, 3)

    const values = Array.from({ length: 4 }, () => state.consume())
    expect(values[0]).toBe(1)
    expect(values[1]).toBeCloseTo(2 / 3)
    expect(values[2]).toBeCloseTo(1 / 3)
    expect(values[3]).toBe(0)
  })

  it('期望模式对多次投骰层数做卷积叠加', () => {
    const state = new StackedBuffState(false)

    state.addUniform(1, 2)
    state.consume()
    state.addUniform(1, 2)

    expect(Array.from({ length: 4 }, () => state.consume()))
      .toEqual([1, 3 / 4, 1 / 4, 0])
  })

  it('随机模式保存实际层数并与固定层数叠加', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    const state = new StackedBuffState(true)

    state.addUniform(1, 3)
    state.addFixed(2)

    expect(Array.from({ length: 6 }, () => state.consume()))
      .toEqual([1, 1, 1, 1, 1, 0])
  })

  it('重置后清空层数', () => {
    const state = new StackedBuffState(false)
    state.addFixed(3)

    state.reset()

    expect(state.consume()).toBe(0)
  })

  it('拒绝无效随机区间', () => {
    const state = new StackedBuffState(false)

    expect(() => state.addUniform(3, 1)).toThrow(RangeError)
    expect(() => state.addUniform(-1, 1)).toThrow(RangeError)
  })
})
