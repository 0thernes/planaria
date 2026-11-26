#!/usr/bin/env node
/**
 * PLANARIA — Static Analysis, Syntax, Hygiene, Lean Header & Cross-Doc Theorem Linter (Build Standard B17/B18)
 *
 * Zero-dependency static analyzer checking:
 *   1. Exact ES module syntax (`node --check`) across all `.js` and `.mjs` source files
 *   2. Zero unsafe sinks (`eval(`, `new Function(`, `.innerHTML =`, `.outerHTML =`, `insertAdjacentHTML(`, `document.write(`, `execSync(`)
 *   3. Zero `TODO(fill)` or unresolved `{{PLACEHOLDER}}` template tokens across all text/code/config/script files
 *   4. Zero fabricated `0thernes LLC` claims in non-historical text
 *   5. Lean 4.35.0 Palomar hygiene: EVERY `.lean` file starts with `module`, and zero `sorry` / `admit` /
 *      `native_decide` / `implemented_by` / `@[extern` / custom `axiom` in proof modules (excluding Challenge.lean)
 *   6. Cross-doc Lean theorem-name integrity: every `Planaria.<Mod>.<name>` referenced in docs/papers resolves
 *      to a real declaration in `lean/`, with zero hallucinated legacy theorem names
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VERSION = fs.readFileSync(path.join(ROOT, 'VERSION'), 'utf8').trim();
const SKIP_DIRS = new Set(['.git', '.lake', 'node_modules', '_site', 'dist']);

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const files = walk(ROOT);
const findings = [];

// 1. JS/MJS syntax + unsafe sink check
const jsFiles = files.filter((f) => f.endsWith('.js') || f.endsWith('.mjs'));
for (const f of jsFiles) {
  const rel = path.relative(ROOT, f).replace(/\\/g, '/');
  const chk = spawnSync(process.execPath, ['--check', f], { encoding: 'utf8' });
  if (chk.status !== 0) {
    findings.push(`[SYNTAX] ${rel}: ${(chk.stderr || '').trim()}`);
  }
  const src = fs.readFileSync(f, 'utf8');
  if (rel !== 'scripts/lint-check.mjs' && rel !== 'test/verify.mjs') {
    for (const [label, re] of [
      ['eval(', /\beval\s*\(/],
      ['new Function(', /\bnew\s+Function\s*\(/],
      ['.innerHTML =', /\.innerHTML\s*=/],
      ['.outerHTML =', /\.outerHTML\s*=/],
      ['insertAdjacentHTML(', /\binsertAdjacentHTML\s*\(/],
      ['document.write(', /\bdocument\.write\s*\(/],
      ['execSync(', /\bexecSync\s*\(/],
    ]) {
      if (re.test(src)) findings.push(`[UNSAFE-SINK] ${rel} contains ${label}`);
    }
  }
}

// 2. Lean 4.35.0 Palomar module header + proof hygiene
const allLeanFiles = files.filter((f) => f.endsWith('.lean'));
const leanProofFiles = allLeanFiles.filter((f) => !f.endsWith('Challenge.lean'));
const declaredLeanSymbols = new Set();

for (const f of allLeanFiles) {
  const rel = path.relative(ROOT, f).replace(/\\/g, '/');
  const src = fs.readFileSync(f, 'utf8');
  const firstLine = src.split(/\r?\n/, 1)[0].trim();
  if (firstLine !== 'module') {
    findings.push(`[LEAN-MODULE] ${rel} line 1 must be 'module' for Palomar/Lean 4.35.0 (got '${firstLine}')`);
  }

  // Collect declared namespace-qualified symbols for cross-doc linting
  let currentNs = '';
  for (const line of src.split(/\r?\n/)) {
    const nsMatch = line.match(/^\s*namespace\s+([A-Za-z0-9_.]+)/);
    if (nsMatch) currentNs = nsMatch[1];
    if (/^\s*end\s+Planaria\./.test(line)) currentNs = '';
    const declMatch = line.match(
      /^\s*(?:@\[[^\]]+\]\s*)*(?:public\s+)?(?:theorem|def|structure|inductive|abbrev)\s+([A-Za-z0-9_']+)/
    );
    if (declMatch && currentNs) {
      declaredLeanSymbols.add(`${currentNs}.${declMatch[1]}`);
    }
  }

  if (f.endsWith('Challenge.lean')) continue;
  const noComments = src.replace(/\/-[\s\S]*?-\//g, '').replace(/--.*/g, '');
  if (/\bsorry\b/.test(noComments)) findings.push(`[LEAN] ${rel} contains sorry`);
  if (/\badmit\b/.test(noComments)) findings.push(`[LEAN] ${rel} contains admit`);
  if (/\bnative_decide\b/.test(noComments)) findings.push(`[LEAN] ${rel} contains native_decide`);
  if (/\bimplemented_by\b/.test(noComments)) findings.push(`[LEAN] ${rel} contains implemented_by`);
  if (/@\[extern\b/.test(noComments)) findings.push(`[LEAN] ${rel} contains @[extern]`);
  if (/^\s*((private|protected|noncomputable|public)\s+)*axiom\b/m.test(noComments)) {
    findings.push(`[LEAN] ${rel} declares custom axiom`);
  }
}

