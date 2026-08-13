export const SKILL_UPGRADES = {
  benZhen: 'benzhen',
  lingTong: 'lingtong',
} as const

export type SkillUpgrade =
  (typeof SKILL_UPGRADES)[keyof typeof SKILL_UPGRADES]
