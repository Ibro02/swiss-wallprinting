import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import tigerMidPrint from '@/assets/photos/tiger-mid-print.jpg'
import { accent } from '@/components/Accent.tsx'
import { Container, SECTION_Y } from '@/components/Container.tsx'
import { CtaBand } from '@/components/CtaBand.tsx'
import { PageHeader } from '@/components/PageHeader.tsx'
import { company } from '@/content/company.ts'
import { metadataFor } from '@/i18n/metadata.ts'

export const generateMetadata = metadataFor('about')

// "Something simple with a picture" (README). The story is the client's own ("O nama", brief
// of 2026-10-22), with three facts under it; the picture stays the tiger until the client
// sends photos of the team or the workshop.
const STORY = ['idea', 'how', 'every', 'care', 'where'] as const

export default async function AboutPage() {
  const t = await getTranslations('About')
  const facts = [
    [t('facts.founded'), String(company.founded)],
    [t('facts.base'), `${company.locality}, ${company.municipality}`],
    [t('facts.area'), t('facts.areaValue')],
  ] as const

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <PageHeader eyebrow={t('eyebrow')} title={t.rich('title', accent)}>
        <p>
          {t('lead', {
            year: String(company.founded),
            locality: company.locality,
            municipality: company.municipality,
          })}
        </p>
      </PageHeader>

      <section className={SECTION_Y}>
        <Container className="grid gap-8 lg:grid-cols-12 lg:items-stretch lg:gap-8">
          {/* The picture fills the height of the story beside it: both start and end together. */}
          <div
            data-reveal
            className="overflow-hidden rounded-2xl bg-graphite sm:rounded-3xl lg:col-span-7"
          >
            <Image
              src={tigerMidPrint}
              alt={t('imageAlt')}
              sizes="(min-width: 1024px) 55vw, 100vw"
              placeholder="blur"
              className="h-auto w-full lg:h-full lg:object-cover"
            />
          </div>
          <div
            data-reveal="2"
            className="space-y-4 text-base leading-relaxed text-ink/85 sm:text-[1.0625rem] lg:col-span-5 lg:col-start-8"
          >
            {STORY.map((part) => (
              <p key={part}>{t(`story.${part}`)}</p>
            ))}
            <p className="pt-3 font-serif text-2xl leading-snug text-magenta dark:text-lime italic sm:text-3xl">
              {t('story.canvas')}
            </p>
            <dl className="flex flex-wrap gap-x-8 gap-y-4 border-t border-ink/10 pt-6 text-sm">
              {facts.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-mute">{label}</dt>
                  <dd className="mt-1 font-medium whitespace-nowrap text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </section>

      <CtaBand />
    </main>
  )
}
