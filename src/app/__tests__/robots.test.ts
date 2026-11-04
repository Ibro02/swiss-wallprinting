import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import robots from '../robots.ts'

describe('robots.txt', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('closes every build that is not the production site', () => {
    vi.stubEnv('SITE_ENV', 'preview')
    expect(robots()).toEqual({ rules: { userAgent: '*', disallow: '/' } })
  })

  it('opens the production site and names the sitemap', () => {
    vi.stubEnv('SITE_ENV', 'production')
    vi.stubEnv('SITE_URL', 'https://www.example.ch')
    expect(robots()).toEqual({
      rules: { userAgent: '*', allow: '/' },
      sitemap: 'https://www.example.ch/sitemap.xml',
    })
  })
})
