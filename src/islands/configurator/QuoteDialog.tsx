'use client'

import { useFormatter, useLocale, useTranslations } from 'next-intl'
import { type ReactNode, type RefObject, useActionState, useEffect, useRef, useState } from 'react'
import { buttonClasses } from '@/components/Button.tsx'
import { SPAM_FIELDS } from '@/features/contact/fields.ts'
import { estimatePrice, type PriceRates } from '@/features/configurator/model/price.ts'
import { toSearchParams } from '@/features/configurator/model/share.ts'
import { placementOf, sharedConfigOf } from '@/features/configurator/store.ts'
import { submitQuote } from '@/features/quote/actions.ts'
import { QUOTE_HIDDEN, QUOTE_LIMITS, type QuoteField } from '@/features/quote/fields.ts'
import type { QuoteState } from '@/features/quote/handle-quote.ts'
import type { PresetOption } from './ImagePicker.tsx'
import type { CaptureView } from './Scene.tsx'
import { useConfiguratorStore } from './store-context.tsx'

// "Request exact quote" (proposal P7): a dialog with the configuration, the 3D screenshot,
// and a short form. The Server Action checks everything again and computes the price on
// the server; the e-mail to the client has the share link and the screenshot.

export interface QuoteContact {
  email: string
  phone: string
  whatsappHref: string
}

interface QuoteDialogProps {
  captureRef: RefObject<CaptureView | null>
  presets: readonly PresetOption[]
  rates: PriceRates
  contact: QuoteContact
  privacyHref: string
}

const INITIAL: QuoteState = { status: 'idle' }

const INPUT =
  'mt-1.5 block w-full rounded-xl bg-white px-3.5 py-2.5 text-base ring-1 ring-graphite/15 ring-inset focus:ring-2 focus:ring-graphite focus:outline-none aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-magenta-700'

/** What the form sends besides the fields: taken when the dialog opens. */
interface Snapshot {
  config: string
  upload: string
  aspect: string
  screenshot: string
  summary: { wall: string; print: string; image: string; price: string }
}

export function QuoteButton({
  captureRef,
  presets,
  rates,
  contact,
  privacyHref,
}: QuoteDialogProps) {
  const t = useTranslations('Configurator.quote')
  const format = useFormatter()
  const store = useConfiguratorStore()
  const dialog = useRef<HTMLDialogElement>(null)
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  // A new form after a sent request, so the fields are empty again.
  const [round, setRound] = useState(0)

  const open = () => {
    const state = store.getState()
    const placement = placementOf(state)
    const metres = (value: number) =>
      format.number(value, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const price = estimatePrice(placement.areaM2, state.environment, rates)
    const current = state.image
    const image =
      current.kind === 'preset'
        ? (presets.find((preset) => preset.id === current.id)?.title ?? '')
        : current.name
    setSnapshot({
      config: toSearchParams(sharedConfigOf(state)).toString(),
      upload: state.image.kind === 'upload' ? state.image.name : '',
      aspect: String(state.image.aspect),
      screenshot: captureRef.current?.() ?? '',
      summary: {
        wall: `${metres(placement.wall.width)} × ${metres(placement.wall.height)} m`,
        print: t('summary.printValue', {
          width: metres(placement.printed.width),
          height: metres(placement.printed.height),
          area: metres(placement.areaM2),
        }),
        image,
        price: format.number(price.approx, {
          style: 'currency',
          currency: 'CHF',
          maximumFractionDigits: 0,
        }),
      },
    })
    dialog.current?.showModal()
  }

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={open}
        className="flex h-12 flex-1 items-center justify-center rounded-full bg-magenta px-5 text-sm font-semibold text-white transition-colors hover:bg-magenta-700"
      >
        {t('open')}
      </button>

      {/* The backdrop click belongs to the native modal dialog; Escape closes it natively. */}
      {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events */}
      <dialog
        ref={dialog}
        aria-labelledby="quote-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close()
        }}
        className="m-auto max-h-[min(92dvh,900px)] w-[min(94vw,46rem)] overflow-y-auto rounded-3xl bg-plaster p-0 text-graphite backdrop:bg-graphite/70 backdrop:backdrop-blur-sm max-sm:h-dvh max-sm:max-h-none max-sm:w-full max-sm:max-w-none max-sm:rounded-none"
      >
        <div className="p-5 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="quote-title" className="font-display text-2xl font-light">
                {t('title')}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-mute">{t('lead')}</p>
            </div>
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              className="grid size-10 shrink-0 place-items-center rounded-full ring-1 ring-graphite/15 hover:bg-white"
            >
              <span aria-hidden="true">✕</span>
              <span className="sr-only">{t('close')}</span>
            </button>
          </div>

          {snapshot && <Summary snapshot={snapshot} />}
          {snapshot && (
            <QuoteForm
              key={round}
              snapshot={snapshot}
              contact={contact}
              privacyHref={privacyHref}
              onDone={() => {
                dialog.current?.close()
                setRound((value) => value + 1)
              }}
            />
          )}
        </div>
      </dialog>
    </>
  )
}

