import Button from '@/components/form/Button'
import {
  SKILL_UPGRADES,
  type SkillUpgrade,
} from '@/kernel'
import {
  AUTO_MOCK_SKILL_UPGRADES,
  type AutoMockSkillUpgrade,
} from '@/features/config/simulatorUi'
import lang from '@/lang/lang'
import { cn } from '@/lib/utils'

interface Props {
  upgrade: AutoMockSkillUpgrade
  level: number
  allowBoth?: boolean
  onUpgradeChange: (upgrade: AutoMockSkillUpgrade) => void
  onLevelChange: (level: number) => void
}

const groups = [
  { label: lang.benZhen, value: SKILL_UPGRADES.benZhen },
  { label: lang.lingTong, value: SKILL_UPGRADES.lingTong },
] satisfies { label: string; value: SkillUpgrade }[]

const bothGroup = {
  label: lang.benZhenAndLingTong,
  value: AUTO_MOCK_SKILL_UPGRADES.both,
} as const

export default function SkillUpgradeField({
  upgrade,
  level,
  allowBoth = false,
  onUpgradeChange,
  onLevelChange,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <div className="flex shrink-0 items-center gap-1.5">
        {(allowBoth ? [...groups, bothGroup] : groups).map((group) => (
          <Button
            key={group.value}
            variant="primary"
            aria-pressed={upgrade === group.value}
            className={cn(
              'h-8 px-3 text-xs shadow-none',
              upgrade === group.value &&
                'ring-2 ring-[#1cc5b3] ring-offset-2 ring-offset-pink-50',
            )}
            onClick={() => onUpgradeChange(group.value)}
          >
            {group.label}
          </Button>
        ))}
      </div>

      <div className="flex shrink-0 items-center gap-1.5 border-l border-pink-200 pl-3">
        {Array.from({ length: 4 }, (_, currentLevel) => (
          <Button
            key={currentLevel}
            variant="primary"
            aria-label={`${currentLevel}级`}
            aria-pressed={level === currentLevel}
            className={cn(
              'size-7 rounded px-0 text-[10px] leading-none tabular-nums shadow-none',
              level === currentLevel &&
                'ring-2 ring-[#1cc5b3] ring-offset-2 ring-offset-pink-50',
            )}
            onClick={() => onLevelChange(currentLevel)}
          >
            {currentLevel}
          </Button>
        ))}
      </div>
    </div>
  )
}
