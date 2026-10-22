// The pages the browser tests visit: every page in Italian (the source language), and the
// home and the contact page in the other languages (a different script, other lengths).

import type { Page } from '@playwright/test'

export const PAGES = [
  { name: 'home', path: '/it' },
  { name: 'about', path: '/it/chi-siamo' },
  { name: 'services', path: '/it/servizi' },
  { name: 'gallery', path: '/it/galleria' },
  { name: 'contact', path: '/it/contatti' },
  { name: 'configurator', path: '/it/prova-la-tua-parete' },
  { name: 'imprint', path: '/it/note-legali' },
  { name: 'privacy', path: '/it/privacy' },
  { name: 'home-de', path: '/de' },
  { name: 'home-en', path: '/en' },
  { name: 'home-bs', path: '/bs' },
  { name: 'contact-bs', path: '/bs/kontakt' },
] as const

/** The marketing pages: no three.js, and the JavaScript budget (Development Plan, section 1). */
export const MARKETING_PAGES = PAGES.filter((page) => page.name !== 'configurator')

/** Console errors and uncaught exceptions of a page, collected while a test runs. */
export function collectErrors(page: Page) {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  return errors
}
