import type { ComponentType, SVGProps } from 'react'
import { getLocale, getTranslations } from 'next-intl/server'
import { Container } from '@/components/Container.tsx'
import {
  ArrowRightIcon,
  FacadeIcon,
  HomeIcon,
  HotelIcon,
  OfficeIcon,
  RestaurantIcon,
  SchoolIcon,
} from '@/components/icons.tsx'
import { SectionHeading } from '@/components/SectionHeading.tsx'
import { collections } from '@/content/index.ts'
import type { ApplicationArea } from '@/content/schema.ts'
import { Link } from '@/i18n/navigation.ts'
import { PAGES } from '@/i18n/pages.ts'
import type { Locale } from '@/i18n/routing.ts'

// Pattern from wall-wonderprint.art/anwendungen: icon cards with a title and one line.
// Each card opens the configurator with the area as a preset (read in Phase 4).

const ICONS: Record<ApplicationArea['icon'], ComponentType<SVGProps<SVGSVGElement>>> = {
  office: OfficeIcon,
  hotel: HotelIcon,
  restaurant: RestaurantIcon,
  school: SchoolIcon,
  home: HomeIcon,
  facade: FacadeIcon,
}

export async function ApplicationAreas() {
  const t = await getTranslations('Home.areas')
  const locale = (await getLocale()) as Locale

  return (
    <section aria-labelledby="areas-title" className="bg-plaster-200/60 py-24 sm:py-32">
      <Container>
        <SectionHeading id="areas-title" eyebrow={t('eyebrow')} title={t('title')}>
          <p>{t('intro')}</p>
        </SectionHeading>

        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.applicationAreas.map((area) => {
            const Icon = ICONS[area.icon]
            return (
              <li key={area.id}>
                <Link
                  href={{ pathname: PAGES.tryYourWall, query: { area: area.id } }}
                  className="group flex h-full flex-col rounded-3xl bg-white p-7 ring-1 ring-graphite/5 transition-[box-shadow,transform] duration-300 ease-(--ease-print) hover:-translate-y-1 hover:shadow-[0_24px_48px_-28px_rgb(14_14_16/0.45)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                  <span className="grid size-12 place-items-center rounded-2xl bg-graphite text-lime">
                    <Icon className="size-6" />
                  </span>
                  <span className="mt-6 font-display text-xl font-light">{area.title[locale]}</span>
                  <span className="mt-2 flex-1 text-sm leading-relaxed text-mute">
                    {area.line[locale]}
                  </span>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-magenta-700">
                    {t('tryIt')}
                    <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </Container>
    </section>
  )
}
