---
tags: [prompt-log]
date: 2026-11-01
agent: Claude Code (Opus 5.5)
status: done
---
# 2026-11-01 25 - Shorter hero scroll

## Prompt

> super, just few small corrections: at hero page, there is too much scroll after animation is done, I think it is a leftover from the previous version. Cut it

## Goal

After the print has played, the home hero does not hold the page for a long idle scroll.

## Result

- Cause: the hero section was `200vh` (from the time the scroll drove the whole print). Since one scroll plays the print by itself (`playSeconds`, entry 20), the stage stayed pinned for 816 px (at 768 px high) after the print had finished.
- `length="140vh"` in `Hero.tsx`: the stage is pinned for about 0.4 of a screen (355 px at 768 px high). A faster scroll than the 2 s play speeds the print up to the scroll (`playTowards`, unchanged), so the print still ends before the stage leaves.
- `e2e/home.spec.ts`: the test scrolled back by `distance / 16`, which on the shorter phone section is 21 px, under `REWIND_PX` (24 px, the deadband for scroll anchoring), so it saw no rewind. It now scrolls to ¼ and back to ⅛.
- Build, e2e `home`, `smoke`, `budgets` pass; `vp check` (the known `hasMock` warning only).

## Changed files

- `src/features/home/Hero.tsx`
- `e2e/home.spec.ts`
- `CLAUDE.md` (the hero length)

## Decisions

- 140vh, not shorter: the stage must stay pinned long enough for a normal swipe while the print plays; a shorter section would scroll the stage away mid-print.

## Open items

- To feel on a real phone and in Firefox. Not committed.
