import { getFormatter, getTranslations } from 'next-intl/server'
import { accent } from '@/components/Accent.tsx'
import { Container, PHONE_SWIPE, PHONE_SWIPE_ITEM, SECTION_Y } from '@/components/Container.tsx'
import { SectionHeading } from '@/components/SectionHeading.tsx'
import { Stars } from '@/components/Stars.tsx'
import { collections } from '@/content/index.ts'
import type { Testimonial } from '@/content/schema.ts'
import { ratingSummary } from './rating.ts'

// Pattern from faberwall.nl/reviews (Development Plan 4.2): the rating summary, then the
// reviews. Here a calm masonry of mist cards (columns), not a moving band: every review
// can be read at its own pace; on phones a row to swipe. Every mock review shows the
// "example" badge.

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
      data-reveal
      className={`flex break-inside-avoid flex-col rounded-2xl bg-plaster p-5 sm:mb-3 sm:rounded-3xl sm:p-6 ${PHONE_SWIPE_ITEM}`}
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
        className="mt-4 text-[0.9375rem] leading-relaxed text-graphite/90"
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

        <ul className={`mt-8 gap-3 sm:mt-10 sm:columns-2 lg:columns-3 ${PHONE_SWIPE}`}>
          {reviews.map(card)}
        </ul>
      </Container>
    </section>
  )
}
