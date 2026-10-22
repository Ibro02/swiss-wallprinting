import type { MetadataRoute } from 'next'
import { sitemapEntries } from '@/features/seo/seo.ts'
import { siteUrl } from '@/lib/site.ts'

// /sitemap.xml: every page in every locale, with the same hreflang alternates as the pages'
// own <link rel="alternate"> (metadataFor).
export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapEntries(siteUrl())
}
