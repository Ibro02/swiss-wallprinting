// Turns the hero video into AVIF frame sequences for the scroll hero (PrintOnScroll). Needs
// ffmpeg on PATH (`winget install Gyan.FFmpeg`).
//
//   vp run frames "C:\path\to\new video.mp4"   a new video: copied to Assets/Videos/hero.mp4
//                                               (the one before moves to Assets/Videos/old/)
//   vp run frames                               the video already in Assets/Videos/hero.mp4
//
// Writes public/frames/hero/<variant>/0000.avif …, a WebP copy of the first and the last frame
// (the poster's fallback for browsers without AVIF), and src/content/images/frames.ts: the
// frame sets and the printer's track (`heroFocus`). Nothing is measured by hand: the frames
// to show and the track come from the video itself (scripts/lib/hero-video.ts, with tests),
// and the script prints what it found.
//
// Why frames and not the video: a <video> scrubbed with `currentTime` must decode from the
// last keyframe at every seek, so it stutters. Images drawn to a canvas show any frame at
// once, forward and backward.
//
// The video is not in git (Assets/Videos/, see .gitignore): the repo is public.

import { execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import { copyFile, mkdir, readdir, rename, rm, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'
import sharp from 'sharp'
import type { FrameSet } from '../src/content/images/types.ts'
import { chooseFrames, type GrayFrame, meanDifference, printerTrack } from './lib/hero-video.ts'

const run = promisify(execFile)
const root = path.resolve(import.meta.dirname, '..')

const SOURCE = 'Assets/Videos/hero.mp4'
/** Where a replaced video goes, with the date in its name. */
const OLD = 'Assets/Videos/old'
const OUT = 'public/frames/hero'
const MANIFEST = 'src/content/images/frames.ts'
// Lossless frames for the encoder. In the project, not in the system temp folder: its path
// has the user name's "ž" and "ć". OneDrive does not sync node_modules.
const TEMP = 'node_modules/.cache/hero-frames'

/** At most this many frames: about 61 KB each on desktops and 38 KB on phones. */
const MAX_FRAMES = 100
/** Seconds of the video kept before the print starts: the wall under the hero's intro. */
const LEAD_IN_SECONDS = 0.5
/** Width of the gray frames that the analysis compares (the track was calibrated at 320). */
const ANALYSIS_WIDTH = 320

/** libaom effort, 0 … 9. 6 and 8 made files under 2 % smaller and took 3 and 4.5 times as long. */
const AVIF_EFFORT = 4

/** Frames that encode at the same time (each is about 5.5 MB of pixels at 1600 px). */
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

// Sharper since 2026-11-01 (the author): 1280 and 960 px looked soft. The widths stay below
// the video's 1920 px because every decoded frame stays in memory while the hero scrolls
// (1600 px: 5.8 MB each; 1920 px on a phone would be about 830 MB for 100 frames).
const VARIANTS: readonly Variant[] = [
  // About 6.2 MB for all 100 frames (1280 px: 4.5 MB). A laptop at 150 % shows the frame
  // about 2,100 device pixels wide: 1280 px frames were stretched 1.6 times.
  { name: 'desktop', width: 1600, quality: 55, fallbackQuality: 80 },
  // Phones (PrintOnScroll `mobileQuery`): about 3.9 MB (960 px: 2.6 MB). A phone shows only a
  // third of each frame's width, so the frame is stretched about 2.4 times (960 px: 3.2).
  { name: 'mobile', width: 1280, quality: 50, fallbackQuality: 75 },
]

const fail = (...lines: string[]): never => {
  console.error([...lines, `No frames were made; the frames in ${OUT}/ are unchanged.`].join('\n'))
  process.exit(1)
}

// A new video: it becomes Assets/Videos/hero.mp4, and the one before is kept in old/. A path
// is read from where the command was typed (pnpm's INIT_CWD), so a relative one works too.
const [input] = process.argv.slice(2)
const source = path.join(root, SOURCE)
if (input) {
  const video = path.resolve(process.env.INIT_CWD ?? process.cwd(), input)
  if (!existsSync(video)) fail(`${video} was not found. Check the path (put it in quotes).`)
  if (path.relative(video, source) !== '') {
    await mkdir(path.dirname(source), { recursive: true })
    if (existsSync(source)) {
      const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ').replace(':', '-')
      await mkdir(path.join(root, OLD), { recursive: true })
      await rename(source, path.join(root, OLD, `hero ${stamp}.mp4`))
      console.log(`The video before is now ${OLD}/hero ${stamp}.mp4.`)
    }
    await copyFile(video, source)
    console.log(`${video} is now ${SOURCE}.`)
  }
}

if (!existsSync(source)) {
  fail(
    `${SOURCE} was not found. The video is not in git: give its path, for example`,
    '  vp run frames "C:\\Users\\<you>\\Downloads\\new video.mp4"',
  )
}

try {
  await run('ffmpeg', ['-hide_banner', '-version'])
} catch {
  fail(
    'ffmpeg was not found. Install it with `winget install Gyan.FFmpeg`, open a new terminal (so PATH has it), and run the command again.',
  )
}

// The video's size and frame rate.
const probe = JSON.parse(
  (
    await run('ffprobe', [
      '-v',
      'error',
      '-select_streams',
      'v:0',
      '-of',
      'json',
      '-show_entries',
      'stream=width,height,avg_frame_rate',
      source,
    ])
  ).stdout,
) as { streams: { width: number; height: number; avg_frame_rate: string }[] }
const stream = probe.streams[0] ?? fail(`${SOURCE} has no video stream.`)
const [rate = 30, per = 1] = stream.avg_frame_rate.split('/').map(Number)
const fps = rate / per

// Every frame, small and gray, for the analysis.
const analysisHeight = Math.round((ANALYSIS_WIDTH * stream.height) / stream.width / 2) * 2
const { stdout: gray } = await run(
  'ffmpeg',
  [
    '-v',
    'error',
    '-i',
    source,
    '-map',
    '0:v:0',
    '-fps_mode',
    'passthrough',
    '-vf',
    `scale=${ANALYSIS_WIDTH}:${analysisHeight},format=gray`,
    '-f',
    'rawvideo',
    '-',
  ],
  { encoding: 'buffer', maxBuffer: 1 << 30 },
)
const pixels = ANALYSIS_WIDTH * analysisHeight
const grayFrames = Array.from({ length: gray.length / pixels }, (_, index): GrayFrame => ({
  width: ANALYSIS_WIDTH,
  height: analysisHeight,
  data: gray.subarray(index * pixels, (index + 1) * pixels),
}))
const lastGray = grayFrames.at(-1) ?? fail(`ffmpeg read no frames from ${SOURCE}.`)
const steps = grayFrames.map((frame, index) =>
  index === 0 ? 0 : meanDifference(frame, grayFrames[index - 1] ?? frame),
)
const toLast = grayFrames.map((frame) => meanDifference(frame, lastGray))
const chosen = chooseFrames(steps, toLast, {
  leadIn: Math.round(LEAD_IN_SECONDS * fps),
  max: MAX_FRAMES,
})
const heroFocus = printerTrack(chosen.frames.map((index) => grayFrames[index] ?? lastGray))

console.log(
  [
    `${SOURCE}: ${stream.width} × ${stream.height}, ${fps.toFixed(0)} fps, ${grayFrames.length} frames.`,
    `The print: frames ${chosen.start} … ${chosen.end} (before and after it the video hardly changes); the hero shows ${chosen.frames.length} of them, and frame ${grayFrames.length - 1} as the finished picture.`,
    `The printer's track (heroFocus): ${JSON.stringify(heroFocus)}`,
  ].join('\n'),
)
const widest = Math.max(...VARIANTS.map((variant) => variant.width))
if (stream.width < widest) {
  console.warn(
    `Note: the video is ${stream.width} px wide, the desktop frames ${widest} px: they are scaled up and look soft. A video 1920 px wide looks best.`,
  )
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
  // Only the chosen frames, numbered from 0, at the variant's width.
  const select = chosen.frames.map((index) => `eq(n,${index})`).join('+')
  await run('ffmpeg', [
    '-hide_banner',
    '-v',
    'error',
    '-i',
    source,
    '-map',
    '0:v:0',
    '-fps_mode',
    'passthrough',
    '-vf',
    `select='${select}',scale=${variant.width}:-2`,
    '-start_number',
    '0',
    path.join(temp, '%04d.png'),
  ])

  const frames = (await readdir(temp)).filter((file) => file.endsWith('.png')).sort()
  const first = frames[0]
  if (!first || frames.length !== chosen.frames.length) {
    throw new Error(`ffmpeg wrote ${frames.length} frames to ${temp}, not ${chosen.frames.length}`)
  }
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

/**
 * Where the printer is (x, 0 … 1) at progress 0, 0.1, … 1, measured in the frames
 * (scripts/lib/hero-video.ts). A phone shows a third of the width and follows it.
 */
export const heroFocus: number[] = ${JSON.stringify(heroFocus)}
`,
)
console.log(`${MANIFEST} written`)
