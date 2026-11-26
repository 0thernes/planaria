#!/usr/bin/env node
/**
 * PLANARIA — Concatenated LLM Context Builder (`llms-full.txt`, Build Standard A32)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VERSION = fs.readFileSync(path.join(ROOT, 'VERSION'), 'utf8').trim();
const PARTS = [
  'llms.txt',
  'AGENTS.md',
  'CLAIMS.md',
  'LIMITATIONS.md',
  'REPLICATION.md',
  'docs/architecture.md',
  'docs/benchmarks.md',
  'docs/MEGA_ATLAS_CROSSCHECK.md',
];

const chunks = [`# PLANARIA v${VERSION} — Complete LLM Context Bundle (llms-full.txt)\n`];
const missing = [];
for (const rel of PARTS) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) {
    missing.push(rel);
    continue;
  }
  chunks.push(`\n---\n<!-- FILE: ${rel} -->\n\n` + fs.readFileSync(abs, 'utf8').trim() + '\n');
}
if (missing.length > 0) {
  console.error(`[LLMS-FULL] FAIL: missing required source file(s): ${missing.join(', ')}`);
  process.exit(1);
}

const out = chunks.join('');
fs.writeFileSync(path.join(ROOT, 'llms-full.txt'), out, 'utf8');
console.log(`[LLMS-FULL] Wrote llms-full.txt v${VERSION} (${(Buffer.byteLength(out) / 1024).toFixed(1)} KiB from ${PARTS.length} sources).`);
