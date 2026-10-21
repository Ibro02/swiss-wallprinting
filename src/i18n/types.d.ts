import type messages from '../../messages/it.json'
import type { routing } from './routing.ts'

declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof routing.locales)[number]
    Messages: typeof messages
  }
}
