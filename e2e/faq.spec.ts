import { expect, test } from '@playwright/test'

// The FAQ: each question is a lift card. A mouse lifts it on hover; on a phone, where a tap
// leaves no hover, the open question keeps that look (the author, 2026-10-24).

test('on a phone the open question keeps the lift look', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'A mouse shows the look on hover.')
  await page.goto('/it/domande-frequenti')
  // The questions, not the header's language switcher (also a <details>).
  const questions = page.locator('details[name="faq"]')
  const [first, second] = [questions.nth(0), questions.nth(1)]
  await first.locator('summary').click()
  await expect(first).toHaveJSProperty('open', true)
  await expect(first).toHaveCSS('border-color', 'rgba(197, 210, 13, 0.32)')
  await expect(first).toHaveCSS('translate', '0px -6px')
  await expect(first).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  await expect(second).toHaveCSS('translate', 'none')

  // Opening another closes the first (an accordion), and the look moves with it.
  await second.locator('summary').click()
  await expect(second).toHaveCSS('translate', '0px -6px')
  await expect(first).toHaveCSS('translate', 'none')
})
