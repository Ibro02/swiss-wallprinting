import { describe, expect, it } from 'vite-plus/test'
import { printResolution } from '../resolution.ts'
import { fromSearchParams, type SharedConfig, toSearchParams } from '../share.ts'

const PRESETS = ['cmyk', 'lake']

const config: SharedConfig = {
  room: { width: 5, length: 4.25, height: 2.7 },
  wall: 'east',
  preset: 'lake',
  print: { width: 3.5, height: 1.5, x: 0.2, y: -0.15 },
  fit: 'contain',
  environment: 'exterior',
}

const asRecord = (params: URLSearchParams) => Object.fromEntries(params.entries())

describe('share link', () => {
  it('writes a short, readable address', () => {
    expect(toSearchParams(config).toString()).toBe(
      'room=5x4.25x2.7&wall=e&image=lake&print=3.5x1.5&pos=0.2x-0.15&fit=contain&env=out',
    )
  })

  it('leaves out the defaults (cover, indoors) and an uploaded image', () => {
    const params = toSearchParams({
      ...config,
      preset: undefined,
      fit: 'cover',
      environment: 'interior',
    })
    expect(params.has('image')).toBe(false)
    expect(params.has('fit')).toBe(false)
    expect(params.has('env')).toBe(false)
  })

  it('reads back the same configuration', () => {
    expect(fromSearchParams(asRecord(toSearchParams(config)), PRESETS)).toEqual(config)
  })

  it('keeps sizes from a changed link in the limits', () => {
    const shared = fromSearchParams({ room: '50x1x9', wall: 'n', print: '0x2' }, PRESETS)
    expect(shared?.room).toEqual({ width: 30, length: 2, height: 8 })
    expect(shared?.print.width).toBe(0.1)
  })

  it('ignores an unknown preset, fit, or environment', () => {
    const shared = fromSearchParams(
      { room: '5x4x2.7', wall: 'n', print: '2x1', image: 'secret', fit: 'stretch', env: 'moon' },
      PRESETS,
    )
    expect(shared).toMatchObject({ preset: undefined, fit: 'cover', environment: 'interior' })
  })

  it('gives null for an address without a complete configuration', () => {
    expect(fromSearchParams({}, PRESETS)).toBeNull()
    expect(fromSearchParams({ area: 'hotel' }, PRESETS)).toBeNull()
    expect(fromSearchParams({ room: '5x4', wall: 'n', print: '2x1' }, PRESETS)).toBeNull()
    expect(fromSearchParams({ room: '5x4x2.7', wall: 'up', print: '2x1' }, PRESETS)).toBeNull()
    expect(fromSearchParams({ room: '5x4x-2', wall: 'n', print: '2x1' }, PRESETS)).toBeNull()
  })

  it('uses the first value when a parameter repeats', () => {
    const shared = fromSearchParams(
      { room: ['5x4x2.7', '9x9x9'], wall: 'n', print: '2x1' },
      PRESETS,
    )
    expect(shared?.room.width).toBe(5)
  })
})

describe('printResolution', () => {
  it('is sharp with enough pixels per centimetre', () => {
    const check = printResolution(
      { width: 6000, height: 3000 },
      { width: 2, height: 1 },
      [1, 1],
      20,
    )
    expect(check.pxPerCm).toBe(30)
    expect(check.sharp).toBe(true)
    expect(check.maxSharp).toEqual({ width: 2, height: 1 })
  })

  it('warns and gives the largest sharp size for a small image', () => {
    const check = printResolution({ width: 1000, height: 500 }, { width: 2, height: 1 }, [1, 1], 20)
    expect(check.pxPerCm).toBe(5)
    expect(check.sharp).toBe(false)
    expect(check.maxSharp).toEqual({ width: 0.5, height: 0.25 })
  })

  it('counts only the part of the image that is printed (cover cuts it)', () => {
    const check = printResolution(
      { width: 4000, height: 1000 },
      { width: 1, height: 1 },
      [0.25, 1],
      10,
    )
    expect(check.pxPerCm).toBe(10)
    expect(check.sharp).toBe(true)
  })
})
