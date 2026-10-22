import { expect, type Page, test } from '@playwright/test'

// The home page's motion: the scroll hero follows the scroll (and shows the finished picture
// with reduced motion); the reviews band moves, pauses under the mouse, and stands still
// with reduced motion.

/** The hero's scroll range and its stage, as PrintOnScroll measures them. */
async function heroRange(page: Page) {
  return page.evaluate(() => {
    const section = document.querySelector<HTMLElement>('.print-scroll')
    const stage = document.querySelector<HTMLElement>('.print-scroll__stage')
    if (!section || !stage) throw new Error('No scroll hero on the page')
    const room = Number.parseFloat(getComputedStyle(section).paddingTop)
    return { distance: section.offsetHeight - room - stage.offsetHeight }
  })
}

const progress = (page: Page) =>
  page.evaluate(() =>
    Number(
      getComputedStyle(document.querySelector('.print-scroll__stage') as Element).getPropertyValue(
        '--p',
      ),
    ),
  )

test('the hero follows the scroll forwards and backwards', async ({ page }) => {
  await page.goto('/it')
  expect(await progress(page)).toBe(0)
  const { distance } = await heroRange(page)

  await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), distance / 2)
  await expect.poll(() => progress(page)).toBeCloseTo(0.5, 1)
  // The canvas draws a frame from the middle of the video.
  await expect
    .poll(() =>
      page.evaluate(() =>
        document.querySelector('.print-scroll__stage')?.hasAttribute('data-done'),
      ),
    )
    .toBe(false)

  await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), distance)
  await expect.poll(() => progress(page)).toBe(1)
  await expect(page.locator('.print-scroll__stage')).toHaveAttribute('data-done', '')

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await expect.poll(() => progress(page)).toBe(0)
})

test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('the hero shows the finished picture in a short section', async ({ page }) => {
    await page.goto('/it')
    const poster = page.locator('.print-scroll__poster')
    await expect
      .poll(() => poster.evaluate((image: HTMLImageElement) => image.currentSrc))
      .toMatch(/0120\.webp$/)
    const heights = await page.evaluate(() => ({
      section: document.querySelector<HTMLElement>('.print-scroll')?.offsetHeight ?? 0,
      screen: window.innerHeight,
    }))
    expect(heights.section).toBeLessThanOrEqual(heights.screen)
    // The call to action is there at once.
    await expect(page.locator('.print-scroll__outro')).toHaveCSS('opacity', '1')
  })

  test('the reviews band stands still', async ({ page }) => {
    await page.goto('/it')
    await expect(page.locator('.marquee')).toHaveCSS('animation-name', 'none')
  })
})

test('the reviews band moves and pauses under the mouse', async ({ page, isMobile }) => {
  await page.goto('/it')
  const band = page.locator('.marquee')
  await band.evaluate((element) => element.scrollIntoView({ block: 'center', behavior: 'instant' }))
  await expect(band).toHaveCSS('animation-name', 'marquee')
  await expect(band).toHaveCSS('animation-play-state', 'running')
  if (!isMobile) {
    // The band never stands still, so not hover(), which waits for a stable element; and its
    // frame, not the moving strip (several screens wide).
    const box = await page.locator('.marquee-band').boundingBox()
    if (!box) throw new Error('The band has no box')
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await expect(band).toHaveCSS('animation-play-state', 'paused')
  }
})

test('the stop control pauses the reviews band, for touch too', async ({ page }) => {
  await page.goto('/it')
  const band = page.locator('.marquee')
  await band.evaluate((element) => element.scrollIntoView({ block: 'center', behavior: 'instant' }))
  const stop = page.getByRole('checkbox', { name: 'Ferma le recensioni' })
  await page.locator('label', { has: stop }).click()
  await expect(stop).toBeChecked()
  // The mouse is away from the band, so only the control pauses it.
  await page.mouse.move(0, 0)
  await expect(band).toHaveCSS('animation-play-state', 'paused')
  await page.locator('label', { has: stop }).click()
  await expect(band).toHaveCSS('animation-play-state', 'running')
})
