import { describe, expect, it } from 'vitest'
import { Core, type CoreOptions } from './Core'

function createOptions(useLightMode = false): CoreOptions {
  return {
    cards: [],
    duration: 1,
    burstDps: 0,
    sustainedDps: 0,
    useRandom: false,
    useLightMode,
  }
}

describe('Damage', () => {
  it('通过四系入口记录伤害、次数和来源', () => {
    const core = new Core(createOptions())

    core.fire.add(100, 2, '天火伤害', 'dq-fire')
    core.ice.add(200, 3, '玄冰伤害', 'dq-ice')
    core.thunder.add(300, 4, '神雷伤害', 'dq-thunder')
    core.wood.add(400, 5, '苍木伤害', 'dq-wood')
    core.damage.commitTick()

    expect(core.damage.output()).toEqual({
      damageMap: {
        '天火伤害-dq-fire': 100,
        '玄冰伤害-dq-ice': 200,
        '神雷伤害-dq-thunder': 300,
        '苍木伤害-dq-wood': 400,
      },
      countMap: {
        '天火伤害-dq-fire': 2,
        '玄冰伤害-dq-ice': 3,
        '神雷伤害-dq-thunder': 4,
        '苍木伤害-dq-wood': 5,
      },
      damageMapList: [
        {
          '天火伤害-dq-fire': 100,
          '玄冰伤害-dq-ice': 200,
          '神雷伤害-dq-thunder': 300,
          '苍木伤害-dq-wood': 400,
          total: 1000,
        },
      ],
      countMapList: [
        {
          '天火伤害-dq-fire': 2,
          '玄冰伤害-dq-ice': 3,
          '神雷伤害-dq-thunder': 4,
          '苍木伤害-dq-wood': 5,
          total: 14,
        },
      ],
      tickCount: 1,
      totalDamage: 1000,
    })
  })

  it('每次 commitTick 保存当前累计结果', () => {
    const core = new Core(createOptions())

    core.fire.add(100, 1, '伤害', 'dq-test')
    core.damage.commitTick()
    core.fire.add(50, 1, '伤害', 'dq-test')
    core.damage.commitTick()

    const output = core.damage.output()

    expect(output.damageMapList.map((item) => item.total)).toEqual([100, 150])
    expect(output.countMapList.map((item) => item.total)).toEqual([1, 2])
    expect(output.tickCount).toBe(2)
    expect(output.totalDamage).toBe(150)
  })

  it('轻量模式只保留总伤害和 tick 数', () => {
    const core = new Core(createOptions(true))

    core.wood.add(100, 1, '伤害', 'dq-test')
    core.damage.commitTick()

    const output = core.damage.output()

    expect(output.damageMapList).toEqual([])
    expect(output.countMapList).toEqual([])
    expect(output.tickCount).toBe(1)
    expect(output.totalDamage).toBe(100)
  })

  it('全系增伤之间加算并与单系增伤乘算', () => {
    const core = new Core(createOptions())

    core.damage.addBoost(0.33)
    core.damage.addBoost(0.2)
    core.fire.addBoost(0.5)
    core.ice.addBoost(0.2)

    core.fire.add(100, 1, '天火伤害')
    core.ice.add(100, 1, '玄冰伤害')
    core.thunder.add(100, 1, '神雷伤害')
    core.wood.add(100, 1, '苍木伤害')

    expect(core.damage.output().damageMap).toEqual({
      天火伤害: 100 * 1.53 * 1.5,
      玄冰伤害: 100 * 1.53 * 1.2,
      神雷伤害: 100 * 1.53,
      苍木伤害: 100 * 1.53,
    })
  })

  it('可以分别移除全系增伤和单系增伤', () => {
    const core = new Core(createOptions())

    core.damage.addBoost(0.33)
    core.damage.addBoost(0.2)
    core.fire.addBoost(0.5)
    core.damage.removeBoost(0.2)
    core.fire.removeBoost(0.5)
    core.fire.add(100, 1, '伤害')

    expect(core.damage.output().damageMap['伤害']).toBe(133)
  })

  it('累计洞察层数并在技能读取时一次性消费', () => {
    const core = new Core(createOptions())

    core.damage.addInsight(3)
    core.damage.addInsight(2)

    expect(core.damage.insightLayers).toBe(5)
    expect(core.damage.consumeInsightMultiplier()).toBe(1.15)
    expect(core.damage.insightLayers).toBe(0)
    expect(core.damage.consumeInsightMultiplier()).toBe(1)
  })

  it('reset 清空伤害数据和全部增伤状态', () => {
    const core = new Core(createOptions())

    core.damage.addBoost(0.33)
    core.fire.addBoost(0.1)
    core.ice.addBoost(0.2)
    core.thunder.addBoost(0.3)
    core.wood.addBoost(0.4)
    core.damage.addInsight(3)
    core.ice.add(100, 1, '伤害', 'dq-test')
    core.damage.commitTick()
    core.reset()

    expect(core.damage.output()).toEqual({
      damageMap: {},
      countMap: {},
      damageMapList: [],
      countMapList: [],
      tickCount: 0,
      totalDamage: 0,
    })
    expect(core.damage.insightLayers).toBe(0)

    core.fire.add(100, 1, '天火伤害')
    core.ice.add(100, 1, '玄冰伤害')
    core.thunder.add(100, 1, '神雷伤害')
    core.wood.add(100, 1, '苍木伤害')

    expect(core.damage.output().damageMap).toEqual({
      天火伤害: 100,
      玄冰伤害: 100,
      神雷伤害: 100,
      苍木伤害: 100,
    })
  })
})
