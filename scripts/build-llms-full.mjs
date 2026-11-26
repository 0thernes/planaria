#!/usr/bin/env node
/**
 * PLANARIA v2.3.0 — Concatenated LLM Context Builder (`llms-full.txt`, Build Standard A32)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PARTS = [
  'llms.txt',
  'AGENTS.md',
  'CLAIMS.md',
  'LIMITATIONS.md',
  'REPLICATION.md',
  'docs/architecture.md',
  'docs/benchmarks.md',
];

const chunks = ['# PLANARIA v2.3.0 — Complete LLM Context Bundle (llms-full.txt)\n'];
for (const rel of PARTS) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) continue;
  chunks.push(`\n---\n<!-- FILE: ${rel} -->\n\n` + fs.readFileSync(abs, 'utf8').trim() + '\n');
}

const out = chunks.join('');
fs.writeFileSync(path.join(ROOT, 'llms-full.txt'), out, 'utf8');
console.log(`[LLMS-FULL] Wrote llms-full.txt (${(Buffer.byteLength(out) / 1024).toFixed(1)} KiB from ${PARTS.length} sources).`);
