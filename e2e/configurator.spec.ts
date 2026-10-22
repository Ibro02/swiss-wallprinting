import { expect, type Page, test } from '@playwright/test'

// The configurator without 3D (the 3D view loads only when a person asks for it): a new print
// size changes the price and the share link; phones show one part at a time in tabs; the
// whole panel works with the keyboard; the quote dialog opens.

const PATH = '/it/prova-la-tua-parete'

const price = (page: Page) => page.locator('#configurator-price')

async function setPrintWidth(page: Page, metres: string) {
  const width = page.locator('#configurator-print').getByLabel('Larghezza')
  await width.fill(metres)
  await width.press('Enter')
}

test('a new print size changes the price and the share link', async ({ page, isMobile }) => {
  await page.goto(PATH)
  if (isMobile) await page.getByRole('button', { name: 'Stampa' }).click()
  const before = await price(page).textContent()
  await setPrintWidth(page, '2')
  await expect(price(page)).not.toHaveText(before ?? '')
  // The address is a share link a moment after the change (ShareLinkSync).
  await expect(page).toHaveURL(/[?&]print=2x/)
})

test('a share link opens the same configuration', async ({ page, isMobile }) => {
  await page.goto(`${PATH}?room=6x4x3&wall=e&image=lake&print=2x1&pos=0x0`)
  if (isMobile) await page.getByRole('button', { name: 'Stampa' }).click()
  await expect(page.locator('#configurator-print').getByLabel('Larghezza')).toHaveValue('2,00')
})

test('phones show one part at a time, chosen with the tabs', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Desktops show all five sections.')
  await page.goto(PATH)
  const settings = page.locator('#configurator-settings')
  await expect(page.locator('#configurator-image')).toBeVisible()
  await expect(page.locator('#configurator-room')).toBeHidden()

  await page.getByRole('button', { name: 'Stanza' }).click()
  await expect(page.locator('#configurator-room')).toBeVisible()
  await expect(page.locator('#configurator-image')).toBeHidden()
  await expect(page.getByRole('button', { name: 'Stanza' })).toHaveAttribute('aria-pressed', 'true')

  await page.getByRole('button', { name: 'Posizione' }).click()
  await expect(page.locator('#configurator-print').getByLabel('Dal bordo sinistro')).toBeVisible()
  await expect(page.locator('#configurator-print').getByLabel('Larghezza')).toBeHidden()

  // No tab needs to scroll in the tool panel.
  for (const tab of ['Immagine', 'Parete', 'Stanza', 'Stampa', 'Posizione', 'Dove']) {
    await page.getByRole('button', { name: tab, exact: true }).click()
    const overflow = await settings.evaluate(
      (element) => element.scrollHeight - element.clientHeight,
    )
    expect(overflow, `${tab} scrolls`).toBeLessThanOrEqual(1)
  }
})

test('the whole panel works with the keyboard', async ({ page, isMobile }) => {
  test.skip(isMobile, 'The keyboard path on phones goes through the tabs.')
  await page.goto(PATH)
  // From the first preset, Tab reaches every section and then the quote button: no trap,
  // and nothing needs a pointer in 3D.
  await page.locator('#configurator-image input[type="radio"]').first().focus()
  const reached = new Set<string>()
  for (let step = 0; step < 80; step++) {
    await page.keyboard.press('Tab')
    const where = await page.evaluate(() => {
      const element = document.activeElement
      const section = element?.closest('section[id^="configurator-"]')
      if (section) return section.id
      return element?.getAttribute('aria-haspopup') === 'dialog' ? 'quote' : ''
    })
    if (where) reached.add(where)
    if (where === 'quote') break
  }
  expect([...reached]).toEqual(
    expect.arrayContaining([
      'configurator-image',
      'configurator-wall',
      'configurator-room',
      'configurator-print',
      'configurator-environment',
      'quote',
    ]),
  )
})

test('the quote dialog opens and closes', async ({ page, isMobile }) => {
  await page.goto(PATH)
  await page
    .getByRole('button', { name: isMobile ? 'Preventivo' : 'Richiedi un preventivo esatto' })
    .click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
})
