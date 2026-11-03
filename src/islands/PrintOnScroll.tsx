'use client'

import { type CSSProperties, type ReactNode, useEffect, useRef } from 'react'
import { ChevronDownIcon } from '@/components/icons.tsx'
import type { FrameSet } from '@/content/images/types.ts'
import {
  blendOf,
  choseFallback,
  coarseCount,
  decodeWindow,
  focusAt,
  focusTrack,
  frameAt,
  framePath,
  imageType,
  loadOrder,
  nearestLoaded,
  overlayProgress,
  type Phases,
  type ScrollRange,
  scrollProgress,
  playTowards,
  readyThrough,
  restingProgress,
  smoothTowards,
} from '@/features/home/print-scroll.ts'

// "Print on scroll": a tall section with a sticky stage, where the visitor's scroll plays a
// video forwards and backwards, frame by frame (styles: globals.css, .print-scroll).
//
// - The frames are still images (`vp run frames`) drawn to a canvas. A <video> scrubbed with
//   `currentTime` stutters, because each seek decodes from the last keyframe.
// - Nothing decodes on the main thread during a scroll. The frames download as files, and
//   createImageBitmap decodes the ones near the scroll position off the main thread
//   (decodeWindow); the canvas draws only decoded frames. Frames as <img> elements were
//   decoded again at each draw on phones (the browser drops decoded images over its memory
//   limit; 2026-11-01: about 18 ms per frame on a slow phone), and all of them decoded would
//   take 370 MB (phone frames) to 580 MB (desktop frames).
// - The server renders the first frame as an <img> (the LCP element), so the first paint is
//   right without JavaScript. The canvas lies on it and only ever draws a loaded frame. The
//   poster stays under it until the outro: a swipe that is faster than the network shows
//   frame 0, never an empty stage.
// - The frames are AVIF. The poster's <picture> also offers a WebP copy (`fallback`), so a
//   browser without AVIF shows the poster; it never loads the frames, and the overlays
//   still follow the scroll.
// - Layout is CSS: a box with the video's proportions covers the stage (container query
//   units), and the poster and the canvas sit in it. They line up at every screen size.
//   The canvas keeps the frame's own pixel size and the browser scales it like the <img>:
//   no devicePixelRatio maths, no redraw on resize.
// - CSS turns the progress `--p` (0 … 1) into the overlay fades and the pan that keeps the
//   subject in view. Before hydration a CSS scroll timeline sets `--p`, so a reload in the
//   middle of the section paints the right overlays at once (no-ui-flash). After it,
//   JavaScript writes the smoothed progress, and only where it changes something: `--p` on
//   the stage only while the intro or the outro moves (overlayProgress: every element on the
//   stage restyles for a new `--p`), and the pan as a number, `--focus`, on the frame alone.
//   The frame is a layer of its own, so the pan moves it without a repaint.
// - Reduced motion: no frames load. CSS shows the last frame and both overlays in a short
//   section.

/** Progress at which the intro has faded out and the outro starts. */
const PHASES: Phases = { introOut: 0.1, outroIn: 0.88 }

/** A scroll back shorter than this (px) does not stop the print while it plays. */
const REWIND_PX = 24

/** Frames that download at the same time. */
const PARALLEL_LOADS = 6

/**
 * Frames that decode at the same time (off the main thread). Desktops scrub both ways at up
 * to 60 frames a second (`maxSpeed`), and have the cores for more.
 */
const PARALLEL_DECODES = { phone: 3, desktop: 5 }

/**
 * How much farther a frame behind the picture counts than one ahead, when the decoded frames
 * are chosen (decodeWindow). Desktops scrub back as often as forwards: as many each way.
 */
const BEHIND_WEIGHT = { phone: 2, desktop: 1 }

/**
 * Memory for the decoded frames around the scroll position: 18 phone frames (1280 × 720)
 * in 64 MB; 23 desktop frames (1600 × 900) in 128 MB. With 64 MB (11 frames) a desktop's play
 * ran out of decoded frames (2026-11-02); phones were smooth with it, and have less memory.
 */
const DECODED_BYTES = { phone: 64 * 2 ** 20, desktop: 128 * 2 ** 20 }

/** The longest the play waits for one frame to decode before it goes on without it (ms). */
const MAX_WAIT_MS = 150

/** Before the first scroll: every 8th frame (and the last), see loadCoarse. */
const COARSE_STEP = 8

