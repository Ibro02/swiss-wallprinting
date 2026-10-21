// The share link (proposal P7): the configuration in the address, so the visitor can send
// it, keep it, or come back to it. An uploaded image is not in the link (it never leaves
// the device); the link then opens with the first preset.
//   ?room=5x4x2.7&wall=n&image=lake&print=3.5x1.5&pos=0.2x-0.1&fit=contain&env=out

import { FITS, type Fit, MIN_PRINT_SIDE, type PrintBox } from './print.ts'
import type { Environment } from './price.ts'
import { clampRoomSize, roundCm, type Room, type Wall, WALLS } from './room.ts'

export interface SharedConfig {
  room: Room
  wall: Wall
  /** Preset id; undefined when the visitor had uploaded an image. */
  preset: string | undefined
  /** As typed; the page fits it to the wall. */
  print: PrintBox
  fit: Fit
  environment: Environment
}

const WALL_CODE: Record<Wall, string> = { north: 'n', east: 'e', south: 's', west: 'w' }

const number = (value: number) => String(roundCm(value))

export function toSearchParams(config: SharedConfig): URLSearchParams {
  const params = new URLSearchParams()
  params.set(
    'room',
    [config.room.width, config.room.length, config.room.height].map(number).join('x'),
  )
  params.set('wall', WALL_CODE[config.wall])
  if (config.preset) params.set('image', config.preset)
  params.set('print', `${number(config.print.width)}x${number(config.print.height)}`)
  params.set('pos', `${number(config.print.x)}x${number(config.print.y)}`)
  if (config.fit !== 'cover') params.set('fit', config.fit)
  if (config.environment !== 'interior') params.set('env', 'out')
  return params
}

type SearchParams = Record<string, string | string[] | undefined>

function first(params: SearchParams, name: string): string | undefined {
  const value = params[name]
  return Array.isArray(value) ? value[0] : value
}

/** "5x4x2.7" → [5, 4, 2.7]; undefined when a part is not a number. */
function numbers(text: string | undefined, count: number, signed = false): number[] | undefined {
  const parts = text?.split('x') ?? []
  if (parts.length !== count) return undefined
  const pattern = signed ? /^-?\d+(\.\d+)?$/ : /^\d+(\.\d+)?$/
  if (!parts.every((part) => pattern.test(part))) return undefined
  return parts.map(Number)
}

/**
 * The configuration from a share link, with every value checked and kept in the limits.
 * Null when the address has no complete configuration (then `?area=` or the defaults apply).
 */
export function fromSearchParams(
  params: SearchParams,
  presetIds: readonly string[],
): SharedConfig | null {
  const room = numbers(first(params, 'room'), 3)
  const size = numbers(first(params, 'print'), 2)
  const wall = WALLS.find((candidate) => WALL_CODE[candidate] === first(params, 'wall'))
  if (!room || !size || !wall) return null
  const [width = 0, length = 0, height = 0] = room
  const [printWidth = 0, printHeight = 0] = size
  const [x = 0, y = 0] = numbers(first(params, 'pos'), 2, true) ?? []
  const image = first(params, 'image')
  const fit = FITS.find((candidate) => candidate === first(params, 'fit')) ?? 'cover'

  return {
    room: {
      width: clampRoomSize('width', width),
      length: clampRoomSize('length', length),
      height: clampRoomSize('height', height),
    },
    wall,
    preset: image && presetIds.includes(image) ? image : undefined,
    print: {
      width: Math.max(MIN_PRINT_SIDE, roundCm(printWidth)),
      height: Math.max(MIN_PRINT_SIDE, roundCm(printHeight)),
      x: roundCm(x),
      y: roundCm(y),
    },
    fit,
    environment: first(params, 'env') === 'out' ? 'exterior' : 'interior',
  }
}
