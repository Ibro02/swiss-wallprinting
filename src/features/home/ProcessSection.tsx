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

// Four steps as four mist cards, numbered in the serif italic (magenta): the client's own
// four steps (brief, 2026-10-22). Step one, the idea, is the dark one (lime number): it is
// where the visitor can act now, in the configurator. To say so, a band of lime light
// sweeps across it as it scrolls into view, and a lime light follows the mouse over it
// (GlowCard). Phones have no mouse, so there it glows from inside instead
// (`.premium-glow`). The other steps have the same light under the mouse in magenta (the
// author, 2026-10-23). On light mist, magenta strong enough to see would take the grey text
// under AA, so while the light is over a card its text turns dark; in dark the grey stays
// (6:1 at the light's centre). On phones a row to swipe, in order.

const STEPS = ['idea', 'consulting', 'design', 'print'] as const

export async function ProcessSection() {
  const t = await getTranslations('Home.process')

  return (
    <section aria-labelledby="process-title" className={SECTION_Y}>
      <Container>
        <SectionHeading id="process-title" eyebrow={t('eyebrow')} title={t.rich('title', accent)} />

        <ol className={`mt-8 gap-3 sm:mt-10 sm:grid sm:grid-cols-2 lg:grid-cols-4 ${PHONE_SWIPE}`}>
          {STEPS.map((step, index) => {
            const live = step === 'idea'
            const card = 'flex h-full flex-col rounded-2xl p-5 sm:rounded-3xl sm:p-6'
            const content = (
              <>
                {live && (
                  <span aria-hidden="true" className="premium-glow md:hidden">
                    <span className="premium-glow__light" />
                    <span className="premium-glow__light premium-glow__light--small" />
                  </span>
                )}
                <span
                  aria-hidden="true"
                  className={`font-serif text-4xl leading-none italic ${live ? 'text-lime' : 'text-magenta dark:text-lime'}`}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-auto pt-8 text-lg font-medium tracking-tight sm:pt-10">
                  <span className="sr-only">{index + 1}. </span>
                  {t(`steps.${step}.title`)}
                </h3>
                <p
                  className={`mt-1.5 text-sm leading-relaxed ${live ? 'text-white/90' : 'text-mute transition-colors duration-200 ease-out group-data-[hover]:text-ink/80 dark:group-data-[hover]:text-mute'}`}
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
                <GlowCard
                  shine={live}
                  className={
                    live
                      ? `${card} on-dark bg-graphite text-white [--glow-strength:0.32]`
                      : `${card} group bg-plaster [--glow-rgb:229_17_88] [--glow-strength:0.22] dark:[--glow-strength:0.3]`
                  }
                >
                  {content}
                </GlowCard>
              </li>
            )
          })}
        </ol>
      </Container>
    </section>
  )
}
