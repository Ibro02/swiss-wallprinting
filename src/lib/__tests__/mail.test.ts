import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vite-plus/test'
import {
  type MailAttachment,
  MailConfigError,
  mailConfigFromEnv,
  type MailMessage,
  outboxTransport,
  resendTransport,
  type SmtpFactory,
  smtpTransport,
} from '../mail.ts'

const message: MailMessage = {
  to: 'owner@example.ch',
  replyTo: 'visitor@example.ch',
  subject: 'Nuova domanda dal sito: Anna',
  text: 'Ciao',
}

/** The first bytes of a JPEG file. */
const screenshot: MailAttachment = {
  filename: 'configurazione.jpg',
  contentType: 'image/jpeg',
  content: new Uint8Array([255, 216, 255]),
}

const smtpEnv = {
  MAIL_TRANSPORT: 'smtp',
  SMTP_HOST: 'mail.example.ch',
  SMTP_USER: 'site@example.ch',
  SMTP_PASSWORD: 'secret',
  MAIL_FROM: 'Swiss Wall Printing <site@example.ch>',
}

describe('mailConfigFromEnv', () => {
  it('uses the outbox in development when nothing is set', () => {
    expect(mailConfigFromEnv({})).toEqual({ transport: 'outbox' })
  })

  it('refuses the outbox and a missing transport on the production site', () => {
    expect(() => mailConfigFromEnv({ SITE_ENV: 'production' })).toThrow(MailConfigError)
    expect(() => mailConfigFromEnv({ SITE_ENV: 'production', MAIL_TRANSPORT: 'outbox' })).toThrow(
      'only writes files',
    )
  })

  it('reads SMTP with port 587 and STARTTLS by default, TLS for port 465', () => {
    expect(mailConfigFromEnv(smtpEnv)).toMatchObject({
      transport: 'smtp',
      port: 587,
      secure: false,
    })
    expect(mailConfigFromEnv({ ...smtpEnv, SMTP_PORT: '465' })).toMatchObject({
      port: 465,
      secure: true,
    })
  })

  it('names every missing SMTP setting', () => {
    expect(() => mailConfigFromEnv({ MAIL_TRANSPORT: 'smtp', SMTP_HOST: 'x' })).toThrow(
      'SMTP_USER, SMTP_PASSWORD, MAIL_FROM are not set',
    )
  })

  it('rejects a port that is not a number', () => {
    expect(() => mailConfigFromEnv({ ...smtpEnv, SMTP_PORT: 'abc' })).toThrow('SMTP_PORT is "abc"')
  })

  it('reads Resend and names a missing key', () => {
    expect(
      mailConfigFromEnv({ MAIL_TRANSPORT: 'resend', RESEND_API_KEY: 're_1', MAIL_FROM: 'a@b.ch' }),
    ).toEqual({ transport: 'resend', apiKey: 're_1', from: 'a@b.ch' })
    expect(() => mailConfigFromEnv({ MAIL_TRANSPORT: 'resend', MAIL_FROM: 'a@b.ch' })).toThrow(
      'RESEND_API_KEY is not set',
    )
  })

  it('names the allowed values for an unknown transport', () => {
    expect(() => mailConfigFromEnv({ MAIL_TRANSPORT: 'pigeon' })).toThrow('Use "smtp", "resend"')
  })
})

describe('smtpTransport', () => {
  it('connects with the settings and sends from MAIL_FROM with the visitor as reply-to', async () => {
    const calls: { options: unknown; mails: unknown[] } = { options: undefined, mails: [] }
    const factory: SmtpFactory = (options) => {
      calls.options = options
      return { sendMail: async (mail) => calls.mails.push(mail) }
    }
    const config = mailConfigFromEnv(smtpEnv)
    if (config.transport !== 'smtp') throw new Error('expected SMTP')
    await smtpTransport(config, factory).send(message)

    expect(calls.options).toEqual({
      host: 'mail.example.ch',
      port: 587,
      secure: false,
      auth: { user: 'site@example.ch', pass: 'secret' },
    })
    expect(calls.mails).toEqual([{ ...message, from: 'Swiss Wall Printing <site@example.ch>' }])
  })

  it('passes attachments to nodemailer as buffers', async () => {
    const mails: { attachments?: { filename: string; content: Buffer }[] }[] = []
    const factory: SmtpFactory = () => ({ sendMail: async (mail) => mails.push(mail) })
    const config = mailConfigFromEnv(smtpEnv)
    if (config.transport !== 'smtp') throw new Error('expected SMTP')
    await smtpTransport(config, factory).send({ ...message, attachments: [screenshot] })

    const [attachment] = mails[0]?.attachments ?? []
    expect(attachment?.filename).toBe('configurazione.jpg')
    expect(Buffer.isBuffer(attachment?.content)).toBe(true)
    expect([...(attachment?.content ?? [])]).toEqual([255, 216, 255])
  })
})

describe('outboxTransport', () => {
  it('writes the message as JSON and each attachment as a file', async () => {
    const dir = await mkdtemp(path.join(tmpdir(), 'outbox-'))
    await outboxTransport(dir).send({ ...message, attachments: [screenshot] })
    const files = (await readdir(dir)).sort()
    expect(files).toHaveLength(2)
    const json = files.find((file) => file.endsWith('.json')) ?? ''
    const image = files.find((file) => file.endsWith('configurazione.jpg')) ?? ''
    expect([...(await readFile(path.join(dir, image)))]).toEqual([255, 216, 255])
    const written = JSON.parse(await readFile(path.join(dir, json), 'utf8'))
    expect(written.attachments[0].content).toBe(`file: ${image}`)
    await rm(dir, { recursive: true, force: true })
  })
})

describe('resendTransport', () => {
  const config = { transport: 'resend', apiKey: 're_test', from: 'site@example.ch' } as const

  it('posts the message to the Resend API with the key', async () => {
    const requests: { url: string; init: RequestInit | undefined }[] = []
    const fakeFetch = (async (url: string, init?: RequestInit) => {
      requests.push({ url, init })
      return new Response('{"id":"1"}', { status: 200 })
    }) as typeof fetch
    await resendTransport(config, fakeFetch).send(message)

    expect(requests[0]?.url).toBe('https://api.resend.com/emails')
    expect(requests[0]?.init?.headers).toMatchObject({ Authorization: 'Bearer re_test' })
    expect(JSON.parse(requests[0]?.init?.body as string)).toEqual({
      from: 'site@example.ch',
      to: ['owner@example.ch'],
      reply_to: 'visitor@example.ch',
      subject: message.subject,
      text: 'Ciao',
    })
  })

  it('sends attachments in base64', async () => {
    let body = ''
    const fakeFetch = (async (_url: string, init?: RequestInit) => {
      body = init?.body as string
      return new Response('{"id":"1"}', { status: 200 })
    }) as typeof fetch
    await resendTransport(config, fakeFetch).send({ ...message, attachments: [screenshot] })
    expect(JSON.parse(body).attachments).toEqual([
      { filename: 'configurazione.jpg', content: Buffer.from([255, 216, 255]).toString('base64') },
    ])
  })

  it('fails with the status and the reason when Resend refuses', async () => {
    const fakeFetch = (async () =>
      new Response('domain not verified', { status: 403 })) as unknown as typeof fetch
    await expect(resendTransport(config, fakeFetch).send(message)).rejects.toThrow(
      'HTTP 403): domain not verified',
    )
  })
})
