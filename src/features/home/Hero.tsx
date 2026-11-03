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
// the question card at the end of the page. The texts are the client's (brief, 2026-10-22).
// On phones the card fits the screen inside the page frame, below a free top fifth where the
// header pill floats. On desktops it ignores the page frame: the whole width and height of the
// window, edge to edge, square corners, with the pill over the video (the author, 2026-11-03:
// "ignore padding and make it full width/length"). CSS only, so the first paint is right.

/**
 * Phones: the page frame (FRAME: 12, 16, 24 px), the stage keeps this margin to the screen
 * edges. Desktops: no margin, and the section leaves the frame: out to the window's edges
 * (`50% - 50vw`; `html` clips the width of a classic scrollbar, globals.css) and up over the
 * layout's top padding (`md:pt-6`).
 */
const SECTION =
  '[--frame:0.75rem] sm:[--frame:1rem] md:-mt-6 md:mx-[calc(50%-50vw)] md:[--frame:0px]'

const STAGE = 'rounded-2xl bg-graphite sm:rounded-3xl md:rounded-none'

/**
 * The texts line up with the header pill and the page's sections on every width: the page
 * frame (at most 92rem, 1.5rem padding) plus the 2rem inside a card.
 */
const CONTENT = 'p-4 sm:p-6 md:px-[calc(max(0px,(100%-92rem)/2)+3.5rem)] md:py-12'

/** Share of the screen above the card on phones, for the header pill. */
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
      // Desktops: the scroll drives the printer, forwards and backwards, over one screen of
      // scroll (the author, 2026-11-03: "scroll back printing image to the wall, playing
      // around with printer"); playSeconds 0, so the print ends where the scroll ends.
      length="200vh"
      // Phones: about 0.4 of a screen pinned (355 px at 768 px high), and one scroll plays the
      // print (mobilePlaySeconds), so a longer section only left an idle scroll after it (the
      // author, 2026-11-01: "too much scroll after animation is done"). A faster scroll than
      // the play speeds the print up to the scroll (playTowards).
      mobileLength="140vh"
      // Desktops follow the scroll quickly; the canvas blends the frames, so it stays smooth.
      smoothing={0.2}
      mobileSmoothing={0.12}
      // At least half of the print per second: the picture does not crawl over the last frames
      // of a swipe (the author, 2026-11-01: "I would like it faster so it can be smoother").
      minSpeed={0.5}
      // Desktops: at most about one video frame per 60 Hz screen frame (the whole print in 1.3 s
      // at the least), so every step is a blend of two neighbours, never a jump (2026-11-03).
      maxSpeed={0.8}
      playSeconds={0}
      // One scroll plays the whole print, in 2 s: a little faster than the video (78 frames at
      // 30 fps, 2.6 s), so the printer moves as filmed, without dropped frames (the author).
      mobilePlaySeconds={2}
      focus={heroVideo.focus}
      cropBottom={heroVideo.cropBottom}
      headerRoom={0}
      mobileHeaderRoom={HEADER_ROOM}
      alt={t('imageAlt')}
      hint={t('scrollHint')}
      className={SECTION}
      stageClassName={STAGE}
      contentClassName={CONTENT}
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
