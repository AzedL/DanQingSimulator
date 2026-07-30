import { describe, expect, it } from 'vitest'
import { join, split } from './key'

describe('key', () => {
  it('使用连字符拼接名称片段', () => {
    expect(join('苍木', '脉冲', '神木骰')).toBe('苍木-脉冲-神木骰')
    expect(join()).toBe('')
  })

  it('返回名称的第一个片段', () => {
    expect(split('苍木-脉冲-神木骰')).toBe('苍木')
    expect(split('神木骰')).toBe('神木骰')
  })
})
