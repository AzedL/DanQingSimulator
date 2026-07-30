import { afterEach, describe, expect, it, vi } from 'vitest'
import { DiscreteState, fluctuate, handleProbability } from './probability'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('fluctuate', () => {
  it('未传入波动比例时返回原值', () => {
    expect(fluctuate(100)).toBe(100)
  })

  it('按传入比例计算数值波动', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.75)

    expect(fluctuate(100, 0.2)).toBe(110)
  })
})

describe('handleProbability', () => {
  it('期望模式返回触发次数期望', () => {
    expect(handleProbability(0.25, false, 8)).toBe(2)
    expect(handleProbability(0.25)).toBe(0.25)
  })

  it('随机模式统计每次成功触发', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.1).mockReturnValueOnce(0.9).mockReturnValueOnce(0.4)

    expect(handleProbability(0.5, true, 3)).toBe(2)
  })

  it('将概率限制在有效范围内', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)

    expect(handleProbability(-1, true)).toBe(0)
    expect(handleProbability(2, true)).toBe(1)
  })

  it('随机次数为零时返回零', () => {
    expect(handleProbability(0.5, true, 0)).toBe(0)
  })
})

describe('DiscreteState', () => {
  it('依次返回状态并在序列结束后初始化下一轮', () => {
    let cycle = 0
    const state = new DiscreteState(() => {
      cycle++
      return [`${cycle}-1`, `${cycle}-2`]
    })

    expect(state.next()).toBe('1-1')
    expect(state.next()).toBe('1-2')
    expect(state.next()).toBe('2-1')
  })

  it('reset 后从新序列的起点开始', () => {
    let cycle = 0
    const state = new DiscreteState(() => {
      cycle++
      return [cycle, cycle]
    })

    expect(state.next()).toBe(1)

    state.reset()

    expect(state.next()).toBe(2)
  })
})
