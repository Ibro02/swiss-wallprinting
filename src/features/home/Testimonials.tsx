import { getFormatter, getTranslations } from 'next-intl/server'
import { Container } from '@/components/Container.tsx'
import { SectionHeading } from '@/components/SectionHeading.tsx'
import { Stars } from '@/components/Stars.tsx'
import { collections } from '@/content/index.ts'
import type { Testimonial } from '@/content/schema.ts'
import { ratingSummary } from './rating.ts'

// Pattern from faberwall.nl/reviews (Development Plan 4.2): rating summary, then
// review cards. Here the cards move as a slow band (pauses on hover and focus); with
// reduced motion the band stands still and scrolls by hand.

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
      className="flex w-[19rem] shrink-0 flex-col rounded-3xl bg-white p-6 shadow-[0_20px_40px_-30px_rgb(14_14_16/0.35)] ring-1 ring-graphite/5 sm:w-[22rem]"
    >
      <div className="flex items-center justify-between gap-3">
        <Stars rating={review.rating} label={starsLabel(review.rating)} />
        {review.mock && (
          <span className="rounded-full bg-plaster-200 px-2.5 py-1 text-[0.7rem] font-semibold tracking-wide text-mute uppercase">
            {t('mockBadge')}
          </span>
        )}
      </div>
      <blockquote lang={review.language} className="mt-4 flex-1 text-[0.95rem] leading-relaxed">
        <p>{review.text}</p>
      </blockquote>
      {review.ownerReply && (
        <div className="mt-4 rounded-2xl bg-plaster px-4 py-3 text-sm">
          <p className="text-xs font-semibold text-mute">{t('ownerReply')}</p>
          <p className="mt-1">{review.ownerReply}</p>
        </div>
      )}
      <div className="mt-6 flex items-center gap-3">
        <span
          aria-hidden="true"
          className={`grid size-10 place-items-center rounded-full font-display text-sm ${AVATAR_COLOURS[index % AVATAR_COLOURS.length]}`}
        >
          {review.author.charAt(0)}
        </span>
        <div className="text-sm">
          <p className="font-semibold">{review.author}</p>
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
    <section aria-labelledby="testimonials-title" className="py-24 sm:py-32">
      <Container className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeading id="testimonials-title" eyebrow={t('eyebrow')} title={t('title')} />
        <div className="flex items-center gap-5 rounded-3xl bg-white px-6 py-5 ring-1 ring-graphite/5">
          <p className="font-display text-5xl font-light">
            {format.number(summary.average, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
          </p>
          <div>
            <Stars rating={summary.average} label={starsLabel(summary.average)} />
            <p className="mt-1 text-sm font-semibold">{t(`band.${summary.band}`)}</p>
            <p className="text-sm text-mute">{t('basedOn', { count: summary.count })}</p>
          </div>
        </div>
      </Container>

      {hasMock && (
        <Container>
          <p className="mt-6 text-sm text-mute">{t('mockNote')}</p>
        </Container>
      )}

      <div className="mt-12 overflow-x-auto pb-4 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)] motion-safe:overflow-x-hidden">
        {/* Each list ends with the same gap (pr-5), so moving by 50% loops without a jump. */}
        <div className="marquee flex w-max pl-4 sm:pl-6 lg:pl-8">
          <ul className="flex gap-5 pr-5">{reviews.map(card)}</ul>
          {/* Second copy for the seamless loop: hidden from assistive tech and not shown with reduced motion. */}
          <ul className="flex gap-5 pr-5 motion-reduce:hidden" aria-hidden="true">
            {reviews.map(card)}
          </ul>
        </div>
      </div>
    </section>
  )
}
