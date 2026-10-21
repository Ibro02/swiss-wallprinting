// The quote request from the configurator (proposal P7): validation, the configuration
// from the share link, and the e-mail to the client with the 3D screenshot. Pure
// functions; handle-quote.ts runs the flow and actions.ts is the Server Action.

import { z } from 'zod'
import { edgesOf } from '@/features/configurator/model/print.ts'
import { estimatePrice, type PriceRates } from '@/features/configurator/model/price.ts'
import type { Wall } from '@/features/configurator/model/room.ts'
import {
  fromSearchParams,
  type SharedConfig,
  toSearchParams,
} from '@/features/configurator/model/share.ts'
import { placementOf } from '@/features/configurator/store.ts'
import type { MailMessage } from '@/lib/mail.ts'
import {
  type FieldError,
  MAX_SCREENSHOT_CHARS,
  QUOTE_HIDDEN,
  QUOTE_LIMITS,
  type QuoteField,
  type QuoteValues,
} from './fields.ts'

const PHONE = /^\+?[\d\s().-]{6,}$/

const quoteSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: 'required' })
    .max(QUOTE_LIMITS.name, { error: 'tooLong' }),
  email: z
    .string()
    .trim()
    .min(1, { error: 'required' })
    .max(QUOTE_LIMITS.email, { error: 'tooLong' })
    .pipe(z.email({ error: 'invalid' })),
  phone: z
    .string()
    .trim()
    .max(QUOTE_LIMITS.phone, { error: 'tooLong' })
    .refine((value) => value === '' || PHONE.test(value), { error: 'invalid' }),
  place: z.string().trim().max(QUOTE_LIMITS.place, { error: 'tooLong' }),
  notes: z.string().trim().max(QUOTE_LIMITS.notes, { error: 'tooLong' }),
  consent: z.literal('on', { error: 'required' }),
})

export type QuoteContact = Omit<QuoteValues, 'consent'>

function text(formData: FormData, name: string): string {
  const value = formData.get(name)
  return typeof value === 'string' ? value : ''
}

export function quoteValues(formData: FormData): QuoteValues {
  return {
    name: text(formData, 'name'),
    email: text(formData, 'email'),
    phone: text(formData, 'phone'),
    place: text(formData, 'place'),
    notes: text(formData, 'notes'),
    consent: formData.get('consent') === 'on',
  }
}

export function parseQuote(
  formData: FormData,
):
  | { ok: true; contact: QuoteContact }
  | { ok: false; errors: Partial<Record<QuoteField, FieldError>> } {
  const result = quoteSchema.safeParse({
    ...quoteValues(formData),
    consent: formData.get('consent') ?? undefined,
  })
  if (result.success) {
    const { consent: _consent, ...contact } = result.data
    return { ok: true, contact }
  }
  const errors: Partial<Record<QuoteField, FieldError>> = {}
  for (const issue of result.error.issues) {
    const field = issue.path[0] as QuoteField
    errors[field] ??= issue.message as FieldError
  }
  return { ok: false, errors }
}

export interface QuotePreset {
  id: string
  /** Italian title, for the e-mail. */
  title: string
  aspect: number
}

/** What the visitor configured, read back from the form and checked like a share link. */
export interface QuoteDesign {
  config: SharedConfig
  /** Preset title, or null for an uploaded image. */
  preset: QuotePreset | null
  /** File name of an uploaded image. */
  upload: string | null
  aspect: number
}

export function parseDesign(
  formData: FormData,
  presets: readonly QuotePreset[],
): QuoteDesign | null {
  const params = Object.fromEntries(new URLSearchParams(text(formData, QUOTE_HIDDEN.config)))
  const config = fromSearchParams(
    params,
    presets.map((preset) => preset.id),
  )
  if (!config) return null
  const upload = text(formData, QUOTE_HIDDEN.upload).trim().slice(0, 200) || null
  const preset = upload ? null : (presets.find((item) => item.id === config.preset) ?? null)
  const sentAspect = Number(text(formData, QUOTE_HIDDEN.aspect))
  const aspect = preset?.aspect ?? (sentAspect >= 0.05 && sentAspect <= 20 ? sentAspect : 1)
  if (!upload && !preset) return null
  return { config, preset, upload, aspect }
}

