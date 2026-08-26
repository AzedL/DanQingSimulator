import CheckboxField from '@/components/form/CheckboxField'
import TabsField from '@/components/navigation/TabsField'
import type {
  CardGroup,
  SimulatorTab,
} from '@/features/config/simulatorUi'
import { cn } from '@/lib/utils'
import lang from '@/lang/lang'
import type { CardOptions, SkillUpgrade } from '@/kernel'
import type { AutoMockViewItem } from '@/features/autoMock/useAutoMock'
import { formatDamage, type SimulationDamageDetail } from '@/features/simulator/result'

interface Props {
  currentTabResult: SimulatorTab
  setCurrentTabResult: (value: SimulatorTab) => void
  tabValues: { value: SimulatorTab; label: string }[]
  mergeSameNameDamage: boolean
  setMergeSameNameDamage: (value: boolean) => void
  mockResult: SimulationDamageDetail[]
  autoMockLengthOverflow: boolean
  autoMockCurrent: number
  setAutoMockCurrent: (index: number) => void
  autoMockResult: AutoMockViewItem[]
  autoMockDanQingCombination: string
  onAutoMockResultDoubleClick: (
    cards: CardOptions[],
    skillGroup: CardGroup,
    skillUpgrade: SkillUpgrade,
    skillUpgradeLevel: number,
  ) => void
}

export default function ResultPanel(props: Props) {
  const isAutoMockResult = props.currentTabResult === 'autoMock'

  return (
    <div className="mt-6 flex min-h-120 w-full flex-col gap-5 rounded-xl border border-sky-100 bg-linear-to-br from-sky-50 to-blue-50 p-4 sm:p-6 text-sky-800 shadow-lg">
      <h2 className="mb-1 text-xl font-bold text-sky-950">{lang.mockResult}</h2>
      <TabsField value={props.currentTabResult} onChange={props.setCurrentTabResult} list={props.tabValues} />
      {!isAutoMockResult && (
        <>
          <div className="px-3 py-1.5">
            <CheckboxField
              value={props.mergeSameNameDamage}
              onChange={props.setMergeSameNameDamage}
              label={lang.mergeSameNameDamage}
            />
          </div>
          <div className="flex flex-col overflow-hidden rounded-lg bg-white/50 text-xs sm:text-sm">
            <div className="grid grid-cols-[1fr_80px_70px_50px] sm:grid-cols-[1fr_120px_100px_70px] gap-2 sm:gap-4 bg-sky-100/80 p-2.5 sm:p-3 items-center">
              <span className="font-medium text-sky-800">{lang.damageName}</span>
              <span className="text-right font-medium text-sky-800">{lang.damage}</span>
              <span className="text-right font-medium text-sky-800">{lang.dps}</span>
              <span className="text-right font-medium text-sky-800">{lang.proportion}</span>
            </div>
            <hr className="border-0 border-t border-sky-200" />
            <div className="max-h-96 overflow-y-auto">
              {props.mockResult.map(({ key, damage, dps, proportion }, index) => {
                return (
                  <div
                    className={cn(
                      'grid grid-cols-[1fr_80px_70px_50px] sm:grid-cols-[1fr_120px_100px_70px] gap-2 sm:gap-4 p-2.5 sm:p-3 transition-colors hover:bg-sky-50 items-center',
                      index % 2 === 0 ? 'bg-white/80' : '',
                    )}
                    key={key}
                  >
                    <span>{lang[key as 'total'] || key}</span>
                    <span className="text-right font-medium text-sky-700 tabular-nums">{formatDamage(damage)}</span>
                    <span className="text-right font-medium text-sky-700 tabular-nums">{dps}</span>
                    <span className="text-right font-medium text-sky-700 tabular-nums">{proportion + '%'}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
      {isAutoMockResult && (
        <>
          <div className="overflow-hidden px-3 py-1.5 text-sky-800">
            <p
              className="h-6 truncate whitespace-nowrap text-sm leading-6"
              title={`丹青组合：${props.autoMockDanQingCombination || '无'}`}
            >
              <span className="font-medium">丹青组合：</span>
              {props.autoMockDanQingCombination || '无'}
            </p>
          </div>
          {props.autoMockLengthOverflow && (
            <div className="px-3">
              <span className="text-sm font-medium text-red-500">{lang.overflow}</span>
            </div>
          )}
          <div className="flex flex-col overflow-hidden rounded-lg bg-white/50 text-xs sm:text-sm">
            <div className="grid grid-cols-[1fr_80px_75px] sm:grid-cols-[1fr_120px_110px] gap-2 sm:gap-4 bg-sky-100/80 p-2.5 sm:p-3 items-center">
              <span className="font-medium text-sky-800">{lang.cardsCombo}</span>
              <span className="text-right font-medium text-sky-800">{lang.damage}</span>
              <span className="text-right font-medium text-sky-800">{lang.dps}</span>
            </div>
            <hr className="border-0 border-t border-sky-200" />
            <div className="max-h-96 overflow-y-auto">
              {props.autoMockResult.map(
                ({
                  cards,
                  damage,
                  dps,
                  cardOptions,
                  skillGroup,
                  skillUpgrade,
                  skillUpgradeLevel,
                }, index) => {
                  return (
                    <div
                      className={cn(
                        'grid cursor-pointer grid-cols-[1fr_80px_75px] sm:grid-cols-[1fr_120px_110px] gap-2 sm:gap-4 p-2.5 sm:p-3 transition-colors hover:bg-sky-50 items-center',
                        props.autoMockCurrent === index ? 'bg-sky-200' : index % 2 === 0 ? 'bg-white/80' : '',
                      )}
                      key={cards}
                      title="双击应用配置并查看详细伤害"
                      onClick={() => props.setAutoMockCurrent(index)}
                      onDoubleClick={() =>
                        props.onAutoMockResultDoubleClick(
                          cardOptions,
                          skillGroup,
                          skillUpgrade,
                          skillUpgradeLevel,
                        )
                      }
                    >
                      <span className="cursor-pointer break-words leading-relaxed">{cards}</span>
                      <span className="cursor-pointer text-right font-medium text-sky-700 tabular-nums">{formatDamage(damage)}</span>
                      <span className="cursor-pointer text-right font-medium text-sky-700 tabular-nums">{dps}</span>
                    </div>
                  )
                },
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
