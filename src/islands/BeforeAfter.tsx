'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import {
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { ImageAsset } from '@/content/images/types.ts'
import { SPLIT_NONE, splitAt, splitByKey } from '@/features/services/split.ts'

// Before/after card (Development Plan 4.4). Mouse: the split follows the pointer and eases
// back to the print when the pointer leaves. Touch: drag to move it (vertical scrolling
// still works). Keyboard: a slider (arrows, Page Up/Down, Home/End, Escape).
// Without JavaScript the card shows the print ("after").
//
// Once, when the card first comes into view with its "before" photo loaded, the split peeks
// at the blank wall and back (CSS: .before-after in globals.css), so a visitor learns that
// the card compares; any touch, hover, or key first cancels it. It starts from the print, as
// the server rendered it, so nothing flashes before hydration.

/** Share of the card that must be on screen before it peeks. */
const PEEK_VISIBLE = 0.6

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

interface BeforeAfterProps {
  before: ImageAsset
  after: ImageAsset
  beforeAlt: string
  afterAlt: string
  /** Accessible name, e.g. "Hotel: before and after". */
  label: string
  sizes: string
  /** The first card on the page: its photo is the LCP image, so it loads early, not lazily. */
  priority?: boolean
}

export function BeforeAfter({
  before,
  after,
  beforeAlt,
  afterAlt,
  label,
  sizes,
  priority = false,
}: BeforeAfterProps) {
  const t = useTranslations('BeforeAfter')
  const [split, setSplit] = useState(SPLIT_NONE)
  const [dragging, setDragging] = useState(false)
  // Easing back to the print after the mouse left (until the transition ends).
  const [returning, setReturning] = useState(false)
  // The one-time peek: 'waiting' until the card is in view, then 'running', then 'done'.
  const [peek, setPeek] = useState<'waiting' | 'running' | 'done'>('waiting')
  const [beforeLoaded, setBeforeLoaded] = useState(false)
  const root = useRef<HTMLDivElement>(null)

  // The "before" photo is fully clipped at the start, and the browser does not lazy-load a
  // clipped image. Load it when the card comes near the screen (or on the first hover or
  // focus), so the first hover shows the photo and not an empty frame.
  const [beforeWanted, setBeforeWanted] = useState(false)
  useEffect(() => {
    const element = root.current
    if (!element || beforeWanted) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setBeforeWanted(true)
      },
      { rootMargin: '300px' },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [beforeWanted])
  const wantBefore = () => setBeforeWanted(true)

  useEffect(() => {
    const element = root.current
    // Reduced motion: it never peeks (and globals.css has no peek animation for it).
    if (!element || peek !== 'waiting' || !beforeLoaded || reducedMotion()) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.intersectionRatio >= PEEK_VISIBLE)) setPeek('running')
      },
      { threshold: PEEK_VISIBLE },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [peek, beforeLoaded])

  /** The visitor takes over: no peek any more, and no easing back while they move it. */
  const takeOver = () => {
    setPeek('done')
    setReturning(false)
  }

  // The images do not change with the split: keep the same elements, so React skips them.
  const afterImage = useMemo(
    () => (
      <Image
        src={after.src}
        alt={afterAlt}
        fill
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        placeholder="blur"
        blurDataURL={after.blurDataURL}
        className="object-cover"
      />
    ),
    [after, afterAlt, sizes, priority],
  )
  const beforeImage = useMemo(
    () =>
      beforeWanted ? (
        <Image
          src={before.src}
          alt={beforeAlt}
          fill
          loading="eager"
          sizes={sizes}
          placeholder="blur"
          blurDataURL={before.blurDataURL}
          onLoad={() => setBeforeLoaded(true)}
          className="object-cover"
        />
      ) : null,
    [before, beforeAlt, sizes, beforeWanted],
  )

  const move = (event: PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect()
    setSplit(splitAt(event.clientX, box.left, box.width))
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' || dragging) move(event)
  }

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse') return
    takeOver()
    setDragging(true)
    move(event)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const next = splitByKey(split, event.key)
    if (next === undefined) return
    event.preventDefault()
    takeOver()
    setSplit(next)
  }

  const value = Math.round(split)
  // The divider and the "before" label show while the split is off the print, also while it
  // eases back or peeks.
  const moved = split !== SPLIT_NONE || returning || peek === 'running'
  // The card has the shape of its photos (the pipeline cuts both to the same size).
  const style = {
    '--split': `${split}%`,
    aspectRatio: `${after.width} / ${after.height}`,
  } as CSSProperties

  return (
    <div
      // A custom slider: the value follows the mouse hover, which a native range input cannot do.
      // Full slider ARIA and keys (splitByKey) instead.
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
      role="slider"
      ref={root}
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      aria-valuetext={value === 0 ? t('valueAfter') : t('valueText', { before: value })}
      onPointerEnter={(event) => {
        wantBefore()
        if (event.pointerType === 'mouse') takeOver()
      }}
      onFocus={wantBefore}
      onPointerMove={onPointerMove}
      onPointerDown={onPointerDown}
      onPointerUp={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
      onPointerLeave={(event) => {
        if (event.pointerType !== 'mouse') return
        setReturning(split !== SPLIT_NONE && !reducedMotion())
        setSplit(SPLIT_NONE)
      }}
      onTransitionEnd={(event) => {
        if (event.target === event.currentTarget && event.propertyName === '--split') {
          setReturning(false)
        }
      }}
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget && event.animationName === 'split-peek') {
          setPeek('done')
        }
      }}
      data-returning={returning || undefined}
      data-peek={peek === 'running' || undefined}
      onKeyDown={onKeyDown}
      style={style}
      className="before-after group relative cursor-ew-resize touch-pan-y overflow-hidden rounded-xl bg-paper select-none sm:rounded-2xl"
    >
      {afterImage}
      <div className="absolute inset-0 [clip-path:inset(0_calc(100%-var(--split))_0_0)]">
        {beforeImage}
      </div>

      {/* Divider with a handle at the split; hidden while the print shows alone. */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 left-(--split) w-0.5 -translate-x-1/2 bg-white shadow-[0_0_0_1px_rgb(14_14_16/0.15)] transition-opacity ${moved ? 'opacity-100' : 'opacity-0'}`}
      >
        <span className="absolute top-1/2 left-1/2 grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-graphite shadow-[0_8px_24px_-8px_rgb(0_0_0/0.45)]">
          ⇆
        </span>
      </div>

      <span
        aria-hidden="true"
        className={`absolute top-4 left-4 rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white backdrop-blur-md transition-opacity ${split > 12 || peek === 'running' ? 'opacity-100' : 'opacity-0'}`}
      >
        {t('before')}
      </span>
      <span
        aria-hidden="true"
        className="absolute top-4 right-4 rounded-full bg-magenta px-3 py-1 text-xs font-medium text-white"
      >
        {t('after')}
      </span>
      <span
        aria-hidden="true"
        className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-xs whitespace-nowrap text-white backdrop-blur-md transition-opacity group-focus-visible:opacity-100 group-hover:opacity-0 pointer-coarse:hidden"
      >
        {t('hintPointer')}
      </span>
      <span
        aria-hidden="true"
        className="absolute bottom-4 left-1/2 hidden -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-xs whitespace-nowrap text-white backdrop-blur-md pointer-coarse:block"
      >
        {t('hintTouch')}
      </span>
    </div>
  )
}
