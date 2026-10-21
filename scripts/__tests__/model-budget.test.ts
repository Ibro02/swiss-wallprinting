import { existsSync } from 'node:fs'
import path from 'node:path'
import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import { MeshoptDecoder } from 'meshoptimizer'
import { beforeAll, describe, expect, it } from 'vite-plus/test'
import {
  QUALITY_TIERS,
  TEXTURE_SIZE,
  TRIANGLE_BUDGET,
} from '../../src/features/configurator/model/budget.ts'
import { MODELS, outputPath } from '../lib/models.ts'
import { countTriangles } from '../lib/triangles.ts'

const root = path.resolve(import.meta.dirname, '../..')
let io: NodeIO

beforeAll(async () => {
  await MeshoptDecoder.ready
  io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({ 'meshopt.decoder': MeshoptDecoder })
})

describe.each(QUALITY_TIERS)('optimized models, %s tier', (tier) => {
  const files = MODELS.map((model) => path.join(root, outputPath(model, tier)))

  it('exist (run `pnpm models` if this fails)', () => {
    for (const file of files) expect(existsSync(file), file).toBe(true)
  })

  it(`draw at most ${TRIANGLE_BUDGET[tier]} triangles together`, async () => {
    let total = 0
    for (const file of files) total += countTriangles(await io.read(file))
    expect(total).toBeLessThanOrEqual(TRIANGLE_BUDGET[tier])
  })

  it(`have no texture larger than ${TEXTURE_SIZE[tier]} px`, async () => {
    for (const file of files) {
      for (const texture of (await io.read(file)).getRoot().listTextures()) {
        const [width = 0, height = 0] = texture.getSize() ?? []
        expect(Math.max(width, height), `${file}: ${texture.getName()}`).toBeLessThanOrEqual(
          TEXTURE_SIZE[tier],
        )
      }
    }
  })
})
