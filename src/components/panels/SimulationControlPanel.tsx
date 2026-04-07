import CheckboxField from '@/components/form/CheckboxField'
import InputField from '@/components/form/InputField'
import TabsField from '@/components/navigation/TabsField'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { SimulatorTab } from '@/domain/config/simulatorUi'
import lang from '@/lang/lang'

interface Props {
  currentTab: SimulatorTab
  setCurrentTab: (value: SimulatorTab) => void
  tabValues: { value: SimulatorTab; label: string }[]
  isAutoMock: boolean
  duration: string
  setDuration: (value: string) => void
  useRandom: boolean
  setUseRandom: (value: boolean) => void
  costRemain: string
  setCostRemain: (value: string) => void
  excludeYouMingQuan: boolean
  setExcludeYouMingQuan: (value: boolean) => void
  totalCost: number
  resultCoreAttribute: number
  resultAttackPower: number
  onExecute: () => void
}

export default function SimulationControlPanel(props: Props) {
  return (
    <div className="flex-1 flex min-w-72 max-h-full flex-col gap-5">
      <div className="flex h-auto min-h-80 w-full flex-col gap-5 rounded-xl border border-amber-100 bg-linear-to-br from-amber-50 to-orange-50 p-6 shadow-lg">
        <h2 className="mb-1 text-xl font-bold text-amber-900">{lang.mockConfig}</h2>
        <TabsField value={props.currentTab} onChange={props.setCurrentTab} list={props.tabValues} />
        {!props.isAutoMock && (
          <div className="flex flex-col gap-4">
            <InputField value={props.duration} onChange={props.setDuration} label={lang.duration} type="number" />
            <CheckboxField
              value={props.useRandom}
              onChange={props.setUseRandom}
              label={lang.useRandom}
              tip={lang.useRandomTip}
            />
          </div>
        )}
        {props.isAutoMock && (
          <div className="flex flex-col gap-4">
            <InputField
              value={props.costRemain}
              onChange={props.setCostRemain}
              label={lang.costRemain}
              tip={lang.costRemainTip}
              type="number"
            />
            <CheckboxField
              value={props.excludeYouMingQuan}
              onChange={props.setExcludeYouMingQuan}
              label={lang.exclude}
            />
          </div>
        )}
      </div>

      <div className="flex h-auto w-full flex-col gap-3 rounded-xl border border-pink-100 bg-linear-to-br from-pink-50 to-rose-50 p-6 shadow-lg">
        <h2 className="mb-2 text-xl font-bold text-pink-900">{lang.preview}</h2>
        <div className="flex items-center gap-3">
          <Label className="font-medium text-pink-800">{lang.totalCost}</Label>
          <p className="text-lg font-bold text-emerald-600">{props.totalCost}</p>
        </div>
        <div className="flex items-center gap-3">
          <Label className="font-medium text-pink-800">{lang.resultCoreAttribute}</Label>
          <p className="text-lg font-bold text-emerald-600">{props.resultCoreAttribute}</p>
        </div>
        <div className="flex items-center gap-3">
          <Label className="font-medium text-pink-800">{lang.resultAttackPower}</Label>
          <p className="text-lg font-bold text-emerald-600">{props.resultAttackPower}</p>
        </div>
        <div className="mt-2 flex justify-end">
          <Button
            className="bg-linear-to-r from-pink-500 to-rose-500 px-6 py-2 font-medium text-white hover:from-pink-600 hover:to-rose-600"
            onClick={props.onExecute}
          >
            {lang.exec}
          </Button>
        </div>
      </div>
    </div>
  )
}