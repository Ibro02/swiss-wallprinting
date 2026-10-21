import { getFormatter, getLocale, getTranslations } from 'next-intl/server'
import { Container } from '@/components/Container.tsx'
import { ArrowRightIcon } from '@/components/icons.tsx'
import { images } from '@/content/images/index.ts'
import { collections } from '@/content/index.ts'
import { Link } from '@/i18n/navigation.ts'
import { PAGES } from '@/i18n/pages.ts'
import type { Locale } from '@/i18n/routing.ts'
import { BeforeAfter } from '@/islands/BeforeAfter.tsx'

// "Choose your situation" (pattern from muurprints.com/zakelijk), better: each card is a
// before/after slider, has the wall size, one value sentence, and opens the configurator
// with the same room as a preset.

export async function RoomCards() {
  const t = await getTranslations('Services.rooms')
  const format = await getFormatter()
  const locale = (await getLocale()) as Locale
  const metres = (value: number) => format.number(value, { minimumFractionDigits: 2 })
  const hasMock = collections.services.some((room) => room.mock)

  return (
    <section aria-labelledby="rooms-title" className="pb-24">
      <Container>
        <h2 id="rooms-title" className="font-display text-2xl font-light sm:text-3xl">
          {t('title')}
        </h2>
        {hasMock && <p className="mt-3 text-sm text-mute">{t('mockNote')}</p>}

        <ul className="mt-10 grid gap-x-8 gap-y-14 lg:grid-cols-2">
          {collections.services.map((room) => {
            const area = collections.applicationAreas.find(
              (candidate) => candidate.id === room.area,
            )
            if (!area) return null
            return (
              <li key={room.id}>
                <BeforeAfter
                  before={images[room.before]}
                  after={images[room.after]}
                  beforeAlt={room.alt.before[locale]}
                  afterAlt={room.alt.after[locale]}
                  label={t('sliderLabel', { room: area.title[locale] })}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
                <div className="mt-5 flex items-start justify-between gap-6">
                  <div>
                    <h3 className="font-display text-xl font-light">{area.title[locale]}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-mute">{area.line[locale]}</p>
                  </div>
                  <p className="shrink-0 text-sm text-mute">
                    <span className="sr-only">{t('wallSize')} </span>
                    {metres(room.wall.widthM)} × {metres(room.wall.heightM)} m
                  </p>
                </div>
                <Link
                  href={{ pathname: PAGES.tryYourWall, query: { area: room.area } }}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-magenta-700"
                >
                  {t('tryThisWall')}
                  <ArrowRightIcon className="size-4" />
                </Link>
              </li>
            )
          })}
        </ul>
      </Container>
    </section>
  )
}
