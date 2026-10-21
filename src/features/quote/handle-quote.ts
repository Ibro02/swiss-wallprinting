// The quote request flow, without Next.js: actions.ts passes the request data in, the
// tests pass fakes in. Same spam rules as the question form (fields, fill time, limit).

import { spamVerdict } from '@/features/contact/question.ts'
import type { MailTransport } from '@/lib/mail.ts'
import type { FieldError, QuoteField, QuoteValues } from './fields.ts'
import {
  parseDesign,
  parseQuote,
  parseScreenshot,
  type QuoteMailMeta,
  type QuotePreset,
  quoteMail,
  quoteValues,
} from './quote.ts'

export type QuoteState =
  | { status: 'idle' }
  | {
      status: 'invalid'
      errors: Partial<Record<QuoteField, FieldError>>
      values: QuoteValues
    }
  | { status: 'tooFast' | 'rateLimited' | 'failed'; values: QuoteValues }
  | { status: 'sent'; email: string }

export interface QuoteDeps extends Omit<QuoteMailMeta, 'to'> {
  now: number
  allow: () => boolean
  /** Recipient (CONTACT_TO). Undefined: not configured. */
  to: string | undefined
  transport: () => MailTransport
  presets: readonly QuotePreset[]
  logError: (message: string, error?: unknown) => void
}

export async function handleQuote(formData: FormData, deps: QuoteDeps): Promise<QuoteState> {
  const values = quoteValues(formData)

  const verdict = spamVerdict(formData, deps.now)
  // A bot gets the normal success answer, so it learns nothing. No mail is sent.
  if (verdict === 'honeypot') return { status: 'sent', email: values.email }
  if (verdict === 'tooFast') return { status: 'tooFast', values }

  const parsed = parseQuote(formData)
  if (!parsed.ok) return { status: 'invalid', errors: parsed.errors, values }

  // The configurator fills these fields; a broken value is a bug, not the visitor's fault.
  const design = parseDesign(formData, deps.presets)
  if (!design) {
    deps.logError('Quote form: the configuration in the form is missing or not valid.')
    return { status: 'failed', values }
  }

  if (!deps.allow()) return { status: 'rateLimited', values }

  if (!deps.to) {
    deps.logError('Quote form: CONTACT_TO is not set, so the request has no recipient.')
    return { status: 'failed', values }
  }

  try {
    const mail = quoteMail(parsed.contact, design, parseScreenshot(formData), {
      to: deps.to,
      locale: deps.locale,
      configuratorUrl: deps.configuratorUrl,
      machineMaxHeight: deps.machineMaxHeight,
      rates: deps.rates,
      ratesAreExamples: deps.ratesAreExamples,
    })
    await deps.transport().send(mail)
  } catch (error) {
    deps.logError('Quote form: the e-mail was not sent.', error)
    return { status: 'failed', values }
  }
  return { status: 'sent', email: parsed.contact.email }
}
