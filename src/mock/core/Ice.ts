import { join } from '../utils/key'
import { max } from '../utils/math'
import { handleProbability } from '../utils/probability'
import type { Core } from './Core'

export class Ice {
  private _key = '冰箭'
  private _core: Core
  private _damage: number = 0

  private _linFengValue = 0
  private _shangGuanCeValue = 0

  private _lastCountMap: Record<string, number> = {}
  private _countMap: Record<string, number> = {}
  private _countMapList: Record<'total' & string, number>[] = []

  constructor(core: Core) {
    this._core = core
    this._damage = core.options.iceDamage
    this._linFengValue = core.options.linFengValueIce
    this._shangGuanCeValue = core.options.shangGuanCeValue
  }

  private _add(count: number, key: string) {
    this._countMap[key] = this._countMap[key] || 0
    this._countMap[key] += count

    this.handleShangGuanCe(count)
  }
  private handleLinFeng(count: number) {
    if (!this._linFengValue) return

    const key = '林峰'
    let c = 0
    const useRandom = this._core.coreOptions.useRandom
    for (let i = 0; i < count; i++) {
      c += handleProbability(this._linFengValue, useRandom)
    }
    this._add(c, key)
  }
  private handleShangGuanCe(count: number) {
    if (!this._shangGuanCeValue) return

    let c = 0
    const useRandom = this._core.coreOptions.useRandom
    for (let i = 0; i < count; i++) {
      c += handleProbability(this._shangGuanCeValue, useRandom)
    }
    this._core.fire.add(c)
  }
  public add(count: number, ...rest: string[]) {
    const key = join(...rest)
    this._add(count, key)
    this.handleLinFeng(count)
  }

  public getIncrement() {
    let total = 0
    for (let key in this._countMap) {
      const current = this._countMap[key] || 0
      const last = this._lastCountMap[key] || 0
      const count = current - last
      total += count
    }
    return total
  }

  public getIncrementInTime(time = 10) {
    let total = 0
    for (let key in this._countMap) {
      const count = this._countMap[key] || 0
      total += count
    }
    return total - (this._countMapList[max(-1, this._countMapList.length - time)]?.total || 0)
  }

  public settle() {
    let total = 0
    for (let key in this._countMap) {
      const current = this._countMap[key] || 0
      total += current
      const last = this._lastCountMap[key] || 0
      const count = current - last
      if (count) this.settleDamage(count, key)
    }

    this._lastCountMap = { ...this._countMap }
    this._countMapList.push({ ...this._countMap, total })
  }

  private settleDamage(count: number, key: string) {
    this._core.dps.add(this._damage * count, count, this._key, key)
  }

  public reset() {
    this._lastCountMap = {}
    this._countMap = {}
    this._countMapList = []
  }
}
