---
tags: [prompt-log]
date: 2026-11-02
agent: Claude Code (Opus 5.5)
status: done
---
# 2026-11-02 05 - Hero short scroll again

## Prompt

> you return scroll bug I had few prompts ago (too much scrolling in the empty space at the begining)

## Goal

Keep the hero of `c3b9434` ([[2026-11-02 02 - Hero back to c3b9434]], committed `1f5c992`), but without the long idle scroll that `f63b578` had fixed.

## Result

- Applied the change of commit `f63b578` again on top of `1f5c992`: the hero section is `140vh` (was `200vh`), so the stage is pinned for about 0.4 of a screen; one scroll still plays the print (`playSeconds={2}`). The home e2e rewind test and the CLAUDE.md hero note are as in `f63b578`.
- The frame CSS and `PrintOnScroll.tsx` stay as in `c3b9434` (no blurred backdrop, the video across the full width).
- `vp test` 311 passed; `vp check` 0 errors. The dev server (restarted in this session, `.next` cleared) serves `--print-length: 140vh`. e2e not run.

## Changed files

- `src/features/home/Hero.tsx`
- `e2e/home.spec.ts`
- `CLAUDE.md` (the "Scroll hero" note)

## Decisions

- The hero is now the same as at commit `7f83f91` before the uncommitted backdrop edits: `c3b9434` plus `f63b578`.

## Open items

- Not committed. The author checks the hero at localhost:3000.
