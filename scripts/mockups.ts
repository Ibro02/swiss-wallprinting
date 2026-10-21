// Makes the MOCK photos (Development Plan 6.3): `vp run mockups`.
// A blank wall ("before") from the 3D model textures, and the same wall with an original
// artwork multiplied into the plaster ("after"), so it looks printed, not stuck on.
// Writes public/mock/**.jpg, public/mock/CREDITS.md, and src/content/images/mock.ts.
// The production build stops while public/mock/ has these files: replace them with the
// client's real photos.

import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp, { type OverlayOptions } from 'sharp'
import { ARTWORKS, type ArtworkName } from './lib/artworks.ts'
import { describeImage, writeManifest } from './lib/image-manifest.ts'
import type { ImageAsset } from '../src/content/images/types.ts'

const root = path.resolve(import.meta.dirname, '..')
const OUT = path.join(root, 'public/mock')

const TEXTURES = {
  plaster: 'Assets/3D_Models/office/textures/beige_wall_001_baseColor.jpeg',
  laminate: 'Assets/3D_Models/office/textures/laminate_floor_02_baseColor.jpeg',
} as const

/** Fractions of the image. */
interface Box {
  x: number
  y: number
  w: number
  h: number
}

interface Scene {
  /** Output name under public/mock/, without "-before.jpg" / "-after.jpg". */
  key: string
  width: number
  height: number
  wall: { texture: keyof typeof TEXTURES; tint: string }
  /** With a tint, the texture is a grey grain in that colour (pavement); without, its own colours (floor). */
  ground: { texture: keyof typeof TEXTURES; ratio: number; tint?: string }
  sky?: { ratio: number }
  art: ArtworkName
  artBox: Box
  /** Also write the blank wall (for the before/after cards). */
  before: boolean
}

const LANDSCAPE = { width: 1600, height: 1000 }
const PORTRAIT = { width: 1000, height: 1300 }
const FLOOR = { texture: 'laminate', ratio: 0.18 } as const

const SCENES: readonly Scene[] = [
  {
    key: 'services/office',
    ...LANDSCAPE,
    wall: { texture: 'plaster', tint: '#ecebe7' },
    ground: FLOOR,
    art: 'cmyk',
    artBox: { x: 0.14, y: 0.1, w: 0.72, h: 0.52 },
    before: true,
  },
  {
    key: 'services/hotel',
    ...LANDSCAPE,
    wall: { texture: 'plaster', tint: '#efe5d8' },
    ground: FLOOR,
    art: 'lake',
    artBox: { x: 0.08, y: 0.1, w: 0.84, h: 0.54 },
    before: true,
  },
  {
    key: 'services/restaurant',
    ...LANDSCAPE,
    wall: { texture: 'plaster', tint: '#f0e2cc' },
    ground: FLOOR,
    art: 'lemons',
    artBox: { x: 0.12, y: 0.08, w: 0.76, h: 0.58 },
    before: true,
  },
  {
    key: 'services/school',
    ...LANDSCAPE,
    wall: { texture: 'plaster', tint: '#e4ebe6' },
    ground: FLOOR,
    art: 'space',
    artBox: { x: 0.18, y: 0.1, w: 0.64, h: 0.56 },
    before: true,
  },
  {
    key: 'services/home',
    ...LANDSCAPE,
    wall: { texture: 'plaster', tint: '#f3ebe2' },
    ground: FLOOR,
    art: 'arches',
    artBox: { x: 0.26, y: 0.1, w: 0.48, h: 0.62 },
    before: true,
  },
  {
    key: 'services/facade',
    ...LANDSCAPE,
    // Outdoor render: the plaster grain in a warm stone colour; pavement in grey.
    wall: { texture: 'plaster', tint: '#ebe1d1' },
    ground: { texture: 'plaster', ratio: 0.12, tint: '#8f8b84' },
    sky: { ratio: 0.2 },
    art: 'peaks',
    artBox: { x: 0.12, y: 0.25, w: 0.76, h: 0.58 },
    before: true,
  },
  {
    key: 'gallery/hotel-corridor',
    ...PORTRAIT,
    wall: { texture: 'plaster', tint: '#e9e2d6' },
    ground: { texture: 'laminate', ratio: 0.16 },
    art: 'lake',
    artBox: { x: 0.1, y: 0.12, w: 0.8, h: 0.56 },
    before: false,
  },
  {
    key: 'gallery/kitchen-lemons',
    ...PORTRAIT,
    wall: { texture: 'plaster', tint: '#f3eadb' },
    ground: { texture: 'laminate', ratio: 0.16 },
    art: 'lemons',
    artBox: { x: 0.12, y: 0.1, w: 0.76, h: 0.62 },
    before: false,
  },
  {
    key: 'gallery/kids-room',
    ...PORTRAIT,
    wall: { texture: 'plaster', tint: '#e6eef0' },
    ground: { texture: 'laminate', ratio: 0.16 },
    art: 'space',
    artBox: { x: 0.14, y: 0.14, w: 0.72, h: 0.5 },
    before: false,
  },
]

