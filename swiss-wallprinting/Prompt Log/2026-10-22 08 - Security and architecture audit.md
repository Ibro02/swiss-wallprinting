---
tags: [prompt-log, security, architecture]
date: 2026-10-22
agent: Claude Code (Opus 5.5)
status: waiting for the author
---
# 2026-10-22 08 - Security and architecture audit

## Prompt

> Let's analyse the code base
>
> We need to find all security vulnerabilities
>
> we also need to optimize code if we can (for scallability and maintainability, I'll maintain the website for next time, so I need to make CRUD operations easy for galery, services and all other possibly dynamic data)
>
> make a new branch for this
>
> for analysis, use this skill:  deepsec (from Vercel) — https://github.com/vercel-labs/deepsec
> I've been using it for security scans. It's solid and catches things agents normally tend to miss.
>
> for improvement, use:
> use improve-codebase-architecture — https://github.com/mattpocock/skills/blob/main/skills/engineering/improve-codebase-architecture/SKILL.md
> Really good for reviewing the overall architecture of a codebase.

## Goal

Find every security problem and fix it; review the architecture so that the author can add, change, and remove content (gallery, services, reviews, presets, areas) easily. Work on a new branch.

## Result

- **Branch** `audit/security-architecture` from `main` (`ceb8fca`). Committed on `main` and pushed on the author's next prompt ("after you're done, push all changes to main and commit it"), as its own commit before [[2026-10-22 09 - Lighthouse reports on every CI run]]; the branch, which had no commits of its own, was removed.
- **Security scan with deepsec's method** ([[Specs/Security audit]]). The deepsec CLI needs a Vercel login or a paid model key for its AI steps, so the agent ran its steps by hand: the regex scan of deepsec's classes, a full read of each candidate with deepsec's Next.js review prompt (its severity classes and false-positive rules), and a revalidation against the mitigations. Also a secret search over the files and the git history, and `pnpm audit` (no known vulnerabilities). Nothing CRITICAL or HIGH. Four MEDIUM findings fixed:
  1. The form send limit trusted the first `X-Forwarded-For` entry, which the visitor writes: a script could send without limit. Now `clientIp()` (`src/lib/request.ts`) counts from the right (`TRUSTED_PROXY_HOPS`, default 1).
  2. The rate limiter never forgot an IP (memory growth). Now `src/lib/rate-limit.ts` drops old keys and has a total ceiling: 5 per IP and 30 for all visitors, per form, in 10 minutes.
  3. The quote e-mail's configurator link came from the `Origin` header, and the question e-mail's "Pagina:" line was the raw `Referer`: a forged request put a phishing link into a mail that the client trusts. Now the link comes from `siteUrl()`, and the page is only the Referer's path (`refererPath()`).
  4. No security headers. Now `next.config.ts` sends a CSP (with `'wasm-unsafe-eval'` for the meshopt decoder of the 3D models; `'unsafe-inline'` scripts because the pages are static), `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, and HSTS.
- **Architecture review with `improve-codebase-architecture`** ([[Specs/Architecture review]]). A sub-agent walked the code for friction; the agent checked its main claims. The visual HTML report (Tailwind and Mermaid, before/after diagrams) was opened for the author from the session's temp folder; the vault page has the same content. Six candidates: (1) a content catalogue module (Strong, top recommendation), (2) one step per photo in the image pipeline (Strong), (3) one form intake module for the two forms (Strong), (4) one configurator readout (Worth exploring), (5) page lists from the page registry (Worth exploring), (6) one content model for the section lists (Speculative). Per the skill, no interfaces are proposed before the author picks one.
- **Checks:** `vp check` clean; `vp test` 229 passed (new: `rate-limit.test.ts`, `request.test.ts`); production build passed (pages still static); `vp run e2e` 114 passed, 20 skipped (no console error, so no CSP violation, on any page). By hand in the browser: the 3D configurator loads (WebAssembly decoder, GLB textures), an upload (`blob:`) and the quote dialog's screenshot (`data:`) work with no CSP violation; the dev server's CSP adds `'unsafe-eval'` and `ws:`, with no console error. The quote form was not sent by hand (the server reads `.env.local` and could send a real e-mail); the unit tests and the E2E form test (outbox) cover the flow.

## Changed files

- `src/lib/rate-limit.ts` (new; `createRateLimiter` moved from `src/features/contact/question.ts`)
- `src/lib/request.ts` (new: `clientIp`, `refererPath`)
- `src/lib/__tests__/rate-limit.test.ts`, `src/lib/__tests__/request.test.ts` (new)
- `src/features/contact/actions.ts`, `src/features/quote/actions.ts`
- `src/features/contact/question.ts`, `src/features/contact/__tests__/question.test.ts` (the limiter and its test moved out)
- `next.config.ts` (security headers)
- `.env.example` (`TRUSTED_PROXY_HOPS`)
- `CLAUDE.md` (rules: security headers, request headers are visitor input, the send limit; code layout)
- `swiss-wallprinting/Specs/Security audit.md`, `swiss-wallprinting/Specs/Architecture review.md` (new)
- `swiss-wallprinting/Development Plan.md` (Phase 6 and Phase 7 rows), `swiss-wallprinting/Prompt Log/Prompt Log.md`

## Decisions

- **deepsec run by hand**, not with its CLI: the CLI's AI steps need the author's Vercel login or a paid model key. The commands to run it later are in [[Specs/Security audit]].
- **The IP comes from the right of `X-Forwarded-For`.** Vercel writes one entry, and a proxy adds the real address at the end; `TRUSTED_PROXY_HOPS` covers a second proxy (for example Cloudflare in front of nginx).
- **A total ceiling** (30 per form in 10 minutes) next to the per-IP limit: it stops a script that changes its address, and it bounds the memory. The cost: in an attack, real visitors also see "rate limited" for up to 10 minutes, with the phone and e-mail as the other way.
- **CSP with `'unsafe-inline'` scripts**: a nonce would make every page dynamic (slower, and against the Phase 6 targets). The CSP still blocks other origins, plugins, `<base>`, framing, and foreign form targets.
- **HSTS without `includeSubDomains`**: the domain's other hosts are not decided by the site.
- **The configurator link in the quote e-mail always uses `SITE_URL`**: in development it points to the production domain unless `.env.local` sets `SITE_URL`.
- **Architecture: report first, no refactor yet**, as the skill says; `CLAUDE.md` wins over the skill on where reports go, so the review is also in `Specs/`.

## Open items

- **The author chooses an architecture candidate** (top recommendation: 1, the content catalogue). Then the `grilling` skill walks the decisions, and `domain-modeling` starts [[Glossary]].
- **Security finding 5 (open):** the spam checks are client signals and the send limit lives in one server's memory (on serverless hosts each instance counts alone). Decide with the host in Phase 7: a shared store (for example Upstash Redis), a challenge (Turnstile or Friendly Captcha; no reCAPTCHA), or a signed fill time.
- **Security finding 6 (open):** pin the CI actions to commit SHAs.
- **Rule breaks found on the way (not fixed):** the room cards have no per-card "example" badge; "12 anni" and "3,80 m" are typed into texts instead of ICU parameters.
- **Commit:** done on `main` and pushed (see Result).
- To run the real deepsec: `npx -y deepsec init --yes --through coverage --output jsonl`, then `cd .deepsec && npx deepsec process --diff origin/main` (needs the author's login or key).
