import { getTranslations } from 'next-intl/server'
import { CtaBand } from '@/components/CtaBand.tsx'
import { PageHeader } from '@/components/PageHeader.tsx'
import { RoomCards } from '@/features/services/RoomCards.tsx'
import { WhatWePrint } from '@/features/services/WhatWePrint.tsx'
import { metadataFor } from '@/i18n/metadata.ts'

export const generateMetadata = metadataFor('services')

export default async function ServicesPage() {
  const t = await getTranslations('Services')
  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <PageHeader eyebrow={t('eyebrow')} title={t('title')}>
        <p>{t('lead')}</p>
      </PageHeader>
      <RoomCards />
      <WhatWePrint />
      <div className="py-24">
        <CtaBand />
      </div>
    </main>
  )
}
