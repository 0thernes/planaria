/**
 * Compiles all 3 Plang source programs into standalone 98,304-byte .hbin holographic
 * binary artifacts inside artifacts/ and prints deterministic SHA-256 & Lineage Roots.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compilePlangToHbin } from '../src/compiler/compile.js';

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
    `[BUILD] ${compiled.name.padEnd(15)} -> artifacts/${name}.hbin (${compiled.bytes.length}B) | ` +
    `Root=${compiled.lineageRootHex} | SHA256=${compiled.sha256Hex.slice(0, 16)}... | ${compiled.codegen.totalInstructions} insns`
  );
}

fs.writeFileSync(
  path.join(ART_DIR, 'manifest.json'),
  JSON.stringify({ format: 'PLANARIA-HBIN-1', artifacts: manifest }, null, 2) + '\n'
);
console.log(`[BUILD] Wrote artifacts/manifest.json (${manifest.length} holographic binaries).`);
