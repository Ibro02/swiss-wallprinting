import { getTranslations } from 'next-intl/server'
import { ButtonLink } from '@/components/Button.tsx'
import { Container } from '@/components/Container.tsx'
import { CubeIcon } from '@/components/icons.tsx'
import { PAGES } from '@/i18n/pages.ts'

// The closing call to action of the inner pages (pattern from muurprints.com: "put your
// own design on the wall"): open the configurator, or ask for a quote.

export async function CtaBand() {
  const t = await getTranslations('CtaBand')
  return (
    <section aria-labelledby="cta-title" className="pt-8 pb-8">
      <Container>
        <div className="on-dark flex flex-col gap-8 rounded-[2rem] bg-graphite px-6 py-12 text-plaster sm:px-12 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h2
              id="cta-title"
              className="font-display text-3xl leading-tight font-light sm:text-4xl"
            >
              {t('title')}
            </h2>
            <p className="mt-4 text-plaster/75">{t('text')}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href={PAGES.tryYourWall} size="lg">
              <CubeIcon className="size-5" />
              {t('configurator')}
            </ButtonLink>
            <ButtonLink href={PAGES.contact} variant="secondary-dark" size="lg">
              {t('quote')}
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  )
}
