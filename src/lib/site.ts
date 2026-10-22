// The site's own address, for absolute URLs (canonical, hreflang, sitemap, robots, JSON-LD,
// the quote e-mail's links). SITE_URL per deployment; the domains are decided in Phase 7.

const DEFAULT_SITE_URL = 'https://www.swisswallprinting.ch'

export function siteUrl(env: Record<string, string | undefined> = process.env): string {
  return (env.SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, '')
}
