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
import { PageChangeMark } from '@/islands/PageChangeMark.tsx'
import { siteUrl } from '@/lib/site.ts'
import { FIXED_THEME, THEME_CHOICE, THEME_SCRIPT } from '@/lib/theme.ts'
import { sans, serif } from '../fonts.ts'
import '../globals.css'

interface Props {
  children: ReactNode
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

const DARK_PAGE = '#1f2a3d'

// The browser bar: dark while the site is dark only (THEME_CHOICE off); with the choice on, it
// follows the device's theme (a visitor's own choice cannot reach this static tag).
export const viewport: Viewport = THEME_CHOICE
  ? {
      themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#ffffff' },
        { media: '(prefers-color-scheme: dark)', color: DARK_PAGE },
      ],
    }
  : { themeColor: DARK_PAGE, colorScheme: 'dark' }

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
    // data-theme: the site is dark only (THEME_CHOICE off), so the server renders it and the
    // first paint is dark on every device. With the choice on, THEME_SCRIPT may set data-theme
    // on <html> before React hydrates (suppressHydrationWarning).
    // data-scroll-behavior: Next.js turns the root's smooth scrolling (globals.css, for in-page
    // anchors) off while it puts a new page at the top; without it every page change scrolled
    // up for 0.6–0.8 s (the author's Firefox profile, 2026-11-01).
    <html
      lang={locale}
      className={`${sans.variable} ${serif.variable}`}
      data-theme={THEME_CHOICE ? undefined : FIXED_THEME}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        {/* Before the first paint: the visitor's saved theme (no flash of the other one). */}
        {/* oxlint-disable-next-line react/no-danger -- a fixed string from src/lib/theme.ts */}
        {THEME_CHOICE && <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />}
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
          <PageChangeMark />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
