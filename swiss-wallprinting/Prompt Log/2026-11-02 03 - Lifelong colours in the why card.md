---
tags: [prompt-log]
date: 2026-11-02
agent: Claude Code (Opus 5.5)
status: done
---
# 2026-11-02 03 - Lifelong colours in the why card

## Prompt

In the same session, first:

> I don't like new things you did with hero video animation
>
> first, why is it soo scaled and zoomed in on desktop? It is terrible
>
> Then, I miss the pain as scrolled effect both on mobile and desktop, I don't like this quick solution

Then, while the agent worked:

> in the section "why title" one of the cards with 12+ dd tag, I want to change 12+ in "lifelong"
>
> also, remove from all languages outdoors part of the sentence

Follow-up, after the agent offered to change the FAQ and the process step that "still say 12 years":

> CHANGE THEM AND SKIL E2E TESTING

## Goal

The hero: the whole video on desktops, and the scroll paints the wall again. The why card: "lifelong" instead of "12+", without "outdoors".

## Result

- **The hero: superseded.** This session found the cause of the zoom (on a laptop window, 1536 × 730, the stage is 2.6:1 and the 16:9 frame filled its width, so 68 % of the video's height showed) and built a fix: the whole height on wide stages, a blurred backdrop on the sides, the edges faded; and the scroll painting back (`200vh`, no `playSeconds`). While its tests ran, the author asked another session to put the hero back to commit `c3b9434` ([[2026-11-02 02 - Hero back to c3b9434]]), which reverted those files. That entry is what the code has; nothing of this session's hero work is in the code.
- **The why card** (`WhySection`): the value is a word now, `Home.why.stats.durabilityValue`: IT "A vita", DE "Lebenslang", EN "Lifelong", BS "Doživotno"; the label lost "years" and "outdoors": IT "Colori brillanti", DE "Leuchtende Farben", EN "Bright colours", BS "Žive boje" (DE, EN, BS drafts).
- A word is wider than the numbers: on a 360 px phone "Lebenslang" stood 19 px out of its half-width card. The card is an inline-size container, and a word value's size is `min(var(--text-stat), 20cqi)` (23 px there; the numbers stay 28 px).
- **Follow-up:** the FAQ and the process step do **not** show 12 years: their code passes `years`, but no message uses it (the client's texts replaced them). The agent's offer was wrong; nothing changed there. The other item it had listed, the why promise "Interior and exterior walls" (`Home.why.features.inOut`), now says interior only: IT "Pareti interne.", DE "Innenwände.", EN "Interior walls.", BS "Unutrašnji zidovi.". `vp check` and `vp test` (311) pass; e2e skipped on the author's request.
- `vp test` 311, `vp check` (the old `hasMock` warning), build, full e2e 138 passed (36 skipped), Lighthouse CI passed (home performance median 74, the others 87–91).

## Changed files

- `messages/{it,de,en,bs}.json` (`Home.why.stats.durability`, `durabilityValue`)
- `src/features/home/WhySection.tsx`
- Follow-up: `messages/{it,de,en,bs}.json` (`Home.why.features.inOut`)

## Decisions

- `durabilityYears` (12) stays in `company.ts`: no page shows it now, and removing it is a separate clean-up.

## Open items

- Outdoors is still on the services page (a technical fact: "Indoors and outdoors, with the right surface preparation") and in the FAQ ("Can you print on exterior walls?"). Change them?
- `durabilityYears` is passed to the FAQ and process texts but unused.
- Home Lighthouse performance is at the 75 floor (74–76 in local runs).
- Not committed.
