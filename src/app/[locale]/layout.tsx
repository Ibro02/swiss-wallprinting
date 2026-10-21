import type { Metadata, Viewport } from 'next'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { SiteFooter } from '@/components/site/SiteFooter.tsx'
import { SiteHeader } from '@/components/site/SiteHeader.tsx'
import { WhatsAppButton } from '@/components/site/WhatsAppButton.tsx'
import { company } from '@/content/company.ts'
import { routing } from '@/i18n/routing.ts'
import { display, sans } from '../fonts.ts'
import '../globals.css'

interface Props {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export const viewport: Viewport = {
  themeColor: '#0e0e10',
}

export async function generateMetadata({ params }: Omit<Props, 'children'>): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const t = await getTranslations({ locale, namespace: 'Metadata' })
  return {
    // Absolute URLs for canonical and hreflang links. Set SITE_URL per deployment.
    metadataBase: new URL(process.env.SITE_URL ?? 'https://www.swisswallprinting.ch'),
    title: { default: t('title'), template: `%s · ${company.name}` },
    description: t('description'),
    applicationName: company.name,
  }
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  // Only the namespaces that client components use go to the browser.
  const messages = await getMessages()
  const clientMessages = {
    Nav: messages.Nav,
    QuestionForm: messages.QuestionForm,
    BeforeAfter: messages.BeforeAfter,
    GalleryGrid: messages.GalleryGrid,
  }

  return (
    <html lang={locale} className={`${display.variable} ${sans.variable}`}>
      <body className="flex min-h-dvh flex-col antialiased">
        <NextIntlClientProvider messages={clientMessages}>
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <SiteFooter />
          <WhatsAppButton />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
