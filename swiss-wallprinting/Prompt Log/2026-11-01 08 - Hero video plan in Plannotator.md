---
tags: [prompt-log, hero, video, plan, plannotator]
date: 2026-11-01
agent: Claude Code (Opus 5.5)
status: done (Plannotator installed; the author approved the plan in chat)
---
# 2026-11-01 08 - Hero video plan in Plannotator

## Prompt

> Yes, accept the seven recommendations in round one but first let's plan the next step with this skill
>
> Plannotator — https://plannotator.ai/
> This has been amazing: I read the doc, add annotations, send it back to my agent, and repeat as many times as I need.

## Goal

The author accepts the seven decisions of [[2026-11-01 07 - New hero video and lighter frames]]. Before any code, the author wants to review the implementation plan in Plannotator: read the plan, add notes, send them back to the agent, and repeat until the plan is right.

## Result

- **The plan:** [[Specs/Hero video]]. It has the seven decisions, the expected sizes, nine steps, and a list of choices the author can change. The plan is linked from [[Development Plan]] (4.1 Hero).
  - The plan adds one detail that the grilling did not cover. A browser without AVIF would show an empty hero, because the poster (frame 0) would be AVIF too. For this reason, the plan keeps WebP copies of the first frame and the last frame of each set, as a fallback in `<picture>`.
  - New measurements:
    - The poster in AVIF is about 22 KB on desktops and 12 KB on phones (today, WebP: 54 KB and 30 KB).
    - The frames that load before the first scroll (every 8th) are about 0.64 MB in AVIF (today: 1.06 MB).
- **Plannotator** (read from plannotator.ai, docs.plannotator.ai, the GitHub README, and `install.ps1`; latest release v0.28.42, 2026-10-31):
  - **What it is:** a local review page in the browser, open source (MIT or Apache-2.0). It collects no telemetry. Each time the page loads, it checks GitHub for the latest release.
  - **What it needs:** the `plannotator` binary, from GitHub Releases with a SHA-256 check. The installer puts it in `%LOCALAPPDATA%\plannotator` and adds that folder to the user PATH. It needs no admin rights.
  - **The binary-only install:** `& ([scriptblock]::Create((irm https://plannotator.ai/install.ps1))) -Minimal`. The full install also writes three Claude skills to `~/.claude/skills`, and it needs Git.
  - **The plan-mode hook:** the Claude Code plugin (`/plugin marketplace add backnotprop/plannotator`, `/plugin install plannotator@plannotator`) adds a `PermissionRequest` hook on `ExitPlanMode`. On Windows the hook always waits for the user's decision.
  - **The annotate command:** `plannotator annotate <file> --gate --json` opens any markdown file for review and prints the decision as JSON:
    - `annotated` with the feedback;
    - `approved`;
    - `dismissed`.
  - **This machine:** Plannotator is not installed (no binary, no plugin). `.claude/` is still missing from the working tree.
- **The loop the agent proposes** (it needs the binary only):
  1. The agent runs `plannotator annotate "swiss-wallprinting/Specs/Hero video.md" --gate --json` in the background.
  2. The author annotates in the browser and clicks "Send feedback".
  3. The agent changes the spec and runs the command again.
  4. When the author clicks "Approve", the work starts.
  - This loop needs no plugin and no change to the settings or the hooks.
- The agent did not run the installer at first. `CLAUDE.md` says to run installers in the real terminal, and the agent does not run downloaded scripts on its own.
- **The install (the author: "Yes, install it"):**
  - The Terminal panel accepts only a plain command line (no `irm | iex`, no script blocks). The agent downloaded `install.ps1` (134 KB) and checked what it contacts: GitHub only. It then copied the script into `node_modules/.cache/` (git ignores it) and ran `& .\node_modules\.cache\plannotator-install\install.ps1 -Minimal` in a Terminal panel tab.
  - What it installed:
    - `plannotator.exe` v0.28.42 (196 MB, SHA-256 verified) in `%LOCALAPPDATA%\plannotator`, and that folder in the user PATH.
  - **`-Minimal` did not take effect.** The installer also did these things:
    - It installed two helper programs into `~/.plannotator/vendor/`: `sem` v0.8.0 (semantic diff) and the agent-terminal runtime.
    - It then started an interactive "guided install" that asks about extra skills. The agent stopped it with Ctrl-C at the first question, because the author had agreed to the binary only.
    - Nothing was written to `~/.claude` (no skills, hooks, or settings).
    - To remove everything: `plannotator uninstall`.
  - The script copy in `node_modules/.cache/` was deleted.
- **The review loop started:** `plannotator annotate "swiss-wallprinting/Specs/Hero video.md" --gate --json` runs in the background; the session is at `http://localhost:62699`. A new terminal is needed for `plannotator` on the PATH; until then the agent uses the full path of the binary.

## Changed files

- `swiss-wallprinting/Specs/Hero video.md` (new: the plan)
- `swiss-wallprinting/Development Plan.md` (4.1 Hero: a link to the plan)
- `swiss-wallprinting/Prompt Log/2026-11-01 07 - New hero video and lighter frames.md` (the answers)
- `swiss-wallprinting/Prompt Log/2026-11-01 08 - Hero video plan in Plannotator.md` (this entry)
- `swiss-wallprinting/Prompt Log/Prompt Log.md`

## Decisions

- All seven recommendations of round 1 are accepted (the author).
- The plan is in `Specs/` (the vault is the single source of truth). Plannotator only shows it.
- The binary-only install and the `annotate` command, not the plan-mode plugin. The reason: the loop works in the desktop app, and the settings and hooks stay as they are. The author can add the plugin later.

## Open items

- None. The author approved the plan in chat ("let's implement the plan"), without feedback in Plannotator: [[2026-11-01 09 - Implement the hero video plan]].
