// Copies brand files and client photos into the app: `vp run images` (run it after
// a file in Assets/ or in the vault changes). Each client photo goes to
// src/assets/photos/ (static imports, for example the hero) and to public/photos/ with
// an entry in src/content/images/photos.ts (for content files: gallery, about).
// Mock photos are scripts/mockups.ts.

import { copyFile, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import type { ImageAsset } from '../src/content/images/types.ts'
import { icoFromPngs } from './lib/ico.ts'
import { describeImage, writeManifest } from './lib/image-manifest.ts'

const root = path.resolve(import.meta.dirname, '..')

/** The favicon source (the magenta S of the logo); Next.js serves it as /icon.svg. */
const ICON = 'src/app/icon.svg'

const BRAND: readonly (readonly [source: string, target: string])[] = [
  ['Assets/SWP_Logo.svg', 'public/brand/swp-logo.svg'],
  ['Assets/SWP_LogoBlack.svg', 'public/brand/swp-logo-black.svg'],
  ['Assets/SWP_LogoWhite.svg', 'public/brand/swp-logo-white.svg'],
]

interface Photo {
  /** Key in the manifest and file name (`<name>.jpg`; a slash makes a folder). */
  name: string
  source: string
  /** Longest side after resizing. Smaller photos are not enlarged. */
  maxSize: number
  /** Also to src/assets/photos/, for a static import (the about page's tiger). */
  staticImport?: boolean
  /**
   * Crop to this width × height (a project card's 4:3 cover) around the most interesting
   * part (sharp's attention strategy), instead of resizing the whole photo. A phone then
   * decodes the part it shows, not a tall photo of which it shows a slice.
   */
  cover?: readonly [width: number, height: number]
  /** Where a cover crop keeps the picture, when the attention strategy picks the wrong part. */
  position?: 'centre' | 'top' | 'bottom'
  /**
   * With `cover`: cut the full-width band with the cover's ratio this far down the part that
   * is left over (0 the top, 1 the bottom). Both photos of a before/after pair get the same
   * band, so the blank wall and the print stay aligned; the attention strategy would pick a
   * different part in each photo.
   */
  band?: number
}

/**
 * The client's project photos (2026-10-23). The originals are in Assets/Projects/, one
 * folder per project, which git ignores (about 730 MB with the videos): only this machine
 * can run these entries again. The resize drops the metadata (camera, GPS). Not used: the
 * videos, the duplicates "(1)", the photos with people's faces, and the pictures in
 * "Private client, living room" that are not the client's work (other companies' and the
 * printer maker's photos, screenshots); see the prompt log of 2026-10-23.
 */
const project = (folder: string, file: string) => `Assets/Projects/${folder}/${file}`

const PHOTOS: readonly Photo[] = [
  {
    // The client's only work photo on the old site: the printer prints a tiger on a black wall.
    name: 'tiger-mid-print',
    source: 'swiss-wallprinting/Old Website/images/SwissWallPrinting_Ticino.jpeg',
    maxSize: 2560,
    staticImport: true,
  },
  { name: 'projects/monteceneri-wall', source: project('Monteceneri', 'Monteceneri After.jpg') },
  { name: 'projects/monteceneri-detail', source: project('Monteceneri', '20261019_142624.jpg') },
  {
    name: 'projects/holiday-cottage',
    source: project('Holiday cottage', '20261018_215859.jpg'),
  },
  { name: 'projects/milly-torte', source: project('Milly Torte', 'Milly Torte - After.jpg') },
  { name: 'projects/pool-before', source: project('By the pool', '20260911_162150.jpg') },
  { name: 'projects/pool-printing', source: project('By the pool', '20260920_164944.jpg') },
  { name: 'projects/pool-finished', source: project('By the pool', '20260921_160051.jpg') },
  {
    name: 'projects/barber-house',
    source: project('Barber House, Bellinzona', 'Barbershop After.jpg'),
  },
  { name: 'projects/caviezel-history', source: project('Caviezel', '20260504_141327.jpg') },
  { name: 'projects/caviezel-headquarters', source: project('Caviezel', '20260429_134529.jpg') },
  // The project cards' covers: 4:3 crops of the same photos.
  ...(
    [
      ['monteceneri', 'Monteceneri', 'Monteceneri After.jpg'],
      ['holiday-cottage', 'Holiday cottage', '20261018_215859.jpg'],
      // Attention picks the ceiling light here; the middle has the cakes and the logo.
      ['milly-torte', 'Milly Torte', 'Milly Torte - After.jpg', 'centre'],
      ['pool', 'By the pool', '20260921_160051.jpg'],
      ['barber-house', 'Barber House, Bellinzona', 'Barbershop After.jpg'],
      ['caviezel', 'Caviezel', '20260504_141327.jpg'],
    ] as const
  ).map(([id, folder, file, position]: readonly [string, string, string, Photo['position']?]) => ({
    name: `projects/${id}-cover`,
    source: project(folder, file),
    cover: [1200, 900] as const,
    position,
  })),
  // The client's other work (his phone photos, in the "Private client, living room" folder).
  {
    name: 'work/motif-collage',
    source: project('Private client, living room', '20251110_115814.jpg'),
  },
  {
    name: 'work/forest-wall',
    source: project('Private client, living room', '20251110_120819.jpg'),
  },
  {
    name: 'work/lake-at-night',
    source: project('Private client, living room', '20260126_225507.jpg'),
  },
  {
    name: 'work/racing-car',
    source: project('Private client, living room', 'Private homes - After.jpg'),
  },
  {
    name: 'work/office-logo',
    source: project('Private client, living room', '20260824_175623.jpg'),
  },
  // The services page's before/after pairs (the client's "… Before" and "… After" files): a
  // 4:5 band of each, with the print in it. Not used: the "Private client" pair (a dental
  // clinic, the printer maker's picture, not the client's work).
  ...(
    [
      [
        'barber-house',
        'Barber House, Bellinzona',
        'Barbershop Before.jpg',
        'Barbershop After.jpg',
        0.33,
      ],
      ['milly-torte', 'Milly Torte', 'Milly Torte - Before.jpg', 'Milly Torte - After.jpg', 0.08],
      ['monteceneri', 'Monteceneri', 'Monteceneri Before.jpg', 'Monteceneri After.jpg', 0.2],
      [
        'pool',
        'By the pool',
        'Facades and outdoor walls - Before.jpg',
        'Facades and outdoor walls - After.jpg',
        0.8,
      ],
      [
        'living-room',
        'Private client, living room',
        'Private homes - Before.jpg',
        'Private homes - After.jpg',
        0.22,
      ],
    ] as const
  ).flatMap(([id, folder, before, after, band]) =>
    (
      [
        ['before', before],
        ['after', after],
      ] as const
    ).map(([state, file]) => ({
      name: `services/${id}-${state}`,
      source: project(folder, file),
      cover: [1000, 1250] as const,
      band,
    })),
  ),
].map((photo) => ({ maxSize: 2000, ...photo }))

/** The photo upright, or its band (see `Photo.band`). */
async function upright(photo: Photo) {
  const file = path.join(root, photo.source)
  if (!photo.cover || photo.band === undefined) return sharp(file).rotate()
  const [coverWidth, coverHeight] = photo.cover
  const { data, info } = await sharp(file).rotate().raw().toBuffer({ resolveWithObject: true })
  const height = Math.min(info.height, Math.round((info.width * coverHeight) / coverWidth))
  return sharp(data, { raw: info }).extract({
    left: 0,
    top: Math.round((info.height - height) * photo.band),
    width: info.width,
    height,
  })
}

for (const [source, target] of BRAND) {
  await mkdir(path.dirname(path.join(root, target)), { recursive: true })
  await copyFile(path.join(root, source), path.join(root, target))
  console.log(`${target}: copied`)
}

// Raster icons from the SVG: favicon.ico for old browsers and crawlers, and the
// Apple touch icon. Next.js serves both from src/app/ and adds the <link> tags.
const iconPng = (size: number) =>
  sharp(path.join(root, ICON), { density: 600 }).resize(size, size).png().toBuffer()
const ico = icoFromPngs(
  await Promise.all([16, 32, 48].map(async (size) => ({ size, png: await iconPng(size) }))),
)
await writeFile(path.join(root, 'src/app/favicon.ico'), ico)
await writeFile(path.join(root, 'src/app/apple-icon.png'), await iconPng(180))
console.log('src/app/favicon.ico, src/app/apple-icon.png: made from icon.svg')

const manifest: Record<string, ImageAsset> = {}
for (const photo of PHOTOS) {
  const publicFile = path.join(root, `public/photos/${photo.name}.jpg`)
  await mkdir(path.dirname(publicFile), { recursive: true })
  const info = await (
    await upright(photo)
  )
    .resize(
      photo.cover
        ? {
            width: photo.cover[0],
            height: photo.cover[1],
            fit: 'cover',
            position: photo.position ?? sharp.strategy.attention,
          }
        : { width: photo.maxSize, height: photo.maxSize, fit: 'inside', withoutEnlargement: true },
    )
    .jpeg({ quality: 85, mozjpeg: true })
    .toFile(publicFile)
  if (photo.staticImport) {
    const assetFile = path.join(root, `src/assets/photos/${photo.name}.jpg`)
    await mkdir(path.dirname(assetFile), { recursive: true })
    await copyFile(publicFile, assetFile)
  }
  manifest[photo.name] = await describeImage(publicFile, `/photos/${photo.name}.jpg`)
  console.log(
    `${photo.name}.jpg: ${info.width} × ${info.height}, ${(info.size / 1024).toFixed(0)} KB`,
  )
}
await writeManifest(path.join(root, 'src/content/images/photos.ts'), 'photos', 'images', manifest)
console.log('src/content/images/photos.ts written')

// The link preview image (Open Graph, src/features/seo/og.ts): the client's photo of the
// printer at work, darker towards the bottom left, with the colour logo there (the colour
// logo only on a dark ground). No text, so it is right in every language.
const OG = { file: 'public/og/swiss-wall-printing.jpg', width: 1200, height: 630, logoWidth: 420 }
const ogPhoto = PHOTOS[0]
if (ogPhoto) {
  await mkdir(path.dirname(path.join(root, OG.file)), { recursive: true })
  const logo = await sharp(path.join(root, 'Assets/SWP_Logo.svg'), { density: 300 })
    .resize({ width: OG.logoWidth })
    .png()
    .toBuffer()
  const logoHeight = (await sharp(logo).metadata()).height
  const shade = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${OG.width}" height="${OG.height}"><defs><linearGradient id="s" x1="1" y1="0" x2="0" y2="1"><stop offset="0.3" stop-color="#0a0a0a" stop-opacity="0"/><stop offset="1" stop-color="#0a0a0a" stop-opacity="0.88"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#s)"/></svg>`,
  )
  await sharp(path.join(root, ogPhoto.source))
    .rotate()
    .resize(OG.width, OG.height, { fit: 'cover', position: sharp.strategy.attention })
    .composite([
      { input: shade, top: 0, left: 0 },
      { input: logo, left: 64, top: OG.height - 64 - logoHeight },
    ])
    .jpeg({ quality: 85, mozjpeg: true })
    .toFile(path.join(root, OG.file))
  console.log(`${OG.file}: ${OG.width} × ${OG.height}, from ${ogPhoto.name}`)
}
