// The pages the browser tests visit: every page in Italian (the source language), and the
// home and the contact page in the other languages (a different script, other lengths).
// BHS is at /bhs (languages.ts); languages.spec.ts opens every page in every language.

import type { Page } from '@playwright/test'
import { LANGUAGES, localeOfPrefix } from '../src/i18n/languages.ts'

export const PAGES = [
  { name: 'home', path: '/it' },
  { name: 'about', path: '/it/chi-siamo' },
  { name: 'services', path: '/it/servizi' },
  { name: 'projects', path: '/it/progetti' },
  { name: 'faq', path: '/it/domande-frequenti' },
  { name: 'contact', path: '/it/contatti' },
  { name: 'configurator', path: '/it/prova-la-tua-parete' },
  { name: 'imprint', path: '/it/note-legali' },
  { name: 'privacy', path: '/it/privacy' },
  { name: 'home-de', path: '/de' },
  { name: 'home-en', path: '/en' },
  { name: 'home-bhs', path: '/bhs' },
  { name: 'contact-bhs', path: '/bhs/kontakt' },
] as const

/** The marketing pages: no three.js, and the JavaScript budget (Development Plan, section 1). */
export const MARKETING_PAGES = PAGES.filter((page) => page.name !== 'configurator')

/** The `<html lang>` of a page's address: `/bhs/kontakt` → `bs-Latn`. */
export function htmlLangOf(path: string): string | undefined {
  const locale = localeOfPrefix(path.split('/')[1])
  return locale && LANGUAGES[locale].htmlLang
}

/** Console errors and uncaught exceptions of a page, collected while a test runs. */
export function collectErrors(page: Page) {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  return errors
}