// Also merge comparator.json theorem_names into known symbols
const comparatorPath = path.join(ROOT, 'lean/comparator.json');
if (fs.existsSync(comparatorPath)) {
  const comp = JSON.parse(fs.readFileSync(comparatorPath, 'utf8'));
  for (const name of comp.theorem_names || []) declaredLeanSymbols.add(name);
}

// 3. Unfilled placeholders & entity-claim hygiene across ALL text, script, config & source files
const textExts = new Set([
  '.md', '.tex', '.yml', '.yaml', '.json', '.cff', '.txt', '.html', '.css',
  '.js', '.mjs', '.lean', '.sh', '.ps1', '.toml', '.py', '.tsv',
]);
const ALLOW_ENTITY_HISTORY = new Set([
  'scripts/lint-check.mjs',
  'CHANGELOG.md',
  'ERRATA.md',
  'docs/run-log.md',
  'docs/reviews/2026-11-25-10-pass-red-team-audit.md',
]);
const BANNED_LEGACY_THEOREMS = [
  'merkle_quarantine_zero_false_accept',
  'xenograft_sovereign_b0_immutable',
  'xenograft_b0_b6_sovereignty',
  'merkle_quarantine_authentic_only',
  'merkle_quarantine_preserves_honest',
  'unpinned_quorum_rejects_tie',
  'gf256_mul_comm',
  'gf256_mul_assoc',
  'gf256_cauchy_det_nonzero',
];
const HISTORICAL_THEOREM_DOCS = new Set([
  'scripts/lint-check.mjs',
  'CHANGELOG.md',
  'ERRATA.md',
  'docs/reviews/2026-11-25-10-pass-red-team-audit.md',
]);

for (const f of files) {
  const ext = path.extname(f).toLowerCase();
  const base = path.basename(f);
  if (!textExts.has(ext) && base !== 'justfile') continue;
  const rel = path.relative(ROOT, f).replace(/\\/g, '/');
  if (rel.startsWith('scripts/Audit-Repo') || rel.startsWith('scripts/audit-')) continue;
  if (rel === 'docs/build-standard.md') continue;
  const txt = fs.readFileSync(f, 'utf8');
  if (rel !== 'scripts/lint-check.mjs' && base !== 'justfile' && /TODO\(fill\)|\{\{[A-Z0-9_]+\}\}/.test(txt)) {
    findings.push(`[PLACEHOLDER] ${rel} has unfilled template token`);
  }
  if (!ALLOW_ENTITY_HISTORY.has(rel) && /0thernes LLC/i.test(txt)) {
    findings.push(`[ENTITY-DRIFT] ${rel} still references unformed '0thernes LLC'`);
  }

  // 4. Cross-doc Lean theorem name verification
  if (!HISTORICAL_THEOREM_DOCS.has(rel) && (ext === '.md' || ext === '.tex' || ext === '.yaml' || ext === '.yml')) {
    const cleanTxt = txt.replace(/\\_/g, '_');
    for (const bad of BANNED_LEGACY_THEOREMS) {
      if (new RegExp(`\\b${bad}\\b`).test(cleanTxt)) {
        findings.push(`[THEOREM-DRIFT] ${rel} cites obsolete/non-existent theorem '${bad}'`);
      }
    }
    const qMatches = cleanTxt.matchAll(/\b(Planaria\.(GF256|Mitosis|Anastomosis|Byzantine|Xenograft|QuantumTemporal|Adversarial)\.[A-Za-z0-9_']+)\b/g);
    for (const m of qMatches) {
      const sym = m[1];
      if (!declaredLeanSymbols.has(sym)) {
        findings.push(`[THEOREM-MISSING] ${rel} cites undeclared Lean symbol '${sym}'`);
      }
    }
  }
}

console.log(
  `[LINT] PLANARIA v${VERSION}: scanned ${jsFiles.length} JS/MJS, ${allLeanFiles.length} Lean (${declaredLeanSymbols.size} symbols), ${files.length} total files.`
);

// 5. Optional external eslint pass (report-only, Build Standard B17 / Hard Rule R1)
const eslintBin = process.platform === 'win32' ? 'eslint.cmd' : 'eslint';
const eslintProbe = spawnSync(eslintBin, ['--version'], {
  encoding: 'utf8',
  shell: process.platform === 'win32',
});
if (eslintProbe.status === 0) {
  const esRun = spawnSync(eslintBin, ['src', 'bin', 'scripts', 'test'], {
    cwd: ROOT,
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });
  console.log(`[LINT] Optional eslint (${(eslintProbe.stdout || '').trim()}) report-only exit=${esRun.status}`);
} else {
  console.log('[LINT] Optional eslint not installed; zero-dependency static checks authoritative.');
}

if (findings.length === 0) {
  console.log('[LINT] PASS: 0 static analysis, syntax, security-sink, Lean-header, placeholder, entity, or theorem-drift findings.');
} else {
  for (const item of findings) console.error(`  ${item}`);
  console.error(`[LINT] FAIL: ${findings.length} finding(s).`);
  process.exit(1);
}
