import type { Metadata } from 'next'
import { hasLocale } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { company } from '@/content/company.ts'
import { OG_IMAGE, OG_LOCALES } from '@/features/seo/og.ts'
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
 * The description of each page: its own lead sentence, already on the page in every language
 * (no extra texts to keep in step). The home page and the imprint keep the site description
 * from the layout (`Metadata.description`).
 */
const DESCRIPTIONS = {
  about: 'About.lead',
  services: 'Services.lead',
  gallery: 'Gallery.lead',
  contact: 'Contact.lead',
  tryYourWall: 'Configurator.lead',
  privacy: 'Privacy.lead',
} as const satisfies Partial<Record<PageKey, string>>

/**
 * `generateMetadata` for a page: localized title (the layout adds "· Swiss Wall Printing"),
 * description, canonical URL, hreflang alternates, and the link preview (Open Graph, Twitter).
 * Usage: `export const generateMetadata = metadataFor('about')`.
 */
export function metadataFor(page: PageKey) {
  return async function generateMetadata({ params }: PageParams): Promise<Metadata> {
    const { locale } = await params
    if (!hasLocale(routing.locales, locale)) return {}
    const href = PAGES[page]
    const pages = await getTranslations({ locale, namespace: 'Pages' })
    const site = await getTranslations({ locale, namespace: 'Metadata' })
    const all = await getTranslations({ locale })
    const key = page in DESCRIPTIONS ? DESCRIPTIONS[page as keyof typeof DESCRIPTIONS] : null
    // About.lead names the place ({locality}); the other leads have no placeholders.
    const description = key ? all(key, { locality: company.locality }) : site('description')
    // The home page keeps the site title from the layout.
    const title = page === 'home' ? site('title') : `${pages(`${page}.title`)} · ${company.name}`
    const canonical = getPathname({ locale, href })
    return {
      ...(page === 'home' ? {} : { title: pages(`${page}.title`) }),
      description,
      alternates: { canonical, languages: languageAlternates(href) },
      openGraph: {
        type: 'website',
        siteName: company.name,
        title,
        description,
        url: canonical,
        locale: OG_LOCALES[locale],
        images: [{ ...OG_IMAGE, url: OG_IMAGE.src, alt: company.name }],
      },
      twitter: { card: 'summary_large_image', title, description, images: [OG_IMAGE.src] },
    }
  }
}
