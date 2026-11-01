---
tags: [prompt-log]
date: 2026-11-02
agent: Claude Code (Opus 5.5)
status: done
---
# 2026-11-02 04 - Outdoors out of services and FAQ

## Prompt

> Yes, remove both

(The agent had asked: "Remove outdoors from the services fact and the FAQ too?", after [[2026-11-02 03 - Lifelong colours in the why card]].)

Follow-up, after the agent asked whether to drop outdoors from the footer line and the search description:

> Yes, drop it

## Goal

The services page and the FAQ no longer mention printing outdoors.

## Result

- Services, "Surfaces": the fact "Indoors and outdoors, with the right surface preparation" is gone (`FACTS` in `Surfaces.tsx` has three: height, width, UV inks; `Services.surfaces.facts.inOut` removed in four languages).
- FAQ: the question "Can you print on exterior walls?" is gone (`QUESTIONS` in `faq/page.tsx`; `Faq.items.outdoor` removed in four languages). Eight questions remain.
- **Follow-up:** the search description (`Metadata.description`) and the footer line (`Footer.intro`) say interior walls only, in four languages (IT "pareti interne", DE "Innenwände", EN "interior walls", BS "unutrašnje zidove").
- `vp check` and `vp test` (311) pass; e2e skipped on the author's request (entry 03). The dev pages: no "Indoors and outdoors" on the services page.

## Changed files

- `src/features/services/Surfaces.tsx`
- `src/app/[locale]/(pages)/faq/page.tsx`
- `messages/{it,de,en,bs}.json`

## Decisions

- The entries are removed, not reworded: an "indoors only" fact or FAQ answer would say less than nothing.

## Open items

- Outdoors stays, on purpose, in the home page's application-areas intro in DE and EN (`Home.areas.intro`: "innen und aussen", "indoors and outdoors"; the author: "Keep it"), in the contact form's hint ("indoor or outdoor", it asks what the wall is), and in the hidden configurator texts.
- Not committed (with entries 02 and 03).
