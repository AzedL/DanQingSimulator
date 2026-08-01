import { useEffect } from 'react'
import Button from '@/components/form/Button'
import { changelog } from '@/lang/changelog'
import lang from '@/lang/lang'

interface Props {
  open: boolean
  onClose: () => void
}

export default function ChangelogDialog({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return

      event.preventDefault()
      event.stopImmediatePropagation()
      onClose()
    }

    window.addEventListener('keydown', handleKeyDown, true)
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/25 p-4 backdrop-blur-[2px]">
      <section
        aria-labelledby="changelog-title"
        aria-modal="true"
          className="flex h-[52rem] max-h-[calc(100vh-2rem)] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-[#f8faf9] shadow-[0_18px_60px_rgb(15_23_42/18%)]"
          role="dialog"
        >
          <header className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2
            id="changelog-title"
            className="text-lg font-bold text-slate-800"
          >
            {lang.changelog}
          </h2>
          <Button
            aria-label={lang.close}
            variant="danger"
            className="size-9 px-0"
            onClick={onClose}
          >
            <svg
              aria-hidden="true"
              className="size-4"
              fill="none"
              viewBox="0 0 16 16"
            >
              <path
                d="m4 4 8 8m0-8-8 8"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.7"
              />
            </svg>
          </Button>
        </header>

          <div className="grid min-h-0 flex-1 content-start gap-5 overflow-y-auto p-6">
          {changelog.map((entry) => (
            <section key={entry.date}>
              <h3 className="mb-3 text-sm font-bold text-slate-700">
                {entry.date}
              </h3>
              <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700 marker:text-teal-600">
                {entry.changes.map((change) => (
                  <li key={change}>{change}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>
    </div>
  )
}
