#!/usr/bin/env node
/**
 * PLANARIA v2.3.0 — Deterministic SHA-256 Manifest Generator (Build Standard B37 / B39)
 *
 * Generates:
 *   1. `MANIFEST.sha256`      — cryptographic hashes of all frozen release, source, proof & white-paper assets
 *   2. `data/MANIFEST.sha256` — cryptographic hashes of all empirical data, compiled `.hbin` genomes & audit transcripts
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function sha256File(absPath) {
  return crypto.createHash('sha256').update(fs.readFileSync(absPath)).digest('hex');
}

function collectFiles(relPaths) {
  const out = [];
  for (const rp of relPaths) {
    const abs = path.join(ROOT, rp);
    if (!fs.existsSync(abs)) continue;
    const st = fs.statSync(abs);
    if (st.isDirectory()) {
      for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
        if (entry.isFile()) out.push(`${rp}/${entry.name}`.replace(/\\/g, '/'));
      }
    } else if (st.isFile()) {
      out.push(rp.replace(/\\/g, '/'));
    }
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
  'src/core',
  'src/compiler',
  'src/vm',
  'src/quantum',
  'src/world',
  'src/web',
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

console.log(`[MANIFEST] Wrote data/MANIFEST.sha256 (${dataFiles.length} entries) and MANIFEST.sha256 (${rootFiles.length} entries).`);
