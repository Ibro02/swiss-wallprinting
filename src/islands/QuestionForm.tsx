'use client'

import { useLocale, useTranslations } from 'next-intl'
import { type ReactNode, useActionState, useEffect, useRef, useState } from 'react'
import { buttonClasses } from '@/components/Button.tsx'
import { submitQuestion } from '@/features/contact/actions.ts'
import { LIMITS, type QuestionField, SPAM_FIELDS } from '@/features/contact/fields.ts'
import type { QuestionState } from '@/features/contact/handle-question.ts'
import { Link } from '@/i18n/navigation.ts'
import { PAGES } from '@/i18n/pages.ts'

// The home page question form. Works without JavaScript too (a Server Action on a
// plain form); with JavaScript it keeps the page, focuses the first error, and shows
// the result in place. Errors follow the write-better-error-messages skill: what
// happened, that the text is kept, what to do, and another way to reach the client.

interface QuestionFormProps {
  contact: { email: string; phone: string }
}

const INITIAL: QuestionState = { status: 'idle' }

const INPUT =
  'mt-2 block w-full rounded-2xl bg-plaster px-4 py-3 text-base ring-1 ring-graphite/10 ring-inset transition-shadow placeholder:text-mute/60 focus:ring-2 focus:ring-graphite focus:outline-none aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-magenta-700'

export function QuestionForm({ contact }: QuestionFormProps) {
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
      // Not <output>: that element may hold only phrasing content, and this has paragraphs.
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
      <div ref={status} tabIndex={-1} role="status" className="outline-none">
        <p className="font-display text-2xl font-light">{t('sent.title')}</p>
        <p className="mt-3 text-mute">{t('sent.body', { email: state.email })}</p>
        <button
          type="button"
          onClick={() => {
            setDismissed(state)
            setRound((value) => value + 1)
          }}
          className={`${buttonClasses('secondary-light')} mt-8`}
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

  return (
    <form
      key={round}
      ref={form}
      action={action}
      noValidate
      aria-describedby={problem ? 'question-problem' : undefined}
      className="grid gap-6"
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
          className="rounded-2xl bg-magenta-700/8 px-4 py-3 text-sm text-magenta-700 ring-1 ring-magenta-700/20 outline-none"
        >
          {problem}
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <Field name="name" label={t('fields.name')} error={error('name')}>
          <input
            id="question-name"
            name="name"
            type="text"
            autoComplete="name"
            maxLength={LIMITS.name}
            defaultValue={values?.name}
            aria-required="true"
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? 'question-name-error' : undefined}
            className={INPUT}
          />
        </Field>
        <Field name="email" label={t('fields.email')} error={error('email')}>
          <input
            id="question-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            maxLength={LIMITS.email}
            defaultValue={values?.email}
            aria-required="true"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? 'question-email-error' : undefined}
            className={INPUT}
          />
        </Field>
      </div>

      <Field name="phone" label={t('fields.phone')} error={error('phone')}>
        <input
          id="question-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          maxLength={LIMITS.phone}
          defaultValue={values?.phone}
          aria-invalid={errors.phone ? true : undefined}
          aria-describedby={errors.phone ? 'question-phone-error' : undefined}
          className={INPUT}
        />
      </Field>

      <Field
        name="message"
        label={t('fields.message')}
        error={error('message')}
        hint={t('fields.messageHint')}
      >
        <textarea
          id="question-message"
          name="message"
          rows={5}
          maxLength={LIMITS.message}
          defaultValue={values?.message}
          aria-required="true"
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={`question-message-hint${errors.message ? ' question-message-error' : ''}`}
          className={`${INPUT} resize-y`}
        />
      </Field>

      <div>
        <label className="flex items-start gap-3 text-sm leading-relaxed">
          <input
            name="consent"
            type="checkbox"
            defaultChecked={values?.consent}
            aria-required="true"
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? 'question-consent-error' : undefined}
            className="mt-0.5 size-5 shrink-0 accent-magenta-700"
          />
          <span>
            {t.rich('fields.consent', {
              link: (chunks) => (
                <Link href={PAGES.privacy} className="font-semibold underline underline-offset-2">
                  {chunks}
                </Link>
              ),
            })}
          </span>
        </label>
        {errors.consent && <ErrorText id="question-consent-error">{error('consent')}</ErrorText>}
      </div>

      <div>
        <button
          type="submit"
          disabled={pending}
          className={`${buttonClasses('primary', 'lg')} w-full disabled:cursor-wait disabled:opacity-70 sm:w-auto`}
        >
          {pending ? t('sending') : t('submit')}
        </button>
      </div>
    </form>
  )
}

function Field({
  name,
  label,
  hint,
  error,
  children,
}: {
  name: QuestionField
  label: string
  hint?: string
  error?: string
  children: ReactNode
}) {
  return (
    <div>
      <label htmlFor={`question-${name}`} className="text-sm font-semibold">
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
    <p id={id} className="mt-2 text-sm text-magenta-700">
      {children}
    </p>
  )
}
