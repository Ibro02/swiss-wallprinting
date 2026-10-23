import { getLocale, getTranslations } from 'next-intl/server'
import type { ComponentType, CSSProperties, SVGProps } from 'react'
import { accent } from '@/components/Accent.tsx'
import { Container, SECTION_Y } from '@/components/Container.tsx'
import { ArrowRightIcon, CubeIcon, HomeIcon, OfficeIcon } from '@/components/icons.tsx'
import { SectionHeading } from '@/components/SectionHeading.tsx'
import { images } from '@/content/images/index.ts'
import { collections } from '@/content/index.ts'
import type { Audience, BeforeAfterPair } from '@/content/schema.ts'
import { Link } from '@/i18n/navigation.ts'
import { PAGES } from '@/i18n/pages.ts'
import type { Locale } from '@/i18n/routing.ts'
import { BeforeAfter } from '@/islands/BeforeAfter.tsx'

// "Who are our services for?" (the client's brief, 2026-10-22, and the author's prompt of
// 2026-10-23): his two groups of clients, business first. Each group is a mist card with his
// list of clients or rooms as tags, his message in the serif accent, and before/after cards
// of his own walls (src/content/services.ts): the business walls are tagged "identity" or
// "history", the emphasis of his brief. The private group ends with the configurator. From
// `md` each card is as wide as its photo's shape (Caviezel is 4:3, the others 4:5), so the
// whole picture shows and every card in a row is as tall. On phones the cards stack: a
// swipe row would take the gesture that drags the split.

/** The client's lists, in his order (keys in `Services.audiences.<group>.clients`). */
const BUSINESS_CLIENTS = [
  'architects',
  'planners',
  'interiorDesigners',
  'hotels',
  'restaurants',
  'offices',
  'shops',
  'schools',
  'museums',
  'salons',
  'garages',
  'others',
] as const
const PRIVATE_CLIENTS = ['livingRooms', 'bedrooms', 'childrensRooms', 'hallways', 'others'] as const

const LINK =
  'group inline-flex items-center gap-1.5 text-sm font-medium text-magenta-700 underline decoration-magenta-700/30 underline-offset-4 transition-[text-decoration-color] duration-150 hover:decoration-magenta-700 dark:text-magenta-200 dark:decoration-magenta-200/30 dark:hover:decoration-magenta-200'

const ARROW =
  'size-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5 motion-reduce:transition-none'

/** The configurator tile takes the place of a portrait card. */
const TILE_RATIO = 4 / 5
/** The widest a row of cards gets (the 92rem frame less its paddings), for `sizes`. */
const ROW_MAX_PX = 1320

/** Width over height of a pair's photos. */
const ratioOf = (pair: BeforeAfterPair) => images[pair.after].width / images[pair.after].height

