// The production build must not contain mock content (Development Plan, P9).
// scripts/check-mock.ts calls these functions before `next build`.

import type { ContentItem } from './schema.ts'

export interface MockItem {
  collection: string
  id: string
}

/** Every content item that is still marked `mock: true`. */
export function findMockItems(collections: Record<string, readonly ContentItem[]>): MockItem[] {
  return Object.entries(collections).flatMap(([collection, items]) =>
    items.filter((item) => item.mock).map((item) => ({ collection, id: item.id })),
  )
}

/** Files in public/mock/ that the site can still serve. CREDITS.md is not served content. */
export function servedMockFiles(fileNames: readonly string[]): string[] {
  return fileNames.filter((name) => name !== 'CREDITS.md')
}

/** The message for a stopped build: what happened, what is safe, what to do. */
export function mockReport(items: readonly MockItem[], files: readonly string[]): string {
  const lines = [
    `Production build stopped: the site still contains ${items.length} mock content item(s) and ${files.length} mock file(s).`,
    'Nothing was built or deployed.',
    '',
    ...items.map((item) => `  - src/content: ${item.collection} / ${item.id}`),
    ...files.map((file) => `  - public/mock/${file}`),
    '',
    'To fix: replace each item with real content from the client (or set mock: false after the client confirms it),',
    'and delete the mock files. For a preview build with mock content, unset SITE_ENV.',
  ]
  return lines.join('\n')
}