function Summary({ snapshot }: { snapshot: Snapshot }) {
  const t = useTranslations('Configurator.quote.summary')
  const rows = [
    [t('wall'), snapshot.summary.wall],
    [t('print'), snapshot.summary.print],
    [t('image'), snapshot.summary.image],
    [t('price'), snapshot.summary.price],
  ] as const
  return (
    <section
      aria-label={t('title')}
      className="mt-6 grid gap-4 rounded-2xl bg-white p-4 ring-1 ring-graphite/10 sm:grid-cols-[12rem_1fr]"
    >
      {snapshot.screenshot ? (
        // A data URL from the canvas: next/image cannot optimize it, and it is small.
        // oxlint-disable-next-line nextjs/no-img-element
        <img
          src={snapshot.screenshot}
          alt={t('preview')}
          className="aspect-[4/3] w-full rounded-xl object-cover"
        />
      ) : null}
      <dl className="grid content-start gap-1.5 text-sm">
        {rows.map(([term, value]) => (
          <div key={term} className="flex justify-between gap-3">
            <dt className="text-mute">{term}</dt>
            <dd className="text-right font-semibold">{value}</dd>
          </div>
        ))}
        {snapshot.upload && (
          <p className="mt-2 text-xs leading-relaxed text-mute">{t('uploadNote')}</p>
        )}
      </dl>
    </section>
  )
}

