// The pure parts of the scroll hero (PrintOnScroll): which frame the scroll asks for, how
// the shown frame follows it, the order in which the frames load, and which of them stay
// decoded.

/** The URL of one frame: `%04d` in the pattern becomes the zero-padded index (as in ffmpeg). */
export function framePath(pattern: string, index: number): string {
  return pattern.replace(/%0(\d+)d/, (_, digits: string) =>
    String(index).padStart(Number(digits), '0'),
  )
}

const IMAGE_TYPES: Readonly<Record<string, string>> = {
  avif: 'image/avif',
  webp: 'image/webp',
  jpg: 'image/jpeg',
  png: 'image/png',
}

/** The media type of an image path or URL, from its extension (a <source>'s `type`). */
export function imageType(path: string): string | undefined {
  const extension = /\.(\w+)$/.exec(path)?.[1]?.toLowerCase()
  return extension ? IMAGE_TYPES[extension] : undefined
}

/**
 * Whether the browser chose the poster's fallback (`currentSrc`) over the frames' own
 * format: then it cannot decode the frames (AVIF before Safari 16, for example).
 */
export function choseFallback(
  currentSrc: string,
  frames: { pattern: string; fallback?: string },
): boolean {
  if (!frames.fallback || !currentSrc) return false
  const shown = imageType(currentSrc)
  return shown === imageType(frames.fallback) && shown !== imageType(frames.pattern)
}

/** Where the sticky stage scrolls, in px of `window.scrollY`. */
export interface ScrollRange {
  /** The scroll position at which the stage starts to stick: progress 0. */
  start: number
  /** The scroll distance from progress 0 to progress 1. */
  distance: number
}

/** How far the visitor has scrolled through the section, from 0 to 1. */
export function scrollProgress(scrollY: number, range: ScrollRange): number {
  if (range.distance <= 0) return scrollY >= range.start ? 1 : 0
  return Math.min(1, Math.max(0, (scrollY - range.start) / range.distance))
}

/** The frame index for a progress. */
export function frameAt(progress: number, count: number): number {
  return Math.round(progress * (count - 1))
}

const FRAME_MS = 1000 / 60
/** Closer than this, the shown progress snaps to the scroll (well under one frame of 100). */
const SETTLED = 0.0002

/**
 * One step of the shown progress towards the scroll position. `smoothing` is the share of
 * the remaining distance covered in one 60 Hz frame (1 = no smoothing). The step is scaled
 * by the real frame time, so the motion feels the same on 60 Hz and 120 Hz screens, and
 * after a long frame it catches up instead of lagging. `minSpeed` (progress per second) is
 * the slowest it moves: the easing alone crawls over the last frames before it stops.
 */
export function smoothTowards(
  current: number,
  target: number,
  smoothing: number,
  elapsedMs: number,
  minSpeed = 0,
): number {
  const share = Math.min(1, Math.max(0.01, smoothing))
  const elapsed = Math.min(elapsedMs, 100)
  const k = 1 - (1 - share) ** (elapsed / FRAME_MS)
  const distance = target - current
  const step = Math.max(Math.abs(distance) * k, (minSpeed * elapsed) / 1000)
  if (step >= Math.abs(distance)) return target
  const next = current + Math.sign(distance) * step
  return Math.abs(target - next) < SETTLED ? target : next
}

/**
 * One step of the picture while the print plays (PrintOnScroll, after a scroll forwards):
 * on at the speed of `playSeconds` for the whole print, or faster where the scroll is ahead
 * (followed as in smoothTowards), never backwards, and never past the end.
 */
export function playTowards(
  current: number,
  scrolled: number,
  smoothing: number,
  elapsedMs: number,
  playSeconds: number,
): number {
  const played = current + Math.min(elapsedMs, 100) / 1000 / playSeconds
  return Math.min(1, Math.max(played, smoothTowards(current, scrolled, smoothing, elapsedMs)))
}

/**
 * The order in which to load the frames: the first and the last, then every 64th, 32nd, …,
 * so a coarse version of the whole video is there early and the gaps fill in. A visitor
 * who scrolls fast sees nearby frames, never a jump back to the start.
 */
