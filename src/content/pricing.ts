// Rates for the configurator price estimate. MOCK: example numbers, not the client's
// prices (Q5 is open). The page marks the price as an example, and the production build
// stops while this item is mock. VAT: the Swiss standard rate (8.1 % since 2024); ask the
// client whether the company charges VAT.

import type { Pricing } from './schema.ts'

export const pricing: Pricing = {
  id: 'pricing',
  mock: true,
  perSquareMetre: { interior: 150, exterior: 190 },
  minimum: 450,
  fixed: 120,
  vatRate: 0.081,
}
