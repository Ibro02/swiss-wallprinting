'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { type KeyboardEvent, useRef, useState } from 'react'
import { ArrowRightIcon, CloseIcon } from '@/components/icons.tsx'
import type { ImageAsset } from '@/content/images/types.ts'

// Gallery (Development Plan 4.5): filter by application area, masonry grid, and a lightbox.
// The lightbox is a native <dialog> (focus trap, Escape, focus back to the photo).
// Without JavaScript the grid shows all photos; the photos are not links.

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

export function GalleryGrid({ items, filters }: GalleryGridProps) {
  const t = useTranslations('GalleryGrid')
  const [filter, setFilter] = useState(ALL)
  const [open, setOpen] = useState<number | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)

  const shown = filter === ALL ? items : items.filter((item) => item.area === filter)
  const current = open === null ? undefined : shown[open]

  const show = (index: number) => {
    setOpen(index)
    if (!dialog.current?.open) dialog.current?.showModal()
  }
  const step = (by: number) => {
    if (open !== null) setOpen((open + by + shown.length) % shown.length)
  }
  const onDialogKey = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === 'ArrowRight') step(1)
    if (event.key === 'ArrowLeft') step(-1)
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
            className="h-10 rounded-full px-4 text-sm font-semibold ring-1 ring-graphite/15 ring-inset transition-colors hover:bg-graphite/5 aria-pressed:bg-graphite aria-pressed:text-plaster aria-pressed:ring-graphite"
          >
            {label}
          </button>
        ))}
      </fieldset>

      <p className="sr-only" aria-live="polite">
        {t('count', { count: shown.length })}
      </p>

      <ul className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3">
        {shown.map((item, index) => (
          <li key={item.id} className="mb-4 break-inside-avoid">
            <button
              type="button"
              aria-haspopup="dialog"
              onClick={() => show(index)}
              className="group relative block w-full overflow-hidden rounded-3xl bg-plaster-200 text-left"
            >
              <Image
                src={item.image.src}
                alt={item.alt}
                width={item.image.width}
                height={item.image.height}
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                placeholder="blur"
                blurDataURL={item.image.blurDataURL}
                className="h-auto w-full transition-transform duration-500 ease-(--ease-print) group-hover:scale-[1.03] motion-reduce:transition-none"
              />
              <span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-graphite/80 to-transparent px-5 pt-10 pb-4 text-sm font-semibold text-plaster">
                {item.caption}
              </span>
              {item.mock && (
                <span className="absolute top-3 left-3 rounded-full bg-plaster/90 px-2.5 py-1 text-[0.7rem] font-semibold tracking-wide text-mute uppercase">
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
        className="on-dark m-auto max-h-none max-w-none bg-transparent p-0 text-plaster backdrop:bg-graphite/90 backdrop:backdrop-blur-sm"
      >
        {current && (
          <figure className="flex h-[min(90dvh,900px)] w-[min(94vw,1200px)] flex-col">
            <div className="relative flex-1">
              <Image
                src={current.image.src}
                alt={current.alt}
                fill
                sizes="94vw"
                placeholder="blur"
                blurDataURL={current.image.blurDataURL}
                className="object-contain"
              />
            </div>
            <figcaption className="flex items-center justify-between gap-4 pt-4">
              <span className="font-display text-lg font-light">{current.caption}</span>
              <span className="text-sm text-mute-dark">
                {t('position', { current: (open ?? 0) + 1, total: shown.length })}
              </span>
            </figcaption>
          </figure>
        )}
        <div className="fixed top-4 right-4 flex gap-2">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label={t('previous')}
            className="grid size-11 rotate-180 place-items-center rounded-full bg-white/10 hover:bg-white/20"
          >
            <ArrowRightIcon className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label={t('next')}
            className="grid size-11 place-items-center rounded-full bg-white/10 hover:bg-white/20"
          >
            <ArrowRightIcon className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            aria-label={t('close')}
            className="grid size-11 place-items-center rounded-full bg-white text-graphite"
          >
            <CloseIcon className="size-5" />
          </button>
        </div>
      </dialog>
    </>
  )
}
