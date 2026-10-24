import { describe, expect, it } from 'vite-plus/test'
import {
  clampPrintSize,
  defaultPrint,
  edgesOf,
  fitPrintToWall,
  imageCrop,
  MIN_PRINT_SIDE,
  offsetFromEdges,
  printedRect,
  printLimits,
} from '../print.ts'

const MACHINE = 3.8
const wall = { width: 5, height: 2.7 }

describe('printLimits', () => {
  it('limits the height by the wall when the wall is lower than the machine limit', () => {
    expect(printLimits(wall, MACHINE)).toEqual({
      maxWidth: 4.8,
      maxHeight: 2.1,
      heightLimit: 'wall',
    })
  })

  it('leaves 30 cm at the top and the bottom and 10 cm at the sides: a 3 m wall takes 2.40 m', () => {
    expect(printLimits({ width: 4, height: 3 }, MACHINE)).toMatchObject({
      maxWidth: 3.8,
      maxHeight: 2.4,
    })
  })

  it('limits the height by the machine (3.80 m) on a high wall', () => {
    expect(printLimits({ width: 9, height: 6 }, MACHINE)).toEqual({
      maxWidth: 8.8,
      maxHeight: 3.8,
      heightLimit: 'machine',
    })
  })
})

describe('clampPrintSize', () => {
  const limits = printLimits({ width: 9, height: 6 }, MACHINE)

  it('rounds to centimetres and keeps the size in the limits', () => {
    expect(clampPrintSize('width', 2.345, limits)).toBe(2.35)
    expect(clampPrintSize('width', 12, limits)).toBe(8.8)
    expect(clampPrintSize('height', 5, limits)).toBe(3.8)
    expect(clampPrintSize('height', 0, limits)).toBe(MIN_PRINT_SIDE)
    expect(clampPrintSize('height', Number.NaN, limits)).toBe(MIN_PRINT_SIDE)
  })
})

describe('fitPrintToWall', () => {
  it('keeps a print that fits', () => {
    const print = { width: 2, height: 1, x: 0.5, y: -0.2 }
    expect(fitPrintToWall(print, wall, MACHINE)).toEqual(print)
  })

  it('makes a print smaller when the wall is smaller', () => {
    const fitted = fitPrintToWall({ width: 7, height: 3, x: 0, y: 0 }, wall, MACHINE)
    expect(fitted).toEqual({ width: 4.8, height: 2.1, x: 0, y: 0 })
  })

  it('moves a print back onto the wall', () => {
    const fitted = fitPrintToWall({ width: 2, height: 1, x: 3, y: -4 }, wall, MACHINE)
    expect(fitted.x).toBeCloseTo(1.4)
    expect(fitted.y).toBeCloseTo(-0.55)
  })
})

describe('edgesOf and offsetFromEdges', () => {
  it('gives the distance from the left end of the wall and from the floor', () => {
    const edges = edgesOf({ width: 2, height: 1, x: 0, y: 0 }, wall)
    expect(edges.left).toBeCloseTo(1.5)
    expect(edges.bottom).toBeCloseTo(0.85)
  })

  it('turns the edge distances back into the same offset', () => {
    const print = { width: 1.2, height: 0.8, x: -0.7, y: 0.3 }
    const back = offsetFromEdges(edgesOf(print, wall), print, wall)
    expect(back.x).toBeCloseTo(print.x)
    expect(back.y).toBeCloseTo(print.y)
  })
})

describe('defaultPrint', () => {
  it('uses 70 % of the wall width with the image proportions, centred', () => {
    expect(defaultPrint(2, wall, MACHINE)).toEqual({ width: 3.36, height: 1.68, x: 0, y: 0 })
  })

  it('makes a tall image at most 80 % of the allowed height', () => {
    const print = defaultPrint(0.5, wall, MACHINE)
    expect(print.height).toBe(1.68)
    expect(print.width).toBe(0.84)
  })
})

describe('printedRect', () => {
  const box = { width: 4, height: 2 }

  it('prints the whole area with cover', () => {
    expect(printedRect(box, 1, 'cover')).toEqual(box)
  })

  it('prints only the image rectangle with contain', () => {
    expect(printedRect(box, 4, 'contain')).toEqual({ width: 4, height: 1 })
    expect(printedRect(box, 1, 'contain')).toEqual({ width: 2, height: 2 })
  })
})

describe('imageCrop', () => {
  it('cuts the sides of a wide image with cover, in the middle', () => {
    const crop = imageCrop({ width: 2, height: 2 }, 2, 'cover')
    expect(crop.repeat).toEqual([0.5, 1])
    expect(crop.offset).toEqual([0.25, 0])
  })

  it('cuts top and bottom of a tall image with cover', () => {
    const crop = imageCrop({ width: 4, height: 2 }, 1, 'cover')
    expect(crop.repeat).toEqual([1, 0.5])
    expect(crop.offset).toEqual([0, 0.25])
  })

  it('shows all of the image with contain', () => {
    expect(imageCrop({ width: 4, height: 2 }, 1, 'contain')).toEqual({
      repeat: [1, 1],
      offset: [0, 0],
    })
  })
})