export async function Audiences() {
  const t = await getTranslations('Services.audiences')
  const locale = (await getLocale()) as Locale
  const groups: readonly {
    key: Audience
    Icon: ComponentType<SVGProps<SVGSVGElement>>
    clients: readonly string[]
  }[] = [
    {
      key: 'business',
      Icon: OfficeIcon,
      clients: BUSINESS_CLIENTS.map((client) => t(`business.clients.${client}`)),
    },
    {
      key: 'private',
      Icon: HomeIcon,
      clients: PRIVATE_CLIENTS.map((client) => t(`private.clients.${client}`)),
    },
  ]
  const pairsOf = (key: Audience) => collections.services.filter((pair) => pair.audience === key)
  // The first card on the page loads at once (an LCP candidate); the others when near.
  const firstPair = groups.flatMap(({ key }) => pairsOf(key))[0]?.id

  return (
    <section aria-labelledby="audiences-title" className={SECTION_Y}>
      <Container>
        <SectionHeading id="audiences-title" eyebrow={t('eyebrow')} title={t.rich('title', accent)}>
          <p>{t('intro')}</p>
        </SectionHeading>

        <div className="mt-8 flex flex-col gap-3 sm:mt-10">
          {groups.map(({ key, Icon, clients }) => {
            const pairs = pairsOf(key)
            // Columns in the ratio of the photos: with equal heights, width = height × ratio.
            const ratios = [...pairs.map(ratioOf), ...(key === 'private' ? [TILE_RATIO] : [])]
            const total = ratios.reduce((sum, ratio) => sum + ratio, 0)
            const columns = ratios.map((ratio) => `minmax(0, ${ratio.toFixed(4)}fr)`).join(' ')
            const sizesOf = (pair: BeforeAfterPair) => {
              const share = ratioOf(pair) / total
              return `(min-width: 1536px) ${Math.round(share * ROW_MAX_PX)}px, (min-width: 768px) ${Math.round(share * 88)}vw, 100vw`
            }
            return (
              <article
                key={key}
                aria-labelledby={`audience-${key}`}
                className="rounded-2xl bg-plaster p-2 sm:rounded-3xl sm:p-3"
              >
                <header
                  data-reveal
                  className="flex flex-col gap-4 px-2 pt-4 pb-5 sm:px-4 sm:pt-5 sm:pb-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12"
                >
                  <div className="max-w-2xl">
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-lime/25 text-graphite sm:size-11 dark:bg-lime/12 dark:text-lime">
                        <Icon className="size-5 sm:size-6" />
                      </span>
                      <h3
                        id={`audience-${key}`}
                        className="text-xl font-medium tracking-tight sm:text-2xl"
                      >
                        {t(`${key}.title`)}
                      </h3>
                    </div>
                    <ul className="mt-4 flex flex-wrap gap-1.5">
                      {clients.map((client) => (
                        <li
                          key={client}
                          className="rounded-lg bg-paper px-2.5 py-1 text-[0.8125rem] text-ink/80 ring-1 ring-ink/8 sm:text-sm"
                        >
                          {client}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p className="max-w-md font-serif text-2xl leading-snug text-balance text-magenta-700 italic sm:text-3xl lg:text-right dark:text-lime">
                    {t(`${key}.highlight`)}
                  </p>
                </header>

                <ul
                  className="grid grid-cols-1 gap-x-3 gap-y-6 md:grid-cols-(--columns)"
                  style={{ '--columns': columns } as CSSProperties}
                >
                  {pairs.map((pair) => {
                    const place = pair.place[locale]
                    return (
                      <li key={pair.id} data-reveal className="flex flex-col">
                        <BeforeAfter
                          before={images[pair.before]}
                          after={images[pair.after]}
                          beforeAlt={pair.alt.before[locale]}
                          afterAlt={pair.alt.after[locale]}
                          label={t('sliderLabel', { place })}
                          sizes={sizesOf(pair)}
                          priority={pair.id === firstPair}
                        />
                        {/* Stacked at every width, so the link sits in the same place on each card. */}
                        <div className="flex flex-col items-start px-2 pt-3 pb-1">
                          <p className="rounded-full px-2.5 py-0.5 text-xs font-medium text-ink/70 ring-1 ring-ink/12 ring-inset">
                            {pair.tag[locale]}
                          </p>
                          <h4 className="mt-2 text-lg font-medium tracking-tight">{place}</h4>
                          {pair.project && (
                            <Link
                              href={{ pathname: PAGES.projects, hash: pair.project }}
                              // The visible words first, then the place (WCAG 2.5.3).
                              aria-label={`${t('seeProject')}: ${place}`}
                              className={`mt-1 ${LINK}`}
                            >
                              {t('seeProject')}
                              <ArrowRightIcon aria-hidden="true" className={ARROW} />
                            </Link>
                          )}
                        </div>
                      </li>
                    )
                  })}
                  {key === 'private' && (
                    <li data-reveal className="flex">
                      <Link
                        href={{ pathname: PAGES.tryYourWall, query: { area: 'home' } }}
                        className="lift-card group relative isolate flex w-full flex-col overflow-clip rounded-xl bg-paper p-5 sm:rounded-2xl sm:p-7"
                      >
                        <span aria-hidden="true" className="lift-card__sweep" />
                        <span className="grid size-11 place-items-center rounded-xl bg-lime/25 text-graphite sm:size-13 sm:rounded-[0.875rem] dark:bg-lime/12 dark:text-lime">
                          <CubeIcon className="size-6" />
                        </span>
                        <span className="mt-5 text-xl font-medium tracking-tight md:mt-auto md:pt-8">
                          {t('yourWall.title')}
                        </span>
                        <span className="mt-2 text-[0.9375rem] leading-relaxed text-mute">
                          {t('yourWall.text')}
                        </span>
                        <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-magenta-700 dark:text-magenta-200">
                          {t('yourWall.cta')}
                          <ArrowRightIcon aria-hidden="true" className={ARROW} />
                        </span>
                      </Link>
                    </li>
                  )}
                </ul>
              </article>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
