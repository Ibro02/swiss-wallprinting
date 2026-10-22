// Browser tests (Playwright): `vp run e2e`, after `vp run build`. They run against the
// production build on port 3001 (started here when it is not running), or against BASE_URL.
// Two projects: a desktop (1440 × 900) and a phone (Pixel 7). The test server writes the
// form e-mails to .mail-outbox/ (MAIL_TRANSPORT=outbox), whatever .env.local says, so a test
// never sends a real e-mail.

import { defineConfig, devices } from '@playwright/test'

const PORT = 3001
const baseURL = process.env.BASE_URL ?? `http://localhost:${PORT}`

export default defineConfig({
  testDir: 'e2e',
  outputDir: 'test-results/output',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    { name: 'phone', use: { ...devices['Pixel 7'] } },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: 'vp run start',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
        env: {
          PORT: String(PORT),
          MAIL_TRANSPORT: 'outbox',
          CONTACT_TO: 'e2e@example.invalid',
        },
      },
})
