// The print on the wall (Development Plan 4.7, controls 4 to 6). The store keeps the size
// and position that the visitor asked for; these functions fit them to the current wall.
// So when the room gets smaller and then larger again, the print comes back to its size.

import { clamp, roundCm, type WallSize } from './room.ts'

export const FITS = ['cover', 'contain'] as const
/** cover: the image fills the print area and is cut at the sides. contain: all of the image shows. */
export type Fit = (typeof FITS)[number]

/** Metres. `x` and `y` are the offset of the print centre from the wall centre (right, up). */
export interface PrintBox {
  width: number
  height: number
  x: number
  y: number
}

export const PRINT_DIMENSIONS = ['width', 'height'] as const
export type PrintDimension = (typeof PRINT_DIMENSIONS)[number]

/** Smallest print side the inputs accept, metres. */
export const MIN_PRINT_SIDE = 0.1

export interface PrintLimits {
  maxWidth: number
  maxHeight: number
  /** What limits the height: the wall, or the machine (it prints up to 3.80 m). */
  heightLimit: 'wall' | 'machine'
}

export function printLimits(wall: WallSize, machineMaxHeight: number): PrintLimits {
  const machine = machineMaxHeight < wall.height
  return {
    maxWidth: wall.width,
    maxHeight: machine ? machineMaxHeight : wall.height,
    heightLimit: machine ? 'machine' : 'wall',
  }
}

/** A typed print size, rounded to centimetres and kept between MIN_PRINT_SIDE and the limit. */
export function clampPrintSize(
  dimension: PrintDimension,
  metres: number,
  limits: PrintLimits,
): number {
  const max = dimension === 'width' ? limits.maxWidth : limits.maxHeight
  if (!Number.isFinite(metres)) return MIN_PRINT_SIDE
  return clamp(roundCm(metres), MIN_PRINT_SIDE, max)
}

/** The print as it fits on this wall: not larger than the limits, and fully on the wall. */
export function fitPrintToWall(
  print: PrintBox,
  wall: WallSize,
  machineMaxHeight: number,
): PrintBox {
  const limits = printLimits(wall, machineMaxHeight)
  const width = clamp(print.width, MIN_PRINT_SIDE, limits.maxWidth)
  const height = clamp(print.height, MIN_PRINT_SIDE, limits.maxHeight)
  const maxX = (wall.width - width) / 2
  const maxY = (wall.height - height) / 2
  return { width, height, x: clamp(print.x, -maxX, maxX), y: clamp(print.y, -maxY, maxY) }
}

/** Distances that people measure: from the left end of the wall and from the floor, metres. */
export interface PrintEdges {
  left: number
  bottom: number
}

export function edgesOf(print: PrintBox, wall: WallSize): PrintEdges {
  return {
    left: wall.width / 2 + print.x - print.width / 2,
    bottom: wall.height / 2 + print.y - print.height / 2,
  }
}

/** The centre offset for the given edge distances (the inverse of `edgesOf`). */
export function offsetFromEdges(
  edges: PrintEdges,
  size: Pick<PrintBox, 'width' | 'height'>,
  wall: WallSize,
): Pick<PrintBox, 'x' | 'y'> {
  return {
    x: edges.left + size.width / 2 - wall.width / 2,
    y: edges.bottom + size.height / 2 - wall.height / 2,
  }
}

/**
 * The first print size for a new image: 70 % of the wall width with the image's own
 * proportions, but at most 80 % of the allowed height. Centred on the wall.
 */
export function defaultPrint(
  imageAspect: number,
  wall: WallSize,
  machineMaxHeight: number,
): PrintBox {
  const limits = printLimits(wall, machineMaxHeight)
  let width = wall.width * 0.7
  let height = width / imageAspect
  const maxHeight = limits.maxHeight * 0.8
  if (height > maxHeight) {
    height = maxHeight
    width = height * imageAspect
  }
  return {
    width: Math.max(MIN_PRINT_SIDE, roundCm(width)),
    height: Math.max(MIN_PRINT_SIDE, roundCm(height)),
    x: 0,
    y: 0,
  }
}

/** The area that gets ink. With `contain` it is smaller than the print area. */
export function printedRect(
  print: Pick<PrintBox, 'width' | 'height'>,
  imageAspect: number,
  fit: Fit,
): { width: number; height: number } {
  if (fit === 'cover') return { width: print.width, height: print.height }
  const boxAspect = print.width / print.height
  return imageAspect > boxAspect
    ? { width: print.width, height: print.width / imageAspect }
    : { width: print.height * imageAspect, height: print.height }
}

/**
 * Which part of the image shows (texture repeat and offset, 0 to 1). `cover` cuts the
 * image in the middle; `contain` shows all of it, because the printed rectangle has the
 * image's proportions.
 */
export function imageCrop(
  print: Pick<PrintBox, 'width' | 'height'>,
  imageAspect: number,
  fit: Fit,
): { repeat: [x: number, y: number]; offset: [x: number, y: number] } {
  if (fit === 'contain') return { repeat: [1, 1], offset: [0, 0] }
  const boxAspect = print.width / print.height
  if (imageAspect > boxAspect) {
    const x = boxAspect / imageAspect
    return { repeat: [x, 1], offset: [(1 - x) / 2, 0] }
  }
  const y = imageAspect / boxAspect
  return { repeat: [1, y], offset: [0, (1 - y) / 2] }
}
