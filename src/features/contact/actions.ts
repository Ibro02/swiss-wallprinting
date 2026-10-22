'use server'

import { headers } from 'next/headers'
import { hasLocale } from 'next-intl'
import { routing } from '@/i18n/routing.ts'
import { mailTransport } from '@/lib/mail.ts'
import { createRateLimiter } from '@/lib/rate-limit.ts'
import { clientIp, refererPath } from '@/lib/request.ts'
import { handleQuestion, type QuestionState } from './handle-question.ts'

// 5 messages per visitor in 10 minutes, and 30 of all visitors together (src/lib/rate-limit.ts).
const allow = createRateLimiter({ perKey: 5, total: 30, windowMs: 10 * 60_000 })

export async function submitQuestion(
  _previous: QuestionState,
  formData: FormData,
): Promise<QuestionState> {
  const requestHeaders = await headers()
  const ip = clientIp(requestHeaders)
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
    page: refererPath(requestHeaders.get('referer')),
    logError: (message, error) => console.error(`[form] ${message}`, error ?? ''),
  })
}
