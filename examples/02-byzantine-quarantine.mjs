#!/usr/bin/env node
/**
 * Example 02 — Active Byzantine Trojan Injection & Merkle Immune Quarantine
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { compilePlangToHbin } from '../src/compiler/compile.js';
import { decodeHbin, regenerateHbin } from '../src/core/hbin.js';
import { injectByzantineTrojans } from '../src/core/torture.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = fs.readFileSync(path.join(ROOT, 'programs/quantum_chronicle.plang'), 'utf8');

const compiled = compilePlangToHbin(src);
const attacked = injectByzantineTrojans(compiled.bytes, 36, 909, true).bytes;
const decoded = decodeHbin(attacked, { pinnedRootHex: compiled.lineageRootHex });
const healed = regenerateHbin(decoded);

assert.equal(decoded.stats.byzantineQuarantined, 36, 'All 36 RS-valid forged Trojans must be quarantined');
assert.equal(healed.sha256Hex, compiled.sha256Hex, 'Healed binary must match pristine SHA-256 bit-for-bit');

console.log(`[EX02] Injected 36 RS-valid Byzantine Trojans into ${compiled.name}`);
console.log(`[EX02] Merkle Immune quarantined ${decoded.stats.byzantineQuarantined}/36 Trojans; authentic cells=${decoded.stats.authenticCells}/192`);
console.log('[EX02] PASS: Zero contamination — regenerated bit-exact SHA-256!');
