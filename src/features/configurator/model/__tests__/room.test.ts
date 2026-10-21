import { describe, expect, it } from 'vite-plus/test'
import {
  cameraFor,
  clampRoomSize,
  neighbours,
  parseMetres,
  roundCm,
  wallFrame,
  wallSize,
  WALLS,
} from '../room.ts'

const room = { width: 6, length: 4, height: 2.7 }

describe('parseMetres', () => {
  it('reads a point or a comma as the decimal mark', () => {
    expect(parseMetres('2.5')).toBe(2.5)
    expect(parseMetres('2,50')).toBe(2.5)
    expect(parseMetres(' 3 ')).toBe(3)
    expect(parseMetres('4.')).toBe(4)
    expect(parseMetres(',5')).toBe(0.5)
  })

  it('refuses text that is not a plain positive number', () => {
    expect(parseMetres('')).toBeNull()
    expect(parseMetres('-2')).toBeNull()
    expect(parseMetres('2 m')).toBeNull()
    expect(parseMetres('1e3')).toBeNull()
    expect(parseMetres("1'200")).toBeNull()
  })
})

describe('clampRoomSize', () => {
  it('rounds to centimetres', () => {
    expect(clampRoomSize('width', 4.236)).toBe(4.24)
    expect(roundCm(2.005)).toBeCloseTo(2.01, 2)
  })

  it('keeps the size in the limits (2 to 30 m, height 2 to 8 m)', () => {
    expect(clampRoomSize('width', 1)).toBe(2)
    expect(clampRoomSize('length', 45)).toBe(30)
    expect(clampRoomSize('height', 9)).toBe(8)
  })

  it('gives the minimum for an empty or broken value', () => {
    expect(clampRoomSize('height', Number.NaN)).toBe(2)
  })
})

describe('wallSize', () => {
  it('uses the room width for north and south, the length for east and west', () => {
    expect(wallSize(room, 'north')).toEqual({ width: 6, height: 2.7 })
    expect(wallSize(room, 'south')).toEqual({ width: 6, height: 2.7 })
    expect(wallSize(room, 'east')).toEqual({ width: 4, height: 2.7 })
    expect(wallSize(room, 'west')).toEqual({ width: 4, height: 2.7 })
  })
})

describe('wallFrame', () => {
  it('puts each wall on the room boundary, half way up', () => {
    expect(wallFrame(room, 'north').center).toEqual([0, 1.35, -2])
    expect(wallFrame(room, 'south').center).toEqual([0, 1.35, 2])
    expect(wallFrame(room, 'east').center).toEqual([3, 1.35, 0])
    expect(wallFrame(room, 'west').center).toEqual([-3, 1.35, 0])
  })

  it('has a normal that points to the room centre', () => {
    for (const wall of WALLS) {
      const { center, normal } = wallFrame(room, wall)
      const towardCentre = -(center[0] * normal[0] + center[2] * normal[2])
      expect(towardCentre).toBeGreaterThan(0)
    }
  })

  it('turns a +z plane so that it faces along the normal, with "right" to the right', () => {
    for (const wall of WALLS) {
      const { rotationY, normal, right } = wallFrame(room, wall)
      // Rotation about y: (0, 0, 1) → (sin, 0, cos); (1, 0, 0) → (cos, 0, -sin).
      expect(Math.sin(rotationY)).toBeCloseTo(normal[0])
      expect(Math.cos(rotationY)).toBeCloseTo(normal[2])
      expect(Math.cos(rotationY)).toBeCloseTo(right[0])
      expect(-Math.sin(rotationY)).toBeCloseTo(right[2])
    }
  })
})

describe('neighbours', () => {
  // A point on a wall: `along` metres from its centre in its "right" direction.
  const pointOn = (wall: (typeof WALLS)[number], along: number) => {
    const { center, right } = wallFrame(room, wall)
    return [center[0] + right[0] * along, center[2] + right[2] * along]
  }

  it('gives the walls whose ends touch this wall, on the correct side', () => {
    for (const wall of WALLS) {
      const { left, right } = neighbours(wall)
      const self = wallFrame(room, wall)
      // The right end of this wall is the left end of its right neighbour.
      expect(pointOn(right, -wallFrame(room, right).width / 2)).toEqual(
        pointOn(wall, self.width / 2).map((value) => expect.closeTo(value)),
      )
      expect(pointOn(left, wallFrame(room, left).width / 2)).toEqual(
        pointOn(wall, -self.width / 2).map((value) => expect.closeTo(value)),
      )
    }
  })
})

describe('cameraFor', () => {
  it('looks at the wall centre from inside the room direction', () => {
    const view = cameraFor(room, 'north', { aspect: 1.6, fovDeg: 50 })
    expect(view.target).toEqual([0, 1.35, -2])
    expect(view.position[0]).toBe(0)
    expect(view.position[2]).toBeGreaterThan(-2)
  })

  it('moves back far enough for the wider of the two sides', () => {
    const halfFov = (50 * Math.PI) / 360
    const wide = cameraFor(room, 'north', { aspect: 1, fovDeg: 50, margin: 1 })
    expect(wide.distance).toBeCloseTo(3 / Math.tan(halfFov))
    const tall = cameraFor({ width: 2, length: 4, height: 8 }, 'north', {
      aspect: 2,
      fovDeg: 50,
      margin: 1,
    })
    expect(tall.distance).toBeCloseTo(4 / Math.tan(halfFov))
  })
})
