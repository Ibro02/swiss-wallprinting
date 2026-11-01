import { expect, type Page, test } from '@playwright/test'

// The first page load rises in (`data-rise`, 0.8 s); after a client-side page change
// (`data-page-change`, PageChangeMark) the new page fades in as a whole in 1 s instead
// (the author, 2026-11-01).

const animation = (page: Page, selector: string) =>
  page
    .locator(selector)
    .first()
    .evaluate((element) => {
      const style = getComputedStyle(element)
      return { name: style.animationName, duration: style.animationDuration }
    })

test('the first page rises in, a page changed to fades in as a whole', async ({ page }) => {
  test.skip(test.info().project.name !== 'desktop', 'The header links are in the phone menu.')
  await page.goto('/it/chi-siamo')
  expect(await animation(page, 'main [data-rise]')).toEqual({ name: 'rise', duration: '0.8s' })
  expect((await animation(page, 'main')).name).toBe('none')

  await page.locator('header a[href="/it/servizi"]').first().click()
  await expect(page).toHaveURL(/\/it\/servizi$/)
  await expect(page.locator('html')).toHaveAttribute('data-page-change', '')
  expect(await animation(page, 'main')).toEqual({ name: 'fade', duration: '1s' })
  expect((await animation(page, 'main [data-rise]')).name).toBe('none')
})

// The root has `scroll-behavior: smooth` (in-page anchors). Without `data-scroll-behavior`
// on <html>, Next.js scrolled every new page to the top with it: 0.6–0.8 s of scrolling
// after each page change (the author's Firefox profile, 2026-11-01).
test('a page changed to from far down starts at the top at once', async ({ page }) => {
  await page.goto('/it/servizi')
  await page.evaluate(() => window.scrollTo({ top: 2000, behavior: 'instant' }))
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(1000)

  if (test.info().project.name === 'phone') {
    await page.locator('header button[popovertarget="mobile-menu"]').first().click()
    await page.locator('#mobile-menu a[href="/it/progetti"]').click()
  } else {
    await page.locator('header nav a[href="/it/progetti"]').first().click()
  }
  await expect(page).toHaveURL(/\/it\/progetti$/)
  await expect(page.locator('h1')).toBeVisible()
  // One frame after the new page: a smooth scroll would still be on its way up.
  const top = await page.evaluate(
    () => new Promise<number>((done) => requestAnimationFrame(() => done(window.scrollY))),
  )
  expect(top).toBe(0)
})
