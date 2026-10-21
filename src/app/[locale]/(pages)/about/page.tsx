import Image from 'next/image'
import { getFormatter, getTranslations } from 'next-intl/server'
import tigerMidPrint from '@/assets/photos/tiger-mid-print.jpg'
import { Container } from '@/components/Container.tsx'
import { CtaBand } from '@/components/CtaBand.tsx'
import { PageHeader } from '@/components/PageHeader.tsx'
import { company, printFacts } from '@/content/company.ts'
import { metadataFor } from '@/i18n/metadata.ts'

export const generateMetadata = metadataFor('about')

// "Something simple with a picture" (README). The text uses only facts from the old site
// until the client sends the company story and team photos (Q10).
export default async function AboutPage() {
  const t = await getTranslations('About')
  const format = await getFormatter()
  const height = `${format.number(printFacts.maxPrintHeightM, { minimumFractionDigits: 2 })} m`

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <PageHeader eyebrow={t('eyebrow')} title={t('title')}>
        <p>{t('lead', { locality: company.locality })}</p>
      </PageHeader>

      <section className="pb-24">
        <Container className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <Image
            src={tigerMidPrint}
            alt={t('imageAlt')}
            sizes="(min-width: 1024px) 50vw, 100vw"
            placeholder="blur"
            className="h-auto w-full rounded-[2rem]"
          />
          <div className="space-y-5 text-base leading-relaxed sm:text-lg">
            <p>{t('story.what')}</p>
            <p>{t('story.how', { height, years: printFacts.durabilityYears })}</p>
            <p>{t('story.who')}</p>
            <p className="font-display text-2xl leading-snug font-light">{t('story.canvas')}</p>
          </div>
        </Container>
      </section>

      <div className="pb-24">
        <CtaBand />
      </div>
    </main>
  )
}
