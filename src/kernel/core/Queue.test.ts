import { describe, expect, it, vi } from 'vitest'
import { Queue } from './Queue'

describe('Queue', () => {
  it('延迟不大于零时立即执行任务', () => {
    const queue = new Queue()
    const task = vi.fn()

    queue.enqueue(task)
    queue.enqueue(task, -1)

    expect(task).toHaveBeenCalledTimes(2)
  })

  it('按传入时间推进任务', () => {
    const queue = new Queue()
    const task = vi.fn()

    queue.enqueue(task, 1)
    queue.process(0.5)

    expect(task).not.toHaveBeenCalled()

    queue.process(0.5)

    expect(task).toHaveBeenCalledOnce()
  })

  it('同一次 process 不处理任务中新加入的任务', () => {
    const queue = new Queue()
    const result: string[] = []

    queue.enqueue(() => {
      result.push('first')
      queue.enqueue(() => result.push('second'), 0.5)
    }, 0.5)

    queue.process(0.5)
    expect(result).toEqual(['first'])

    queue.process(0.5)
    expect(result).toEqual(['first', 'second'])
  })

  it('队列为空时 process 不执行任务', () => {
    const queue = new Queue()

    expect(() => queue.process(0.5)).not.toThrow()
  })

  it('reset 清空等待中的任务', () => {
    const queue = new Queue()
    const task = vi.fn()

    queue.enqueue(task, 0.5)
    queue.reset()
    queue.process(0.5)

    expect(task).not.toHaveBeenCalled()
  })
})
