import type { ComponentType, SVGProps } from 'react'
import { getLocale, getTranslations } from 'next-intl/server'
import { accent } from '@/components/Accent.tsx'
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

// Pattern from wall-wonderprint.art/anwendungen: one card per area, with an icon, a title,
// and one line (the author prefers these cards to picture tiles). Each card opens the
// configurator with the area as a preset. The look is Framer's "Programs" (the author,
// 2026-10-22): dark cards with the icon in a tinted tile and a number at the foot; under
// the mouse the card rises, its rim and glow turn lime, and a band of lime light sweeps
// across once (`.area-card` in globals.css, CSS only). Phones: the icon beside the text
// and an arrow, so six cards stay short.

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
    <section aria-labelledby="areas-title" className="pb-14 sm:pb-16 lg:pb-20">
      <Container>
        <SectionHeading id="areas-title" eyebrow={t('eyebrow')} title={t.rich('title', accent)}>
          <p>{t('intro')}</p>
        </SectionHeading>

        <ul className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3">
          {collections.applicationAreas.map((area, index) => {
            const Icon = ICONS[area.icon]
            return (
              <li key={area.id} data-reveal={String((index % 3) + 1)}>
                <Link
                  href={{ pathname: PAGES.tryYourWall, query: { area: area.id } }}
                  className="area-card group on-dark relative isolate flex h-full items-center gap-4 overflow-clip rounded-2xl bg-graphite bg-linear-145 from-white/7 to-white/0 p-3.5 text-white sm:flex-col sm:items-start sm:gap-0 sm:rounded-3xl sm:p-7"
                >
                  <span aria-hidden="true" className="area-card__sweep" />
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-lime/12 text-lime sm:size-13 sm:rounded-[0.875rem]">
                    <Icon className="size-6" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col self-stretch sm:mt-5">
                    <span className="text-base font-medium tracking-tight sm:text-xl">
                      {area.title[locale]}
                    </span>
                    <span className="mt-0.5 flex-1 text-sm leading-relaxed text-white/72 sm:mt-2 sm:text-[0.9375rem]">
                      {area.line[locale]}
                    </span>
                    <span className="mt-6 flex items-center justify-between gap-4 max-sm:sr-only">
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-lime">
                        {t('tryIt')}
                        <ArrowRightIcon className="size-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5 motion-reduce:transition-none" />
                      </span>
                      <span
                        aria-hidden="true"
                        className="text-sm font-semibold text-white/50 tabular-nums"
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </span>
                  </span>
                  <ArrowRightIcon
                    aria-hidden="true"
                    className="size-4 shrink-0 text-lime sm:hidden"
                  />
                </Link>
              </li>
            )
          })}
        </ul>
      </Container>
    </section>
  )
}
