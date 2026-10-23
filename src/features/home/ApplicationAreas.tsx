import type { ComponentType, SVGProps } from 'react'
import { getLocale, getTranslations } from 'next-intl/server'
import { accent } from '@/components/Accent.tsx'
import { Container } from '@/components/Container.tsx'
import { AreaCard } from '@/components/AreaCard.tsx'
import {
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
import { PAGES } from '@/i18n/pages.ts'
import type { Locale } from '@/i18n/routing.ts'

// Pattern from wall-wonderprint.art/anwendungen: one card per area, with an icon, a title,
// and one line (the author prefers these cards to picture tiles). Each card opens the
// configurator with the area as a preset. The layout is Framer's "Programs" (the author,
// 2026-10-22): the icon in a tinted tile and a number at the foot; under the mouse the
// card rises, its rim and glow turn lime, and a band of lime light sweeps across once
// (`AreaCard`, `.lift-card` in globals.css, CSS only). The cards keep the mist colour of the page
// (the author: not black on white). Phones: the icon beside the text and an arrow, so six
// cards stay short.

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
          {collections.applicationAreas.map((area, index) => (
            <li key={area.id} data-reveal={String((index % 3) + 1)}>
              <AreaCard
                href={{ pathname: PAGES.tryYourWall, query: { area: area.id } }}
                Icon={ICONS[area.icon]}
                title={area.title[locale]}
                text={area.line[locale]}
                cta={t('tryIt')}
                number={index + 1}
              />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
