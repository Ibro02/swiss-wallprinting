import { getFormatter, getTranslations } from 'next-intl/server'
import { accent } from '@/components/Accent.tsx'
import { buttonClasses, ButtonLink } from '@/components/Button.tsx'
import { CubeIcon } from '@/components/icons.tsx'
import { printFacts } from '@/content/company.ts'
import { heroVideo } from '@/content/hero-video.ts'
import { QUESTION_FORM_ID } from '@/features/contact/fields.ts'
import { PAGES } from '@/i18n/pages.ts'
import { ConfiguratorIntent } from '@/islands/ConfiguratorIntent.tsx'
import { PrintOnScroll } from '@/islands/PrintOnScroll.tsx'

// The first card of the home page (README: "a video background with a simple hookup text
// and a button" to open the 3D model): the time-lapse of a print, driven by the scroll
// (PrintOnScroll). At the start, the headline over the blank wall; as the visitor scrolls,
// the printer prints the mural; at the end, the logo "signs" it and the two buttons
// appear: the configurator and "Free quote", which scrolls to the question card at the end
// of the page. The header pill floats over the top of the card.

/** The sticky card: one screen minus the page frame (FRAME: 12, 16, 24 px) at every size. */
const STAGE =
  'rounded-2xl bg-graphite [--stage-top:0.75rem] [--stage-h:calc(100svh-1.5rem)] sm:rounded-3xl sm:[--stage-top:1rem] sm:[--stage-h:calc(100svh-2rem)] md:[--stage-top:1.5rem] md:[--stage-h:calc(100svh-3rem)]'

export async function Hero() {
  const t = await getTranslations('Home.hero')
  const format = await getFormatter()
  // No-break space: "3,80" and "m" stay on one line.
  const height = `${format.number(printFacts.maxPrintHeightM, { minimumFractionDigits: 2 })} m`

  return (
    <PrintOnScroll
      labelledBy="hero-title"
      frames={heroVideo.frames.desktop}
      mobileFrames={heroVideo.frames.mobile}
      // About three screens of scroll for the print: a few turns of the wheel or swipes.
      length="400vh"
      smoothing={0.12}
      focus={heroVideo.focus}
      // The client's black logo (Assets/SWP_LogoBlack.svg): dark ink on the light mural.
      signature={{ src: '/brand/swp-logo-black.svg', ...heroVideo.signature }}
      alt={t('imageAlt')}
      hint={t('scrollHint')}
      stageClassName={STAGE}
      intro={
        <div className="lg:max-w-2xl">
          <p
            data-rise="1"
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/85 ring-1 ring-white/15 backdrop-blur-md ring-inset before:size-1.5 before:rounded-full before:bg-lime"
          >
            {t('eyebrow')}
          </p>
          <h1 id="hero-title" data-rise="1" className="mt-5 text-display font-medium text-balance">
            {t.rich('title', accent)}
          </h1>
          <p
            data-rise="2"
            // A landscape phone has no room for it under the headline.
            className="mt-4 max-w-lg text-base leading-relaxed text-white/75 sm:text-[1.0625rem] [@media(max-height:30rem)]:hidden"
          >
            {t('lead', { height })}
          </p>
        </div>
      }
      outro={
        <div className="lg:max-w-2xl">
          <p className="text-title font-medium text-balance">{t.rich('outroTitle', accent)}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <ConfiguratorIntent>
              <ButtonLink href={PAGES.tryYourWall} size="lg">
                <CubeIcon className="size-5" />
                {t('ctaConfigurator')}
              </ButtonLink>
            </ConfiguratorIntent>
            <a href={`#${QUESTION_FORM_ID}`} className={buttonClasses('glass', 'lg')}>
              {t('ctaQuote')}
            </a>
          </div>
        </div>
      }
    >
      {heroVideo.mock && (
        // Below the header pill (the room that PageHeader leaves for it).
        <span className="absolute top-28 right-4 rounded-full bg-black/45 px-2.5 py-0.5 text-[0.7rem] font-medium text-white/85 ring-1 ring-white/15 ring-inset sm:top-32 sm:right-6 md:right-8">
          {t('mockBadge')}
        </span>
      )}
    </PrintOnScroll>
  )
}
