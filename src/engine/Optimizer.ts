import { AutoMock } from '@/autoMock'
import type { CardId } from '@/domain/cards/cardIds'
import { toNumber } from '@/kernel/utils/math'
import type { SimulationCore, SimulationMockOptions } from './Simulation'

export interface AutoOptimizationResult {
  length: number
  overflow: boolean
  cores: SimulationCore[]
}

export function runAutoOptimization(
  options: SimulationMockOptions,
  costRemain: string,
  excludeYouMingQuan: boolean,
): AutoOptimizationResult {
  const autoMockCost = toNumber(costRemain)
  const exclude: CardId[] = excludeYouMingQuan ? ['youMingQuan'] : []
  const autoMock = new AutoMock(autoMockCost, options, exclude)
  const length = autoMock.getLength()
  const cores = autoMock.exec()

  return {
    length,
    overflow: autoMock.isOverMax(),
    cores,
  }
}
