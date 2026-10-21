import { getFormatter, getTranslations } from 'next-intl/server'
import { Container } from '@/components/Container.tsx'
import { CheckIcon } from '@/components/icons.tsx'
import { SectionHeading } from '@/components/SectionHeading.tsx'
import { printFacts } from '@/content/company.ts'

// "Why Swiss Wall Printing": the facts from the old site as large numbers.
// The numbers come from the content file, never from the message files.

const FEATURES = ['noFilm', 'inOut', 'anyDesign', 'freeQuote'] as const

export async function WhySection() {
  const t = await getTranslations('Home.why')
  const format = await getFormatter()

  const stats = [
    {
      key: 'height',
      // No-break space: "3,80" and "m" stay on one line.
      value: `${format.number(printFacts.maxPrintHeightM, { minimumFractionDigits: 2 })} m`,
    },
    { key: 'width', value: '∞' },
    { key: 'durability', value: `${printFacts.durabilityYears}+` },
    { key: 'ink', value: 'Eco' },
  ] as const

  return (
    <section
      aria-labelledby="why-title"
      className="on-dark bg-graphite py-24 text-plaster sm:py-32"
    >
      <Container>
        <SectionHeading id="why-title" eyebrow={t('eyebrow')} title={t('title')} tone="dark">
          <p>{t('intro')}</p>
        </SectionHeading>

        <dl className="mt-16 grid gap-px overflow-hidden rounded-3xl bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.key} className="flex flex-col-reverse gap-3 bg-graphite p-8">
              <dt className="text-sm leading-relaxed text-mute-dark">{t(`stats.${stat.key}`)}</dt>
              <dd className="font-display text-5xl font-light whitespace-nowrap text-lime lg:text-4xl xl:text-5xl">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-lime text-graphite">
                <CheckIcon className="size-4" />
              </span>
              <span className="text-plaster/85">{t(`features.${feature}`)}</span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
