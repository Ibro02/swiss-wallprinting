import { describe, expect, it } from 'vite-plus/test'
import bs from '../../../../messages/bs.json'
import de from '../../../../messages/de.json'
import en from '../../../../messages/en.json'
import itMessages from '../../../../messages/it.json'
import { FIELD_ERRORS, QUESTION_FIELDS } from '../fields.ts'
import { parseQuestion } from '../question.ts'

const locales = { it: itMessages, de, en, bs }

describe('question form messages', () => {
  it.each(Object.entries(locales))('%s has a text for every field error', (_locale, messages) => {
    const errors = messages.QuestionForm.errors as Record<string, Record<string, string>>
    for (const field of QUESTION_FIELDS) {
      for (const code of FIELD_ERRORS[field]) {
        expect(errors[field]?.[code], `${field}.${code}`).toBeTruthy()
      }
    }
  })

  it('gives only the error codes listed in FIELD_ERRORS', () => {
    const forms: Record<string, string>[] = [
      {},
      { name: ' ', email: 'x', phone: 'abc', message: ' ' },
      {
        name: 'n'.repeat(101),
        email: `${'e'.repeat(200)}@x.ch`,
        phone: '1'.repeat(31),
        message: 'm'.repeat(3001),
      },
    ]
    for (const fields of forms) {
      const data = new FormData()
      for (const [key, value] of Object.entries(fields)) data.set(key, value)
      const result = parseQuestion(data)
      if (result.ok) continue
      for (const [field, code] of Object.entries(result.errors)) {
        expect(FIELD_ERRORS[field as keyof typeof FIELD_ERRORS], field).toContain(code)
      }
    }
  })
})
