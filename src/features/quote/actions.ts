'use server'

import { headers } from 'next/headers'
import { hasLocale } from 'next-intl'
import { printFacts } from '@/content/company.ts'
import { images } from '@/content/images/index.ts'
import { collections } from '@/content/index.ts'
import { pricing } from '@/content/pricing.ts'
import { createRateLimiter } from '@/features/contact/question.ts'
import { getPathname } from '@/i18n/navigation.ts'
import { PAGES } from '@/i18n/pages.ts'
import { routing } from '@/i18n/routing.ts'
import { mailTransport } from '@/lib/mail.ts'
import { siteUrl } from '@/lib/site.ts'
import { handleQuote, type QuoteState } from './handle-quote.ts'

// 5 requests per visitor in 10 minutes, as for the question form (memory only).
const allow = createRateLimiter({ limit: 5, windowMs: 10 * 60_000 })

const presets = collections.presets.map((preset) => {
  const image = images[preset.image]
  return { id: preset.id, title: preset.title.it, aspect: image.width / image.height }
})

export async function submitQuote(_previous: QuoteState, formData: FormData): Promise<QuoteState> {
  const requestHeaders = await headers()
  const ip =
    requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    requestHeaders.get('x-real-ip') ??
    'unknown'
  const sent = formData.get('locale')
  const locale =
    typeof sent === 'string' && hasLocale(routing.locales, sent) ? sent : routing.defaultLocale
  // The browser sends Origin with every Server Action; SITE_URL is the fallback.
  const origin = requestHeaders.get('origin') ?? siteUrl()
  const now = Date.now()
  const { id: _id, mock: ratesAreExamples, ...rates } = pricing

  return handleQuote(formData, {
    now,
    allow: () => allow(ip, now),
    to: process.env.CONTACT_TO || undefined,
    transport: mailTransport,
    presets,
    locale,
    configuratorUrl: `${origin}${getPathname({ href: PAGES.tryYourWall, locale })}`,
    machineMaxHeight: printFacts.maxPrintHeightM,
    rates,
    ratesAreExamples,
    logError: (message, error) => console.error(`[form] ${message}`, error ?? ''),
  })
}
