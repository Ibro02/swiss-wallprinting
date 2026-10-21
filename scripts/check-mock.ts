// Runs before `next build` (package.json "build"). With SITE_ENV=production it stops
// the build while mock content exists, so placeholder reviews and photos never go live.

import { existsSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { collections } from '../src/content/index.ts'
import { findMockItems, mockReport, servedMockFiles } from '../src/content/mock-guard.ts'

if (process.env.SITE_ENV !== 'production') {
  console.log('Mock guard: skipped (SITE_ENV is not "production"; mock content is allowed).')
  process.exit(0)
}

const mockDir = path.resolve(import.meta.dirname, '../public/mock')
const items = findMockItems(collections)
// Files only (not the folders), as paths relative to public/mock/ with "/".
const files = existsSync(mockDir)
  ? servedMockFiles(
      readdirSync(mockDir, { recursive: true, withFileTypes: true })
        .filter((entry) => entry.isFile())
        .map((entry) =>
          path.relative(mockDir, path.join(entry.parentPath, entry.name)).replaceAll('\\', '/'),
        ),
    )
  : []

if (items.length > 0 || files.length > 0) {
  console.error(mockReport(items, files))
  process.exit(1)
}

console.log('Mock guard: passed (no mock content).')
