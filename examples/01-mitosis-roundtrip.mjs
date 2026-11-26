#!/usr/bin/env node
/**
 * Example 01 — Zero-Overlap Planarian Binary Mitosis & Bit-Exact Regeneration
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { compilePlangToHbin } from '../src/compiler/compile.js';
import { decodeHbin, regenerateHbin } from '../src/core/hbin.js';
import { bisectBinary } from '../src/core/torture.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = fs.readFileSync(path.join(ROOT, 'programs/aegis_drift.plang'), 'utf8');

const compiled = compilePlangToHbin(src);
const cutOffset = 49177; // unaligned prime offset (not a multiple of 512)
const { left, right } = bisectBinary(compiled.bytes, cutOffset);

const decLeft = decodeHbin(left, { pinnedRootHex: compiled.lineageRootHex });
const decRight = decodeHbin(right, { pinnedRootHex: compiled.lineageRootHex });
const regLeft = regenerateHbin(decLeft);
const regRight = regenerateHbin(decRight);

assert.equal(regLeft.sha256Hex, compiled.sha256Hex, 'Left half must regenerate bit-exact SHA-256');
assert.equal(regRight.sha256Hex, compiled.sha256Hex, 'Right half must regenerate bit-exact SHA-256');

console.log(`[EX01] Compiled ${compiled.name} (${compiled.bytes.length} B, SHA-256=${compiled.sha256Hex.slice(0, 16)}...)`);
console.log(`[EX01] Bisected @ prime byte ${cutOffset}: left=${left.length}B (S${decLeft.maxViableStratum}), right=${right.length}B (S${decRight.maxViableStratum})`);
console.log('[EX01] PASS: Both disjoint halves regenerated 100% bit-exact pristine .hbin!');
