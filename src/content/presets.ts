// Ready print images in the configurator. MOCK: original artworks made by
// `vp run mockups` (scripts/lib/artworks.ts). Replace them with the client's catalogue.
// DE, EN, BS titles are drafts.

import type { Preset } from './schema.ts'

export const presets: readonly Preset[] = [
  {
    id: 'cmyk',
    mock: true,
    image: 'presets/cmyk',
    title: { it: 'Inchiostri CMYK', de: 'CMYK-Farben', en: 'CMYK inks', bs: 'CMYK boje' },
  },
  {
    id: 'lake',
    mock: true,
    image: 'presets/lake',
    title: {
      it: 'Lago e montagne',
      de: 'See und Berge',
      en: 'Lake and mountains',
      bs: 'Jezero i planine',
    },
  },
  {
    id: 'lemons',
    mock: true,
    image: 'presets/lemons',
    title: { it: 'Limoni', de: 'Zitronen', en: 'Lemons', bs: 'Limuni' },
  },
  {
    id: 'space',
    mock: true,
    image: 'presets/space',
    title: {
      it: 'Spazio per bambini',
      de: 'Weltall für Kinder',
      en: 'Space for kids',
      bs: 'Svemir za djecu',
    },
  },
  {
    id: 'arches',
    mock: true,
    image: 'presets/arches',
    title: { it: 'Archi', de: 'Bögen', en: 'Arches', bs: 'Lukovi' },
  },
  {
    id: 'peaks',
    mock: true,
    image: 'presets/peaks',
    title: { it: 'Vette', de: 'Gipfel', en: 'Peaks', bs: 'Vrhovi' },
  },
]
