---
tags: [prompt-log]
date: 2026-11-01
agent: Claude Code (Opus 5.5)
status: done
---
# 2026-11-01 27 - Final price by agreement

## Prompt

> client wants me to add "su accordo" in the price tag, what is the best solution for this

Follow-up, after the agent's proposal (a small line under the price, in four languages, also in the quote summary and the e-mail):

> yes pls

## Goal

The configurator's price says that the final price is agreed with the client, and the approximate word ("ca.") stays in front of the number.

## Result

- New message `Configurator.price.agreement`: IT "Prezzo finale su accordo" (the client's words), DE "Endpreis nach Vereinbarung", EN "Final price by agreement", BS "Konačna cijena po dogovoru" (DE, EN, BS are drafts).
- `Panel.tsx`: a small grey line under the price ("ca. 1210 CHF" / "Prezzo finale su accordo"), on desktop and in the phone price bar.
- `QuoteDialog.tsx`: the summary's price is now "ca. CHF 1210 · Prezzo finale su accordo" (before: the bare "CHF 1210").
- `quote.ts`: the e-mail says "Prezzo indicativo mostrato: ca. CHF … IVA inclusa, prezzo finale su accordo" (its test too).
- Checked at 1440 × 900 and at 360 × 740 in all four languages: one line, no overflow, the bar stays 79 px high; in DE and BS the quote button gives up 12–17 px and its label still fits.
- `vp test` (310), `vp check` (the known `hasMock` warning only).

## Changed files

- `messages/{it,de,en,bs}.json`
- `src/islands/configurator/Panel.tsx`, `src/islands/configurator/QuoteDialog.tsx`
- `src/features/quote/quote.ts`, `src/features/quote/__tests__/handle-quote.test.ts`

## Decisions

- A line of its own, not words added to the price: "ca." stays next to the number, and "ca. CHF 1210 su accordo" read badly in one line.

## Open items

- Not committed.
