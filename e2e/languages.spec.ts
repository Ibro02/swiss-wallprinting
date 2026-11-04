import { expect, test } from '@playwright/test'
import { htmlLangOf } from './pages.ts'

// BHS and the international SEO: BHS is one language at /bhs (Bosnian, Croatian, Serbian; Latin
// script), and every page in every language names itself as canonical and the same hreflang set
// as the sitemap. An old /bs address moves to /bhs. The language never follows the browser or
// the country: every address opens its own language.

/** The <loc> addresses and their hreflang alternates, from /sitemap.xml. */
function parseSitemap(xml: string): { loc: string; alternates: Record<string, string> }[] {
  return [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(([, body = '']) => ({
    loc: /<loc>([^<]+)<\/loc>/.exec(body)?.[1] ?? '',
    alternates: Object.fromEntries(
      [...body.matchAll(/hreflang="([^"]+)"\s+href="([^"]+)"/g)].map(([, tag = '', href = '']) => [
        tag,
        href,
      ]),
    ),
  }))
}

const pathOf = (href: string) => new URL(href).pathname

/** canonical, the hreflang links, <html lang>, og:locale, title, and description of a page's HTML. */
function headOf(html: string) {
  const attr = (tag: string, name: string) =>
    new RegExp(`${name}="([^"]*)"`, 'i').exec(tag)?.[1] ?? ''
  const links = [...html.matchAll(/<link [^>]*>/g)].map(([tag]) => tag)
  const metas = [...html.matchAll(/<meta [^>]*>/g)].map(([tag]) => tag)
  const meta = (key: string) =>
    attr(metas.find((tag) => tag.includes(`"${key}"`)) ?? '', 'content') || undefined
  return {
    lang: /<html[^>]* lang="([^"]+)"/.exec(html)?.[1],
    canonical: attr(links.find((tag) => /rel="canonical"/.test(tag)) ?? '', 'href'),
    alternates: Object.fromEntries(
      links
        .filter((tag) => /rel="alternate"/.test(tag) && /hreflang=/i.test(tag))
        .map((tag) => [attr(tag, 'hreflang'), attr(tag, 'href')]),
    ),
    title: /<title>([^<]*)<\/title>/.exec(html)?.[1],
    description: meta('description'),
    ogLocale: meta('og:locale'),
  }
}

test.describe('addresses and search engines', () => {
  test.skip(({ isMobile }) => isMobile, 'The same HTML on every screen size.')

  test('every page in the sitemap names itself and the same hreflang set as the sitemap', async ({
    request,
  }) => {
    const entries = parseSitemap(await (await request.get('/sitemap.xml')).text())
    // 9 pages × 4 languages, BHS once (no /bs, /hr, /sr copies).
    expect(entries).toHaveLength(36)
    // Per language: every page its own title and description (two languages may share a word,
    // such as "Kontakt").
    const titles = new Set<string>()
    const descriptions = new Set<string>()
    for (const { loc, alternates } of entries) {
      const path = pathOf(loc)
      expect(path).toMatch(/^\/(it|de|en|bhs)(\/|$)/)
      expect(Object.keys(alternates).sort()).toEqual(
        ['bs', 'de', 'en', 'hr', 'it', 'sr', 'x-default'].sort(),
      )
      expect(new Set([alternates.bs, alternates.hr, alternates.sr]).size, path).toBe(1)

      const response = await request.get(path)
      expect(response.status(), path).toBe(200)
      const head = headOf(await response.text())
      expect(head.lang, path).toBe(htmlLangOf(path))
      expect(pathOf(head.canonical), path).toBe(path)
      expect(Object.values(alternates).map(pathOf), path).toContain(path)
      const fromPage = Object.fromEntries(
        Object.entries(head.alternates).map(([tag, href]) => [tag, pathOf(href)]),
      )
      const fromSitemap = Object.fromEntries(
        Object.entries(alternates).map(([tag, href]) => [tag, pathOf(href)]),
      )
      expect(fromPage, path).toEqual(fromSitemap)
      expect(head.title, path).toBeTruthy()
      expect(head.description, path).toBeTruthy()
      const language = path.split('/')[1]
      titles.add(`${language} ${head.title}`)
      descriptions.add(`${language} ${head.description}`)
    }
    expect(titles.size).toBe(entries.length)
    expect(descriptions.size).toBe(entries.length)
  })

  test('BHS speaks bs-Latn, with og:locale bs_BA and no made-up tags', async ({ request }) => {
    const html = await (await request.get('/bhs/o-nama')).text()
    const head = headOf(html)
    expect(head.lang).toBe('bs-Latn')
    expect(head.ogLocale).toBe('bs_BA')
    expect(html).not.toMatch(/hreflang="bhs"/i)
    expect(html).not.toMatch(/lang="bhs"/i)
  })

  test('the responses carry no hreflang Link header', async ({ request }) => {
    for (const path of ['/it', '/bhs/kontakt']) {
      const link = (await request.get(path)).headers().link ?? ''
      expect(link, path).not.toMatch(/hreflang/i)
    }
  })

  test('an old /bs address moves permanently to /bhs', async ({ request }) => {
    for (const [from, to] of [
      ['/bs', '/bhs'],
      ['/bs/kontakt', '/bhs/kontakt'],
      ['/bs/o-nama?x=1', '/bhs/o-nama?x=1'],
    ] as const) {
      const response = await request.get(from, { maxRedirects: 0 })
      expect(response.status(), from).toBe(308)
      const location = new URL(response.headers().location ?? '', 'http://x')
      expect(`${location.pathname}${location.search}`, from).toBe(to)
    }
  })

  test('there is no Bosnian, Croatian, or Serbian copy, and unknown BHS addresses are 404', async ({
    request,
  }) => {
    expect((await request.get('/bhs/ne-postoji')).status()).toBe(404)
    for (const path of ['/hr', '/sr', '/hr/kontakt', '/sr/kontakt']) {
      expect((await request.get(path)).status(), path).toBe(404)
    }
  })

  test('the sitemap and robots.txt are served', async ({ request }) => {
    const sitemap = await request.get('/sitemap.xml')
    expect(sitemap.headers()['content-type']).toContain('xml')
    const robots = await request.get('/robots.txt')
    expect(robots.status()).toBe(200)
    // The test build is not the production site: closed (robots.test.ts checks the open one).
    expect(await robots.text()).toMatch(/User-Agent: \*\s+Disallow: \//i)
  })
})

test('the language menu opens BHS', async ({ page, isMobile }) => {
  test.skip(isMobile, 'On phones the languages are in the menu.')
  await page.goto('/it/chi-siamo')
  await page.locator('header details summary').click()
  const bhs = page.locator('header details a[hreflang="bs-Latn"]')
  // The name, and the code beside it (as "English EN").
  await expect(bhs).toContainText('Bos / Hrv / Srp')
  await expect(bhs.locator('span')).toHaveText('BHS')
  await bhs.click()
  await expect(page).toHaveURL(/\/bhs\/o-nama$/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'bs-Latn')
  await expect(page.locator('header details summary')).toContainText('BHS')
})

test.describe('a browser in Croatian', () => {
  test.use({ locale: 'hr-HR' })

  test('keeps the language of the address: no redirect, no prompt', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/it$/)
    const response = await page.goto('/it/chi-siamo')
    expect(response?.status()).toBe(200)
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL(/\/it\/chi-siamo$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'it')
  })
})