export function loadOrder(count: number): number[] {
  const order: number[] = []
  const queued = new Set<number>()
  const add = (index: number) => {
    if (queued.has(index)) return
    queued.add(index)
    order.push(index)
  }
  add(0)
  add(count - 1)
  for (let step = 2 ** Math.ceil(Math.log2(Math.max(count - 1, 1))); step >= 1; step /= 2) {
    for (let index = 0; index < count; index += step) add(index)
  }
  return order
}

/**
 * How many entries at the start of `loadOrder(count)` make the coarse set: every `step`-th
 * frame and the last one. They come first in that order, so loading this many gives a frame
 * near every scroll position for a fraction of the bytes.
 */
export function coarseCount(count: number, step: number): number {
  const multiples = Math.floor((count - 1) / step) + 1
  return (count - 1) % step === 0 ? multiples : multiples + 1
}

/**
 * The frames to keep decoded, in the order to decode them: the `size` frames nearest to `at`
 * (the frame the scroll asks for), where a frame behind counts twice as far as one ahead.
 * Ahead is towards `heading` (the frame of the scroll position, which the smoothed picture
 * follows), forwards when the two are equal: a visitor mostly scrolls on.
 */
export function decodeWindow(count: number, at: number, heading: number, size: number): number[] {
  const forwards = heading >= at
  return Array.from({ length: count }, (_, index) => {
    const ahead = forwards ? index - at : at - index
    return { index, cost: ahead >= 0 ? ahead : 0.5 - 2 * ahead }
  })
    .sort((a, b) => a.cost - b.cost)
    .slice(0, Math.max(0, size))
    .map(({ index }) => index)
}

/** The loaded frame nearest to `wanted` (the earlier one on a tie), or -1 if none is. */
export function nearestLoaded(loaded: ArrayLike<unknown>, wanted: number): number {
  for (let distance = 0; distance < loaded.length; distance++) {
    if (loaded[wanted - distance] !== undefined) return wanted - distance
    if (loaded[wanted + distance] !== undefined) return wanted + distance
  }
  return -1
}

/**
 * Where the subject is (x, a share of the frame width) as a CSS expression of `--p`.
 * `points` are its positions at equal steps of progress, from the first frame to the last;
 * between them the pan moves in straight lines. Plain CSS, so it is right before hydration
 * (the scroll timeline sets `--p`) and after (PrintOnScroll does).
 */
export function focusTrack(points: readonly number[]): string {
  const [first = 0.5] = points
  if (points.length < 2) return String(first)
  const segments = points.length - 1
  const terms = points.slice(1).map((point, index) => {
    const rise = Math.round((point - (points[index] ?? point)) * 10_000) / 10_000
    return `${rise} * clamp(0, var(--p) * ${segments} - ${index}, 1)`
  })
  return `calc(${first} + ${terms.join(' + ')})`
}

/**
 * The same point as `focusTrack(points)` at `progress`, as a number. After hydration
 * PrintOnScroll writes it on the frame, so the pan restyles only the frame, not the stage.
 */
export function focusAt(points: readonly number[], progress: number): number {
  const [first = 0.5] = points
  if (points.length < 2) return first
  const segments = points.length - 1
  const position = Math.min(segments, Math.max(0, progress * segments))
  const index = Math.min(segments - 1, Math.floor(position))
  const from = points[index] ?? first
  const to = points[index + 1] ?? from
  return from + (to - from) * (position - index)
}

/** Progress at which the intro has faded out, and at which the outro starts. */
export interface Phases {
  introOut: number
  outroIn: number
}

/**
 * The progress the overlays see (`--p` on the stage: intro, outro, shade, poster). Between
 * the intro and the outro none of them changes, so it stays at `introOut` there: a new `--p`
 * restyles every element on the stage, and on a phone that cost about half of each frame.
 */
export function overlayProgress(progress: number, phases: Phases): number {
  return progress > phases.introOut && progress < phases.outroIn ? phases.introOut : progress
}
