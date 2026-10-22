import { expect, test } from '@playwright/test'
import { collectErrors, PAGES } from './pages.ts'

// Every page opens with status 200, one h1, the right language, no horizontal scroll, and
// no error in the console; the global navigation works on desktops and phones.

for (const { name, path } of PAGES) {
  test(`${name} opens with one h1 and no errors`, async ({ page }) => {
    const errors = collectErrors(page)
    const response = await page.goto(path)
    expect(response?.status()).toBe(200)
    await expect(page.locator('html')).toHaveAttribute('lang', path.split('/')[1] ?? '')
    await expect(page.locator('h1')).toHaveCount(1)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow, 'horizontal scroll').toBeLessThanOrEqual(0)
    expect(errors).toEqual([])
  })
}

test('an unknown URL shows the 404 page with status 404', async ({ page }) => {
  const response = await page.goto('/it/questa-pagina-non-esiste')
  expect(response?.status()).toBe(404)
  await expect(page.locator('h1')).toHaveCount(1)
})

test('the language menu keeps the page', async ({ page, isMobile }) => {
  test.skip(isMobile, 'On phones the languages are in the menu (next test).')
  await page.goto('/it/chi-siamo')
  await page.locator('header details summary').click()
  await page.locator('header details a[hreflang="de"]').click()
  await expect(page).toHaveURL(/\/de\/ueber-uns$/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'de')
})

test('the phone menu opens, navigates, and closes', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Desktops show the links in the header.')
  await page.goto('/it')
  await page.locator('header button[popovertarget]').first().click()
  const menu = page.locator('[popover]:popover-open')
  await expect(menu).toBeVisible()
  await menu.locator('a[href="/it/servizi"]').click()
  await expect(page).toHaveURL(/\/it\/servizi$/)
  await expect(page.locator('[popover]:popover-open')).toHaveCount(0)
})
