---
tags: [prompt-log]
date: 2026-11-04
agent: Claude Code (Opus 5.5)
status: done
---
# 2026-11-04 05 - Long words in the why cards

## Prompt

> The italian version of the page in the section why-title, "Lunga durata"
>
> When it's mobile version, center the text inside the card, it's too long, and I don't want to make the font size smaller than it is. For more consistency, center all text titles when it's italian

Then, after a measurement showed the other languages:

> German is also too long, we need to find a good solution for these too long card
>
> /no-ui-flash

## Goal

The durability word of the why cards ("Lunga durata", "Langanhaltend", "Long-lasting", "Dugotrajno") fits its card on phones without a smaller font, and the phone cards are centred.

## Result

- Measured before the change (`min(var(--text-stat), 20cqi)`, `whitespace-nowrap`): the word ran past its card at 360 px in Italian (130 px of text in 116 px), German (147 in 116), and English (124 in 116), and on desktops too: Italian at 1024 px (180 in 167) and 1280 px (246 in 231). The `20cqi` cap allows a word of about 5 em, and these words are 5.4 to 6.3 em.
- `WhySection.tsx`: the word keeps its size formula (never smaller) and may break onto a second line (`text-balance`, `leading-[1.05]`): at a space ("Lunga / durata"), a hyphen ("Long- / lasting"), or a soft hyphen. The numbers keep `whitespace-nowrap`. The four cards are centred on phones (`text-center sm:text-left`), in every language.
- Soft hyphens (U+00AD) in the messages: `de.json` "Lang­anhaltend", `bs.json` "Dugo­trajno" (it fits on one line at 360 px, 109 of 116 px, and breaks only if a font renders it wider). The German messages already use soft hyphens.
- no-ui-flash: the fit is CSS only, so the server HTML paints right the first time, with or without JavaScript and before Inter loads; no script measures and resizes the word.
- Checked in the browser at 320, 360, 412, 640, 1024, 1280, and 1536 px with all four words: no overflow, the same font sizes as before. Screenshots at 360 px in IT, DE, EN, BHS, and at 1280 px in IT (the word on two lines, left-aligned).
- `vp check`: 0 errors (two older warnings: the hidden reviews band). `vp test`: 339 passed. e2e not run (a CSS and text change; no colour or contrast changed).
- `CLAUDE.md` (Compact sizes): the rule for long words in the why cards.

## Changed files

- `src/features/home/WhySection.tsx`
- `messages/de.json`, `messages/bs.json`
- `CLAUDE.md`, this entry, `Prompt Log.md`

## Decisions

- **Break, do not shrink:** the author does not want a smaller font. A line break at a natural point keeps the size and works in every language and width; a shrink to fit the longest word would make German about 20 % smaller.
- **Centred in every language, not only Italian:** after the second prompt three of the four languages break on phones, so one rule for all keeps the cards the same in every language and needs no locale check in the component (`CLAUDE.md`: language facts only in `languages.ts`).
- **Desktops stay left-aligned:** the author asked for the phone layout. On desktops the word now breaks instead of overflowing where the card is narrow (1024 to about 1400 px).
- **Soft hyphens in the messages, not `hyphens: auto`:** the browser's dictionary could break "Langanhal-tend"; a soft hyphen at the compound boundary is the same in every browser.

## Open items

- Committed and pushed to `main` on the author's request ("Commit and push"). CI to confirm.
- Firefox not checked: the CSS is basic (`text-wrap: balance` is in Firefox 121), but the author tests there.
