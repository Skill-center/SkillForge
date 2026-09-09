# ⚒️ SkillForge

**Audit → critique → upgrade any agent skill — all 7 stages in one prompt.**

Point SkillForge at any `SKILL.md` package and it runs a ruthless seven-stage
quality pipeline in a *single response*, then hands you back a clean upgraded
skill, an evidence-backed review report, and a v1-vs-final comparison table.

```
One prompt in →  upgraded skill + REVIEW-REPORT.md + change table  out
```

## Try it

| English | فارسی |
|---|---|
| *"Upgrade my skill and make it 10/10"* | *«اسکیلم رو آپگرید کن»* |
| *"Lint ~/.claude/skills/my-skill — full 7 stages"* | *«اسکیلم رو بررسی و اصلاح کن»* |
| *"Critique this skill ruthlessly, then fix everything"* | *«این اسکیل رو نقد کن و درستش کن»* |

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

## Install

**Claude Code (per-user):**
```bash
git clone https://github.com/<you>/skillforge ~/.claude/skills/skillforge
# or copy the folder:
# cp -r skillforge ~/.claude/skills/
```

**Claude Code (per-project):** put it in `.claude/skills/skillforge/`.

**Any shell-capable agent:** copy the folder into that agent's skills directory —
`SKILL.md` is the open agent-skills format.

**Mobile / chat-only apps:** skills that can't touch files run paste mode —
paste a skill's text and say *"اسکیلم رو آپگرید کن"*.

## Repository layout (upload these)

```
skillforge/                  ← repo root (clone into ~/.claude/skills/skillforge)
├── SKILL.md                 ← the skill contract (frontmatter name: skillforge)
├── README.md                ← this file
├── LICENSE                  ← MIT (adjust the holder line)
├── references/
│   ├── audit-criteria.md    ← ERROR/WARN/INFO checklists by category + final checklist
│   └── review-protocol.md   ← stage mechanics, fix discipline, templates
├── scripts/
│   └── audit-skill.mjs      ← static auditor (node; exit 2/1/0, optional --json)
└── LIMITATIONS.md           ← honest boundaries
```

## Requirements

- **Nothing to use it.** The 7-stage pipeline runs on any agent that reads
  skills. The bundled auditor needs `node` and a shell, and is used whenever
  they exist — otherwise the stages run by careful reading (paste mode).
- Target skills can be any `SKILL.md` package: agent-agnostic.

## License

MIT — see `LICENSE`. Review reports and audits are yours to keep.
