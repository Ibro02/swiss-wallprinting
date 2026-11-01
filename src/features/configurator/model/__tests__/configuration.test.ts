import { describe, expect, it } from 'vite-plus/test'
import {
  applyProductRules,
  DISABLED_ENVIRONMENTS,
  ENVIRONMENTS,
  OUTDOOR_WALL,
  sharedConfigurationOf,
  type StartContent,
  startConfiguration,
} from '../configuration.ts'

const MACHINE = 3.8
const image = (id: string, width: number, height: number) => ({
  id,
  image: { src: `/mock/presets/${id}.jpg`, width, height, blurDataURL: '' },
})

const content: StartContent = {
  presets: [image('cmyk', 2000, 1000), image('peaks', 2000, 1000)],
  rooms: [{ area: 'facade', preset: 'peaks', wall: { widthM: 9, heightM: 6 } }],
  areas: [
    { id: 'office', environment: 'interior' },
    { id: 'facade', environment: 'exterior' },
  ],
  machineMaxHeight: MACHINE,
}

const link = (query: string) => Object.fromEntries(new URLSearchParams(query))

describe('applyProductRules', () => {
  it('keeps a configuration that follows the rules as it is', () => {
    const config = { wall: 'east', fit: 'cover', environment: 'interior', room: 1 } as const
    expect(applyProductRules(config)).toBe(config)
  })

  it('puts an outdoor configuration on the one outdoor wall (with outdoors on)', () => {
    expect(applyProductRules({ wall: 'west', fit: 'cover', environment: 'exterior' }, [])).toEqual({
      wall: OUTDOOR_WALL,
      fit: 'cover',
      environment: 'exterior',
    })
  })

  it('opens an outdoor configuration indoors while outdoors is hidden', () => {
    expect(DISABLED_ENVIRONMENTS).toContain('exterior')
    expect(ENVIRONMENTS).toEqual(['interior'])
    expect(applyProductRules({ wall: 'west', fit: 'cover', environment: 'exterior' })).toEqual({
      wall: 'west',
      fit: 'cover',
      environment: 'interior',
    })
  })

  it('fills the area instead of a turned-off fit (whole image)', () => {
    expect(applyProductRules({ wall: 'east', fit: 'contain', environment: 'interior' }).fit).toBe(
      'cover',
    )
  })
})

describe('sharedConfigurationOf', () => {
  it('corrects a link that breaks the rules', () => {
    const shared = sharedConfigurationOf(
      link('room=5x4x2.7&wall=e&image=lake&print=3x1.5&pos=0x0&fit=contain&env=out'),
      ['lake'],
    )
    // Outdoors is hidden for now (2026-11-01): the link opens indoors, on its own wall.
    expect(shared).toMatchObject({ wall: 'east', fit: 'cover', environment: 'interior' })
  })

  it('gives null for an address without a configuration', () => {
    expect(sharedConfigurationOf(link('area=hotel'), ['lake'])).toBeNull()
  })
})

describe('startConfiguration', () => {
  it('starts with the first preset, the default room, and the north wall', () => {
    const config = startConfiguration({}, content)
    expect(config.image).toMatchObject({ kind: 'preset', id: 'cmyk', aspect: 2 })
    expect(config.room).toEqual({ width: 5, length: 4, height: 2.7 })
    expect(config.wall).toBe('north')
    expect(config.environment).toBe('interior')
    expect(config.print).toEqual({ width: 3.36, height: 1.68, x: 0, y: 0 })
  })

  it('starts with the wall and artwork of the area (?area=)', () => {
    const config = startConfiguration({ area: 'facade' }, content)
    expect(config.image).toMatchObject({ id: 'peaks' })
    expect(config.room).toMatchObject({ width: 9, height: 6 })
    // An outdoor area opens indoors while outdoors is hidden (2026-11-01).
    expect(config).toMatchObject({ wall: 'north', environment: 'interior' })
  })

  it('ignores an unknown area', () => {
    expect(startConfiguration({ area: 'castle' }, content)).toEqual(startConfiguration({}, content))
  })

  it('restores a share link, before the area, and fits the print to the wall', () => {
    const config = startConfiguration(
      { ...link('room=4x3x2.5&wall=w&image=peaks&print=9x1&pos=0x0&fit=contain'), area: 'facade' },
      content,
    )
    // Whole image is off for now (2026-10-31): a link with it fills the area.
    expect(config).toMatchObject({ wall: 'west', fit: 'cover', environment: 'interior' })
    expect(config.image).toMatchObject({ id: 'peaks' })
    // The west wall is as wide as the room is long (3 m), less 10 cm at each side.
    expect(config.print.width).toBe(2.8)
  })

  it('opens an outdoor link indoors on its wall, with the print fitted to it', () => {
    const config = startConfiguration(
      link('room=6x3x2.5&wall=w&image=peaks&print=9x1&pos=0x0&env=out'),
      content,
    )
    expect(config).toMatchObject({ wall: 'west', environment: 'interior' })
    // The west wall is as wide as the room is long (3 m), less 10 cm at each side.
    expect(config.print.width).toBe(2.8)
  })

  it('opens a link to an uploaded image with the first preset', () => {
    const config = startConfiguration(link('room=5x4x2.7&wall=n&print=2x1&pos=0x0'), content)
    expect(config.image).toMatchObject({ id: 'cmyk' })
  })
})
