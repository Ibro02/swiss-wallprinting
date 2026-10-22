import type { ComponentProps } from 'react'

/**
 * The side padding of every section. The page frame (`FRAME`, in the layout) sets the
 * width; this padding is the same as inside the hero card, so the text of every section
 * lines up with the header pill and the hero headline.
 */
export function Container({ className, ...props }: ComponentProps<'div'>) {
  return <div {...props} className={`w-full px-4 sm:px-6 md:px-8 ${className ?? ''}`} />
}

/** Vertical space of a section on the white ground (56, 64, 80 px). */
export const SECTION_Y = 'py-14 sm:py-16 lg:py-20'

/** Vertical space inside a mist or dark card (48, 56, 64 px). */
export const CARD_Y = 'py-12 sm:py-14 lg:py-16'

/**
 * Phones: a row of cards to swipe instead of a tall stack, with snap points, the next card
 * peeking in, and the page padding kept (it scrolls under the edge). From `sm` the list is
 * a normal block again, for the grid or columns of the section.
 */
export const PHONE_SWIPE =
  'max-sm:-mx-4 max-sm:flex max-sm:snap-x max-sm:snap-mandatory max-sm:scroll-px-4 max-sm:overflow-x-auto max-sm:overscroll-x-contain max-sm:px-4 max-sm:pb-2 max-sm:[scrollbar-width:none]'

/** One card of a `PHONE_SWIPE` row. */
export const PHONE_SWIPE_ITEM = 'max-sm:w-[84%] max-sm:shrink-0 max-sm:snap-start'

/** The width of the page and its white frame around the cards (12, 16, 24 px). */
export const FRAME = 'mx-auto w-full max-w-[92rem] px-3 sm:px-4 md:px-6'
