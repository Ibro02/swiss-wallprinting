// MOCK: the first wall of the configurator for `?area=` (from the home page's application
// areas and the services page). The wall sizes are examples and the artworks are the mock
// presets (src/content/presets.ts); replace them with the client's real presets.

import type { AreaStart } from './schema.ts'

export const areaStarts: readonly AreaStart[] = [
  { id: 'office', mock: true, area: 'office', wall: { widthM: 5.2, heightM: 2.7 }, preset: 'cmyk' },
  { id: 'hotel', mock: true, area: 'hotel', wall: { widthM: 6.4, heightM: 2.8 }, preset: 'lake' },
  {
    id: 'restaurant',
    mock: true,
    area: 'restaurant',
    wall: { widthM: 4.6, heightM: 2.6 },
    preset: 'lemons',
  },
  {
    id: 'school',
    mock: true,
    area: 'school',
    wall: { widthM: 7.0, heightM: 3.0 },
    preset: 'space',
  },
  { id: 'home', mock: true, area: 'home', wall: { widthM: 3.6, heightM: 2.6 }, preset: 'arches' },
  {
    id: 'facade',
    mock: true,
    area: 'facade',
    wall: { widthM: 9.0, heightM: 3.8 },
    preset: 'peaks',
  },
]
