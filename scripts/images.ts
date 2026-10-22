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
  /** Key in the manifest and file name (`<name>.jpg`). */
  name: string
  source: string
  /** Longest side after resizing. Smaller photos are not enlarged. */
  maxSize: number
}

const PHOTOS: readonly Photo[] = [
  {
    // The client's only work photo: the printer prints a tiger on a black wall.
    name: 'tiger-mid-print',
    source: 'swiss-wallprinting/Old Website/images/SwissWallPrinting_Ticino.jpeg',
    maxSize: 2560,
  },
]

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
  const assetFile = path.join(root, `src/assets/photos/${photo.name}.jpg`)
  const publicFile = path.join(root, `public/photos/${photo.name}.jpg`)
  await mkdir(path.dirname(assetFile), { recursive: true })
  await mkdir(path.dirname(publicFile), { recursive: true })
  const info = await sharp(path.join(root, photo.source))
    .rotate()
    .resize({
      width: photo.maxSize,
      height: photo.maxSize,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({ quality: 85, mozjpeg: true })
    .toFile(assetFile)
  await copyFile(assetFile, publicFile)
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
