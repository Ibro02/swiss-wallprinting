'use client'

import { useFormatter, useTranslations } from 'next-intl'
import { type KeyboardEvent, useId, useState } from 'react'
import { parseMetres, roundCm } from '@/features/configurator/model/room.ts'

// A length in metres. The visitor types freely (with a point or a comma); the value is
// applied on Enter or when the field loses focus. Arrow Up/Down change it by 10 cm
// (with Shift by 1 m). A value outside the limits is adjusted, and the note says why.

interface MetreFieldProps {
  label: string
  value: number
  /** The limit text under the field, e.g. "At most 3.80 m: …". */
  note?: string
  /** Applies the typed value and gives back the value that was really set. */
  onCommit: (metres: number) => number
}

export function MetreField({ label, value, note, onCommit }: MetreFieldProps) {
  const t = useTranslations('Configurator')
  const format = useFormatter()
  const id = useId()
  const [draft, setDraft] = useState<string | null>(null)
  // The value that the limits made of the typed one, and the limit text at that moment.
  // The note stays marked only while both are the same: when the room changes, the limit
  // can change too, and "adjusted" would then point at the wrong reason.
  const [adjustedTo, setAdjustedTo] = useState<{ value: number; note?: string } | null>(null)
  const adjusted = adjustedTo?.value === value && adjustedTo.note === note

  const metres = (number: number) =>
    format.number(number, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: false,
    })

  const apply = (typed: number) => {
    const result = onCommit(typed)
    setAdjustedTo(Math.abs(result - roundCm(typed)) > 0.001 ? { value: result, note } : null)
  }

  const commit = () => {
    if (draft === null) return
    const typed = parseMetres(draft)
    setDraft(null)
    // Text that is not a number: the field goes back to the current value.
    if (typed !== null) apply(typed)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') commit()
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault()
      const step = (event.shiftKey ? 1 : 0.1) * (event.key === 'ArrowUp' ? 1 : -1)
      setDraft(null)
      apply(value + step)
    }
  }

  return (
    <div>
      <label htmlFor={id} className="text-xs font-medium text-mute">
        {label}
      </label>
      <div className="mt-1 flex h-11 items-center rounded-xl bg-paper ring-1 ring-ink/12 transition-shadow duration-150 focus-within:ring-2 focus-within:ring-ink">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={draft ?? metres(value)}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={onKeyDown}
          aria-describedby={note ? `${id}-note` : undefined}
          className="w-full min-w-0 bg-transparent pl-3 text-base tabular-nums outline-none"
        />
        <span aria-hidden="true" className="pr-3 text-sm text-mute">
          m
        </span>
      </div>
      {note && (
        <p
          id={`${id}-note`}
          aria-live="polite"
          className={`mt-1 text-xs leading-snug ${adjusted ? 'font-medium text-magenta-700 dark:text-magenta-200' : 'text-mute'}`}
        >
          {adjusted && `${t('adjusted', { value: metres(value) })} `}
          {note}
        </p>
      )}
    </div>
  )
}
