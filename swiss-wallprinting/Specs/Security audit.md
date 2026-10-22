---
tags: [spec, security, audit]
date: 2026-10-22
status: fixes on branch audit/security-architecture (not committed); two items open
---
# Security audit (2026-10-22)

The author asked for a full security scan with Vercel's **deepsec** ([[2026-10-22 08 - Security and architecture audit]]). This page is the report and the hand-over.

## How the scan was done

deepsec (https://github.com/vercel-labs/deepsec) is a CLI: a regex **scan** marks candidate files, AI agents **process** each candidate, **revalidate** removes false positives, **triage** gives a priority. Its AI steps need a Vercel login or a paid model key (`npx deepsec init`), which an agent cannot enter. So the agent ran the same method by hand:

1. **Scan:** the regex classes of deepsec (Server Actions and route handlers, `dangerouslySetInnerHTML` and `innerHTML`, `eval` and `child_process`, file system paths, redirects and rewrites, `fetch` and `new URL`, environment variables, `x-forwarded-for` and other request headers, crypto, logs) over `src/`, `scripts/`, the config files, and CI. Plus a secret search over all tracked files and the git history, and `pnpm audit` (production and development dependencies).
2. **Process:** each candidate file read in full with deepsec's Next.js review prompt (`prompt-samples/02-nextjs-tsx-batch.md`: its severity classes, vulnerability slugs, and false-positive rules), with the data traced from the request to the sink.
3. **Revalidate:** each finding checked against the mitigations (framework guards, nodemailer's header encoding, Zod, the share-link parser).

To run the real deepsec later (it costs model credits, so start with a diff scan):

```bash
npx -y deepsec init --yes --through coverage --output jsonl
cd .deepsec && npx deepsec process --diff origin/main
```

## Attack surface

The site has no accounts, no database, and no API routes. A visitor reaches the server only through:

- two **Server Actions**: `submitQuestion` (`src/features/contact/actions.ts`) and `submitQuote` (`src/features/quote/actions.ts`). Both are public on purpose (contact forms), and both send an e-mail to `CONTACT_TO`.
- the **proxy** (`src/proxy.ts`): locale routing and the 404 rewrite.
- the **configurator page**, which reads `?room=…` and `?area=` (`model/share.ts`, `start.ts`).

Uploaded images never leave the browser (`prepare-upload.ts`).

## Findings

deepsec reports CRITICAL, HIGH, and MEDIUM. Nothing CRITICAL or HIGH was found.

| # | Severity | Slug | Finding | Status |
|---|---|---|---|---|
| 1 | MEDIUM | `rate-limit-bypass` | The send limit trusted the first `X-Forwarded-For` entry | Fixed |
| 2 | MEDIUM | `other-memory-exhaustion` | The rate limiter never forgot an IP address | Fixed |
| 3 | MEDIUM | `other-email-link-injection` | `Origin` and `Referer` headers wrote links into the e-mail to the client | Fixed |
| 4 | MEDIUM | `other-missing-security-headers` | No CSP, no framing protection, no `nosniff`, no HSTS | Fixed |
| 5 | MEDIUM | `expensive-api-abuse` | The spam checks are client signals, and the limit lives in one server's memory | Open: decide with the hosting (Phase 7) |
| 6 | LOW | `other-ci-supply-chain` | CI actions are pinned to tags, not commit SHAs | Open |
| 7 | LOW | `other-untrusted-attachment` | The quote screenshot is the visitor's bytes, checked only for the JPEG start bytes | Open (accepted) |

### 1. Rate limit bypass with a forged X-Forwarded-For (fixed)

Both actions took the **first** `X-Forwarded-For` entry as the visitor's IP. The visitor writes that entry: a proxy (nginx, Caddy, Cloudflare) adds the real address at the end. A script that sends a new value each time had no limit, so it could fill the client's inbox and use up the mail provider's quota (and hurt the sender domain's reputation). Vercel overwrites the header, so the risk depended on the host, which is not decided yet.

**Fix:** `clientIp()` in `src/lib/request.ts` counts from the right: `TRUSTED_PROXY_HOPS` entries (default 1, `.env.example`). Tests: `src/lib/__tests__/request.test.ts`.

### 2. The rate limiter grew without limit (fixed)

`createRateLimiter` kept every key forever. With finding 1, each forged address added an entry, so the server's memory grew with each request.

**Fix:** the limiter moved to `src/lib/rate-limit.ts`. It drops keys whose window has passed, and it has a **total** ceiling for all visitors together (30 messages in 10 minutes per form), so the memory stays small and a script that changes its address is stopped too. The visitor then sees the "rate limited" text, with phone and e-mail. Tests: `src/lib/__tests__/rate-limit.test.ts`.

### 3. Header values as links in the e-mail to the client (fixed)

- The quote e-mail's "Configurazione:" link was built from the request's `Origin` header. Next.js compares `Origin` with `Host` / `X-Forwarded-Host`, but a script that sends a request straight to a self-hosted server sets all three.
- The question e-mail's "Pagina:" line was the raw `Referer` header, which any script sets.

The client trusts these lines because the site wrote them, so a forged value was a good phishing link.

**Fix:** the configurator link comes from `siteUrl()` (`SITE_URL`) only; "Pagina:" is only the path of the Referer (`refererPath()`, no host, no query, at most 200 characters). In development, set `SITE_URL=http://localhost:3000` in `.env.local` if the link in a test e-mail must open the local server.

### 4. No security headers (fixed)

`next.config.ts` sent no security headers. The forms and the configurator could be put in a frame on another site (clickjacking), and there was no Content Security Policy.

**Fix:** `headers()` in `next.config.ts` sends on every response: a CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (no camera, microphone, or location), and HSTS (one year, no `includeSubDomains`). The CSP:

- `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'`: the pages are static, so a per-request nonce is not possible (it would make every page dynamic and slower). `'unsafe-inline'` covers the Next.js inline data and `THEME_SCRIPT`. `'wasm-unsafe-eval'` is for the meshopt decoder of the 3D models (WebAssembly). Development adds `'unsafe-eval'` (React Refresh) and `ws:` (hot reload).
- `img-src 'self' data: blob:` (blur previews, the 3D screenshot, an upload, the GLB textures), `connect-src 'self' data: blob:`, `worker-src 'self' blob:`.
- `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`.

A new script, font, image, or API on another origin needs a change in this policy, or the browser blocks it (the E2E smoke test fails on the console error).

### 5. Spam protection depends on the visitor and on one server (open)

The honeypot and the fill time (`startedAt`) are fields that the request itself carries: a script that posts the form directly leaves the honeypot empty and sends no `startedAt`. After fixes 1 and 2, the send limit stops it, but the limit lives in the memory of **one** server instance. On a serverless host (Vercel) each instance has its own count and a new instance starts at zero.

**To decide in Phase 7** (with the host): a shared store for the limit (for example Upstash Redis), or a privacy-friendly challenge (Cloudflare Turnstile or Friendly Captcha; reCAPTCHA is not allowed, `CLAUDE.md`), or a signed fill-time token (an HMAC of `startedAt` with a server secret).

### 6. CI actions pinned to tags (open)

`.github/workflows/ci.yml` uses `actions/checkout@v7.0.1`, `voidzero-dev/setup-vp@v1.21.2`, and `actions/upload-artifact@v4`. A moved tag runs other code in CI. The job has only `contents: read` and no secrets, so the effect is small. Pin each action to a full commit SHA (with the tag as a comment) when the workflow changes next.

### 7. The quote screenshot is the visitor's bytes (open, accepted)

`parseScreenshot` checks that the data URL is at most 600 000 characters and starts with the JPEG bytes `FF D8 FF`, then attaches it as `configurazione.jpg`. A script can attach any file that starts with these bytes. Mail clients show it as a picture, so the risk is low. Decoding and encoding it again would need `sharp` at run time (today a development dependency only).

## Checked and not a problem

- **Secrets:** none in tracked files or in the git history; `.env*` is ignored; `Poruka ponude.md` was never committed.
- **Dependencies:** `pnpm audit`: no known vulnerabilities (production and development).
- **XSS:** `JsonLd` escapes `<` in the JSON (`src/components/JsonLd.tsx`); `THEME_SCRIPT` is a constant; no `innerHTML`; React escapes all content text.
- **E-mail header injection:** nodemailer replaces line breaks in header values (`mime-node`), and Resend takes JSON. The reply-to address passes `z.email()`.
- **Share link and `?area=`:** every value passes a pattern and is clamped to the room and print limits (`share.ts`, `fitPrintToWall`); no value reaches HTML or a query.
- **Server Actions without auth:** correct here: they only send a message to the client and read no data.
- **Locale input:** checked with `hasLocale` before it reaches a file import (`src/i18n/request.ts`) or the e-mail.
- **Proxy rewrite:** to a fixed internal path on the same origin; no open redirect.
- **Build scripts:** `scripts/frames.ts` uses `execFile` with fixed arguments (no shell); the scripts run only on the author's machine.
- **Mail outbox:** `path.basename` on the attachment name; `outbox` throws with `SITE_ENV=production`. On a public preview deployment, set `MAIL_TRANSPORT` too, or the outbox writes files on that server.
