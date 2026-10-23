import { getLocale, getTranslations } from 'next-intl/server'
import { accent } from '@/components/Accent.tsx'
import { ContactRow, type ContactRowProps } from '@/components/ContactRow.tsx'
import { Container } from '@/components/Container.tsx'
import {
  ClockIcon,
  FacebookIcon,
  GlobeIcon,
  InstagramIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  WhatsAppIcon,
} from '@/components/icons.tsx'
import { PageHeader } from '@/components/PageHeader.tsx'
import { company } from '@/content/company.ts'
import { collections } from '@/content/index.ts'
import { QUESTION_FORM_ID } from '@/features/contact/fields.ts'
import { CompanyJsonLd } from '@/features/seo/CompanyJsonLd.tsx'
import { metadataFor } from '@/i18n/metadata.ts'
import type { Locale } from '@/i18n/routing.ts'
import { QuestionForm } from '@/islands/QuestionForm.tsx'

export const generateMetadata = metadataFor('contact')

// "Simple structure: mail, social media links, form for sending an email" (README): every
// way to reach the client as a large row, and the form in a white card beside them.
// The map is a link, not an embedded Google Maps frame (privacy, Development Plan P10).
export default async function ContactPage() {
  const t = await getTranslations('Contact')
  const footer = await getTranslations('Footer')
  const locale = (await getLocale()) as Locale
  const whatsappPhone =
    company.phones.find((phone) => phone.e164 === company.whatsapp) ?? company.phones[0]
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${company.postalCode} ${company.locality}`)}`
  const instagram = new URL(company.social.instagram).pathname.split('/').find(Boolean)

  const rows: (ContactRowProps & { key: string })[] = [
    {
      key: 'email',
      href: `mailto:${company.email}`,
      label: t('email'),
      value: company.email,
      Icon: MailIcon,
    },
    ...company.phones.map((phone) => ({
      key: phone.e164,
      href: `tel:${phone.e164}`,
      label: `${t('phone')} · ${footer('phoneLanguages', { languages: phone.languages })}`,
      value: phone.display,
      Icon: PhoneIcon,
    })),
    {
      key: 'whatsapp',
      href: `https://wa.me/${company.whatsapp.replace('+', '')}`,
      label: 'WhatsApp',
      value: whatsappPhone?.display ?? '',
      Icon: WhatsAppIcon,
    },
    {
      key: 'location',
      href: mapUrl,
      label: `${t('location')} · ${t('openMap')}`,
      value: `${company.postalCode} ${company.locality}, ${footer('region')}`,
      Icon: MapPinIcon,
    },
    // The client's brief (2026-10-22): opening hours and where he works. Facts, not links.
    {
      key: 'hours',
      label: t('hours'),
      value: t('hoursValue', company.hours),
      Icon: ClockIcon,
    },
    {
      key: 'area',
      label: t('area'),
      value: t('areaValue'),
      Icon: GlobeIcon,
    },
    {
      key: 'instagram',
      href: company.social.instagram,
      label: 'Instagram',
      value: instagram ? `@${instagram}` : 'Instagram',
      Icon: InstagramIcon,
    },
    {
      key: 'facebook',
      href: company.social.facebook,
      label: 'Facebook',
      value: company.name,
      Icon: FacebookIcon,
    },
  ]

  const areas = collections.applicationAreas.map((area) => ({
    id: area.id,
    title: area.title[locale],
  }))

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <CompanyJsonLd />
      <PageHeader eyebrow={t('eyebrow')} title={t.rich('title', accent)}>
        <p>{t('lead')}</p>
      </PageHeader>

      <section className="py-12 sm:py-16">
        <Container className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          <ul className="self-start border-t border-ink/10 lg:col-span-5">
            {rows.map(({ key, ...row }, index) => (
              <li
                key={key}
                data-reveal={String(Math.min(index + 1, 4))}
                className="border-b border-ink/10"
              >
                <ContactRow {...row} />
              </li>
            ))}
          </ul>

          <div
            id={QUESTION_FORM_ID}
            data-reveal="2"
            className="scroll-mt-28 rounded-2xl bg-paper p-6 shadow-[0_32px_64px_-32px_rgb(0_0_0/0.3)] ring-1 ring-ink/8 sm:rounded-3xl sm:p-10 lg:col-span-7"
          >
            <h2 className="mb-8 text-2xl font-medium tracking-tight sm:text-3xl">
              {t('formTitle')}
            </h2>
            <QuestionForm
              areas={areas}
              contact={{ email: company.email, phone: whatsappPhone?.display ?? '' }}
            />
          </div>
        </Container>
      </section>
    </main>
  )
}
