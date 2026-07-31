import CheckboxField from '@/components/form/CheckboxField'
import Button from '@/components/form/Button'
import CardGroupField from '@/components/form/CardGroupField'
import InputField from '@/components/form/InputField'
import TabsField from '@/components/navigation/TabsField'
import type {
  CardGroup,
  SimulatorTab,
} from '@/features/config/simulatorUi'
import lang from '@/lang/lang'

interface Props {
  currentTab: SimulatorTab
  setCurrentTab: (value: SimulatorTab) => void
  tabValues: { value: SimulatorTab; label: string }[]
  isAutoMock: boolean
  skillGroup: CardGroup
  setSkillGroup: (value: CardGroup) => void
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
  return (
    <div className="flex h-[400px] w-full min-w-72 flex-col gap-5 rounded-xl border border-pink-100 bg-linear-to-br from-pink-50 to-rose-50 p-6 text-pink-800 shadow-lg">
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
          <CardGroupField
            label={lang.skillGroup}
            value={props.skillGroup}
            onChange={props.setSkillGroup}
          />
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
          <CardGroupField
            label={lang.autoMockGroup}
            value={props.autoMockGroup}
            onChange={props.setAutoMockGroup}
          />
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
