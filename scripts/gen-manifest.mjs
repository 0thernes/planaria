#!/usr/bin/env node
/**
 * PLANARIA — Deterministic SHA-256 Manifest Generator (Build Standard B37 / B39)
 *
 * Generates:
 *   1. `MANIFEST.sha256`      — cryptographic hashes of all frozen release, source, script, test, oracle, proof, blueprint & white-paper assets
 *   2. `data/MANIFEST.sha256` — cryptographic hashes of all empirical data, compiled `.hbin` genomes & audit transcripts
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VERSION = fs.readFileSync(path.join(ROOT, 'VERSION'), 'utf8').trim();

function sha256File(absPath) {
  return crypto.createHash('sha256').update(fs.readFileSync(absPath)).digest('hex');
}

function walkDir(absDir, relPrefix, out) {
  for (const entry of fs.readdirSync(absDir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === '__pycache__') continue;
    const rel = `${relPrefix}/${entry.name}`.replace(/\\/g, '/');
    const abs = path.join(absDir, entry.name);
    if (entry.isDirectory()) walkDir(abs, rel, out);
    else if (entry.isFile()) out.push(rel);
  }
}

function collectFiles(relPaths) {
  const out = [];
  const missing = [];
  for (const rp of relPaths) {
    const abs = path.join(ROOT, rp);
    if (!fs.existsSync(abs)) {
      missing.push(rp);
      continue;
    }
    const st = fs.statSync(abs);
    if (st.isDirectory()) {
      walkDir(abs, rp, out);
    } else if (st.isFile()) {
      out.push(rp.replace(/\\/g, '/'));
    }
  }
  if (missing.length > 0) {
    throw new Error(`[MANIFEST] Missing required file(s)/directory(s): ${missing.join(', ')}`);
  }
  return [...new Set(out)].sort();
}

const dataFiles = collectFiles([
  'artifacts/quantum_chronicle.hbin',
  'artifacts/aegis_drift.hbin',
  'artifacts/synth_reactor.hbin',
  'artifacts/cipher_vault.hbin',
  'artifacts/manifest.json',
  'results/benchmarks.json',
  'results/bench-history.csv',
  'results/citation-audit.json',
  'results/lean4-audit.txt',
  'results/lean4-multi-kernel.txt',
  'results/attestation.json',
]);

const rootFiles = collectFiles([
  'VERSION',
  'package.json',
  'formalization.yaml',
  'repo.yaml',
  'CLAIMS.md',
  'LIMITATIONS.md',
  'REPLICATION.md',
  'server.mjs',
  'bin/planaria.mjs',
  'src',
  'scripts',
  'test/verify.mjs',
  'reference/planaria_oracle.py',
  'blueprint',
  'programs',
  'lean/lean-toolchain',
  'lean/lakefile.toml',
  'lean/Challenge.lean',
  'lean/Solution.lean',
  'lean/PlanariaProofs.lean',
  'lean/VerifyAxioms.lean',
  'lean/comparator.json',
  'lean/PlanariaProofs',
  'paper/main.tex',
  'dist/Donahue_2026_planaria.pdf',
  'dist/arxiv_submission.tar.gz',
  ...dataFiles,
]);

function formatManifest(list) {
  return list.map((rel) => `${sha256File(path.join(ROOT, rel))}  ${rel}`).join('\n') + '\n';
}

fs.mkdirSync(path.join(ROOT, 'data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'data/MANIFEST.sha256'), formatManifest(dataFiles), 'utf8');
fs.writeFileSync(path.join(ROOT, 'MANIFEST.sha256'), formatManifest(rootFiles), 'utf8');

console.log(`[MANIFEST] v${VERSION}: wrote data/MANIFEST.sha256 (${dataFiles.length} entries) and MANIFEST.sha256 (${rootFiles.length} entries).`);
