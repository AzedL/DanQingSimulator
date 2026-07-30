import { describe, expect, it } from 'vitest'
import { CooldownTime } from './CooldownTime'

describe('CooldownTime', () => {
  it('经过指定次数的 tick 后进入就绪状态', () => {
    const cooldown = new CooldownTime(3)

    expect(cooldown.settle()).toBe(false)

    cooldown.tick()
    expect(cooldown.settle()).toBe(false)

    cooldown.tick()
    expect(cooldown.settle()).toBe(false)

    cooldown.tick()
    expect(cooldown.settle()).toBe(true)
    expect(cooldown.settle()).toBe(false)
  })

  it('支持首次 tick 前默认就绪', () => {
    const cooldown = new CooldownTime(2, true)

    expect(cooldown.settle()).toBe(true)
    expect(cooldown.settle()).toBe(false)
  })

  it('单次 tick 越过冷却边界时保留剩余时间', () => {
    const cooldown = new CooldownTime(5)

    cooldown.tick(7)
    expect(cooldown.settle()).toBe(false)

    cooldown.tick(4)
    expect(cooldown.settle()).toBe(true)
  })

  it('传入值为冷却时间倍数时使用默认 tick', () => {
    const cooldown = new CooldownTime(3)

    cooldown.tick(3)
    expect(cooldown.settle()).toBe(false)

    cooldown.tick(2)
    expect(cooldown.settle()).toBe(true)
  })

  it('tick 值为零时不推进冷却', () => {
    const cooldown = new CooldownTime(1, false, 0)

    cooldown.tick()

    expect(cooldown.settle()).toBe(false)
  })

  it('reset 后恢复初始就绪状态', () => {
    const readyCooldown = new CooldownTime(1, true)
    const waitingCooldown = new CooldownTime(1)

    readyCooldown.settle()
    waitingCooldown.tick()

    readyCooldown.reset()
    waitingCooldown.reset()

    expect(readyCooldown.settle()).toBe(true)
    expect(waitingCooldown.settle()).toBe(false)
  })
})
