import { join } from '../utils/key'
import { handleProbability } from '../utils/probability'
import type { Core } from './Core'

export class Pulse {
  private _key = '脉冲'
  private _core: Core
  private _damage: number = 0

  private _shenMuTouDamage = 0
  private _suiShouValue = 0

  private _lastCountMap: Record<string, number> = {}
  private _countMap: Record<string, number> = {}
  private _countMapList: Record<'total' & string, number>[] = []

  constructor(core: Core) {
    this._core = core
    this._damage = core.options.pulseDamage
    this._shenMuTouDamage = core.options.shenMuTouDamage
    this._suiShouValue = core.options.suiShouValue

    this.addPulseByShenMuTou()
  }

  private addPulseByShenMuTou() {
    if (!this._shenMuTouDamage) return

    const key = '神木骰'
    ;[1, 2, 3].forEach((delay) => {
      this._core.queue.enqueue(() => {
        this.add(1, key)
      }, delay)
    })
  }

  private _add(count: number, key: string) {
    this._countMap[key] = this._countMap[key] || 0
    this._countMap[key] += count
  }
  private handleShenMuTou(count: number) {
    if (!this._shenMuTouDamage) return

    const key = '脉冲·震荡'
    const damage = (this._shenMuTouDamage * count) / 5
    ;[2, 4, 6, 8, 10].forEach((delay) => {
      this._core.queue.enqueue(() => {
        this._core.dps.add(damage, count, key)
      }, delay)
    })
  }
  private handleSuiShou(count: number) {
    if (!this._suiShouValue) return

    const useRandom = this._core.coreOptions.useRandom
    const c = handleProbability(this._suiShouValue, useRandom, count)

    this._core.fire.add(c * 3)
  }
  public add(count: number, ...rest: string[]) {
    const key = join(...rest)
    this._add(count, key)
    this.handleShenMuTou(count)
    this.handleSuiShou(count)
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

    this.addPulseByShenMuTou()
  }
}
