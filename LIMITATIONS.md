# LIMITATIONS.md — honest boundaries of this skill

What this skill can and cannot guarantee, in its own words.

## Process limits

- **One pass, first prompt.** The 7 stages run in a single response. That trades
  depth for throughput: a multi-week consulting engagement would catch more than
  one thorough pass. The deliverable says which findings are machine-verified
  and which are human-judged — do not mistake the speed for perfection.
- **The reviewer is the same model family that may have written the code.** The
  two independent critiques reduce anchoring but do not eliminate it. If you
  want a truly external review, ask a different model to run the static auditor
  (`scripts/audit-skill.mjs`) and its stage-1/2 checklist on the upgraded copy.
- **No execution on your original.** Everything runs on the working copy under
  `<parent>/<name>-upgraded/`. Your original stays untouched, byte for byte.
- **Paste mode (chat-only / mobile).** Without a filesystem the upgraded skill is
  returned as text blocks and the static auditor cannot run; checklist checks are
  done by careful reading and shell-dependent evidence is reported as not run. A
  skill pasted only partially gets partial coverage — say which parts were not seen.

## Static-auditor limits (`scripts/audit-skill.mjs`)

- Heuristics, not gospel. INFO/WARN findings need a human's judgment; only
  ERRORs (broken structure, determinism claims contradicted by seeded APIs,
  unbalanced fences, missing frontmatter) are machine-conclusive.
- Semantic checks (is a rule *wrong*? does a palette *look* right?) are outside
  its scope — that is what stages 1/2/4/6 of the protocol are for.
- Visual claims (a thumbnail is on-brand, a render is clean) cannot be verified
  by a text pass at all; those get an explicit `UNVERIFIED-VISUALLY` tag and a
  request for a human look.
- It scans text extensions listed at the top of the script. Skill packages that
  store critical logic in odd extensions get partial coverage.
- Prompt-injection and secret patterns are a short known-pattern list; novel
  obfuscations can slip through. It is a hygiene aid, not a security audit.

## Scope

- One skill package per run (a directory with a `SKILL.md`). Multi-skill
  workspaces: run per skill.
- Formatting choices that are purely cosmetic and correct are usually left
  alone; the protocol preserves the author's voice and intent.
- When the target skill is deliberately absurd or satirical (a joke skill),
  say so in the report and ask before applying "quality fixes".
