import { describe, expect, it } from 'vite-plus/test'
import { lighthouseSummary, type ManifestEntry } from '../lib/lighthouse-summary.ts'

const run = (
  url: string,
  performance: number | null,
  isRepresentativeRun = false,
): ManifestEntry => ({
  url,
  isRepresentativeRun,
  summary: { performance, accessibility: 0.96, 'best-practices': 1, seo: 1 },
})

describe('lighthouseSummary', () => {
  const manifest = [
    run('http://localhost:3001/it', 0.77),
    run('http://localhost:3001/it', 0.81),
    run('http://localhost:3001/it', 0.79, true),
    run('http://localhost:3001/it/servizi', 0.9, true),
  ]
  const table = lighthouseSummary(manifest)

  it('has one row per page, from its median run', () => {
    expect(table).toContain('| /it | 79 (77–81) | 96 | 100 | 100 |')
    expect(table.match(/^\| \/it/gm)).toHaveLength(2)
  })

  it('gives the range of performance only when a page has several runs', () => {
    expect(table).toContain('| /it/servizi | 90 | 96 | 100 | 100 |')
  })

  it('names the largest number of runs per page', () => {
    expect(table).toContain('the median of 3 runs per page')
  })

  it('shows a dash for a category Lighthouse could not score', () => {
    const single = lighthouseSummary([run('http://localhost:3001/it', null, true)])
    expect(single).toContain('| /it | – | 96 | 100 | 100 |')
    expect(single).toContain('one run per page')
  })

  it('says so when there are no runs', () => {
    expect(lighthouseSummary([])).toContain('No reports')
  })
})
