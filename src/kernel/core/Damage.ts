import { join } from '../utils/key'
import { fluctuate } from '../utils/probability'
import type { Core } from './Core'

export const INSIGHT_DAMAGE_BOOST_PER_LAYER = 0.03
export const DEFAULT_DAMAGE_MULTIPLIER = 1

export interface DamageOutput {
  damageMap: Record<string, number>
  countMap: Record<string, number>
  damageMapList: Record<string, number>[]
  countMapList: Record<string, number>[]
  tickCount: number
  totalDamage: number
}

export class Damage {
  private readonly _core: Core
  private _damageMap: Record<string, number> = {}
  private _countMap: Record<string, number> = {}
  private _damageMapList: Record<string, number>[] = []
  private _countMapList: Record<string, number>[] = []
  private _tickCount = 0
  private _totalDamage = 0
  private _boost = 0
  private _insightLayers = 0

  constructor(core: Core) {
    this._core = core
  }

  add(damage: number, count: number, ...keys: string[]) {
    const key = join(...keys)
    const value = fluctuate(damage)

    this._damageMap[key] = (this._damageMap[key] ?? 0) + value
    this._countMap[key] = (this._countMap[key] ?? 0) + count
    this._totalDamage += value
  }

  deductBaseDamage(multiplier = 1) {
    const damage =
      this._core.coreOptions.sustainedDps * multiplier
    if (damage === 0) return
    this.add(-damage, 1, '本体伤害扣减')
  }

  get boost() {
    return this._boost
  }

  addBoost(boost: number) {
    this._boost += boost
  }

  removeBoost(boost: number) {
    this._boost -= boost
  }

  get insightLayers() {
    return this._insightLayers
  }

  addInsight(layers: number) {
    this._insightLayers += layers
  }

  consumeInsightMultiplier() {
    const multiplier =
      DEFAULT_DAMAGE_MULTIPLIER +
      this._insightLayers * INSIGHT_DAMAGE_BOOST_PER_LAYER
    this._insightLayers = 0
    return multiplier
  }

  commitTick() {
    this._tickCount++

    if (this._core.coreOptions.useLightMode) return

    const total = Object.values(this._damageMap).reduce((result, value) => result + value, 0)
    const count = Object.values(this._countMap).reduce((result, value) => result + value, 0)

    this._damageMapList.push({ ...this._damageMap, total })
    this._countMapList.push({ ...this._countMap, total: count })
  }

  output(): DamageOutput {
    return {
      damageMap: this._damageMap,
      countMap: this._countMap,
      damageMapList: this._damageMapList,
      countMapList: this._countMapList,
      tickCount: this._tickCount,
      totalDamage: this._totalDamage,
    }
  }

  reset() {
    this._damageMap = {}
    this._countMap = {}
    this._damageMapList = []
    this._countMapList = []
    this._tickCount = 0
    this._totalDamage = 0
    this._boost = 0
    this._insightLayers = 0
  }
}
