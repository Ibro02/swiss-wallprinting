// The hero video's facts, found in its frames by `vp run frames` (scripts/frames.ts), so a new
// video needs no measuring by hand: which frames the hero shows, and where the printer is.
// Pure functions on small gray frames, with tests. Node runs this file directly.

/** A gray frame: one byte per pixel, row by row from the top left. */
export interface GrayFrame {
  width: number
  height: number
  data: Uint8Array
}

/** The mean absolute difference of two frames of one size, 0 … 255. */
export function meanDifference(a: GrayFrame, b: GrayFrame): number {
  let sum = 0
  for (let index = 0; index < a.data.length; index++) {
    sum += Math.abs((a.data[index] ?? 0) - (b.data[index] ?? 0))
  }
  return sum / a.data.length
}

const median = (values: readonly number[]) => {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2
    ? (sorted[middle] ?? 0)
    : ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2
}

/** A frame that differs from the one before it by less than this is a copy (0 … 255). */
const COPY_ABSOLUTE = 0.02
/** … or by less than this share of the steps around it (a 24 fps video stretched to 30). */
const COPY_RELATIVE = 0.3
const AROUND = [-3, -2, -1, 1, 2, 3]

/**
 * The frames that are not a copy of the one before them. `steps[i]` is the difference of
 * frame i from frame i - 1 (`steps[0]` is ignored). A video stretched from 24 to 30 fps
 * repeats every 5th frame: such a step is far smaller than the steps around it.
 */
export function distinctFrames(steps: readonly number[]): number[] {
  const distinct = [0]
  for (let index = 1; index < steps.length; index++) {
    const step = steps[index] ?? 0
    const around = AROUND.map((offset) => index + offset)
      .filter((neighbour) => neighbour >= 1 && neighbour < steps.length)
      .map((neighbour) => steps[neighbour] ?? 0)
    if (step >= COPY_ABSOLUTE && step >= COPY_RELATIVE * median(around)) distinct.push(index)
  }
  return distinct
}

/** The print has started once a frame is this share closer to the finished picture. */
const START_SHARE = 0.02
/** The picture counts as finished once every later frame is within this share of the last. */
const END_SHARE = 0.04

/**
 * The frames that show the print: from `leadIn` frames before the picture starts to change
 * towards the finished one, to the frame from which it hardly changes any more. A still
 * opening (the printer waiting, the light moving) and a still end are left out. `toLast[i]`
 * is the difference of frame i from the last frame.
 */
export function printSpan(
  toLast: readonly number[],
  leadIn: number,
): { start: number; end: number } {
  const total = toLast[0] ?? 0
  const last = toLast.length - 1
  const crossing = toLast.findIndex((value) => value < (1 - START_SHARE) * total)
  const start = Math.max(0, (crossing === -1 ? 0 : crossing) - leadIn)
  let end = last
  while (end > start && (toLast[end - 1] ?? 0) <= END_SHARE * total) end--
  return { start, end }
}

/**
 * At most `max` of the frames, at even steps, with the first and the last. Fewer frames
 * mean fewer bytes; the scroll does not need more than about 100.
 */
export function sampleEvenly(frames: readonly number[], max: number): number[] {
  if (frames.length <= max) return [...frames]
  return Array.from(
    { length: max },
    (_, step) => frames[Math.round((step * (frames.length - 1)) / (max - 1))] ?? 0,
  )
}

/**
 * The video's frames that the hero shows: the distinct frames of the print span, at most
 * `max`, and as the last one the video's own last frame (the finished picture, which the
 * outro and reduced motion show). `steps` and `toLast` as for `distinctFrames` and `printSpan`.
 */
export function chooseFrames(
  steps: readonly number[],
  toLast: readonly number[],
  { leadIn, max }: { leadIn: number; max: number },
): { frames: number[]; start: number; end: number } {
  const { start, end } = printSpan(toLast, leadIn)
  const span = distinctFrames(steps).filter((frame) => frame >= start && frame <= end)
  const frames = sampleEvenly(span, max)
  // The span's end is within END_SHARE of the last frame, so the last frame takes its place.
  const last = toLast.length - 1
  if (frames.length > 1) frames[frames.length - 1] = last
  else if (frames[0] !== last) frames.push(last)
  return { frames, start, end }
}

export interface TrackOptions {
  /** Only the wall above the furniture counts: the top share of the frame. */
  wallBand: number
  /** A pixel differs when its gray value differs by more than this (light changes stay below). */
  pixelDiffers: number
  /** A column differs when more than this share of its wall pixels differs. */
  columnDiffers: number
}

const TRACK: TrackOptions = { wallBand: 0.6, pixelDiffers: 32, columnDiffers: 0.08 }
/** Columns in a row that differ before an edge counts (a single column is noise). */
const EDGE_RUN = 3
/** The print head is right of the printer's mast, the edge of the print. */
const HEAD_OFFSET = 0.015

/** For each column, whether `frame` differs from `target` in the wall band. */
function differingColumns(frame: GrayFrame, target: GrayFrame, options: TrackOptions): boolean[] {
  const rows = Math.floor(frame.height * options.wallBand)
  return Array.from({ length: frame.width }, (_, x) => {
    let differing = 0
    for (let y = 0; y < rows; y++) {
      const index = y * frame.width + x
      const difference = Math.abs((frame.data[index] ?? 0) - (target.data[index] ?? 0))
      if (difference > options.pixelDiffers) differing++
    }
    return differing > rows * options.columnDiffers
  })
}

/** The first column of a run of `EDGE_RUN` true columns, from `from` up to `to`; -1 if none. */
function firstRun(columns: readonly boolean[], from: number, to: number): number {
  for (let x = from; x <= to - EDGE_RUN + 1; x++) {
    if (columns.slice(x, x + EDGE_RUN).every(Boolean)) return x
  }
  return -1
}

/**
 * Where the printer is (x, 0 … 1) at `points` even steps of progress through `frames`, the
 * frames the hero shows. The print grows from left to right: compared with the finished
 * picture (the last frame), the printed part already matches, and the part right of the
 * printer does not yet. So the first differing column inside the picture is the printer.
 * Only the wall band counts, so furniture that appears late does not. Once nothing in the
 * picture differs (the printer has gone), the point is the middle of the picture: the
 * camera turns to the whole print before the call to action.
 */
export function printerTrack(
  frames: readonly GrayFrame[],
  points = 11,
  options: TrackOptions = TRACK,
): number[] {
  const first = frames[0]
  const last = frames.at(-1)
  if (!first || !last) return []
  const width = first.width
  // The picture: the columns where the finished wall differs from the blank one.
  const picture = differingColumns(first, last, options)
  const left = picture.indexOf(true)
  const right = picture.lastIndexOf(true)
  const middle = left === -1 ? 0.5 : (left + right + 1) / 2 / width
  const round = (value: number) => Math.round(Math.min(1, Math.max(0, value)) * 1000) / 1000
  return Array.from({ length: points }, (_, step) => {
    const frame = frames[Math.round((step * (frames.length - 1)) / (points - 1))] ?? last
    // Up to the frame's edge: after the print, the printer moves on, right of the picture.
    const edge =
      left === -1 ? -1 : firstRun(differingColumns(frame, last, options), left, width - 1)
    return round(edge === -1 ? middle : edge / width + HEAD_OFFSET)
  })
}
