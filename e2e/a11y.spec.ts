import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { PAGES } from './pages.ts'

// WCAG 2.2 AA (Development Plan, section 1): axe checks every page, desktop and phone, in the
// light and the dark theme, for the A and AA rules of WCAG 2.0, 2.1, and 2.2. Any violation
// fails. With reduced motion, so no element is caught halfway through a reveal or a fade
// (those states are short, and their end states are what a reader sees); the motion has its
// own tests (home.spec.ts).

for (const colorScheme of ['light', 'dark'] as const) {
  test.describe(`${colorScheme} theme`, () => {
    test.use({ reducedMotion: 'reduce', colorScheme })

    for (const { name, path } of PAGES) {
      test(`${name} has no WCAG 2.2 AA violations`, async ({ page }) => {
        await page.goto(path)
        // The entrance fades (0.4 s with reduced motion) end first: a half-faded text is not
        // what a reader sees, and axe would measure its contrast mid-way.
        await page.evaluate(() =>
          Promise.all(
            document
              .getAnimations()
              .filter((animation) => animation.effect?.getComputedTiming().endTime !== Infinity)
              .map((animation) => animation.finished.catch(() => undefined)),
          ),
        )
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa'])
          .analyze()
        const violations = results.violations.map((violation) => ({
          rule: violation.id,
          impact: violation.impact,
          help: violation.help,
          targets: violation.nodes.slice(0, 5).map((node) => node.target.join(' ')),
        }))
        expect(violations).toEqual([])
      })
    }
  })
}