function rgb(hex: string) {
  const value = Number.parseInt(hex.slice(1), 16)
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 }
}

/** A textured area: the texture tiled, lightened to a subtle grain, then tinted. */
async function surface(
  texture: keyof typeof TEXTURES,
  width: number,
  height: number,
  tint: string,
  tile: { w: number; h: number },
  grain: number,
) {
  const base = await sharp(path.join(root, TEXTURES[texture]))
    .resize(tile.w, tile.h)
    .greyscale()
    .linear(grain, 255 * (1 - grain) - 12)
    .toColourspace('srgb')
    .png()
    .toBuffer()
  const tinted = await sharp(base)
    .composite([
      {
        input: { create: { width: tile.w, height: tile.h, channels: 3, background: rgb(tint) } },
        blend: 'multiply',
      },
    ])
    .png()
    .toBuffer()
  return sharp({ create: { width, height, channels: 3, background: rgb(tint) } })
    .composite([{ input: tinted, tile: true }])
    .png()
    .toBuffer()
}

/** The floor or pavement in its own colours, squashed a little for perspective. */
async function ground(texture: keyof typeof TEXTURES, width: number, height: number) {
  // A tile may not be taller than the area it repeats in.
  const tile = await sharp(path.join(root, TEXTURES[texture]))
    .resize(420, Math.min(150, height))
    .linear(0.92, -6)
    .png()
    .toBuffer()
  return sharp({ create: { width, height, channels: 3, background: { r: 120, g: 100, b: 80 } } })
    .composite([{ input: tile, tile: true }])
    .png()
    .toBuffer()
}

/** Window light from the top left, darker corners, and the shadow where wall meets floor. */
function lighting(width: number, height: number, floorTop: number) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs>
      <radialGradient id="light" cx="0.18" cy="0.05" r="1.15">
        <stop offset="0" stop-color="#ffffff" stop-opacity="0.22"/>
        <stop offset="0.45" stop-color="#ffffff" stop-opacity="0"/>
        <stop offset="1" stop-color="#000000" stop-opacity="0.26"/>
      </radialGradient>
      <linearGradient id="contact" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stop-color="#000000" stop-opacity="0.22"/>
        <stop offset="1" stop-color="#000000" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="floorShade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#000000" stop-opacity="0.35"/>
        <stop offset="1" stop-color="#000000" stop-opacity="0.05"/>
      </linearGradient>
    </defs>
    <rect y="${floorTop - 46}" width="${width}" height="46" fill="url(#contact)"/>
    <rect y="${floorTop}" width="${width}" height="${height - floorTop}" fill="url(#floorShade)"/>
    <rect y="${floorTop - 14}" width="${width}" height="14" fill="#f5f2ec"/>
    <rect y="${floorTop - 15}" width="${width}" height="2" fill="#000000" fill-opacity="0.12"/>
    <rect width="${width}" height="${height}" fill="url(#light)"/>
  </svg>`)
}

function sky(width: number, height: number) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9cc8e6"/><stop offset="1" stop-color="#dcecf5"/></linearGradient></defs>
    <rect width="${width}" height="${height}" fill="url(#sky)"/>
    <rect y="${height - 10}" width="${width}" height="10" fill="#cfc8bd"/>
  </svg>`)
}

