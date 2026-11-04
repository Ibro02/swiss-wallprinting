// The site's languages in one place: the routing (routing.ts), the language switcher, <html lang>,
// hreflang (pages and sitemap), and og:locale read them from here.
// Client-safe: no imports.
//
// BHS (swiss-wallprinting/ADR/0003-bhs-one-language.md): Bosnian, Croatian, and Serbian are one
// language on this site, with one text in Latin script. Its locale is `bs`, because next-intl
// formats plurals, numbers, and dates with the locale, and `bhs` is no locale that Intl knows
// (ISO 639-3 Buwal: Intl falls back to en-US, so "3 fotografije" became "3 fotografija"). The
// visitor sees `bhs`: the address /bhs/…, the name BHS. Never use `bhs` as a language tag.

export const LOCALES = ['it', 'de', 'en', 'bs'] as const
export type Locale = (typeof LOCALES)[number]

/** Italian first: the company is in Ticino. `/` opens it, and it is hreflang x-default. */
export const DEFAULT_LOCALE = 'it' satisfies Locale

/** What the browser needs of each language: the switcher and <html lang>. */
export interface Language {
  /** The address prefix of this language's pages. */
  prefix: `/${string}`
  /** The short code: the header button, the switcher, the form e-mails. */
  code: string
  /** The name in the language itself, for the switcher. */
  name: string
  /** BCP 47 tag of the text: `<html lang>`, `lang` and `hreflang` on the switcher's links. */
  htmlLang: string
}

export const LANGUAGES: Record<Locale, Language> = {
  it: { prefix: '/it', code: 'IT', name: 'Italiano', htmlLang: 'it' },
  de: { prefix: '/de', code: 'DE', name: 'Deutsch', htmlLang: 'de' },
  en: { prefix: '/en', code: 'EN', name: 'English', htmlLang: 'en' },
  // One shared version for Bosnia and Herzegovina, Croatia, and Serbia, in Latin script.
  // The switcher shows "Bos / Hrv / Srp" with the code BHS (the author, 2026-11-04).
  bs: { prefix: '/bhs', code: 'BHS', name: 'Bos / Hrv / Srp', htmlLang: 'bs-Latn' },
}

/**
 * What search engines know of each language. Only the server reads it (the metadata and the
 * sitemap), so it stays out of the browser's bundle, which is close to its 160 KB budget: keep
 * browser facts in LANGUAGES and server facts here.
 */
export interface LanguageReach {
  /**
   * The hreflang values that point to this version (Google: an ISO 639-1 language, optionally an
   * ISO 15924 script and an ISO 3166-1 region). One URL may serve several languages.
   */
  hreflang: readonly string[]
  /** og:locale (language_TERRITORY, the form that link previews know). */
  ogLocale: string
}

export const LANGUAGE_REACH: Record<Locale, LanguageReach> = {
  it: { hreflang: ['it'], ogLocale: 'it_IT' },
  de: { hreflang: ['de'], ogLocale: 'de_DE' },
  en: { hreflang: ['en'], ogLocale: 'en_GB' },
  // Language-only hreflang values, so a Bosnian, Croatian, or Serbian searcher anywhere (also
  // abroad) finds the one version. `sr` covers both scripts; the page itself says `bs-Latn`.
  bs: { hreflang: ['bs', 'hr', 'sr'], ogLocale: 'bs_BA' },
}

/** next-intl's `localePrefix.prefixes`. */
export const LOCALE_PREFIXES = Object.fromEntries(
  LOCALES.map((locale) => [locale, LANGUAGES[locale].prefix]),
) as Record<Locale, `/${string}`>

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value)
}

/** The locale of an address prefix segment: `bhs` → `bs`. Undefined for anything else. */
export function localeOfPrefix(segment: string | undefined): Locale | undefined {
  return LOCALES.find((locale) => LANGUAGES[locale].prefix === `/${segment}`)
}

/** The short code of a locale for people (the form e-mails): `bs` → `BHS`. */
export function localeCode(locale: string): string {
  return isLocale(locale) ? LANGUAGES[locale].code : locale.toUpperCase()
}

/**
 * The hreflang alternates of one page: every hreflang value of every locale, and x-default (the
 * default locale). `pathOf` gives the page's address in a locale. The same set on every version
 * of the page, in the <head> and in the sitemap.
 */
export function hreflangAlternates(pathOf: (locale: Locale) => string): Record<string, string> {
  const languages: Record<string, string> = {}
  for (const locale of LOCALES) {
    for (const tag of LANGUAGE_REACH[locale].hreflang) languages[tag] = pathOf(locale)
  }
  languages['x-default'] = pathOf(DEFAULT_LOCALE)
  return languages
}
