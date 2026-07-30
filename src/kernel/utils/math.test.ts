import { describe, expect, it } from 'vitest'
import { ceil, fixed, max, min, toInt, toNumber } from './math'

describe('math', () => {
  it('按指定小数位数舍入', () => {
    expect(fixed(1.235)).toBe(1.24)
    expect(fixed(1.2345, 3)).toBe(1.234)
  })

  it('向上取整', () => {
    expect(ceil(1.01)).toBe(2)
  })

  it('返回最小值和最大值', () => {
    expect(min(3, -1, 2)).toBe(-1)
    expect(max(3, -1, 2)).toBe(3)
  })

  it('解析小数并在无效时返回零', () => {
    expect(toNumber('12.5px')).toBe(12.5)
    expect(toNumber('invalid')).toBe(0)
  })

  it('解析整数并在无效时返回零', () => {
    expect(toInt('12.5px')).toBe(12)
    expect(toInt('invalid')).toBe(0)
  })
})
