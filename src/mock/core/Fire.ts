import { dataBase } from '../dataBase/dataBase'
import { CoolDownTime } from '../utils/CoolDownTime'
import { min } from '../utils/math'
import { handleProbability } from '../utils/probability'
import type { Core } from './Core'

export class Fire {
  private _key = '燃烧'
  private _core: Core
  private _damage: number = 0

  private _linFengValue = 0
  private _erWeiDamage = 0

  private _count = 0
  private _countList: number[] = []
  private _maxCount = 12
  private _cd: CoolDownTime

  constructor(core: Core) {
    this._core = core
    this._damage = core.options.fireDamage
    this._linFengValue = core.options.linFengValueFire
    this._erWeiDamage = core.options.erWeiDamage

    const data = dataBase['xingHongJuYi']
    this._maxCount = data.values[3]
    this._cd = new CoolDownTime(3)
  }

  public get count() {
    return this._count
  }
  public get countList() {
    return this._countList
  }

  private _add(count: number) {
    this._count = min(this._count + count, this._maxCount)
    this.handleErWei(count)
  }
  private handleLinFeng(count: number) {
    if (!this._linFengValue) return

    let c = 0
    const useRandom = this._core.coreOptions.useRandom
    for (let i = 0; i < count; i++) {
      c += handleProbability(this._linFengValue, useRandom)
    }
    this._add(c)
  }
  private handleErWei(count: number) {
    if (!this._erWeiDamage) return

    const key = '引燃'
    this._core.dps.add(this._erWeiDamage * count, count, key)
  }
  public add(count: number) {
    this._add(count)
    this.handleLinFeng(count)
  }

  public settle() {
    this._countList.push(this._count)

    if (!this._count) {
      this._cd.reset()
      return
    }

    const isReady = this._cd.settle()
    if (isReady) this.settleDamage()

    this._cd.tick()
  }

  private settleDamage() {
    this._core.dps.add(this._damage * this._count, 1, this._key)
  }

  public resetCount() {
    this._count = 0
    this._cd.reset()
  }

  public reset() {
    this._count = 0
    this._countList = []
    this._cd.reset()
  }
}
