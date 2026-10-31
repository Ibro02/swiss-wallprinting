// The configurator's data from the content files, in one shape for the configurator page
// and the quote action (features/quote/actions.ts), so both start from the same presets,
// rates, and machine height. Server only: it reads src/content.

import { printFacts } from '@/content/company.ts'
import { images } from '@/content/images/index.ts'
import { collections } from '@/content/index.ts'
import { pricing } from '@/content/pricing.ts'
import type { Locale } from '@/i18n/routing.ts'

export function configuratorContent(locale: Locale) {
  const { id: _id, mock: ratesAreExamples, ...rates } = pricing
  return {
    presets: collections.presets.map((preset) => ({
      id: preset.id,
      title: preset.title[locale],
      image: images[preset.image],
    })),
    presetsAreExamples: collections.presets.some((preset) => preset.mock),
    rooms: collections.areaStarts,
    areas: collections.applicationAreas,
    machineMaxHeight: printFacts.maxPrintHeightM,
    rates,
    ratesAreExamples,
  }
}
