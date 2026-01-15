import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Props<T> {
  value: T
  onChange: (value: T) => void
  list: { value: T; label: string }[]
}

const MyTabs = <T extends string>({ value, onChange, list }: Props<T>) => {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Tabs value={value} onValueChange={(v) => onChange(v as T)}>
        <TabsList>
          {list.map(({ value, label }) => {
            return (
              <TabsTrigger key={value} value={value}>
                {label}
              </TabsTrigger>
            )
          })}
        </TabsList>
      </Tabs>
    </div>
  )
}

export default MyTabs
