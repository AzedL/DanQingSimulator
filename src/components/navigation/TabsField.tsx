interface Props<T> {
  value: T
  onChange: (value: T) => void
  list: { value: T; label: string }[]
}

export default function TabsField<T extends string>({
  value,
  onChange,
  list,
}: Props<T>) {
  return (
    <div
      role="tablist"
      className="grid h-10 w-full max-w-sm grid-cols-2 rounded-lg border border-current/20 bg-current/5 p-1"
    >
      {list.map(({ value: itemValue, label }) => (
        <button
          key={itemValue}
          type="button"
          role="tab"
          aria-selected={value === itemValue}
          className="rounded-md px-3 text-sm font-medium text-current outline-none transition-[background-color,box-shadow,opacity] hover:opacity-80 focus-visible:ring-2 focus-visible:ring-[#8de0d6] aria-selected:bg-white aria-selected:shadow-sm aria-selected:ring-1 aria-selected:ring-current/20"
          onClick={() => onChange(itemValue)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
