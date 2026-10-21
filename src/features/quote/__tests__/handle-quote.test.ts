import { describe, expect, it } from 'vite-plus/test'
import type { MailMessage, MailTransport } from '@/lib/mail.ts'
import { MAX_SCREENSHOT_CHARS, QUOTE_HIDDEN } from '../fields.ts'
import { handleQuote, type QuoteDeps } from '../handle-quote.ts'
import { parseScreenshot } from '../quote.ts'

const NOW = 1_800_000_000_000
const JPEG = `data:image/jpeg;base64,${Buffer.from([0xff, 0xd8, 0xff, 0xe0]).toString('base64')}`

function form(fields: Record<string, string>): FormData {
  const data = new FormData()
  for (const [name, value] of Object.entries(fields)) data.set(name, value)
  return data
}

const valid = {
  name: 'Anna Rossi',
  email: 'anna@example.ch',
  phone: '+41 79 000 00 00',
  place: 'Bellinzona',
  notes: 'Parete del soggiorno',
  consent: 'on',
  startedAt: String(NOW - 60_000),
  [QUOTE_HIDDEN.config]: 'room=5x4x2.7&wall=n&image=lake&print=3x1.5&pos=0x0',
  [QUOTE_HIDDEN.screenshot]: JPEG,
}

function deps(overrides: Partial<QuoteDeps> = {}) {
  const sent: MailMessage[] = []
  const errors: string[] = []
  const transport: MailTransport = { send: async (mail) => void sent.push(mail) }
  const value: QuoteDeps = {
    now: NOW,
    allow: () => true,
    to: 'owner@example.ch',
    transport: () => transport,
    presets: [{ id: 'lake', title: 'Lago e montagne', aspect: 2 }],
    locale: 'de',
    configuratorUrl: 'https://www.example.ch/de/wand-testen',
    machineMaxHeight: 3.8,
    rates: {
      perSquareMetre: { interior: 100, exterior: 150 },
      minimum: 300,
      fixed: 100,
      vatRate: 0.081,
    },
    ratesAreExamples: true,
    logError: (message) => void errors.push(message),
    ...overrides,
  }
  return { value, sent, errors }
}

describe('handleQuote', () => {
  it('sends the request with the configuration, the server price, and the screenshot', async () => {
    const { value, sent } = deps()
    const state = await handleQuote(form(valid), value)

    expect(state).toEqual({ status: 'sent', email: 'anna@example.ch' })
    const mail = sent[0]
    expect(mail?.to).toBe('owner@example.ch')
    expect(mail?.replyTo).toBe('anna@example.ch')
    expect(mail?.subject).toBe('Richiesta di preventivo: Anna Rossi, 4.50 m²')
    expect(mail?.text).toContain('Parete: 5.00 × 2.70 m (di fronte)')
    expect(mail?.text).toContain('Immagine: Lago e montagne (immagine pronta del sito)')
    expect(mail?.text).toContain('Località: Bellinzona')
    expect(mail?.text).toContain('Lingua del sito: DE')
    // 4.5 m² × 100 + 100 = 550, + 8.1 % VAT = 594.55 → about 590.
    expect(mail?.text).toMatch(
      /Prezzo indicativo mostrato: ca\. CHF\s590 IVA inclusa \(tariffe di esempio/,
    )
    expect(mail?.text).toContain(
      'Configurazione: https://www.example.ch/de/wand-testen?room=5x4x2.7&wall=n&image=lake&print=3x1.5&pos=0x0',
    )
    expect(mail?.attachments?.[0]).toMatchObject({
      filename: 'configurazione.jpg',
      contentType: 'image/jpeg',
    })
  })

  it('names an uploaded image and asks for the original file', async () => {
    const { value, sent } = deps()
    await handleQuote(
      form({
        ...valid,
        [QUOTE_HIDDEN.config]: 'room=5x4x2.7&wall=e&print=2x2&pos=0x0&fit=contain',
        [QUOTE_HIDDEN.upload]: 'logo.png',
        [QUOTE_HIDDEN.aspect]: '1',
      }),
      value,
    )
    expect(sent[0]?.text).toContain('immagine propria "logo.png"')
    expect(sent[0]?.text).toContain("chiedere l'originale")
  })

  it('sends without the screenshot when it is missing or not a JPEG', async () => {
    const { value, sent } = deps()
    await handleQuote(
      form({ ...valid, [QUOTE_HIDDEN.screenshot]: 'data:text/html;base64,PGI+' }),
      value,
    )
    expect(sent[0]?.attachments).toBeUndefined()
    expect(sent[0]?.text).toContain('Anteprima 3D: non disponibile.')
  })

  it('returns field errors and keeps what the visitor typed', async () => {
    const { value, sent } = deps()
    const state = await handleQuote(form({ ...valid, email: 'anna', consent: '' }), value)
    expect(state).toMatchObject({
      status: 'invalid',
      errors: { email: 'invalid', consent: 'required' },
      values: { name: 'Anna Rossi', place: 'Bellinzona' },
    })
    expect(sent).toEqual([])
  })

  it('fails (and logs) when the configuration is broken', async () => {
    const { value, sent, errors } = deps()
    const state = await handleQuote(form({ ...valid, [QUOTE_HIDDEN.config]: 'room=x' }), value)
    expect(state.status).toBe('failed')
    expect(sent).toEqual([])
    expect(errors[0]).toContain('configuration')
  })

  it('answers a bot with success and sends nothing', async () => {
    const { value, sent } = deps()
    const state = await handleQuote(form({ ...valid, website: 'spam.example' }), value)
    expect(state.status).toBe('sent')
    expect(sent).toEqual([])
  })

  it('stops a visitor over the rate limit and reports a missing recipient', async () => {
    expect((await handleQuote(form(valid), deps({ allow: () => false }).value)).status).toBe(
      'rateLimited',
    )
    const missing = deps({ to: undefined })
    expect((await handleQuote(form(valid), missing.value)).status).toBe('failed')
    expect(missing.errors[0]).toContain('CONTACT_TO')
  })

  it('reports a transport failure as "failed"', async () => {
    const failing: MailTransport = {
      send: async () => {
        throw new Error('SMTP down')
      },
    }
    const { value, errors } = deps({ transport: () => failing })
    expect((await handleQuote(form(valid), value)).status).toBe('failed')
    expect(errors[0]).toContain('not sent')
  })
})

describe('parseScreenshot', () => {
  it('accepts a JPEG data URL and refuses a too large one', () => {
    expect(parseScreenshot(form({ [QUOTE_HIDDEN.screenshot]: JPEG }))?.[0]).toBe(0xff)
    const huge = `data:image/jpeg;base64,${'A'.repeat(MAX_SCREENSHOT_CHARS)}`
    expect(parseScreenshot(form({ [QUOTE_HIDDEN.screenshot]: huge }))).toBeNull()
  })
})
