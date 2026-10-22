import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/site.ts'

// /robots.txt: open, with the sitemap, only on the production site (SITE_ENV=production).
// Every other build (previews, tests) is closed, so it never shows up in search results.
export default function robots(): MetadataRoute.Robots {
  if (process.env.SITE_ENV !== 'production') {
    return { rules: { userAgent: '*', disallow: '/' } }
  }
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${siteUrl()}/sitemap.xml`,
  }
}
