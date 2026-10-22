// Names and limits of the question form, shared by the server code and the form
// component. No Zod here: this file goes into the browser bundle.

export const QUESTION_FIELDS = ['name', 'email', 'phone', 'message', 'consent'] as const
export type QuestionField = (typeof QUESTION_FIELDS)[number]
export type FieldError = 'required' | 'invalid' | 'tooLong'

export const LIMITS = { name: 100, email: 200, phone: 30, message: 3000 } as const

/** The error codes that the validation can give per field. Each has a text in messages/*.json. */
export const FIELD_ERRORS = {
  name: ['required', 'tooLong'],
  email: ['required', 'invalid', 'tooLong'],
  phone: ['invalid', 'tooLong'],
  message: ['required', 'tooLong'],
  consent: ['required'],
} as const satisfies Record<QuestionField, readonly FieldError[]>

/**
 * The "for which space" chips (checkboxes named `areas`): the application areas
 * (src/content/application-areas.ts), and this one for anything else. Optional, no error:
 * an unknown value is dropped.
 */
export const OTHER_AREA = 'other'

/** Anchor of the question form: the hero card on the home page, the form on the contact page. */
export const QUESTION_FORM_ID = 'question'

/** Fields that bots fill and people do not see (honeypot), and the fill time. */
export const SPAM_FIELDS = { honeypot: 'website', startedAt: 'startedAt' } as const

/** Faster than this from page load to submit is a bot. */
export const MIN_FILL_MS = 2000

export interface Question {
  name: string
  email: string
  phone: string
  message: string
  /** Area ids from the chips, in form order, without duplicates. */
  areas: string[]
}

/** What the visitor typed, to fill the form again after an error. */
export interface QuestionValues extends Question {
  consent: boolean
}
