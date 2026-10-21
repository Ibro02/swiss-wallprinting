// Zod schemas for the content files. The app imports only the types (`import type`),
// so Zod is not in the browser bundle; the content tests run the schemas.

import { z } from 'zod'
import type { ImageKey } from './images/index.ts'

/** Every content item says whether it is a placeholder (Development Plan, section 6.3). */
export const contentItem = z.object({
  id: z.string().min(1),
  mock: z.boolean(),
})
export type ContentItem = z.infer<typeof contentItem>

const phone = z.object({
  /** E.164, for tel: and WhatsApp links. */
  e164: z.string().regex(/^\+41\d{9}$/),
  display: z.string().min(1),
  /** Languages as the old site lists them, e.g. "IT - DE - CH". */
  languages: z.string().min(1),
})

export const company = contentItem.extend({
  name: z.string().min(1),
  postalCode: z.string().regex(/^\d{4}$/),
  locality: z.string().min(1),
  canton: z.string().min(1),
  email: z.email(),
  phones: z.array(phone).min(1),
  whatsapp: z.string().regex(/^\+41\d{9}$/),
  social: z.object({ facebook: z.url(), instagram: z.url() }),
})
export type Company = z.infer<typeof company>

const environment = z.enum(['interior', 'exterior'])

export const printFacts = contentItem.extend({
  /** Machine limit for one print, metres. */
  maxPrintHeightM: z.number().positive(),
  /** Years the colours stay bright, also outdoors. */
  durabilityYears: z.number().int().positive(),
  surfaces: z.array(environment).min(1),
})
export type PrintFacts = z.infer<typeof printFacts>

/**
 * Text that the site shows in every locale. Content text lives here; fixed UI text
 * lives in messages/*.json. A test checks the keys against routing.locales.
 */
export const localizedText = z.object({
  it: z.string().min(1),
  de: z.string().min(1),
  en: z.string().min(1),
  bs: z.string().min(1),
})
export type LocalizedText = z.infer<typeof localizedText>

/** A customer review (Development Plan 4.2). Shown in the language it was written in. */
export const testimonial = contentItem.extend({
  author: z.string().min(1),
  /** Town or company, only if the customer agrees. */
  place: z.string().min(1).optional(),
  rating: z.number().int().min(1).max(5),
  date: z.iso.date(),
  language: z.enum(['it', 'de', 'en', 'bs', 'fr']),
  text: z.string().min(1),
  /** The client's public answer, if any. */
  ownerReply: z.string().min(1).optional(),
  source: z.enum(['google', 'direct']),
})
export type Testimonial = z.infer<typeof testimonial>

/** A kind of place to print in (Development Plan 4.2, "Application areas"). */
export const applicationArea = contentItem.extend({
  icon: z.enum(['office', 'hotel', 'restaurant', 'school', 'home', 'facade']),
  title: localizedText,
  /** One sentence: what a print does for this kind of place. */
  line: localizedText,
  environment,
})
export type ApplicationArea = z.infer<typeof applicationArea>

/** Key in src/content/images/ (the content tests check that it exists). */
const imageKey = z.string().min(1)

/** A room card on the services page: the same wall before and after the print. */
export const serviceRoom = contentItem.extend({
  /** The application area id (src/content/application-areas.ts). */
  area: z.string().min(1),
  /** The wall in the photo, metres. */
  wall: z.object({ widthM: z.number().positive(), heightM: z.number().positive() }),
  before: imageKey,
  after: imageKey,
  alt: z.object({ before: localizedText, after: localizedText }),
  /** The configurator preset with the same artwork ("Try this wall"). */
  preset: z.string().min(1),
})
export type ServiceRoom = Omit<z.infer<typeof serviceRoom>, 'before' | 'after'> & {
  before: ImageKey
  after: ImageKey
}

/** A ready print image in the configurator (Development Plan 4.7, control 3). */
export const preset = contentItem.extend({
  image: imageKey,
  title: localizedText,
})
export type Preset = Omit<z.infer<typeof preset>, 'image'> & { image: ImageKey }

/**
 * Rates for the configurator price estimate (Q5). CHF without VAT. Until the client
 * sends the real rates, the item is mock and the page marks the price as an example.
 */
export const pricing = contentItem.extend({
  perSquareMetre: z.object({ interior: z.number().positive(), exterior: z.number().positive() }),
  minimum: z.number().nonnegative(),
  fixed: z.number().nonnegative(),
  vatRate: z.number().min(0).max(1),
})
export type Pricing = z.infer<typeof pricing>

/** The pixels per centimetre an uploaded image needs for a sharp print (Q11). */
export const printQuality = contentItem.extend({
  minPixelsPerCm: z.number().positive(),
})
export type PrintQuality = z.infer<typeof printQuality>

/** A finished work in the gallery. */
export const galleryItem = contentItem.extend({
  image: imageKey,
  alt: localizedText,
  caption: localizedText,
  /** Application area id, for the filter. Unknown for some client photos. */
  area: z.string().min(1).optional(),
  environment: environment.optional(),
})
export type GalleryItem = Omit<z.infer<typeof galleryItem>, 'image'> & { image: ImageKey }

/**
 * Facts for the imprint and the privacy policy. `null` = the client has not sent it yet;
 * then the item must be `mock: true`, so the production build stops (a test checks this).
 */
export const legalInfo = contentItem.extend({
  legalName: z.string().min(1).nullable(),
  /** Person responsible for the content. */
  responsible: z.string().min(1).nullable(),
  street: z.string().min(1).nullable(),
  /** Swiss company number (UID), "CHE-123.456.789". */
  uid: z
    .string()
    .regex(/^CHE-\d{3}\.\d{3}\.\d{3}$/)
    .nullable(),
  /** Where the site runs (privacy policy). */
  hosting: z.string().min(1).nullable(),
  /** Who delivers the form e-mails (privacy policy). */
  mailProvider: z.string().min(1).nullable(),
  /** Date of the current version of the legal texts. */
  updated: z.iso.date(),
})
export type LegalInfo = z.infer<typeof legalInfo>
