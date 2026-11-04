import { defineRouting } from 'next-intl/routing'
import { DEFAULT_LOCALE, LOCALE_PREFIXES, LOCALES } from './languages.ts'

// The languages, their prefixes, and their tags are in languages.ts. BHS has the locale `bs` and
// the prefix /bhs: next-intl rewrites /bhs/… to the internal /bs/… routes, and the proxy
// redirects an old /bs/… address. The domain split (.ch, .com) is decided in Phase 7
// (Development Plan, section 3).
export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: { mode: 'always', prefixes: LOCALE_PREFIXES },
  // An address without a language (/) always opens Italian (the author, 2026-11-01): no
  // redirect by the browser's language or by an earlier visit's cookie. Without detection
  // nothing reads the language cookie, so none is set (the privacy page says so).
  localeDetection: false,
  localeCookie: false,
  // No HTTP Link header with hreflang: next-intl's names one tag per locale (`bs`, not `hr` and
  // `sr`) and takes its host from the request headers. The pages' <link rel="alternate">
  // (metadataFor) and the sitemap carry the full set.
  alternateLinks: false,
  pathnames: {
    '/': '/',
    '/about': { it: '/chi-siamo', de: '/ueber-uns', en: '/about', bs: '/o-nama' },
    '/services': { it: '/servizi', de: '/leistungen', en: '/services', bs: '/usluge' },
    '/projects': { it: '/progetti', de: '/projekte', en: '/projects', bs: '/projekti' },
    '/faq': { it: '/domande-frequenti', de: '/haeufige-fragen', en: '/faq', bs: '/cesta-pitanja' },
    '/contact': { it: '/contatti', de: '/kontakt', en: '/contact', bs: '/kontakt' },
    '/try-your-wall': {
      it: '/prova-la-tua-parete',
      de: '/wand-testen',
      en: '/try-your-wall',
      bs: '/isprobaj-zid',
    },
    '/imprint': { it: '/note-legali', de: '/impressum', en: '/imprint', bs: '/impresum' },
    '/privacy': { it: '/privacy', de: '/datenschutz', en: '/privacy', bs: '/privatnost' },
  },
})

export type Locale = (typeof routing.locales)[number]
export type Pathname = keyof typeof routing.pathnames
