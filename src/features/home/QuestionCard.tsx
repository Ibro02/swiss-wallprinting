import { getLocale, getTranslations } from 'next-intl/server'
import { company } from '@/content/company.ts'
import { collections } from '@/content/index.ts'
import { QUESTION_FORM_ID } from '@/features/contact/fields.ts'
import type { Locale } from '@/i18n/routing.ts'
import { QuestionForm } from '@/islands/QuestionForm.tsx'

// The white question card of the home page (in QuestionSection), from the author's
// reference: a greeting and the question form with the area chips. The direct ways to
// reach the client (phones, e-mail, WhatsApp, social) are beside it, in the section. Its
// id is the anchor of the hero's "Free quote" button.

export async function QuestionCard() {
  const t = await getTranslations('Home.hero.card')
  const locale = (await getLocale()) as Locale
  const whatsappPhone =
    company.phones.find((phone) => phone.e164 === company.whatsapp) ?? company.phones[0]

  const areas = collections.applicationAreas.map((area) => ({
    id: area.id,
    title: area.title[locale],
  }))

  return (
    <div
      id={QUESTION_FORM_ID}
      className="flex scroll-mt-28 flex-col gap-4 rounded-2xl bg-paper p-4 text-ink shadow-[0_24px_56px_-32px_rgb(0_0_0/0.35)] ring-1 ring-ink/5 sm:rounded-3xl sm:p-6"
    >
      <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
        {t('title')} <span aria-hidden="true">👋</span>
      </h2>

      <QuestionForm
        variant="card"
        areas={areas}
        contact={{ email: company.email, phone: whatsappPhone?.display ?? '' }}
      />
    </div>
  )
}
