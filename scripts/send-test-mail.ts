// Sends one test e-mail with the settings in .env.local: `vp run mail:test`.
// Use it after you set MAIL_TRANSPORT and its settings, to see that delivery works
// before you test the form. It sends to CONTACT_TO.

import { MailConfigError, mailTransport } from '../src/lib/mail.ts'

const to = process.env.CONTACT_TO
if (!to) {
  console.error(
    'No test e-mail sent: CONTACT_TO is not set. Add it to .env.local (see .env.example).',
  )
  process.exit(1)
}

try {
  await mailTransport().send({
    to,
    replyTo: to,
    subject: 'Swiss Wall Printing: test e-mail from the website',
    text: `This is a test from \`vp run mail:test\` (MAIL_TRANSPORT=${process.env.MAIL_TRANSPORT || 'outbox'}).\nIf you read this, the form e-mails will arrive too.`,
  })
  console.log(
    `Test e-mail sent to CONTACT_TO with MAIL_TRANSPORT=${process.env.MAIL_TRANSPORT || 'outbox'}.`,
  )
} catch (error) {
  const reason = error instanceof MailConfigError ? error.message : String(error)
  console.error(`No test e-mail sent: ${reason}`)
  process.exit(1)
}
