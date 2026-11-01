import { describe, expect, it } from 'vite-plus/test'
import {
  createFormToken,
  FORM_TOKEN_MAX_AGE_MS,
  formSecret,
  formTokenTime,
  MIN_FORM_SECRET_LENGTH,
} from '../form-token.ts'

const SECRET = 'a'.repeat(MIN_FORM_SECRET_LENGTH)
const NOW = 1_800_000_000_000

describe('formTokenTime', () => {
  it('reads the issue time from a token of this form', () => {
    const token = createFormToken('question', NOW - 5000, SECRET)
    expect(formTokenTime(token, 'question', NOW, SECRET)).toBe(NOW - 5000)
  })

  it('refuses a token with a changed time, another secret, or another form', () => {
    const token = createFormToken('question', NOW - 5000, SECRET)
    const [, signature] = token.split('.')
    expect(formTokenTime(`${NOW - 60_000}.${signature}`, 'question', NOW, SECRET)).toBeNull()
    expect(formTokenTime(token, 'question', NOW, 'b'.repeat(MIN_FORM_SECRET_LENGTH))).toBeNull()
    expect(formTokenTime(token, 'quote', NOW, SECRET)).toBeNull()
  })

  it('refuses a missing, malformed, future, or too old token', () => {
    expect(formTokenTime('', 'question', NOW, SECRET)).toBeNull()
    expect(formTokenTime('abc.def', 'question', NOW, SECRET)).toBeNull()
    expect(formTokenTime(`${NOW}.x.y`, 'question', NOW, SECRET)).toBeNull()
    const future = createFormToken('question', NOW + 1000, SECRET)
    expect(formTokenTime(future, 'question', NOW, SECRET)).toBeNull()
    const old = createFormToken('question', NOW - FORM_TOKEN_MAX_AGE_MS - 1, SECRET)
    expect(formTokenTime(old, 'question', NOW, SECRET)).toBeNull()
  })
})

describe('formSecret', () => {
  it('uses FORM_SECRET, and a random secret per process without one (or a short one)', () => {
    expect(formSecret({ FORM_SECRET: SECRET })).toBe(SECRET)
    const random = formSecret({})
    expect(random.length).toBeGreaterThanOrEqual(MIN_FORM_SECRET_LENGTH)
    expect(formSecret({ FORM_SECRET: 'short' })).toBe(random)
  })
})
