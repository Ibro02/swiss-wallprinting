import type { Document } from '@gltf-transform/core'

/** glTF primitive modes (glTF 2.0, `mesh.primitives[].mode`). */
export const MODE = {
  POINTS: 0,
  LINES: 1,
  TRIANGLES: 4,
  TRIANGLE_STRIP: 5,
  TRIANGLE_FAN: 6,
} as const

/**
 * Triangles the document draws: each node that uses a mesh adds that mesh's
 * triangles, so a mesh instanced by three nodes counts three times.
 */
export function countTriangles(document: Document): number {
  let total = 0
  for (const node of document.getRoot().listNodes()) {
    const mesh = node.getMesh()
    if (!mesh) continue
    for (const primitive of mesh.listPrimitives()) {
      const vertices =
        primitive.getIndices()?.getCount() ?? primitive.getAttribute('POSITION')?.getCount() ?? 0
      switch (primitive.getMode()) {
        case MODE.TRIANGLES:
          total += vertices / 3
          break
        case MODE.TRIANGLE_STRIP:
        case MODE.TRIANGLE_FAN:
          total += Math.max(0, vertices - 2)
          break
        default:
          break // points and lines draw no triangles
      }
    }
  }
  return total
}
