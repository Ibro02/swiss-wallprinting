import type { Pathname } from './routing.ts'

/** Every page of the site: its message key (Pages.<key>) and its internal path. */
export const PAGES = {
  home: '/',
  about: '/about',
  services: '/services',
  gallery: '/gallery',
  contact: '/contact',
  tryYourWall: '/try-your-wall',
  imprint: '/imprint',
  privacy: '/privacy',
} as const satisfies Record<string, Pathname>

export type PageKey = keyof typeof PAGES

/** Main navigation, in order. The configurator has its own button. */
export const NAV_PAGES = [
  'home',
  'about',
  'services',
  'gallery',
  'contact',
] as const satisfies readonly PageKey[]

export const LEGAL_PAGES = ['imprint', 'privacy'] as const satisfies readonly PageKey[]
