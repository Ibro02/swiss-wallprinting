---
tags: [prompt-log, security, deepsec]
date: 2026-11-01
agent: Claude Code (Opus 5.5)
status: waiting for the author (deepsec login step)
---
# 2026-11-01 02 - Security grilling and deepsec

## Prompt

> let's test security, grill it first with /grill skill
>
> and then use this skill to improve security
> deepsec (from Vercel) — https://github.com/vercel-labs/deepsec
> I've been using it for security scans. It's solid and catches things agents normally tend to miss.

## Goal

Agree on the security work with the `grilling` skill first, then scan the site with Vercel's deepsec and fix what it finds.

## Result

- The `grilling` skill was read from git (`.claude/` is still missing from the working tree).
- The agent read deepsec's documentation (README, getting started, configuration, models, Vercel setup, FAQ). The facts the grilling uses:
  - `scan` uses regex matchers (free). `process`, `revalidate`, and `triage` are AI agent passes (Codex, Claude, or GLM through the Vercel AI Gateway, a direct API key, or a local login).
  - It sends code snippets to the model provider. It writes only `.deepsec/` (its own `package.json`, config, matchers, and `data/` with the findings) and does not edit source code.
  - Cost from the FAQ for Claude Opus: 100 files $25–60, 500 files $130–300. Caps: `--max-cost-usd`, `--max-duration`, `--limit`.
  - The docs ask you to treat it like a coding agent with full shell access.
- On 2026-10-22 ([[Specs/Security audit]]), the AI steps were not run, because they need a login or a key that an agent must not enter. That audit followed deepsec's method by hand. Since then: 16 commits, the configurator's product rules, and the quote changes. The scan surface is about 129 source files in `src/` (without tests and manifests).
- **Round 1** (six questions, each with the agent's recommendation): how deepsec runs and who logs in; the scope and the cost cap; the branch and what goes into git (the repo is public); which severities get fixed; the two open items from the last audit; the threat model for deepsec's `INFO.md`.
- **Setup on `security/deepsec`** (from `refactor/architecture`):
  - `npx --yes deepsec@2.3.10 init --scaffold-only --no-tui --headless` made `.deepsec/`. deepsec 2.3.10 was published on 2026-09-23. Its own `.gitignore` keeps `node_modules`, `.env*.local`, `.vercel/`, and the scan output (`data/*/files|runs|reports|setup`, `project.json` with the local path) out of git.
  - `.deepsec/data/swiss-wallprinting/INFO.md` holds the threat model of Q6 (57 lines). `config.json` holds the scope of Q2: `ignorePaths` (scripts, e2e, public, Assets, messages, vault, tests, image manifests) and `priorityPaths` (the forms, `src/lib`, the proxy, `next.config.ts`, CI). `SETUP.md` was deleted (setup done).
  - `.deepsec/` is excluded from the root `vp check` (`vite.config.ts` `notSource`) and from `tsconfig.json`: it is its own package with deepsec's formatting.
  - **CI actions pinned to commit SHAs** (audit item #6): `actions/checkout` v7.0.1 → `3d3c42e5…`, `voidzero-dev/setup-vp` v1.21.2 → `68f39c78…` (the commit under the annotated tag), `actions/upload-artifact` v4 → `ea165f8d…`. The tag stays as a comment. Resolved with `git ls-remote`.
  - `vp check` is clean.
- **Not built yet: the signed fill-time token** (Q5). Looking at `spamVerdict`, the agent found a gap in its own recommendation. The pages are static and the form must work without JavaScript, so a script that sends no token at all must still pass, and a signature alone stops nothing. The agent asked the author how a request without a token is treated.

## Changed files

- `.deepsec/` (new: `deepsec.config.ts`, `generated-matchers.ts`, `package.json`, `pnpm-workspace.yaml`, `.gitignore`, `AGENTS.md`, `README.md`, `data/swiss-wallprinting/INFO.md`, `data/swiss-wallprinting/config.json`)
- `.github/workflows/ci.yml` (actions pinned to SHAs)
- `vite.config.ts`, `tsconfig.json` (`.deepsec` excluded)
- This entry; `swiss-wallprinting/Prompt Log/Prompt Log.md`.

## Decisions

**Round 1, answered "Yes to all":**

- Q1: the author runs the one step that needs a login: `npx deepsec init --agent claude --model-auth local` (their local Claude login), with a cost cap. If that does not work, the Vercel AI Gateway. The agent never enters keys or logs in. After that, the agent runs the scan, checks the findings, and fixes them.
- Q2: the scope is `src/`, `next.config.ts`, and `.github/workflows/`. Left out (`ignorePaths`): `scripts/`, `e2e/`, `public/`, `Assets/`, the tests, and the generated image manifests. A first run with `--limit 50`, then the full run with `--max-cost-usd 50 --max-duration 1h`.
- Q3: branch `security/deepsec` from `refactor/architecture`. Git gets `.deepsec/deepsec.config.ts`, `generated-matchers.ts`, and `INFO.md`; it ignores `.deepsec/data/` and its `node_modules`. The repo is public, so a finding goes into the vault only after its fix is in; an open one is written up without exploit detail.
- Q4: every CRITICAL and HIGH finding that `revalidate` confirms is fixed in this round, with a test. A MEDIUM is fixed when the fix is small; otherwise it is recorded with a reason, like a LOW.
- Q5: pin the CI actions to commit SHAs (audit item #6), and build a signed fill-time token (an HMAC of `startedAt` with a `FORM_SECRET`; audit item #5). A shared rate-limit store or a challenge stays in Phase 7.
- Q6: `INFO.md` gives the threat model in this order: inbox flooding or mail quota abuse through the forms; phishing links or forged statements in the client's e-mails; script injection or a CSP bypass; the supply chain (dependencies and CI). It also says what is not there (no accounts, no database, no API routes) and that the Server Actions are public on purpose.

## Open items

- The author runs, in a real terminal (not the agent's sandbox): `cd .deepsec`, `pnpm install`, then `npx deepsec init --agent claude --model-auth local --max-cost-usd 50 --max-duration 1h` (the 50-file test: `pnpm deepsec process --limit 50` first). The agent then reads the findings, runs `revalidate --min-severity HIGH`, and fixes them.
- Answered: "Separate tight limit", built in [[2026-11-01 03 - Signed fill-time token]].
- Committed with [[2026-11-01 03 - Signed fill-time token]] on `security/deepsec`, not pushed.
