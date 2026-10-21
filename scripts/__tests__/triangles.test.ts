import { Document } from '@gltf-transform/core'
import { describe, expect, it } from 'vite-plus/test'
import { countTriangles, MODE } from '../lib/triangles.ts'

type Mode = (typeof MODE)[keyof typeof MODE]

/** A document with one mesh of `vertices` indexed vertices, used by `nodes` nodes. */
function documentWith(mode: Mode, vertices: number, nodes = 1): Document {
  const document = new Document()
  const indices = document.createAccessor().setType('SCALAR').setArray(new Uint16Array(vertices))
  const primitive = document.createPrimitive().setMode(mode).setIndices(indices)
  const mesh = document.createMesh().addPrimitive(primitive)
  for (let i = 0; i < nodes; i++) document.createNode().setMesh(mesh)
  return document
}

describe('countTriangles', () => {
  it('counts three indices as one triangle', () => {
    expect(countTriangles(documentWith(MODE.TRIANGLES, 12))).toBe(4)
  })

  it('counts a strip or fan of n vertices as n - 2 triangles', () => {
    expect(countTriangles(documentWith(MODE.TRIANGLE_STRIP, 6))).toBe(4)
    expect(countTriangles(documentWith(MODE.TRIANGLE_FAN, 6))).toBe(4)
  })

  it('counts a mesh once for each node that uses it', () => {
    expect(countTriangles(documentWith(MODE.TRIANGLES, 6, 3))).toBe(6)
  })

  it('counts no triangles for lines and points', () => {
    expect(countTriangles(documentWith(MODE.LINES, 6))).toBe(0)
    expect(countTriangles(documentWith(MODE.POINTS, 6))).toBe(0)
  })
})
