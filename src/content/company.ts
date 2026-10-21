// Facts from the old site (swiss-wallprinting/Old Website/Old Website.md). Real data.

import type { Company, PrintFacts } from './schema.ts'

export const company: Company = {
  id: 'company',
  mock: false,
  name: 'Swiss Wall Printing',
  postalCode: '6803',
  locality: 'Camignolo',
  canton: 'Ticino',
  email: 'swisswallprinting@gmail.com',
  phones: [
    { e164: '+41764115506', display: '+41 76 411 55 06', languages: 'IT' },
    { e164: '+41793500885', display: '+41 79 350 08 85', languages: 'IT - DE - CH' },
  ],
  // Decided by the author (Q9); confirm with the client before launch.
  whatsapp: '+41793500885',
  social: {
    facebook: 'https://www.facebook.com/p/swisswallprinting-61578563834876/',
    instagram: 'https://www.instagram.com/swisswallprinting/',
  },
}

export const printFacts: PrintFacts = {
  id: 'print-facts',
  mock: false,
  maxPrintHeightM: 3.8,
  durabilityYears: 12,
  surfaces: ['interior', 'exterior'],
}