interface Props {
  /** Frames for wide screens; their first frame is the poster. */
  frames: FrameSet
  /** Smaller frames of the same video for the screens in `mobileQuery`. */
  mobileFrames?: FrameSet
  mobileQuery?: string
  /** Scroll length of the whole section (a CSS length). Longer feels heavier. */
  length?: string
  /** `length` under 48rem (the default `mobileQuery`; globals.css). */
  mobileLength?: string
  /**
   * Share of the way to the scroll position that the picture covers per 60 Hz frame
   * (0 … 1). Lower is smoother but lags more; 1 is no smoothing.
   */
  smoothing?: number
  /** `smoothing` for the `mobileFrames` (default: `smoothing`). */
  mobileSmoothing?: number
  /**
   * The slowest the picture moves towards the scroll position (progress per second), so it
   * does not crawl over the last frames. 0: the easing alone.
   */
  minSpeed?: number
  /**
   * The fastest the picture follows the scroll (progress per second), on the wide `frames`
   * only: a fast scroll does not jump over frames.
   */
  maxSpeed?: number
  /**
   * After a scroll forwards the print plays on to the end by itself, in this many seconds for
   * the whole of it (faster where the scroll is ahead); a scroll back rewinds with the
   * scroll. 0: the picture only follows the scroll, forwards and backwards.
   */
  playSeconds?: number
  /** `playSeconds` for the `mobileFrames` (default: `playSeconds`). */
  mobilePlaySeconds?: number
  /**
   * Where the subject is (x, 0 … 1 of the frame width), at equal steps of progress from the
   * first frame to the last (focusTrack). Screens narrower than the video keep this point in
   * the middle: the camera follows the subject.
   */
  focus?: readonly number[]
  /** Share of the frame height that is never shown, at the bottom (the floor, for example). */
  cropBottom?: number
  /** Share of the screen kept free above the stage, for a fixed header. */
  headerRoom?: number
  /** `headerRoom` under 48rem (the default `mobileQuery`; globals.css). */
  mobileHeaderRoom?: number
  /** Text alternative of the poster frame. */
  alt: string
  /** Shown at the start; fades out as the print begins. */
  intro?: ReactNode
  /** A short scroll hint under the intro (none with reduced motion). */
  hint?: string
  /** Shown when the picture is finished: the call to action. */
  outro?: ReactNode
  /** Always on the stage, for example an "example" badge. */
  children?: ReactNode
  labelledBy?: string
  /** The section: set `--frame`, the page margin around the stage (per screen size). */
  className?: string
  /** The sticky stage: radius and background. */
  stageClassName?: string
  /** The intro and outro layer: its padding. */
  contentClassName?: string
}

