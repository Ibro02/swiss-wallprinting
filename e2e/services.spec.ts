import { expect, test } from '@playwright/test'

// The services page's "For whom" (the author, 2026-10-23): the client's two groups, each with
// before/after cards of his own walls. The mouse moves the split, and a card opens its
// project on the Projects page.

test('shows the two groups with the walls of the client, not example photos', async ({ page }) => {
  await page.goto('/it/servizi')
  const section = page.locator('section[aria-labelledby="audiences-title"]')
  await expect(section.getByRole('heading', { level: 3 })).toHaveText([
    'Clienti aziendali',
    'Clienti privati',
  ])
  const photos = section.getByRole('slider').locator('img')
  await expect(section.getByRole('slider')).toHaveCount(5)
  for (const src of await photos.evaluateAll((images) =>
    images.map((image) => image.getAttribute('src') ?? ''),
  )) {
    expect(src).not.toContain('/mock/')
  }
})

test('the split follows the mouse and goes back to the print', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Phones drag the split; the mouse is a desktop feature.')
  await page.goto('/it/servizi')
  const card = page.getByRole('slider', { name: 'Caviezel: prima e dopo' })
  await card.scrollIntoViewIfNeeded()
  const box = await card.boundingBox()
  if (!box) throw new Error('The Caviezel card has no box.')
  await page.mouse.move(box.x + box.width * 0.6, box.y + box.height / 2)
  await expect(card).toHaveAttribute('aria-valuenow', '60')
  await page.mouse.move(box.x + box.width / 2, box.y + box.height + 200)
  await expect(card).toHaveAttribute('aria-valuenow', '0')
})

test('a card opens its project, clear of the header', async ({ page }) => {
  await page.goto('/it/servizi')
  await page.getByRole('link', { name: 'Vedi il progetto: Caviezel' }).click()
  await expect(page).toHaveURL(/\/it\/progetti#caviezel$/)
  const card = page.locator('#caviezel')
  await expect(card).toBeInViewport()
  // The pill covers about the top 100 px of the screen.
  await expect
    .poll(() => card.evaluate((li) => li.getBoundingClientRect().top))
    .toBeGreaterThan(100)
})
