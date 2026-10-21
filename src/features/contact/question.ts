// The home page question form (Development Plan 4.6): validation, spam checks, and the
// e-mail to the client. Pure functions; the server action (actions.ts) wires them up.

import { z } from 'zod'
import type { MailMessage } from '@/lib/mail.ts'
import {
  type FieldError,
  LIMITS,
  MIN_FILL_MS,
  type Question,
  type QuestionField,
  type QuestionValues,
  SPAM_FIELDS,
} from './fields.ts'

export { LIMITS, MIN_FILL_MS, SPAM_FIELDS }
export type { FieldError, Question, QuestionField, QuestionValues }

const PHONE = /^\+?[\d\s().-]{6,}$/

// Each `error` is a code; the form shows the localized text for it.
const questionSchema = z.object({
  name: z.string().trim().min(1, { error: 'required' }).max(LIMITS.name, { error: 'tooLong' }),
  email: z
    .string()
    .trim()
    .min(1, { error: 'required' })
    .max(LIMITS.email, { error: 'tooLong' })
    .pipe(z.email({ error: 'invalid' })),
  phone: z
    .string()
    .trim()
    .max(LIMITS.phone, { error: 'tooLong' })
    .refine((value) => value === '' || PHONE.test(value), { error: 'invalid' }),
  message: z
    .string()
    .trim()
    .min(1, { error: 'required' })
    .max(LIMITS.message, { error: 'tooLong' }),
  consent: z.literal('on', { error: 'required' }),
})

export type ParseResult =
  | { ok: true; question: Question }
  | { ok: false; errors: Partial<Record<QuestionField, FieldError>> }

function text(formData: FormData, name: string): string {
  const value = formData.get(name)
  return typeof value === 'string' ? value : ''
}

export function questionValues(formData: FormData): QuestionValues {
  return {
    name: text(formData, 'name'),
    email: text(formData, 'email'),
    phone: text(formData, 'phone'),
    message: text(formData, 'message'),
    consent: formData.get('consent') === 'on',
  }
}

export function parseQuestion(formData: FormData): ParseResult {
  const input = {
    ...questionValues(formData),
    consent: formData.get('consent') ?? undefined,
  }
  const result = questionSchema.safeParse(input)
  if (result.success) {
    const { consent: _consent, ...question } = result.data
    return { ok: true, question }
  }
  const errors: Partial<Record<QuestionField, FieldError>> = {}
  for (const issue of result.error.issues) {
    const field = issue.path[0] as QuestionField
    errors[field] ??= issue.message as FieldError
  }
  return { ok: false, errors }
}

export type SpamVerdict = 'ok' | 'honeypot' | 'tooFast'

export function spamVerdict(formData: FormData, now: number): SpamVerdict {
  if (text(formData, SPAM_FIELDS.honeypot) !== '') return 'honeypot'
  // The browser sets startedAt after hydration. Without JavaScript it is empty:
  // then only the honeypot applies.
  const startedAt = Number(text(formData, SPAM_FIELDS.startedAt))
  if (startedAt > 0 && now - startedAt < MIN_FILL_MS) return 'tooFast'
  return 'ok'
}

/** Sliding-window limit per key (the visitor's IP address). Memory only: per server instance. */
export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const hits = new Map<string, number[]>()
  return function allow(key: string, now: number): boolean {
    const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs)
    if (recent.length >= limit) {
      hits.set(key, recent)
      return false
    }
    recent.push(now)
    hits.set(key, recent)
    return true
  }
}

/** The e-mail to the client. In Italian: the client reads Italian, whatever the page language. */
export function questionMail(
  question: Question,
  meta: { to: string; locale: string; page: string },
) {
  const lines = [
    `Nome: ${question.name}`,
    `E-mail: ${question.email}`,
    `Telefono: ${question.phone || '-'}`,
    `Lingua del sito: ${meta.locale.toUpperCase()}`,
    `Pagina: ${meta.page}`,
    '',
    question.message,
  ]
  return {
    to: meta.to,
    replyTo: question.email,
    subject: `Nuova domanda dal sito: ${question.name}`,
    text: lines.join('\n'),
  } satisfies MailMessage
}
