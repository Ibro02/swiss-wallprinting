---
tags: [prompt-log, motion, navigation]
date: 2026-11-01
agent: Claude Code (Opus 5.5)
status: done (committed on main, pushed)
---
# 2026-11-01 13 - One second page fade

## Prompt

> can we make a smooth transition between the pages (to ad 1sec fade in)

## Goal

A page reached by a client-side page change fades in over 1 s, as a smooth transition.

## Result

- **`globals.css`:** after a client-side page change (`data-page-change`, `PageChangeMark`), the new page's `<main>` fades in as a whole: `animation: fade 1s var(--ease-out)`. The first screen's own animation (`data-rise`) is off then, so the two fades do not multiply. The header and the footer (in the layout) stay. Reduced motion: 0.4 s. The first page load keeps the entrance (the 0.8 s rise).
  - Before: only the `data-rise` elements of the first screen faded, in 150 ms ([[2026-11-01 05 - Short fade on page changes]]).
  - No fill mode: after the second, `main` has no animation and no stacking context. Inside `main` nothing fixed sits outside the top layer (the gallery's buttons are in its `<dialog>`), so the fade does not change what is in front of what.
- **Measured in Playwright's Firefox (production build):** the first frame of the new page is at opacity 0 (no flash of the full page, also on the first page change after a load), then 0.11 after 20 ms, 0.6 after about 150 ms, 0.98 after about 600 ms, and 1 at 1 s. The strong ease-out shows the page at once and settles over the rest of the second.
  - The longest gap between frames after a page change is 127–191 ms with the fade and 134–181 ms without it: that is the page's own work after the swap, not the fade.
  - Headless Firefox draws in software, and it gave 40–67 frames per 1.3 s with the fade (about 100 without). In the author's own profile Firefox runs these fades on the compositor (`oncompositor: true`), where they cost no main-thread work. To look at on the author's Firefox and a phone.
- **`e2e/page-change.spec.ts`:** on the first load `main` has no animation and the first screen rises in; after a page change, `main` has `fade 1s` and `data-rise` has none.
- **Checks:** `vp check` clean; `vp run build` passed; full `vp run e2e` 143 passed, 29 skipped, 0 failed.
- `CLAUDE.md`, the motion rule and the islands row; the `PageChangeMark` comment.

## Changed files

- `src/app/globals.css`, `src/islands/PageChangeMark.tsx`
- `e2e/page-change.spec.ts`
- `CLAUDE.md`, this entry, `Prompt Log.md`

## Decisions

- **The author's choice: 1 s**, against the "UI transitions under 300 ms" rule (the same kind of exception as the scroll hero and the reviews band). It is opacity only, and the page can be read and clicked during the fade.
- **The whole `<main>`, not only the first screen:** the cards and their text fade together, so the page arrives as one piece.
- **The strong ease-out from the tokens**, so the page is visible almost at once. A softer curve (more of the second visible) was offered; **the author: "Keep the fast start"** (2026-11-01).
- No cross-fade with the View Transitions API: it would need Next.js's experimental `viewTransition` flag, the old page would block clicks for the second, and the fixed header pill would fade with the snapshot.

## Open items

- The author looks at the fade in Firefox and on a phone (the curve is decided: the fast start stays).
- Committed on `main` with entries 11 and 12 ("Yes, commit"), not pushed.