function QuoteForm({
  snapshot,
  contact,
  privacyHref,
  onDone,
}: {
  snapshot: Snapshot
  contact: QuoteContact
  privacyHref: string
  onDone: () => void
}) {
  const t = useTranslations('Configurator.quote')
  const tErrors = useTranslations('Configurator.quote.errors')
  const locale = useLocale()
  const [state, action, pending] = useActionState(submitQuote, INITIAL)
  const form = useRef<HTMLFormElement>(null)
  const status = useRef<HTMLDivElement>(null)
  const startedAt = useRef<HTMLInputElement>(null)

  // Fill time for the spam check (set after hydration).
  useEffect(() => {
    if (startedAt.current) startedAt.current.value = String(Date.now())
  }, [])

  // After an answer: the first invalid field, or the status message, gets the focus.
  useEffect(() => {
    if (state.status === 'invalid') {
      form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
    } else if (state.status !== 'idle') {
      status.current?.focus()
    }
  }, [state])

  if (state.status === 'sent') {
    return (
      // Not <output>: that element may hold only phrasing content, and this has paragraphs.
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
      <div ref={status} tabIndex={-1} role="status" className="mt-8 outline-none">
        <p className="font-display text-xl font-light">{t('sent.title')}</p>
        <p className="mt-2 text-sm text-mute">{t('sent.body', { email: state.email })}</p>
        <button
          type="button"
          onClick={onDone}
          className={`${buttonClasses('secondary-light')} mt-6`}
        >
          {t('sent.close')}
        </button>
      </div>
    )
  }

  const values = 'values' in state ? state.values : undefined
  const errors = state.status === 'invalid' ? state.errors : {}
  // Only the field/code pairs in QUOTE_FIELD_ERRORS occur; a test checks that each has a text.
  const error = (field: QuoteField) => {
    const code = errors[field]
    if (!code) return undefined
    const key = `${field}.${code}` as Parameters<typeof tErrors>[0]
    return tErrors(key, {
      max: field in QUOTE_LIMITS ? QUOTE_LIMITS[field as keyof typeof QUOTE_LIMITS] : 0,
    })
  }
  const problem =
    state.status === 'invalid'
      ? t('problem.invalid', { count: Object.keys(errors).length })
      : state.status === 'tooFast' || state.status === 'rateLimited' || state.status === 'failed'
        ? t(`problem.${state.status}`, { email: contact.email, phone: contact.phone })
        : undefined

  const field = (name: QuoteField) => ({
    id: `quote-${name}`,
    name,
    defaultValue: values?.[name as Exclude<QuoteField, 'consent'>],
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `quote-${name}-error` : undefined,
    className: INPUT,
  })

  return (
    <form
      ref={form}
      action={action}
      noValidate
      aria-describedby={problem ? 'quote-problem' : undefined}
      className="mt-6 grid gap-5"
    >
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name={QUOTE_HIDDEN.config} value={snapshot.config} />
      <input type="hidden" name={QUOTE_HIDDEN.upload} value={snapshot.upload} />
      <input type="hidden" name={QUOTE_HIDDEN.aspect} value={snapshot.aspect} />
      <input type="hidden" name={QUOTE_HIDDEN.screenshot} value={snapshot.screenshot} />
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
          id="quote-problem"
          tabIndex={-1}
          role="alert"
          className="rounded-2xl bg-magenta-700/8 px-4 py-3 text-sm text-magenta-700 ring-1 ring-magenta-700/20 outline-none"
        >
          {problem}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="name" label={t('fields.name')} error={error('name')}>
          <input
            {...field('name')}
            type="text"
            autoComplete="name"
            maxLength={QUOTE_LIMITS.name}
            aria-required="true"
          />
        </Field>
        <Field name="email" label={t('fields.email')} error={error('email')}>
          <input
            {...field('email')}
            type="email"
            inputMode="email"
            autoComplete="email"
            maxLength={QUOTE_LIMITS.email}
            aria-required="true"
          />
        </Field>
        <Field name="phone" label={t('fields.phone')} error={error('phone')}>
          <input {...field('phone')} type="tel" autoComplete="tel" maxLength={QUOTE_LIMITS.phone} />
        </Field>
        <Field name="place" label={t('fields.place')} error={error('place')}>
          <input
            {...field('place')}
            type="text"
            autoComplete="address-level2"
            maxLength={QUOTE_LIMITS.place}
          />
        </Field>
      </div>

      <Field
        name="notes"
        label={t('fields.notes')}
        hint={t('fields.notesHint')}
        error={error('notes')}
      >
        <textarea
          {...field('notes')}
          rows={3}
          maxLength={QUOTE_LIMITS.notes}
          aria-describedby={`quote-notes-hint${errors.notes ? ' quote-notes-error' : ''}`}
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
            aria-describedby={errors.consent ? 'quote-consent-error' : undefined}
            className="mt-0.5 size-5 shrink-0 accent-magenta-700"
          />
          <span>
            {t.rich('fields.consent', {
              link: (chunks) => (
                <a
                  href={privacyHref}
                  target="_blank"
                  rel="noopener"
                  className="font-semibold underline underline-offset-2"
                >
                  {chunks}
                </a>
              ),
            })}
          </span>
        </label>
        {errors.consent && <ErrorText id="quote-consent-error">{error('consent')}</ErrorText>}
      </div>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <button
          type="submit"
          disabled={pending}
          className={`${buttonClasses('primary', 'lg')} disabled:cursor-wait disabled:opacity-70`}
        >
          {pending ? t('sending') : t('submit')}
        </button>
        <p className="text-xs leading-relaxed text-mute">
          {t.rich('alternatives', {
            phone: contact.phone,
            whatsapp: (chunks) => (
              <a href={contact.whatsappHref} className="font-semibold underline underline-offset-2">
                {chunks}
              </a>
            ),
          })}
        </p>
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
  name: QuoteField
  label: string
  hint?: string
  error?: string
  children: ReactNode
}) {
  return (
    <div>
      <label htmlFor={`quote-${name}`} className="text-sm font-semibold">
        {label}
      </label>
      {children}
      {hint && (
        <p id={`quote-${name}-hint`} className="mt-1.5 text-xs text-mute">
          {hint}
        </p>
      )}
      {error && <ErrorText id={`quote-${name}-error`}>{error}</ErrorText>}
    </div>
  )
}

function ErrorText({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="mt-1.5 text-sm text-magenta-700">
      {children}
    </p>
  )
}
