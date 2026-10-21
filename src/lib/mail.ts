// Sending the form e-mails (Development Plan 4.6, Q6). MAIL_TRANSPORT selects how:
//   outbox  development only: each message is a JSON file in .mail-outbox/
//   smtp    any mailbox (the company mailbox, Gmail with an app password, Infomaniak …)
//   resend  the Resend API (needs a verified sender domain)
// The settings live in the environment only (.env.local, the host's settings): never in git.

import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import nodemailer from 'nodemailer'

export interface MailAttachment {
  filename: string
  contentType: string
  content: Uint8Array
}

export interface MailMessage {
  to: string
  replyTo: string
  subject: string
  text: string
  /** For example the configurator screenshot of a quote request. */
  attachments?: readonly MailAttachment[]
}

export interface MailTransport {
  send(message: MailMessage): Promise<void>
}

export type MailConfig =
  | { transport: 'outbox' }
  | {
      transport: 'smtp'
      from: string
      host: string
      port: number
      secure: boolean
      user: string
      password: string
    }
  | { transport: 'resend'; from: string; apiKey: string }

/** A wrong or missing mail setting. The message says which variable to set. */
export class MailConfigError extends Error {
  override name = 'MailConfigError'
}

type Env = Record<string, string | undefined>

function required(env: Env, transport: string, names: readonly string[]): string[] {
  const missing = names.filter((name) => !env[name])
  if (missing.length > 0) {
    const verb = missing.length === 1 ? 'is' : 'are'
    throw new MailConfigError(
      `MAIL_TRANSPORT is "${transport}", but ${missing.join(', ')} ${verb} not set. ` +
        `Add ${missing.length === 1 ? 'it' : 'them'} to the environment (see .env.example). ` +
        'Until then the form shows "not sent" with the phone number and e-mail address.',
    )
  }
  return names.map((name) => env[name] as string)
}

/** The mail settings from the environment. Throws a MailConfigError that says what to fix. */
export function mailConfigFromEnv(env: Env): MailConfig {
  const production = env.SITE_ENV === 'production'
  const transport = env.MAIL_TRANSPORT || (production ? '' : 'outbox')

  switch (transport) {
    case '':
      throw new MailConfigError(
        'MAIL_TRANSPORT is not set for the production site. Set it to "smtp" or "resend", ' +
          'with the matching settings (see .env.example).',
      )
    case 'outbox':
      if (production) {
        throw new MailConfigError(
          'MAIL_TRANSPORT is "outbox", which only writes files on a developer machine. ' +
            'Use "smtp" or "resend" for the production site.',
        )
      }
      return { transport: 'outbox' }
    case 'smtp': {
      const [host, user, password, from] = required(env, transport, [
        'SMTP_HOST',
        'SMTP_USER',
        'SMTP_PASSWORD',
        'MAIL_FROM',
      ]) as [string, string, string, string]
      const port = Number(env.SMTP_PORT || 587)
      if (!Number.isInteger(port) || port <= 0) {
        throw new MailConfigError(
          `SMTP_PORT is "${env.SMTP_PORT}". Use a port number, usually 587 or 465.`,
        )
      }
      // Port 465 is TLS from the start; 587 upgrades with STARTTLS.
      const secure = env.SMTP_SECURE ? env.SMTP_SECURE === 'true' : port === 465
      return { transport, host, port, secure, user, password, from }
    }
    case 'resend': {
      const [apiKey, from] = required(env, transport, ['RESEND_API_KEY', 'MAIL_FROM']) as [
        string,
        string,
      ]
      return { transport, apiKey, from }
    }
    default:
      throw new MailConfigError(
        `MAIL_TRANSPORT is "${transport}". Use "smtp", "resend", or (development only) "outbox".`,
      )
  }
}

/**
 * Development: each message is a JSON file in .mail-outbox/ (git ignores the folder).
 * Attachments are files next to it, with the same name start.
 */
export function outboxTransport(dir = path.join(process.cwd(), '.mail-outbox')): MailTransport {
  return {
    async send(message) {
      await mkdir(dir, { recursive: true })
      const stamp = new Date().toISOString().replace(/[:.]/g, '-')
      const attachments = []
      for (const attachment of message.attachments ?? []) {
        const name = `${stamp}-${path.basename(attachment.filename)}`
        await writeFile(path.join(dir, name), attachment.content)
        attachments.push({ ...attachment, content: `file: ${name}` })
      }
      const file = path.join(dir, `${stamp}.json`)
      await writeFile(file, `${JSON.stringify({ ...message, attachments }, null, 2)}\n`)
      console.info(`[mail] Outbox: "${message.subject}" written to ${file}`)
    },
  }
}

/** The part of a nodemailer transporter that this site uses (tests pass a fake). */
export interface SmtpSender {
  sendMail(
    mail: Omit<MailMessage, 'attachments'> & {
      from: string
      attachments?: { filename: string; contentType: string; content: Buffer }[]
    },
  ): Promise<unknown>
}

export type SmtpFactory = (options: {
  host: string
  port: number
  secure: boolean
  auth: { user: string; pass: string }
}) => SmtpSender

const nodemailerFactory: SmtpFactory = (options) => nodemailer.createTransport(options)

export function smtpTransport(
  config: Extract<MailConfig, { transport: 'smtp' }>,
  create: SmtpFactory = nodemailerFactory,
): MailTransport {
  const sender = create({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.password },
  })
  return {
    async send({ attachments, ...message }) {
      await sender.sendMail({
        ...message,
        from: config.from,
        attachments: attachments?.map((attachment) => ({
          ...attachment,
          content: Buffer.from(attachment.content),
        })),
      })
    },
  }
}

export function resendTransport(
  config: Extract<MailConfig, { transport: 'resend' }>,
  fetchImpl: typeof fetch = fetch,
): MailTransport {
  return {
    async send(message) {
      const response = await fetchImpl('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: config.from,
          to: [message.to],
          reply_to: message.replyTo,
          subject: message.subject,
          text: message.text,
          attachments: message.attachments?.map((attachment) => ({
            filename: attachment.filename,
            content: Buffer.from(attachment.content).toString('base64'),
          })),
        }),
      })
      if (!response.ok) {
        // Resend's reason (for example an unverified domain) goes to the server log.
        throw new Error(
          `Resend did not accept the e-mail (HTTP ${response.status}): ${await response.text()}`,
        )
      }
    },
  }
}

/** The transport for this deployment, from the environment. */
export function mailTransport(env: Env = process.env): MailTransport {
  const config = mailConfigFromEnv(env)
  switch (config.transport) {
    case 'outbox':
      return outboxTransport()
    case 'smtp':
      return smtpTransport(config)
    case 'resend':
      return resendTransport(config)
  }
}
