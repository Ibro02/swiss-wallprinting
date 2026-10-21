import Image from 'next/image'
import { getFormatter, getTranslations } from 'next-intl/server'
import tigerMidPrint from '@/assets/photos/tiger-mid-print.jpg'
import { buttonClasses, ButtonLink } from '@/components/Button.tsx'
import { CmykDots } from '@/components/CmykDots.tsx'
import { Container } from '@/components/Container.tsx'
import { CubeIcon } from '@/components/icons.tsx'
import { printFacts } from '@/content/company.ts'
import { PAGES } from '@/i18n/pages.ts'
import { QUESTION_FORM_ID } from './QuestionSection.tsx'

// The client's only work photo (the printer prints a tiger), "printed" again by a
// CSS print head (globals.css, .print-reveal). A time-lapse video can replace the
// photo when the client sends one (Development Plan, P2).

export async function Hero() {
  const t = await getTranslations('Home.hero')
  const format = await getFormatter()
  // No-break space: "3,80" and "m" stay on one line.
  const height = `${format.number(printFacts.maxPrintHeightM, { minimumFractionDigits: 2 })} m`

  return (
    // Pulled up under the floating header: 76px = header padding (12) + height (64).
    <section className="on-dark relative -mt-[76px] overflow-hidden bg-graphite text-plaster">
      <div className="absolute inset-0">
        <Image
          src={tigerMidPrint}
          alt={t('imageAlt')}
          fill
          // The LCP element. Next.js 16: eager + high priority instead of the old `priority`.
          loading="eager"
          fetchPriority="high"
          sizes="100vw"
          placeholder="blur"
          className="object-cover object-[62%_center]"
        />
        <div className="print-reveal" aria-hidden="true">
          <div className="print-reveal__ink" />
        </div>
        <div className="absolute inset-0 bg-linear-to-t from-graphite from-30% via-graphite/85 via-60% to-graphite/25 lg:bg-linear-to-r lg:from-0% lg:via-50% lg:from-graphite lg:via-graphite/75 lg:to-transparent" />
      </div>

      <Container className="relative flex min-h-[92svh] flex-col justify-end pt-36 pb-14 lg:justify-center lg:pb-24">
        <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.2em] text-plaster/75 uppercase">
          <CmykDots />
          {t('eyebrow')}
        </p>
        <h1 className="mt-6 max-w-3xl font-display text-4xl leading-[1.05] font-light tracking-tight text-balance sm:text-6xl lg:text-7xl">
          {t('title')}
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-plaster/80 sm:text-lg">
          {t('lead', { height })}
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <ButtonLink href={PAGES.tryYourWall} size="lg">
            <CubeIcon className="size-5" />
            {t('ctaConfigurator')}
          </ButtonLink>
          <a href={`#${QUESTION_FORM_ID}`} className={buttonClasses('secondary-dark', 'lg')}>
            {t('ctaQuote')}
          </a>
        </div>
      </Container>
    </section>
  )
}
