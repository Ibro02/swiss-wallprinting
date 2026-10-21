import { getTranslations } from 'next-intl/server'
import type { ReactNode } from 'react'
import { Container } from '@/components/Container.tsx'
import {
  FacebookIcon,
  InstagramIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  WhatsAppIcon,
} from '@/components/icons.tsx'
import { PageHeader } from '@/components/PageHeader.tsx'
import { company } from '@/content/company.ts'
import { QUESTION_FORM_ID } from '@/features/home/QuestionSection.tsx'
import { metadataFor } from '@/i18n/metadata.ts'
import { QuestionForm } from '@/islands/QuestionForm.tsx'

export const generateMetadata = metadataFor('contact')

// "Simple structure: mail, social media links, form for sending an email" (README).
// The map is a link, not an embedded Google Maps frame (privacy, Development Plan P10).
export default async function ContactPage() {
  const t = await getTranslations('Contact')
  const footer = await getTranslations('Footer')
  const whatsappPhone =
    company.phones.find((phone) => phone.e164 === company.whatsapp) ?? company.phones[0]
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${company.postalCode} ${company.locality}`)}`

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <PageHeader eyebrow={t('eyebrow')} title={t('title')}>
        <p>{t('lead')}</p>
      </PageHeader>

      <section className="pb-24">
        <Container className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <ul className="grid content-start gap-4 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
            <Card icon={<MailIcon className="size-5" />} title={t('email')}>
              <a
                href={`mailto:${company.email}`}
                className="font-semibold break-all hover:text-magenta-700"
              >
                {company.email}
              </a>
            </Card>
            <Card icon={<PhoneIcon className="size-5" />} title={t('phone')}>
              <ul className="space-y-2">
                {company.phones.map((phone) => (
                  <li key={phone.e164}>
                    <a href={`tel:${phone.e164}`} className="font-semibold hover:text-magenta-700">
                      {phone.display}
                    </a>
                    <span className="block text-sm text-mute">
                      {footer('phoneLanguages', { languages: phone.languages })}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card icon={<WhatsAppIcon className="size-5" />} title="WhatsApp">
              <a
                href={`https://wa.me/${company.whatsapp.replace('+', '')}`}
                className="font-semibold hover:text-magenta-700"
              >
                {whatsappPhone?.display}
              </a>
            </Card>
            <Card icon={<MapPinIcon className="size-5" />} title={t('location')}>
              <address className="not-italic">
                {company.postalCode} {company.locality}
                <br />
                {footer('region')}
              </address>
              <a href={mapUrl} className="mt-2 inline-block text-sm font-semibold text-magenta-700">
                {t('openMap')}
              </a>
            </Card>
            <Card icon={<InstagramIcon className="size-5" />} title={t('social')}>
              <ul className="flex flex-wrap gap-x-5 gap-y-2">
                <li>
                  <a
                    href={company.social.instagram}
                    className="inline-flex items-center gap-2 font-semibold hover:text-magenta-700"
                  >
                    <InstagramIcon className="size-4" />
                    Instagram
                  </a>
                </li>
                <li>
                  <a
                    href={company.social.facebook}
                    className="inline-flex items-center gap-2 font-semibold hover:text-magenta-700"
                  >
                    <FacebookIcon className="size-4" />
                    Facebook
                  </a>
                </li>
              </ul>
            </Card>
          </ul>

          <div
            id={QUESTION_FORM_ID}
            className="scroll-mt-28 rounded-3xl bg-white p-6 ring-1 ring-graphite/5 sm:p-10 lg:col-span-7"
          >
            <h2 className="mb-8 font-display text-2xl font-light">{t('formTitle')}</h2>
            <QuestionForm contact={{ email: company.email, phone: whatsappPhone?.display ?? '' }} />
          </div>
        </Container>
      </section>
    </main>
  )
}

function Card({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <li className="rounded-3xl bg-white p-6 ring-1 ring-graphite/5">
      <p className="flex items-center gap-3 text-sm text-mute">
        <span className="grid size-9 place-items-center rounded-xl bg-graphite text-lime">
          {icon}
        </span>
        {title}
      </p>
      <div className="mt-4">{children}</div>
    </li>
  )
}
