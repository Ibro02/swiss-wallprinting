import { describe, expect, it } from 'vite-plus/test'
import {
  chooseFrames,
  distinctFrames,
  type GrayFrame,
  meanDifference,
  printerTrack,
  printSpan,
  sampleEvenly,
} from '../lib/hero-video.ts'

const WHITE = 230
const INK = 60

/**
 * A 100 × 50 wall: the picture fills columns 20 … 79 of the top rows up to `printed`, the
 * printer is 4 columns wide from `mast`, and an armchair stands low on the left.
 */
function wall({
  printed,
  mast,
  armchair,
}: {
  printed: number
  mast?: number
  armchair?: boolean
}): GrayFrame {
  const width = 100
  const height = 50
  const data = new Uint8Array(width * height).fill(WHITE)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = y * width + x
      if (y < 30 && x >= 20 && x < Math.min(80, printed)) data[index] = INK
      if (mast !== undefined && x >= mast && x < mast + 4) data[index] = 140
      if (armchair && y >= 35 && x >= 5 && x < 25) data[index] = 20
    }
  }
  return { width, height, data }
}

describe('meanDifference', () => {
  it('is 0 for equal frames and the mean gray step otherwise', () => {
    const blank = wall({ printed: 0 })
    expect(meanDifference(blank, blank)).toBe(0)
    // 60 columns × 30 rows of 170 levels, over 5000 pixels.
    expect(meanDifference(blank, wall({ printed: 100 }))).toBeCloseTo((60 * 30 * 170) / 5000)
  })
})

describe('distinctFrames', () => {
  it('drops every 5th frame of a video stretched from 24 to 30 fps', () => {
    const steps = Array.from({ length: 21 }, (_, index) => (index % 5 === 1 ? 0.1 : 2))
    expect(distinctFrames(steps)).toEqual([
      0, 2, 3, 4, 5, 7, 8, 9, 10, 12, 13, 14, 15, 17, 18, 19, 20,
    ])
  })

  it('keeps small steps that are like their neighbours, and drops exact copies', () => {
    expect(distinctFrames([0, 0.08, 0.06, 0.1, 0.09, 0.01, 0.07])).toEqual([0, 1, 2, 3, 4, 6])
  })
})

describe('printSpan', () => {
  // Still for 10 frames, then 20 frames of print towards the finished picture, then still.
  const toLast = Array.from({ length: 40 }, (_, index) =>
    index < 10 ? 20 : index < 30 ? 20 - (index - 9) : 0.2,
  )

  it('starts the lead-in before the print and ends where the picture is finished', () => {
    expect(printSpan(toLast, 3)).toEqual({ start: 7, end: 29 })
  })

  it('never starts before the first frame', () => {
    expect(printSpan(toLast, 30).start).toBe(0)
  })
})

describe('sampleEvenly', () => {
  it('keeps all frames up to the limit', () => {
    expect(sampleEvenly([3, 4, 5], 5)).toEqual([3, 4, 5])
  })

  it('takes even steps with the first and the last frame', () => {
    expect(sampleEvenly([0, 1, 2, 3, 4, 5, 6, 7, 8], 5)).toEqual([0, 2, 4, 6, 8])
  })
})

describe('chooseFrames', () => {
  it('ends with the video’s last frame, the finished picture', () => {
    const toLast = [10, 10, 8, 5, 2, 0.3, 0.2, 0.1, 0]
    const steps = [0, 0, 2, 3, 3, 1.7, 0.1, 0.1, 0.1]
    const { frames, end } = chooseFrames(steps, toLast, { leadIn: 0, max: 100 })
    expect(end).toBe(5)
    expect(frames.at(-1)).toBe(8)
    expect(frames).not.toContain(5)
  })

  it('keeps at most `max` frames', () => {
    const toLast = Array.from({ length: 300 }, (_, index) => 300 - index)
    const steps = toLast.map(() => 1)
    expect(chooseFrames(steps, toLast, { leadIn: 0, max: 100 }).frames).toHaveLength(100)
  })
})

describe('printerTrack', () => {
  // The print grows from column 20 to 80; then the printer stands right of it and goes.
  const printing = [20, 30, 40, 50, 60, 70, 80].map((at) => wall({ printed: at, mast: at }))
  const after = [
    wall({ printed: 100, mast: 88 }),
    wall({ printed: 100 }),
    wall({ printed: 100, armchair: true }),
  ]
  const frames = [...printing, ...after]

  it('follows the edge of the print, plus the head offset', () => {
    const track = printerTrack(frames, frames.length)
    expect(track.slice(0, 7)).toEqual([0.215, 0.315, 0.415, 0.515, 0.615, 0.715, 0.815])
  })

  it('follows the printer right of the finished picture', () => {
    expect(printerTrack(frames, frames.length)[7]).toBe(0.895)
  })

  it('turns to the middle of the picture once the printer has gone', () => {
    expect(printerTrack(frames, frames.length).slice(8)).toEqual([0.5, 0.5])
  })

  it('ignores furniture that appears below the wall band', () => {
    const late = [
      wall({ printed: 20 }),
      wall({ printed: 50, mast: 50 }),
      wall({ printed: 100, armchair: true }),
    ]
    expect(printerTrack(late, 3)[1]).toBe(0.515)
  })
})
