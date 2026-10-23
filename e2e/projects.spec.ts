import { expect, type Page, test } from '@playwright/test'

// The projects page: every flip card has the same size, a story longer than the card opens
// whole (a sheet on phones, the photo beside the story on wider screens; the page under it
// does not scroll), and the gallery's
// lightbox moves one photo per swipe on phones and shows one photo, without a row to
// scroll, on a desktop (the author, 2026-10-23).

const cardHeights = (page: Page) =>
  page
    .locator('section ol > li article')
    .evaluateAll((cards) => cards.map((card) => Math.round(card.getBoundingClientRect().height)))

/** A project's card, by the id of its turn checkbox. */
const projectCard = (page: Page, id: string) =>
  page.locator('li', { has: page.locator(`#story-${id}`) })

test('every project card has the same size, with its story turned or not', async ({ page }) => {
  await page.goto('/it/progetti')
  const heights = await cardHeights(page)
  expect(heights.length).toBeGreaterThan(1)
  expect(new Set(heights).size).toBe(1)

  // Turning a card with a long story does not make it taller.
  const card = projectCard(page, 'caviezel')
  await card.locator('.flip-card__face--front label').click()
  await expect(card.locator('.flip-card__toggle')).toBeChecked()
  expect(await cardHeights(page)).toEqual(heights)
})

test('a card is as wide as its column, whatever is inside it', async ({ page }) => {
  await page.goto('/it/progetti')
  const widths = () =>
    page.evaluate(() => ({
      page: document.documentElement.scrollWidth,
      screen: document.documentElement.clientWidth,
      cards: [
        ...new Set(
          [...document.querySelectorAll('section ol > li')].map((li) =>
            Math.round(li.getBoundingClientRect().width),
          ),
        ),
      ],
    }))
  const before = await widths()
  expect(before.page).toBe(before.screen)
  // On an iPhone a growing photo took its width from its height (4:3 of the card's height),
  // and every card grew past the screen. Wide content in one card stands in for that.
  await page
    .locator('section ol > li img')
    .first()
    .evaluate((photo) => {
      const box = photo.parentElement
      if (box) box.style.minWidth = '1000px'
    })
  expect(await widths()).toEqual(before)
})

test('a story longer than the card opens whole', async ({ page, isMobile }) => {
  // On a 1280 px desktop every Italian story fits its card; at 1024 px Caviezel's does not.
  if (!isMobile) await page.setViewportSize({ width: 1024, height: 768 })
  await page.goto('/it/progetti')
  const card = projectCard(page, 'caviezel')
  const more = card.getByRole('button', { name: 'Mostra di più' })
  // Hidden while the card shows its front, and on a story that fits.
  await expect(more).toBeHidden()
  await card.locator('.flip-card__face--front label').click()
  await expect(more).toBeVisible()
  const short = projectCard(page, 'milly-torte')
  await short.locator('.flip-card__face--front label').click()
  await expect(short.getByRole('button', { name: 'Mostra di più' })).toBeHidden()

  await more.click()
  const sheet = page.getByRole('dialog', { name: 'Due sedi, una storia' })
  await expect(sheet).toBeVisible()
  await expect(sheet.getByText('storia, tradizione e futuro sulle pareti')).toBeVisible()
  // The photo beside the story on a wider screen; a phone's sheet is the text alone.
  await expect(sheet.locator('img')).toBeVisible({ visible: !isMobile })
  await page.keyboard.press('Escape')
  await expect(sheet).toBeHidden()
  await expect(more).toBeFocused()
})

test('the page under an open story does not scroll', async ({ page, context, isMobile }) => {
  if (!isMobile) await page.setViewportSize({ width: 1024, height: 768 })
  await page.goto('/it/progetti')
  const card = projectCard(page, 'caviezel')
  await card.locator('.flip-card__face--front label').click()
  await card.getByRole('button', { name: 'Mostra di più' }).click()
  const sheet = page.getByRole('dialog', { name: 'Due sedi, una storia' })
  await expect(sheet).toBeVisible()
  const scrollY = () => page.evaluate(() => Math.round(window.scrollY))
  const top = await scrollY()

  // A finger drags up over the backdrop and over the sheet; a mouse wheel turns over the
  // backdrop.
  const cdp = await context.newCDPSession(page)
  const drag = async (x: number, fromY: number) => {
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x, y: fromY }],
    })
    for (let step = 1; step <= 10; step++) {
      const y = fromY - step * 15
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y }] })
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  }
  const scrollPage = async () => {
    if (isMobile) await drag(200, 180)
    else {
      await page.mouse.move(40, 400)
      await page.mouse.wheel(0, 600)
    }
  }
  await scrollPage()
  if (isMobile) {
    const box = await sheet.boundingBox()
    if (!box) throw new Error('The sheet has no box')
    await drag(200, box.y + box.height - 20)
  }
  await page.waitForTimeout(500)
  expect(await scrollY()).toBe(top)

  // Closed, the page scrolls again.
  await page.keyboard.press('Escape')
  await expect(sheet).toBeHidden()
  await scrollPage()
  await expect.poll(scrollY).not.toBe(top)
})

test('the lightbox shows one photo at a time on a desktop', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Phones swipe a row of photos (below).')
  await page.goto('/it/progetti')
  await page.locator('[aria-haspopup="dialog"]').nth(2).click()
  const dialog = page.locator('dialog')
  const position = dialog.locator('p')
  await expect(position).toHaveText(/^3 di \d+$/)
  const shown = dialog.locator('figure:not([aria-hidden="true"])')
  await expect(shown).toHaveCount(1)
  await expect(shown.locator('img')).toBeVisible()
  // Nothing to scroll, so no scrollbar in any browser.
  const row = dialog.locator('.lightbox')
  expect(await row.evaluate((element) => element.scrollWidth - element.clientWidth)).toBe(0)

  await page.getByRole('button', { name: 'Foto successiva' }).click()
  await expect(position).toHaveText(/^4 di \d+$/)
  await page.keyboard.press('ArrowLeft')
  await expect(position).toHaveText(/^3 di \d+$/)
  await expect(shown.locator('img')).toBeVisible()
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
