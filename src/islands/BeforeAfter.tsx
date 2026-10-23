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

// Before/after card (Development Plan 4.4). Mouse: the split follows the pointer and goes
// back to the print when the pointer leaves. Touch: drag to move it (vertical scrolling
// still works). Keyboard: a slider (arrows, Page Up/Down, Home/End, Escape).
// Without JavaScript the card shows the print ("after").

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
    setDragging(true)
    move(event)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const next = splitByKey(split, event.key)
    if (next === undefined) return
    event.preventDefault()
    setSplit(next)
  }

  const value = Math.round(split)
  const style = { '--split': `${split}%` } as CSSProperties

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
      onPointerEnter={wantBefore}
      onFocus={wantBefore}
      onPointerMove={onPointerMove}
      onPointerDown={onPointerDown}
      onPointerUp={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse') setSplit(SPLIT_NONE)
      }}
      onKeyDown={onKeyDown}
      style={style}
      className="group relative aspect-[4/5] cursor-ew-resize touch-pan-y overflow-hidden rounded-xl bg-paper select-none sm:rounded-2xl"
    >
      {afterImage}
      <div className="absolute inset-0 [clip-path:inset(0_calc(100%-var(--split))_0_0)]">
        {beforeImage}
      </div>

      {/* Divider with a handle at the split; hidden while the print shows alone. */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 left-(--split) w-0.5 -translate-x-1/2 bg-white shadow-[0_0_0_1px_rgb(14_14_16/0.15)] transition-opacity ${split === 0 ? 'opacity-0' : 'opacity-100'}`}
      >
        <span className="absolute top-1/2 left-1/2 grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-graphite shadow-[0_8px_24px_-8px_rgb(0_0_0/0.45)]">
          ⇆
        </span>
      </div>

      <span
        aria-hidden="true"
        className={`absolute top-4 left-4 rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white backdrop-blur-md transition-opacity ${split > 12 ? 'opacity-100' : 'opacity-0'}`}
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
