import { describe, expect, it } from 'vitest'
import type { CoreOptions, DamageOutput } from '../../kernel'
import {
  buildDamageDetails,
  calculateDps,
  mergeDamageDetails,
} from './result'

const options: CoreOptions = {
  cards: [],
  duration: 10,
  burstDps: 0,
  sustainedDps: 100,
  useRandom: false,
}

const output: DamageOutput = {
  damageMap: {
    '连锁闪电-本体': 600,
    '连锁闪电-紫电螭吻': 400,
    本体伤害扣减: -200,
  },
  countMap: {},
  damageMapList: [],
  countMapList: [],
  tickCount: 10,
  totalDamage: 800,
}

describe('模拟结果转换', () => {
  it('总秒伤只包含内核伤害', () => {
    expect(calculateDps(output, options)).toBe(80)
  })

  it('生成总计和各伤害明细', () => {
    expect(buildDamageDetails(output, options)).toEqual([
      { key: 'total', dps: 80, proportion: 100 },
      { key: '连锁闪电-本体', dps: 60, proportion: 75 },
      { key: '连锁闪电-紫电螭吻', dps: 40, proportion: 50 },
      { key: '本体伤害扣减', dps: -20, proportion: -25 },
    ])
  })

  it('按伤害名称第一段合并同名伤害', () => {
    const detail = buildDamageDetails(output, options)
    expect(mergeDamageDetails(detail)).toContainEqual({
      key: '连锁闪电',
      dps: 100,
      proportion: 125,
    })
  })

  it('总秒伤为0时明细占比为0', () => {
    const emptyOptions = { ...options, sustainedDps: 0 }
    const emptyOutput = {
      ...output,
      damageMap: { 测试: 0 },
      totalDamage: 0,
    }

    expect(buildDamageDetails(emptyOutput, emptyOptions)).toEqual([
      { key: 'total', dps: 0, proportion: 100 },
      { key: '测试', dps: 0, proportion: 0 },
    ])
  })
})
