---
tags: [prompt-log]
date: 2026-11-01
agent: Claude Code (Opus 5.5)
status: done
---
# 2026-11-01 23 - German card text overflows

## Prompt

> in the /de/leistungen tab in the what title section, the last card is overflowing with text 
>
> "Für Architekten und Designer
>
> Massgeschneiderte Drucke für Architektur- und Innenarchitekturprojekte."

## Goal

The cards of "Was wir drucken" (`WhatWePrint`) on the German services page keep their text inside.

## Result

- Cause: on phones the cards are two by two (about 150 px of text), and long German words do not fit one line: "Innenarchitekturprojekte." stood 38 px past the card's padding at 360 px, "Firmengeschichten" (card "history") 23 px. On desktops (four columns) it fitted, just.
- The list now has `hyphens-auto break-words` (the same pair as `PageHeader` and `SectionHeading`).
- Chromium on Windows has no German hyphenation dictionary: it broke the words without a hyphen ("Massgeschneidert / e"). So `messages/de.json` has soft hyphens (`­`) in "Massgeschneiderte", "Innenarchitekturprojekte", and "Firmengeschichten"; every browser now breaks them with a hyphen.
- Checked at 360 × 740 in all four languages: no text past its card. `vp check` and the message tests pass.

## Changed files

- `src/features/services/WhatWePrint.tsx`
- `messages/de.json`

## Decisions

- Soft hyphens in the German message, not only CSS hyphenation, because Chromium on Windows does not hyphenate German. `break-words` stays as the last fallback for a future long word.

## Open items

- None. Not committed.
