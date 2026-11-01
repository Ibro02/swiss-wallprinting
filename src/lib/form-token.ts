// The signed fill-time token of the forms (Security audit #5). The pages are static, so the
// browser asks the server for a token after hydration (`issueFormToken`,
// features/contact/actions.ts); the form sends it back. The server reads the fill time from
// the token, so a request cannot fake it. A request without a valid token (no JavaScript, or
// a script that skips the page) still goes through, but against a much smaller send limit
// (`FORM_LIMIT_WITHOUT_TOKEN`, src/lib/rate-limit.ts), because the form must work without
// JavaScript.

import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

export const FORM_NAMES = ['question', 'quote'] as const
export type FormName = (typeof FORM_NAMES)[number]

/** An older token counts as missing (a page left open for hours). */
export const FORM_TOKEN_MAX_AGE_MS = 6 * 60 * 60_000

/** A secret shorter than this is refused (32 random bytes as base64 are 44 characters). */
export const MIN_FORM_SECRET_LENGTH = 32

function sign(secret: string, form: FormName, issuedAt: number): string {
  return createHmac('sha256', secret).update(`${form}.${issuedAt}`).digest('base64url')
}

/** `issuedAt.signature`: the time the server issued it, signed for this form only. */
export function createFormToken(form: FormName, issuedAt: number, secret: string): string {
  return `${issuedAt}.${sign(secret, form, issuedAt)}`
}

/**
 * When the server issued this token, or null when it is missing, forged, from the other
 * form, from the future, or too old.
 */
export function formTokenTime(
  token: string,
  form: FormName,
  now: number,
  secret: string,
): number | null {
  const [time = '', signature = '', ...rest] = token.split('.')
  if (rest.length > 0 || !/^\d{1,15}$/.test(time)) return null
  const issuedAt = Number(time)
  if (issuedAt > now || now - issuedAt > FORM_TOKEN_MAX_AGE_MS) return null
  const expected = Buffer.from(sign(secret, form, issuedAt))
  const given = Buffer.from(signature)
  return given.length === expected.length && timingSafeEqual(given, expected) ? issuedAt : null
}

let devSecret: string | undefined

/**
 * `FORM_SECRET`. Without it (development), a random secret for this server process: tokens
 * then end with a restart. A production build stops without it (scripts/check-mail.ts),
 * because each server instance would have its own secret.
 */
export function formSecret(env: Record<string, string | undefined> = process.env): string {
  const secret = env.FORM_SECRET
  if (secret && secret.length >= MIN_FORM_SECRET_LENGTH) return secret
  devSecret ??= randomBytes(32).toString('base64url')
  return devSecret
}
