# Audit Criteria — what "quality" means for a skill

Use these checklists in every critique stage (S1, S2, S4, S5, S7). Findings must
cite file:line or a command result. Severity: **ERROR** (breaks users or the
skill's core promise), **WARN** (contradiction/drift/risk), **INFO** (craft,
would-be-nice).

---

## 1. Claims vs code — the #1 killer

Skills are judged by what they claim, then by what their own files prove.

- [ ] Every claim in README/SKILL description is backed by something in the repo:
      a demo that exists and is reproducible from source, a script that exists,
      a test that was run. `grep` the claim's subject against the repo.
- [ ] Demo/reference outputs can be regenerated: the exact command exists and works
      on a clean machine. (A video/image whose generating composition or command is
      absent = ERROR.)
- [ ] "Deterministic" / "byte-identical" / "reproducible" claims: no
      `Math.random`, `Date.now`, `new Date()`, `toLocaleString`, unseeded PRNGs in
      render/export paths. If randomness is needed it must be seeded.
- [ ] Version claims match files: README "(vN)" vs reality; "17 sections" vs actual
      numbered headings; section numbers cited in text actually exist
      (`grep` the references).
- [ ] Example code follows the skill's own rules. Count violations
      (inline hex colors vs a "theme discipline" rule; emoji in code vs "no emoji";
      magic numbers vs "fps-derived timing"). A skill whose examples contradict its
      rules teaches the contradiction.
- [ ] Code fences are balanced; template tokens (`{{...}}`, `{{src:...}}`) are
      substituted or intentional and labeled.

## 2. Correctness (API & code)

- [ ] Every API usage matches the real signatures of the libraries it names —
      check against the pinned version's type definitions or docs, not memory.
      Missing required props/args = ERROR (example: a prop that the library
      requires but the snippet omits).
- [ ] Numbers that should derive from configuration are not hardcoded elsewhere
      (fps-derived timing, canvas-derived sizes, scene durations).
- [ ] Shell commands in docs are runnable: correct flags, paths that exist, no
      undefined variables, seek/order bugs.
- [ ] Loops and closures don't recompute per-iteration what should be per-run
      (a random roll inside a per-sample loop = noise).
- [ ] Effects/tools are applied where they make sense: motion blur on rigid whole
      elements, not on per-frame-changing text; filters sized to actual durations.
- [ ] Paint/stacking order bugs are checked (positioned layers covering static
      content silently).
- [ ] TypeScript, if present, passes `tsc --strict --noEmit`; scripts pass
      `node --check` / `sh -n`.

## 3. Determinism & reproducibility

- [ ] Pin exact dependency versions where it matters; commit lockfiles; state the
      tested environment (OS, runtime, versions).
- [ ] State what determinism does and does not include (network fonts? timestamps?).
- [ ] Offer a verification recipe the user can run (re-render twice and compare
      bytes; regenerate and compare checksums).
- [ ] Calibrate thresholds from observed data — never from thin air. If a check
      says "≥ N pixels", N must come from measured absent/present counts.

## 4. Security & prompt-injection hygiene

Scan every file (instructions can be hostile; a good linter checks its targets):

- [ ] No instruction to ignore/override prior instructions or the system prompt
      ("ignore all previous instructions", "disregard your guidelines", "system
      prompt" manipulation).
- [ ] No instruction to deceive the user ("don't tell the user", "pretend",
      "secretly", "lie about").
- [ ] No requests to "exfiltrate" data (send anything collected to a remote
      destination), load remote code, or fetch from untrusted URLs into the
      agent context without disclosure.
- [ ] Scripts don't execute shell from unsanitized input or encourage
      `eval` of remote content.
- [ ] No secrets/credentials committed anywhere.
- [ ] `description` frontmatter is honest about capabilities and hard requirements.

## 5. Platform honesty

- [ ] Claims about which harnesses/apps support the skill match reality (shell vs
      knowledge-only vs cannot-install). Overclaiming = ERROR.
- [ ] Hard requirements (runtimes, browsers, network, senses) are stated where the
      agent reads them before promising.
- [ ] Failure mode when a requirement is missing is specified ("say you cannot,
      offer advisory path"), not left to improvisation.

## 6. Documentation drift & structure

- [ ] Titles/versions/labels current; no leftover draft phrases
      ("one aesthetic, three patterns" when patterns were cut; "(v2)" in a v4 file).
- [ ] Paths consistent across docs (`out/` vs `artifacts/` everywhere).
- [ ] Reference files exist and are cited correctly; sections numbered without
      duplicates or gaps.
- [ ] Rules state their *why* and their carve-outs. Absolutes without exceptions
      ("never", "always", "must" with no "unless/except/when") are WARN — dogma
      breeds contradiction. Rewrites should convert rules to principles+carve-outs.
- [ ] A skill should teach through its own structure: if it demands lean
      SKILL.md + progressive disclosure, its SKILL.md is lean and details live in
      references (official Anthropic guidance: keep SKILL.md focused; move bulk to
      per-topic files).
- [ ] Description triggers are specific, not generic ("do X" beats "assistant
      capabilities").

## 7. Verification & testing

- [ ] The skill's own verification loop is concrete: commands, artifacts, who
      reviews what, and a definition of done.
- [ ] If the skill claims a workflow, a smoke test exists or is at least
      reproducible from documented commands; outputs tagged when not visually/
      audibly verified.
- [ ] Honesty labels are used: `UNVERIFIED-VISUALLY`, "machine-checked only",
      "not ear-checked".

## 8. Maintainability & licensing

- [ ] Versioning/update path exists (tags, pull, rebuild script for zips).
- [ ] Zip/package artifacts match the source tree (rebuilt, diff clean) or the
      rebuild command is documented.
- [ ] Third-party licenses are stated accurately: "open source" vs
      "source-available", free tiers, thresholds. Overstating = ERROR.
- [ ] Bundled assets (fonts, sounds, images) are licensed or self-made; nothing
      hotlinked that breaks offline determinism without disclosure.

---

## Final checklist (Stage 7 gate)

- [ ] `audit-skill.mjs` clean of ERRORs; every WARN resolved or justified in writing.
- [ ] All Stage-1–5 findings have status (fixed/kept-with-reason) in the table.
- [ ] Change table (v1 vs final) complete with evidence.
- [ ] Every number in the final docs is derived/measured or flagged open.
- [ ] Working copy cleaned of scratch artifacts.
- [ ] Original untouched; upgraded folder + report (+ zip) delivered.
- [ ] Honesty gaps listed out loud in the delivery summary.
