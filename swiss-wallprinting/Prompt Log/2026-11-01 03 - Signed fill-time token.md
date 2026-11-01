---
tags: [prompt-log, security, forms]
date: 2026-11-01
agent: Claude Code (Opus 5.5)
status: done (committed on security/deepsec, not pushed); the deepsec scan waits for the author
---
# 2026-11-01 03 - Signed fill-time token

## Prompt

> Separate tight limit

## Goal

The author's answer to the open question of [[2026-11-01 02 - Security grilling and deepsec]]. Build the signed fill-time token (Security audit #5). A form request without a valid token still sends, but against a much smaller limit, because the form must work without JavaScript.

## Result

- `src/lib/form-token.ts` (new): `createFormToken(form, issuedAt, secret)` gives `issuedAt.signature` (an HMAC-SHA256 of the form name and the time, base64url). `formTokenTime` checks it with `timingSafeEqual` and refuses a forged, foreign-form, future, or more than 6 hours old token. `formSecret()` reads `FORM_SECRET` (at least 32 characters); without it (development), it uses a random secret per server process.
- `issueFormToken(form)`: a Server Action in `src/features/contact/actions.ts`; it checks the form name from the browser. `src/islands/use-form-token.ts` (new hook) asks for the token after hydration and writes it into the hidden field `formToken`. `QuestionForm` and `QuoteDialog` use it instead of the old `startedAt` timestamp.
- `spamVerdict(formData, form, now, secret)` gives `ok`, `noToken`, `honeypot`, or `tooFast`. The fill time (`MIN_FILL_MS`) is measured from the token's time. `handleQuestion` and `handleQuote` call `deps.allow(verdict === 'ok')`.
- `src/lib/rate-limit.ts`: `FORM_LIMIT` (5 per IP, 30 of all visitors per form in 10 minutes) and `FORM_LIMIT_WITHOUT_TOKEN` (3 per IP, 5 of all). Each action has one limiter for each.
- `scripts/check-mail.ts`: a production build stops without a `FORM_SECRET` of at least 32 characters (the message gives the `node -e` command to make one). `.env.example` documents it.
- Tests: `src/lib/__tests__/form-token.test.ts` (new); `spamVerdict` (no token, forged time, other form); `handleQuestion` (the request without a token uses the small limit); the quote tests send a token. `e2e/form.spec.ts` waits for the token before the fill time (`waitForFillTime`). Without that wait, the first form test was sent less than 2 s after the token and got "too fast".
- **Checks:** `vp check` clean; `vp test` 272 passed; `vp run build` passed; the full `vp run e2e`: 138 passed, 28 skipped, 0 failed. The form tests also passed twice in a row.
- Docs: `CLAUDE.md` (the spam rule, the mail check, the code layout, a deepsec row in Commands), [[Specs/Security audit]] (#5 partly fixed, #6 fixed, a "Second round" section with the commands).

## Changed files

- `src/lib/form-token.ts` (new), `src/lib/__tests__/form-token.test.ts` (new), `src/islands/use-form-token.ts` (new)
- `src/lib/rate-limit.ts`, `src/features/contact/{fields,question,handle-question,actions}.ts`, `src/features/quote/{handle-quote,actions}.ts`
- `src/islands/QuestionForm.tsx`, `src/islands/configurator/QuoteDialog.tsx`
- `scripts/check-mail.ts`, `.env.example`
- Tests: `src/features/contact/__tests__/{question,handle-question}.test.ts`, `src/features/quote/__tests__/handle-quote.test.ts`, `e2e/form.spec.ts`
- `CLAUDE.md`, `swiss-wallprinting/Specs/Security audit.md`, this entry, `Prompt Log.md`, [[2026-11-01 02 - Security grilling and deepsec]]

## Decisions

- **The author: "Separate tight limit."** A request without a valid token sends against `FORM_LIMIT_WITHOUT_TOKEN`; it is never rejected.
- The token is bound to the form name, so a question token does not count for the quote form.
- An invalid or old token counts as "no token", not as spam: a page left open for hours still sends.
- Limit: a script can call `issueFormToken` itself, wait 2 s, and post. That puts it back under the normal limit, which still lives in one server's memory. The shared limit or a challenge stays in Phase 7.

## Open items

- **The author sets `FORM_SECRET`** in `.env.local` (optional in development) and in the host settings before launch (a production build stops without it).
- The deepsec AI scan: the author runs the login step (commands in [[2026-11-01 02 - Security grilling and deepsec]] and [[Specs/Security audit#Second round (2026-11-01, branch `security/deepsec`)]]).
- Committed on `security/deepsec` on the author's request ("Yes, commit"), not pushed; the `.claude/` deletion and `swiss-wallprinting.rar` were left out.
