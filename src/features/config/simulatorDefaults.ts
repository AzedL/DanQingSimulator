import {
  AUTO_MOCK_SKILL_UPGRADES,
  type AutoMockSkillUpgrade,
  type CardGroup,
  type SimulatorTab,
} from './simulatorUi'
import {
  SKILL_UPGRADES,
  type SkillUpgrade,
} from '../../kernel'

export interface BasicConfigDefaults {
  burstDps: string
  sustainedDps: string
}

export interface SimulationConfigDefaults {
  currentTab: SimulatorTab
  skillGroup: CardGroup
  skillUpgrade: SkillUpgrade
  skillUpgradeLevel: number
  autoMockSkillUpgrade: AutoMockSkillUpgrade
  duration: string
  useRandom: boolean
  autoMockGroup: CardGroup
  availableTianGongValue: string
}

export interface AppViewDefaults {
  currentTabResult: SimulatorTab
}

export const AUTO_MOCK_MAX_COMBINATIONS = 99999
export const AUTO_MOCK_TOP_RESULT_COUNT = 20
export const BASIC_CONFIG_DEFAULTS: BasicConfigDefaults = {
  burstDps: '120000',
  sustainedDps: '60000',
}

export const SIMULATION_CONFIG_DEFAULTS: SimulationConfigDefaults = {
  currentTab: 'autoMock',
  skillGroup: '天火',
  skillUpgrade: SKILL_UPGRADES.benZhen,
  skillUpgradeLevel: 1,
  autoMockSkillUpgrade: AUTO_MOCK_SKILL_UPGRADES.both,
  duration: '600',
  useRandom: false,
  autoMockGroup: '天火',
  availableTianGongValue: '7',
}

export const APP_VIEW_DEFAULTS: AppViewDefaults = {
  currentTabResult: 'autoMock',
}
