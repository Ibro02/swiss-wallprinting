import type { Metadata } from 'next'
import { hasLocale } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { getPathname } from './navigation.ts'
import { PAGES, type PageKey } from './pages.ts'
import { routing } from './routing.ts'

interface PageParams {
  params: Promise<{ locale: string }>
}

/** Links to the same page in every locale (hreflang), plus x-default (Italian). */
export function languageAlternates(href: (typeof PAGES)[PageKey]) {
  return {
    ...Object.fromEntries(routing.locales.map((locale) => [locale, getPathname({ locale, href })])),
    'x-default': getPathname({ locale: routing.defaultLocale, href }),
  }
}

/**
 * `generateMetadata` for a page: localized title (the layout adds
 * "· Swiss Wall Printing"), canonical URL, and hreflang alternates.
 * Usage: `export const generateMetadata = metadataFor('about')`.
 */
export function metadataFor(page: PageKey) {
  return async function generateMetadata({ params }: PageParams): Promise<Metadata> {
    const { locale } = await params
    if (!hasLocale(routing.locales, locale)) return {}
    const href = PAGES[page]
    const t = await getTranslations({ locale, namespace: 'Pages' })
    return {
      // The home page keeps the site title from the layout.
      ...(page === 'home' ? {} : { title: t(`${page}.title`) }),
      alternates: {
        canonical: getPathname({ locale, href }),
        languages: languageAlternates(href),
      },
    }
  }
}
