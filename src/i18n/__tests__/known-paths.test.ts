import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vite-plus/test'
import { missingPageLocale } from '../known-paths.ts'
import { routing } from '../routing.ts'

describe('missingPageLocale', () => {
  it.each([
    '/it',
    '/it/',
    '/de/ueber-uns',
    '/en/try-your-wall',
    '/bs/isprobaj-zid',
    '/de/datenschutz',
  ])('knows the page %s', (path) => {
    expect(missingPageLocale(path)).toBeUndefined()
  })

  it('knows internal and other-locale paths, because next-intl redirects them', () => {
    expect(missingPageLocale('/de/about')).toBeUndefined()
    expect(missingPageLocale('/en/ueber-uns')).toBeUndefined()
  })

  it('returns the locale of a localized URL without a page', () => {
    expect(missingPageLocale('/it/missing')).toBe('it')
    expect(missingPageLocale('/de/gibt/es/nicht')).toBe('de')
    expect(missingPageLocale('/en/about/extra')).toBe('en')
    expect(missingPageLocale('/bs/x.html')).toBe('bs')
  })

  it('leaves URLs without a locale prefix to next-intl', () => {
    expect(missingPageLocale('/')).toBeUndefined()
    expect(missingPageLocale('/chi-siamo')).toBeUndefined()
    expect(missingPageLocale('/fr/about')).toBeUndefined()
  })
})

describe('proxy matcher', () => {
  // Next.js reads the matcher statically, so it is a literal in proxy.ts.
  // The test reads the file as text: importing it would load next-intl's middleware.
  it('lists the same locales as the routing', () => {
    const source = readFileSync(path.resolve(import.meta.dirname, '../../proxy.ts'), 'utf8')
    const locales = source.match(/'\/\(([a-z|]+)\)\/:path\*'/)?.[1]?.split('|')
    expect(locales?.sort()).toEqual([...routing.locales].sort())
  })
})
