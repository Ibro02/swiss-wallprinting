import { getTranslations } from 'next-intl/server'
import { accent } from '@/components/Accent.tsx'
import { CtaBand } from '@/components/CtaBand.tsx'
import { PageHeader } from '@/components/PageHeader.tsx'
import { Audiences } from '@/features/services/Audiences.tsx'
import { RoomCards } from '@/features/services/RoomCards.tsx'
import { Surfaces } from '@/features/services/Surfaces.tsx'
import { WhatWePrint } from '@/features/services/WhatWePrint.tsx'
import { metadataFor } from '@/i18n/metadata.ts'

export const generateMetadata = metadataFor('services')

// The rooms (before and after), what the client prints, who it is for, and the surfaces and
// technology: the last three from the client's brief (2026-10-22).
export default async function ServicesPage() {
  const t = await getTranslations('Services')
  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <PageHeader eyebrow={t('eyebrow')} title={t.rich('title', accent)}>
        <p>{t('lead')}</p>
      </PageHeader>
      <RoomCards />
      <WhatWePrint />
      <Audiences />
      <Surfaces />
      <CtaBand />
    </main>
  )
}
