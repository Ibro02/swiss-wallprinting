import { getTranslations } from 'next-intl/server'
import { accent } from '@/components/Accent.tsx'
import { ButtonLink } from '@/components/Button.tsx'
import { Container, PHONE_SWIPE, PHONE_SWIPE_ITEM, SECTION_Y } from '@/components/Container.tsx'
import { ArrowRightIcon } from '@/components/icons.tsx'
import { SectionHeading } from '@/components/SectionHeading.tsx'
import { printFacts } from '@/content/company.ts'
import { PAGES } from '@/i18n/pages.ts'
import { ConfiguratorIntent } from '@/islands/ConfiguratorIntent.tsx'
import { GlowCard } from '@/islands/GlowCard.tsx'

// Four steps as four mist cards, numbered in the serif italic (magenta). Step two, the
// preview, is the dark one (lime number): it is where the visitor can act now, in the
// configurator. To say so, a band of lime light sweeps across it as it scrolls into view,
// and a lime light follows the mouse over it (GlowCard). On phones a row to swipe, in
// order. The steps are a draft until the client confirms how the work really goes.

const STEPS = ['idea', 'design', 'print', 'done'] as const

export async function ProcessSection() {
  const t = await getTranslations('Home.process')

  return (
    <section aria-labelledby="process-title" className={SECTION_Y}>
      <Container>
        <SectionHeading id="process-title" eyebrow={t('eyebrow')} title={t.rich('title', accent)} />

        <ol className={`mt-8 gap-3 sm:mt-10 sm:grid sm:grid-cols-2 lg:grid-cols-4 ${PHONE_SWIPE}`}>
          {STEPS.map((step, index) => {
            const live = step === 'design'
            const card = 'flex h-full flex-col rounded-2xl p-5 sm:rounded-3xl sm:p-6'
            const content = (
              <>
                <span
                  aria-hidden="true"
                  className={`font-serif text-4xl leading-none italic ${live ? 'text-lime' : 'text-magenta'}`}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-auto pt-8 text-lg font-medium tracking-tight sm:pt-10">
                  <span className="sr-only">{index + 1}. </span>
                  {t(`steps.${step}.title`)}
                </h3>
                <p
                  className={`mt-1.5 text-sm leading-relaxed ${live ? 'text-white/70' : 'text-mute'}`}
                >
                  {t(`steps.${step}.text`, { years: printFacts.durabilityYears })}
                </p>
                {live && (
                  <ConfiguratorIntent>
                    <ButtonLink href={PAGES.tryYourWall} size="sm" className="mt-5 self-start">
                      {t('configuratorLink')}
                      <ArrowRightIcon className="size-4" />
                    </ButtonLink>
                  </ConfiguratorIntent>
                )}
              </>
            )
            return (
              <li key={step} data-reveal={String(index + 1)} className={PHONE_SWIPE_ITEM}>
                {live ? (
                  <GlowCard
                    shine
                    className={`${card} on-dark bg-graphite text-white [--glow-strength:0.32]`}
                  >
                    {content}
                  </GlowCard>
                ) : (
                  <div className={`${card} bg-plaster`}>{content}</div>
                )}
              </li>
            )
          })}
        </ol>
      </Container>
    </section>
  )
}
