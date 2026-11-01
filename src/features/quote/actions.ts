'use server'

import { headers } from 'next/headers'
import { hasLocale } from 'next-intl'
import { configuratorContent } from '@/features/configurator/content.ts'
import { getPathname } from '@/i18n/navigation.ts'
import { PAGES } from '@/i18n/pages.ts'
import { routing } from '@/i18n/routing.ts'
import { mailTransport } from '@/lib/mail.ts'
import { formSecret } from '@/lib/form-token.ts'
import { createRateLimiter, FORM_LIMIT, FORM_LIMIT_WITHOUT_TOKEN } from '@/lib/rate-limit.ts'
import { clientIp } from '@/lib/request.ts'
import { siteUrl } from '@/lib/site.ts'
import { handleQuote, type QuoteState } from './handle-quote.ts'

// The same limits as the question form, counted apart.
const allow = createRateLimiter(FORM_LIMIT)
const allowWithoutToken = createRateLimiter(FORM_LIMIT_WITHOUT_TOKEN)

// Italian titles: the e-mail goes to the client in Italian.
const { presets: presetsIt, machineMaxHeight, rates, ratesAreExamples } = configuratorContent('it')
const presets = presetsIt.map(({ id, title, image }) => ({
  id,
  title,
  aspect: image.width / image.height,
}))

export async function submitQuote(_previous: QuoteState, formData: FormData): Promise<QuoteState> {
  const requestHeaders = await headers()
  const ip = clientIp(requestHeaders)
  const sent = formData.get('locale')
  const locale =
    typeof sent === 'string' && hasLocale(routing.locales, sent) ? sent : routing.defaultLocale
  const now = Date.now()

  return handleQuote(formData, {
    now,
    secret: formSecret(),
    allow: (withToken) => (withToken ? allow : allowWithoutToken)(ip, now),
    to: process.env.CONTACT_TO || undefined,
    transport: mailTransport,
    presets,
    locale,
    // From SITE_URL, never from the Origin header: a script sets any Origin, and this link
    // goes to the client, who trusts it.
    configuratorUrl: `${siteUrl()}${getPathname({ href: PAGES.tryYourWall, locale })}`,
    machineMaxHeight,
    rates,
    ratesAreExamples,
    logError: (message, error) => console.error(`[form] ${message}`, error ?? ''),
  })
}
