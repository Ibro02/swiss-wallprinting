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
import { GlowCard } from '@/islands/GlowCard.tsx'

// Pattern from wall-wonderprint.art/anwendungen: one card per area, with an icon, a title,
// and one line (the author prefers these cards to picture tiles). Each card opens the
// configurator with the area as a preset. Phones: the icon beside the text and an arrow,
// so six cards stay short. Mouse: the card tilts toward the pointer and a lime light
// follows it (GlowCard).

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
                <GlowCard
                  tilt
                  className="rounded-2xl bg-plaster [--glow-strength:0.55] hover:bg-white hover:shadow-[0_24px_48px_-28px_rgb(0_0_0/0.4)] sm:rounded-3xl"
                >
                  <Link
                    href={{ pathname: PAGES.tryYourWall, query: { area: area.id } }}
                    className="group flex h-full items-start gap-4 rounded-[inherit] p-4 sm:flex-col sm:gap-0 sm:p-6"
                  >
                    <span className="grid size-10 shrink-0 place-items-center text-graphite sm:size-11 sm:place-items-start">
                      <Icon className="size-6" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col sm:mt-5">
                      <span className="text-base font-medium tracking-tight sm:text-lg">
                        {area.title[locale]}
                      </span>
                      <span className="mt-1 flex-1 text-sm leading-relaxed text-mute sm:mt-1.5">
                        {area.line[locale]}
                      </span>
                      <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-magenta-700 max-sm:sr-only">
                        {t('tryIt')}
                        <ArrowRightIcon className="size-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5 motion-reduce:transition-none" />
                      </span>
                    </span>
                    <ArrowRightIcon
                      aria-hidden="true"
                      className="mt-2.5 size-4 shrink-0 text-magenta-700 sm:hidden"
                    />
                  </Link>
                </GlowCard>
              </li>
            )
          })}
        </ul>
      </Container>
    </section>
  )
}
