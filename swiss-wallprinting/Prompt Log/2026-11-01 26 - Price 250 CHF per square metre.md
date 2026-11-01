---
tags: [prompt-log]
date: 2026-11-01
agent: Claude Code (Opus 5.5)
status: done
---
# 2026-11-01 26 - Price 250 CHF per square metre

## Prompt

> ok, prices in 3D configurator are too much, per m2 it is 250 CHF
>
> just to know KEEP THE KEY WORD "AROUND" in the price tag

## Goal

The configurator's estimate is CHF 250 per m², still shown as an approximate price.

## Result

- The old estimate was CHF 150/m² indoors (190 outdoors) + CHF 120 set-up + 8.1 % VAT, with a CHF 450 minimum: 4.84 m² showed approx. CHF 910. At 250/m² with those extras it would have been more (about CHF 1440), so the agent asked. **The author's answer:** CHF 250/m² all in (VAT included, no set-up, no minimum), indoors and outdoors.
- `src/content/pricing.ts`: `perSquareMetre` 250 / 250, `minimum`, `fixed`, `vatRate` 0. 4.84 m² now shows approx. CHF 1210.
- `Panel.tsx`: the breakdown ("How we calculate it") shows the set-up and VAT rows only when they are above 0; now it is the print line and the total incl. VAT.
- The approximate word in front of the price stays: "ca." (IT, DE), "approx." (EN), "oko" (BS). The quote e-mail says "ca. CHF … IVA inclusa".
- `vp test` (310), `vp check` (the known `hasMock` warning only). Development Plan Q5 records the rate.

## Changed files

- `src/content/pricing.ts`
- `src/islands/configurator/Panel.tsx`
- `swiss-wallprinting/Development Plan.md`

## Decisions

- The model (`estimatePrice`) is unchanged: the extras are 0 in the content file, so a minimum, set-up costs, or VAT on top can come back without code.
- First `pricing.ts` stayed `mock: true`. **Follow-up prompt:** "Confirmed, drop it": the rate is the client's, so `mock: false`. The "Example" badge and the example note are gone, and the mock guard no longer lists the pricing.

## Open items

- Not committed.
