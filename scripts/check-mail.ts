// Runs before `next build` (package.json "build"), like check-mock.ts. With
// SITE_ENV=production, and on every Vercel build (VERCEL=1, previews too), it stops the build
// when the mail settings are missing or wrong, so a deployed site never shows "not sent" for
// every form message. It also needs the FORM_SECRET of the forms' fill-time token
// (src/lib/form-token.ts): without it, each server instance signs with its own random secret
// and rejects the others' tokens.

import { MIN_FORM_SECRET_LENGTH } from '../src/lib/form-token.ts'
import { isDeployed, MailConfigError, mailConfigFromEnv } from '../src/lib/mail.ts'

if (!isDeployed(process.env)) {
  console.log(
    'Mail check: skipped (SITE_ENV is not "production" and this is not Vercel; the outbox is allowed).',
  )
  process.exit(0)
}

try {
  const config = mailConfigFromEnv(process.env)
  if (!process.env.CONTACT_TO) {
    throw new MailConfigError(
      'CONTACT_TO is not set: the form messages have no recipient. Set it to the client mailbox.',
    )
  }
  if ((process.env.FORM_SECRET ?? '').length < MIN_FORM_SECRET_LENGTH) {
    throw new MailConfigError(
      `FORM_SECRET is missing or shorter than ${MIN_FORM_SECRET_LENGTH} characters: the forms cannot sign their fill-time token. Make one with \`node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"\` and set it in the host settings.`,
    )
  }
  console.log(`Mail check: passed (transport "${config.transport}", form secret set).`)
} catch (error) {
  if (!(error instanceof MailConfigError)) throw error
  console.error(`Build stopped: ${error.message}\nNothing was built or deployed.`)
  process.exit(1)
}
