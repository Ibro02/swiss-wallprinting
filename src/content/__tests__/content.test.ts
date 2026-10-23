import type { z } from 'zod'
import { describe, expect, it } from 'vite-plus/test'
import { routing } from '../../i18n/routing.ts'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { framePath } from '../../features/home/print-scroll.ts'
import { printFacts as printFactsData } from '../company.ts'
import { heroVideo as heroVideoData } from '../hero-video.ts'
import { images, isMockImage } from '../images/index.ts'
import { collections } from '../index.ts'
import { legal as legalData } from '../legal.ts'
import { findMockItems, mockReport, servedMockFiles } from '../mock-guard.ts'
import {
  applicationArea,
  company,
  contentItem,
  galleryItem,
  heroVideo,
  legalInfo,
  localizedText,
  preset,
  pricing,
  printQuality,
  printFacts,
  project,
  serviceRoom,
  testimonial,
} from '../schema.ts'

// The schema of each collection. A new collection without a schema fails the
// "has a schema" test below.
const SCHEMAS: Record<keyof typeof collections, z.ZodType> = {
  company,
  printFacts,
  testimonials: testimonial,
  applicationAreas: applicationArea,
  services: serviceRoom,
  projects: project,
  gallery: galleryItem,
  legal: legalInfo,
  presets: preset,
  pricing,
  printQuality,
  heroVideo,
}

const publicDir = path.resolve(import.meta.dirname, '../../../public')
const areaIds = new Set(collections.applicationAreas.map((area) => area.id))

describe('content images', () => {
  it('have a file in public/ for every manifest entry', () => {
    for (const [key, image] of Object.entries(images)) {
      expect(existsSync(path.join(publicDir, image.src)), key).toBe(true)
    }
  })

  it('have every hero video frame in public/', () => {
    for (const [variant, frames] of Object.entries(heroVideoData.frames)) {
      for (let index = 0; index < frames.count; index++) {
        const file = framePath(frames.pattern, index)
        expect(existsSync(path.join(publicDir, file)), `${variant} ${file}`).toBe(true)
      }
    }
  })

  it('are mock only in mock items', () => {
    const uses = [
      ...collections.services.flatMap((room) => [
        { id: room.id, mock: room.mock, key: room.before },
        { id: room.id, mock: room.mock, key: room.after },
      ]),
      ...collections.gallery.map((item) => ({ id: item.id, mock: item.mock, key: item.image })),
      ...collections.presets.map((item) => ({ id: item.id, mock: item.mock, key: item.image })),
    ]
    const offenders = uses.filter((use) => isMockImage(use.key) && !use.mock)
    expect(offenders.map((use) => `${use.id} uses ${use.key}`)).toEqual([])
  })

  it('link services and gallery items to existing application areas', () => {
    const links = [
      ...collections.services.map((room) => ({ id: room.id, area: room.area })),
      ...collections.gallery.flatMap((item) =>
        item.area ? [{ id: item.id, area: item.area }] : [],
      ),
    ]
    expect(links.filter((link) => !areaIds.has(link.area))).toEqual([])
  })

  it('link every service room to an existing configurator preset', () => {
    const presetIds = new Set(collections.presets.map((item) => item.id))
    const offenders = collections.services.filter((room) => !presetIds.has(room.preset))
    expect(offenders.map((room) => `${room.id} → ${room.preset}`)).toEqual([])
  })
})

describe('projects', () => {
  it('stay mock while they have no photo, so the launch build stops', () => {
    const offenders = collections.projects.filter((item) => item.photos.length === 0 && !item.mock)
    expect(offenders.map((item) => item.id)).toEqual([])
  })

  it('use only real photos once they have them', () => {
    const offenders = collections.projects.flatMap((item) =>
      item.photos.filter((key) => isMockImage(key)).map((key) => `${item.id} uses ${key}`),
    )
    expect(offenders).toEqual([])
  })
})

describe('legal facts', () => {
  it('stay mock while any fact is missing, so the launch build stops', () => {
    const missing = Object.entries(legalData).filter(([, value]) => value === null)
    expect({ missing: missing.length > 0, mock: legalData.mock }).not.toEqual({
      missing: true,
      mock: false,
    })
  })
})

describe('content files', () => {
  it.each(Object.keys(collections))('%s has a schema', (name) => {
    expect(SCHEMAS).toHaveProperty(name)
  })

  it.each(Object.entries(collections))('%s matches its schema', (name, items) => {
    const schema = SCHEMAS[name as keyof typeof collections]
    for (const item of items) expect(schema.parse(item)).toEqual(item)
  })

  it('has localized text for exactly the routing locales', () => {
    expect(Object.keys(localizedText.shape).sort()).toEqual([...routing.locales].sort())
  })

  it('give every item a unique id within its collection', () => {
    for (const [name, items] of Object.entries(collections)) {
      const ids = items.map((item) => contentItem.parse(item).id)
      expect(new Set(ids).size, name).toBe(ids.length)
    }
  })

  it('keep the 3.80 m machine limit from the old site', () => {
    expect(printFactsData.maxPrintHeightM).toBe(3.8)
  })
})

describe('mock guard', () => {
  const sample = {
    reviews: [
      { id: 'anna', mock: true },
      { id: 'real-client', mock: false },
    ],
    gallery: [{ id: 'hotel-lobby', mock: true }],
  }

  it('finds every item marked mock', () => {
    expect(findMockItems(sample)).toEqual([
      { collection: 'reviews', id: 'anna' },
      { collection: 'gallery', id: 'hotel-lobby' },
    ])
  })

  it('finds no mock items in real content', () => {
    expect(findMockItems({ reviews: [{ id: 'real-client', mock: false }] })).toEqual([])
  })

  it('ignores the credits file but not mock photos', () => {
    expect(servedMockFiles(['CREDITS.md', 'wall-before.jpg'])).toEqual(['wall-before.jpg'])
  })

  it('names each blocker and says what to do', () => {
    const report = mockReport([{ collection: 'reviews', id: 'anna' }], ['wall-before.jpg'])
    expect(report).toContain('reviews / anna')
    expect(report).toContain('public/mock/wall-before.jpg')
    expect(report).toContain('Nothing was built or deployed')
    expect(report).toContain('To fix:')
  })
})
