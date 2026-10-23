import Image from 'next/image'
import { getLocale, getTranslations } from 'next-intl/server'
import type { ReactNode } from 'react'
import { Container, SECTION_Y } from '@/components/Container.tsx'
import { ArrowRightIcon, CameraIcon, CloseIcon, FlipIcon } from '@/components/icons.tsx'
import { images } from '@/content/images/index.ts'
import { collections } from '@/content/index.ts'
import type { Project } from '@/content/schema.ts'
import type { Locale } from '@/i18n/routing.ts'
import { ScrollLock } from '@/islands/ScrollLock.tsx'
import { StoryFit } from '@/islands/StoryFit.tsx'

// The client's projects (brief, 2026-10-22) as flip cards (the author: Framer's "Liquid
// Glass Flip Card", rebuilt in CSS, `.flip-card` in globals.css). Front: the photo, and on a
// pane of frosted glass over its lower edge the place, the title, and the summary. "Read the
// story" turns the card in 3D; the back has the story and the closing line. The turn is a
// visually hidden checkbox (the buttons are its labels), so it works without JavaScript and
// with the keyboard, and the server HTML is final (no-ui-flash). Both faces have the hover of
// the area cards (`.lift-card`). A project without a story is a single face. Until the
// client sends the photos, a calm placeholder stands in; such a project is mock, so the
// launch build stops (content tests).
//
// Every card has the same size (the author, 2026-10-23): the rows are equal (`auto-rows-fr`),
// as tall as the tallest front, and the photo takes the extra height. The back fills the
// front's box and never makes the card taller. A story longer than the box fades out, and
// "Show more" (only then: `.flip-card__story` in globals.css, and StoryFit for browsers
// without scroll timelines) opens the whole story (StorySheet: an HTML popover, no
// JavaScript; Escape and a click outside close it): a sheet from the bottom on phones, the
// photo beside the story on wider screens. The page under an open sheet does not scroll
// (CSS with a mouse, ScrollLock on touch screens). The sheets come after the list, outside the
// cards, so a card's 3D (perspective, the reveal's transform) is never the containing block
// of a sheet, whatever a browser does with a popover that is leaving the top layer.
//
// A card is as wide as its column, whatever is in it (the author, 2026-10-23: on an iPhone the
// cards were wider than the screen). The columns have no content minimum (`grid-cols-1`,
// `minmax(0, 1fr)`), and each face is a size container (`@container`), so nothing inside can
// widen it. The photo's 4:3 minimum comes from the face's width (`75cqw`), not from
// `aspect-ratio`: Safari let a growing aspect-ratio box take its width from its height (4:3
// of a 500 px card is 667 px), and the card grew with it.

/** Each face: a mist lift card (the front adds `relative`, the back is laid over it). */
const FACE =
  'lift-card @container isolate flex h-full flex-col overflow-clip rounded-2xl bg-plaster p-2 hover:bg-paper sm:rounded-3xl sm:p-3'

/** The links of a card: the flip button (a label of the card's checkbox) and "Show more". */
const CARD_LINK =
  'inline-flex cursor-pointer items-center gap-2 rounded-lg text-sm font-medium text-magenta-700 select-none dark:text-magenta-200'

const FLIP_BUTTON = `flip-card__button ${CARD_LINK}`

interface Labels {
  readStory: string
  closeStory: string
  moreStory: string
  closeSheet: string
  photoPending: string
}

export async function ProjectList() {
  const t = await getTranslations('Projects')
  const locale = (await getLocale()) as Locale
  const labels: Labels = {
    readStory: t('readStory'),
    closeStory: t('closeStory'),
    moreStory: t('moreStory'),
    closeSheet: t('closeSheet'),
    photoPending: t('photoPending'),
  }

  return (
    <section aria-label={t('eyebrow')} className={SECTION_Y}>
      <Container>
        <ol className="grid auto-rows-fr grid-cols-1 gap-3 md:grid-cols-2">
          {collections.projects.map((project, index) => (
            // The project's id is its anchor (the services page links to /projects#pool);
            // the margin keeps the card clear of the header pill.
            <li
              key={project.id}
              id={project.id}
              data-reveal={String((index % 2) + 1)}
              className="min-w-0 scroll-mt-28"
            >
              <ProjectCard project={project} locale={locale} labels={labels} first={index === 0} />
            </li>
          ))}
        </ol>
        {collections.projects
          .filter((project) => project.story.length > 0)
          .map((project) => (
            <StorySheet key={project.id} project={project} locale={locale} labels={labels} />
          ))}
        <StoryFit />
        <ScrollLock sheet=".story-sheet" />
      </Container>
    </section>
  )
}

