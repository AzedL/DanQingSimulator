import type { CardId } from '@/domain/cards/cardIds'
import type { ChartMetric, SimulatorTab } from '@/domain/config/simulatorUi'

export interface BasicConfigDefaults {
  coreAttribute: string
  basicDamage: string
  treasureLevel: string
  taXue: boolean
  anJi: boolean
}

export interface CardSelectionDefault {
  id: CardId
  level: number
}

export interface SimulationConfigDefaults {
  currentTab: SimulatorTab
  duration: string
  useRandom: boolean
  costRemain: string
  excludeYouMingQuan: boolean
}

export interface AppViewDefaults {
  currentTabResult: SimulatorTab
  chartOptions: ChartMetric
  currentKey: string
}

export const AUTO_SIMULATION_DURATION = 600
export const AUTO_MOCK_MAX_COMBINATIONS = 9999
export const AUTO_MOCK_TOP_RESULT_COUNT = 10

export const BASIC_CONFIG_DEFAULTS: BasicConfigDefaults = {
  coreAttribute: '50000',
  basicDamage: '80000',
  treasureLevel: '10',
  taXue: false,
  anJi: false,
}

export const DEFAULT_CARD_LOADOUT: CardSelectionDefault[] = [
  { id: 'yanHong', level: 6 },
  { id: 'wenMin', level: 6 },
  { id: 'linFeng', level: 6 },
]

export const SIMULATION_CONFIG_DEFAULTS: SimulationConfigDefaults = {
  currentTab: 'autoMock',
  duration: '600',
  useRandom: false,
  costRemain: '0',
  excludeYouMingQuan: true,
}

export const APP_VIEW_DEFAULTS: AppViewDefaults = {
  currentTabResult: 'autoMock',
  chartOptions: 'dps',
  currentKey: 'total',
}