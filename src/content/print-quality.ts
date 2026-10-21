// The sharpness threshold for uploaded images (proposal P5). MOCK: the client has not said
// how many pixels per centimetre a print needs (Q11). 20 px/cm (about 50 dpi) is a common
// minimum for large wall prints seen from a metre or more; replace it with the client's
// number. The production build stops while this item is mock.

import type { PrintQuality } from './schema.ts'

export const printQuality: PrintQuality = {
  id: 'print-quality',
  mock: true,
  minPixelsPerCm: 20,
}
