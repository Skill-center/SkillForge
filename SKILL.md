---
name: skillforge
description: "Audit, critique, and upgrade any agent skill (a SKILL.md package) end-to-end in one prompt. Use when the user asks to lint, review, critique, fix, polish, upgrade, or rebuild a skill as clean, production-grade, or 10/10, or mentions the 7-stage quality protocol. Runs seven fixed stages in a single pass: ruthless first critique, independent second critique, fix round, re-critique + research + new options, calibration fix round, deep code review + heavy debug + v1-vs-final change table, final audit and clean delivery — then returns the upgraded skill plus an evidence-backed REVIEW-REPORT.md with the comparison table. Trigger phrases include: upgrade my skill, audit this skill, make my skill 10/10, my skill is messy fix it, اسکیلم رو آپگرید کن، اسکیلم رو بررسی و اصلاح کن، اسکیل رو نقد کن و درستش کن. Works on every harness: with a shell it audits folders and runs the bundled static auditor on a working copy; chat-only and mobile harnesses use paste mode — the user pastes the skill text and receives upgraded files plus the report inline. All seven stages run on the first prompt and are delivered together."
---

# SkillForge

Turn any agent skill into a clean, consistent, evidence-backed upgrade — **in one
prompt**. SkillForge runs a fixed 7-stage protocol, then delivers an upgraded copy
of the skill, a review report, and a comparison table. It is built from lessons
learned in the field: claims drift from code, edits silently fail to land, tests
are skipped, thresholds are guessed, and docs praise features that never rendered.

## How it works (read before acting)

**Input.** One target skill folder containing `SKILL.md` (plus its references,
assets, scripts) — or, on a chat-only harness, the skill's text pasted inline
(see Harness modes below). If the user did not name a target and none is in
context, ask **one** question up front; otherwise start immediately. Example:
"lint `~/.claude/skills/my-skill`".

**Working copy.** Never edit the user's original in place. Create
`<parent>/<name>-upgraded/` by copying the target (skip `.git`, `node_modules`,
caches, build output). All stages operate on the copy. The original stays pristine
for diffing.

**One pass.** Run all seven stages in this single session. Do not stop after a
stage to ask questions, do not deliver partial results. If a real blocker appears
(no shell, missing test environment), record it in the report and proceed as far as
the environment allows — never fake the blocked step.

**Harness modes — the seven stages are identical everywhere; only delivery adapts.**
- **Shell + filesystem** (Claude Code and similar coding agents): full pipeline —
  copy to `<parent>/<name>-upgraded/`, run `scripts/audit-skill.mjs`, syntax and
  determinism checks, then deliver folders + report (+ zip).
- **Filesystem, no shell** (some desktop apps): same file pipeline; the checks
  that need `node`/`tsc`/`sh` are replaced by careful re-reads and are recorded in
  the report as "not run — no shell here".
- **Chat-only / mobile:** no filesystem. Ask the user to paste the skill
  (SKILL.md first; references and scripts after, if any) or work from what is
  already in the conversation. Run all seven stages on that text. Deliver:
  verdict, consolidated findings table, the complete upgraded skill as one fenced
  block per file (ready to copy into a fresh skill folder), the v1-vs-final
  change table, and honesty gaps — no zip, no folder paths.

**Honesty contract (non-negotiable).**
1. Every finding cites a file/line or the command that produced it. No vibes.
2. Never claim verification you did not perform. Machine checks are labeled
   machine; anything judged by eye/ear is labeled `UNVERIFIED-VISUALLY` unless an
   entity with the needed sense reviewed it.
3. After every edit, **re-read the edited region** and re-run checks before moving
   on. Edits fail silently; memory lies.
4. Thresholds and numbers quoted in docs or findings must be measured or derived.
   A guessed threshold is a bug.
5. Preserve the skill's purpose and voice. Critique quality, propose fixes; only
   impose when the user asked for a full rewrite.

---

## Stage 1 — Ruthless first critique

Read **every** file in the target (SKILL.md, all references, assets, scripts,
README). Then run the static auditor:

```bash
node <skill>/scripts/audit-skill.mjs <target-dir>
```

Audit systematically across all categories in `references/audit-criteria.md`:
claims-vs-code consistency, API/code correctness, determinism claims, security and
prompt-injection hygiene, platform honesty, documentation drift, test/verification
evidence, maintainability, trigger/description quality, licensing honesty.

Produce findings with severity (ERROR / WARN / INFO) and file:line evidence.
Write the Stage 1 entry into the report.

## Stage 2 — Independent second critique

