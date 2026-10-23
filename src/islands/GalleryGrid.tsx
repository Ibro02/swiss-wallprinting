'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { type KeyboardEvent, useRef, useState } from 'react'
import { ArrowRightIcon, CloseIcon } from '@/components/icons.tsx'
import type { ImageAsset } from '@/content/images/types.ts'

// Gallery (Development Plan 4.5): filter by application area, masonry grid, and a lightbox.
// The lightbox is a native <dialog> (focus trap, Escape, focus back to the photo).
// Without JavaScript the grid shows all photos; the photos are not links.
//
// In the lightbox on a touch screen the photos are a row of slides with CSS scroll snapping:
// a swipe moves one photo (the author, 2026-10-23), with the browser's own touch physics and
// no gesture code; the buttons and the arrow keys scroll the same row. With a mouse there is
// no row to scroll (the author: no scrollbar on a desktop): the slides lie on top of each
// other and the open one fades in (`.lightbox` in globals.css). Only the open photo and its
// neighbours load.

export interface GalleryEntry {
  id: string
  image: ImageAsset
  alt: string
  caption: string
  area?: string
  mock: boolean
}

interface GalleryGridProps {
  items: readonly GalleryEntry[]
  /** Area filters that have at least one photo: [id, label]. */
  filters: readonly (readonly [id: string, label: string])[]
}

const ALL = 'all'

/** The keys that move the lightbox one photo. */
const STEP_KEYS: Partial<Record<string, number>> = { ArrowRight: 1, ArrowLeft: -1 }

