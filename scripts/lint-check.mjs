#!/usr/bin/env node
/**
 * PLANARIA v2.3 — Static Analysis, Syntax, Hygiene & Security Linter (Build Standard B17/B18)
 *
 * Zero-dependency static analyzer checking:
 *   1. Exact ES module syntax (`node --check`) across all `.js` and `.mjs` source files
 *   2. Zero unsafe sinks (`eval(`, `new Function(`, `.innerHTML =`, `document.write(`)
 *   3. Zero `TODO(fill)` or unresolved `{{PLACEHOLDER}}` template tokens in active docs/code
 *   4. Zero fabricated `0thernes LLC` claims in non-historical text
 *   5. Zero `sorry` / `admit` / `native_decide` / `axiom ` in Lean proof modules (excluding Challenge.lean)
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
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
      ['document.write(', /\bdocument\.write\s*\(/],
    ]) {
      if (re.test(src)) findings.push(`[UNSAFE-SINK] ${rel} contains ${label}`);
    }
  }
}

// 2. Lean proof hygiene (excluding Challenge.lean which intentionally holds sorry specs)
const leanProofFiles = files.filter(
  (f) => f.endsWith('.lean') && !f.endsWith('Challenge.lean')
);
for (const f of leanProofFiles) {
  const rel = path.relative(ROOT, f).replace(/\\/g, '/');
  const src = fs.readFileSync(f, 'utf8');
  const noComments = src.replace(/\/-[\s\S]*?-\//g, '').replace(/--.*/g, '');
  if (/\bsorry\b/.test(noComments)) findings.push(`[LEAN] ${rel} contains sorry`);
  if (/\badmit\b/.test(noComments)) findings.push(`[LEAN] ${rel} contains admit`);
  if (/\bnative_decide\b/.test(noComments)) findings.push(`[LEAN] ${rel} contains native_decide`);
  if (/^\s*axiom\s+/m.test(noComments)) findings.push(`[LEAN] ${rel} declares custom axiom`);
}

// 3. Unfilled placeholders & entity-claim hygiene across text/docs
const textExts = new Set(['.md', '.tex', '.yml', '.yaml', '.json', '.cff', '.txt', '.html', '.css', '.js', '.mjs', '.lean']);
const ALLOW_ENTITY_HISTORY = new Set([
  'scripts/lint-check.mjs',
  'CHANGELOG.md',
  'ERRATA.md',
  'docs/run-log.md',
  'docs/reviews/2026-11-25-10-pass-red-team-audit.md',
]);
for (const f of files) {
  const ext = path.extname(f).toLowerCase();
  if (!textExts.has(ext)) continue;
  const rel = path.relative(ROOT, f).replace(/\\/g, '/');
  if (rel.startsWith('scripts/Audit-Repo') || rel.startsWith('scripts/audit-')) continue;
  if (rel === 'docs/build-standard.md') continue;
  const txt = fs.readFileSync(f, 'utf8');
  if (rel !== 'scripts/lint-check.mjs' && /TODO\(fill\)|\{\{[A-Z0-9_]+\}\}/.test(txt)) {
    findings.push(`[PLACEHOLDER] ${rel} has unfilled template token`);
  }
  if (!ALLOW_ENTITY_HISTORY.has(rel) && /0thernes LLC/i.test(txt)) {
    findings.push(`[ENTITY-DRIFT] ${rel} still references unformed '0thernes LLC'`);
  }
}

console.log(`[LINT] Scanned ${jsFiles.length} JS/MJS files, ${leanProofFiles.length} Lean proof files, ${files.length} total files.`);

// 4. Optional external eslint pass (report-only, Build Standard B17 / Hard Rule R1)
const eslintBin = process.platform === 'win32' ? 'eslint.cmd' : 'eslint';
const eslintProbe = spawnSync(eslintBin, ['--version'], { encoding: 'utf8' });
if (eslintProbe.status === 0) {
  const esRun = spawnSync(eslintBin, ['src', 'bin', 'scripts', 'test'], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  console.log(`[LINT] Optional eslint (${(eslintProbe.stdout || '').trim()}) report-only exit=${esRun.status}`);
} else {
  console.log('[LINT] Optional eslint not installed; zero-dependency static checks authoritative.');
}

if (findings.length === 0) {
  console.log('[LINT] PASS: 0 static analysis, syntax, security-sink, placeholder, or entity findings.');
} else {
  for (const item of findings) console.error(`  ${item}`);
  console.error(`[LINT] FAIL: ${findings.length} finding(s).`);
  process.exit(1);
}
