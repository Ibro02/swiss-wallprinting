import { getFormatter, getTranslations } from 'next-intl/server'
import { Container } from '@/components/Container.tsx'
import { PageHeader } from '@/components/PageHeader.tsx'
import { company } from '@/content/company.ts'
import { legal } from '@/content/legal.ts'
import { DraftBanner, LegalSection } from '@/features/legal/parts.tsx'
import { metadataFor } from '@/i18n/metadata.ts'

export const generateMetadata = metadataFor('privacy')

// Privacy policy under the Swiss Federal Act on Data Protection (FADP, in force since
// 2023-09-01), with the GDPR rights for visitors from the EU. It describes what this site
// really does: the form, e-mail and phone contacts, server logs, no cookies, self-hosted
// fonts, links to other services. A DRAFT: the client (or a lawyer) must check it.

const SECTIONS = [
  'data',
  'purpose',
  'recipients',
  'abroad',
  'cookies',
  'links',
  'retention',
  'rights',
  'changes',
] as const

export default async function PrivacyPage() {
  const t = await getTranslations('Privacy')
  const legalT = await getTranslations('Legal')
  const format = await getFormatter()
  const missing = `[${legalT('missing')}]`

  const values = {
    company: legal.legalName ?? company.name,
    email: company.email,
    hosting: legal.hosting ?? missing,
    mailProvider: legal.mailProvider ?? missing,
  }

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <PageHeader eyebrow={t('eyebrow')} title={t('title')}>
        <p>{t('lead')}</p>
      </PageHeader>
      {legal.mock && <DraftBanner />}
      <Container className="pt-6 pb-24">
        <LegalSection title={t('controller.title')}>
          <p>{t('controller.text', values)}</p>
          <address className="not-italic">
            {values.company}
            <br />
            {company.postalCode} {company.locality}
            <br />
            <a href={`mailto:${company.email}`}>{company.email}</a>
          </address>
        </LegalSection>
        {SECTIONS.map((section) => (
          <LegalSection key={section} title={t(`${section}.title`)}>
            <p>{t(`${section}.text`, values)}</p>
          </LegalSection>
        ))}
        <p className="pt-6 text-sm text-mute">
          {legalT('updated', {
            date: format.dateTime(new Date(legal.updated), { dateStyle: 'long' }),
          })}
        </p>
      </Container>
    </main>
  )
}
