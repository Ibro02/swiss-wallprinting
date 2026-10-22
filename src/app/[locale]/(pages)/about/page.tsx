import Image from 'next/image'
import { getFormatter, getTranslations } from 'next-intl/server'
import tigerMidPrint from '@/assets/photos/tiger-mid-print.jpg'
import { accent } from '@/components/Accent.tsx'
import { Container, SECTION_Y } from '@/components/Container.tsx'
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
      <PageHeader eyebrow={t('eyebrow')} title={t.rich('title', accent)}>
        <p>{t('lead', { locality: company.locality })}</p>
      </PageHeader>

      <section className={SECTION_Y}>
        <Container className="grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-8">
          <div
            data-reveal
            className="overflow-hidden rounded-2xl bg-graphite sm:rounded-3xl lg:col-span-7"
          >
            <Image
              src={tigerMidPrint}
              alt={t('imageAlt')}
              sizes="(min-width: 1024px) 55vw, 100vw"
              placeholder="blur"
              className="h-auto w-full"
            />
          </div>
          <div
            data-reveal="2"
            className="space-y-4 text-base leading-relaxed text-ink/85 sm:text-[1.0625rem] lg:col-span-5 lg:col-start-8"
          >
            <p>{t('story.what')}</p>
            <p>{t('story.how', { height, years: printFacts.durabilityYears })}</p>
            <p>{t('story.who')}</p>
            <p className="pt-3 font-serif text-2xl leading-snug text-magenta dark:text-lime italic sm:text-3xl">
              {t('story.canvas')}
            </p>
          </div>
        </Container>
      </section>

      <CtaBand />
    </main>
  )
}