const sheetId = (project: Project) => `story-sheet-${project.id}`

function ProjectCard({
  project,
  locale,
  labels,
  first,
}: {
  project: Project
  locale: Locale
  labels: Labels
  /** The first card's photo is on the first screen: it loads at once (the LCP image). */
  first: boolean
}) {
  const title = project.title[locale]
  const toggle = `story-${project.id}`
  const hasStory = project.story.length > 0

  const front = (
    <>
      <span aria-hidden="true" className="lift-card__sweep" />
      <ProjectPhoto project={project} locale={locale} pending={labels.photoPending} first={first} />
      {/* The glass pane over the photo's lower edge: frosted by a gradient and a bright rim, not
          by backdrop-filter, which phones draw wrongly inside a 3D turn (in dark mode they
          dropped the pane's colour) and which costs a redraw on every scrolled frame. */}
      <div className="relative z-[1] mx-2 -mt-16 flex flex-col rounded-xl bg-linear-to-b from-white/80 to-white/95 p-4 shadow-[inset_0_1px_0_rgb(255_255_255/0.8),inset_0_0_0_1px_rgb(255_255_255/0.45),0_16px_32px_-20px_rgb(0_0_0/0.35)] sm:mx-3 sm:-mt-20 sm:rounded-2xl sm:p-5 dark:from-paper/90 dark:to-paper/[0.97] dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.14),inset_0_0_0_1px_rgb(255_255_255/0.08),0_16px_32px_-20px_rgb(0_0_0/0.6)]">
        <p className="text-sm font-medium text-ink/70">{project.place[locale]}</p>
        <h2 className="mt-1.5 text-xl font-medium tracking-tight text-balance sm:text-2xl">
          {title}
        </h2>
        <p className="mt-2 text-base leading-relaxed text-ink/85">{project.summary[locale]}</p>
        {!hasStory && project.tagline && <Tagline>{project.tagline[locale]}</Tagline>}
        {hasStory && (
          <div className="pt-4">
            <label htmlFor={toggle} className={FLIP_BUTTON}>
              {labels.readStory}
              <FlipIcon className="size-4" />
            </label>
          </div>
        )}
      </div>
    </>
  )

  if (!hasStory) return <article className={`relative ${FACE}`}>{front}</article>

  return (
    <article className="flip-card">
      <input
        id={toggle}
        type="checkbox"
        aria-label={`${labels.readStory}: ${title}`}
        className="flip-card__toggle sr-only"
      />
      <div className="flip-card__inner">
        <div className={`flip-card__face flip-card__face--front relative ${FACE}`}>
          <span aria-hidden="true" className="flip-card__light" />
          {front}
        </div>
        <div
          className={`flip-card__face flip-card__face--back absolute inset-0 ${FACE} bg-[radial-gradient(circle_at_100%_0%,rgb(197_210_13/0.16),transparent_45%),radial-gradient(circle_at_0%_100%,rgb(230_0_126/0.07),transparent_50%)]`}
        >
          <span aria-hidden="true" className="lift-card__sweep" />
          <span aria-hidden="true" className="flip-card__light" />
          <div className="relative z-[1] flex min-h-0 flex-1 flex-col p-3 sm:p-5">
            <p className="text-sm font-medium text-mute">{project.place[locale]}</p>
            {/* The title is the front's heading; here it is only for the eyes. */}
            <p aria-hidden="true" className="mt-1.5 text-xl font-medium tracking-tight">
              {title}
            </p>
            <div className="flip-card__story mt-4 min-h-0 flex-1">
              <Story project={project} locale={locale} />
            </div>
            <div className="flex items-center justify-between gap-4 pt-4">
              <label htmlFor={toggle} className={FLIP_BUTTON}>
                <FlipIcon className="size-4" />
                {labels.closeStory}
              </label>
              <button
                type="button"
                popoverTarget={sheetId(project)}
                className={`flip-card__more ${CARD_LINK}`}
              >
                {labels.moreStory}
                <ArrowRightIcon className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

/**
 * The whole story, for a story longer than its card. Phones: a sheet from the bottom with the
 * text. From 640 px: a dialog with the project's photo beside the story (the photo loads only
 * when the dialog opens: a lazy image in a closed popover is never rendered).
 */
function StorySheet({
  project,
  locale,
  labels,
}: {
  project: Project
  locale: Locale
  labels: Labels
}) {
  const sheet = sheetId(project)
  const [cover] = project.photos
  const photo = cover ? images[cover] : undefined

  return (
    <div
      id={sheet}
      popover="auto"
      // A <dialog> opened as a popover gets no `open` attribute, and the browser's own
      // `dialog:not([open]) { display: none }` would keep it hidden.
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
      role="dialog"
      aria-labelledby={`${sheet}-title`}
      className="story-sheet bg-paper p-6 text-ink sm:p-8"
    >
      {/* The layout is its own box: a `display` on the popover itself would override the
          browser's `display: none` of a closed popover. */}
      <div className="story-sheet__layout">
        {photo && (
          <div className="story-sheet__photo relative aspect-[4/3] overflow-clip rounded-2xl bg-plaster max-sm:hidden">
            <Image
              src={photo.src}
              fill
              placeholder="blur"
              blurDataURL={photo.blurDataURL}
              // The dialog is labelled by the title beside it: the photo adds no words.
              alt=""
              sizes="(min-width: 960px) 25rem, 42vw"
              loading="lazy"
              className="object-cover"
            />
          </div>
        )}
        <div className="story-sheet__text">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-mute">{project.place[locale]}</p>
              <p
                id={`${sheet}-title`}
                className="mt-1.5 text-xl font-medium tracking-tight text-balance sm:text-2xl"
              >
                {project.title[locale]}
              </p>
            </div>
            <button
              type="button"
              popoverTarget={sheet}
              popoverTargetAction="hide"
              aria-label={labels.closeSheet}
              className="grid size-10 shrink-0 place-items-center rounded-xl ring-1 ring-ink/12 transition-[background-color,transform] duration-160 ease-out hover:bg-ink/6 active:scale-[0.97] motion-reduce:active:scale-100"
            >
              <CloseIcon />
            </button>
          </div>
          <div className="mt-5">
            <Story project={project} locale={locale} />
          </div>
        </div>
      </div>
    </div>
  )
}

/** The story's paragraphs and its closing line: on the card's back and in the sheet. */
function Story({ project, locale }: { project: Project; locale: Locale }) {
  return (
    <>
      <div className="space-y-3 text-[0.9375rem] leading-relaxed text-ink/85">
        {project.story.map((paragraph) => (
          <p key={paragraph.it}>{paragraph[locale]}</p>
        ))}
      </div>
      {project.tagline && <Tagline>{project.tagline[locale]}</Tagline>}
    </>
  )
}

function ProjectPhoto({
  project,
  locale,
  pending,
  first,
}: {
  project: Project
  locale: Locale
  pending: string
  first: boolean
}) {
  const [cover] = project.photos
  const photo = cover ? images[cover] : undefined
  // At least 4:3 of the face's width (`75cqw`, see the top of this file: not `aspect-ratio`);
  // in a card with a shorter text than the tallest, the photo takes the rest.
  const box = 'relative min-h-[75cqw] flex-[1_0_auto] overflow-clip rounded-xl sm:rounded-2xl'
  if (photo) {
    return (
      <div className={box}>
        <Image
          src={photo.src}
          fill
          placeholder="blur"
          blurDataURL={photo.blurDataURL}
          alt={project.title[locale]}
          sizes="(min-width: 768px) 45vw, 100vw"
          loading={first ? 'eager' : 'lazy'}
          fetchPriority={first ? 'high' : 'auto'}
          className="object-cover"
        />
      </div>
    )
  }
  // Until the photos arrive: the place in the serif accent, and a note.
  return (
    <div
      className={`${box} flex flex-col items-center justify-center gap-3 bg-plaster-200/60 px-6 pb-16 text-center sm:pb-20`}
    >
      <span
        aria-hidden="true"
        className="font-serif text-3xl leading-tight text-mute italic sm:text-4xl"
      >
        {project.place[locale]}
      </span>
      <span className="inline-flex items-center gap-2 text-sm text-mute">
        <CameraIcon className="size-4.5" />
        {pending}
      </span>
    </div>
  )
}

function Tagline({ children }: { children: ReactNode }) {
  return (
    <p className="mt-5 font-serif text-xl leading-snug text-magenta-700 italic dark:text-lime">
      {children}
    </p>
  )
}
