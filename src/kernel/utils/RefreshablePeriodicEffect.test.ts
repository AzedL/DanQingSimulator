import { describe, expect, it, vi } from 'vitest'
import { Queue } from '../core/Queue'
import { RefreshablePeriodicEffect } from './RefreshablePeriodicEffect'

function advance(queue: Queue, seconds: number) {
  for (let time = 0; time < seconds; time += 0.5) {
    queue.process(0.5)
  }
}

describe('RefreshablePeriodicEffect', () => {
  it('等待指定间隔后开始并完成固定次数', () => {
    const queue = new Queue()
    const onTick = vi.fn()
    const onEnd = vi.fn()
    const effect = new RefreshablePeriodicEffect(queue, {
      onTick,
      onEnd,
    })

    expect(effect.refresh(2, 3)).toBeUndefined()
    advance(queue, 1.5)
    expect(onTick).not.toHaveBeenCalled()

    advance(queue, 4.5)
    expect(onTick).toHaveBeenCalledTimes(3)
    expect(onEnd).toHaveBeenCalledOnce()
  })

  it('刷新时返回旧周期剩余次数并重新等待完整间隔', () => {
    const queue = new Queue()
    const onTick = vi.fn()
    const effect = new RefreshablePeriodicEffect(queue, {
      onTick,
    })

    effect.refresh(2, 3)
    advance(queue, 2)
    expect(onTick).toHaveBeenCalledOnce()

    advance(queue, 1)
    expect(effect.refresh(2, 3)).toBe(2)

    advance(queue, 1.5)
    expect(onTick).toHaveBeenCalledOnce()

    advance(queue, 0.5)
    expect(onTick).toHaveBeenCalledTimes(2)
  })

  it('刷新后旧周期已经入队的任务不再执行', () => {
    const queue = new Queue()
    const onTick = vi.fn()
    const effect = new RefreshablePeriodicEffect(queue, {
      onTick,
    })

    effect.refresh(2, 2)
    advance(queue, 1)
    expect(effect.refresh(3, 1)).toBe(2)

    advance(queue, 2)
    expect(onTick).not.toHaveBeenCalled()

    advance(queue, 1)
    expect(onTick).toHaveBeenCalledOnce()
  })

  it('结算回调中刷新时旧周期的后续任务失效', () => {
    const queue = new Queue()
    const onTick = vi.fn()
    let effect: RefreshablePeriodicEffect
    effect = new RefreshablePeriodicEffect(queue, {
      onTick: () => {
        onTick()
        if (onTick.mock.calls.length === 1) {
          effect.refresh(2, 2)
        }
      },
    })

    effect.refresh(2, 3)
    advance(queue, 6)

    expect(onTick).toHaveBeenCalledTimes(3)
  })

  it('reset 使等待中的周期失效', () => {
    const queue = new Queue()
    const onTick = vi.fn()
    const effect = new RefreshablePeriodicEffect(queue, {
      onTick,
    })

    effect.refresh(1, 1)
    effect.reset()
    advance(queue, 1)

    expect(onTick).not.toHaveBeenCalled()
  })
})
