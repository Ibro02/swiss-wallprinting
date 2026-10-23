// Facts from the old site (swiss-wallprinting/Old Website/Old Website.md) and from the
// client's brief of 2026-10-22: founded, municipality, hours, TikTok
// (swiss-wallprinting/Specs/Client brief.md). Real data.

import type { Company, PrintFacts } from './schema.ts'

export const company: Company = {
  id: 'company',
  mock: false,
  name: 'Swiss Wall Printing',
  postalCode: '6803',
  locality: 'Camignolo',
  municipality: 'Monteceneri',
  canton: 'Ticino',
  founded: 2025,
  hours: { opens: '08:00', closes: '18:00' },
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
    // The client has an account ("TikTok: Swiss Wall Printing") but sent no link yet.
    tiktok: null,
  },
}

export const printFacts: PrintFacts = {
  id: 'print-facts',
  mock: false,
  maxPrintHeightM: 3.8,
  durabilityYears: 12,
  surfaces: ['interior', 'exterior'],
}
