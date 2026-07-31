import {
  useEffect,
  useId,
  type Dispatch,
  type SetStateAction,
} from 'react'
import CheckboxField from '@/components/form/CheckboxField'
import {
  cardGroups,
  lingYunList,
} from '@/features/config/simulatorUi'
import {
  AUTO_MOCK_RECOMMENDED_WHITELIST,
  getAutoMockMaxCombinations,
} from '@/features/autoMock/autoMockSettings'
import type { CardId } from '@/kernel'
import lang from '@/lang/lang'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  whitelistEnabled: boolean
  setWhitelistEnabled: (value: boolean) => void
  whitelistCardIds: CardId[]
  setWhitelistCardIds: (value: CardId[]) => void
}

const recommendedIds = new Set(
  AUTO_MOCK_RECOMMENDED_WHITELIST,
)

export default function AutoMockSettingsDialog({
  open,
  setOpen,
  whitelistEnabled,
  setWhitelistEnabled,
  whitelistCardIds,
  setWhitelistCardIds,
}: Props) {
  const maxCombinationsInputId = useId()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'F9') {
        event.preventDefault()
        setOpen((current) => !current)
        return
      }

      if (event.key === 'Escape') setOpen(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setOpen])

  if (!open) return null

  const selectedIds = new Set(whitelistCardIds)

  function handleCardChange(cardId: CardId, checked: boolean) {
    setWhitelistCardIds(
      checked
        ? [...new Set([...whitelistCardIds, cardId])]
        : whitelistCardIds.filter((id) => id !== cardId),
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/25 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) setOpen(false)
      }}
    >
      <section
        aria-labelledby="auto-mock-settings-title"
        aria-modal="true"
        className="max-h-[calc(100vh-2rem)] w-full max-w-4xl overflow-y-auto rounded-xl border border-slate-200 bg-[#f8faf9] shadow-[0_18px_60px_rgb(15_23_42/18%)]"
        role="dialog"
      >
        <header className="flex justify-start border-b border-slate-200 px-6 py-4">
          <h2
            id="auto-mock-settings-title"
            className="text-lg font-bold text-slate-800"
          >
            {lang.autoMockWhitelist}
          </h2>
        </header>

        <div className="grid gap-5 p-6">
          <div className="grid items-center gap-x-4 gap-y-2 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-2">
            <CheckboxField
              value={whitelistEnabled}
              onChange={setWhitelistEnabled}
              label={lang.enableAutoMockWhitelist}
            />

            <div className="flex items-center gap-3">
              <label
                htmlFor={maxCombinationsInputId}
                className="shrink-0 text-sm font-medium text-slate-700"
              >
                {lang.autoMockMaxCombinations}
              </label>
              <input
                id={maxCombinationsInputId}
                className="form-control max-w-40 px-3 text-sm"
                type="number"
                min={1}
                step={1}
                defaultValue={getAutoMockMaxCombinations()}
                onInput={(event) => {
                  const value = Number(event.currentTarget.value)
                  if (
                    Number.isSafeInteger(value) &&
                    value > 0
                  ) {
                    window.AUTO_MOCK_MAX_COMBINATIONS = value
                  }
                }}
                onBlur={(event) => {
                  event.currentTarget.value = String(
                    getAutoMockMaxCombinations(),
                  )
                }}
              />
            </div>
            <p className="text-sm font-medium text-red-600 md:col-span-2">
              {lang.autoMockWhitelistWarning}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {cardGroups.map((group) => (
              <section
                key={group}
                className="overflow-hidden rounded-lg border border-slate-200 bg-white"
              >
                <h3 className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700">
                  {group}
                </h3>
                <div className="grid gap-1.5 p-2">
                  {lingYunList
                    .filter((card) => card.group === group)
                    .map((card) => {
                      const recommended = recommendedIds.has(
                        card.value,
                      )

                      return (
                        <div
                          key={card.value}
                          className={cn(
                            'rounded-md border px-3 py-2',
                            recommended
                              ? 'border-amber-200 bg-amber-50 text-amber-900'
                              : 'border-transparent text-slate-700',
                          )}
                        >
                          <CheckboxField
                            value={selectedIds.has(card.value)}
                            onChange={(checked) =>
                              handleCardChange(
                                card.value,
                                checked,
                              )
                            }
                            label={card.label}
                          />
                        </div>
                      )
                    })}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
