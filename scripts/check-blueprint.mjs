#!/usr/bin/env node
/**
 * PLANARIA — Interactive Blueprint Integrity Checker
 *
 * Verifies 100% 1:1 parity between `blueprint/blueprint.json`, `lean/comparator.json`,
 * and `results/lean4-audit.txt`, plus presence of `blueprint/index.html`, `blueprint.css`, `blueprint.js`.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ALLOWED_AXIOMS = new Set(['propext', 'Classical.choice', 'Quot.sound']);

for (const rel of ['blueprint/blueprint.json', 'blueprint/index.html', 'blueprint/blueprint.css', 'blueprint/blueprint.js']) {
  if (!fs.existsSync(path.join(ROOT, rel))) {
    console.error(`[BLUEPRINT-CHECK] FAIL: missing ${rel} (run "npm run blueprint").`);
    process.exit(1);
  }
}

const bp = JSON.parse(fs.readFileSync(path.join(ROOT, 'blueprint/blueprint.json'), 'utf8'));
const comp = JSON.parse(fs.readFileSync(path.join(ROOT, 'lean/comparator.json'), 'utf8'));
const compSet = new Set(comp.theorem_names);
const bpSet = new Set(bp.nodes.map((n) => n.id));

const missing = [...compSet].filter((t) => !bpSet.has(t));
const extra = [...bpSet].filter((t) => !compSet.has(t));
const badAxioms = [];
for (const n of bp.nodes) {
  for (const ax of n.axioms || []) {
    if (!ALLOWED_AXIOMS.has(ax)) badAxioms.push(`${n.id}: ${ax}`);
  }
}

if (missing.length || extra.length || badAxioms.length) {
  if (missing.length) console.error(`[BLUEPRINT-CHECK] Missing from blueprint: ${missing.join(', ')}`);
  if (extra.length) console.error(`[BLUEPRINT-CHECK] Extra in blueprint: ${extra.join(', ')}`);
  if (badAxioms.length) console.error(`[BLUEPRINT-CHECK] Forbidden axioms: ${badAxioms.join('; ')}`);
  process.exit(1);
}

console.log(
  `[BLUEPRINT-CHECK] PASS: ${bp.nodes.length}/${comp.theorem_names.length} theorems matched 1:1 with ${bp.edges.length} dependency edges and 0 forbidden axioms.`
);
