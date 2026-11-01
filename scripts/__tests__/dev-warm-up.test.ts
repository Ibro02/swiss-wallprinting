import { describe, expect, it } from 'vite-plus/test'
import { localizedPath } from '@/features/seo/seo.ts'
import { PAGES, type PageKey } from '@/i18n/pages.ts'
import { devPort, warmUpPaths } from '../lib/dev-warm-up.ts'

describe('warmUpPaths', () => {
  it('lists every page once, at its localized Italian address', () => {
    const pages = Object.keys(PAGES) as PageKey[]
    expect(warmUpPaths()).toEqual(pages.map((page) => localizedPath('it', page)))
  })

  it('starts with the home page and uses the localized paths', () => {
    expect(warmUpPaths()[0]).toBe('/it')
    expect(warmUpPaths()).toContain('/it/servizi')
    expect(warmUpPaths('de')).toContain('/de/leistungen')
  })
})

describe('devPort', () => {
  it('reads -p and --port, with a space or an equals sign', () => {
    expect(devPort(['-p', '3002'], {})).toBe(3002)
    expect(devPort(['--turbopack', '--port', '3003'], {})).toBe(3003)
    expect(devPort(['--port=3004'], {})).toBe(3004)
  })

  it('falls back to PORT, then 3000', () => {
    expect(devPort([], { PORT: '4000' })).toBe(4000)
    expect(devPort([], {})).toBe(3000)
    expect(devPort(['-p'], { PORT: 'x' })).toBe(3000)
  })
})
