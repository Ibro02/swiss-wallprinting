---
tags: [prompt-log]
date: 2026-10-22
agent: Claude Code (Opus 5.5)
status: done
---
# 2026-10-22 11 - Area cards back to mist

## Prompt

> good, it works now. Just one thing messed up, cards that you just added in areas-title are black in white mode 
>
> can you change them back to the previous color (befor the update)

## Goal

The phone fixes of [[2026-10-22 10 - Phone bugs, glow card, area cards]] work on the author's phone. The application area cards must have their colour from before that entry again (mist, not black), with the new "Programs" layout and hover.

## Result

- **The cards are mist again** (`bg-plaster`; in the dark theme Claude's warm mist `#30302e`), as before entry 10; under the mouse they turn paper (`hover:bg-paper`), as before.
- **The layout and the hover of "Programs" stay:** the icon in a tinted tile, the title, the line, "Prova nel configuratore →" and the number at the foot; under the mouse the card rises 6 px, the rim and the glow turn lime, and one band of lime light sweeps across.
- **Colours for the light ground** (lime text is never on a light ground): the link and the phone arrow are `magenta-700` (`magenta-200` in the dark theme), as before entry 10; the description and the number are `text-mute`; the icon tile is lime 25 % with a graphite icon (lime 12 % with a lime icon in the dark theme). The rim is transparent at rest, so the lime rim appears without moving the content.
- **Checks:** `vp check` clean; screenshots on desktop (1440 × 900) and phone (Pixel 7), light and dark; axe on the section: no violations in any of the four.

## Changed files

- `src/features/home/ApplicationAreas.tsx`, `src/app/globals.css` (`.area-card`)
- `CLAUDE.md` (motion rule, code layout), `swiss-wallprinting/Prompt Log/Prompt Log.md`, this log

## Decisions

- Kept the "Programs" layout and hover; only the colours went back. The author named only the colour.
- The icon keeps a tile, now pale lime instead of black: the author removed the black icon backgrounds on 2026-10-22 ([[2026-10-22 02 - Commit, hero room, sliding reviews, glow cards]]); a pale tile is part of the "Programs" layout. Remove it if the author prefers plain icons.

## Open items

- Committed on `main` on the author's next prompt ("Commit this fix on main (no push)."); not pushed.
