import { describe, expect, it, vi } from 'vitest'
import { Queue } from '../core/Queue'
import { RefreshableBuff } from './RefreshableBuff'

describe('RefreshableBuff', () => {
  it('重复触发只生效一次并刷新持续时间', () => {
    const queue = new Queue()
    const onStart = vi.fn()
    const onEnd = vi.fn()
    const buff = new RefreshableBuff(queue, { onStart, onEnd })

    buff.refresh(2)
    queue.process(1)
    buff.refresh(2)
    queue.process(1)

    expect(onStart).toHaveBeenCalledOnce()
    expect(onEnd).not.toHaveBeenCalled()

    queue.process(1)
    expect(onEnd).toHaveBeenCalledOnce()
  })

  it('重置后废弃等待中的结束任务', () => {
    const queue = new Queue()
    const onEnd = vi.fn()
    const buff = new RefreshableBuff(queue, {
      onStart: vi.fn(),
      onEnd,
    })

    buff.refresh(1)
    buff.reset()
    queue.process(1)

    expect(onEnd).not.toHaveBeenCalled()
  })
})
