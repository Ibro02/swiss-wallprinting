import { describe, expect, it } from 'vite-plus/test'
import {
  LIMITS,
  MIN_FILL_MS,
  parseQuestion,
  questionMail,
  questionValues,
  spamVerdict,
} from '../question.ts'

function form(fields: Record<string, string | string[]>): FormData {
  const data = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    for (const item of Array.isArray(value) ? value : [value]) data.append(key, item)
  }
  return data
}

const valid = {
  name: '  Anna Rossi ',
  email: 'anna@example.ch',
  phone: '+41 79 123 45 67',
  message: 'Vorrei stampare il logo in ufficio.',
  consent: 'on',
}

describe('parseQuestion', () => {
  it('accepts a complete form and trims the text', () => {
    expect(parseQuestion(form(valid))).toEqual({
      ok: true,
      question: {
        name: 'Anna Rossi',
        email: 'anna@example.ch',
        phone: '+41 79 123 45 67',
        message: 'Vorrei stampare il logo in ufficio.',
        areas: [],
      },
    })
  })

  it('keeps the checked area chips once each, and drops unknown values', () => {
    const result = parseQuestion(form({ ...valid, areas: ['hotel', 'nonsense', 'other', 'hotel'] }))
    expect(result).toMatchObject({ ok: true, question: { areas: ['hotel', 'other'] } })
  })

  it('accepts an empty phone number (the field is optional)', () => {
    expect(parseQuestion(form({ ...valid, phone: '' })).ok).toBe(true)
  })

  it('names each missing required field', () => {
    const result = parseQuestion(form({ phone: '' }))
    expect(result).toEqual({
      ok: false,
      errors: { name: 'required', email: 'required', message: 'required', consent: 'required' },
    })
  })

  it('treats spaces only as missing', () => {
    expect(parseQuestion(form({ ...valid, name: '   ' }))).toMatchObject({
      errors: { name: 'required' },
    })
  })

  it('rejects an incomplete e-mail address and an invalid phone number', () => {
    expect(parseQuestion(form({ ...valid, email: 'anna@', phone: 'abc' }))).toEqual({
      ok: false,
      errors: { email: 'invalid', phone: 'invalid' },
    })
  })

  it('rejects text over the limits', () => {
    const result = parseQuestion(form({ ...valid, message: 'x'.repeat(LIMITS.message + 1) }))
    expect(result).toEqual({ ok: false, errors: { message: 'tooLong' } })
  })

  it('needs the consent box', () => {
    expect(parseQuestion(form({ ...valid, consent: '' }))).toEqual({
      ok: false,
      errors: { consent: 'required' },
    })
  })
})

describe('questionValues', () => {
  it('keeps what the visitor typed, for the form after an error', () => {
    expect(questionValues(form({ name: 'Anna', consent: 'on' }))).toEqual({
      name: 'Anna',
      email: '',
      phone: '',
      message: '',
      areas: [],
      consent: true,
    })
  })
})

describe('spamVerdict', () => {
  const now = 1_000_000

  it('flags a filled honeypot', () => {
    expect(spamVerdict(form({ website: 'http://spam.example' }), now)).toBe('honeypot')
  })

  it('flags a form sent faster than a person can type', () => {
    expect(spamVerdict(form({ startedAt: String(now - MIN_FILL_MS + 1) }), now)).toBe('tooFast')
  })

  it('accepts a normal fill time, and a form without JavaScript (no start time)', () => {
    expect(spamVerdict(form({ startedAt: String(now - 30_000) }), now)).toBe('ok')
    expect(spamVerdict(form({}), now)).toBe('ok')
  })
})

describe('questionMail', () => {
  it('addresses the client, replies to the visitor, and keeps the message', () => {
    const mail = questionMail(
      { name: 'Anna Rossi', email: 'anna@example.ch', phone: '', message: 'Ciao', areas: [] },
      { to: 'owner@example.ch', locale: 'de', page: '/de' },
    )
    expect(mail.to).toBe('owner@example.ch')
    expect(mail.replyTo).toBe('anna@example.ch')
    expect(mail.subject).toBe('Nuova domanda dal sito: Anna Rossi')
    expect(mail.text).toContain('Telefono: -')
    expect(mail.text).toContain('Lingua del sito: DE')
    expect(mail.text).toContain('Spazio: -')
    expect(mail.text.endsWith('Ciao')).toBe(true)
  })

  it('names the chosen areas in Italian', () => {
    const mail = questionMail(
      {
        name: 'Anna',
        email: 'anna@example.ch',
        phone: '',
        message: 'Ciao',
        areas: ['hotel', 'other'],
      },
      { to: 'owner@example.ch', locale: 'it', page: '/' },
    )
    expect(mail.text).toContain('Spazio: Hotel, Altro')
  })
})
