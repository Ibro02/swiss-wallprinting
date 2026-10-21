import { getTranslations } from 'next-intl/server'
import { Container } from '@/components/Container.tsx'
import { MailIcon, PhoneIcon, WhatsAppIcon } from '@/components/icons.tsx'
import { SectionHeading } from '@/components/SectionHeading.tsx'
import { company } from '@/content/company.ts'
import { QuestionForm } from '@/islands/QuestionForm.tsx'

/** Anchor of the form, for the "Free quote" buttons. */
export const QUESTION_FORM_ID = 'question'

export async function QuestionSection() {
  const t = await getTranslations('Home.question')
  const whatsapp = `https://wa.me/${company.whatsapp.replace('+', '')}`
  const mainPhone =
    company.phones.find((phone) => phone.e164 === company.whatsapp) ?? company.phones[0]

  return (
    <section id={QUESTION_FORM_ID} aria-labelledby="question-title" className="py-24 sm:py-32">
      <Container className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <SectionHeading id="question-title" eyebrow={t('eyebrow')} title={t('title')}>
            <p>{t('intro')}</p>
          </SectionHeading>

          <div className="mt-10">
            <p className="text-sm font-semibold">{t('alternatives')}</p>
            <ul className="mt-4 space-y-3 text-sm">
              {company.phones.map((phone) => (
                <li key={phone.e164}>
                  <a
                    href={`tel:${phone.e164}`}
                    className="inline-flex items-center gap-3 hover:text-magenta-700"
                  >
                    <PhoneIcon className="size-4 text-mute" />
                    {phone.display}
                    <span className="text-mute">({phone.languages})</span>
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={whatsapp}
                  className="inline-flex items-center gap-3 hover:text-magenta-700"
                >
                  <WhatsAppIcon className="size-4 text-mute" />
                  WhatsApp {mainPhone?.display}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${company.email}`}
                  className="inline-flex items-center gap-3 hover:text-magenta-700"
                >
                  <MailIcon className="size-4 text-mute" />
                  {company.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="relative rounded-3xl bg-white p-6 ring-1 ring-graphite/5 sm:p-10 lg:col-span-7">
          <QuestionForm contact={{ email: company.email, phone: mainPhone?.display ?? '' }} />
        </div>
      </Container>
    </section>
  )
}
