import { getFormatter, getTranslations } from 'next-intl/server'
import type { ReactNode } from 'react'
import { Container } from '@/components/Container.tsx'
import { PageHeader } from '@/components/PageHeader.tsx'
import { company } from '@/content/company.ts'
import { credits } from '@/content/credits.ts'
import { legal } from '@/content/legal.ts'
import { DraftBanner, LegalSection, Missing } from '@/features/legal/parts.tsx'
import { metadataFor } from '@/i18n/metadata.ts'

export const generateMetadata = metadataFor('imprint')

// Swiss imprint: who runs the site and how to reach them (UWG Art. 3 para. 1 let. s for
// commercial sites). Facts the client has not sent are shown as missing (src/content/legal.ts).
export default async function ImprintPage() {
  const t = await getTranslations('Imprint')
  const legalT = await getTranslations('Legal')
  const footer = await getTranslations('Footer')
  const format = await getFormatter()
  const fact = (value: string | null): ReactNode => value ?? <Missing />

  const rows: { label: string; value: ReactNode }[] = [
    {
      label: t('fields.name'),
      // Without the registered name and legal form: the brand name, marked as incomplete.
      value: legal.legalName ?? (
        <>
          {company.name} <Missing />
        </>
      ),
    },
    {
      label: t('fields.address'),
      value: (
        <>
          {fact(legal.street)}
          <br />
          {company.postalCode} {company.locality}, {footer('region')}
        </>
      ),
    },
    {
      label: t('fields.email'),
      value: <a href={`mailto:${company.email}`}>{company.email}</a>,
    },
    {
      label: t('fields.phone'),
      value: company.phones.map((phone) => (
        <a key={phone.e164} href={`tel:${phone.e164}`} className="block">
          {phone.display}
        </a>
      )),
    },
    { label: t('fields.responsible'), value: fact(legal.responsible) },
    { label: t('fields.uid'), value: fact(legal.uid) },
  ]

  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <PageHeader eyebrow={t('eyebrow')} title={t('title')} />
      {legal.mock && <DraftBanner />}
      <Container className="pt-6 pb-24">
        <LegalSection title={t('operator')}>
          <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-[12rem_1fr]">
            {rows.map(({ label, value }) => (
              <div key={label} className="contents">
                <dt className="font-semibold">{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </LegalSection>
        <LegalSection title={t('liability.title')}>
          <p>{t('liability.text')}</p>
        </LegalSection>
        <LegalSection title={t('links.title')}>
          <p>{t('links.text')}</p>
        </LegalSection>
        <LegalSection title={t('copyright.title')}>
          <p>{t('copyright.text')}</p>
        </LegalSection>
        <LegalSection title={t('credits.title')}>
          <p>{t('credits.text')}</p>
          <ul className="list-disc space-y-1 pl-5">
            {credits.map((credit) => (
              <li key={credit.url}>
                <a href={credit.url} className="underline underline-offset-2">
                  {credit.work}
                </a>
                , {credit.author} ({credit.licence})
              </li>
            ))}
          </ul>
        </LegalSection>
        <p className="pt-6 text-sm text-mute">
          {legalT('updated', {
            date: format.dateTime(new Date(legal.updated), { dateStyle: 'long' }),
          })}
        </p>
      </Container>
    </main>
  )
}
