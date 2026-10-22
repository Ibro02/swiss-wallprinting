# Project skills

Third-party skills copied into this repo so every agent and teammate gets them. Do not edit them here. To update one, copy the new version from its source and change the commit below.

The copies come from the author's `stake-house` project, which pinned and reviewed them on 2026-10-11. None of them contains code that runs.

| Skill | Source | Commit | License |
|---|---|---|---|
| `improve-codebase-architecture` | https://github.com/mattpocock/skills (`skills/engineering/`) | `49dd158` | MIT, `_licenses/mattpocock-skills.LICENSE` |
| `codebase-design` | same repo, needed by `improve-codebase-architecture` | `49dd158` | MIT |
| `domain-modeling` | same repo, needed by `improve-codebase-architecture` | `49dd158` | MIT |
| `grilling` | same repo (`skills/productivity/`), needed by `improve-codebase-architecture` | `49dd158` | MIT |
| `thermo-nuclear-code-quality-review` | https://github.com/cursor/plugins (`cursor-team-kit/skills/`) | `11713c6` | MIT, `_licenses/cursor-team-kit.LICENSE` |

## Design skills (added 2026-10-21, premium redesign)

Installed with their own installers (commands below), copied into this folder, reviewed before use. `skills-lock.json` (repo root) records the hashes of the `npx skills` installs. Unlike the skills above, two of these contain code that runs: taste-skill's Node scripts (`scripts/*.mjs`: they open a local Chrome, and `assets.mjs` downloads from open archives) and impeccable's engine (a binary, plus its hook).

| Skill | Source | Commit | Install command | License |
|---|---|---|---|---|
| `design-taste-frontend` (taste-skill) | https://github.com/Leonxlnx/taste-skill | `6010f91` | `npx skills add Leonxlnx/taste-skill --agent claude-code --copy` | MIT, `_licenses/taste-skill.LICENSE` |
| `impeccable` (+ `.claude/agents/impeccable-*.md`) | https://github.com/pbakaus/impeccable | `dad8dbb` (engine 0.1.16) | `npx impeccable install --providers=claude --project` | Apache 2.0, `_licenses/impeccable.LICENSE` |
| `emil-design-eng`, `animate`, `animate-expo`, `animation-performance`, `animation-vocabulary`, `apple-design`, `ask-sonner`, `break-ui`, `find-animation-opportunities`, `improve-animations`, `mobile-native`, `pick-ui-library`, `prototype`, `review-animations`, `write-swift` | https://github.com/emilkowalski/skills | `2d22863` | `npx skills@latest add emilkowalski/skills --skill '*' --agent claude-code --copy` | MIT, `_licenses/emilkowalski-skills.LICENSE` |

Notes:

- **impeccable's engine binary** (`impeccable/scripts/bin/`, 20 MB per platform) is not in git: its launcher downloads it on the first run. Its design hook (after each edit of a UI file, and at the end of a turn) is in `.claude/settings.local.json`, which git ignores: `npx impeccable install` sets it up on another machine, or `/impeccable hooks on`.
- `animate-expo` and `write-swift` (React Native and Swift) do not apply to this project; they came with the package.
- taste-skill's scripts (`inspect.mjs`, `scenes.mjs`) need Node 22+ and an installed Chrome, Edge or Chromium; `assets.mjs` needs network access. They write to `.taste-skill/` (git ignores it).

## Installed elsewhere

- **Plugins** (declared in `.claude/settings.json`; Claude Code offers to install them when the project opens):
  - `superpowers@claude-plugins-official`: https://github.com/obra/superpowers
  - `compound-engineering@compound-engineering-plugin`: https://github.com/EveryInc/compound-engineering-plugin
- **User-level only** (`~/.claude/skills/`), because the source repo has no license and cannot be redistributed:
  - `write-better-error-messages` and `no-ui-flash` from https://github.com/RhysSullivan/skills (`ab3a455`). They are already installed on the author's machine. A new machine must install them by hand.
