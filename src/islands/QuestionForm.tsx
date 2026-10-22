'use client'

import { useLocale, useTranslations } from 'next-intl'
import { type ReactNode, useActionState, useEffect, useRef, useState } from 'react'
import { buttonClasses } from '@/components/Button.tsx'
import { CheckIcon } from '@/components/icons.tsx'
import { submitQuestion } from '@/features/contact/actions.ts'
import { LIMITS, OTHER_AREA, type QuestionField, SPAM_FIELDS } from '@/features/contact/fields.ts'
import type { QuestionState } from '@/features/contact/handle-question.ts'
import { Link } from '@/i18n/navigation.ts'
import { PAGES } from '@/i18n/pages.ts'

// The question form: in the home page hero card (`card`: the labels are the placeholders,
// no phone field) and on the contact page (`page`: visible labels, phone). Works without
// JavaScript too (a Server Action on a plain form; the chips are checkboxes); with
// JavaScript it keeps the page, focuses the first error, and shows the result in place.
// Errors follow the write-better-error-messages skill: what happened, that the text is
// kept, what to do, and another way to reach the client.

interface QuestionFormProps {
  contact: { email: string; phone: string }
  /** The chips: the application areas, in the page language. */
  areas: readonly { id: string; title: string }[]
  variant?: 'card' | 'page'
}

const INITIAL: QuestionState = { status: 'idle' }

// 16 px text on phones: iOS zooms into smaller inputs on focus.
const INPUT =
  'block w-full min-w-0 rounded-xl border border-graphite/12 bg-white px-3.5 py-2.5 text-base text-graphite transition-[border-color,box-shadow] duration-150 placeholder:text-mute focus:border-transparent focus:ring-2 focus:ring-graphite focus:outline-none sm:text-sm aria-[invalid=true]:border-magenta-700 aria-[invalid=true]:ring-1 aria-[invalid=true]:ring-magenta-700'

const CHIP =
  'cursor-pointer rounded-lg border border-graphite/12 bg-white px-3 py-2 text-xs font-medium text-graphite/80 transition-[border-color,background-color,color,transform] duration-150 ease-out select-none hover:border-graphite/35 active:scale-[0.97] has-checked:border-lime has-checked:bg-lime has-checked:text-graphite has-focus-visible:ring-2 has-focus-visible:ring-graphite has-focus-visible:ring-offset-2 motion-reduce:active:scale-100'

