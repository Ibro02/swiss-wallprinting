// Source models in Assets/ and the files the pipeline writes to public/models/.
// Licences: Assets/3D_Models/*/license.txt (Sketchfab Standard). The site credits the
// authors on the imprint page (src/content/credits.ts).

import type { QualityTier } from '../../src/features/configurator/model/budget.ts'

export interface ModelSource {
  name: string
  source: string
  /** Keep only these nodes (with their parents and children); the rest is removed. */
  keep?: readonly string[]
}

export const MODELS: readonly ModelSource[] = [
  {
    // The configurator builds the room in code; it uses the plaster (walls), the laminate
    // (floor), and one window frame from this model.
    name: 'room',
    source: 'Assets/3D_Models/office/scene.gltf',
    keep: ['Room_0', 'Floor_3', 'Window1.001_7'],
  },
  {
    // The configurator uses only the door (the wall pieces are built in code).
    name: 'props',
    source: 'Assets/3D_Models/wall/scene.gltf',
    keep: ['door_12'],
  },
]

/** Path of an optimized model, relative to the repo root. */
export function outputPath(model: ModelSource, tier: QualityTier): string {
  return `public/models/${model.name}-${tier}.glb`
}
