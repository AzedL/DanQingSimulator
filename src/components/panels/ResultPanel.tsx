import CheckboxField from '@/components/form/CheckboxField'
import TabsField from '@/components/navigation/TabsField'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import type { SimulatorTab } from '@/domain/config/simulatorUi'
import { cn } from '@/lib/utils'
import lang from '@/lang/lang'
import type { SimulationDamageDetail } from '@/engine/Simulation'

interface Props {
  currentTabResult: SimulatorTab
  setCurrentTabResult: (value: SimulatorTab) => void
  tabValues: { value: SimulatorTab; label: string }[]
  mergeSameNameDamage: boolean
  setMergeSameNameDamage: (value: boolean) => void
  mockResult: SimulationDamageDetail[]
  autoMockLength: number
  autoMockLengthOverflow: boolean
  autoMockCurrent: number
  setAutoMockCurrent: (index: number) => void
  autoMockResult: { cards: string; dps: number }[]
}

export default function ResultPanel(props: Props) {
  const isAutoMockResult = props.currentTabResult === 'autoMock'

  return (
    <div className="mt-6 flex min-h-120 w-full flex-col gap-5 rounded-xl border border-sky-100 bg-linear-to-br from-sky-50 to-blue-50 p-6 shadow-lg">
      <h2 className="mb-1 text-xl font-bold text-sky-900">{lang.mockResult}</h2>
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
          <div className="flex flex-col overflow-hidden rounded-lg bg-white/50">
            <div className="grid grid-cols-[4fr_1fr_1fr] gap-3 bg-sky-100/80 p-3">
              <Label className="font-medium text-sky-800">{lang.damageName}</Label>
              <Label className="font-medium text-sky-800">{lang.dps}</Label>
              <Label className="justify-self-end font-medium text-sky-800">{lang.proportion}</Label>
            </div>
            <Separator className="bg-sky-200" />
            <div className="max-h-96 overflow-y-auto">
              {props.mockResult.map(({ key, dps, proportion }, index) => {
                return (
                  <div
                    className={cn(
                      'grid grid-cols-[4fr_1fr_1fr] gap-3 p-3 transition-colors hover:bg-sky-50',
                      index % 2 === 0 ? 'bg-white/80' : '',
                    )}
                    key={key}
                  >
                    <Label>{lang[key as 'total'] || key}</Label>
                    <Label className="font-medium text-sky-700">{dps}</Label>
                    <Label className="justify-self-end font-medium text-sky-700">{proportion + '%'}</Label>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
      {isAutoMockResult && (
        <>
          <div className="flex items-center gap-3 px-3">
            <Label className="font-medium text-sky-800">{lang.autoMockLength}</Label>
            <p className={cn('text-lg font-bold text-sky-700', props.autoMockLengthOverflow && 'text-red-500')}>
              {props.autoMockLength}
            </p>
          </div>
          {props.autoMockLengthOverflow && (
            <div className="px-3">
              <Label className="font-medium text-red-500">{lang.overflow}</Label>
            </div>
          )}
          <div className="flex flex-col overflow-hidden rounded-lg bg-white/50">
            <div className="grid grid-cols-[5fr_1fr] gap-3 bg-sky-100/80 p-3">
              <Label className="font-medium text-sky-800">{lang.cardsCombo}</Label>
              <Label className="justify-self-end font-medium text-sky-800">{lang.dps}</Label>
            </div>
            <Separator className="bg-sky-200" />
            <div className="max-h-96 overflow-y-auto">
              {props.autoMockResult.map(({ cards, dps }, index) => {
                return (
                  <div
                    className={cn(
                      'grid cursor-pointer grid-cols-[5fr_1fr] gap-3 p-3 transition-colors hover:bg-sky-50',
                      props.autoMockCurrent === index ? 'bg-sky-200' : index % 2 === 0 ? 'bg-white/80' : '',
                    )}
                    key={cards}
                    onClick={() => props.setAutoMockCurrent(index)}
                  >
                    <Label className="cursor-pointer">{cards}</Label>
                    <Label className="cursor-pointer justify-self-end font-medium text-sky-700">{dps}</Label>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}