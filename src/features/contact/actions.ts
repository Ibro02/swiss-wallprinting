'use server'

import { headers } from 'next/headers'
import { hasLocale } from 'next-intl'
import { routing } from '@/i18n/routing.ts'
import { mailTransport } from '@/lib/mail.ts'
import { handleQuestion, type QuestionState } from './handle-question.ts'
import { createRateLimiter } from './question.ts'

// 5 messages per visitor in 10 minutes. In memory, so per server instance: enough
// against a person who clicks too often, not against a botnet (then add Turnstile).
const allow = createRateLimiter({ limit: 5, windowMs: 10 * 60_000 })

export async function submitQuestion(
  _previous: QuestionState,
  formData: FormData,
): Promise<QuestionState> {
  const requestHeaders = await headers()
  const ip =
    requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    requestHeaders.get('x-real-ip') ??
    'unknown'
  const locale = formData.get('locale')
  const now = Date.now()

  return handleQuestion(formData, {
    now,
    allow: () => allow(ip, now),
    to: process.env.CONTACT_TO || undefined,
    transport: mailTransport,
    locale:
      typeof locale === 'string' && hasLocale(routing.locales, locale)
        ? locale
        : routing.defaultLocale,
    page: requestHeaders.get('referer') ?? '-',
    logError: (message, error) => console.error(`[form] ${message}`, error ?? ''),
  })
}
