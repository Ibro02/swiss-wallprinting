import { expect, type Page, test } from '@playwright/test'
import { MIN_FILL_MS } from '../src/features/contact/fields.ts'

// The question form on the contact page: the server's errors, a sent message (to the
// development outbox, see playwright.config.ts), and the same without JavaScript. Desktop
// only: the form is the same on phones, and the server allows 5 messages per address in
// 10 minutes.

test.skip(({ isMobile }) => isMobile, 'The same form; it would only use up the rate limit.')

const form = (page: Page) => page.locator('form').filter({ has: page.locator('[name="message"]') })

async function fillValid(page: Page) {
  const fields = form(page)
  await fields.locator('[name="name"]').fill('Test E2E')
  await fields.locator('[name="email"]').fill('e2e@example.invalid')
  await fields.locator('[name="message"]').fill('Un messaggio di prova dei test automatici.')
  await fields.locator('[name="consent"]').check()
}

test('the server says which fields are missing, and the focus goes to the first', async ({
  page,
}) => {
  await page.goto('/it/contatti')
  // The spam check refuses a form sent faster than a person can type.
  await page.waitForTimeout(MIN_FILL_MS + 200)
  await form(page).locator('[type="submit"]').click()
  const name = form(page).locator('[name="name"]')
  await expect(name).toHaveAttribute('aria-invalid', 'true')
  await expect(name).toBeFocused()
  await expect(form(page).locator('[aria-invalid="true"]')).not.toHaveCount(0)
})

test('a filled form is sent', async ({ page }) => {
  await page.goto('/it/contatti')
  await page.waitForTimeout(MIN_FILL_MS + 200)
  await fillValid(page)
  await form(page).locator('[type="submit"]').click()
  await expect(page.getByRole('status')).toBeVisible()
})

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('the form is sent as a plain HTML form', async ({ page }) => {
    await page.goto('/it/contatti')
    await fillValid(page)
    await form(page).locator('[type="submit"]').click()
    await page.waitForLoadState('load')
    await expect(page.getByRole('status')).toBeVisible()
  })
})
