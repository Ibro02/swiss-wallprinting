'use server'

import { headers } from 'next/headers'
import { hasLocale } from 'next-intl'
import { routing } from '@/i18n/routing.ts'
import { createFormToken, FORM_NAMES, type FormName, formSecret } from '@/lib/form-token.ts'
import { mailTransport } from '@/lib/mail.ts'
import { createRateLimiter, FORM_LIMIT, FORM_LIMIT_WITHOUT_TOKEN } from '@/lib/rate-limit.ts'
import { clientIp, refererPath } from '@/lib/request.ts'
import { handleQuestion, type QuestionState } from './handle-question.ts'

const allow = createRateLimiter(FORM_LIMIT)
const allowWithoutToken = createRateLimiter(FORM_LIMIT_WITHOUT_TOKEN)

/**
 * The signed fill-time token (src/lib/form-token.ts). Both forms ask for it after
 * hydration; the static pages cannot carry one.
 */
export async function issueFormToken(form: FormName): Promise<string> {
  // The argument comes from the browser.
  if (!FORM_NAMES.includes(form)) throw new Error('Unknown form.')
  return createFormToken(form, Date.now(), formSecret())
}

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
    secret: formSecret(),
    allow: (withToken) => (withToken ? allow : allowWithoutToken)(ip, now),
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
