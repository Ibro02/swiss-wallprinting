// Rates for the configurator price estimate: CHF 250 per square metre, indoors and outdoors,
// VAT included, with no set-up costs and no minimum (the client's rate, confirmed by the author
// on 2026-11-01, Q5). So `fixed`, `minimum`, and `vatRate` are 0, and the breakdown leaves out
// their rows; set them again to add them back.

import type { Pricing } from './schema.ts'

export const pricing: Pricing = {
  id: 'pricing',
  mock: false,
  perSquareMetre: { interior: 250, exterior: 250 },
  minimum: 0,
  fixed: 0,
  vatRate: 0,
}