export function QuestionForm({ contact, areas, variant = 'page' }: QuestionFormProps) {
  const t = useTranslations('QuestionForm')
  const tErrors = useTranslations('QuestionForm.errors')
  const locale = useLocale()
  const [state, action, pending] = useActionState(submitQuestion, INITIAL)
  // A success answer stays until the visitor asks for a new form.
  const [dismissed, setDismissed] = useState<QuestionState | null>(null)
  const [round, setRound] = useState(0)
  const form = useRef<HTMLFormElement>(null)
  const status = useRef<HTMLDivElement>(null)
  const startedAt = useRef<HTMLInputElement>(null)
  const card = variant === 'card'

  // Fill time for the spam check (set after hydration; empty without JavaScript).
  useEffect(() => {
    if (startedAt.current) startedAt.current.value = String(Date.now())
  }, [round])

  // After an answer: the first invalid field, or the status message, gets the focus.
  useEffect(() => {
    if (state.status === 'invalid') {
      form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
    } else if (state.status !== 'idle') {
      status.current?.focus()
    }
  }, [state])

  if (state.status === 'sent' && dismissed !== state) {
    return (
      <div
        ref={status}
        tabIndex={-1}
        // Not <output>: that element may hold only phrasing content, and this has paragraphs.
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
        role="status"
        className="flex flex-col items-center gap-3 py-8 text-center outline-none starting:opacity-0 motion-safe:transition-opacity motion-safe:duration-300"
      >
        <span className="grid size-12 place-items-center rounded-full bg-success-50 text-success">
          <CheckIcon className="size-6" />
        </span>
        <p className="text-base font-semibold text-balance">{t('sent.title')}</p>
        <p className="max-w-sm text-sm text-mute">{t('sent.body', { email: state.email })}</p>
        <button
          type="button"
          onClick={() => {
            setDismissed(state)
            setRound((value) => value + 1)
          }}
          className={`${buttonClasses('secondary', 'sm')} mt-3`}
        >
          {t('sent.again')}
        </button>
      </div>
    )
  }

  const values = 'values' in state ? state.values : undefined
  const errors = state.status === 'invalid' ? state.errors : {}
  const errorCount = Object.keys(errors).length

  // Only the field/code pairs in FIELD_ERRORS occur; a test checks that each has a text.
  const error = (field: QuestionField) => {
    const code = errors[field]
    if (!code) return undefined
    const key = `${field}.${code}` as Parameters<typeof tErrors>[0]
    return tErrors(key, { max: field in LIMITS ? LIMITS[field as keyof typeof LIMITS] : 0 })
  }

  const problem =
    state.status === 'invalid'
      ? t('problem.invalid', { count: errorCount })
      : state.status === 'tooFast' || state.status === 'rateLimited' || state.status === 'failed'
        ? t(`problem.${state.status}`, contact)
        : undefined

  // The described-by list of a field: its hint (page form) and its error.
  const describedBy = (field: QuestionField, hint = false) =>
    [hint && `question-${field}-hint`, errors[field] && `question-${field}-error`]
      .filter(Boolean)
      .join(' ') || undefined

  const chips = [...areas, { id: OTHER_AREA, title: t('fields.areaOther') }]

  return (
    <form
      key={round}
      ref={form}
      action={action}
      noValidate
      aria-describedby={problem ? 'question-problem' : undefined}
      className={card ? 'flex flex-col gap-4' : 'grid gap-6'}
    >
      <input type="hidden" name="locale" value={locale} />
      <input ref={startedAt} type="hidden" name={SPAM_FIELDS.startedAt} defaultValue="" />
      {/* Honeypot: hidden from people and assistive tech; bots fill it. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input type="text" name={SPAM_FIELDS.honeypot} tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {problem && (
        <div
          ref={status}
          id="question-problem"
          tabIndex={-1}
          role="alert"
          className="rounded-xl bg-magenta-700/6 px-4 py-3 text-sm leading-relaxed text-magenta-700 ring-1 ring-magenta-700/15 outline-none"
        >
          {problem}
        </div>
      )}

      {card && <p className="text-sm font-medium">{t('fields.project')}</p>}

      <div className={card ? 'flex flex-col gap-2 sm:flex-row' : 'grid gap-6 sm:grid-cols-2'}>
        <Field name="name" label={t('fields.name')} hiddenLabel={card} error={error('name')}>
          <input
            id="question-name"
            name="name"
            type="text"
            autoComplete="name"
            maxLength={LIMITS.name}
            defaultValue={values?.name}
            placeholder={card ? t('fields.name') : undefined}
            aria-required="true"
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={describedBy('name')}
            className={INPUT}
          />
        </Field>
        <Field name="email" label={t('fields.email')} hiddenLabel={card} error={error('email')}>
          <input
            id="question-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            maxLength={LIMITS.email}
            defaultValue={values?.email}
            placeholder={card ? t('fields.email') : undefined}
            aria-required="true"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={describedBy('email')}
            className={INPUT}
          />
        </Field>
      </div>

      {!card && (
        <Field name="phone" label={t('fields.phone')} error={error('phone')}>
          <input
            id="question-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            maxLength={LIMITS.phone}
            defaultValue={values?.phone}
            aria-invalid={errors.phone ? true : undefined}
            aria-describedby={describedBy('phone')}
            className={INPUT}
          />
        </Field>
      )}

      <Field
        name="message"
        label={t('fields.message')}
        hiddenLabel={card}
        error={error('message')}
        hint={card ? undefined : t('fields.messageHint')}
      >
        <textarea
          id="question-message"
          name="message"
          rows={card ? 4 : 5}
          maxLength={LIMITS.message}
          defaultValue={values?.message}
          placeholder={card ? t('fields.messagePlaceholder') : undefined}
          aria-required="true"
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={describedBy('message', !card)}
          className={`${INPUT} resize-none`}
        />
      </Field>

      <fieldset>
        <legend className="text-sm font-medium">{t('fields.areas')}</legend>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {chips.map((chip) => (
            <label key={chip.id} className={CHIP}>
              <input
                type="checkbox"
                name="areas"
                value={chip.id}
                defaultChecked={values?.areas.includes(chip.id)}
                className="sr-only"
              />
              {chip.title}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label className="flex items-start gap-2.5 text-xs leading-relaxed text-mute">
          <input
            name="consent"
            type="checkbox"
            defaultChecked={values?.consent}
            aria-required="true"
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? 'question-consent-error' : undefined}
            className="mt-0.5 size-4 shrink-0 accent-graphite"
          />
          <span>
            {t.rich('fields.consent', {
              link: (chunks) => (
                <Link
                  href={PAGES.privacy}
                  className="font-medium text-graphite underline underline-offset-2"
                >
                  {chunks}
                </Link>
              ),
            })}
          </span>
        </label>
        {errors.consent && <ErrorText id="question-consent-error">{error('consent')}</ErrorText>}
      </div>

      <button
        type="submit"
        disabled={pending}
        className={`${buttonClasses('primary', 'lg')} w-full disabled:cursor-wait disabled:opacity-60`}
      >
        {pending ? t('sending') : t('submit')}
      </button>
    </form>
  )
}

function Field({
  name,
  label,
  hiddenLabel = false,
  hint,
  error,
  children,
}: {
  name: QuestionField
  label: string
  /** Card form: the placeholder shows the label, the label stays for assistive tech. */
  hiddenLabel?: boolean
  hint?: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className="min-w-0 flex-1">
      <label
        htmlFor={`question-${name}`}
        className={hiddenLabel ? 'sr-only' : 'mb-2 block text-sm font-medium'}
      >
        {label}
      </label>
      {children}
      {hint && (
        <p id={`question-${name}-hint`} className="mt-2 text-xs text-mute">
          {hint}
        </p>
      )}
      {error && <ErrorText id={`question-${name}-error`}>{error}</ErrorText>}
    </div>
  )
}

function ErrorText({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="mt-1.5 text-xs leading-relaxed text-magenta-700">
      {children}
    </p>
  )
}
