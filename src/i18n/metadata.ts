import type { Metadata } from 'next'
import { hasLocale } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { company } from '@/content/company.ts'
import { OG_IMAGE } from '@/features/seo/og.ts'
import { localizedPath, pageAlternates } from '@/features/seo/seo.ts'
import { LANGUAGE_REACH } from './languages.ts'
import type { PageKey } from './pages.ts'
import { routing } from './routing.ts'

interface PageParams {
  params: Promise<{ locale: string }>
}

/**
 * The description of each page: its own lead sentence, already on the page in every language
 * (no extra texts to keep in step). The imprint has no lead, so it has its own
 * `Imprint.description`; the home page keeps the site description (`Metadata.description`).
 */
const DESCRIPTIONS = {
  about: 'About.lead',
  services: 'Services.lead',
  projects: 'Projects.lead',
  faq: 'Faq.lead',
  contact: 'Contact.lead',
  tryYourWall: 'Configurator.lead',
  privacy: 'Privacy.lead',
  imprint: 'Imprint.description',
} as const satisfies Partial<Record<PageKey, string>>

/**
 * `generateMetadata` for a page: localized title (the layout adds "· Swiss Wall Printing"),
 * description, canonical URL (the page itself), hreflang alternates (the same set on every
 * language version, as in the sitemap), and the link preview (Open Graph, Twitter).
 * Usage: `export const generateMetadata = metadataFor('about')`.
 */
export function metadataFor(page: PageKey) {
  return async function generateMetadata({ params }: PageParams): Promise<Metadata> {
    const { locale } = await params
    if (!hasLocale(routing.locales, locale)) return {}
    const pages = await getTranslations({ locale, namespace: 'Pages' })
    const site = await getTranslations({ locale, namespace: 'Metadata' })
    const all = await getTranslations({ locale })
    const key = page in DESCRIPTIONS ? DESCRIPTIONS[page as keyof typeof DESCRIPTIONS] : null
    // About.lead names the year and the place; the other leads have no placeholders.
    const description = key
      ? all(key, {
          year: String(company.founded),
          locality: company.locality,
          municipality: company.municipality,
        })
      : site('description')
    // The home page keeps the site title from the layout.
    const title = page === 'home' ? site('title') : `${pages(`${page}.title`)} · ${company.name}`
    const canonical = localizedPath(locale, page)
    return {
      ...(page === 'home' ? {} : { title: pages(`${page}.title`) }),
      description,
      alternates: { canonical, languages: pageAlternates(page) },
      openGraph: {
        type: 'website',
        siteName: company.name,
        title,
        description,
        url: canonical,
        locale: LANGUAGE_REACH[locale].ogLocale,
        images: [{ ...OG_IMAGE, url: OG_IMAGE.src, alt: company.name }],
      },
      twitter: { card: 'summary_large_image', title, description, images: [OG_IMAGE.src] },
    }
  }
}
