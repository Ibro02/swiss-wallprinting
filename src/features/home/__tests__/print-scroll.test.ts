import { describe, expect, it } from 'vite-plus/test'
import {
  frameAt,
  framePath,
  loadOrder,
  nearestLoaded,
  scrollProgress,
  smoothTowards,
} from '../print-scroll.ts'

describe('framePath', () => {
  it('pads the index like ffmpeg', () => {
    expect(framePath('/frames/hero/desktop/%04d.webp', 7)).toBe('/frames/hero/desktop/0007.webp')
    expect(framePath('/f/%03d.webp', 120)).toBe('/f/120.webp')
  })
})

describe('scrollProgress', () => {
  const range = { start: 12, distance: 1000 }

  it('is 0 before the stage sticks and 1 after it lets go', () => {
    expect(scrollProgress(0, range)).toBe(0)
    expect(scrollProgress(12, range)).toBe(0)
    expect(scrollProgress(512, range)).toBe(0.5)
    expect(scrollProgress(5000, range)).toBe(1)
  })

  it('does not divide by zero when the section is no taller than the stage', () => {
    expect(scrollProgress(0, { start: 12, distance: 0 })).toBe(0)
    expect(scrollProgress(20, { start: 12, distance: 0 })).toBe(1)
  })
})

describe('frameAt', () => {
  it('maps 0 to the first frame and 1 to the last', () => {
    expect(frameAt(0, 121)).toBe(0)
    expect(frameAt(0.5, 121)).toBe(60)
    expect(frameAt(1, 121)).toBe(120)
  })
})

describe('smoothTowards', () => {
  it('covers the smoothing share of the distance in one 60 Hz frame', () => {
    expect(smoothTowards(0, 1, 0.2, 1000 / 60)).toBeCloseTo(0.2)
  })

  it('moves the same in two 120 Hz frames as in one 60 Hz frame', () => {
    const half = 1000 / 120
    expect(smoothTowards(smoothTowards(0, 1, 0.2, half), 1, 0.2, half)).toBeCloseTo(0.2)
  })

  it('follows backwards (scrolling up)', () => {
    expect(smoothTowards(1, 0, 0.5, 1000 / 60)).toBeCloseTo(0.5)
  })

  it('snaps when it is close, so the loop can stop', () => {
    expect(smoothTowards(0.99995, 1, 0.1, 16)).toBe(1)
  })

  it('jumps with smoothing 1', () => {
    expect(smoothTowards(0, 0.7, 1, 16)).toBe(0.7)
  })
})

describe('loadOrder', () => {
  it('loads the first and the last frame first, then the middle', () => {
    expect(loadOrder(121).slice(0, 3)).toEqual([0, 120, 64])
  })

  it('lists every frame exactly once', () => {
    for (const count of [1, 2, 3, 61, 121, 128, 129]) {
      const order = loadOrder(count)
      expect(order, `count ${count}`).toHaveLength(count)
      expect(new Set(order).size, `count ${count}`).toBe(count)
      expect(Math.max(...order), `count ${count}`).toBe(count - 1)
    }
  })
})

describe('nearestLoaded', () => {
  const loaded = Array.from<string | undefined>({ length: 10 })
  loaded[2] = 'a'
  loaded[6] = 'b'

  it('returns the wanted frame when it is loaded', () => {
    expect(nearestLoaded(loaded, 6)).toBe(6)
  })

  it('falls back to the nearest loaded frame, the earlier one on a tie', () => {
    expect(nearestLoaded(loaded, 5)).toBe(6)
    expect(nearestLoaded(loaded, 4)).toBe(2)
    expect(nearestLoaded(loaded, 9)).toBe(6)
  })

  it('returns -1 when nothing is loaded yet', () => {
    expect(nearestLoaded(Array.from({ length: 10 }), 4)).toBe(-1)
  })
})
