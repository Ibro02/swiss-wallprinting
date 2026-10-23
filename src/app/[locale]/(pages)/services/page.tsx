import { getTranslations } from 'next-intl/server'
import { accent } from '@/components/Accent.tsx'
import { CtaBand } from '@/components/CtaBand.tsx'
import { PageHeader } from '@/components/PageHeader.tsx'
import { Audiences } from '@/features/services/Audiences.tsx'
import { Surfaces } from '@/features/services/Surfaces.tsx'
import { WhatWePrint } from '@/features/services/WhatWePrint.tsx'
import { metadataFor } from '@/i18n/metadata.ts'

export const generateMetadata = metadataFor('services')

// Who it is for (business and private clients, with the client's walls before and after),
// what he prints, and the surfaces and technology: from his brief (2026-10-22).
export default async function ServicesPage() {
  const t = await getTranslations('Services')
  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <PageHeader eyebrow={t('eyebrow')} title={t.rich('title', accent)}>
        <p>{t('lead')}</p>
      </PageHeader>
      <Audiences />
      <WhatWePrint />
      <Surfaces />
      <CtaBand />
    </main>
  )
}
