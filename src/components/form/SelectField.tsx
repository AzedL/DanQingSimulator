import { useId, type CSSProperties } from 'react'

interface Props<T> {
  value: T
  onChange: (value: T) => void
  label?: string
  tip?: string
  placeholder?: string
  list: { value: T; label: string; group?: string }[]
  width?: number
  maxWidth?: number
  minWidth?: number
}

const selectArrowStyle: CSSProperties = {
  backgroundImage:
    'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\'%3e%3cpath fill=\'none\' stroke=\'%2334494e\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'m4 6 4 4 4-4\'/%3e%3c/svg%3e")',
  backgroundPosition: 'right 0.875rem center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '16px 16px',
}

export default function SelectField<T extends string>({
  value,
  onChange,
  label,
  tip,
  placeholder,
  list,
  width,
  maxWidth,
  minWidth,
}: Props<T>) {
  const id = useId()

  return (
    <div className="grid w-full items-center gap-2">
      {!!label && (
        <div className="grid gap-2">
          <label htmlFor={id} className="text-sm font-medium leading-none">
            {label}
          </label>
          {!!tip && <p className="text-sm opacity-65">{tip}</p>}
        </div>
      )}
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        style={{ ...selectArrowStyle, width, maxWidth, minWidth }}
        className="app-select form-control cursor-pointer pl-3 pr-10 text-sm"
      >
        {(value === '' || !!placeholder) && (
          <option value="" disabled hidden>
            {placeholder ?? '请选择'}
          </option>
        )}
        {list.map(({ value: itemValue, label: itemLabel, group }, index) => {
          const previousGroup = list[index - 1]?.group
          const startsGroup =
            index > 0 && group !== undefined && group !== previousGroup

          return (
            <option
              key={itemValue}
              value={itemValue}
              className={startsGroup ? 'app-select-group-start' : undefined}
            >
              {itemLabel}
            </option>
          )
        })}
      </select>
    </div>
  )
}
