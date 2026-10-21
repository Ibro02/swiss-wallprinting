import { getTranslations } from 'next-intl/server'
import { WhatsAppIcon } from '@/components/icons.tsx'
import { company } from '@/content/company.ts'

// Floating "chat on WhatsApp" link (decided by the author, Q9). Opens a chat with a
// prefilled message in the page language. Graphite on WhatsApp green: 9.7:1. Hidden on
// the configurator page: it would cover the panel and the bottom sheet, and the quote
// dialog there offers WhatsApp too.

export async function WhatsAppButton() {
  const t = await getTranslations('WhatsApp')
  const href = `https://wa.me/${company.whatsapp.replace('+', '')}?text=${encodeURIComponent(t('message'))}`

  return (
    <a
      href={href}
      aria-label={t('label')}
      title={t('label')}
      className="fixed right-4 bottom-4 z-40 grid size-14 place-items-center rounded-full bg-whatsapp text-graphite shadow-[0_10px_30px_-10px_rgb(0_0_0/0.5)] transition-transform hover:scale-105 motion-reduce:transition-none sm:right-6 sm:bottom-6 [body:has(#configurator-panel)_&]:hidden"
    >
      <WhatsAppIcon className="size-7" />
    </a>
  )
}
