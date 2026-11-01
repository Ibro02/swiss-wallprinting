// Facts for the imprint and the privacy policy. `null` means the client has not sent it
// yet (Q10, Q2, Q6): the pages show "to be completed", and the item is `mock: true`, so
// the production build stops until every field is filled in.
//
// The privacy policy names the host and the mail provider (the author, 2026-11-01: Vercel,
// and Gmail SMTP). When the site moves or the SMTP mailbox changes (SMTP_HOST), change them
// here too, with `updated`.

import type { LegalInfo } from './schema.ts'

export const legal: LegalInfo = {
  id: 'legal',
  mock: true,
  legalName: null,
  responsible: null,
  street: null,
  uid: null,
  hosting: 'Vercel Inc.',
  mailProvider: 'Gmail (Google)',
  updated: '2026-11-01',
}
