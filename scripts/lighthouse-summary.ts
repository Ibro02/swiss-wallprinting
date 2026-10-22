// Runs after Lighthouse CI (`vp run lighthouse:summary`; CI job `quality`): reads the
// manifest of the reports in test-results/lighthouse/ and writes the scores as a table to
// the run's summary page (GITHUB_STEP_SUMMARY), so a passing run shows them too. Locally it
// only prints the table.

import { appendFileSync, existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { lighthouseSummary, type ManifestEntry } from './lib/lighthouse-summary.ts'

const manifestPath = path.resolve(import.meta.dirname, '../test-results/lighthouse/manifest.json')

if (!existsSync(manifestPath)) {
  console.log(
    'Lighthouse summary: skipped (no test-results/lighthouse/manifest.json; run Lighthouse CI first).',
  )
  process.exit(0)
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as ManifestEntry[]
const table = lighthouseSummary(manifest)

if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${table}\n`)
console.log(table)
