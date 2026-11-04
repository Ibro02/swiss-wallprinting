import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vite-plus/test'
import { missingPageLocale, renamedPrefixPath } from '../known-paths.ts'
import { LANGUAGES } from '../languages.ts'
import { routing } from '../routing.ts'

describe('missingPageLocale', () => {
  it.each([
    '/it',
    '/it/',
    '/de/ueber-uns',
    '/en/try-your-wall',
    '/bhs',
    '/bhs/isprobaj-zid',
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
    expect(missingPageLocale('/bhs/x.html')).toBe('bs')
    expect(missingPageLocale('/bhs/o-nama/x')).toBe('bs')
  })

  it('leaves URLs without a locale prefix to next-intl', () => {
    expect(missingPageLocale('/')).toBeUndefined()
    expect(missingPageLocale('/chi-siamo')).toBeUndefined()
    expect(missingPageLocale('/fr/about')).toBeUndefined()
  })

  it('does not take the internal BHS name for a prefix (the proxy redirects it first)', () => {
    expect(missingPageLocale('/bs/missing')).toBeUndefined()
  })
})

describe('renamedPrefixPath', () => {
  it('moves the old BHS addresses from /bs to /bhs, with the rest of the path', () => {
    expect(renamedPrefixPath('/bs')).toBe('/bhs')
    expect(renamedPrefixPath('/bs/o-nama')).toBe('/bhs/o-nama')
    expect(renamedPrefixPath('/bs/missing/x.html')).toBe('/bhs/missing/x.html')
  })

  it('leaves every other address alone', () => {
    for (const path of ['/', '/bhs', '/bhs/kontakt', '/it/contatti', '/bsx', '/de/bs']) {
      expect(renamedPrefixPath(path), path).toBeUndefined()
    }
  })
})

describe('proxy matcher', () => {
  // Next.js reads the matcher statically, so it is a literal in proxy.ts.
  // The test reads the file as text: importing it would load next-intl's middleware.
  it('lists every address prefix, and the internal names that the proxy redirects', () => {
    const source = readFileSync(path.resolve(import.meta.dirname, '../../proxy.ts'), 'utf8')
    const segments = source.match(/'\/\(([a-z|]+)\)\/:path\*'/)?.[1]?.split('|')
    const expected = routing.locales.flatMap((locale) => {
      const prefix = LANGUAGES[locale].prefix.slice(1)
      return prefix === locale ? [prefix] : [prefix, locale]
    })
    expect(segments?.sort()).toEqual(expected.sort())
  })
})