Put the first critique aside mentally. Re-read the skill as if you had never seen
it, hunting specifically for what a first pass misses:
- self-contradictions between rules and the skill's own examples
- orphan numbers, stale sections, leftover draft phrases
- artifacts referenced but not reproducible from the repo
- path/name inconsistencies (`out/` vs `artifacts/`, renamed files still cited)
- claims that are unverifiable as written

Merge Stage 1 + Stage 2 into one consolidated findings table (id, severity, area,
location, status). Write the "state of the skill" summary. If the skill is already
excellent, say so — ruthless does not mean inventing problems.

## Stage 3 — Fix round 1 (resolves Stages 1–2)

Fix every consolidated finding, in priority order:
1. correctness and security (would break or harm users)
2. consistency (claims vs code, docs vs reality)
3. craft (thresholds, naming, structure)
4. polish (typos, stale labels)

For each fix, log it (id → action → file). **Gate:** after fixing, re-read the
edited regions, re-run `audit-skill.mjs`, and confirm no ERROR was introduced and
the original findings are gone. Determinism-sensitive content: re-run twice and
compare hashes if the environment allows.

## Stage 4 — Re-critique + research + new options

Critique the Stage-3 result with fresh eyes (fixes introduce bugs; verify).
Then **research**: check current official skill guidance and ecosystem conventions
(skill format updates, tooling, security advisories). Identify genuinely *new*
options that fit the skill's purpose — capabilities it lacks but should have, tools
that would make its claims verifiable, structure that would make it leaner — and
implement only what earns its place. Do not bloat: every addition must map to a
need found in Stages 1–2 or in research. Log decisions and rejections with reasons.

## Stage 5 — Re-critique latest + fix

One more full critique of the upgraded version, then fix what Stage 4 introduced or
missed. **Gate:** every number/threshold in the skill is now derived or measured,
or marked as an open question in the report.

## Stage 6 — Deep code review, heavy debug, change table

For every script or code block the skill ships:
- syntax check: `node --check` for JS/MJS, `tsc --strict --noEmit` for TS,
  `sh -n` for shell
- runtime smoke test if the script is executable standalone (run it on a temp dir)
- determinism spot check: run twice, compare checksums
- audit all shell commands quoted in docs for correctness (flags, paths, order)

Build **the change table**: `references/review-protocol.md` §Template. Columns:
Area | Original (v1) | Final (vN) | Evidence. Rows cover structure, rules,
correctness fixes, scripts/tools added, determinism, docs, verification, honesty,
and anything else that changed. Record every command you ran and its result in the
report's evidence log.

## Stage 7 — Final audit, cleanup, delivery

1. Run `audit-skill.mjs` on the final copy; resolve everything still flagged (or
   justify keeping it, in writing).
2. Run the final checklist (`references/audit-criteria.md` §Final checklist).
3. Clean the working copy of scratch files (temp outputs, logs, test artifacts).
4. Write the final report (see `references/review-protocol.md` §Report) and, if the
   user may install from a zip, create `<name>-upgraded.skill`.
5. Deliver, in this order: the summary (verdict + what changed, ≤ 15 lines), the
   upgraded folder path, the report path, the zip path (if made), and the one-line
   list of honesty gaps.

## Report structure (write as `REVIEW-REPORT.md` inside the upgraded folder)

1. **Verdict** — scorecard (1–10 per dimension: correctness, consistency,
   determinism, verification, docs, security, UX) + one-paragraph verdict.
2. **Stage log** — S1…S7: what was examined, found, done. One entry per stage.
3. **Consolidated findings** — id, severity, area, location, status (fixed/kept).
4. **Change analysis table** — v1 vs final with evidence (Stage 6).
5. **Verification evidence** — commands + outputs (checksums, audit runs, syntax
   checks). Include failed attempts — they are evidence too.
6. **Honesty & remaining gaps** — what could not be verified in this environment,
   what a human should still review, anything left risky.

## Scope and limits

- This linter reviews **skills** (SKILL.md packages). A "skill" here is any folder
  whose contract lives in SKILL.md with frontmatter — the format is agent-agnostic.
- It cannot invent test infrastructure. It can, however, demand that the skill's
  claims be *verifiable*, and tag them when they are not.
- It preserves authorial voice. When the user wants a rewrite of content rather
  than of quality, say so and ask — that is out of linter scope.

## Reference files

- `references/audit-criteria.md` — the full audit checklist by category + final checklist.
- `references/review-protocol.md` — stage mechanics, fix discipline, verification recipes, templates (findings, change table, report).
- `scripts/audit-skill.mjs` — static auditor (frontmatter, references, fences, placeholders, determinism red flags, injection patterns, path drift, absolution-vs-carve-out heuristics, inline-color-vs-theme-claims).
