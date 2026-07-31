import { describe, expect, it } from 'vitest'
import { getAutoMockWorkerCount } from './autoMockWorkerPool'

describe('自动模拟 Worker 池', () => {
  it('未启用白名单时始终使用一个 Worker', () => {
    expect(getAutoMockWorkerCount(false, false, 16)).toBe(1)
    expect(getAutoMockWorkerCount(false, true, 8)).toBe(1)
  })

  it('启用白名单时桌面端至多使用四个 Worker', () => {
    expect(getAutoMockWorkerCount(true, false, 16)).toBe(4)
    expect(getAutoMockWorkerCount(true, false, 4)).toBe(4)
    expect(getAutoMockWorkerCount(true, false, 2)).toBe(2)
  })

  it('启用白名单时移动端至多使用两个 Worker', () => {
    expect(getAutoMockWorkerCount(true, true, 16)).toBe(2)
    expect(getAutoMockWorkerCount(true, true, 2)).toBe(2)
  })

  it('浏览器未提供逻辑处理器数时使用一个 Worker', () => {
    expect(getAutoMockWorkerCount(true, false, undefined)).toBe(1)
  })
})
