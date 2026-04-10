import { AutoMock } from '@/autoMock'
import type { CardId } from '@/domain/cards/cardIds'
import { toInt } from '@/kernel/utils/math'
import type { SimulationCore, SimulationMockOptions } from './Simulation'

export interface AutoMockResult {
  length: number
  overflow: boolean
  cores: SimulationCore[]
}

export function runAutoMock(
  options: SimulationMockOptions,
  costRemain: string,
  excludeYouMingQuan: boolean,
): AutoMockResult {
  const autoMockCost = toInt(costRemain)
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
