import { getLocale } from 'next-intl/server'
import { JsonLd } from '@/components/JsonLd.tsx'
import { company } from '@/content/company.ts'
import type { Locale } from '@/i18n/routing.ts'
import { siteUrl } from '@/lib/site.ts'
import { OG_IMAGE } from './og.ts'
import { localBusinessJsonLd, localizedPath } from './seo.ts'

/** The company as LocalBusiness JSON-LD (home and contact page). */
export async function CompanyJsonLd() {
  const locale = (await getLocale()) as Locale
  const base = siteUrl()
  return (
    <JsonLd
      data={localBusinessJsonLd({
        company,
        url: `${base}${localizedPath(locale, 'home')}`,
        // The Apple touch icon: a raster logo of 180 px (search engines want at least 112).
        logo: `${base}/apple-icon.png`,
        image: `${base}${OG_IMAGE.src}`,
      })}
    />
  )
}
