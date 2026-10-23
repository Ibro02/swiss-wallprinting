import { getFormatter, getTranslations } from 'next-intl/server'
import { accent } from '@/components/Accent.tsx'
import { ButtonLink } from '@/components/Button.tsx'
import { Container, SECTION_Y } from '@/components/Container.tsx'
import { PlusIcon, WhatsAppIcon } from '@/components/icons.tsx'
import { PageHeader } from '@/components/PageHeader.tsx'
import { company, printFacts } from '@/content/company.ts'
import { metadataFor } from '@/i18n/metadata.ts'
import { PAGES } from '@/i18n/pages.ts'

export const generateMetadata = metadataFor('faq')

// Frequently asked questions: the ten questions of the client's brief (2026-10-22), in his
// order. The answers are agent drafts from his facts and the old site's (no numbers that he
// did not give); the client reviews them. Each question is a <details>: it works without
// JavaScript, and all answers are in the HTML. `name` makes them an accordion: opening one
// closes the other. Each is a lift card, the hover of the area cards (the author,
// 2026-10-23). Beside them, a dark card for the questions that are not here.

const QUESTIONS = [
  'what',
  'surfaces',
  'size',
  'outdoor',
  'durability',
  'preparation',
  'ownImage',
  'duration',
  'price',
  'quote',
] as const

export default async function FaqPage() {
  const t = await getTranslations('Faq')
  const format = await getFormatter()
  const height = `${format.number(printFacts.maxPrintHeightM, { minimumFractionDigits: 2 })} m`
  const values = { height, years: printFacts.durabilityYears }

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <PageHeader eyebrow={t('eyebrow')} title={t.rich('title', accent)}>
        <p>{t('lead')}</p>
      </PageHeader>

      <section className={SECTION_Y}>
        <Container className="grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-8">
          <div className="grid gap-2 lg:col-span-8">
            {QUESTIONS.map((question) => (
              <details
                key={question}
                name="faq"
                className="disclosure lift-card group relative isolate rounded-2xl bg-plaster hover:bg-paper sm:rounded-3xl"
              >
                {/* The card's radius again, not `inherit`: a summary's parent in the
                    rendering is the details' internal slot (radius 0), so the focus ring
                    had square corners. */}
                <summary className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl p-5 text-base font-medium tracking-tight sm:rounded-3xl sm:p-6 sm:text-lg">
                  {/* The sweep's own clip: the card does not clip, so the summary's focus
                      ring (outside its box) stays whole. In the summary, so it is there
                      when the answer is closed too. */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 -z-1 overflow-clip rounded-[inherit]"
                  >
                    <span className="lift-card__sweep" />
                  </span>
                  {t(`items.${question}.q`)}
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-paper text-ink ring-1 ring-ink/8">
                    <PlusIcon className="disclosure__mark size-4" />
                  </span>
                </summary>
                <p className="disclosure__body max-w-prose px-5 pb-6 text-base leading-relaxed text-mute sm:px-6">
                  {t(`items.${question}.a`, values)}
                </p>
              </details>
            ))}
          </div>

          <aside className="on-dark rounded-2xl bg-graphite p-6 text-white sm:rounded-3xl sm:p-8 lg:sticky lg:top-32 lg:col-span-4">
            <h2 className="text-2xl font-medium tracking-tight">{t('more')}</h2>
            <p className="mt-3 leading-relaxed text-white/75">{t('moreText')}</p>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
              <ButtonLink href={PAGES.contact}>{t('moreLink')}</ButtonLink>
              <a
                href={`https://wa.me/${company.whatsapp.replace('+', '')}`}
                className="inline-flex items-center gap-2 rounded-lg text-sm font-medium text-lime"
              >
                <WhatsAppIcon className="size-4" />
                WhatsApp
              </a>
            </div>
          </aside>
        </Container>
      </section>
    </main>
  )
}