export function GalleryGrid({ items, filters }: GalleryGridProps) {
  const t = useTranslations('GalleryGrid')
  const [filter, setFilter] = useState(ALL)
  const [open, setOpen] = useState<number | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const slides = useRef<HTMLDivElement>(null)

  const shown = filter === ALL ? items : items.filter((item) => item.area === filter)
  const current = open === null ? undefined : shown[open]
  const atStart = open === 0
  const atEnd = open === shown.length - 1

  const show = (index: number) => {
    setOpen(index)
    if (!dialog.current?.open) dialog.current?.showModal()
    // Straight to the photo, before the dialog's first frame: no slide from the first one.
    // (With a mouse the row does not scroll, and this does nothing.)
    const row = slides.current
    row?.scrollTo({ left: index * row.clientWidth, behavior: 'instant' })
  }
  const step = (by: number) => {
    const row = slides.current
    if (open === null || !row) return
    const next = open + by
    if (next < 0 || next >= shown.length) return
    // The swipe row: smooth through its CSS scroll-behavior (instant with reduced motion),
    // and `onSlide` follows. The stacked slides: the next one fades in.
    if (row.scrollWidth > row.clientWidth) row.scrollTo({ left: next * row.clientWidth })
    else setOpen(next)
  }
  // The photo in view is the open one: a swipe, a button, or a key moved the row.
  const onSlide = () => {
    const row = slides.current
    if (row && dialog.current?.open) setOpen(Math.round(row.scrollLeft / row.clientWidth))
  }
  const onDialogKey = (event: KeyboardEvent<HTMLDialogElement>) => {
    const by = STEP_KEYS[event.key]
    if (by === undefined) return
    // The row would scroll itself too when it has the focus.
    event.preventDefault()
    step(by)
  }

  return (
    <>
      <fieldset className="flex flex-wrap gap-2">
        <legend className="sr-only">{t('filterLabel')}</legend>
        {[[ALL, t('all')] as const, ...filters].map(([id, label]) => (
          <button
            key={id}
            type="button"
            aria-pressed={filter === id}
            onClick={() => setFilter(id)}
            className="h-9 rounded-lg px-3.5 text-sm font-medium ring-1 ring-ink/12 ring-inset transition-[background-color,color,transform] duration-150 ease-out hover:bg-plaster active:scale-[0.97] aria-pressed:bg-lime aria-pressed:text-graphite aria-pressed:ring-lime motion-reduce:active:scale-100"
          >
            {label}
          </button>
        ))}
      </fieldset>

      <p className="sr-only" aria-live="polite">
        {t('count', { count: shown.length })}
      </p>

      {/* Phones: two columns of smaller photos (the lightbox shows them large), so a phone
          decodes and scrolls half the pixels of one column of tall photos. */}
      <ul className="mt-8 columns-2 gap-2 sm:gap-3 lg:columns-3">
        {shown.map((item, index) => (
          <li key={item.id} className="mb-2 break-inside-avoid sm:mb-3">
            <button
              type="button"
              aria-haspopup="dialog"
              onClick={() => show(index)}
              className="group relative block w-full overflow-hidden rounded-2xl bg-plaster text-left sm:rounded-3xl"
            >
              <Image
                src={item.image.src}
                alt={item.alt}
                width={item.image.width}
                height={item.image.height}
                sizes="(min-width: 1024px) 33vw, 50vw"
                // Below the project cards (the projects page): every photo loads lazily.
                loading="lazy"
                placeholder="blur"
                blurDataURL={item.image.blurDataURL}
                className="h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
              />
              <span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent px-3 pt-10 pb-3 text-xs font-medium text-white sm:px-5 sm:pt-12 sm:pb-4 sm:text-sm">
                {item.caption}
              </span>
              {item.mock && (
                <span className="absolute top-4 left-4 rounded-full bg-white/85 px-2.5 py-0.5 text-[0.7rem] font-medium text-graphite backdrop-blur-md">
                  {t('mockBadge')}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      {/* The arrow keys and the backdrop click belong to the native modal dialog itself. */}
      {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <dialog
        ref={dialog}
        aria-label={current?.caption ?? t('dialogLabel')}
        onClose={() => setOpen(null)}
        onKeyDown={onDialogKey}
        onClick={(event) => {
          // A click on the backdrop (the dialog element itself) closes it.
          if (event.target === event.currentTarget) dialog.current?.close()
        }}
        className="on-dark m-auto max-h-none max-w-none bg-transparent p-0 text-white backdrop:bg-graphite/92 max-sm:w-full sm:backdrop:backdrop-blur-md"
      >
        {/* Phones: the whole width (the dialog's, not 100vw, which counts a desktop
            browser's scrollbar) and the screen below the buttons; wider screens: a frame. */}
        <div
          ref={slides}
          onScroll={onSlide}
          className="lightbox mt-18 h-[calc(100dvh-6rem)] w-full sm:mt-0 sm:h-[min(90dvh,900px)] sm:w-[min(94vw,1200px)]"
        >
          {shown.map((item, index) => (
            <figure
              key={item.id}
              aria-hidden={index !== open}
              className="lightbox__slide flex flex-col px-3 sm:px-0"
            >
              <div className="relative flex-1">
                {open !== null && Math.abs(index - open) <= 1 && (
                  <Image
                    src={item.image.src}
                    alt={item.alt}
                    fill
                    sizes="(min-width: 640px) 94vw, 100vw"
                    placeholder="blur"
                    blurDataURL={item.image.blurDataURL}
                    className="object-contain"
                  />
                )}
              </div>
              <figcaption className="pt-4 text-lg font-medium tracking-tight sm:text-center">
                {item.caption}
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="fixed top-4 left-4 flex h-11 items-center text-sm text-mute-dark">
          {current && t('position', { current: (open ?? 0) + 1, total: shown.length })}
        </p>
        <div className="fixed top-4 right-4 flex gap-2">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label={t('previous')}
            aria-disabled={atStart}
            className="grid size-11 rotate-180 place-items-center rounded-xl bg-white/10 transition-[background-color,transform,opacity] duration-150 ease-out hover:bg-white/20 active:scale-[0.97] aria-disabled:opacity-40 aria-disabled:active:scale-100"
          >
            <ArrowRightIcon className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label={t('next')}
            aria-disabled={atEnd}
            className="grid size-11 place-items-center rounded-xl bg-white/10 transition-[background-color,transform,opacity] duration-150 ease-out hover:bg-white/20 active:scale-[0.97] aria-disabled:opacity-40 aria-disabled:active:scale-100"
          >
            <ArrowRightIcon className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            aria-label={t('close')}
            className="grid size-11 place-items-center rounded-xl bg-white text-graphite transition-transform duration-150 ease-out active:scale-[0.97]"
          >
            <CloseIcon className="size-5" />
          </button>
        </div>
      </dialog>
    </>
  )
}
