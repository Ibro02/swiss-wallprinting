import { getFormatter, getTranslations } from 'next-intl/server'
import { accent } from '@/components/Accent.tsx'
import { CARD_Y, Container } from '@/components/Container.tsx'
import { SectionHeading } from '@/components/SectionHeading.tsx'
import { printFacts } from '@/content/company.ts'

// What the client prints, from the old site: "un logo aziendale, un'immagine artistica,
// una frase ispirazionale o una grafica su misura", on interior and exterior walls.
// A dark card; each kind has one of the printer's four ink colours as a small swatch.

const KINDS = [
  { key: 'logo', ink: 'bg-ink-cyan' },
  { key: 'art', ink: 'bg-ink-magenta' },
  { key: 'phrase', ink: 'bg-ink-yellow' },
  { key: 'custom', ink: 'bg-ink-black' },
] as const

export async function WhatWePrint() {
  const t = await getTranslations('Services.what')
  const format = await getFormatter()
  const height = `${format.number(printFacts.maxPrintHeightM, { minimumFractionDigits: 2 })} m`

  return (
    <section
      aria-labelledby="what-title"
      className="on-dark rounded-2xl bg-graphite text-white sm:rounded-3xl"
    >
      <Container className={CARD_Y}>
        <SectionHeading
          id="what-title"
          eyebrow={t('eyebrow')}
          title={t.rich('title', accent)}
          tone="dark"
        >
          <p>{t('intro', { height, years: printFacts.durabilityYears })}</p>
        </SectionHeading>
        {/* Phones: two by two, each card as tall as its text, so the list stays short. */}
        <ul className="mt-6 grid grid-cols-2 gap-2 sm:mt-10 sm:gap-3 lg:grid-cols-4">
          {KINDS.map((kind, index) => (
            <li
              key={kind.key}
              data-reveal={String(index + 1)}
              className="flex flex-col rounded-2xl bg-white/[0.05] p-4 ring-1 ring-white/10 ring-inset sm:min-h-48 sm:p-6"
            >
              <span
                aria-hidden="true"
                className={`block size-3 rounded-[3px] ring-1 ring-white/25 ${kind.ink}`}
              />
              <h3 className="mt-auto pt-5 text-base font-medium tracking-tight sm:pt-8 sm:text-lg">
                {t(`kinds.${kind.key}.title`)}
              </h3>
              <p className="mt-1.5 text-[0.8125rem] leading-snug text-mute-dark sm:mt-2 sm:text-sm sm:leading-relaxed">
                {t(`kinds.${kind.key}.text`)}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
