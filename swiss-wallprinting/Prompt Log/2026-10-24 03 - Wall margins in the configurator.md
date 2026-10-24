---
tags: [prompt-log]
date: 2026-10-24
agent: Claude Code
status: done
---
# 2026-10-24 03 - Wall margins in the configurator

## Prompt

> Good, now let's make small changes in 3D model
>
> * add margins on the wall: 30cm top and bottom, 10 cm left and right
>    * so if the wall is 3m, image cannot be over 2.40 cm (because of the margins). Add this validation

## Goal

The print never touches the edges of the wall: 30 cm free at the top and bottom, 10 cm at the sides.

## Result

- `WALL_MARGIN` in `model/print.ts`. `printLimits` subtracts it (width minus 0.20 m, height minus 0.60 m, then the machine's 3.80 m); `fitPrintToWall` keeps the print centre so the print stays inside the margins. The store, share link, typed sizes, edge fields, drag, and the server's quote all use these functions, so every path is checked. A 3 m wall takes at most 2.40 m.
- Panel notes say the limit and the margin (`maxWidth`, `maxHeightWall` in all four languages, `{margin}` as a parameter).
- Tests updated and extended (248 pass); `vp check` passes. Checked in the browser: a 5 x 3 m wall shows 4.80 m and 2.40 m.

## Changed files

- `src/features/configurator/model/print.ts`, `model/__tests__/print.test.ts`, `__tests__/store.test.ts`
- `src/islands/configurator/Panel.tsx`, `messages/{it,de,en,bs}.json`

## Decisions

- The first print is now smaller on the default 5 x 2.7 m wall (3.36 x 1.68 m instead of 3.5 x 1.75 m): 80 % of the new height limit.
- Old share links with a larger print are fitted to the margins when opened.

## Open items

- E2E: 138 pass, 28 skipped; the theme test now expects the navy page colour (`rgb(31, 42, 61)`).
- Committed.
