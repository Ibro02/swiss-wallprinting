import { defineRouting } from 'next-intl/routing'

// Italian first: the company is in Ticino. Bosnian is for the .com domain;
// the domain split is decided in Phase 7 (see Development Plan, section 3).
export const routing = defineRouting({
  locales: ['it', 'de', 'en', 'bs'],
  defaultLocale: 'it',
  localePrefix: 'always',
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
