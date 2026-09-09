#!/usr/bin/env node
// audit-skill.mjs — static quality auditor for SKILL.md packages.
// Machine findings feed every critique stage; humans (the agent) review the
// output. Heuristics, not gospel: INFO/WARN items need a reader's judgment.
//
// Usage:
//   node audit-skill.mjs <skill-dir> [--json]
//
// Exit code: 2 = target unusable, 1 = findings of severity ERROR present,
// 0 = clean (WARN/INFO may still exist).
import {readdirSync, readFileSync, statSync} from "node:fs";
import {join, extname, relative, sep} from "node:path";

const root = process.argv[2];
const asJson = process.argv.includes("--json");
if (!root) {
  console.error("usage: audit-skill.mjs <skill-dir> [--json]");
  process.exit(2);
}

const EXCLUDE_DIRS = new Set([
  "node_modules", ".git", "dist", "build", "out", "coverage", "__pycache__", ".venv",
]);
const CODE_EXTS = new Set([".mjs", ".js", ".ts", ".tsx", ".jsx", ".py", ".sh", ".rb", ".go"]);
const MD_EXTS = new Set([".md", ".mdx"]);

const findings = []; // {sev, file, line, msg}
const add = (sev, file, line, msg) =>
  findings.push({sev, file: file ? relative(root, file).split(sep).join("/") : "", line, msg});

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (EXCLUDE_DIRS.has(e)) continue;
    const st = statSync(p);
    if (st.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

const files = walk(root);
const mdFiles = files.filter((f) => MD_EXTS.has(extname(f)));
const codeFiles = files.filter((f) => CODE_EXTS.has(extname(f)));
const allText = (arr) =>
  arr.map((f) => [f, readFileSync(f, "utf8")]);

// Strip inert spans before pattern-matching so a tool never flags its own
// detection patterns or documentation that quotes them:
//  - code:  string literals (' " `) and regex literals (inert at parse time)
//  - markdown: double-quoted spans and backticked tokens (quotes/examples)
// Unquoted calls (Math.random(), Date.now()) always survive stripping.
function stripInert(line, isCode) {
  let s = line, out = "", i = 0;
  while (i < s.length) {
    const c = s[i];
    if (isCode && (c === "'" || c === "\"" || c === "`")) {
      const q = c; i++;
      while (i < s.length) { if (s[i] === "\\") { i += 2; continue; } if (s[i] === q) { i++; break; } i++; }
      continue;
    }
    if (!isCode && c === "\"") {
      i++;
      while (i < s.length) { if (s[i] === "\\") { i += 2; continue; } if (s[i] === "\"") { i++; break; } i++; }
      continue;
    }
    if (!isCode && c === "`") {
      i++;
      while (i < s.length && s[i] !== "`") i++;
      if (s[i] === "`") i++;
      continue;
    }
    if (isCode && c === "/" && s[i + 1] !== "/" && s[i + 1] !== "*" && i + 1 < s.length) {
      let j = i + 1, closed = false;
      while (j < s.length && s[j] !== "\n") {
        if (s[j] === "\\") { j += 2; continue; }
        if (s[j] === "/") { closed = true; j++; break; }
        j++;
      }
      if (closed) { i = j; continue; }
    }
    out += c; i++;
  }
  return out;
}
const EXT = (f) => extname(f);
const isCodeFile = (f) => CODE_EXTS.has(EXT(f));

// ---------- 0. usable target ----------
const sk = join(root, "SKILL.md");
if (!mdFiles.includes(sk)) {
  console.error(`[ERROR] no SKILL.md in ${root}`);
  process.exit(2);
}

// ---------- 1. frontmatter ----------
{
  const s = readFileSync(sk, "utf8");
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(s);
  if (!m) add("ERROR", sk, 1, "SKILL.md has no YAML frontmatter (--- name/description ---)");
  else {
    const fm = m[1];
    if (!/^name\s*:/m.test(fm)) add("ERROR", sk, 1, "frontmatter missing 'name'");
    if (!/^description\s*:/m.test(fm)) add("ERROR", sk, 1, "frontmatter missing 'description'");
    else {
      const dl = /^description\s*:\s*"([\s\S]*?)"\s*$/m.exec(fm);
      const dlen = dl ? dl[1].length : (fm.split("\n").find((l) => l.startsWith("description")).length);
      if (dl && (dl[1].length < 40 || dl[1].length > 1500))
        add("WARN", sk, 1, `description length ${dl[1].length} (aim 40–1500 chars; too short = weak triggers)`);
      if (dl && !dl[1].trim().endsWith(".")) add("INFO", sk, 1, "description does not end with a period");
      if (!dl) add("WARN", sk, 1, "description not double-quoted; YAML colons/spans may break parsing");
    }
    if (/^description\s*:[^"\n]*:\s/m.test(fm))
      add("WARN", sk, 1, "unquoted description contains ': ' — YAML hazard");
  }
}

// ---------- 2. balanced fences + tokens outside fences (md) ----------
for (const [f, s] of allText(mdFiles)) {
  const lines = s.split("\n");
  const fenceCount = lines.filter((l) => /^\s*```/.test(l)).length;
  if (fenceCount % 2 !== 0) add("ERROR", f, 0, `unbalanced code fences (${fenceCount} fence lines)`);
  // text outside fences
  let out = [];
  let inFence = false;
  for (const l of lines) {
    if (/^\s*```/.test(l)) { inFence = !inFence; continue; }
    if (!inFence) out.push(l);
  }
  const outside = out.join("\n");
  const inert = out.map((l) => stripInert(l, false)).join("\n");
  if (/\{\{/.test(inert))
    add("WARN", f, 0, "unsubstituted template token '{{' outside code fences");
  out.forEach((l, i) => {
    if (/\b(TODO|FIXME|XXX|TBD|lorem ipsum)\b/i.test(l))
      add("INFO", f, i + 1, `placeholder marker: ${l.trim().slice(0, 90)}`);
  });
}

// ---------- 3. referenced local files exist ----------
for (const [f, s] of allText(mdFiles)) {
  const lines = s.split("\n");
  let inFence = false;
  lines.forEach((l, i) => {
    if (/^\s*```/.test(l)) { inFence = !inFence; return; }
    if (inFence || /\|/.test(l)) return; // code/templates and table rows are not prose citations
    for (const m of l.matchAll(/(`?)(references|scripts|assets)\/([A-Za-z0-9_./-]+)/g)) {
      const rel = `${m[2]}/${m[3]}`.replace(/`/g, "");
      if (!/\.(md|mjs|js|ts|tsx|py|sh)$/.test(rel)) continue;
      if (!files.some((p) => relative(root, p).split(sep).join("/") === rel))
        add("WARN", f, i + 1, `cited file does not exist: ${rel}`);
    }
  });
}

// ---------- 4. determinism claim vs red flags ----------
{
  const mdText = mdFiles.map((f) => readFileSync(f, "utf8")).join("\n");
  const codeText = codeFiles.map((f) => readFileSync(f, "utf8")).join("\n");
  const claimsDet = /deterministic|byte-identical|reproducible|same arguments ⇒|sha256|seeded/i.test(
    mdText + "\n" + codeText,
  );
  for (const [f, s] of allText(codeFiles)) {
    const lines = s.split("\n");
    lines.forEach((l, i) => {
      if (/^\s*\/\/|^\s*\*|^\s*#/.test(l)) return;
      const probe = stripInert(l, true);
      if (/Math\.random|Date\.now|new Date\(|toLocaleString|getTime\(\)/.test(probe))
        add(claimsDet ? "ERROR" : "INFO", f, i + 1,
          `nondeterministic API: ${l.trim().slice(0, 80)}${claimsDet ? " — and docs/code claim determinism" : ""}`);
    });
  }
}

// ---------- 5. security / prompt-injection hygiene ----------
{
  const PATTERNS = [
    [/ignore (all |any )?(previous|prior|above|earlier) (instructions|guidelines|messages)/i, "instruction-override pattern"],
    [/disregard (your|the) (guidelines|instructions|rules)/i, "instruction-override pattern"],
    [/don'?t tell the user|do not tell the user/i, "deception instruction"],
    [/pretend (you|it|this)/i, "deception-ish wording"],
    [/secretly/i, "deception-ish wording"],
    [/exfiltrat/i, "data-exfiltration wording"],
    [/eval\(|child_process.*exec\(/i, "dynamic code execution (review carefully)"],
    [/AKIA[0-9A-Z]{16}|sk-[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{20,}/, "possible secret committed"],
  ];
  for (const [f, s] of allText(files)) {
    if (s.length > 1_000_000 || /[\x00-\x08\x0e-\x1f]/.test(s.slice(0, 2000))) continue;
    const lines = s.split("\n");
    lines.forEach((l, i) => {
      if (/^\s*[#/]/.test(l)) return;
      const probe = stripInert(l, isCodeFile(f));
      for (const [re, what] of PATTERNS) {
        if (re.test(probe))
          add("WARN", f, i + 1, `${what}: ${l.trim().slice(0, 90)}`);
      }
    });
  }
}

// ---------- 6. path drift out/ vs artifacts/ ----------
for (const [f, s] of allText(mdFiles)) {
  const hasOut = /(^|\s)out\//.test(s);
  const hasArt = /(^|\s)artifacts\//.test(s);
  if (hasOut && hasArt) add("INFO", f, 0, "docs mix 'out/' and 'artifacts/' paths");
}

// ---------- 7. inline hex vs theme-discipline claims ----------
{
  const mdText = mdFiles.map((f) => readFileSync(f, "utf8")).join("\n");
  const claimsTheme = /never inline|theme discipline|single source of truth|no inline (colors|easing)/i.test(mdText);
  if (claimsTheme) {
    // Definition files (theme/palette/tokens/colors) ARE the single source of
    // truth; hexes there are expected. Hunt only for stray literals elsewhere.
    const isDef = (f) => /(^|[/_])(theme|themes|palette|palettes|tokens?|colors?)[A-Za-z0-9_-]*\.(tsx?|jsx?)$/i.test(f);
    for (const [f, s] of allText(codeFiles)) {
      if (!/\.(tsx?|jsx?)$/.test(f) || isDef(f)) continue;
      const lines = s.split("\n");
      let n = 0;
      for (const l of lines) {
        const stripped = l.replace(/\/\/.*$/, "").replace(/^\s*\*.*$/, "");
        if (/#[0-9A-Fa-f]{3,8}\b/.test(stripped)) n++;
      }
      if (n >= 3) add("WARN", f, 0, `${n} inline hex colors while docs demand theme discipline (file is not a theme/palette definition)`);
    }
  }
}

// ---------- 8. absolutes without carve-outs ----------
// Paragraph-level: a "naked imperative" (NEVER/ALWAYS/... with no softener and
// no stated why in the same paragraph) is a dogma-risk candidate. Headings,
// tables, checklist items and explained rules are not flagged — a rule that
// states its why is not dogma.
const ABS_TRIGGER = /\b(never|always|forbidden|non-negotiable|must not|must never|under no circumstances)\b/i;
const ABS_SOFTENER = /\b(unless|except|carve-?out|only|when|if\b|but\b|however|optional|deliberate|intentional|recommend|consider|prefer|usually|typically|allowed|legal|may\b|or write|or say|instead|choice|context|as needed)\b|because|since|otherwise|to avoid/i;
for (const [f, s] of allText(mdFiles)) {
  const lines = s.split("\n");
  const hits = []; // {line, text}
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (/^\s*```/.test(l)) { inFence = !inFence; continue; }
    if (inFence) continue;
    if (!ABS_TRIGGER.test(l)) continue;
    let para = [], j = i;
    while (j >= 0 && lines[j].trim() !== "") { para.unshift(lines[j]); j--; }
    let k = i + 1;
    while (k < lines.length && lines[k].trim() !== "") { para.push(lines[k]); k++; }
    const text = para.join(" ");
    const skip =
      (para.length === 1 && /^\s*#{1,6}\s/.test(para[0])) || // heading
      /\|/.test(text) ||                                        // table row
      /^\s*[-*]\s*\[/.test(para[0]) ||                        // checklist item
      ABS_SOFTENER.test(text);                                   // softened/explained
    if (!skip) hits.push({line: i + 1, text: l.trim().slice(0, 100)});
    i = k - 1;
  }
  if (hits.length >= 3)
    add("WARN", f, hits[0].line,
      `${hits.length} naked-absolute paragraphs without a visible carve-out/why (dogma risk; e.g. line ${hits[0].line}: "${hits[0].text}")`);
}

// ---------- 9. duplicate numbered headings ----------
for (const [f, s] of allText(mdFiles)) {
  const seen = new Map();
  for (const l of s.split("\n")) {
    const m = /^#{1,4}\s+(\d+)[.)]?\s/.exec(l);
    if (m) {
      if (seen.has(m[1])) add("INFO", f, 0, `duplicate numbered heading '${m[1]}': "${seen.get(m[1])}" vs "${l.trim().slice(0, 60)}"`);
      else seen.set(m[1], l.trim().slice(0, 60));
    }
  }
}

// ---------- 10. unpinned installs while reproducibility claimed ----------
{
  const mdText = mdFiles.map((f) => readFileSync(f, "utf8")).join("\n");
  const claimsPin = /pin|exact version|lockfile|reproducib/i.test(mdText);
  for (const [f, s] of allText(mdFiles)) {
    const lines = s.split("\n");
    lines.forEach((l, i) => {
      const m = /npm (?:i|install)\s+(@?[a-z0-9@/._-]+)/gi.exec(l);
      if (m && !/@\d+\.\d+/.test(m[1]) && claimsPin && !l.trim().startsWith("#") && !/--save-dev/.test(l))
        add("INFO", f, i + 1, `unpinned install '${m[1]}' while docs discuss pinning/reproducibility`);
    });
  }
}

// ---------- 11. suspiciously small files ----------
for (const f of files) {
  if (MD_EXTS.has(extname(f))) {
    const s = readFileSync(f, "utf8");
    if (s.trim().length < 200) add("INFO", f, 0, "very small markdown file — stub?");
  }
}

// ---------- output ----------
const order = {ERROR: 0, WARN: 1, INFO: 2};
findings.sort((a, b) => order[a.sev] - order[b.sev] || a.file.localeCompare(b.file) || a.line - b.line);
if (asJson) {
  console.log(JSON.stringify(findings, null, 2));
} else {
  for (const f of findings) {
    const loc = f.line ? `${f.file}:${f.line}` : f.file || "-";
    console.log(`[${f.sev}] ${loc}  ${f.msg}`);
  }
  const cnt = {ERROR: 0, WARN: 0, INFO: 0};
  for (const f of findings) cnt[f.sev]++;
  console.log(
    `\n${files.length} files scanned | ${cnt.ERROR} ERROR, ${cnt.WARN} WARN, ${cnt.INFO} INFO`,
  );
}
process.exit(findings.some((f) => f.sev === "ERROR") ? 1 : 0);
