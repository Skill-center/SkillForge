# ⚒️ SkillForge

**Audit → critique → upgrade any agent skill — all 7 stages in one prompt.**

Point SkillForge at any `SKILL.md` package and it runs a ruthless seven-stage
quality pipeline in a *single response*, then hands you back a clean upgraded
skill, an evidence-backed review report, and a v1-vs-final comparison table.

```
One prompt in →  upgraded skill + REVIEW-REPORT.md + change table  out
```

## Try it

- *"Upgrade my skill and make it 10/10"*
- *"Lint ~/.claude/skills/my-skill — full 7 stages"*
- *"Critique this skill ruthlessly, then fix everything"*

No folder to point at? Paste the skill's text into the chat — SkillForge runs
its **paste mode** and returns the upgraded files as ready-to-copy text blocks.

## The 7 stages (one pass, no stops)

| # | Stage | Output |
|---|-------|--------|
| 1 | Ruthless first critique (every file + static audit) | findings w/ severity + evidence |
| 2 | Independent second critique (fresh eyes) | what S1 missed; consolidated table |
| 3 | Fix round 1 — resolves S1+S2 | upgraded copy, fix log, re-audit clean |
| 4 | Re-critique + research + new options | justified additions & rejections |
| 5 | Re-critique + fix + calibration | every threshold derived or flagged |
| 6 | Deep code review, heavy debug, determinism checks | **change table v1 vs final** |
| 7 | Final audit, cleanup, delivery | upgraded folder + `REVIEW-REPORT.md` |

Everything runs on a **working copy** (`<name>-upgraded/`) — your original is
never modified. Integrity is contractual: every finding cites a location,
verification is never faked (machine vs `UNVERIFIED-VISUALLY` labels), edited
regions are re-read, and thresholds are measured, not guessed.

---

## Install & setup

A skill is just a folder containing `SKILL.md` — installing SkillForge means
putting that folder where your agent looks for skills. Pick the method that fits.

### 1) One-command install (any agent that supports the `skills` CLI)

```bash
npx skills add <your-github>/skillforge --agent claude-code
# other agents: --agent cursor, --agent codex, --agent gemini, ...
```

### 2) Manual — Claude Code (recommended default)

Personal scope (every project on this machine):

```bash
# macOS / Linux
mkdir -p ~/.claude/skills
git clone https://github.com/<your-github>/skillforge ~/.claude/skills/skillforge
# …or copy the folder instead:
# cp -r skillforge ~/.claude/skills/
```

```powershell
# Windows (PowerShell)
mkdir -p $HOME\.claude\skills
git clone https://github.com/<your-github>/skillforge $HOME\.claude\skills\skillforge
```

Project scope (only this repo uses it): put the folder at
`.claude/skills/skillforge/` inside the project and commit it.

### 3) Manual — other agents (same rule, different folder)

Skills are the same open format everywhere; only the location changes.

| Agent | Global folder | Project folder |
|---|---|---|
| Claude Code | `~/.claude/skills/` | `.claude/skills/` |
| Cursor | `~/.cursor/skills/` | `.cursor/skills/` |
| Windsurf | `~/.windsurf/skills/` | `.windsurf/skills/` |
| Codex | `~/.agents/skills/` | `.agents/skills/` |
| Cline | `~/.cline/skills/` | `.cline/skills/` |
| Roo Code | `~/.roo-code/skills/` | `.roo-code/skills/` |
| Gemini CLI | `~/.gemini/skills/` | `.gemini/skills/` |
| GitHub Copilot | — | `.github/copilot/skills/` |

Clone or copy the `skillforge` folder into the global or project folder of your
agent. When in doubt, use the global folder.

### 4) Install from the `.skill` zip

```bash
unzip skillforge.skill -d ~/.claude/skills/
```

The zip unpacks to `~/.claude/skills/skillforge/SKILL.md`. If your app accepts
`.skill` uploads directly (claude.ai — see below), skip the terminal entirely.

### 5) claude.ai and mobile apps (no terminal)

1. On **claude.ai** (desktop browser or app): open **Settings → Capabilities**
   and enable *Code execution and file creation*, then **Customize → Skills**
   and toggle **SkillForge** on. Upload `skillforge.skill` if your plan offers it.
2. On the **iOS/Android app**: skills you enable on claude.ai sync to the app
   (uploading files from the phone app itself may be unavailable — do step 1 on
   a desktop browser once).
3. Chat-only surfaces with no skill system: no install needed at all — SkillForge
   is just text. Paste the skill you want upgraded into the chat and it runs the
   full 7-stage **paste mode**, returning ready-to-copy files.

### Verify the install

Start a new session and ask: *"What skills do you have?"* — SkillForge should be
listed. Or just use it: *"Upgrade my skill"*.

### Updating

```bash
git -C ~/.claude/skills/skillforge pull        # git install
npx skills update skillforge --agent claude-code   # CLI install
```

### Troubleshooting

- **Skill not listed** → restart the session; the folder must be named exactly
  `skillforge` with `SKILL.md` directly inside it (not nested one level deeper).
- **Zip did nothing** → it must unpack to `<skills-dir>/skillforge/SKILL.md`.
  If your tool flattened the folder, re-unzip into a `skillforge/` folder.
- **Auditor needs `node`** → the 7-stage pipeline itself needs nothing; `node`
  is only used by the optional bundled static auditor when a shell exists.

---

## Repository layout

```
skillforge/                  ← repo root (clone into ~/.claude/skills/skillforge)
├── SKILL.md                 ← the skill contract (frontmatter name: skillforge)
├── README.md                ← this file
├── LICENSE                  ← MIT open-source license (put your name on the copyright line)
├── references/
│   ├── audit-criteria.md    ← ERROR/WARN/INFO checklists by category + final checklist
│   └── review-protocol.md   ← stage mechanics, fix discipline, templates
├── scripts/
│   └── audit-skill.mjs      ← static auditor (node; exit 2/1/0, optional --json)
└── LIMITATIONS.md           ← honest boundaries
```

## Requirements

- Nothing to use it: the 7 stages run on any agent that reads skills.
- The bundled auditor needs `node` + a shell; where they exist they are used,
  otherwise the stages run by careful reading (paste mode).
- Target skills can be any `SKILL.md` package — agent-agnostic.

## License

MIT — see `LICENSE`.
