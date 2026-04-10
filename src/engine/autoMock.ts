import { AutoMock, mockByCardsCombo, type LightMockResult } from '@/autoMock'
import type { CardId } from '@/domain/cards/cardIds'
import { toInt } from '@/kernel/utils/math'
import type { SimulationCore, SimulationMockOptions } from './Simulation'

export interface AutoMockTopResult {
  length: number
  overflow: boolean
  top: LightMockResult[]
}

export interface AutoMockResult {
  length: number
  overflow: boolean
  cores: SimulationCore[]
}

function createAutoMock(options: SimulationMockOptions, costRemain: string, excludeYouMingQuan: boolean) {
  const autoMockCost = toInt(costRemain)
  const exclude: CardId[] = excludeYouMingQuan ? ['youMingQuan'] : []
  return new AutoMock(autoMockCost, options, exclude)
}

export function runAutoMockGetTop(
  options: SimulationMockOptions,
  costRemain: string,
  excludeYouMingQuan: boolean,
): AutoMockTopResult {
  const autoMock = createAutoMock(options, costRemain, excludeYouMingQuan)

  return {
    length: autoMock.getLength(),
    overflow: autoMock.isOverMax(),
    top: autoMock.getTop(),
  }
}

export function runAutoMockCoresByTop(top: LightMockResult[], options: SimulationMockOptions): SimulationCore[] {
  return top.map((item) => mockByCardsCombo(item.cardsCombo, options))
}

export function runAutoMock(
  options: SimulationMockOptions,
  costRemain: string,
  excludeYouMingQuan: boolean,
): AutoMockResult {
  const topResult = runAutoMockGetTop(options, costRemain, excludeYouMingQuan)
  return {
    length: topResult.length,
    overflow: topResult.overflow,
    cores: runAutoMockCoresByTop(topResult.top, options),
  }
}
