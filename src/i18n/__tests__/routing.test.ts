import { describe, expect, it } from 'vite-plus/test'
import bs from '../../../messages/bs.json'
import de from '../../../messages/de.json'
import en from '../../../messages/en.json'
import itMessages from '../../../messages/it.json'
import { routing } from '../routing.ts'

const messages = { it: itMessages, de, en, bs }

/** Every leaf key of a message tree, as dotted paths. */
function keysOf(tree: object, prefix = ''): string[] {
  return Object.entries(tree).flatMap(([key, value]) =>
    typeof value === 'object' && value !== null
      ? keysOf(value as object, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  )
}

describe('routing', () => {
  it('uses Italian as the default locale', () => {
    expect(routing.defaultLocale).toBe('it')
  })

  it('has a localized path for every locale on every page', () => {
    for (const [page, paths] of Object.entries(routing.pathnames)) {
      if (typeof paths === 'string') continue
      expect(Object.keys(paths).sort(), page).toEqual([...routing.locales].sort())
    }
  })

  it('never gives two pages the same path in one locale', () => {
    for (const locale of routing.locales) {
      const paths = Object.values(routing.pathnames).map((p) =>
        typeof p === 'string' ? p : p[locale],
      )
      expect(new Set(paths).size, locale).toBe(paths.length)
    }
  })
})

describe('messages', () => {
  const source = keysOf(itMessages).sort()

  it('has a message file for every locale', () => {
    expect(Object.keys(messages).sort()).toEqual([...routing.locales].sort())
  })

  it.each(routing.locales)('%s has the same keys as the Italian source', (locale) => {
    expect(keysOf(messages[locale]).sort()).toEqual(source)
  })

  it('uses Swiss German spelling (ss, never ß)', () => {
    expect(JSON.stringify(de)).not.toContain('ß')
  })
})
