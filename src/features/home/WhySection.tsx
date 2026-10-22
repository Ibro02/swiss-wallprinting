import { getFormatter, getTranslations } from 'next-intl/server'
import { accent } from '@/components/Accent.tsx'
import { CARD_Y, Container } from '@/components/Container.tsx'
import { CheckIcon } from '@/components/icons.tsx'
import { SectionHeading } from '@/components/SectionHeading.tsx'
import { printFacts } from '@/content/company.ts'

// "Why Swiss Wall Printing": a dark card with the facts from the old site as large lime
// numbers, then the four promises. The numbers come from the content file, never from
// the message files.

const FEATURES = ['noFilm', 'inOut', 'anyDesign', 'freeQuote'] as const

export async function WhySection() {
  const t = await getTranslations('Home.why')
  const format = await getFormatter()

  const stats = [
    {
      key: 'height',
      // No-break space: "3,80" and "m" stay on one line.
      value: `${format.number(printFacts.maxPrintHeightM, { minimumFractionDigits: 2 })} m`,
    },
    { key: 'width', value: '∞' },
    { key: 'durability', value: `${printFacts.durabilityYears}+` },
    { key: 'ink', value: 'Eco' },
  ] as const

  return (
    <section
      aria-labelledby="why-title"
      className="on-dark rounded-2xl bg-graphite text-white sm:rounded-3xl"
    >
      <Container className={CARD_Y}>
        <SectionHeading
          id="why-title"
          eyebrow={t('eyebrow')}
          title={t.rich('title', accent)}
          tone="dark"
        >
          <p>{t('intro')}</p>
        </SectionHeading>

        {/* Phones: two by two, each card as tall as its text, so the section fits one screen. */}
        <dl className="mt-6 grid grid-cols-2 gap-2 sm:mt-10 sm:gap-3 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={stat.key}
              data-reveal={String(index + 1)}
              className="flex flex-col-reverse justify-end gap-2 rounded-2xl bg-white/[0.05] p-4 ring-1 ring-white/10 ring-inset sm:min-h-40 sm:justify-between sm:gap-5 sm:p-6"
            >
              <dt className="max-w-[16rem] text-[0.8125rem] leading-snug text-mute-dark sm:text-sm sm:leading-relaxed">
                {t(`stats.${stat.key}`)}
              </dt>
              <dd className="text-stat font-medium whitespace-nowrap text-lime">{stat.value}</dd>
            </div>
          ))}
        </dl>

        <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 sm:mt-8 sm:gap-x-8 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-2 text-[0.8125rem] leading-snug sm:gap-3 sm:text-sm sm:leading-relaxed"
            >
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-lime text-graphite sm:mt-0.5">
                <CheckIcon className="size-3.5" />
              </span>
              <span className="text-white/80">{t(`features.${feature}`)}</span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
