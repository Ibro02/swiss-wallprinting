import { getFormatter, getTranslations } from 'next-intl/server'
import { Container } from '@/components/Container.tsx'
import { SectionHeading } from '@/components/SectionHeading.tsx'
import { printFacts } from '@/content/company.ts'

// What the client prints, from the old site: "un logo aziendale, un'immagine artistica,
// una frase ispirazionale o una grafica su misura", on interior and exterior walls.

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
    <section aria-labelledby="what-title" className="bg-plaster-200/60 py-24">
      <Container>
        <SectionHeading id="what-title" eyebrow={t('eyebrow')} title={t('title')}>
          <p>{t('intro', { height, years: printFacts.durabilityYears })}</p>
        </SectionHeading>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {KINDS.map((kind) => (
            <li key={kind.key} className="rounded-3xl bg-white p-7 ring-1 ring-graphite/5">
              <span aria-hidden="true" className={`block h-1 w-10 rounded-full ${kind.ink}`} />
              <h3 className="mt-6 font-display text-lg font-light">
                {t(`kinds.${kind.key}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-mute">
                {t(`kinds.${kind.key}.text`)}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
