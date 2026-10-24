import type { Metadata, Viewport } from 'next'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { FRAME } from '@/components/Container.tsx'
import { SiteFooter } from '@/components/site/SiteFooter.tsx'
import { SiteHeader } from '@/components/site/SiteHeader.tsx'
import { WhatsAppButton } from '@/components/site/WhatsAppButton.tsx'
import { company } from '@/content/company.ts'
import { routing } from '@/i18n/routing.ts'
import { siteUrl } from '@/lib/site.ts'
import { THEME_SCRIPT } from '@/lib/theme.ts'
import { sans, serif } from '../fonts.ts'
import '../globals.css'

interface Props {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

// The browser bar follows the device's theme (a visitor's own choice cannot reach this
// static tag; the page itself follows the choice).
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1f2a3d' },
  ],
}

export async function generateMetadata({ params }: Omit<Props, 'children'>): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const t = await getTranslations({ locale, namespace: 'Metadata' })
  return {
    // Absolute URLs for canonical and hreflang links. Set SITE_URL per deployment.
    metadataBase: new URL(siteUrl()),
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
    // suppressHydrationWarning: THEME_SCRIPT may set data-theme on <html> before React hydrates.
    <html lang={locale} className={`${sans.variable} ${serif.variable}`} suppressHydrationWarning>
      <head>
        {/* Before the first paint: the visitor's saved theme (no flash of the other one). */}
        {/* oxlint-disable-next-line react/no-danger -- a fixed string from src/lib/theme.ts */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="antialiased">
        <NextIntlClientProvider messages={clientMessages}>
          <SiteHeader />
          {/* The white frame: every page is a column of cards inside it. */}
          <div className={`${FRAME} flex min-h-dvh flex-col pt-3 sm:pt-4 md:pt-6`}>
            <div className="flex-1">{children}</div>
            <SiteFooter />
          </div>
          <WhatsAppButton />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
