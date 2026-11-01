import { describe, expect, it } from 'vite-plus/test'
import {
  choseFallback,
  coarseCount,
  decodeWindow,
  focusAt,
  focusTrack,
  frameAt,
  framePath,
  imageType,
  loadOrder,
  nearestLoaded,
  overlayProgress,
  playTowards,
  scrollProgress,
  smoothTowards,
} from '../print-scroll.ts'

describe('framePath', () => {
  it('pads the index like ffmpeg', () => {
    expect(framePath('/frames/hero/desktop/%04d.webp', 7)).toBe('/frames/hero/desktop/0007.webp')
    expect(framePath('/f/%03d.webp', 120)).toBe('/f/120.webp')
  })
})

describe('imageType', () => {
  it('reads the media type from the extension of a path or a URL', () => {
    expect(imageType('/frames/hero/desktop/%04d.avif')).toBe('image/avif')
    expect(imageType('http://localhost:3001/frames/hero/mobile/0099.WEBP')).toBe('image/webp')
  })

  it('knows no type without a known extension', () => {
    expect(imageType('/frames/hero/desktop/0000')).toBeUndefined()
    expect(imageType('/frames/hero/desktop/0000.gif')).toBeUndefined()
  })
})

describe('choseFallback', () => {
  const frames = {
    pattern: '/frames/hero/desktop/%04d.avif',
    fallback: '/frames/hero/desktop/%04d.webp',
  }

  it('is true when the poster shows the fallback format', () => {
    expect(choseFallback('https://x.ch/frames/hero/mobile/0000.webp', frames)).toBe(true)
  })

  it('is false when the poster shows the frames format', () => {
    expect(choseFallback('https://x.ch/frames/hero/desktop/0000.avif', frames)).toBe(false)
  })

  it('is false before the browser has chosen, or without a fallback', () => {
    expect(choseFallback('', frames)).toBe(false)
    expect(choseFallback('https://x.ch/0000.webp', { pattern: '/f/%04d.webp' })).toBe(false)
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

  it('moves at least at the minimum speed near the end, in both directions', () => {
    // The easing alone would cover 12 % of 0.01 in one frame; 0.5 per second is 0.0083.
    expect(smoothTowards(0.5, 0.51, 0.12, 1000 / 60, 0.5)).toBeCloseTo(0.5 + 0.5 / 60, 6)
    expect(smoothTowards(0.51, 0.5, 0.12, 1000 / 60, 0.5)).toBeCloseTo(0.51 - 0.5 / 60, 6)
  })

  it('keeps the easing where it is faster, and never passes the target', () => {
    expect(smoothTowards(0, 1, 0.2, 1000 / 60, 0.5)).toBeCloseTo(0.2)
    expect(smoothTowards(0.5, 0.505, 0.12, 1000 / 60, 0.5)).toBe(0.505)
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

describe('coarseCount', () => {
  it('counts every step-th frame and the last one, which loadOrder puts first', () => {
    for (const [count, step] of [
      [121, 8],
      [100, 8],
      [61, 4],
      [9, 8],
    ] as const) {
      const coarse = loadOrder(count).slice(0, coarseCount(count, step))
      const expected = new Set(
        Array.from({ length: count }, (_, index) => index).filter(
          (index) => index % step === 0 || index === count - 1,
        ),
      )
      expect(new Set(coarse), `${count}/${step}`).toEqual(expected)
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

describe('focusTrack', () => {
  it('is a plain number for one point', () => {
    expect(focusTrack([0.4])).toBe('0.4')
    expect(focusTrack([])).toBe('0.5')
  })

  it('moves in a straight line between two points', () => {
    expect(focusTrack([0.2, 0.75])).toBe('calc(0.2 + 0.55 * clamp(0, var(--p) * 1 - 0, 1))')
  })

  it('adds one segment per step, each over its share of the progress', () => {
    expect(focusTrack([0.2, 0.3, 0.25])).toBe(
      'calc(0.2 + 0.1 * clamp(0, var(--p) * 2 - 0, 1) + -0.05 * clamp(0, var(--p) * 2 - 1, 1))',
    )
  })

  it('rounds the steps, so no float noise reaches the CSS', () => {
    expect(focusTrack([0.205, 0.256])).toContain('0.051 *')
  })
})

describe('focusAt', () => {
  /** The CSS of focusTrack, worked out for one progress: `first + rise * clamp(0, p * s - i, 1) …`. */
  const cssFocus = (points: number[], progress: number) => {
    const css = focusTrack(points)
    const first = Number(/^calc\(([-\d.]+)/.exec(css)?.[1])
    const terms = css.matchAll(/([-\d.]+) \* clamp\(0, var\(--p\) \* (\d+) - (\d+), 1\)/g)
    return [...terms].reduce(
      (sum, [, rise, segments, index]) =>
        sum + Number(rise) * Math.min(1, Math.max(0, progress * Number(segments) - Number(index))),
      first,
    )
  }

  it('is the point itself for one point', () => {
    expect(focusAt([0.4], 0.7)).toBe(0.4)
    expect(focusAt([], 0.7)).toBe(0.5)
  })

  it('moves in straight lines between the points, and stays on the ends', () => {
    expect(focusAt([0.2, 0.6, 1], 0.25)).toBeCloseTo(0.4)
    expect(focusAt([0.2, 0.6, 1], 0.5)).toBeCloseTo(0.6)
    expect(focusAt([0.2, 0.6, 1], -0.1)).toBe(0.2)
    expect(focusAt([0.2, 0.6, 1], 1.2)).toBe(1)
  })

  it('gives the point of the CSS expression (focusTrack), before and after hydration', () => {
    const points = [0.256, 0.306, 0.374, 0.459, 0.54, 0.628, 0.709, 0.787, 0.878, 0.511, 0.511]
    for (const progress of [0, 0.03, 0.1, 0.37, 0.5, 0.88, 0.93, 1]) {
      expect(focusAt(points, progress), `progress ${progress}`).toBeCloseTo(
        cssFocus(points, progress),
        4,
      )
    }
  })
})

describe('overlayProgress', () => {
  const phases = { introOut: 0.1, outroIn: 0.88 }

  it('follows the progress while the intro or the outro moves', () => {
    expect(overlayProgress(0, phases)).toBe(0)
    expect(overlayProgress(0.05, phases)).toBe(0.05)
    expect(overlayProgress(0.92, phases)).toBe(0.92)
    expect(overlayProgress(1, phases)).toBe(1)
  })

  it('stands still between them, where no overlay changes', () => {
    for (const progress of [0.1, 0.11, 0.5, 0.87, 0.88]) {
      expect(overlayProgress(progress, phases), `progress ${progress}`).toBe(
        progress === 0.88 ? 0.88 : 0.1,
      )
    }
  })
})

describe('decodeWindow', () => {
  it('keeps the frame asked for and its neighbours, two ahead for each one behind', () => {
    expect(decodeWindow(100, 50, 60, 7)).toEqual([50, 51, 52, 49, 53, 54, 48])
  })

  it('looks backwards when the scroll goes back', () => {
    expect(decodeWindow(100, 50, 40, 4)).toEqual([50, 49, 48, 51])
  })

  it('looks forwards at rest', () => {
    expect(decodeWindow(100, 50, 50, 3)).toEqual([50, 51, 52])
  })

  it('takes more from the other side at the ends of the video', () => {
    expect(decodeWindow(100, 98, 99, 5)).toEqual([98, 99, 97, 96, 95])
    expect(new Set(decodeWindow(10, 0, 0, 20))).toEqual(
      new Set(Array.from({ length: 10 }, (_, i) => i)),
    )
  })
})

describe('playTowards', () => {
  it('plays on at the speed of playSeconds when the scroll is behind', () => {
    // 2 s for the whole print: one 60 Hz frame is 1/120 of it.
    expect(playTowards(0.3, 0.1, 0.12, 1000 / 60, 2)).toBeCloseTo(0.3 + 1 / 120, 6)
  })

  it('follows a scroll that is ahead, as fast as smoothTowards', () => {
    expect(playTowards(0.1, 0.9, 0.12, 1000 / 60, 2)).toBeCloseTo(
      smoothTowards(0.1, 0.9, 0.12, 1000 / 60),
    )
  })

  it('stops at the end', () => {
    expect(playTowards(0.999, 0.5, 0.12, 1000 / 60, 2)).toBe(1)
  })
})
