import InputField from '@/components/form/InputField'
import lang from '@/lang/lang'

interface Props {
  burstDps: string
  setBurstDps: (value: string) => void
  sustainedDps: string
  setSustainedDps: (value: string) => void
}

export default function BasicConfigPanel(props: Props) {
  return (
    <div className="w-full rounded-xl border border-indigo-100 bg-linear-to-br from-indigo-50 to-purple-50 p-6 text-indigo-800 shadow-lg">
      <h2 className="mb-4 text-xl font-bold text-indigo-950">
        {lang.basicConfig}
      </h2>
      <div className="flex flex-wrap items-center justify-start gap-6">
        <div className="min-w-64 flex-1">
          <InputField
            value={props.burstDps}
            onChange={props.setBurstDps}
            label={lang.burstDps}
            type="number"
          />
        </div>
        <div className="min-w-64 flex-1">
          <InputField
            value={props.sustainedDps}
            onChange={props.setSustainedDps}
            label={lang.sustainedDps}
            type="number"
          />
        </div>
      </div>
    </div>
  )
}
