import type { CardId } from '@/domain/cards/cardIds'
import type { ChartMetric, SimulatorTab } from '@/domain/config/simulatorUi'

export interface BasicConfigDefaults {
  coreAttribute: string
  basicDamage: string
  coreAttributeExtraGain: string
  huiXin: string
  zhuanJing: string
  tiaoXi: string
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

export const AUTO_SIMULATION_DURATION = 300
export const AUTO_MOCK_MAX_COMBINATIONS = 99999
export const AUTO_MOCK_TOP_RESULT_COUNT = 20
export const DEFAULT_CORE_ATTRIBUTE_EXTRA_GAIN = 0.08
export const DEFAULT_ATTRIBUTE_YIELD = 0.008

export const BASIC_CONFIG_DEFAULTS: BasicConfigDefaults = {
  coreAttribute: '60000',
  basicDamage: '100000',
  coreAttributeExtraGain: String(DEFAULT_CORE_ATTRIBUTE_EXTRA_GAIN * 100),
  huiXin: String(DEFAULT_ATTRIBUTE_YIELD * 100),
  zhuanJing: String(DEFAULT_ATTRIBUTE_YIELD * 100),
  tiaoXi: String(DEFAULT_ATTRIBUTE_YIELD * 100),
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
  costRemain: '14',
  excludeYouMingQuan: true,
}

export const APP_VIEW_DEFAULTS: AppViewDefaults = {
  currentTabResult: 'autoMock',
  chartOptions: 'dps',
  currentKey: 'total',
}
