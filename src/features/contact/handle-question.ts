// The question form flow, without Next.js: actions.ts passes the request data in,
// the tests pass fakes in.

import type { MailTransport } from '@/lib/mail.ts'
import {
  type FieldError,
  parseQuestion,
  type QuestionField,
  questionMail,
  type QuestionValues,
  questionValues,
  spamVerdict,
} from './question.ts'

export type QuestionState =
  | { status: 'idle' }
  | {
      status: 'invalid'
      errors: Partial<Record<QuestionField, FieldError>>
      values: QuestionValues
    }
  | { status: 'tooFast' | 'rateLimited' | 'failed'; values: QuestionValues }
  | { status: 'sent'; email: string }

export interface QuestionDeps {
  now: number
  /** True if this visitor may send now (rate limit). */
  allow: () => boolean
  /** Recipient (CONTACT_TO). Undefined: not configured. */
  to: string | undefined
  /** Lazy, so a missing transport is a "not sent" state and not a crash. */
  transport: () => MailTransport
  locale: string
  page: string
  logError: (message: string, error?: unknown) => void
}

export async function handleQuestion(
  formData: FormData,
  deps: QuestionDeps,
): Promise<QuestionState> {
  const values = questionValues(formData)

  const verdict = spamVerdict(formData, deps.now)
  // A bot gets the normal success answer, so it learns nothing. No mail is sent.
  if (verdict === 'honeypot') return { status: 'sent', email: values.email }
  if (verdict === 'tooFast') return { status: 'tooFast', values }

  const parsed = parseQuestion(formData)
  if (!parsed.ok) return { status: 'invalid', errors: parsed.errors, values }

  if (!deps.allow()) return { status: 'rateLimited', values }

  if (!deps.to) {
    deps.logError('Question form: CONTACT_TO is not set, so the message has no recipient.')
    return { status: 'failed', values }
  }

  try {
    const mail = questionMail(parsed.question, {
      to: deps.to,
      locale: deps.locale,
      page: deps.page,
    })
    await deps.transport().send(mail)
  } catch (error) {
    deps.logError('Question form: the e-mail was not sent.', error)
    return { status: 'failed', values }
  }
  return { status: 'sent', email: parsed.question.email }
}
