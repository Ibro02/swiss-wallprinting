---
tags: [prompt-log]
date: 2026-10-22
agent: Claude Code (Opus 5.5)
status: done
---
# 2026-10-22 09 - Lighthouse reports on every CI run

## Prompt

> Yes, make CI upload the Lighthouse reports on every run, so I can see the scores.

## Goal

The first CI run of the job `quality` passed ([[2026-10-22 07 - Merge Phase 6 and dark mode]]), but a passing run did not show the Lighthouse scores: CI kept `test-results/` only when a step failed. The author wants to see the scores of every run.

## Result

- **Score table on the run's summary page:** new step `vp run lighthouse:summary` after Lighthouse CI. `scripts/lighthouse-summary.ts` reads the manifest that Lighthouse CI writes (`test-results/lighthouse/manifest.json`, "filesystem" upload target) and appends a Markdown table to `GITHUB_STEP_SUMMARY`: one row per page with the median run's performance, accessibility, best practices, and SEO; performance also gives the lowest and the highest of the three runs. Locally it only prints the table.
- **Reports on every run:** the artefact `lighthouse` (`test-results/lighthouse/`: the HTML and JSON report of each page and run, and the manifest), kept 14 days.
- Both steps run also when an assertion fails (Lighthouse CI writes the reports before it exits with the error; checked in `@lhci/cli` 0.15.1 `autorun.js`), and not when Lighthouse did not run (an earlier step failed) or the run was cancelled.
- The failure artefact `test-results` (Playwright traces and screenshots) leaves out `test-results/lighthouse/`, so the reports are not uploaded twice.
- **Checks:** the table checked on a real manifest made from the saved local runs (`npx @lhci/cli@0.15.1 upload --target=filesystem`): home 77, services 88, gallery 90, contact 93 (accessibility 96), configurator 91, the same as in 07. The workflow parses as YAML with the expected conditions. `vp check` clean, `vp test` 234 passed (5 new). The new steps run on GitHub only after a push.

## Changed files

- `.github/workflows/ci.yml` (step `id: lighthouse`, the summary step, the artefact `lighthouse`, the failure artefact without the reports)
- `scripts/lighthouse-summary.ts` (new), `scripts/lib/lighthouse-summary.ts` (new, the pure table function), `scripts/__tests__/lighthouse-summary.test.ts` (new)
- `package.json` (script `lighthouse:summary`)
- `CLAUDE.md` (Commands, CI, Code layout), `swiss-wallprinting/Specs/Phase 6 Quality.md`
- `swiss-wallprinting/Prompt Log/Prompt Log.md`, this log; also the note of the passed first CI run in [[2026-10-22 07 - Merge Phase 6 and dark mode]] (previous message of the author)

## Decisions

- The table comes from LHCI's own manifest (it marks the median run of each page), not from the raw `.lighthouseci/` files: no median logic of our own, and the file exists also when an assertion fails.
- A table on the summary page and the HTML reports as an artefact: the scores are visible without a download; the reports are there to see why a score is low.
- No `temporary-public-storage` upload (public links to the reports at Google) and no LHCI GitHub App token: the summary page shows the scores without a third party.
- The artefact is kept 14 days (the Playwright results 7): enough to compare a few runs; the repo is public, so artefact storage is free.

## Open items

- **Committed and pushed** on the author's next prompt ("after you're done, push all changes to main and commit it"): on `main`, as its own commit after the audit ([[2026-10-22 08 - Security and architecture audit]]). The first table shows on the CI run of that push.
- The two Phase 6 targets stay open: home performance 0.9 (77–81 locally) and JS 150 KB gzip.
