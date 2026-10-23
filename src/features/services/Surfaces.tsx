import { getFormatter, getTranslations } from 'next-intl/server'
import { accent } from '@/components/Accent.tsx'
import { Container } from '@/components/Container.tsx'
import { CheckIcon } from '@/components/icons.tsx'
import { SectionHeading } from '@/components/SectionHeading.tsx'
import { printFacts } from '@/content/company.ts'

// Surfaces and technology (the client's brief, 2026-10-22): the six surfaces he names, each
// checked before a job, and his four technical facts. On white, after the audiences: on the
// left each surface as a tile in its own material (`.material--*` in globals.css: plaster,
// gypsum, concrete, wood grain, glass, brushed metal, all CSS gradients, no images), on the
// right the facts as lift cards (the hover of the area cards). Both rise in with the scroll
// (`data-reveal`, CSS). The height comes from the content file.

/** Each surface and the text colour that reads on its material (AA). */
const SURFACES = [
  { key: 'plaster', text: 'text-graphite' },
  { key: 'gypsum', text: 'text-graphite' },
  { key: 'concrete', text: 'text-graphite' },
  { key: 'wood', text: 'text-white' },
  { key: 'glass', text: 'text-graphite' },
  { key: 'metal', text: 'text-graphite' },
] as const

const FACTS = ['height', 'width', 'inOut', 'uv'] as const

export async function Surfaces() {
  const t = await getTranslations('Services.surfaces')
  const format = await getFormatter()
  const height = `${format.number(printFacts.maxPrintHeightM, { minimumFractionDigits: 2 })} m`

  return (
    <section aria-labelledby="surfaces-title" className="pb-14 sm:pb-16 lg:pb-20">
      <Container className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
        <div>
          <SectionHeading
            id="surfaces-title"
            eyebrow={t('eyebrow')}
            title={t.rich('title', accent)}
          >
            <p>{t('intro')}</p>
          </SectionHeading>
          <ul className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
            {SURFACES.map(({ key, text }, index) => (
              <li
                key={key}
                data-reveal={String((index % 3) + 1)}
                className={`material material--${key} flex h-16 items-end rounded-xl p-3 text-sm font-medium sm:h-20 sm:rounded-2xl sm:p-4 sm:text-base ${text}`}
              >
                <span>{t(`list.${key}`)}</span>
              </li>
            ))}
          </ul>
        </div>
        <ul className="grid gap-3">
          {FACTS.map((fact, index) => (
            <li
              key={fact}
              data-reveal={String(index + 1)}
              className="lift-card relative isolate flex items-center gap-4 overflow-clip rounded-2xl bg-plaster p-4 hover:bg-paper sm:p-5"
            >
              <span aria-hidden="true" className="lift-card__sweep" />
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-lime/25 text-graphite dark:bg-lime/12 dark:text-lime">
                <CheckIcon className="size-4" />
              </span>
              <span className="text-base font-medium tracking-tight">
                {t(`facts.${fact}`, { height })}
              </span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
