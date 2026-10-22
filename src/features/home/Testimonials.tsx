import type { CSSProperties } from 'react'
import { getFormatter, getTranslations } from 'next-intl/server'
import { accent } from '@/components/Accent.tsx'
import { Container, SECTION_Y } from '@/components/Container.tsx'
import { SectionHeading } from '@/components/SectionHeading.tsx'
import { Stars } from '@/components/Stars.tsx'
import { collections } from '@/content/index.ts'
import type { Testimonial } from '@/content/schema.ts'
import { ratingSummary } from './rating.ts'

// Pattern from faberwall.nl/reviews (Development Plan 4.2): the rating summary, then the
// reviews as a slow band of mist cards that slides to the left, the next ones coming in
// from the right (the author prefers it to a static grid). It pauses under the mouse and
// while a card has focus; with reduced motion it stands still and scrolls by hand. Every
// mock review shows the "example" badge.

/** Seconds per review for one loop: about 35 px per second. */
const SECONDS_PER_CARD = 10

/** The initials in the logo's colours, in turn. */
const AVATAR_COLOURS = ['bg-lime text-graphite', 'bg-graphite text-lime', 'bg-magenta text-white']

export async function Testimonials() {
  const t = await getTranslations('Home.testimonials')
  const format = await getFormatter()
  const reviews = collections.testimonials
  if (reviews.length === 0) return null

  const summary = ratingSummary(reviews.map((review) => review.rating))
  const hasMock = reviews.some((review) => review.mock)
  const starsLabel = (rating: number) => t('starsLabel', { rating })

  const card = (review: Testimonial, index: number) => (
    <li
      key={review.id}
      className="flex w-[18rem] shrink-0 flex-col rounded-2xl bg-plaster p-5 sm:w-[22rem] sm:rounded-3xl sm:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <Stars rating={review.rating} label={starsLabel(review.rating)} />
        {review.mock && (
          <span className="rounded-full bg-white px-2.5 py-0.5 text-[0.7rem] font-medium text-mute ring-1 ring-graphite/8">
            {t('mockBadge')}
          </span>
        )}
      </div>
      <blockquote
        lang={review.language}
        className="mt-4 flex-1 text-[0.9375rem] leading-relaxed text-graphite/90"
      >
        <p>{review.text}</p>
      </blockquote>
      {review.ownerReply && (
        <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm">
          <p className="text-xs font-medium text-mute">{t('ownerReply')}</p>
          <p className="mt-1">{review.ownerReply}</p>
        </div>
      )}
      <div className="mt-5 flex items-center gap-3">
        <span
          aria-hidden="true"
          className={`grid size-9 place-items-center rounded-full text-sm font-medium ${AVATAR_COLOURS[index % AVATAR_COLOURS.length]}`}
        >
          {review.author.charAt(0)}
        </span>
        <div className="text-sm">
          <p className="font-medium">{review.author}</p>
          <p className="text-mute">
            {[review.place, format.dateTime(new Date(review.date), { dateStyle: 'medium' })]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
      </div>
    </li>
  )

  return (
    <section aria-labelledby="testimonials-title" className={SECTION_Y}>
      <Container>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            id="testimonials-title"
            eyebrow={t('eyebrow')}
            title={t.rich('title', accent)}
          />
          <div data-reveal="2" className="flex items-end gap-4 lg:pb-1">
            <p className="text-stat font-medium">
              {format.number(summary.average, {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })}
            </p>
            <div>
              <Stars rating={summary.average} label={starsLabel(summary.average)} />
              <p className="mt-1 text-sm font-medium">{t(`band.${summary.band}`)}</p>
              <p className="text-sm text-mute">{t('basedOn', { count: summary.count })}</p>
            </div>
          </div>
        </div>

        {hasMock && <p className="mt-6 max-w-xl text-sm text-mute">{t('mockNote')}</p>}
      </Container>

      {/* The band runs to the card frame's edges and fades out there. A region that takes
          the keyboard focus: with reduced motion it scrolls by hand, also with the keys. */}
      <section
        data-reveal="2"
        aria-labelledby="testimonials-title"
        // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scrolling region needs the focus (WCAG 2.1.1)
        tabIndex={0}
        className="marquee-band mt-8 overflow-x-auto [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)] sm:mt-10 motion-safe:overflow-x-hidden"
      >
        <div
          className="marquee flex w-max"
          style={{ '--marquee-duration': `${reviews.length * SECONDS_PER_CARD}s` } as CSSProperties}
        >
          {/* Both lists end with the same gap, so moving by half the width loops without a jump. */}
          <ul className="flex gap-3 pr-3">{reviews.map(card)}</ul>
          {/* The copy for the loop: hidden from assistive tech, and gone with reduced motion. */}
          <ul aria-hidden="true" className="flex gap-3 pr-3 motion-reduce:hidden">
            {reviews.map(card)}
          </ul>
        </div>
      </section>

      {/* WCAG 2.2.2: a way to stop the moving band, also on touch screens. A checkbox, so it
          works without JavaScript; the CSS pauses the band while it is checked. */}
      <Container className="mt-3 flex justify-end motion-reduce:hidden">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-mute ring-1 ring-graphite/12 transition-[background-color,color] duration-150 ease-out ring-inset select-none hover:bg-plaster has-checked:bg-graphite has-checked:text-white has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-graphite">
          <input type="checkbox" className="marquee-pause sr-only" />
          <span aria-hidden="true" className="tracking-[-0.15em]">
            ❙❙
          </span>
          {t('pause')}
        </label>
      </Container>
    </section>
  )
}
