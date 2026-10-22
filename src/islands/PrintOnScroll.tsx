'use client'

import { type CSSProperties, type ReactNode, useEffect, useRef } from 'react'
import { ChevronDownIcon } from '@/components/icons.tsx'
import type { FrameSet } from '@/content/images/types.ts'
import {
  frameAt,
  framePath,
  loadOrder,
  nearestLoaded,
  type ScrollRange,
  scrollProgress,
  smoothTowards,
} from '@/features/home/print-scroll.ts'

// "Print on scroll": a tall section with a sticky stage, where the visitor's scroll plays a
// video forwards and backwards, frame by frame (styles: globals.css, .print-scroll).
//
// - The frames are still images (`vp run frames`) drawn to a canvas. A <video> scrubbed with
//   `currentTime` stutters, because each seek decodes from the last keyframe.
// - The server renders the first frame as an <img> (the LCP element), so the first paint is
//   right without JavaScript. The canvas lies on it and only ever draws a loaded frame, so
//   it is never blank.
// - Layout is CSS: a box with the video's proportions covers the stage (container query
//   units), and the poster, the canvas, and the signature sit in it. They line up at every
//   screen size, and the signature stays on the mural. The canvas keeps the frame's own
//   pixel size and the browser scales it like the <img>: no devicePixelRatio maths, no
//   redraw on resize.
// - JavaScript writes only `--p` (the smoothed progress, 0 … 1) on the stage. CSS turns it
//   into the overlay fades, the signature, and the pan that keeps the subject in view.
// - Reduced motion: no frames load. CSS shows the last frame, the signature, and both
//   overlays in a short section.

/** Progress at which the intro has faded out, the outro starts, the signature starts. */
const PHASES = { introOut: 0.1, outroIn: 0.88, signatureIn: 0.92 }

/** Frames that download at the same time. */
const PARALLEL_LOADS = 6

interface Props {
  /** Frames for wide screens; their first frame is the poster. */
  frames: FrameSet
  /** Smaller frames of the same video for the screens in `mobileQuery`. */
  mobileFrames?: FrameSet
  mobileQuery?: string
  /** Scroll length of the whole section (a CSS length). Longer feels heavier. */
  length?: string
  /**
   * Share of the way to the scroll position that the picture covers per 60 Hz frame
   * (0 … 1). Lower is smoother but lags more; 1 is no smoothing.
   */
  smoothing?: number
  /**
   * Where the subject is (x, 0 … 1 of the frame width) at the first and the last frame.
   * Screens narrower than the video keep this point in the middle.
   */
  focus?: readonly [from: number, to: number]
  /** A logo that "signs" the finished picture: x, y, and width are shares of the frame. */
  signature?: { src: string; x: number; y: number; width: number }
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
  /** The sticky stage: `--stage-top`, `--stage-h`, radius, and background. */
  stageClassName?: string
}

