// All content collections. Add each new collection here: the mock guard
// (scripts/check-mock.ts) and the content tests read this list.

import { applicationAreas } from './application-areas.ts'
import { company, printFacts } from './company.ts'
import { gallery } from './gallery.ts'
import { legal } from './legal.ts'
import { presets } from './presets.ts'
import { pricing } from './pricing.ts'
import { printQuality } from './print-quality.ts'
import type { ContentItem } from './schema.ts'
import { services } from './services.ts'
import { testimonials } from './testimonials.ts'

export const collections = {
  company: [company],
  printFacts: [printFacts],
  testimonials,
  applicationAreas,
  services,
  gallery,
  legal: [legal],
  presets,
  pricing: [pricing],
  printQuality: [printQuality],
} satisfies Record<string, readonly ContentItem[]>
