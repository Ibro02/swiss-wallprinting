// Search engines (Phase 6): the localized address of each page, the sitemap entries with
// their hreflang alternates, and the LocalBusiness JSON-LD. Pure functions with tests; the
// routes are src/app/sitemap.ts and src/app/robots.ts, the JSON-LD goes on the home and the
// contact page.

import type { Company } from '@/content/schema.ts'
import { PAGES, type PageKey } from '@/i18n/pages.ts'
import { type Locale, routing } from '@/i18n/routing.ts'

/** The path of a page in a locale: `/it/chi-siamo`, `/de` for the home page. */
export function localizedPath(locale: Locale, page: PageKey): string {
  const pathname = routing.pathnames[PAGES[page]]
  const localized = typeof pathname === 'string' ? pathname : pathname[locale]
  return localized === '/' ? `/${locale}` : `/${locale}${localized}`
}

export interface SitemapEntry {
  url: string
  alternates: { languages: Record<string, string> }
}

/** Every page in every locale, each with all its language versions and x-default (Italian). */
export function sitemapEntries(baseUrl: string): SitemapEntry[] {
  return (Object.keys(PAGES) as PageKey[]).flatMap((page) => {
    const languages: Record<string, string> = Object.fromEntries(
      routing.locales.map((locale) => [locale, `${baseUrl}${localizedPath(locale, page)}`]),
    )
    languages['x-default'] = `${baseUrl}${localizedPath(routing.defaultLocale, page)}`
    return routing.locales.map((locale) => ({
      url: `${baseUrl}${localizedPath(locale, page)}`,
      alternates: { languages },
    }))
  })
}

/**
 * The company as schema.org LocalBusiness, only from the content file. No rating and no
 * reviews: the reviews are mock content (and self-made review markup is not allowed anyway).
 */
export function localBusinessJsonLd({
  company,
  url,
  logo,
  image,
}: {
  company: Company
  url: string
  logo: string
  image: string
}) {
  const [phone] = company.phones
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: company.name,
    url,
    logo,
    image,
    email: company.email,
    foundingDate: String(company.founded),
    ...(phone ? { telephone: phone.e164 } : {}),
    address: {
      '@type': 'PostalAddress',
      postalCode: company.postalCode,
      addressLocality: company.locality,
      addressRegion: company.canton,
      addressCountry: 'CH',
    },
    sameAs: [company.social.instagram, company.social.facebook, company.social.tiktok].filter(
      (link) => link !== null,
    ),
  }
}
