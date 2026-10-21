// Makes the optimized 3D models: `pnpm models` (run it after a model in Assets/ changes).
// For each source model and quality tier it writes public/models/<name>-<tier>.glb with
// WebP textures (resized to the tier limit) and meshopt-compressed geometry.

import { mkdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { type Document, type Node, NodeIO } from '@gltf-transform/core'
import {
  ALL_EXTENSIONS,
  KHRMaterialsSpecular,
  KHRMaterialsTransmission,
} from '@gltf-transform/extensions'
import { dedup, meshopt, prune, textureCompress, weld } from '@gltf-transform/functions'
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer'
import sharp from 'sharp'
import { QUALITY_TIERS, TEXTURE_SIZE } from '../src/features/configurator/model/budget.ts'
import { MODELS, outputPath } from './lib/models.ts'
import { countTriangles } from './lib/triangles.ts'

// Extensions removed in the low tier. Transmission (glass) makes three.js render the
// scene a second time; specular adds one more texture per material.
const LOW_TIER_DROPPED = new Set<string>([
  KHRMaterialsTransmission.EXTENSION_NAME,
  KHRMaterialsSpecular.EXTENSION_NAME,
])

const root = path.resolve(import.meta.dirname, '..')

// The configurator walls use this plaster. The source colour is a dark beige; wall prints
// go on light walls, so the pipeline keeps only its relief (grain) on a warm white.
const PLASTER = { material: 'beige_wall_001', tint: '#f3f0ea', grain: 0.42 } as const

async function lightenPlaster(document: Document) {
  const material = document
    .getRoot()
    .listMaterials()
    .find((candidate) => candidate.getName() === PLASTER.material)
  const texture = material?.getBaseColorTexture()
  const image = texture?.getImage()
  // No plaster in this model (the props model): nothing to do.
  if (!texture || !image) return
  const { width, height } = await sharp(image).metadata()
  const grain = await sharp(image)
    .greyscale()
    .linear(PLASTER.grain, 255 * (1 - PLASTER.grain))
    .toColourspace('srgb')
    .png()
    .toBuffer()
  const tinted = await sharp(grain)
    .composite([
      {
        input: { create: { width, height, channels: 3, background: PLASTER.tint } },
        blend: 'multiply',
      },
    ])
    .png()
    .toBuffer()
  texture.setImage(new Uint8Array(tinted)).setMimeType('image/png')
}

/** Removes every node that is not in `keep`, not inside one, and not a parent of one. */
function keepOnly(document: Document, keep: readonly string[]) {
  const kept = (node: Node) => keep.includes(node.getName())
  const insideKept = (node: Node) => {
    for (let current: Node | null = node; current; current = current.getParentNode()) {
      if (kept(current)) return true
    }
    return false
  }
  const holdsKept = (node: Node): boolean => kept(node) || node.listChildren().some(holdsKept)
  for (const node of document.getRoot().listNodes()) {
    if (!insideKept(node) && !holdsKept(node)) node.dispose()
  }
}

await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready])
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.decoder': MeshoptDecoder,
  'meshopt.encoder': MeshoptEncoder,
})

await mkdir(path.join(root, 'public/models'), { recursive: true })

for (const model of MODELS) {
  for (const tier of QUALITY_TIERS) {
    const document = await io.read(path.join(root, model.source))

    if (tier === 'low') {
      for (const extension of document.getRoot().listExtensionsUsed()) {
        if (LOW_TIER_DROPPED.has(extension.extensionName)) extension.dispose()
      }
    }

    if (model.keep) keepOnly(document, model.keep)
    await lightenPlaster(document)

    const size = TEXTURE_SIZE[tier]
    await document.transform(
      dedup(),
      prune(),
      weld(),
      textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [size, size] }),
      meshopt({ encoder: MeshoptEncoder, level: 'medium' }),
    )

    const target = path.join(root, outputPath(model, tier))
    await io.write(target, document)
    const { size: bytes } = await stat(target)
    console.log(
      `${outputPath(model, tier)}: ${(bytes / 1024).toFixed(0)} KB, ` +
        `${countTriangles(document)} triangles, textures ≤ ${size} px`,
    )
  }
}
