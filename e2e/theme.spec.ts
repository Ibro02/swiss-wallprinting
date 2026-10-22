import { expect, type Page, test } from '@playwright/test'

// The dark theme (globals.css, "Dark theme"; ThemeToggle; THEME_SCRIPT): it follows the
// device until the visitor chooses, the choice survives a reload, and a saved choice is on
// <html> before React hydrates (the head script), so the page never shows the other theme.

const LIGHT_PAGE = 'rgb(255, 255, 255)'
const DARK_PAGE = 'rgb(38, 38, 36)'

const pageColour = (page: Page) =>
  page.evaluate(() => getComputedStyle(document.body).backgroundColor)

test.describe('device in light mode', () => {
  test.use({ colorScheme: 'light' })

  test('the header switch turns the dark theme on, and it stays after a reload', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'Phones have the switch in the menu (next test).')
    await page.goto('/it')
    expect(await pageColour(page)).toBe(LIGHT_PAGE)
    const toggle = page.locator('header').getByRole('switch', { name: 'Tema scuro' }).first()
    await expect(toggle).toHaveAttribute('aria-checked', 'false')
    await toggle.click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await expect(toggle).toHaveAttribute('aria-checked', 'true')
    expect(await pageColour(page)).toBe(DARK_PAGE)

    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    expect(await pageColour(page)).toBe(DARK_PAGE)
  })

  test('the phone menu has the switch too', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Desktops have the switch in the header pill.')
    await page.goto('/it')
    await page.locator('header button[popovertarget]').first().click()
    const row = page.locator('[popover]:popover-open').getByRole('switch', { name: 'Tema scuro' })
    await row.click()
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await expect(row).toHaveAttribute('aria-checked', 'true')
  })
})

test.describe('device in dark mode', () => {
  test.use({ colorScheme: 'dark' })

  test('the page is dark from the start, without a choice', async ({ page }) => {
    await page.goto('/it')
    await expect(page.locator('html')).not.toHaveAttribute('data-theme', /.+/)
    expect(await pageColour(page)).toBe(DARK_PAGE)
  })

  test('a saved light choice wins, and is set before hydration', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('theme', 'light')
      // What <html> says when the body starts to parse: before any React code ran.
      document.addEventListener(
        'readystatechange',
        () => {
          if (document.readyState === 'interactive') {
            ;(window as unknown as { themeAtParse?: string }).themeAtParse =
              document.documentElement.dataset.theme
          }
        },
        { once: true },
      )
    })
    await page.goto('/it')
    expect(
      await page.evaluate(() => (window as unknown as { themeAtParse?: string }).themeAtParse),
    ).toBe('light')
    expect(await pageColour(page)).toBe(LIGHT_PAGE)
  })
})
