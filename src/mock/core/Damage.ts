import { join } from '../utils/key'
import { fixed } from '../utils/math'
import { fluctuate } from '../utils/probability'
import type { Core } from './Core'

export interface DPSDetail {
  key: string
  dps: number
  proportion: number
}

export class Damage {
  private _core: Core

  private _damageMap: Record<string, number> = {}
  private _countMap: Record<string, number> = {}
  private _damageMapList: Record<'total' | string, number>[] = []
  private _countMapList: Record<string, number>[] = []

  constructor(core: Core) {
    this._core = core
  }

  public _add(damage: number, count: number, key: string) {
    damage = fluctuate(damage)

    this._damageMap[key] = (this._damageMap[key] || 0) + damage
    this._countMap[key] = (this._countMap[key] || 0) + count
  }
  public add(damage: number, count: number, ...rest: string[]) {
    const key = join(...rest)
    this._add(damage, count, key)
  }

  public settle() {
    let total = 0
    let countTotal = 0
    for (let key in this._damageMap) {
      total += this._damageMap[key] || 0
      countTotal += this._countMap[key] || 0
    }
    this._damageMapList.push({ ...this._damageMap, total })
    this._countMapList.push({ ...this._countMap, total: countTotal })
  }

  public reset() {
    this._damageMap = {}
    this._countMap = {}
    this._damageMapList = []
    this._countMapList = []
  }

  public getDamage() {
    return fixed(this._damageMapList.at(-1)?.total || 0)
  }
  public getDamageList() {
    return this._damageMapList.map((damage) => fixed(damage.total))
  }
  public getDPS() {
    if (!this._damageMapList.length) return 0
    const { basicDamage } = this._core.coreOptions
    return fixed(this.getDamage() / this._damageMapList.length + basicDamage)
  }
  public getDPSList() {
    const { basicDamage } = this._core.coreOptions
    return this._damageMapList.map((damage, i) => fixed(damage.total / (i + 1) + basicDamage))
  }

  public getDetail() {
    const { basicDamage, _basicDamage } = this._core.coreOptions
    const map = this._damageMapList.at(-1) || { total: 0 }
    const length = this._damageMapList.length || 1
    const total = map.total / length + basicDamage
    const result: DPSDetail[] = [{ key: 'total', dps: fixed(total), proportion: 100 }]
    for (let key in map) {
      const dps = map[key] / length
      const proportion = (dps * 100) / total
      result.push({ key, dps: fixed(dps), proportion: fixed(proportion) })
    }
    result.push({ key: 'basicDamage', dps: _basicDamage, proportion: fixed((_basicDamage * 100) / total) })
    result.push({
      key: 'coreAttributeDamage',
      dps: fixed(basicDamage - _basicDamage),
      proportion: fixed(((basicDamage - _basicDamage) * 100) / total),
    })
    return result
  }

  public getKeys() {
    return [...Object.keys(this._damageMap), 'total']
  }
  public getDamageDetailByKey(key: string) {
    return this._damageMapList.map((damageMap) => {
      return fixed(damageMap[key] || 0)
    })
  }
  public getDPSDetailByKey(key: string) {
    return this._damageMapList.map((damageMap, i) => {
      return fixed((damageMap[key] || 0) / (i + 1))
    })
  }
  public getCountDetailByKey(key: string) {
    return this._countMapList.map((countMap) => {
      return fixed(countMap[key] || 0)
    })
  }
}
