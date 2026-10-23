import { getTranslations } from 'next-intl/server'
import { accent } from '@/components/Accent.tsx'
import { AreaCard } from '@/components/AreaCard.tsx'
import { Container, SECTION_Y } from '@/components/Container.tsx'
import { HomeIcon, OfficeIcon } from '@/components/icons.tsx'
import { SectionHeading } from '@/components/SectionHeading.tsx'
import { PAGES } from '@/i18n/pages.ts'

// "Who are our services for?" (the client's brief, 2026-10-22): two kinds of clients, side
// by side, as the same cards as the application areas on the home page (AreaCard: rise,
// lime rim and glow under the mouse). The business card names his emphasis, a company's
// history and identity on its walls; each card ends with the promise in the serif accent
// and opens the configurator with a matching room (office, home).

const AUDIENCES = [
  { key: 'business', Icon: OfficeIcon, area: 'office' },
  { key: 'private', Icon: HomeIcon, area: 'home' },
] as const

export async function Audiences() {
  const t = await getTranslations('Services.audiences')

  return (
    <section aria-labelledby="audiences-title" className={SECTION_Y}>
      <Container>
        <SectionHeading
          id="audiences-title"
          eyebrow={t('eyebrow')}
          title={t.rich('title', accent)}
        />
        <ul className="mt-8 grid gap-3 sm:mt-10 md:grid-cols-2">
          {AUDIENCES.map(({ key, Icon, area }, index) => (
            <li key={key} data-reveal={String(index + 1)}>
              <AreaCard
                href={{ pathname: PAGES.tryYourWall, query: { area } }}
                Icon={Icon}
                title={t(`${key}.title`)}
                text={t(`${key}.text`)}
                accent={t(`${key}.highlight`)}
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