export function PrintOnScroll({
  frames,
  mobileFrames,
  mobileQuery = '(max-width: 47.99rem)',
  length = '400vh',
  mobileLength,
  smoothing = 0.12,
  mobileSmoothing = smoothing,
  minSpeed = 0,
  maxSpeed = Number.POSITIVE_INFINITY,
  playSeconds = 0,
  mobilePlaySeconds = playSeconds,
  focus = [0.5],
  cropBottom = 0,
  headerRoom = 0,
  mobileHeaderRoom,
  alt,
  intro,
  hint,
  outro,
  children,
  labelledBy,
  className = '',
  stageClassName = '',
  contentClassName = 'p-4 sm:p-6 md:p-8',
}: Props) {
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const posterRef = useRef<HTMLImageElement>(null)
  // Set while scrubbing: scrolls to the end of the section, where the outro is.
  const finishRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const section = sectionRef.current
    const stage = stageRef.current
    const frame = frameRef.current
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!section || !stage || !frame || !canvas || !context) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // Chosen once, like the poster's <source>: a resize across the query keeps this set.
    const set = mobileFrames && window.matchMedia(mobileQuery).matches ? mobileFrames : frames
    const wide = set === frames
    const play = wide ? playSeconds : mobilePlaySeconds
    const ease = wide ? smoothing : mobileSmoothing
    // Where the picture goes for a scroll progress: on wide screens, which blend two frames
    // while the picture moves, the nearest whole frame, so it never rests on two printers.
    const restOn = (progress: number) => (wide ? restingProgress(progress, set.count) : progress)
    canvas.width = set.width
    canvas.height = set.height
    // The poster's <picture> chose the fallback: this browser cannot decode the frames. It
    // keeps the poster, as without JavaScript, and no frame loads.
    const framesOff = choseFallback(posterRef.current?.currentSrc ?? '', set)

    // Each frame's file (tens of KB), and the decoded frames near the scroll position.
    const files: (Blob | undefined)[] = Array.from({ length: set.count })
    const decoded: (ImageBitmap | undefined)[] = Array.from({ length: set.count })
    const decoding = new Set<number>()
    const bytes = wide ? DECODED_BYTES.desktop : DECODED_BYTES.phone
    const windowSize = Math.max(4, Math.floor(bytes / (set.width * set.height * 4)))
    // The frames to keep decoded, nearest first, and the frames they were chosen for.
    let keep: number[] = []
    let keptFor = ''
    const downloads = new AbortController()
    let range: ScrollRange = { start: 0, distance: 0 }
    // The scroll's progress; where the picture goes (the end while the print plays); where it is.
    let scrolled = 0
    let playing = false
    let target = 0
    let current = 0
    // What the canvas shows: a frame, or two frames and the share of the second (blendOf).
    let drawn = ''
    // When the play began to wait for a frame to decode (0: it does not wait).
    let waitingSince = 0
    let raf = 0
    let lastTime = 0
    let disposed = false

    const measure = () => {
      const stickyTop = Number.parseFloat(getComputedStyle(stage).top) || 0
      // The header room is the section's top padding: the stage starts below it.
      const room = Number.parseFloat(getComputedStyle(section).paddingTop) || 0
      range = {
        start: section.getBoundingClientRect().top + window.scrollY + room - stickyTop,
        distance: section.offsetHeight - room - stage.offsetHeight,
      }
      scrolled = scrollProgress(window.scrollY, range)
      if (!playing) target = restOn(scrolled)
    }

    const decodeNext = () => {
      for (const index of keep) {
        if (disposed || decoding.size >= (wide ? PARALLEL_DECODES.desktop : PARALLEL_DECODES.phone))
          return
        const file = files[index]
        if (!file || decoded[index] || decoding.has(index)) continue
        decoding.add(index)
        createImageBitmap(file)
          .then(
            (bitmap) => {
              if (disposed || !keep.includes(index)) return bitmap.close()
              decoded[index] = bitmap
              // A loop that is running draws it on its next frame.
              if (!raf) render()
            },
            // A frame that does not decode: its neighbours stand in.
            () => {
              files[index] = undefined
            },
          )
          .finally(() => {
            decoding.delete(index)
            decodeNext()
          })
      }
    }

    // Keeps the frames near `at` decoded and frees the others, so the memory stays bounded.
    const keepNear = (at: number) => {
      const heading = frameAt(target, set.count)
      if (keptFor === `${at} ${heading}`) return
      keptFor = `${at} ${heading}`
      keep = decodeWindow(
        set.count,
        at,
        heading,
        windowSize,
        wide ? BEHIND_WEIGHT.desktop : BEHIND_WEIGHT.phone,
      )
      for (const [index, bitmap] of decoded.entries()) {
        if (bitmap && !keep.includes(index)) {
          bitmap.close()
          decoded[index] = undefined
        }
      }
      decodeNext()
    }

    const render = () => {
      const wanted = frameAt(current, set.count)
      keepNear(wanted)
      // Wide screens draw the two frames on either side of the progress, the second over the
      // first by its share: the printer moves between the video's frames instead of in steps
      // (the author, 2026-11-03: "frame dropping"). Both must be decoded; else the nearest.
      const blend = wide ? blendOf(current, set.count) : undefined
      const pair = blend && decoded[blend.from] && decoded[blend.to] ? blend : undefined
      const shown = pair ? wanted : nearestLoaded(decoded, wanted)
      const bitmap = decoded[pair ? pair.from : shown]
      const key = pair ? `${pair.from} ${pair.to} ${pair.share}` : String(shown)
      if (bitmap && key !== drawn) {
        context.drawImage(bitmap, 0, 0, set.width, set.height)
        const over = pair && decoded[pair.to]
        if (pair && over) {
          context.globalAlpha = pair.share
          context.drawImage(over, 0, 0, set.width, set.height)
          context.globalAlpha = 1
        }
        drawn = key
        canvas.dataset.frame = String(shown)
        // The canvas shows a frame from now on: the poster under it can go (globals.css).
        stage.toggleAttribute('data-drawn', true)
      }
      // A browser restyles only for a value that changed: the frame for each step of the
      // pan, the whole stage only while the intro or the outro moves.
      frame.style.setProperty('--focus', focusAt(focus, current).toFixed(4))
      stage.style.setProperty('--p', overlayProgress(current, PHASES).toFixed(4))
      stage.toggleAttribute('data-loading', !framesOff && shown !== wanted)
      stage.toggleAttribute('data-done', current >= PHASES.outroIn)
    }

    const tick = (time: number) => {
      const elapsed = lastTime ? time - lastTime : 1000 / 60
      const next = playing
        ? playTowards(current, scrolled, ease, elapsed, play)
        : smoothTowards(current, target, ease, elapsed, minSpeed, wide ? maxSpeed : undefined)
      // The play, and on wide screens the scrub as well, goes no further than the frames
      // decoded in a row, so it shows each frame instead of jumping (a desktop decoded about
      // 23 of the 39 frames a second the play asked for, 2026-11-02). A frame that is not
      // ready within MAX_WAIT_MS is skipped.
      const step = next > current ? 1 : -1
      const ready =
        (playing || wide) && !framesOff && next !== current
          ? readyThrough(decoded, frameAt(current, set.count), step) / (set.count - 1)
          : next
      if (step > 0 ? next <= ready : next >= ready) {
        current = next
        waitingSince = 0
      } else if (time - (waitingSince ||= time) < MAX_WAIT_MS) {
        current = step > 0 ? Math.max(current, ready) : Math.min(current, ready)
      } else {
        current = next
      }
      lastTime = time
      render()
      if (current === target) {
        raf = 0
        lastTime = 0
      } else {
        raf = requestAnimationFrame(tick)
      }
    }

    const wake = () => {
      if (!raf) raf = requestAnimationFrame(tick)
    }

    const onScroll = () => {
      loadAll()
      const next = scrollProgress(window.scrollY, range)
      if (next === scrolled) return
      // One scroll forwards plays the whole print (the author, 2026-11-01: "with one scroll
      // through the entire transformation"); a scroll back stops it and rewinds with the scroll.
      // A few pixels back (the browser's scroll anchoring as the page loads) is no rewind.
      const rewind = scrolled - next > REWIND_PX / Math.max(range.distance, 1)
      playing = play > 0 && (next > scrolled || (playing && !rewind))
      scrolled = next
      target = playing ? 1 : restOn(next)
      wake()
    }

    // Wide screens: the frames the first scroll needs (the decode window) in order first.
    const queue = loadOrder(set.count, wide ? windowSize : 0)
    let pending = 0
    // How many frames may start: the coarse set first, all of them after the first scroll.
    let allowed = 0
    let started = 0
    const loadNext = () => {
      while (!framesOff && !disposed && pending < PARALLEL_LOADS && started < allowed) {
        const index = queue.shift()
        if (index === undefined) return
        started++
        pending++
        // The file only: decodeNext decodes it when the scroll comes near.
        fetch(framePath(set.pattern, index), {
          priority: index === 0 ? 'high' : 'low',
          signal: downloads.signal,
        })
          .then((response) => (response.ok ? response.blob() : undefined))
          .then(
            (file) => {
              if (!file || disposed) return
              files[index] = file
              decodeNext()
            },
            // A frame that does not load: its neighbours stand in.
            () => {},
          )
          .finally(() => {
            pending--
            loadNext()
          })
      }
    }

    // When the frames load. The poster is the LCP image: nothing may share a slow network with
    // it (Lighthouse mobile: LCP 16.9 s while 4 MB of frames loaded from hydration). After the
    // load event and the poster's first paint (two animation frames), only the coarse set:
    // every 8th frame, about an eighth of the bytes, so a visitor who never scrolls does not
    // pay for the whole video. The first scroll asks for all of them; the coarse frames stand
    // in (nearestLoaded) until the others arrive. Wide screens load all of them after the
    // first paint (3.7 MB): with the coarse set only, the first scroll found frames 1 … 7
    // missing, and the picture stood still, then jumped (2026-11-03).
    const loadCoarse = () => {
      allowed = Math.max(allowed, coarseCount(set.count, COARSE_STEP))
      loadNext()
    }
    let all = false
    const loadAll = () => {
      if (all) return
      all = true
      allowed = set.count
      loadNext()
    }
    const afterFirstPaint = () =>
      requestAnimationFrame(() => requestAnimationFrame(wide ? loadAll : loadCoarse))

    measure()
    // A reload in the middle of the section starts there, without a sweep from frame 0.
    current = target
    // Until now a CSS scroll timeline set `--p` (globals.css); from here the smoothed value
    // does, in the same frame.
    stage.style.animation = 'none'
    render()
    if (target > 0) loadAll()
    else if (document.readyState === 'complete') afterFirstPaint()
    else window.addEventListener('load', afterFirstPaint, { once: true })
    finishRef.current = () => {
      if (target >= 1) return
      // After the focus: its own scroll-into-view would cancel a smooth scroll started now.
      requestAnimationFrame(() => window.scrollTo({ top: range.start + range.distance }))
    }

    // The section height is in vh: a new viewport height moves the range.
    const resizeObserver = new ResizeObserver(() => {
      measure()
      wake()
    })
    resizeObserver.observe(section)
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      resizeObserver.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('load', afterFirstPaint)
      finishRef.current = null
      // Cancels the downloads that are still running, and frees the decoded frames.
      downloads.abort()
      for (const bitmap of decoded) bitmap?.close()
    }
  }, [
    frames,
    mobileFrames,
    mobileQuery,
    smoothing,
    mobileSmoothing,
    minSpeed,
    maxSpeed,
    playSeconds,
    mobilePlaySeconds,
    focus,
  ])

  const sectionStyle = {
    '--print-length': length,
    '--print-length-mobile': mobileLength,
    '--ar': frames.width / frames.height,
    '--crop-bottom': cropBottom,
    '--room': headerRoom,
    '--room-mobile': mobileHeaderRoom,
    '--intro-out': PHASES.introOut,
    '--outro-in': PHASES.outroIn,
  } as CSSProperties
  const lastIndex = (set: FrameSet) => set.count - 1
  /** One poster source, typed, so a browser skips a format it cannot decode. */
  const source = (pattern: string, index: number, media?: string) => (
    <source media={media} type={imageType(pattern)} srcSet={framePath(pattern, index)} />
  )
  /** A frame in the frames' own format, then its fallback copy where there is one. */
  const sources = (set: FrameSet, index: number, media?: string) => (
    <>
      {source(set.pattern, index, media)}
      {set.fallback && source(set.fallback, index, media)}
    </>
  )

  return (
    <section
      ref={sectionRef}
      aria-labelledby={labelledBy}
      className={`print-scroll relative ${className}`}
      style={sectionStyle}
    >
      <div
        ref={stageRef}
        className={`print-scroll__stage isolate overflow-hidden ${stageClassName}`}
      >
        {/* `--focus` uses `--p`, so it is set here, under the stage that carries `--p`. After
            hydration the island writes it as a number (focusAt). */}
        <div
          ref={frameRef}
          className="print-scroll__frame"
          style={{ '--focus': focusTrack(focus) } as CSSProperties}
        >
          <picture>
            {/* Reduced motion shows the finished picture; phones get the smaller frames. Each
                frame in the frames' format first (AVIF), then the fallback (WebP). */}
            {mobileFrames &&
              sources(
                mobileFrames,
                lastIndex(mobileFrames),
                `(prefers-reduced-motion: reduce) and ${mobileQuery}`,
              )}
            {sources(frames, lastIndex(frames), '(prefers-reduced-motion: reduce)')}
            {mobileFrames && sources(mobileFrames, 0, mobileQuery)}
            {/* The <img> is the fallback; the frames' own format comes first. */}
            {frames.fallback && source(frames.pattern, 0)}
            {/* oxlint-disable-next-line nextjs/no-img-element -- art direction by media query; the frames are already sized AVIF and WebP */}
            <img
              ref={posterRef}
              src={framePath(frames.fallback ?? frames.pattern, 0)}
              alt={alt}
              width={frames.width}
              height={frames.height}
              fetchPriority="high"
              className="print-scroll__poster size-full"
            />
          </picture>
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="print-scroll__canvas absolute inset-0 size-full"
          />
        </div>

        {/* Darker where the text is; gone while the picture prints. */}
        <div
          aria-hidden="true"
          className="print-scroll__shade absolute inset-0 bg-linear-to-t from-black/85 via-black/35 to-black/0 lg:bg-linear-to-tr lg:from-black/85 lg:via-black/25 lg:to-black/0"
        />

        <div className={`on-dark absolute inset-0 grid content-end text-white ${contentClassName}`}>
          <div className="print-scroll__intro">
            {intro}
            {hint && (
              <p
                data-rise="3"
                className="print-scroll__hint mt-6 flex items-center gap-2 text-sm font-medium text-white/75"
              >
                <ChevronDownIcon className="size-4" />
                {hint}
              </p>
            )}
          </div>
          {/* A keyboard focus on a button here scrolls to the finished picture first. */}
          <div className="print-scroll__outro" onFocus={() => finishRef.current?.()}>
            {outro}
          </div>
        </div>

        <div
          aria-hidden="true"
          className="print-scroll__loading absolute inset-x-0 bottom-0 h-0.5 overflow-hidden bg-white/15"
        >
          <span className="block h-full w-1/3 bg-white/80" />
        </div>

        {children}
      </div>
    </section>
  )
}
