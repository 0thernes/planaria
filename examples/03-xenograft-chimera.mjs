#!/usr/bin/env node
/**
 * Example 03 — Cross-Species ABI-Verified Xenograft Chimera + Live PVM-32 Execution
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { compilePlangToHbin } from '../src/compiler/compile.js';
import { decodeHbin } from '../src/core/hbin.js';
import { amputateBundles, concatShards } from '../src/core/torture.js';
import { PVM32 } from '../src/vm/pvm32.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const host = compilePlangToHbin(fs.readFileSync(path.join(ROOT, 'programs/aegis_drift.plang'), 'utf8'));
const donor = compilePlangToHbin(fs.readFileSync(path.join(ROOT, 'programs/synth_reactor.plang'), 'utf8'));

const amputated = amputateBundles(host.bytes, [3, 4], true, 123).bytes;
const spliced = concatShards(amputated, donor.bytes, 53, 456);
const chimera = decodeHbin(spliced, {
  pinnedRootHex: host.lineageRootHex,
  allowXenograft: true,
});

assert.equal(chimera.bootable, true);
assert.equal(chimera.bundles[0].source, 'PRIMARY', 'Host Stem Kernel (B0) must remain sovereign');
assert.equal(chimera.bundles[3].source, 'XENOGRAFT', 'S2 Cortex Render transplanted from donor');
assert.equal(chimera.bundles[4].source, 'XENOGRAFT', 'S2 Synth Audio transplanted from donor');

const vm = new PVM32(2026);
vm.loadDecoded(chimera, true);
for (let f = 0; f < 30; f++) vm.stepFrame();
assert.equal(vm.traps, 0, 'Chimera must execute 30 frames with zero VM traps');

console.log(`[EX03] Forged Chimera: ${host.name} (host) x ${donor.name} (donor)`);
console.log(`[EX03] Transplanted organs: ${chimera.xenografts.map((x) => x.bundleName).join(', ')} | Max Stratum=S${chimera.maxViableStratum}`);
console.log(`[EX03] PASS: Executed 30 PVM-32 frames (${vm.totalInsns} insns, 0 traps)!`);
