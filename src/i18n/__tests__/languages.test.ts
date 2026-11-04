import { describe, expect, it } from 'vite-plus/test'
import {
  DEFAULT_LOCALE,
  hreflangAlternates,
  isLocale,
  LANGUAGE_REACH,
  LANGUAGES,
  LOCALE_PREFIXES,
  LOCALES,
  localeCode,
  localeOfPrefix,
} from '../languages.ts'
import { routing } from '../routing.ts'

// Google's hreflang: an ISO 639-1 language, optionally an ISO 15924 script, optionally an
// ISO 3166-1 alpha-2 region (developers.google.com/search/docs/specialty/international).
const HREFLANG = /^[a-z]{2}(-[A-Z][a-z]{3})?(-[A-Z]{2})?$/

describe('languages', () => {
  it('drives the routing', () => {
    expect(routing.locales).toEqual(LOCALES)
    expect(routing.defaultLocale).toBe(DEFAULT_LOCALE)
    expect(routing.localePrefix).toEqual({ mode: 'always', prefixes: LOCALE_PREFIXES })
  })

  it('gives every language its own address prefix', () => {
    const prefixes = LOCALES.map((locale) => LANGUAGES[locale].prefix)
    expect(new Set(prefixes).size).toBe(prefixes.length)
    for (const prefix of prefixes) expect(prefix).toMatch(/^\/[a-z]+$/)
  })

  it('serves BHS as one language at /bhs, in Latin script', () => {
    expect(LANGUAGES.bs).toMatchObject({
      prefix: '/bhs',
      code: 'BHS',
      name: 'Bos / Hrv / Srp',
      htmlLang: 'bs-Latn',
    })
    expect(LANGUAGE_REACH.bs.ogLocale).toBe('bs_BA')
    expect([...LANGUAGE_REACH.bs.hreflang].sort()).toEqual(['bs', 'hr', 'sr'])
  })

  it('uses only valid hreflang values, each for one version, and never "bhs"', () => {
    const tags = LOCALES.flatMap((locale) => LANGUAGE_REACH[locale].hreflang)
    for (const tag of tags) expect(tag).toMatch(HREFLANG)
    expect(new Set(tags).size).toBe(tags.length)
    expect(tags).not.toContain('bhs')
    expect(tags).not.toContain('x-default')
  })

  it('declares language tags that the browser and Intl understand', () => {
    for (const locale of LOCALES) {
      const { htmlLang } = LANGUAGES[locale]
      expect(Intl.getCanonicalLocales(htmlLang)).toEqual([htmlLang])
      expect(htmlLang).not.toMatch(/^bhs/)
    }
  })

  it('keeps every locale one that Intl formats (why BHS is `bs`, not `bhs`)', () => {
    for (const locale of LOCALES) {
      expect(Intl.PluralRules.supportedLocalesOf(locale), locale).toEqual([locale])
    }
    // Bosnian plurals: 1 fotografija, 3 fotografije, 5 fotografija.
    const plural = new Intl.PluralRules('bs')
    expect([plural.select(1), plural.select(3), plural.select(5)]).toEqual(['one', 'few', 'other'])
    expect(new Intl.NumberFormat('bs').format(3.8)).toBe('3,8')
  })

  it('finds the locale of an address prefix', () => {
    expect(localeOfPrefix('bhs')).toBe('bs')
    expect(localeOfPrefix('it')).toBe('it')
    expect(localeOfPrefix('bs')).toBeUndefined()
    expect(localeOfPrefix(undefined)).toBeUndefined()
  })

  it('names the locale for people', () => {
    expect(localeCode('bs')).toBe('BHS')
    expect(localeCode('de')).toBe('DE')
    expect(localeCode('xx')).toBe('XX')
    expect(isLocale('bs')).toBe(true)
    expect(isLocale('bhs')).toBe(false)
  })

  it('builds one hreflang set: every tag of every version, and x-default', () => {
    expect(hreflangAlternates((locale) => `/${locale}/x`)).toEqual({
      it: '/it/x',
      de: '/de/x',
      en: '/en/x',
      bs: '/bs/x',
      hr: '/bs/x',
      sr: '/bs/x',
      'x-default': '/it/x',
    })
  })
})
