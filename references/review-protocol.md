# Review Protocol — stage mechanics, discipline, templates

## Fix discipline (applies in S3, S4, S5)

1. One finding → one logged action. Never batch silently.
2. **After every edit, re-read the edited region.** Edits fail silently (context
   mismatches, wrong file, partial application). If you reported an edit, the file
   must prove it — `grep` for the change before moving on.
3. Re-run the affected check after each fix group, not only at the end.
4. Prioritize: correctness/security → consistency → craft → polish.
5. When you keep a finding unfixed (authorial voice, intentional style), write the
   justification next to it in the findings table. "Kept" must be a decision, not
   an oversight.
6. Do not "fix" the author's purpose. Improve quality and consistency; content
   rewrites beyond quality need the user's OK (ask once, at the end, in the
   delivery summary if needed).

## Verification recipes

Syntax and smoke checks:

```bash
# JS/MJS scripts
node --check path/to/script.mjs
# TypeScript, strict
npx tsc --strict --noEmit -p path/to/tsconfig.json   # or add flags ad hoc
# Shell
sh -n path/to/script.sh
# Markdown fences balanced / tokens left (rough):
awk '/^```/{n++} END{print "fences:", n, (n%2? "UNBALANCED":"ok")}' file.md
```

Determinism spot checks (when the target generates artifacts):

```bash
run-tool args > /tmp/a.bin && run-tool args > /tmp/b.bin
cmp /tmp/a.bin /tmp/b.bin && echo "byte-identical"
# or
sha256sum /tmp/a.bin /tmp/b.bin
```

Claims vs code recipes:

```bash
# every claim-word must appear as something real:
grep -rn "deterministic\|byte-identical" <target>          # then read those lines
grep -rn "Math\.random\|Date\.now\|toLocaleString" <target> # contradiction if claim exists
grep -rEn "#[0-9a-fA-F]{6}" <target>/src | wc -l            # inline hex, if theme rule exists
grep -rn "never\|always\|must" <target>/SKILL.md            # absolutes → check carve-outs nearby
```

Calibration rule: if you introduce a numeric threshold into any check or doc,
derive it from at least two observations (e.g., "absent = 0–11 px, present = 46+"
→ threshold 30) and write the observations in the evidence log.

## Templates

### Findings table (report §3)

| ID | Sev | Area | Location (file:line) | Finding | Status |
|----|-----|------|----------------------|---------|--------|
| F01 | ERROR | claims-vs-code | README.md:12 | "fully deterministic" but scripts/sfx.mjs:44 uses Math.random() | fixed (S3) |
| F02 | WARN | docs drift | references/design.md:8 | cites "§Typography"; actual heading is "§2 Typography" | fixed (S3) |

### Change analysis table (report §4) — v1 vs final

| Area | Original (v1) | Final (vN) | Evidence |
|------|----------------|------------|----------|
| Structure | 4 files, no scripts | 11 files incl. 5 tools | file tree diff |
| Rules system | 10 absolutes, self-contradicted in examples (3 inline hex violations counted) | principles with carve-outs; examples byte-identical to tested code | grep counts; tsc run |
| Determinism | claimed, unseeded Math.random | seeded PRNG only; 2× run → identical sha256 | evidence log E3 |
| Verification | none | machine checks + honest visual labels | verify script + log |
| … (continue per area) | | | |

Every row needs an evidence reference (command + output in report §5). If you
cannot produce evidence for a row, the row does not go in the table — it goes in
§6 (honesty gaps).

### Report skeleton

```markdown
# Skill Review Report — <name>

**Reviewed:** <date> · **Environment:** <os/runtime> · **Method:** SkillForge 7-stage protocol

## 1. Verdict
Scorecard (1–10): Correctness · Consistency · Determinism · Verification ·
Docs · Security · UX  → paragraph verdict.

## 2. Stage log
**S1 …** <what was examined, headline findings (counts by severity)>
**S2 …** <independent pass: what S1 missed>
**S3 …** <fixes applied, counts by category, gate results>
**S4 …** <re-critique findings, research performed, options added/rejected>
**S5 …** <fixes, calibration pass results>
**S6 …** <debug evidence: syntax checks, smoke runs, determinism checks>
**S7 …** <final audit result, cleanup, delivery list>

## 3. Consolidated findings (table)
## 4. Change analysis table (v1 vs final)
## 5. Verification evidence
<commands and outputs; include failures — they are evidence>
## 6. Honesty & remaining gaps
```

## Delivery order (end of S7)

1. Summary ≤ 15 lines: verdict, what changed, what to look at first.
2. Path of the upgraded folder. 3. Path of the report. 4. Zip path if created.
5. Honesty gaps in one line each.
