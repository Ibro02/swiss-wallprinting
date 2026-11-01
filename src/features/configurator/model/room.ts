// The room of the configurator (Development Plan 4.7, proposal P3). The room is built in
// code from these numbers, so it has the exact size the visitor types.
// Axes: x = width (east is +x), z = length (south is +z), y = up. The floor is at y = 0
// and the room centre is at x = 0, z = 0.

export const WALLS = ['north', 'east', 'south', 'west'] as const
export type Wall = (typeof WALLS)[number]

export const ROOM_DIMENSIONS = ['width', 'length', 'height'] as const
export type RoomDimension = (typeof ROOM_DIMENSIONS)[number]

/** Metres. */
export type Room = Record<RoomDimension, number>

/** Metres. The site accepts rooms in this range (Development Plan 4.7). */
export const ROOM_LIMITS: Record<RoomDimension, { min: number; max: number }> = {
  width: { min: 2, max: 30 },
  length: { min: 2, max: 30 },
  height: { min: 2, max: 8 },
}

export const DEFAULT_ROOM: Room = { width: 5, length: 4, height: 2.7 }

/** Rounds to centimetres (the inputs have 0.01 m steps). */
export function roundCm(metres: number): number {
  return Math.round(metres * 100) / 100
}

/**
 * A typed length in metres: "2.5", "2,50" (Italian and German write a comma), " 3 ".
 * Gives null for text that is not a plain positive number.
 */
export function parseMetres(text: string): number | null {
  const normalized = text.trim().replace(',', '.')
  if (!/^\d+(\.\d*)?$|^\.\d+$/.test(normalized)) return null
  return Number(normalized)
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** A typed room size, rounded to centimetres and kept in ROOM_LIMITS. */
export function clampRoomSize(dimension: RoomDimension, metres: number): number {
  const { min, max } = ROOM_LIMITS[dimension]
  if (!Number.isFinite(metres)) return min
  return clamp(roundCm(metres), min, max)
}

export interface WallSize {
  width: number
  height: number
}

/** North and south walls are as wide as the room; east and west are as wide as it is long. */
export function wallSize(room: Room, wall: Wall): WallSize {
  const width = wall === 'north' || wall === 'south' ? room.width : room.length
  return { width, height: room.height }
}

type Vector = readonly [x: number, y: number, z: number]

export interface WallFrame extends WallSize {
  /** Centre of the wall surface. */
  center: Vector
  /** Points into the room. */
  normal: Vector
  /** "Right" for a person in the room who looks at the wall. */
  right: Vector
  /** Turns a plane that faces +z (three.js PlaneGeometry) to face into the room. */
  rotationY: number
}

/** Position and direction of a wall in the scene. */
export function wallFrame(room: Room, wall: Wall): WallFrame {
  const size = wallSize(room, wall)
  const y = room.height / 2
  const halfWidth = room.width / 2
  const halfLength = room.length / 2
  switch (wall) {
    case 'north':
      return {
        ...size,
        center: [0, y, -halfLength],
        normal: [0, 0, 1],
        right: [1, 0, 0],
        rotationY: 0,
      }
    case 'south':
      return {
        ...size,
        center: [0, y, halfLength],
        normal: [0, 0, -1],
        right: [-1, 0, 0],
        rotationY: Math.PI,
      }
    case 'east':
      return {
        ...size,
        center: [halfWidth, y, 0],
        normal: [-1, 0, 0],
        right: [0, 0, 1],
        rotationY: -Math.PI / 2,
      }
    case 'west':
      return {
        ...size,
        center: [-halfWidth, y, 0],
        normal: [1, 0, 0],
        right: [0, 0, -1],
        rotationY: Math.PI / 2,
      }
  }
}

const RIGHT_OF: Record<Wall, Wall> = { north: 'east', east: 'south', south: 'west', west: 'north' }
const LEFT_OF: Record<Wall, Wall> = { north: 'west', east: 'north', south: 'east', west: 'south' }

/**
 * The walls to the left and right of a wall, for a person who looks at it. The window
 * goes on the left one, the door on the right one, so they never cover the print.
 * The left end of the right wall (and the right end of the left wall) touches this wall.
 */
export function neighbours(wall: Wall): { left: Wall; right: Wall } {
  return { left: LEFT_OF[wall], right: RIGHT_OF[wall] }
}

/** The camera shows the wall with this much room around it (1.15 = the wall fills 87 %). */
export const CAMERA_MARGIN = 1.15

export interface CameraView {
  position: Vector
  target: Vector
  /** Distance from the target. */
  distance: number
}

/**
 * The camera position that shows the whole wall, with a margin. The camera can be behind
 * the opposite wall: the walls are one-sided, so a wall seen from behind is invisible.
 */
export function cameraFor(
  room: Room,
  wall: Wall,
  { aspect, fovDeg, margin = CAMERA_MARGIN }: { aspect: number; fovDeg: number; margin?: number },
): CameraView {
  const frame = wallFrame(room, wall)
  const halfFov = (fovDeg * Math.PI) / 360
  const forHeight = frame.height / 2 / Math.tan(halfFov)
  const forWidth = frame.width / 2 / (Math.tan(halfFov) * aspect)
  const distance = Math.max(forHeight, forWidth) * margin
  const [cx, cy, cz] = frame.center
  const [nx, , nz] = frame.normal
  return {
    position: [cx + nx * distance, cy, cz + nz * distance],
    target: frame.center,
    distance,
  }
}