/** The JPEG bytes of the screenshot, or null when it is missing, not a JPEG, or too large. */
export function parseScreenshot(formData: FormData): Uint8Array | null {
  const value = text(formData, QUOTE_HIDDEN.screenshot)
  const prefix = 'data:image/jpeg;base64,'
  if (!value.startsWith(prefix) || value.length > MAX_SCREENSHOT_CHARS) return null
  const bytes = Buffer.from(value.slice(prefix.length), 'base64')
  // A JPEG file starts with FF D8 FF.
  if (bytes.length < 3 || bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff) return null
  return new Uint8Array(bytes)
}

const WALL_NAME: Record<Wall, string> = {
  north: 'di fronte',
  east: 'a destra',
  south: 'dietro',
  west: 'a sinistra',
}

export interface QuoteMailMeta {
  to: string
  locale: string
  /** Absolute address of the configurator page in the visitor's language. */
  configuratorUrl: string
  machineMaxHeight: number
  rates: PriceRates
  ratesAreExamples: boolean
}

/** The e-mail to the client. In Italian: the client reads Italian, whatever the page language. */
export function quoteMail(
  contact: QuoteContact,
  design: QuoteDesign,
  screenshot: Uint8Array | null,
  meta: QuoteMailMeta,
): MailMessage {
  const { config } = design
  const placement = placementOf({
    ...config,
    image: { aspect: design.aspect },
    machineMaxHeight: meta.machineMaxHeight,
  })
  const price = estimatePrice(placement.areaM2, config.environment, meta.rates)
  const edges = edgesOf(placement.print, placement.wall)
  const m = (value: number) =>
    new Intl.NumberFormat('it-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
      value,
    )
  const chf = (value: number) =>
    new Intl.NumberFormat('it-CH', {
      style: 'currency',
      currency: 'CHF',
      maximumFractionDigits: 0,
    }).format(value)

  const image = design.preset
    ? `${design.preset.title} (immagine pronta del sito)`
    : `immagine propria "${design.upload}" (il file resta al cliente: chiedere l'originale)`
  const link = `${meta.configuratorUrl}?${toSearchParams(config).toString()}`

  const lines = [
    'Richiesta di preventivo dal configuratore 3D',
    '',
    `Nome: ${contact.name}`,
    `E-mail: ${contact.email}`,
    `Telefono: ${contact.phone || '-'}`,
    `Località: ${contact.place || '-'}`,
    `Lingua del sito: ${meta.locale.toUpperCase()}`,
    '',
    `Parete: ${m(placement.wall.width)} × ${m(placement.wall.height)} m (${WALL_NAME[config.wall]})`,
    `Stanza: ${m(config.room.width)} × ${m(config.room.length)} × ${m(config.room.height)} m`,
    `Area di stampa: ${m(placement.print.width)} × ${m(placement.print.height)} m (${config.fit === 'cover' ? "l'immagine riempie l'area" : 'immagine intera'})`,
    `Superficie stampata: ${m(placement.areaM2)} m²`,
    `Posizione: ${m(edges.left)} m dal bordo sinistro, ${m(edges.bottom)} m da terra`,
    `Immagine: ${image}`,
    `Ambiente: ${config.environment === 'interior' ? 'interno' : 'esterno'}`,
    `Prezzo indicativo mostrato: ca. ${chf(price.approx)} IVA inclusa${meta.ratesAreExamples ? ' (tariffe di esempio del sito, non ancora quelle reali)' : ''}`,
    '',
    `Configurazione: ${link}`,
    screenshot ? 'Anteprima 3D: in allegato.' : 'Anteprima 3D: non disponibile.',
    '',
    'Note del cliente:',
    contact.notes || '-',
  ]

  return {
    to: meta.to,
    replyTo: contact.email,
    subject: `Richiesta di preventivo: ${contact.name}, ${m(placement.areaM2)} m²`,
    text: lines.join('\n'),
    attachments: screenshot
      ? [{ filename: 'configurazione.jpg', contentType: 'image/jpeg', content: screenshot }]
      : undefined,
  }
}
