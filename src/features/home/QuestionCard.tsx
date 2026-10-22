import type { ComponentType, SVGProps } from 'react'
import { getLocale, getTranslations } from 'next-intl/server'
import { FacebookIcon, InstagramIcon, PhoneIcon, WhatsAppIcon } from '@/components/icons.tsx'
import { company } from '@/content/company.ts'
import { collections } from '@/content/index.ts'
import { QUESTION_FORM_ID } from '@/features/contact/fields.ts'
import type { Locale } from '@/i18n/routing.ts'
import { QuestionForm } from '@/islands/QuestionForm.tsx'

// The white question card of the home page (in QuestionSection), from the author's
// reference: the direct ways to reach the client (e-mail, phone, WhatsApp, Instagram,
// Facebook), "or", then the question form with the area chips. Its id is the anchor of the
// hero's "Free quote" button.

interface Channel {
  key: string
  href: string
  label: string
  Icon: ComponentType<SVGProps<SVGSVGElement>>
  /** Tint and icon colour: each pair has at least 4.5:1. */
  tone: string
}

export async function QuestionCard() {
  const t = await getTranslations('Home.hero.card')
  const locale = (await getLocale()) as Locale
  const [callPhone] = company.phones
  const whatsappPhone = company.phones.find((phone) => phone.e164 === company.whatsapp) ?? callPhone

  const channels: Channel[] = [
    ...(callPhone
      ? [
          {
            key: 'phone',
            href: `tel:${callPhone.e164}`,
            label: t('phone', { phone: callPhone.display }),
            Icon: PhoneIcon,
            tone: 'bg-plaster-200/70 text-graphite',
          },
        ]
      : []),
    {
      key: 'whatsapp',
      href: `https://wa.me/${company.whatsapp.replace('+', '')}`,
      label: t('whatsapp'),
      Icon: WhatsAppIcon,
      tone: 'bg-success-50 text-success',
    },
    {
      key: 'instagram',
      href: company.social.instagram,
      label: t('instagram'),
      Icon: InstagramIcon,
      tone: 'bg-pink-100 text-pink-700',
    },
    {
      key: 'facebook',
      href: company.social.facebook,
      label: t('facebook'),
      Icon: FacebookIcon,
      tone: 'bg-blue-100 text-blue-700',
    },
  ]

  const areas = collections.applicationAreas.map((area) => ({
    id: area.id,
    title: area.title[locale],
  }))

  return (
    <div
      id={QUESTION_FORM_ID}
      className="flex scroll-mt-28 flex-col gap-4 rounded-2xl bg-white p-4 text-graphite shadow-[0_24px_56px_-32px_rgb(0_0_0/0.35)] ring-1 ring-graphite/5 sm:rounded-3xl sm:p-6"
    >
      <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
        {t('title')} <span aria-hidden="true">👋</span>
      </h2>

      <div className="flex items-center justify-between gap-3 rounded-2xl bg-plaster px-4 py-2.5">
        <div className="min-w-0">
          <p className="text-xs text-mute">{t('writeTo')}</p>
          <a
            href={`mailto:${company.email}`}
            title={company.email}
            className="block truncate text-sm font-semibold text-magenta-700 hover:underline"
          >
            {company.email}
          </a>
        </div>
        <ul className="flex shrink-0 gap-1.5">
          {channels.map(({ key, href, label, Icon, tone }) => (
            <li key={key}>
              <a
                href={href}
                aria-label={label}
                title={label}
                className={`grid size-8 place-items-center rounded-xl transition-[opacity,transform] duration-150 ease-out hover:opacity-80 active:scale-[0.97] ${tone}`}
              >
                <Icon className="size-3.5" />
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="h-px flex-1 bg-plaster-200" />
        <span className="text-sm font-medium text-mute">{t('or')}</span>
        <span aria-hidden="true" className="h-px flex-1 bg-plaster-200" />
      </div>

      <QuestionForm
        variant="card"
        areas={areas}
        contact={{ email: company.email, phone: whatsappPhone?.display ?? '' }}
      />
    </div>
  )
}
