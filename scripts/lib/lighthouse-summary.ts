// The Lighthouse scores of a run as a Markdown table, for the summary page of a CI run
// (scripts/lighthouse-summary.ts). The input is the manifest that Lighthouse CI writes with
// the "filesystem" upload target (lighthouserc.json): one entry per run, with the median run
// of each page marked. Lighthouse CI writes it also when an assertion fails.

export interface ManifestEntry {
  url: string
  isRepresentativeRun: boolean
  /** Category scores from 0 to 1; null when Lighthouse could not score the category. */
  summary: Record<string, number | null | undefined>
}

const CATEGORIES = [
  ['performance', 'Performance'],
  ['accessibility', 'Accessibility'],
  ['best-practices', 'Best practices'],
  ['seo', 'SEO'],
] as const

const score = (value: number | null | undefined) =>
  typeof value === 'number' ? String(Math.round(value * 100)) : '–'

/**
 * One row per page with the scores of its median run. Performance changes from run to run,
 * so its cell also gives the lowest and the highest score of the page's runs.
 */
export function lighthouseSummary(manifest: readonly ManifestEntry[]): string {
  const pages = manifest.filter((entry) => entry.isRepresentativeRun)
  if (pages.length === 0) return '## Lighthouse\n\nNo reports: Lighthouse CI wrote no runs.'

  const rows = pages.map((page) => {
    const runs = manifest.filter((entry) => entry.url === page.url)
    const performance = runs
      .map((entry) => entry.summary.performance)
      .filter((value): value is number => typeof value === 'number')
    const cells: string[] = CATEGORIES.map(([key]) => score(page.summary[key]))
    if (performance.length > 1) {
      cells[0] += ` (${score(Math.min(...performance))}–${score(Math.max(...performance))})`
    }
    return `| ${new URL(page.url).pathname} | ${cells.join(' | ')} |`
  })
  const runCount = Math.max(
    ...pages.map((page) => manifest.filter((entry) => entry.url === page.url).length),
  )

  return [
    '## Lighthouse',
    '',
    `${runCount > 1 ? `Mobile, the median of ${runCount} runs per page (performance: the median, then the lowest and the highest run).` : 'Mobile, one run per page.'} The HTML reports are in the artefact \`lighthouse\`.`,
    '',
    `| Page | ${CATEGORIES.map(([, label]) => label).join(' | ')} |`,
    `| --- | ${CATEGORIES.map(() => '---:').join(' | ')} |`,
    ...rows,
  ].join('\n')
}
