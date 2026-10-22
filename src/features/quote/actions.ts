'use server'

import { headers } from 'next/headers'
import { hasLocale } from 'next-intl'
import { printFacts } from '@/content/company.ts'
import { images } from '@/content/images/index.ts'
import { collections } from '@/content/index.ts'
import { pricing } from '@/content/pricing.ts'
import { getPathname } from '@/i18n/navigation.ts'
import { PAGES } from '@/i18n/pages.ts'
import { routing } from '@/i18n/routing.ts'
import { mailTransport } from '@/lib/mail.ts'
import { createRateLimiter } from '@/lib/rate-limit.ts'
import { clientIp } from '@/lib/request.ts'
import { siteUrl } from '@/lib/site.ts'
import { handleQuote, type QuoteState } from './handle-quote.ts'

// The same limit as the question form (src/lib/rate-limit.ts).
const allow = createRateLimiter({ perKey: 5, total: 30, windowMs: 10 * 60_000 })

const presets = collections.presets.map((preset) => {
  const image = images[preset.image]
  return { id: preset.id, title: preset.title.it, aspect: image.width / image.height }
})

export async function submitQuote(_previous: QuoteState, formData: FormData): Promise<QuoteState> {
  const requestHeaders = await headers()
  const ip = clientIp(requestHeaders)
  const sent = formData.get('locale')
  const locale =
    typeof sent === 'string' && hasLocale(routing.locales, sent) ? sent : routing.defaultLocale
  const now = Date.now()
  const { id: _id, mock: ratesAreExamples, ...rates } = pricing

  return handleQuote(formData, {
    now,
    allow: () => allow(ip, now),
    to: process.env.CONTACT_TO || undefined,
    transport: mailTransport,
    presets,
    locale,
    // From SITE_URL, never from the Origin header: a script sets any Origin, and this link
    // goes to the client, who trusts it.
    configuratorUrl: `${siteUrl()}${getPathname({ href: PAGES.tryYourWall, locale })}`,
    machineMaxHeight: printFacts.maxPrintHeightM,
    rates,
    ratesAreExamples,
    logError: (message, error) => console.error(`[form] ${message}`, error ?? ''),
  })
}
