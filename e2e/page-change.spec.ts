import { expect, type Page, test } from '@playwright/test'

// The first page load rises in (`data-rise`, 0.8 s); a client-side page change fades the
// new page in at once (`data-page-change`, PageChangeMark), so page changes feel fast
// (the author, 2026-11-01).

const entrance = (page: Page) =>
  page
    .locator('main [data-rise]')
    .first()
    .evaluate((element) => {
      const style = getComputedStyle(element)
      return { name: style.animationName, duration: style.animationDuration }
    })

test('the first page rises in, a page changed to fades in at once', async ({ page }) => {
  test.skip(test.info().project.name !== 'desktop', 'The header links are in the phone menu.')
  await page.goto('/it/chi-siamo')
  expect(await entrance(page)).toEqual({ name: 'rise', duration: '0.8s' })

  await page.locator('header a[href="/it/servizi"]').first().click()
  await expect(page).toHaveURL(/\/it\/servizi$/)
  await expect(page.locator('html')).toHaveAttribute('data-page-change', '')
  expect(await entrance(page)).toEqual({ name: 'fade', duration: '0.15s' })
})
