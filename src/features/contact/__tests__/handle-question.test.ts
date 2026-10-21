import { describe, expect, it } from 'vite-plus/test'
import type { MailMessage, MailTransport } from '@/lib/mail.ts'
import { handleQuestion, type QuestionDeps } from '../handle-question.ts'

function form(fields: Record<string, string>): FormData {
  const data = new FormData()
  for (const [key, value] of Object.entries(fields)) data.set(key, value)
  return data
}

const valid = {
  name: 'Anna Rossi',
  email: 'anna@example.ch',
  phone: '',
  message: 'Vorrei un preventivo.',
  consent: 'on',
}

function setup(overrides: Partial<QuestionDeps> = {}) {
  const sent: MailMessage[] = []
  const errors: string[] = []
  const transport: MailTransport = {
    send: async (message) => {
      sent.push(message)
    },
  }
  const deps: QuestionDeps = {
    now: 100_000,
    allow: () => true,
    to: 'owner@example.ch',
    transport: () => transport,
    locale: 'it',
    page: '/it',
    logError: (message) => errors.push(message),
    ...overrides,
  }
  return { deps, sent, errors }
}

describe('handleQuestion', () => {
  it('sends a valid question to the recipient', async () => {
    const { deps, sent } = setup()
    expect(await handleQuestion(form(valid), deps)).toEqual({
      status: 'sent',
      email: 'anna@example.ch',
    })
    expect(sent).toHaveLength(1)
    expect(sent[0]?.to).toBe('owner@example.ch')
  })

  it('returns the field errors and the typed values, and sends nothing', async () => {
    const { deps, sent } = setup()
    const state = await handleQuestion(form({ ...valid, email: 'anna@' }), deps)
    expect(state).toMatchObject({ status: 'invalid', errors: { email: 'invalid' } })
    expect(state).toHaveProperty('values.message', 'Vorrei un preventivo.')
    expect(sent).toHaveLength(0)
  })

  it('answers a bot (honeypot) like a success, without sending', async () => {
    const { deps, sent } = setup()
    const state = await handleQuestion(form({ ...valid, website: 'spam' }), deps)
    expect(state.status).toBe('sent')
    expect(sent).toHaveLength(0)
  })

  it('stops a form sent too fast', async () => {
    const { deps, sent } = setup()
    const state = await handleQuestion(form({ ...valid, startedAt: String(99_500) }), deps)
    expect(state.status).toBe('tooFast')
    expect(sent).toHaveLength(0)
  })

  it('stops a visitor over the rate limit', async () => {
    const { deps, sent } = setup({ allow: () => false })
    expect((await handleQuestion(form(valid), deps)).status).toBe('rateLimited')
    expect(sent).toHaveLength(0)
  })

  it('reports "not sent" and logs the cause when no recipient is set', async () => {
    const { deps, errors } = setup({ to: undefined })
    expect((await handleQuestion(form(valid), deps)).status).toBe('failed')
    expect(errors[0]).toContain('CONTACT_TO')
  })

  it('reports "not sent" and keeps the values when the transport fails', async () => {
    const { deps, errors } = setup({
      transport: () => {
        throw new Error('no transport')
      },
    })
    const state = await handleQuestion(form(valid), deps)
    expect(state).toMatchObject({ status: 'failed', values: { name: 'Anna Rossi' } })
    expect(errors).toHaveLength(1)
  })
})
