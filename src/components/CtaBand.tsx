import { getTranslations } from 'next-intl/server'
import { accent } from '@/components/Accent.tsx'
import { ButtonLink } from '@/components/Button.tsx'
import { CARD_Y, Container } from '@/components/Container.tsx'
import { CubeIcon } from '@/components/icons.tsx'
import { PAGES } from '@/i18n/pages.ts'
import { ConfiguratorIntent } from '@/islands/ConfiguratorIntent.tsx'

// The closing call to action of the inner pages (pattern from muurprints.com: "put your
// own design on the wall"): a mist card above the dark footer, a large title, and the two
// next steps: open the configurator, or ask for a quote.

export async function CtaBand() {
  const t = await getTranslations('CtaBand')
  return (
    <section aria-labelledby="cta-title" className="rounded-2xl bg-plaster sm:rounded-3xl">
      <Container
        className={`flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-16 ${CARD_Y}`}
      >
        <div data-reveal className="max-w-2xl">
          <h2 id="cta-title" className="text-title font-medium text-balance">
            {t.rich('title', accent)}
          </h2>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-mute sm:text-[1.0625rem]">
            {t('text')}
          </p>
        </div>
        <div data-reveal="2" className="flex flex-wrap gap-3">
          <ConfiguratorIntent>
            <ButtonLink href={PAGES.tryYourWall} size="lg">
              <CubeIcon className="size-5" />
              {t('configurator')}
            </ButtonLink>
          </ConfiguratorIntent>
          <ButtonLink href={PAGES.contact} variant="secondary" size="lg">
            {t('quote')}
          </ButtonLink>
        </div>
      </Container>
    </section>
  )
}
