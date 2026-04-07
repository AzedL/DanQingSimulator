import { useMemo, useState } from 'react'
import { cardCatalog } from '@/domain/cards/cardCatalog'
import { runAutoOptimization } from '@/engine/Optimizer'
import type { SimulationCore, SimulationMockOptions } from '@/engine/Simulation'
import { fixed } from '@/kernel/utils/math'

export function useOptimizer(options: SimulationMockOptions, costRemain: string, excludeYouMingQuan: boolean) {
  const [autoMockLength, setAutoMockLength] = useState(0)
  const [autoMockLengthOverflow, setAutoMockLengthOverflow] = useState(false)
  const [autoMockCurrent, setAutoMockCurrent] = useState(0)
  const [autoMockCores, setAutoMockCores] = useState<SimulationCore[]>([])

  const autoMockResult = useMemo(() => {
    return autoMockCores.map((core) => {
      return {
        cards: core.coreOptions.cards.map((card) => cardCatalog[card.id].name).join('+'),
        dps: fixed(core.dps.getDPS()),
      }
    })
  }, [autoMockCores])

  function execAutoMock() {
    const result = runAutoOptimization(options, costRemain, excludeYouMingQuan)

    setAutoMockLength(result.length)
    setAutoMockLengthOverflow(result.overflow)
    setAutoMockCores(result.cores)
    setAutoMockCurrent(0)

    return result.cores
  }

  return {
    autoMockLength,
    autoMockLengthOverflow,
    autoMockCurrent,
    setAutoMockCurrent,
    autoMockCores,
    autoMockResult,
    execAutoMock,
  }
}