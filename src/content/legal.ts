// Facts for the imprint and the privacy policy. `null` means the client has not sent it
// yet (Q10, Q2, Q6): the pages show "to be completed", and the item is `mock: true`, so
// the production build stops until every field is filled in.

import type { LegalInfo } from './schema.ts'

export const legal: LegalInfo = {
  id: 'legal',
  mock: true,
  legalName: null,
  responsible: null,
  street: null,
  uid: null,
  hosting: null,
  mailProvider: null,
  updated: '2026-10-20',
}
