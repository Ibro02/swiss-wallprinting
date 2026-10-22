import { getFormatter, getLocale, getTranslations } from 'next-intl/server'
import { accent } from '@/components/Accent.tsx'
import { Container, SECTION_Y } from '@/components/Container.tsx'
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
    <section aria-labelledby="rooms-title" className={SECTION_Y}>
      <Container>
        <h2 id="rooms-title" data-reveal className="text-title font-medium text-balance">
          {t.rich('title', accent)}
        </h2>
        {hasMock && <p className="mt-4 max-w-xl text-sm text-mute">{t('mockNote')}</p>}

        <ul className="mt-8 grid gap-x-3 gap-y-10 sm:mt-10 lg:grid-cols-2 xl:grid-cols-3">
          {collections.services.map((room, index) => {
            const area = collections.applicationAreas.find(
              (candidate) => candidate.id === room.area,
            )
            if (!area) return null
            return (
              <li key={room.id} data-reveal>
                <BeforeAfter
                  before={images[room.before]}
                  after={images[room.after]}
                  beforeAlt={room.alt.before[locale]}
                  afterAlt={room.alt.after[locale]}
                  label={t('sliderLabel', { room: area.title[locale] })}
                  sizes="(min-width: 1280px) 30vw, (min-width: 1024px) 50vw, 100vw"
                  priority={index === 0}
                />
                <div className="mt-5 flex items-start justify-between gap-6 px-1">
                  <div>
                    <h3 className="text-xl font-medium tracking-tight">{area.title[locale]}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-mute">{area.line[locale]}</p>
                  </div>
                  <p className="shrink-0 text-sm text-mute tabular-nums">
                    <span className="sr-only">{t('wallSize')} </span>
                    {metres(room.wall.widthM)} × {metres(room.wall.heightM)} m
                  </p>
                </div>
                <Link
                  href={{ pathname: PAGES.tryYourWall, query: { area: room.area } }}
                  className="group mt-3 ml-1 inline-flex items-center gap-2 text-sm font-medium text-magenta-700 dark:text-magenta-200 underline decoration-magenta-700/30 underline-offset-4 transition-[text-decoration-color] duration-150 hover:decoration-magenta-700"
                >
                  {t('tryThisWall')}
                  <ArrowRightIcon className="size-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5 motion-reduce:transition-none" />
                </Link>
              </li>
            )
          })}
        </ul>
      </Container>
    </section>
  )
}
