import type { DPSDetail } from '@/mock/core/Damage'
import type { CoreOptions } from '@/mock/core/Core'
import { Core } from '@/mock/core/Core'
import { fixed } from '@/mock/utils/math'
import { split } from '@/mock/utils/key'
import { cardCatalog } from '@/domain/cards/cardCatalog'
import { deriveCoreOptions, type MockOptions } from '@/domain/rules/deriveStats'

export interface SimulationResult {
  core: Core
  summary: {
    totalDamage: number
    dps: number
    totalCost: number
    coreAttribute: number
    attackPower: number
  }
  damageBreakdown: DPSDetail[]
  timeline: {
    damage: number[]
    dps: number[]
    fireCount: number[]
  }
  loadout: {
    cards: string[]
  }
}

export type SimulationCore = Core
export type SimulationCoreOptions = CoreOptions
export type SimulationMockOptions = MockOptions
export type SimulationDamageDetail = DPSDetail

export class Simulation {
  readonly core: Core

  constructor(coreOptions: CoreOptions) {
    this.core = new Core(coreOptions)
  }

  exec() {
    this.core.exec()
    return this
  }

  getResult(): SimulationResult {
    return buildSimulationResult(this.core)
  }
}

export function runSimulation(coreOptions: CoreOptions) {
  return new Simulation(coreOptions).exec()
}

export function deriveSimulationCoreOptions(mockOptions: MockOptions) {
  return deriveCoreOptions(mockOptions)
}

export function buildSimulationResult(core: Core): SimulationResult {
  return {
    core,
    summary: {
      totalDamage: core.dps.getDamage(),
      dps: core.dps.getDPS(),
      totalCost: core.coreOptions.cost,
      coreAttribute: core.coreOptions.coreAttribute,
      attackPower: fixed(core.coreOptions.attackPower),
    },
    damageBreakdown: core.dps.getDetail().sort((a, b) => b.dps - a.dps),
    timeline: {
      damage: core.dps.getDamageList(),
      dps: core.dps.getDPSList(),
      fireCount: core.fire.countList,
    },
    loadout: {
      cards: core.coreOptions.cards.map((card) => cardCatalog[card.id].name),
    },
  }
}

export function mergeDamageBreakdown(result: DPSDetail[]) {
  const mergedResult: Record<string, DPSDetail> = {}
  result.forEach((item) => {
    const key = split(item.key)
    if (!mergedResult[key]) {
      mergedResult[key] = { ...item, key }
    } else {
      mergedResult[key].dps = fixed(item.dps + mergedResult[key].dps)
      mergedResult[key].proportion = fixed(item.proportion + mergedResult[key].proportion)
    }
  })
  return Object.values(mergedResult).sort((a, b) => b.dps - a.dps)
}