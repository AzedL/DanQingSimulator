import { useId } from 'react'

interface Props {
  value: boolean
  onChange: (value: boolean) => void
  label: string
  tip?: string
}

export default function CheckboxField({
  value,
  onChange,
  label,
  tip = '',
}: Props) {
  const id = useId()

  return (
    <label
      htmlFor={id}
      className="inline-flex w-fit cursor-pointer items-start gap-3"
    >
      <input
        id={id}
        type="checkbox"
        checked={value}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className="grid size-[17px] shrink-0 place-items-center rounded border border-[#cfd9d7] bg-white text-transparent transition-[border-color,background-color,color,box-shadow] peer-checked:border-[#10a897] peer-checked:bg-[#1cc5b3] peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-[#8de0d6] peer-focus-visible:ring-offset-1"
      >
        <svg className="size-3" fill="none" viewBox="0 0 12 12">
          <path
            d="m2.25 6.15 2.15 2.1 5.35-5.1"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
      </span>
      <div className="grid gap-2">
        <span className="h-[17px] text-sm font-medium leading-[17px]">
          {label}
        </span>
        {!!tip && <p className="text-sm opacity-65">{tip}</p>}
      </div>
    </label>
  )
}
