---
tags: [prompt-log, performance, motion]
date: 2026-11-01
agent: Claude Code (Opus 5.5)
status: done (committed on security/deepsec, not pushed)
---
# 2026-11-01 05 - Short fade on page changes

## Prompt

> Yes, short fade

## Goal

The author's answer to [[2026-11-01 04 - Slow route changes]]: keep the entrance (`data-rise`) on the first page load, and let a page reached by a client-side page change fade in briefly instead.

## Result

- `src/islands/PageChangeMark.tsx` (new, in the `[locale]` layout): when the path changes after the first page, a layout effect sets `data-page-change` on `<html>`. It runs after the new page is in the DOM and before the browser paints it, so the new page's first frame is already the fade.
- `globals.css`: `:root[data-page-change] [data-rise] { animation: fade 150ms var(--ease-out) both; }`. Its specificity is above the `data-rise="2"…"4"` delays, so there is no delay. The first page load is unchanged: a 0.8 s rise, delays up to 0.28 s.
- Checked in the browser pane (dev): first load `rise 0.8s`; after a header click, the new page's `h1` card is `fade 0.15s` at insertion (opacity 0, then 1 within 150 ms).
- `e2e/page-change.spec.ts` (new, desktop): first load `rise 0.8s`; after a click, `data-page-change` and `fade 0.15s`.
- **Checks:** `vp check` clean; `vp test` 272 passed; `vp run build` passed; full `vp run e2e` 138 passed, 28 skipped, 0 failed (before the new test); the new test passed.
- `CLAUDE.md`: the motion rule (the entrance only on the first load; judge navigation speed with a production build) and the islands row.

## Changed files

- `src/islands/PageChangeMark.tsx` (new), `src/app/[locale]/layout.tsx`, `src/app/globals.css`
- `e2e/page-change.spec.ts` (new)
- `CLAUDE.md`, this entry, [[2026-11-01 04 - Slow route changes]], `Prompt Log.md`

## Decisions

- **The author: "Yes, short fade."** 150 ms, under the 300 ms of the motion rule; the same `fade` keyframes as reduced motion.
- A language change stays a full page load, so it shows the entrance (it is a first load).
- The dev server's 1.5–1.8 s on the first visit of a page is not a code problem: a production build changes pages in 12–64 ms.

## Open items

- Committed on `security/deepsec` with [[2026-11-01 04 - Slow route changes]] on the author's request ("Yes, commit"), not pushed.
- Not checked in Firefox (the author's browser) or on a phone.
