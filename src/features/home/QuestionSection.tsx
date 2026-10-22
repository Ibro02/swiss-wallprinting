import type { ComponentType, SVGProps } from 'react'
import { getTranslations } from 'next-intl/server'
import { accent } from '@/components/Accent.tsx'
import { ContactRow } from '@/components/ContactRow.tsx'
import { CARD_Y, Container } from '@/components/Container.tsx'
import {
  FacebookIcon,
  InstagramIcon,
  MailIcon,
  PhoneIcon,
  WhatsAppIcon,
} from '@/components/icons.tsx'
import { SectionHeading } from '@/components/SectionHeading.tsx'
import { company } from '@/content/company.ts'
import { QuestionCard } from './QuestionCard.tsx'

// README item 6, "form for questions": on the left the heading, the two phone numbers
// (with the languages each one answers in) and the e-mail address as rows, and under them
// the buttons for a call, WhatsApp, Instagram, and Facebook; on the right the white
// question card with the form and the area chips. The card's id is the anchor of the
// hero's "Free quote" button.

interface Channel {
  key: string
  href: string
  label: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
  /** Tint and icon colour: each pair has at least 4.5:1. */
  tone: string
}

export async function QuestionSection() {
  const t = await getTranslations('Home.question')
  const card = await getTranslations('Home.hero.card')
  const footer = await getTranslations('Footer')
  const contact = await getTranslations('Contact')
  const [callPhone] = company.phones

  const channels: Channel[] = [
    ...(callPhone
      ? [
          {
            key: 'phone',
            href: `tel:${callPhone.e164}`,
            label: card('phone', { phone: callPhone.display }),
            Icon: PhoneIcon,
            tone: 'bg-plaster-200 text-graphite',
          },
        ]
      : []),
    {
      key: 'whatsapp',
      href: `https://wa.me/${company.whatsapp.replace('+', '')}`,
      label: card('whatsapp'),
      Icon: WhatsAppIcon,
      tone: 'bg-success-50 text-success',
    },
    {
      key: 'instagram',
      href: company.social.instagram,
      label: card('instagram'),
      Icon: InstagramIcon,
      tone: 'bg-pink-100 text-pink-700',
    },
    {
      key: 'facebook',
      href: company.social.facebook,
      label: card('facebook'),
      Icon: FacebookIcon,
      tone: 'bg-blue-100 text-blue-700',
    },
  ]

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
            <li
              data-reveal={String(company.phones.length + 1)}
              className="border-b border-graphite/10"
            >
              <ContactRow
                href={`mailto:${company.email}`}
                label={contact('email')}
                value={company.email}
                Icon={MailIcon}
              />
            </li>
          </ul>
          <ul data-reveal="4" className="mt-6 flex flex-wrap gap-2">
            {channels.map(({ key, href, label, Icon, tone }) => (
              <li key={key}>
                <a
                  href={href}
                  aria-label={label}
                  title={label}
                  className={`grid size-11 place-items-center rounded-xl transition-[opacity,transform] duration-150 ease-out hover:opacity-80 active:scale-[0.97] ${tone}`}
                >
                  <Icon className="size-5" />
                </a>
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
