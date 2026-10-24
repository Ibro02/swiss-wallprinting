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
// the printer prints the mural; at the end, the logo "signs" it and the buttons appear: the
// configurator, the client's "See our projects", and "Request a quote", which scrolls to
// the question card at the end of the page. The texts are the client's (brief, 2026-10-22). The card fits the screen inside the page frame, below a free top fifth where
// the header pill floats, so the two never overlap.

/** The page frame (FRAME: 12, 16, 24 px): the stage keeps this margin to the screen edges. */
const SECTION = '[--frame:0.75rem] sm:[--frame:1rem] md:[--frame:1.5rem]'

const STAGE = 'rounded-2xl bg-graphite sm:rounded-3xl'

/** Share of the screen above the card, for the header pill. */
const HEADER_ROOM = 0.2

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
      cropBottom={heroVideo.cropBottom}
      headerRoom={HEADER_ROOM}
      alt={t('imageAlt')}
      hint={t('scrollHint')}
      className={SECTION}
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
          {/* The client's two buttons (projects, quote) after the configurator; WhatsApp is
              the floating button on every page. */}
          <div className="mt-6 flex flex-wrap gap-2 sm:gap-3">
            <ConfiguratorIntent>
              <ButtonLink href={PAGES.tryYourWall} size="lg">
                <CubeIcon className="size-5" />
                {t('ctaConfigurator')}
              </ButtonLink>
            </ConfiguratorIntent>
            <ButtonLink href={PAGES.projects} variant="glass" size="lg">
              {t('ctaProjects')}
            </ButtonLink>
            <a href={`#${QUESTION_FORM_ID}`} className={buttonClasses('glass', 'lg')}>
              {t('ctaQuote')}
            </a>
          </div>
        </div>
      }
    />
  )
}
