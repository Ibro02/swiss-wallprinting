// The pure parts of the scroll hero (PrintOnScroll): which frame the scroll asks for, how
// the shown frame follows it, and the order in which the frames load.

/** The URL of one frame: `%04d` in the pattern becomes the zero-padded index (as in ffmpeg). */
export function framePath(pattern: string, index: number): string {
  return pattern.replace(/%0(\d+)d/, (_, digits: string) =>
    String(index).padStart(Number(digits), '0'),
  )
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
/** Closer than this, the shown progress snaps to the scroll (well under one frame of 121). */
const SETTLED = 0.0002

/**
 * One step of the shown progress towards the scroll position. `smoothing` is the share of
 * the remaining distance covered in one 60 Hz frame (1 = no smoothing). The step is scaled
 * by the real frame time, so the motion feels the same on 60 Hz and 120 Hz screens, and
 * after a long frame it catches up instead of lagging.
 */
export function smoothTowards(
  current: number,
  target: number,
  smoothing: number,
  elapsedMs: number,
): number {
  const share = Math.min(1, Math.max(0.01, smoothing))
  const k = 1 - (1 - share) ** (Math.min(elapsedMs, 100) / FRAME_MS)
  const next = current + (target - current) * k
  return Math.abs(target - next) < SETTLED ? target : next
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
