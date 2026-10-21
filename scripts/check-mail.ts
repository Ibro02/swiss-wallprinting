// Runs before `next build` (package.json "build"), like check-mock.ts. With
// SITE_ENV=production it stops the build when the mail settings are missing or wrong,
// so the launch site never shows "not sent" for every form message.

import { MailConfigError, mailConfigFromEnv } from '../src/lib/mail.ts'

if (process.env.SITE_ENV !== 'production') {
  console.log('Mail check: skipped (SITE_ENV is not "production"; the outbox is allowed).')
  process.exit(0)
}

try {
  const config = mailConfigFromEnv(process.env)
  if (!process.env.CONTACT_TO) {
    throw new MailConfigError(
      'CONTACT_TO is not set: the form messages have no recipient. Set it to the client mailbox.',
    )
  }
  console.log(`Mail check: passed (transport "${config.transport}").`)
} catch (error) {
  if (!(error instanceof MailConfigError)) throw error
  console.error(`Production build stopped: ${error.message}\nNothing was built or deployed.`)
  process.exit(1)
}