async function render(scene: Scene, withArt: boolean): Promise<Buffer> {
  const { width, height } = scene
  const skyHeight = Math.round(height * (scene.sky?.ratio ?? 0))
  const floorTop = Math.round(height * (1 - scene.ground.ratio))
  const wallHeight = floorTop - skyHeight
  const layers: OverlayOptions[] = [
    {
      input: await surface(
        scene.wall.texture,
        width,
        wallHeight,
        scene.wall.tint,
        { w: 420, h: 420 },
        0.5,
      ),
      top: skyHeight,
      left: 0,
    },
  ]
  if (withArt) {
    const box = scene.artBox
    const w = Math.round(width * box.w)
    const h = Math.round(height * box.h)
    const art = await sharp(Buffer.from(ARTWORKS[scene.art]()), { density: 144 })
      .resize(w, h, { fit: 'cover' })
      .png()
      .toBuffer()
    // Multiply: the plaster grain and the light show through the ink, as in a real print.
    layers.push({
      input: art,
      top: Math.round(height * box.y),
      left: Math.round(width * box.x),
      blend: 'multiply',
    })
  }
  if (scene.sky) layers.push({ input: sky(width, skyHeight), top: 0, left: 0 })
  const groundHeight = height - floorTop
  const groundLayer = scene.ground.tint
    ? await surface(
        scene.ground.texture,
        width,
        groundHeight,
        scene.ground.tint,
        { w: 300, h: Math.min(300, groundHeight) },
        0.6,
      )
    : await ground(scene.ground.texture, width, groundHeight)
  layers.push({ input: groundLayer, top: floorTop, left: 0 })
  layers.push({ input: lighting(width, height, floorTop), top: 0, left: 0 })

  return sharp({ create: { width, height, channels: 3, background: rgb(scene.wall.tint) } })
    .composite(layers)
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer()
}

await rm(OUT, { recursive: true, force: true })
const manifest: Record<string, ImageAsset> = {}
const credits: string[] = []

for (const scene of SCENES) {
  const variants = scene.before ? (['before', 'after'] as const) : (['after'] as const)
  for (const variant of variants) {
    const name = `${scene.key}-${variant}`
    const file = path.join(OUT, `${name}.jpg`)
    await mkdir(path.dirname(file), { recursive: true })
    await writeFile(file, await render(scene, variant === 'after'))
    manifest[name] = await describeImage(file, `/mock/${name}.jpg`)
    credits.push(
      `| \`${name}.jpg\` | Generated by \`scripts/mockups.ts\`${variant === 'after' ? ` (artwork "${scene.art}")` : ''} | Agent, with textures from "Room Blank" by Denkon and "Walls Window Door" by stylo0 (Sketchfab) | Sketchfab Standard (textures); artwork original |`,
    )
    console.log(`public/mock/${name}.jpg: ${manifest[name]?.width} × ${manifest[name]?.height}`)
  }
}

// The print images of the configurator presets: each artwork alone, with its own
// proportions. 2048 px wide = the high-tier texture size (budget.ts).
const PRESET_WIDTH = 2048
for (const art of Object.keys(ARTWORKS) as ArtworkName[]) {
  const name = `presets/${art}`
  const file = path.join(OUT, `${name}.jpg`)
  await mkdir(path.dirname(file), { recursive: true })
  const image = await sharp(Buffer.from(ARTWORKS[art]()), { density: 144 })
    .resize(PRESET_WIDTH)
    // Transparent parts of the artwork are bare wall: white ink leaves the wall as it is.
    .flatten({ background: '#ffffff' })
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer()
  await writeFile(file, image)
  manifest[name] = await describeImage(file, `/mock/${name}.jpg`)
  credits.push(
    `| \`${name}.jpg\` | Generated by \`scripts/mockups.ts\` (artwork "${art}") | Agent | Original |`,
  )
  console.log(`public/mock/${name}.jpg: ${manifest[name]?.width} × ${manifest[name]?.height}`)
}

await writeFile(
  path.join(OUT, 'CREDITS.md'),
  `# Mock photo credits

Placeholder photos until the client sends real ones. Each file here must have a row. The production build (\`SITE_ENV=production\`) fails while any file other than this one is in \`public/mock/\`. Regenerate with \`vp run mockups\`.

| File | Source | Author | Licence |
|---|---|---|---|
${credits.join('\n')}
`,
)
await writeManifest(
  path.join(root, 'src/content/images/mock.ts'),
  'mockImages',
  'mockups',
  manifest,
)
console.log('src/content/images/mock.ts and public/mock/CREDITS.md written')
