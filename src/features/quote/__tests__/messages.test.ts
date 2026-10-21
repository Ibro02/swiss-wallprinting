import { describe, expect, it } from 'vite-plus/test'
import bs from '../../../../messages/bs.json'
import de from '../../../../messages/de.json'
import en from '../../../../messages/en.json'
import itMessages from '../../../../messages/it.json'
import { UPLOAD_ERRORS } from '../../configurator/model/upload.ts'
import { QUOTE_FIELD_ERRORS, QUOTE_FIELDS } from '../fields.ts'
import { parseQuote } from '../quote.ts'

const locales = { it: itMessages, de, en, bs }

describe('configurator messages', () => {
  it.each(Object.entries(locales))(
    '%s has a text for every quote field error',
    (_locale, messages) => {
      const errors = messages.Configurator.quote.errors as Record<string, Record<string, string>>
      for (const field of QUOTE_FIELDS) {
        for (const code of QUOTE_FIELD_ERRORS[field]) {
          expect(errors[field]?.[code], `${field}.${code}`).toBeTruthy()
        }
      }
    },
  )

  it.each(Object.entries(locales))('%s has a text for every upload error', (_locale, messages) => {
    const errors = messages.Configurator.image.errors as Record<string, string>
    for (const code of UPLOAD_ERRORS) expect(errors[code], code).toBeTruthy()
  })

  it('gives only the quote error codes listed in QUOTE_FIELD_ERRORS', () => {
    const forms: Record<string, string>[] = [
      {},
      { name: ' ', email: 'x', phone: 'abc' },
      {
        name: 'n'.repeat(101),
        email: `${'e'.repeat(200)}@x.ch`,
        phone: '1'.repeat(31),
        place: 'p'.repeat(101),
        notes: 'n'.repeat(3001),
      },
    ]
    for (const fields of forms) {
      const data = new FormData()
      for (const [key, value] of Object.entries(fields)) data.set(key, value)
      const result = parseQuote(data)
      if (result.ok) continue
      for (const [field, code] of Object.entries(result.errors)) {
        expect(QUOTE_FIELD_ERRORS[field as keyof typeof QUOTE_FIELD_ERRORS], field).toContain(code)
      }
    }
  })
})
