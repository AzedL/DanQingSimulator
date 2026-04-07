import lang from '@/lang/lang'
import CheckboxField from '@/components/form/CheckboxField'
import InputField from '@/components/form/InputField'
import SelectField from '@/components/form/SelectField'
import { Label } from '@/components/ui/label'

interface Props {
  coreAttribute: string
  setCoreAttribute: (value: string) => void
  basicDamage: string
  setBasicDamage: (value: string) => void
  treasureLevel: string
  setTreasureLevel: (value: string) => void
  taXue: boolean
  setTaXue: (value: boolean) => void
  anJi: boolean
  setAnJi: (value: boolean) => void
  treasureLevelValues: { label: string; value: string }[]
}

export default function BasicConfigPanel(props: Props) {
  return (
    <div className="w-full rounded-xl border border-indigo-100 bg-linear-to-br from-indigo-50 to-purple-50 p-6 shadow-lg">
      <h2 className="mb-4 text-xl font-bold text-indigo-900">{lang.basicConfig}</h2>
      <div className="flex flex-wrap items-center justify-start gap-6">
        <div className="min-w-48 flex-1">
          <InputField
            value={props.coreAttribute}
            onChange={props.setCoreAttribute}
            label={lang.coreAttribute}
            tip={lang.coreAttributeTip}
            type="number"
          />
        </div>
        <div className="min-w-48 flex-1">
          <InputField
            value={props.basicDamage}
            onChange={props.setBasicDamage}
            label={lang.basicDamage}
            tip={lang.basicDamageTip}
            type="number"
          />
        </div>
        <div className="min-w-48 flex-1">
          <SelectField
            value={props.treasureLevel}
            onChange={props.setTreasureLevel}
            label={lang.treasureLevel}
            tip={lang.treasureLevelTip}
            list={props.treasureLevelValues}
          />
        </div>
      </div>
      <div className="mt-6 grid gap-4">
        <Label className="text-base font-medium text-indigo-800">{lang.buff}</Label>
        <div className="flex items-center justify-start gap-6">
          <CheckboxField value={props.taXue} onChange={props.setTaXue} label={lang.taXue} />
          <CheckboxField value={props.anJi} onChange={props.setAnJi} label={lang.anJi} />
        </div>
      </div>
    </div>
  )
}

