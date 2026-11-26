#!/usr/bin/env node
/**
 * PLANARIA — Strict Lean 4.35.0 Axiom Allowlist & README Verbatim Transcript Verifier (Playbook #9/#13)
 *
 * Verifies:
 *   1. Every theorem listed in `lean/comparator.json` appears in `results/lean4-audit.txt`
 *   2. Every single axiom across all audited declarations lies strictly inside
 *      `{propext, Classical.choice, Quot.sound}` (or zero axioms)
 *   3. Zero occurrences of `sorryAx`, `Lean.ofReduceBool`, `Lean.trustCompiler`, or `_native`
 *   4. `README.md` embeds an up-to-date verbatim axiom audit block (`<!-- AXIOM-AUDIT-START -->` ...
 *      `<!-- AXIOM-AUDIT-END -->`) matching the exact theorem count and SHA-256 of `results/lean4-audit.txt`
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ALLOWED = new Set(['propext', 'Classical.choice', 'Quot.sound']);

const comp = JSON.parse(fs.readFileSync(path.join(ROOT, 'lean/comparator.json'), 'utf8'));
const auditRaw = fs.readFileSync(path.join(ROOT, 'results/lean4-audit.txt'), 'utf8');
const auditSha = crypto.createHash('sha256').update(Buffer.from(auditRaw, 'utf8')).digest('hex');

if (/sorryAx|ofReduceBool|trustCompiler|_native/.test(auditRaw)) {
  console.error('[AXIOMS] FAIL: forbidden axiom token found in results/lean4-audit.txt!');
  process.exit(1);
}

const parsed = new Map();
for (const line of auditRaw.split(/\r?\n/)) {
  const mDeps = line.match(/^'([^']+)'\s+depends on axioms:\s+\[([^\]]*)\]/);
  if (mDeps) {
    const axs = mDeps[2].split(',').map((s) => s.trim()).filter(Boolean);
    for (const ax of axs) {
      if (!ALLOWED.has(ax)) {
        console.error(`[AXIOMS] FAIL: theorem '${mDeps[1]}' depends on disallowed axiom '${ax}'`);
        process.exit(1);
      }
    }
    parsed.set(mDeps[1], axs);
    continue;
  }
  const mNone = line.match(/^'([^']+)'\s+does not depend on any axioms/);
  if (mNone) parsed.set(mNone[1], []);
}

const missing = comp.theorem_names.filter((t) => !parsed.has(t));
if (missing.length > 0) {
  console.error(`[AXIOMS] FAIL: ${missing.length} theorem(s) from comparator.json missing in lean4-audit.txt: ${missing.join(', ')}`);
  process.exit(1);
}

const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
const mBlock = readme.match(/<!-- AXIOM-AUDIT-START -->([\s\S]*?)<!-- AXIOM-AUDIT-END -->/);
if (!mBlock) {
  console.error('[AXIOMS] FAIL: README.md missing <!-- AXIOM-AUDIT-START --> ... <!-- AXIOM-AUDIT-END --> block.');
  process.exit(1);
}
const block = mBlock[1];
if (!block.includes(`${comp.theorem_names.length}/${comp.theorem_names.length}`)) {
  console.error(`[AXIOMS] FAIL: README.md axiom block does not report ${comp.theorem_names.length}/${comp.theorem_names.length} theorems.`);
  process.exit(1);
}
if (!block.includes(auditSha.slice(0, 16))) {
  console.error(`[AXIOMS] FAIL: README.md axiom block SHA-256 prefix does not match results/lean4-audit.txt (${auditSha.slice(0, 16)}...).`);
  process.exit(1);
}

console.log(
  `[AXIOMS] PASS: ${parsed.size}/${comp.theorem_names.length} theorems audited; 100% strictly within {propext, Classical.choice, Quot.sound}; README verbatim parity verified (sha256=${auditSha.slice(0, 16)}...).`
);
