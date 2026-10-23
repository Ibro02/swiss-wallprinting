import { describe, expect, it } from 'vite-plus/test'
import { company } from '../../../content/company.ts'
import { PAGES } from '../../../i18n/pages.ts'
import { routing } from '../../../i18n/routing.ts'
import { siteUrl } from '../../../lib/site.ts'
import { localBusinessJsonLd, localizedPath, sitemapEntries } from '../seo.ts'

const BASE = 'https://example.ch'

describe('localizedPath', () => {
  it('uses the localized slug of each locale', () => {
    expect(localizedPath('it', 'about')).toBe('/it/chi-siamo')
    expect(localizedPath('de', 'tryYourWall')).toBe('/de/wand-testen')
    expect(localizedPath('bs', 'privacy')).toBe('/bs/privatnost')
    expect(localizedPath('it', 'projects')).toBe('/it/progetti')
    expect(localizedPath('de', 'faq')).toBe('/de/haeufige-fragen')
  })

  it('gives the home page as the bare locale', () => {
    expect(localizedPath('en', 'home')).toBe('/en')
  })
})

describe('sitemapEntries', () => {
  const entries = sitemapEntries(BASE)

  it('lists every page in every locale once', () => {
    expect(entries).toHaveLength(Object.keys(PAGES).length * routing.locales.length)
    expect(new Set(entries.map((entry) => entry.url)).size).toBe(entries.length)
  })

  it('links each page to all its language versions and x-default', () => {
    const about = entries.find((entry) => entry.url === `${BASE}/de/ueber-uns`)
    expect(about?.alternates.languages).toEqual({
      it: `${BASE}/it/chi-siamo`,
      de: `${BASE}/de/ueber-uns`,
      en: `${BASE}/en/about`,
      bs: `${BASE}/bs/o-nama`,
      'x-default': `${BASE}/it/chi-siamo`,
    })
  })
})

describe('localBusinessJsonLd', () => {
  const data = localBusinessJsonLd({
    company,
    url: `${BASE}/it`,
    logo: `${BASE}/logo.png`,
    image: `${BASE}/og.jpg`,
  })

  it('describes the company from the content file', () => {
    expect(data).toMatchObject({
      '@type': 'LocalBusiness',
      name: company.name,
      email: company.email,
      address: { postalCode: company.postalCode, addressLocality: company.locality },
      foundingDate: String(company.founded),
    })
  })

  it('lists only the social profiles that have a link', () => {
    expect(data.sameAs).not.toContain(null)
    expect(data.sameAs).toContain(company.social.instagram)
  })

  it('never claims a rating or reviews (they are mock content)', () => {
    expect(JSON.stringify(data)).not.toMatch(/aggregateRating|review/i)
  })
})

describe('siteUrl', () => {
  it('has no trailing slash and falls back to the .ch domain', () => {
    expect(siteUrl({ SITE_URL: 'http://localhost:3001/' })).toBe('http://localhost:3001')
    expect(siteUrl({})).toBe('https://www.swisswallprinting.ch')
  })
})
