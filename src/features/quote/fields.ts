// Names and limits of the quote request form in the configurator (proposal P7), shared by
// the server code and the form. No Zod here: this file goes into the browser bundle.

import type { FieldError } from '@/features/contact/fields.ts'

export type { FieldError }

export const QUOTE_FIELDS = ['name', 'email', 'phone', 'place', 'notes', 'consent'] as const
export type QuoteField = (typeof QUOTE_FIELDS)[number]

export const QUOTE_LIMITS = { name: 100, email: 200, phone: 30, place: 100, notes: 3000 } as const

/** The error codes per field. Each has a text in messages/*.json (Configurator.quote.errors). */
export const QUOTE_FIELD_ERRORS = {
  name: ['required', 'tooLong'],
  email: ['required', 'invalid', 'tooLong'],
  phone: ['invalid', 'tooLong'],
  place: ['tooLong'],
  notes: ['tooLong'],
  consent: ['required'],
} as const satisfies Record<QuoteField, readonly FieldError[]>

/** Hidden fields that the configurator fills when the form opens. */
export const QUOTE_HIDDEN = {
  /** The share link parameters (model/share.ts). */
  config: 'config',
  /** File name of an uploaded image (the file itself stays on the device). */
  upload: 'upload',
  /** Width / height of an uploaded image, for the printed area with "contain". */
  aspect: 'aspect',
  /** JPEG data URL of the 3D view. */
  screenshot: 'screenshot',
} as const

/** Larger screenshots are dropped: a Server Action accepts at most 1 MB. */
export const MAX_SCREENSHOT_CHARS = 600_000

export interface QuoteValues {
  name: string
  email: string
  phone: string
  place: string
  notes: string
  consent: boolean
}
