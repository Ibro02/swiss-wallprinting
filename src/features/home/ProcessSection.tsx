import { getTranslations } from 'next-intl/server'
import { Container } from '@/components/Container.tsx'
import { ArrowRightIcon } from '@/components/icons.tsx'
import { SectionHeading } from '@/components/SectionHeading.tsx'
import { printFacts } from '@/content/company.ts'
import { Link } from '@/i18n/navigation.ts'
import { PAGES } from '@/i18n/pages.ts'

// Four steps, one ink colour each (cyan, magenta, yellow, black: the printer's CMYK).
// The steps are a draft until the client confirms how the work really goes.

const STEPS = [
  { key: 'idea', ink: 'bg-ink-cyan' },
  { key: 'design', ink: 'bg-ink-magenta' },
  { key: 'print', ink: 'bg-ink-yellow' },
  { key: 'done', ink: 'bg-ink-black' },
] as const

export async function ProcessSection() {
  const t = await getTranslations('Home.process')

  return (
    <section aria-labelledby="process-title" className="py-24 sm:py-32">
      <Container>
        <SectionHeading id="process-title" eyebrow={t('eyebrow')} title={t('title')} />

        <ol className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {STEPS.map((step, index) => (
            <li key={step.key} className="relative">
              <span aria-hidden="true" className={`block h-1 w-full rounded-full ${step.ink}`} />
              <p className="mt-6 font-display text-sm font-light text-mute">
                {String(index + 1).padStart(2, '0')}
              </p>
              <h3 className="mt-2 font-display text-xl font-light">
                {t(`steps.${step.key}.title`)}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-mute">
                {t(`steps.${step.key}.text`, { years: printFacts.durabilityYears })}
              </p>
              {step.key === 'design' && (
                <Link
                  href={PAGES.tryYourWall}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-magenta-700"
                >
                  {t('configuratorLink')}
                  <ArrowRightIcon className="size-4" />
                </Link>
              )}
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}
