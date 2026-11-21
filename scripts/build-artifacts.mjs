/**
 * Compiles all 4 Plang source programs into standalone 98,304-byte .hbin holographic
 * binary artifacts inside artifacts/, verifies round-trip decode & regeneration, and
 * writes deterministic SHA-256 & Lineage Roots to artifacts/manifest.json.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compilePlangToHbin } from '../src/compiler/compile.js';
import { decodeHbin, regenerateHbin, CELL_SIZE, TOTAL_CELLS } from '../src/core/hbin.js';

const TOTAL_FILE_BYTES = CELL_SIZE * TOTAL_CELLS;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PROG_DIR = path.join(ROOT, 'programs');
const ART_DIR = path.join(ROOT, 'artifacts');

fs.mkdirSync(ART_DIR, { recursive: true });

const programs = ['quantum_chronicle', 'aegis_drift', 'synth_reactor', 'cipher_vault'];
const manifest = [];

for (const name of programs) {
  const srcPath = path.join(PROG_DIR, `${name}.plang`);
  const outPath = path.join(ART_DIR, `${name}.hbin`);
  const src = fs.readFileSync(srcPath, 'utf8');
  const compiled = compilePlangToHbin(src);

  if (compiled.bytes.length !== TOTAL_FILE_BYTES) {
    throw new Error(`Artifact ${name} size mismatch: expected ${TOTAL_FILE_BYTES}B, got ${compiled.bytes.length}B`);
  }
  const decoded = decodeHbin(compiled.bytes, { pinnedRootHex: compiled.lineageRootHex });
  if (!decoded.bootable || !decoded.canFullRegenerate) {
    throw new Error(`Artifact ${name} failed pristine round-trip decode check`);
  }
  const regen = regenerateHbin(decoded);
  if (regen.sha256Hex !== compiled.sha256Hex) {
    throw new Error(`Artifact ${name} failed deterministic regeneration bit-exact SHA-256 check`);
  }

  fs.writeFileSync(outPath, compiled.bytes);

  manifest.push({
    file: `artifacts/${name}.hbin`,
    source: `programs/${name}.plang`,
    name: compiled.name,
    bytes: compiled.bytes.length,
    lineageRootHex: compiled.lineageRootHex,
    sha256Hex: compiled.sha256Hex,
    totalInstructions: compiled.codegen.totalInstructions,
    totalCodeBytes: compiled.codegen.totalCodeBytes,
    bundles: compiled.codegen.report,
  });

  console.log(
    `[BUILD] ${compiled.name.padEnd(18)} -> artifacts/${name}.hbin (${compiled.bytes.length}B) | ` +
    `Root=${compiled.lineageRootHex} | SHA256=${compiled.sha256Hex.slice(0, 16)}... | ${compiled.codegen.totalInstructions} insns`
  );
}

fs.writeFileSync(
  path.join(ART_DIR, 'manifest.json'),
  JSON.stringify({ format: 'PLANARIA-HBIN-1', artifacts: manifest }, null, 2) + '\n'
);
console.log(`[BUILD] Wrote artifacts/manifest.json (${manifest.length} verified holographic binaries).`);
