// Turns the hero video into AVIF frame sequences for the scroll hero (PrintOnScroll):
// `vp run frames` (run it after the video changes). Needs ffmpeg on PATH
// (`winget install Gyan.FFmpeg`). Writes public/frames/hero/<variant>/0000.avif …, a WebP copy
// of the first and the last frame (the poster's fallback for browsers without AVIF), and the
// manifest src/content/images/frames.ts.
//
// Why frames and not the video: a <video> scrubbed with `currentTime` must decode from the
// last keyframe at every seek, so it stutters. Images drawn to a canvas show any frame at
// once, forward and backward.
//
// The video is not in git (Assets/Videos/, see .gitignore): put the file there first.
//
// Only frames that differ go out (`VIDEO`): a frame that repeats the one before it, or a
// still end, costs bytes and scroll length and shows nothing. For a new video, list how much
// each frame differs from the one before it (PowerShell; 0.00 is a copy):
//   ffmpeg -i Assets/Videos/<file>.mp4 -vf "scale=480:-2,format=gray,tblend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-" -f null -
// A 0.00 at every 5th frame is 24 fps stretched to 30 (`repeatEvery: 5`); the frame before
// a long run of 0.00 at the end is `lastFrame`.

import { execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, readdir, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'
import sharp from 'sharp'
import type { FrameSet } from '../src/content/images/types.ts'

const run = promisify(execFile)
const root = path.resolve(import.meta.dirname, '..')

const SOURCE = 'Assets/Videos/SWP_PrintVideo.mp4'
const OUT = 'public/frames/hero'
const MANIFEST = 'src/content/images/frames.ts'
// Lossless frames for the encoder. In the project, not in the system temp folder: its path
// has the user name's "ž" and "ć". OneDrive does not sync node_modules.
const TEMP = 'node_modules/.cache/hero-frames'

/** Facts of SWP_PrintVideo.mp4 (1920 × 1080, 30 fps, 180 frames, 2026-11-01). */
const VIDEO = {
  /** The finished picture; frames 125 … 179 do not change. */
  lastFrame: 124,
  /** Every 5th frame repeats the one before it (24 fps stretched to 30); 0: no repeats. */
  repeatEvery: 5,
}

/** libaom effort, 0 … 9. 6 and 8 made files under 2 % smaller and took 3 and 4.5 times as long. */
const AVIF_EFFORT = 4

/** Frames that encode at the same time (each is about 3.5 MB of pixels at 1280 px). */
const PARALLEL = 4

interface Variant {
  /** Folder under public/frames/hero/ and key in the manifest. */
  name: 'desktop' | 'mobile'
  /** Output width; the height keeps the video's proportions. */
  width: number
  /** AVIF quality, 0 … 100. */
  quality: number
  /** WebP quality of the poster fallback (the first and the last frame), 0 … 100. */
  fallbackQuality: number
}

const VARIANTS: readonly Variant[] = [
  // About 4.5 MB for all 100 frames. Quality 55 looks like the WebP q80 of the old frames
  // (about 6.7 MB), measured on a detail of the last frame at 100 % (2026-11-01).
  { name: 'desktop', width: 1280, quality: 55, fallbackQuality: 80 },
  // Phones (PrintOnScroll `mobileQuery`): about 2.5 MB. A phone shows only a narrow slice of
  // each frame, so a smaller width soon looks soft.
  { name: 'mobile', width: 960, quality: 50, fallbackQuality: 75 },
]

if (!existsSync(path.join(root, SOURCE))) {
  console.error(
    [
      `${SOURCE} was not found, so no frames were made. The frames in ${OUT}/ are unchanged.`,
      'The video is not in git: copy it to Assets/Videos/ (or change SOURCE in scripts/frames.ts), then run `vp run frames` again.',
    ].join('\n'),
  )
  process.exit(1)
}

try {
  await run('ffmpeg', ['-hide_banner', '-version'])
} catch {
  console.error(
    [
      `ffmpeg was not found, so no frames were made. The frames in ${OUT}/ are unchanged.`,
      'Install it with `winget install Gyan.FFmpeg`, open a new terminal (so PATH has it), and run `vp run frames` again.',
    ].join('\n'),
  )
  process.exit(1)
}

/** The ffmpeg filter: the frames up to the finished picture, without repeats, scaled. */
function filter(width: number) {
  return [
    `trim=end_frame=${VIDEO.lastFrame + 1}`,
    ...(VIDEO.repeatEvery ? [`decimate=cycle=${VIDEO.repeatEvery}`] : []),
    `scale=${width}:-2`,
  ].join(',')
}

const frameName = (index: number, extension: string) =>
  `${String(index).padStart(4, '0')}.${extension}`

await rm(path.join(root, OUT), { recursive: true, force: true })

const manifest: Partial<Record<Variant['name'], FrameSet>> = {}
for (const variant of VARIANTS) {
  const temp = path.join(root, TEMP, variant.name)
  const dir = path.join(root, OUT, variant.name)
  await rm(temp, { recursive: true, force: true })
  await mkdir(temp, { recursive: true })
  await mkdir(dir, { recursive: true })
  await run('ffmpeg', [
    '-hide_banner',
    '-v',
    'error',
    '-i',
    path.join(root, SOURCE),
    '-map',
    '0:v:0',
    '-fps_mode',
    'passthrough',
    '-vf',
    filter(variant.width),
    '-start_number',
    '0',
    path.join(temp, '%04d.png'),
  ])

  const frames = (await readdir(temp)).filter((file) => file.endsWith('.png')).sort()
  const first = frames[0]
  if (!first) throw new Error(`ffmpeg wrote no frames to ${temp}`)
  const { width, height } = await sharp(path.join(temp, first)).metadata()

  const queue = frames.map((_, index) => index)
  const encode = async () => {
    for (let index = queue.shift(); index !== undefined; index = queue.shift()) {
      await sharp(path.join(temp, frameName(index, 'png')))
        .avif({ quality: variant.quality, effort: AVIF_EFFORT })
        .toFile(path.join(dir, frameName(index, 'avif')))
    }
  }
  await Promise.all(Array.from({ length: PARALLEL }, encode))
  for (const index of [0, frames.length - 1]) {
    await sharp(path.join(temp, frameName(index, 'png')))
      .webp({ quality: variant.fallbackQuality, effort: 6 })
      .toFile(path.join(dir, frameName(index, 'webp')))
  }
  await rm(temp, { recursive: true, force: true })

  const sizes = await Promise.all(
    frames.map(async (_, index) => (await stat(path.join(dir, frameName(index, 'avif')))).size),
  )
  const megabytes = sizes.reduce((sum, size) => sum + size, 0) / 1024 / 1024
  const poster = (sizes[0] ?? 0) / 1024
  manifest[variant.name] = {
    pattern: `/frames/hero/${variant.name}/%04d.avif`,
    fallback: `/frames/hero/${variant.name}/%04d.webp`,
    count: frames.length,
    width,
    height,
  }
  console.log(
    `${OUT}/${variant.name}: ${frames.length} frames, ${width} × ${height}, ${megabytes.toFixed(1)} MB AVIF (poster ${poster.toFixed(0)} KB)`,
  )
}
await rm(path.join(root, TEMP), { recursive: true, force: true })

await writeFile(
  path.join(root, MANIFEST),
  `// GENERATED by \`vp run frames\`. Do not edit by hand.

import type { FrameSet } from './types.ts'

export const heroFrames = ${JSON.stringify(manifest, null, 2)} as const satisfies Record<'desktop' | 'mobile', FrameSet>
`,
)
console.log(`${MANIFEST} written`)
