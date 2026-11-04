---
tags: [prompt-log]
date: 2026-11-04
agent: Claude Code (Opus 5.5)
status: done
---
# 2026-11-04 03 - Bos Hrv Srp in the language menu

## Prompt

> In the dropdown, I want to se Bos / Hrv / Srp with BHS lang (e.g. English EN)

## Goal

The BHS row of the language menu reads like the others: the name, then the code ("English EN" → "Bos / Hrv / Srp BHS").

## Result

- `LANGUAGES.bs.name` is "Bos / Hrv / Srp" (`src/i18n/languages.ts`); the code stays BHS. The menu row shows "Bos / Hrv / Srp" and "BHS" beside it, on one line in the 12 rem list (checked on a screenshot at 1440 px). The header button still shows "BHS"; its accessible name is "BHS, Jezik: Bos / Hrv / Srp". The phone menu shows the name.
- The switcher always shows the code again (the branch for a name equal to its code is gone).
- Tests: `languages.test.ts` (the name), `e2e/languages.spec.ts` (the row has the name and the code BHS). `vp check` clean (two older warnings), unit tests pass, build passes; e2e languages, smoke, and axe: 91 passed, 0 failed, 9 skipped.
- Docs: `CLAUDE.md` (Languages and BHS), [[ADR/0003-bhs-one-language]].

## Changed files

- `src/i18n/languages.ts`, `src/islands/LanguageSwitcher.tsx`, `src/i18n/__tests__/languages.test.ts`, `e2e/languages.spec.ts`
- `CLAUDE.md`, `swiss-wallprinting/ADR/0003-bhs-one-language.md`, this entry, `Prompt Log.md`

## Decisions

- The name is the author's label of commit `398f489` again ("Bos / Hrv / Srp"), which entry 01 had replaced by "BHS".

## Open items

- None new. The open items of entries 01 and 02 stay.
