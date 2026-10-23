import { expect, type Page, test } from '@playwright/test'

// The home page's motion: the scroll hero follows the scroll (and shows the finished picture
// with reduced motion); the reviews band moves, pauses under the mouse, follows a finger on
// touch screens, and stands still with reduced motion.

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

/** Where the reviews strip stands: its horizontal offset in px (CSS animation or script). */
const stripOffset = (page: Page) =>
  page
    .locator('.marquee')
    .evaluate((strip) => new DOMMatrixReadOnly(getComputedStyle(strip).transform).m41)

/** How far the reviews strip moves in `ms`, in px (negative: to the left). */
async function stripMoves(page: Page, ms = 400) {
  const before = await stripOffset(page)
  await page.waitForTimeout(ms)
  return (await stripOffset(page)) - before
}

/** The reviews band in the middle of the screen, and its box. */
async function showBand(page: Page) {
  await page.goto('/it')
  const band = page.locator('.marquee-band')
  await band.evaluate((element) => element.scrollIntoView({ block: 'center', behavior: 'instant' }))
  const box = await band.boundingBox()
  if (!box) throw new Error('The band has no box')
  return { band, box }
}

test('the reviews band moves and pauses under the mouse', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Touch screens hold the band with a finger (below).')
  const { box } = await showBand(page)
  await expect(page.locator('.marquee')).toHaveCSS('animation-name', 'marquee')
  await expect.poll(() => stripMoves(page)).toBeLessThan(0)
  // The band never stands still, so not hover(), which waits for a stable element; and its
  // frame, not the moving strip (several screens wide).
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await expect.poll(() => stripMoves(page)).toBe(0)
})

test('a finger holds, drags, and lets go of the reviews band', async ({
  page,
  context,
  isMobile,
}) => {
  test.skip(!isMobile, 'A touch gesture; a mouse pauses the band instead (above).')
  const { band, box } = await showBand(page)
  // On touch screens a script runs the band (MarqueeSwipe), and it moves.
  await expect(band).toHaveAttribute('data-swipe', '')
  await expect.poll(() => stripMoves(page)).toBeLessThan(0)

  const cdp = await context.newCDPSession(page)
  const x = box.x + box.width / 2
  const finger = (type: 'touchStart' | 'touchMove' | 'touchEnd', at = x) =>
    cdp.send('Input.dispatchTouchEvent', {
      type,
      touchPoints: type === 'touchEnd' ? [] : [{ x: at, y: box.y + box.height / 2 }],
    })

  // A finger on the band holds it still.
  await finger('touchStart')
  await expect.poll(() => stripMoves(page)).toBe(0)
  // A drag moves it with the finger, 80 px to the right (the strip is the list twice, so the
  // offset may wrap by one list).
  const held = await stripOffset(page)
  const list = await page
    .locator('.marquee > ul')
    .first()
    .evaluate((element) => element.getBoundingClientRect().width)
  for (let step = 1; step <= 10; step++) await finger('touchMove', x + step * 8)
  await expect.poll(async () => ((await stripOffset(page)) - held + list) % list).toBeCloseTo(80, 0)
  expect(await stripMoves(page)).toBe(0)
  // Let go: it runs to the left again.
  await finger('touchEnd')
  await expect.poll(() => stripMoves(page)).toBeLessThan(0)
})

test('the stop control stops the reviews band, for touch too', async ({ page }) => {
  await showBand(page)
  const stop = page.getByRole('checkbox', { name: 'Ferma le recensioni' })
  await page.locator('label', { has: stop }).click()
  await expect(stop).toBeChecked()
  // The mouse is away from the band, so only the control stops it.
  await page.mouse.move(0, 0)
  await expect.poll(() => stripMoves(page)).toBe(0)
  await page.locator('label', { has: stop }).click()
  await expect.poll(() => stripMoves(page)).toBeLessThan(0)
})