export function PrintOnScroll({
  frames,
  mobileFrames,
  mobileQuery = '(max-width: 47.99rem)',
  length = '400vh',
  smoothing = 0.12,
  focus = [0.5, 0.5],
  signature,
  alt,
  intro,
  hint,
  outro,
  children,
  labelledBy,
  stageClassName = '',
}: Props) {
  const sectionRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // Set while scrubbing: scrolls to the end of the section, where the outro is.
  const finishRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const section = sectionRef.current
    const stage = stageRef.current
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!section || !stage || !canvas || !context) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // Chosen once, like the poster's <source>: a resize across the query keeps this set.
    const set = mobileFrames && window.matchMedia(mobileQuery).matches ? mobileFrames : frames
    canvas.width = set.width
    canvas.height = set.height

    const images: (HTMLImageElement | undefined)[] = Array.from({ length: set.count })
    let range: ScrollRange = { start: 0, distance: 0 }
    let target = 0
    let current = 0
    let drawn = -1
    let raf = 0
    let lastTime = 0
    let disposed = false

    const measure = () => {
      const stickyTop = Number.parseFloat(getComputedStyle(stage).top) || 0
      range = {
        start: section.getBoundingClientRect().top + window.scrollY - stickyTop,
        distance: section.offsetHeight - stage.offsetHeight,
      }
      target = scrollProgress(window.scrollY, range)
    }

    const render = () => {
      const wanted = frameAt(current, set.count)
      const shown = nearestLoaded(images, wanted)
      const image = images[shown]
      if (image && shown !== drawn) {
        context.drawImage(image, 0, 0, set.width, set.height)
        drawn = shown
      }
      stage.style.setProperty('--p', current.toFixed(4))
      stage.toggleAttribute('data-loading', shown !== wanted)
      stage.toggleAttribute('data-done', current >= PHASES.outroIn)
    }

    const tick = (time: number) => {
      current = smoothTowards(current, target, smoothing, lastTime ? time - lastTime : 1000 / 60)
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
      const next = scrollProgress(window.scrollY, range)
      if (next === target) return
      target = next
      wake()
    }

    const queue = loadOrder(set.count)
    const pending = new Set<HTMLImageElement>()
    const loadNext = () => {
      while (!disposed && pending.size < PARALLEL_LOADS) {
        const index = queue.shift()
        if (index === undefined) return
        const image = new Image()
        image.fetchPriority = index === 0 ? 'high' : 'low'
        image.src = framePath(set.pattern, index)
        pending.add(image)
        // decode() before the first draw, so drawImage never decodes during a scroll.
        void image
          .decode()
          .then(
            () => {
              if (disposed) return
              images[index] = image
              // A loop that is running draws it on its next frame.
              if (!raf) render()
            },
            // A frame that does not load: its neighbours stand in.
            () => {},
          )
          .finally(() => {
            pending.delete(image)
            loadNext()
          })
      }
    }

    measure()
    // A reload in the middle of the section starts there, without a sweep from frame 0.
    current = target
    render()
    loadNext()
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
      finishRef.current = null
      // Cancels the downloads that are still running.
      for (const image of pending) image.src = ''
    }
  }, [frames, mobileFrames, mobileQuery, smoothing])

  const sectionStyle = {
    '--print-length': length,
    '--ar': frames.width / frames.height,
    '--focus-from': focus[0],
    '--focus-to': focus[1],
    '--intro-out': PHASES.introOut,
    '--outro-in': PHASES.outroIn,
    '--signature-in': PHASES.signatureIn,
  } as CSSProperties
  const last = (set: FrameSet) => framePath(set.pattern, set.count - 1)

  return (
    <section
      ref={sectionRef}
      aria-labelledby={labelledBy}
      className="print-scroll relative"
      style={sectionStyle}
    >
      <div
        ref={stageRef}
        className={`print-scroll__stage isolate overflow-hidden ${stageClassName}`}
      >
        <div className="print-scroll__frame">
          <picture>
            {/* Reduced motion shows the finished picture; phones get the smaller frames. */}
            {mobileFrames && (
              <source
                media={`(prefers-reduced-motion: reduce) and ${mobileQuery}`}
                srcSet={last(mobileFrames)}
              />
            )}
            <source media="(prefers-reduced-motion: reduce)" srcSet={last(frames)} />
            {mobileFrames && (
              <source media={mobileQuery} srcSet={framePath(mobileFrames.pattern, 0)} />
            )}
            {/* oxlint-disable-next-line nextjs/no-img-element -- art direction by media query; the frames are already sized WebP */}
            <img
              src={framePath(frames.pattern, 0)}
              alt={alt}
              width={frames.width}
              height={frames.height}
              fetchPriority="high"
              className="size-full"
            />
          </picture>
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="print-scroll__canvas absolute inset-0 size-full"
          />
          {signature && (
            // oxlint-disable-next-line nextjs/no-img-element
            <img
              src={signature.src}
              alt=""
              className="print-scroll__signature absolute h-auto"
              style={{
                left: `${signature.x * 100}%`,
                top: `${signature.y * 100}%`,
                width: `${signature.width * 100}%`,
              }}
            />
          )}
        </div>

        {/* Darker where the text is; gone while the picture prints. */}
        <div
          aria-hidden="true"
          className="print-scroll__shade absolute inset-0 bg-linear-to-t from-black/85 via-black/35 to-black/0 lg:bg-linear-to-tr lg:from-black/85 lg:via-black/25 lg:to-black/0"
        />

        <div className="on-dark absolute inset-0 grid content-end p-4 text-white sm:p-6 md:p-8">
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
          <span className="block h-full w-1/3 animate-[loading-bar_1.2s_ease-in-out_infinite] bg-white/80" />
        </div>

        {children}
      </div>
    </section>
  )
}
