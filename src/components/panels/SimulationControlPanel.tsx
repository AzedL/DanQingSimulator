import CheckboxField from '@/components/form/CheckboxField'
import Button from '@/components/form/Button'
import CardGroupField from '@/components/form/CardGroupField'
import InputField from '@/components/form/InputField'
import SkillUpgradeField from '@/components/form/SkillUpgradeField'
import TabsField from '@/components/navigation/TabsField'
import type {
  AutoMockSkillUpgrade,
  CardGroup,
  SimulatorTab,
} from '@/features/config/simulatorUi'
import type { SkillUpgrade } from '@/kernel'
import lang from '@/lang/lang'

interface Props {
  currentTab: SimulatorTab
  setCurrentTab: (value: SimulatorTab) => void
  tabValues: { value: SimulatorTab; label: string }[]
  isAutoMock: boolean
  skillGroup: CardGroup
  setSkillGroup: (value: CardGroup) => void
  skillUpgrade: SkillUpgrade
  autoMockSkillUpgrade: AutoMockSkillUpgrade
  skillUpgradeLevel: number
  setSkillUpgrade: (upgrade: SkillUpgrade) => void
  setAutoMockSkillUpgrade: (upgrade: AutoMockSkillUpgrade) => void
  setSkillUpgradeLevel: (level: number) => void
  duration: string
  setDuration: (value: string) => void
  useRandom: boolean
  setUseRandom: (value: boolean) => void
  autoMockGroup: CardGroup
  setAutoMockGroup: (value: CardGroup) => void
  selectedTianGongValue: number
  availableTianGongValue: string
  setAvailableTianGongValue: (value: string) => void
  onOpenAutoMockSettings: () => void
  isExecuting: boolean
  onExecute: () => void
}

export default function SimulationControlPanel(props: Props) {
  const renderSkillSettings = (
    label: string,
    value: CardGroup,
    onChange: (value: CardGroup) => void,
    autoMock: boolean,
  ) => (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
      <CardGroupField
        label={label}
        value={value}
        onChange={onChange}
      />
      <div className="basis-full border-pink-200 pt-3 md:basis-auto md:border-l md:pl-4 md:pt-0">
        <SkillUpgradeField
          upgrade={
            autoMock
              ? props.autoMockSkillUpgrade
              : props.skillUpgrade
          }
          level={props.skillUpgradeLevel}
          allowBoth={autoMock}
          onUpgradeChange={(upgrade) => {
            if (autoMock) {
              props.setAutoMockSkillUpgrade(upgrade)
            } else if (upgrade !== 'both') {
              props.setSkillUpgrade(upgrade)
            }
          }}
          onLevelChange={props.setSkillUpgradeLevel}
        />
      </div>
    </div>
  )

  return (
    <div className="flex min-h-[400px] w-full min-w-72 flex-col gap-5 rounded-xl border border-pink-100 bg-linear-to-br from-pink-50 to-rose-50 p-6 text-pink-800 shadow-lg">
      <h2 className="mb-1 text-xl font-bold text-pink-950">{lang.mockConfig}</h2>
      <div className="flex items-center gap-3">
        <span className="shrink-0 text-sm font-medium">
          {lang.duration}
        </span>
        <div className="w-40">
          <InputField
            value={props.duration}
            onChange={props.setDuration}
            suffix="秒"
            type="number"
          />
        </div>
      </div>
      <TabsField value={props.currentTab} onChange={props.setCurrentTab} list={props.tabValues} />
      {!props.isAutoMock && (
        <div className="flex flex-col gap-5">
          {renderSkillSettings(
            lang.skillGroup,
            props.skillGroup,
            props.setSkillGroup,
            false,
          )}
          <CheckboxField
            value={props.useRandom}
            onChange={props.setUseRandom}
            label={lang.useRandom}
            tip={lang.useRandomTip}
          />
        </div>
      )}
      {props.isAutoMock && (
        <div className="flex flex-col gap-5">
          {renderSkillSettings(
            lang.autoMockGroup,
            props.autoMockGroup,
            props.setAutoMockGroup,
            true,
          )}
          <div className="grid gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="shrink-0 text-sm font-medium">
                {lang.availableTianGongValue}
              </span>
              <div className="w-40">
                <InputField
                  value={props.availableTianGongValue}
                  onChange={props.setAvailableTianGongValue}
                  suffix={`/${
                    props.selectedTianGongValue +
                    (Number(props.availableTianGongValue) || 0)
                  }`}
                  type="number"
                />
              </div>
              <Button
                aria-haspopup="dialog"
                className="border-dashed border-pink-300 bg-white/40 text-pink-700 shadow-none hover:bg-pink-100/70"
                onClick={props.onOpenAutoMockSettings}
              >
                {lang.autoMockWhitelistSettings}
              </Button>
            </div>
            <p className="text-sm opacity-65">
              {lang.availableTianGongValueTip}
            </p>
          </div>
        </div>
      )}

      <div className="mt-auto flex justify-end pt-1">
        <Button
          variant="primary"
          className="px-6"
          disabled={props.isExecuting}
          onClick={props.onExecute}
        >
          {props.isExecuting ? lang.executing : lang.exec}
        </Button>
      </div>
    </div>
  )
}
