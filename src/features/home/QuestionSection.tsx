import { getTranslations } from 'next-intl/server'
import { accent } from '@/components/Accent.tsx'
import { ContactRow } from '@/components/ContactRow.tsx'
import { CARD_Y, Container } from '@/components/Container.tsx'
import { PhoneIcon } from '@/components/icons.tsx'
import { SectionHeading } from '@/components/SectionHeading.tsx'
import { company } from '@/content/company.ts'
import { QuestionCard } from './QuestionCard.tsx'

// README item 6, "form for questions": the heading and the two phone numbers (with the
// languages each one answers in) on the left; on the right the white question card from
// the author's reference: e-mail, WhatsApp and social buttons, "or", and the form with the
// area chips. The card's id is the anchor of the hero's "Free quote" button.

export async function QuestionSection() {
  const t = await getTranslations('Home.question')
  const footer = await getTranslations('Footer')

  return (
    <section aria-labelledby="question-title" className="rounded-2xl bg-plaster sm:rounded-3xl">
      <Container className={`grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start ${CARD_Y}`}>
        <div className="lg:col-span-5">
          <SectionHeading
            id="question-title"
            eyebrow={t('eyebrow')}
            title={t.rich('title', accent)}
          >
            <p>{t('intro')}</p>
          </SectionHeading>
          <ul className="mt-8 border-t border-graphite/10">
            {company.phones.map((phone, index) => (
              <li
                key={phone.e164}
                data-reveal={String(index + 1)}
                className="border-b border-graphite/10"
              >
                <ContactRow
                  href={`tel:${phone.e164}`}
                  label={footer('phoneLanguages', { languages: phone.languages })}
                  value={phone.display}
                  Icon={PhoneIcon}
                />
              </li>
            ))}
          </ul>
        </div>

        <div data-reveal="2" className="lg:col-span-7 xl:col-span-6 xl:col-start-7">
          <QuestionCard />
        </div>
      </Container>
    </section>
  )
}
