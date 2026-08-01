import { describe, expect, it, vi } from 'vitest'
import { Queue } from '../core/Queue'
import { StackedEffect } from './StackedEffect'

function advance(queue: Queue, seconds: number) {
  for (let time = 0; time < seconds; time += 0.5) {
    queue.process(0.5)
  }
}

describe('StackedEffect', () => {
  it('首次增加层数后等待一个间隔触发并在持续时间内结算', () => {
    const queue = new Queue()
    const onTick = vi.fn()
    const effect = new StackedEffect(queue, {
      interval: 2,
      duration: 10,
      onTick,
    })

    effect.add()
    advance(queue, 1.5)
    expect(onTick).not.toHaveBeenCalled()

    advance(queue, 0.5)
    expect(onTick).toHaveBeenCalledWith(1)

    advance(queue, 8)
    expect(onTick).toHaveBeenCalledTimes(5)
  })

  it('新层数沿用已有循环节奏且各自完整贡献固定次数', () => {
    const queue = new Queue()
    const layers: number[] = []
    const effect = new StackedEffect(queue, {
      interval: 2,
      duration: 10,
      onTick: (value) => layers.push(value),
    })

    effect.add()
    advance(queue, 1)
    effect.add()
    advance(queue, 11)

    expect(layers).toEqual([2, 2, 2, 2, 2])
    expect(layers.reduce((total, value) => total + value, 0)).toBe(10)
  })

  it('结算回调中新增的层数沿用下一次循环且完整结算', () => {
    const queue = new Queue()
    const layers: number[] = []
    let effect: StackedEffect
    effect = new StackedEffect(queue, {
      interval: 2,
      duration: 10,
      onTick: (value) => {
        layers.push(value)
        if (layers.length === 1) effect.add()
      },
    })

    effect.add()
    advance(queue, 12)

    expect(layers).toEqual([1, 2, 2, 2, 2, 1])
    expect(layers.reduce((total, value) => total + value, 0)).toBe(10)
  })

  it('层数归零后由已有循环停止并允许重新启动', () => {
    const queue = new Queue()
    const onTick = vi.fn()
    const effect = new StackedEffect(queue, {
      interval: 2,
      duration: 3,
      onTick,
    })

    effect.add()
    advance(queue, 4)
    expect(onTick).toHaveBeenCalledOnce()

    effect.add()
    advance(queue, 2)
    expect(onTick).toHaveBeenCalledTimes(2)
  })

  it('层数暂时归零但循环尚未检查时不创建第二条循环', () => {
    const queue = new Queue()
    const onTick = vi.fn()
    const effect = new StackedEffect(queue, {
      interval: 2,
      duration: 3,
      onTick,
    })

    effect.add()
    advance(queue, 3.5)
    effect.add()
    advance(queue, 2.5)

    expect(onTick).toHaveBeenCalledTimes(3)
  })

  it('最大层数仅限制结算层数并保留原始层数的过期顺序', () => {
    const queue = new Queue()
    const layers: number[] = []
    const effect = new StackedEffect(queue, {
      interval: 2,
      duration: 10,
      maxLayers: 2,
      onTick: (value) => layers.push(value),
    })

    effect.add(2)
    advance(queue, 2.5)
    effect.add()
    advance(queue, 7.5)
    expect(layers).toEqual([2, 2, 2, 2, 2])

    advance(queue, 2)
    expect(layers).toEqual([2, 2, 2, 2, 2, 1])
  })

  it('支持小数层数', () => {
    const queue = new Queue()
    const onTick = vi.fn()
    const effect = new StackedEffect(queue, {
      interval: 1,
      duration: 1,
      onTick,
    })

    effect.add(0.5)
    advance(queue, 1)

    expect(onTick).toHaveBeenCalledWith(0.5)
  })

  it('reset 清空层数和运行状态', () => {
    const queue = new Queue()
    const onTick = vi.fn()
    const effect = new StackedEffect(queue, {
      interval: 1,
      duration: 2,
      onTick,
    })

    effect.add()
    effect.reset()
    advance(queue, 1)

    expect(onTick).not.toHaveBeenCalled()
  })
})
