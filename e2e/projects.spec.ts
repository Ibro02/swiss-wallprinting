import { expect, type Page, test } from '@playwright/test'

// The projects page: every flip card has the same size, a story longer than the card opens
// in a sheet, and the gallery's lightbox moves one photo per swipe (the author, 2026-10-23).

const cardHeights = (page: Page) =>
  page
    .locator('section ol > li article')
    .evaluateAll((cards) => cards.map((card) => Math.round(card.getBoundingClientRect().height)))

test('every project card has the same size, with its story turned or not', async ({ page }) => {
  await page.goto('/it/progetti')
  const heights = await cardHeights(page)
  expect(heights.length).toBeGreaterThan(1)
  expect(new Set(heights).size).toBe(1)

  // Turning a card with a long story does not make it taller.
  const card = page.locator('li', { has: page.locator('#story-sheet-caviezel') })
  await card.locator('.flip-card__face--front label').click()
  await expect(card.locator('.flip-card__toggle')).toBeChecked()
  expect(await cardHeights(page)).toEqual(heights)
})

test('a story longer than the card opens whole in a sheet', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'On a desktop every story fits its card.')
  await page.goto('/it/progetti')
  const card = page.locator('li', { has: page.locator('#story-sheet-caviezel') })
  const more = card.getByRole('button', { name: 'Mostra di più' })
  // Hidden while the card shows its front, and on a story that fits.
  await expect(more).toBeHidden()
  await card.locator('.flip-card__face--front label').click()
  await expect(more).toBeVisible()
  const short = page.locator('li', { has: page.locator('#story-sheet-milly-torte') })
  await short.locator('.flip-card__face--front label').click()
  await expect(short.getByRole('button', { name: 'Mostra di più' })).toBeHidden()

  await more.click()
  const sheet = page.getByRole('dialog', { name: 'Due sedi, una storia' })
  await expect(sheet).toBeVisible()
  await expect(sheet.getByText('storia, tradizione e futuro sulle pareti')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(sheet).toBeHidden()
  await expect(more).toBeFocused()
})

test('the lightbox moves one photo per swipe', async ({ page, context, isMobile }) => {
  test.skip(!isMobile, 'A swipe is a touch gesture.')
  await page.goto('/it/progetti')
  await page.locator('[aria-haspopup="dialog"]').nth(2).click()
  const position = page.locator('dialog p')
  await expect(position).toHaveText(/^3 di \d+$/)

  // A finger: down, moved in steps, lifted.
  const cdp = await context.newCDPSession(page)
  const swipe = async (fromX: number, toX: number) => {
    const y = 420
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: fromX, y }],
    })
    for (let step = 1; step <= 10; step++) {
      const x = fromX + ((toX - fromX) * step) / 10
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y }] })
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  }

  await swipe(340, 60)
  await expect(position).toHaveText(/^4 di \d+$/)
  await swipe(60, 340)
  await expect(position).toHaveText(/^3 di \d+$/)
  // The buttons scroll the same row.
  await page.getByRole('button', { name: 'Foto successiva' }).click()
  await expect(position).toHaveText(/^4 di \d+$/)
})
