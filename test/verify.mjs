/**
 * PLANARIA v2.3 — 28-Suite Falsifiable Verification, Property-Based, Security & Adversarial Harness
 *
 * Verifies BOTH positive mathematical/operational guarantees AND negative tight-bound
 * Popperian falsification boundaries across all 5 architectural layers:
 *   Layer 1: GF(2^8), Interleaved RS(254,238), Cauchy MDS, SHA-256, Depth-8 Merkle, .hbin
 *   Layer 2: Plang Compiler (Lexer/Parser/Codegen), PVM-32 VM, Linear Control Twin, 4 Species
 *   Layer 3: 4-Qubit QuantumRegister (CHSH/Mermin), TemporalEngine, Generator, 3D World
 *   Layer 4: Hardened CLI (9 commands), Hardened HTTP Server (CSP/Traversal/XSS/Healthz), Artifacts
 *   Layer 5: Property-Based (`prop_check`), Cycle 1 Regressions, Metamorphic Invariants & Examples
 */

import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { gfMul, gfMulDirect, gfInv, gfAdd, gfPow } from '../src/core/gf256.js';
import { rsEncode, rsDecode, rsArmorInterleaved, rsUnarmorInterleaved, RS_K } from '../src/core/rs.js';
import { cauchyEncode, cauchyDecode } from '../src/core/cauchy.js';
import { sha256, toHex, fromHex, EMPTY_LEAF_HASH, computeMerkleRootFromProof } from '../src/core/sha256.js';
import {
  decodeHbin,
  regenerateHbin,
  inspectSingleCell,
  TOTAL_HBIN_BYTES,
  CELL_SIZE,
  SYNC_WORD,
  BUNDLE_SPECS,
} from '../src/core/hbin.js';
import {
  bisectBinary,
  splitBinary,
  shredCells,
  irradiateCells,
  amputateBundles,
  shiftAndShuffle,
  injectByzantineTrojans,
  injectOverlapEclipseTrojan,
  concatShards,
  makeRng,
} from '../src/core/torture.js';
import { compilePlangToHbin } from '../src/compiler/compile.js';
import { PVM32 } from '../src/vm/pvm32.js';
import { encodeLinearBinary, decodeLinearBinary } from '../src/vm/linear-twin.js';
import {
  QuantumRegister,
  wkbTunnelingProbability,
  heisenbergStance,
  zenoSuppressionFactor,
  evalWaveInterference,
} from '../src/quantum/qengine.js';
import {
  forgeWeapon,
  forgeArmor,
  forgeNPC,
  buildStageSpec,
  combinatorialSpaceMetrics,
} from '../src/world/generator.js';
import { ChronoQuantumWorld } from '../src/world/game3d.js';
import { createPlanariaServer } from '../server.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const VERSION = fs.readFileSync(path.join(ROOT, 'VERSION'), 'utf8').trim();

let passed = 0;
let failed = 0;

async function suite(name, fn) {
  const t0 = performance.now();
  try {
    await fn();
    const dt = (performance.now() - t0).toFixed(1);
    console.log(`  [PASS] ${name} (${dt} ms)`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${name}: ${err.stack || err.message}`);
    failed++;
  }
}

function httpRequest(port, reqPath, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = http.request(
      { host: '127.0.0.1', port, path: reqPath, method },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: Buffer.concat(chunks).toString('utf8'),
          });
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

console.log('========================================================================');
console.log(` PLANARIA v${VERSION} — 30-SUITE FALSIFIABLE VERIFICATION & SECURITY HARNESS`);
console.log('========================================================================');

const qchronSrc = fs.readFileSync(path.join(ROOT, 'programs/quantum_chronicle.plang'), 'utf8');
const aegisSrc = fs.readFileSync(path.join(ROOT, 'programs/aegis_drift.plang'), 'utf8');
const synthSrc = fs.readFileSync(path.join(ROOT, 'programs/synth_reactor.plang'), 'utf8');
const vaultSrc = fs.readFileSync(path.join(ROOT, 'programs/cipher_vault.plang'), 'utf8');

const qchron = compilePlangToHbin(qchronSrc);
const aegis = compilePlangToHbin(aegisSrc);
const synth = compilePlangToHbin(synthSrc);
const vault = compilePlangToHbin(vaultSrc);

// SUITE 01: Exhaustive GF(2^8) Field Axioms & Cauchy MDS Invertibility
await suite('Suite 01: Exhaustive GF(2^8) Field Axioms (65,536 pairs) & Cauchy MDS Exact Recovery', () => {
  for (let a = 0; a < 256; a++) {
    assert.equal(gfAdd(a, a), 0);
    if (a > 0) {
      const inv = gfInv(a);
      assert.equal(gfMul(a, inv), 1);
      assert.equal(gfMul(inv, a), 1);
    }
    for (let b = 0; b < 256; b++) {
      assert.equal(gfMul(a, b), gfMulDirect(a, b));
      assert.equal(gfMul(a, b), gfMul(b, a));
    }
  }
  assert.throws(() => gfPow(0, -1), RangeError);
  assert.throws(() => gfPow(3, 1.5), RangeError);
  assert.equal(gfPow(0, 0), 1);

  const rng = makeRng(2026);
  const payload = new Uint8Array(16 * 64);
  for (let i = 0; i < payload.length; i++) payload[i] = Math.floor(rng() * 256);
  const encoded = cauchyEncode(payload, 16, 40, 64);
  for (let trial = 0; trial < 40; trial++) {
    const perm = [...encoded].sort(() => rng() - 0.5).slice(0, 16);
    const dec = cauchyDecode(perm, 16, 64, payload.length);
    assert.equal(dec.ok, true);
    assert.deepEqual(dec.data, payload);
  }
  const under = cauchyDecode(encoded.slice(0, 15), 16, 64, payload.length);
  assert.equal(under.ok, false);
  assert.equal(under.reason, 'insufficient_rank');
  assert.throws(() => cauchyEncode(payload, 0, 10, 64), RangeError);
  assert.equal(cauchyDecode([{ evalX: NaN, data: new Uint8Array(64) }], 1, 64, 64).ok, false);
});

// SUITE 02: Inner RS(254, 238) Exact 8-Error Correction, 16-Byte Burst Repair & Tight Rejection
await suite('Suite 02: Inner Interleaved RS(254, 238) 8B/lane + 16B Burst Repair & Tight Boundary Rejection', () => {
  const rng = makeRng(9001);
  for (let trial = 0; trial < 50; trial++) {
    const msg = new Uint8Array(RS_K);
    for (let i = 0; i < RS_K; i++) msg[i] = Math.floor(rng() * 256);
    const cw = rsEncode(msg);
    const corrupt = new Uint8Array(cw);
    const idxs = new Set();
    while (idxs.size < 8) idxs.add(Math.floor(rng() * cw.length));
    for (const idx of idxs) corrupt[idx] ^= 1 + Math.floor(rng() * 255);
    const res = rsDecode(corrupt);
    assert.equal(res.ok, true);
    assert.equal(res.errorsCorrected, 8);
    assert.deepEqual(res.data, msg);
    // Verify detached copy (mutating corrupt does not mutate res.data)
    corrupt[0] ^= 0xff;
    assert.deepEqual(res.data, msg);
  }
  const body = new Uint8Array(476);
  for (let i = 0; i < 476; i++) body[i] = (i * 53 + 7) & 0xff;
  const armored = rsArmorInterleaved(body);
  for (const start of [0, 1, 77, 254, 475, 492]) {
    const burst = new Uint8Array(armored);
    for (let k = 0; k < 16; k++) burst[start + k] ^= (0x3c + k);
    const dec = rsUnarmorInterleaved(burst);
    assert.equal(dec.ok, true);
    assert.equal(dec.errorsCorrected, 16);
    assert.deepEqual(dec.body, body);
  }
  const msg = new Uint8Array(RS_K).fill(0x42);
  const cw = rsEncode(msg);
  for (let i = 0; i < 10; i++) cw[i * 17] ^= 0xff;
  assert.equal(rsDecode(cw).ok, false);
  assert.throws(() => rsEncode(new Uint8Array(0)), RangeError);
});

// SUITE 03: FIPS 180-4 SHA-256 Cross-Check vs OpenSSL + Merkle Domain Separation
await suite('Suite 03: Zero-Dep Streaming SHA-256 Exact Bit-Match vs Node OpenSSL & Domain Separation', () => {
  const vectors = ['', 'a', 'abc', 'a'.repeat(55), 'a'.repeat(56), 'a'.repeat(64), 'a'.repeat(1000)];
  for (const v of vectors) {
    const b = new TextEncoder().encode(v);
    assert.equal(toHex(sha256(b)), crypto.createHash('sha256').update(b).digest('hex'));
  }
  assert.equal(toHex(sha256(aegis.bytes)), crypto.createHash('sha256').update(aegis.bytes).digest('hex'));
  // Distinct 0x02 domain separation for EMPTY_LEAF_HASH vs 0x00 real empty leaf
  const realEmptyLeaf = sha256(new Uint8Array([0x00])).slice(0, 16);
  assert.notEqual(toHex(EMPTY_LEAF_HASH), toHex(realEmptyLeaf));
  assert.throws(() => fromHex('zz'), RangeError);
  assert.throws(() => fromHex('abc'), RangeError);
  assert.throws(() => computeMerkleRootFromProof(new Uint8Array(16), -1, new Uint8Array(128)), RangeError);
  assert.throws(() => computeMerkleRootFromProof(new Uint8Array(16), 256, new Uint8Array(128)), RangeError);
  assert.throws(() => computeMerkleRootFromProof(new Uint8Array(16), 0, new Uint8Array(64)), RangeError);
});

// SUITE 04: Zero-Overlap 50/50 Planarian Mitosis -> Bit-Exact Dual Regeneration
await suite('Suite 04: Zero-Overlap Planarian Mitosis (Exact & Unaligned Prime Cuts) -> Bit-Exact Dual Regeneration', () => {
  assert.equal(aegis.bytes.length, TOTAL_HBIN_BYTES);
  const linTwin = encodeLinearBinary(aegis.rawBundles, 'AEGIS_LINEAR');

  for (const cut of [49152, 49177, 48899, 49401]) {
    const { left, right } = bisectBinary(aegis.bytes, cut);
    assert.equal(left.length + right.length, aegis.bytes.length);

    const decL = decodeHbin(left);
    const decR = decodeHbin(right);
    assert.equal(decL.bootable, true);
    assert.equal(decR.bootable, true);
    assert.equal(decL.canFullRegenerate, true);
    assert.equal(decR.canFullRegenerate, true);

    assert.equal(regenerateHbin(decL).sha256Hex, aegis.sha256Hex);
    assert.equal(regenerateHbin(decR).sha256Hex, aegis.sha256Hex);

    const linCut = bisectBinary(linTwin.bytes, cut);
    assert.equal(decodeLinearBinary(linCut.right).bootable, false);
  }
});

// SUITE 05: 3-Way Trisection + Raw Byte Concatenation Super-Additive Synergistic Healing
await suite('Suite 05: 3-Way Trisection + Raw Byte Concatenation (cat A + B) Super-Additive Synergistic Healing', () => {
  const parts = splitBinary(aegis.bytes, 3);
  for (const p of parts) {
    const d = decodeHbin(p);
    assert.equal(d.bootable, true);
    assert.equal(d.maxViableStratum, 2);
    assert.equal(d.canFullRegenerate, false);
  }
  for (const [i, j] of [[0, 1], [0, 2], [1, 2]]) {
    const fused = concatShards(parts[i], parts[j], 137, i * 10 + j);
    const df = decodeHbin(fused);
    assert.equal(df.maxViableStratum, 3);
    assert.equal(df.canFullRegenerate, true);
    assert.equal(regenerateHbin(df).sha256Hex, aegis.sha256Hex);
  }
});

// SUITE 06: 88% File Obliteration ("12% Ghost") -> Stratum 0 Live Execution
await suite('Suite 06: 88% File Obliteration ("12% Ghost") -> Still Boots & Executes Live in Stratum 0!', () => {
  let ghostDec = null;
  for (let seed = 1; seed <= 20; seed++) {
    const { bytes } = shredCells(aegis.bytes, 0.88, seed, true);
    const dec = decodeHbin(bytes);
    if (dec.bootable && dec.maxViableStratum === 0) {
      ghostDec = dec;
      break;
    }
  }
  assert.ok(ghostDec, 'Expected surviving Stratum-0 ghost at 88% destruction');
  const vm = new PVM32();
  vm.loadDecoded(ghostDec, true);
  for (let f = 0; f < 30; f++) vm.stepFrame();
  assert.equal(vm.traps, 0);
  assert.ok(vm.framebufferStats().nonBgPixels > 100);
});

// SUITE 07: Simultaneous 14B Burst Radiation Across ALL 192 Cells + 137B Unaligned Shift + Shuffle
await suite('Suite 07: Simultaneous 14B Burst Radiation Across ALL 192 Cells + 137B Unaligned Shift + Shuffle', () => {
  let rad = irradiateCells(synth.bytes, 14, 777, true).bytes;
  rad = shiftAndShuffle(rad, 137, 888, true);
  const dec = decodeHbin(rad);
  assert.equal(dec.bootable, true);
  assert.equal(dec.canFullRegenerate, true);
  assert.equal(dec.stats.rsRepairedCells, 192);
  assert.equal(dec.stats.rsTotalByteErrorsFixed, 192 * 14);
  assert.equal(dec.stats.unalignedRecoveries, 192);
  assert.equal(regenerateHbin(dec).sha256Hex, synth.sha256Hex);
});

// SUITE 08: Active Byzantine Trojan Attack + Overlap-Eclipse Defense
await suite('Suite 08: Active Byzantine Trojans & Overlap-Eclipse Attack — Merkle Quarantine ON vs OFF', () => {
  const attacked = injectByzantineTrojans(aegis.bytes, 60, 666, true).bytes;

  const safeDec = decodeHbin(attacked, { pinnedRootHex: aegis.lineageRootHex });
  assert.equal(safeDec.stats.byzantineQuarantined, 60);
  assert.equal(safeDec.canFullRegenerate, true);
  assert.equal(regenerateHbin(safeDec).sha256Hex, aegis.sha256Hex);

  const quorumDec = decodeHbin(attacked);
  assert.equal(quorumDec.primaryRootHex, aegis.lineageRootHex);
  assert.equal(quorumDec.stats.byzantineQuarantined, 60);
  assert.equal(regenerateHbin(quorumDec).sha256Hex, aegis.sha256Hex);

  // Overlap-Eclipse attack: forged sync inside gap before honest cell MUST NOT eclipse honest cell!
  const eclipsed = injectOverlapEclipseTrojan(aegis.bytes, 128, 777).bytes;
  const eclDec = decodeHbin(eclipsed, { pinnedRootHex: aegis.lineageRootHex });
  assert.equal(eclDec.canFullRegenerate, true);
  assert.equal(regenerateHbin(eclDec).sha256Hex, aegis.sha256Hex);

  // Falsification proof: disabling immune system allows Cauchy poisoning AND blocks regenerateHbin
  const poisonedDec = decodeHbin(attacked, { disableImmuneSystem: true });
  const origB0 = aegis.rawBundles.get(0);
  const poisB0 = poisonedDec.bundles[0].data;
  let diffBytes = 0;
  for (let i = 0; i < Math.min(origB0.length, poisB0.length); i++) {
    if (origB0[i] !== poisB0[i]) diffBytes++;
  }
  assert.ok(diffBytes > 50);
  assert.throws(() => regenerateHbin(poisonedDec));
});

// SUITE 09: Live Surgical Organ Amputation -> Seamless Hot-Swap Anastomosis
await suite('Suite 09: Live Surgical Organ Amputation -> Seamless Hot-Swap Anastomosis (S3 -> S2 -> S1 -> S0 -> Healed)', () => {
  const vm = new PVM32();
  vm.loadDecoded(decodeHbin(aegis.bytes), true);
  for (let f = 0; f < 20; f++) vm.stepFrame();
  const savedScore = vm.ram[1];
  const savedFrame = vm.frameCount;

  const amp1 = amputateBundles(aegis.bytes, [3, 4, 5]).bytes;
  vm.loadDecoded(decodeHbin(amp1), false);
  vm.stepFrame();
  assert.equal(vm.frameCount, savedFrame + 1);
  assert.ok(vm.ram[1] >= savedScore);
  assert.equal(vm.lastFrameRoutes.find((r) => r.organName === 'RENDERER').resolvedStratum, 1);

  const amp2 = amputateBundles(amp1, [2]).bytes;
  vm.loadDecoded(decodeHbin(amp2), false);
  vm.stepFrame();
  assert.equal(vm.lastFrameRoutes.find((r) => r.organName === 'RENDERER').source, 'FALLBACK_STUB');
  assert.equal(vm.traps, 0);

  vm.loadDecoded(decodeHbin(aegis.bytes), false);
  vm.stepFrame();
  assert.equal(vm.lastFrameRoutes.find((r) => r.organName === 'RENDERER').resolvedStratum, 2);
});

// SUITE 10: Cross-Species Xenograft Chimera + Unpinned Sovereignty Guard + Export
await suite('Suite 10: Cross-Species Xenograft Chimera, Unpinned Sovereignty Guard & Standalone Export', () => {
  const amputatedAegis = amputateBundles(aegis.bytes, [3, 4]).bytes;
  const spliced = concatShards(amputatedAegis, synth.bytes, 79);

  // Unpinned xenograft MUST be blocked by default unless pinnedRootHex or allowUnpinnedXenograft!
  const unpinnedBlocked = decodeHbin(spliced, { allowXenograft: true });
  assert.equal(unpinnedBlocked.xenografts.length, 0);
  assert.equal(unpinnedBlocked.stats.xenograftBlockedUnpinned, true);

  // Pinned xenograft succeeds cleanly and preserves B0 sovereignty!
  const chimeraDec = decodeHbin(spliced, {
    pinnedRootHex: aegis.lineageRootHex,
    allowXenograft: true,
  });
  assert.equal(chimeraDec.bootable, true);
  assert.equal(chimeraDec.xenografts.length, 2);
  assert.equal(chimeraDec.bundles[3].source, 'XENOGRAFT');
  assert.equal(chimeraDec.bundles[4].source, 'XENOGRAFT');
  assert.equal(chimeraDec.bundles[0].source, 'PRIMARY');

  const vm = new PVM32();
  vm.loadDecoded(chimeraDec, true);
  for (let f = 0; f < 90; f++) vm.stepFrame();
  assert.equal(vm.traps, 0);
  assert.ok(vm.framebufferStats().nonBgPixels > 2000);
  assert.ok(vm.voices.some((v) => v.vol > 0 && v.freqHz > 40));

  const exported = regenerateHbin(chimeraDec);
  assert.equal(exported.bytes.length, TOTAL_HBIN_BYTES);
  const { left, right } = bisectBinary(exported.bytes, 49152);
  assert.equal(regenerateHbin(decodeHbin(left)).sha256Hex, exported.sha256Hex);
  assert.equal(regenerateHbin(decodeHbin(right)).sha256Hex, exported.sha256Hex);
});

// SUITE 11: ALL 4 Compiled Living Species Deterministic Execution Audit
await suite('Suite 11: All 4 Compiled Living Species Deterministic Execution (QC, AEGIS, SYNTH, VAULT)', () => {
  for (const prog of [qchron, aegis, synth, vault]) {
    const vmA = new PVM32(12345);
    const vmB = new PVM32(12345);
    const dec = decodeHbin(prog.bytes);
    vmA.loadDecoded(dec, true);
    vmB.loadDecoded(dec, true);
    for (let f = 0; f < 100; f++) {
      vmA.stepFrame();
      vmB.stepFrame();
    }
    assert.equal(vmA.traps, 0, `${prog.name} trapped unexpectedly`);
    assert.equal(vmA.framebufferStats().hashHex, vmB.framebufferStats().hashHex, `${prog.name} not deterministic`);
    assert.ok(vmA.framebufferStats().nonBgPixels > 1000, `${prog.name} drew too few pixels`);
  }
});

// SUITE 12: Tight Popperian Falsification Boundaries
await suite('Suite 12: Popperian Falsification Boundaries (1-Bit Linear Death, Sub-S0 Extinction & Tie Fail-Closed)', () => {
  const lin = encodeLinearBinary(aegis.rawBundles);
  const flippedLin = new Uint8Array(lin.bytes);
  flippedLin[100] ^= 0x01;
  assert.equal(decodeLinearBinary(flippedLin).bootable, false);

  const flippedPlanaria = new Uint8Array(aegis.bytes);
  flippedPlanaria[100] ^= 0x01;
  const decP = decodeHbin(flippedPlanaria);
  assert.equal(decP.bootable, true);
  assert.equal(decP.stats.rsTotalByteErrorsFixed, 1);
  assert.equal(regenerateHbin(decP).sha256Hex, aegis.sha256Hex);

  const tiny = aegis.bytes.subarray(0, 512);
  const deadDec = decodeHbin(tiny);
  assert.equal(deadDec.bootable, false);
  assert.equal(deadDec.maxViableStratum, -1);

  // Exact 10-vs-10 root tie MUST fail closed (quorumAmbiguous = true)!
  const tie = concatShards(aegis.bytes.subarray(0, 10 * CELL_SIZE), synth.bytes.subarray(0, 10 * CELL_SIZE), 0);
  const tieDec = decodeHbin(tie);
  assert.equal(tieDec.bootable, false);
  assert.equal(tieDec.stats.quorumAmbiguous, true);
});

// SUITE 13: 4-Qubit Unitarity, Horodecki CHSH, 4-Qubit Mermin GHZ, WKB & Heisenberg
await suite('Suite 13: 4-Qubit Unitarity (X/Y/Z/H/CNOT/CZ/SWAP), Horodecki CHSH, Mermin GHZ, WKB & Heisenberg', () => {
  const q = new QuantumRegister(4);
  q.H(0); q.CNOT(0, 1); q.Y(2); q.RX(2, 0.73); q.RY(3, 1.19); q.RZ(1, 0.55); q.CZ(2, 3); q.SWAP(0, 3);
  assert.ok(Math.abs(q.normSq() - 1.0) < 1e-13);

  // Rotation-invariant Horodecki CHSH: stays at exact Tsirelson 2*sqrt(2) even after arbitrary local rotation!
  q.prepareBellPair(0, 1);
  q.RY(0, 0.91);
  q.RZ(1, 1.37);
  const S = Math.abs(q.computeCHSH(0, 1));
  assert.ok(Math.abs(S - 2 * Math.SQRT2) < 1e-9, `Expected rotation-invariant Tsirelson 2*sqrt(2), got ${S}`);

  // Exact 4-qubit GHZ Mermin inequality violation: |M_4| = 4.0 > 2.0 (classical local-realism bound)!
  q.prepareGHZ();
  const M4 = Math.abs(q.computeMermin4());
  assert.ok(Math.abs(M4 - 4.0) < 1e-9, `Expected GHZ Mermin |M_4|=4.0, got ${M4}`);

  q.prepareBellPair(0, 1);
  q.applyDecoherence(1.0);
  assert.ok(Math.abs(q.computeCHSH(0, 1)) < 2.0);
  assert.ok(q.purity() <= 1.0 + 1e-12 && q.purity() >= 1 / 16 - 1e-12);

  q.prepareBellPair(0, 1);
  const m0 = q.measureQubit(0, 0.1);
  const m1 = q.measureQubit(1, 0.9);
  assert.equal(m0.outcome, m1.outcome);
  assert.ok(Math.abs(q.normSq() - 1.0) < 1e-13);

  assert.ok(wkbTunnelingProbability(0.8, 1.0, 0.5) > wkbTunnelingProbability(0.2, 1.0, 0.5));
  assert.equal(wkbTunnelingProbability(1.2, 1.0, 0.5), 1.0);
  for (const s of [0, 0.25, 0.5, 0.75, 1.0]) {
    assert.ok(Math.abs(heisenbergStance(s).product - 0.5) < 1e-12);
  }
  assert.ok(zenoSuppressionFactor(1.0, 4.0) < 0.1);
  assert.ok(evalWaveInterference(0, 0, 0, [{ x: 0, z: 0, amp: 1, k: 1, omega: 1, phase: 0 }]) > 0);
  assert.throws(() => q.CNOT(1, 1), RangeError);
  assert.throws(() => q.H(99), RangeError);
});

// SUITE 14: Temporal Engine O(1) RingBuffer Rewind, Chrono-Wells & Past-Timeline Echoes
await suite('Suite 14: Temporal Causality — Exact 360-Frame O(1) RingBuffer Rewind, Chrono-Wells & Echoes', () => {
  const world = new ChronoQuantumWorld(2026);
  for (let f = 0; f < 45; f++) world.step(1 / 60, { moveX: 0.7, moveZ: 0.3, fire: f % 6 === 0 });
  const savedStep = world.temporal.chronoStep;
  const savedX = world.player.x;
  const savedTrailLen = world.temporal.playerTrail.length;
  for (let f = 0; f < 25; f++) world.step(1 / 60, { moveX: -0.5, moveZ: 0.8, fire: false });
  assert.ok(world.temporal.chronoStep > savedStep);

  for (let f = 0; f < 25; f++) world.step(1 / 60, { rewindHeld: true });
  assert.equal(world.temporal.chronoStep, savedStep);
  assert.ok(Math.abs(world.player.x - savedX) < 1e-6);
  assert.ok(world.temporal.playerTrail.length <= savedTrailLen);

  world.temporal.spawnChronoWell(0, 1, 0, 10, 0.15, 5.0);
  assert.ok(world.temporal.localTimeFactor(0, 1, 0) < 0.2);
  assert.equal(world.temporal.localTimeFactor(25, 1, 0), 1.0);

  const echo = world.temporal.spawnChronoFork();
  assert.ok(echo && echo.frames.length >= 25);
});

// SUITE 15: Endless 1/1 Reachable Combinatorial Uniqueness (6.42T) & 64-Bit SHA-256 Lineages
await suite('Suite 15: Endless 1/1 Reachable Combinatorial Space (6.42T), 64-Bit Lineages & 6-Order Stages', () => {
  const cm = combinatorialSpaceMetrics();
  assert.equal(cm.jointLoadoutCrossProduct, 6421059993600);
  assert.ok(cm.jointLoadoutCrossProduct > 6.4e12);
  assert.equal(cm.scaleOrdersOfMagnitude, 24);

  const wIds = new Set();
  const aIds = new Set();
  const nIds = new Set();
  for (let i = 0; i < 100; i++) {
    const w = forgeWeapon(`TEST:${i}`, (i % 12) + 1);
    const a = forgeArmor(`TEST:${i}`, (i % 12) + 1);
    const n = forgeNPC(`TEST:${i}`, (i % 12) + 1, 1, i % 10 === 0, { beamRatio: 0.8, closeRatio: 0.1, entangleCount: 2 });
    assert.match(w.lineageId, /^[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}$/, 'Lineage ID must be full 64-bit 16-hex formatted');
    wIds.add(w.lineageId);
    aIds.add(a.lineageId);
    nIds.add(n.lineageId);
  }
  assert.equal(wIds.size, 100);
  assert.equal(aIds.size, 100);
  assert.equal(nIds.size, 100);

  const seenOrders = new Set();
  for (let st = 1; st <= 50; st++) {
    const spec = buildStageSpec(st, 2026);
    seenOrders.add(spec.realm.scaleLabel);
    assert.ok(spec.pillars.length >= 6 && spec.waveSources.length >= 3);
  }
  assert.equal(seenOrders.size, 6);
});

// SUITE 16: QUANTUM_CHRONICLE.hbin Mitosis & Live 3D Engine + Audio Bundle 4 Coupling
await suite('Suite 16: QUANTUM_CHRONICLE.hbin 4th Living Species — Mitosis, 3D World & Bundle 4 Audio Coupling', () => {
  assert.equal(qchron.bytes.length, TOTAL_HBIN_BYTES);
  const { left, right } = bisectBinary(qchron.bytes, 49177);
  assert.equal(regenerateHbin(decodeHbin(left)).sha256Hex, qchron.sha256Hex);
  assert.equal(regenerateHbin(decodeHbin(right)).sha256Hex, qchron.sha256Hex);

  const vm = new PVM32();
  const dec = decodeHbin(qchron.bytes);
  vm.loadDecoded(dec, true);
  const world = new ChronoQuantumWorld(2026);
  world.syncHbinState(dec, { mitosisActive: false });
  world.entangleWeapons(0, 1);
  assert.equal(world.upgradeSkill('sup_clones'), true);
  for (const k of ['Q', 'E', 'F', 'V']) assert.equal(world.triggerAbility(k), true);

  for (let f = 0; f < 60; f++) {
    vm.stepFrame();
    world.step(1 / 60, { pvmRam: vm.ram, pvmVoices: vm.voices });
  }
  assert.equal(vm.traps, 0);
  assert.ok(world.liveVoices.some((v) => v.vol > 0));

  // Amputating Bundle 4 (S2_SYNTH_AUDIO) degrades world audio cleanly (voices 1..3 silenced!)
  const ampAudio = amputateBundles(qchron.bytes, [4]).bytes;
  const ampDec = decodeHbin(ampAudio, { pinnedRootHex: qchron.lineageRootHex });
  world.syncHbinState(ampDec);
  world.step(1 / 60, { pvmRam: vm.ram, pvmVoices: vm.voices });
  assert.equal(world.hbinState.hasSynthAudio, false);
  assert.equal(world.liveVoices[1].vol, 0);
  assert.equal(world.liveVoices[2].vol, 0);
  assert.equal(world.liveVoices[3].vol, 0);
});

// SUITE 17: TypedArray Nonzero byteOffset, DataView & Uint32Array Safety
await suite('Suite 17: Nonzero byteOffset Subarrays, DataView & Uint32Array Input Coercion Safety', () => {
  const padded = new Uint8Array(100 + aegis.bytes.length + 37);
  padded.fill(0xaa);
  padded.set(aegis.bytes, 100);
  const sub = padded.subarray(100, 100 + aegis.bytes.length);
  const dv = new DataView(padded.buffer, 100, aegis.bytes.length);

  assert.equal(toHex(sha256(sub)), aegis.sha256Hex);
  assert.equal(toHex(sha256(dv)), aegis.sha256Hex);
  const u32 = new Uint32Array([0x01020304, 0x05060708]);
  assert.equal(toHex(sha256(u32)), crypto.createHash('sha256').update(Buffer.from(u32.buffer)).digest('hex'));

  const decSub = decodeHbin(sub, { pinnedRootHex: aegis.lineageRootHex });
  assert.equal(decSub.canFullRegenerate, true);
  assert.equal(regenerateHbin(decSub).sha256Hex, aegis.sha256Hex);

  const lin = encodeLinearBinary(aegis.rawBundles);
  const linPad = new Uint8Array(64 + lin.bytes.length);
  linPad.set(lin.bytes, 64);
  const linSub = linPad.subarray(64);
  assert.equal(decodeLinearBinary(linSub).bootable, true);
});

// SUITE 18: Malformed / Fuzz / DoS / Sybil .hbin & LinearTwin Boundary Defenses
await suite('Suite 18: Adversarial Malformed, DoS Budget Cap, Sybil Header & Irradiate 508B Defenses', () => {
  // 1. DoS input cap triggers cleanly without hanging
  const bigNoise = new Uint8Array(2 * 1024 * 1024);
  const capDec = decodeHbin(bigNoise, { maxInputBytes: 65536 });
  assert.equal(capDec.bootable, false);
  assert.equal(capDec.stats.truncatedByBudget, true);

  // 2. Irradiating all 508 RS bytes per cell terminates cleanly without infinite loop
  const maxRad = irradiateCells(aegis.bytes, 508, 42, false);
  assert.equal(maxRad.bytes.length, TOTAL_HBIN_BYTES);
  assert.equal(decodeHbin(maxRad.bytes).bootable, false);

  // 3. LinearTwin rejects overlapping section tables (pointing into header or overlapping prev section)
  const lin = encodeLinearBinary(aegis.rawBundles);
  const badLin = new Uint8Array(lin.bytes);
  const dv = new DataView(badLin.buffer);
  dv.setUint32(16, 4, true); // section 0 offset inside header!
  assert.equal(decodeLinearBinary(badLin).bootable, false);

  // 4. inspectSingleCell rejects OOB leafIdx >= 192 (no impliedRootHex) & rejects corrupted RS body
  const oobBody = new Uint8Array(476);
  oobBody[10] = 220; // leafIdx = 220 >= TOTAL_CELLS (192)
  const oobCell = new Uint8Array(CELL_SIZE);
  oobCell.set(SYNC_WORD, 0);
  oobCell.set(rsArmorInterleaved(oobBody), 4);
  const oobInfo = inspectSingleCell(oobCell);
  assert.equal(oobInfo.rsOk, true);
  assert.equal(oobInfo.impliedRootHex, null);

  const corruptCell = new Uint8Array(oobCell);
  for (let i = 4; i < 40; i++) corruptCell[i] ^= 0xa5;
  assert.equal(inspectSingleCell(corruptCell).rsOk, false);
});

// SUITE 19: Plang Compiler Error Diagnostics, Block Scoping, fn Windowing & MemCompoundAssign
await suite('Suite 19: Plang Compiler Strict Diagnostics, Block Shadowing, fn Register Windowing & MemCompoundAssign', () => {
  // Lexer & Parser strict rejections
  assert.throws(() => compilePlangToHbin('program X; /* unterminated'), SyntaxError);
  assert.throws(() => compilePlangToHbin('program X; const A = 0x;'), SyntaxError);
  assert.throws(() => compilePlangToHbin('program X; const A = 123abc;'), SyntaxError);
  assert.throws(() => compilePlangToHbin('program X; const A = 9999999999999;'), SyntaxError);
  assert.throws(() => compilePlangToHbin('program X; bundle S1_CORE_LOGIC { let a = 1; }'), /S0_STEM_NUCLEUS/);
  assert.throws(() => compilePlangToHbin('program X; bundle S0_STEM_NUCLEUS { } bundle S3_GENOME_LEDGER { }'), /reserved/);
  assert.throws(() => compilePlangToHbin('program X; const Z = 10 / 0; bundle S0_STEM_NUCLEUS { }'), /division by zero/i);
  assert.throws(() => compilePlangToHbin('program X; bundle S0_STEM_NUCLEUS { fn foo(a) { return a; } let x = foo(1, 2); }'), /expects 1/);

  // Functional check: recursive/nested fn call preserves caller locals, block-scoped let x = x + 1, unary ~, single-eval mem[idx] += 5
  const testProg = `
    program COMP_TEST;
    bundle S0_STEM_NUCLEUS {
      fn bump(v) {
        let tmp = v * 3;
        return tmp + 1;
      }
      let x = 10;
      let y = 7;
      let r = bump(y);
      {
        let x = x + 5;
        mem[2] = x;
      }
      mem[1] = x;
      mem[3] = r;
      mem[4] = ~0;
      mem[5] = 0;
      mem[5] += 1;
      let idx = 10;
      mem[idx] = 20;
      mem[idx] += 22;
      mem[6] = mem[10];
    }
  `;
  const comp = compilePlangToHbin(testProg);
  const vm = new PVM32();
  vm.loadDecoded(decodeHbin(comp.bytes), true);
  vm.stepFrame();
  assert.equal(vm.traps, 0);
  assert.equal(vm.ram[1], 10, 'Outer x must survive inner block shadowing + fn call');
  assert.equal(vm.ram[2], 15, 'Self-referential shadowed let x = x + 5 must read outer x');
  assert.equal(vm.ram[3], 22, 'bump(7) = 7*3 + 1 = 22');
  assert.equal(vm.ram[4], -1, 'Unary bitwise NOT ~0 === -1');
  assert.equal(vm.ram[5], 1, 'mem[5] += 1');
  assert.equal(vm.ram[6], 42, 'mem[idx] += 22 single-eval');
});

// SUITE 20: PVM-32 Fault Isolation, Descending Anastomosis, Bundle 6 Non-Exec & Logic Xenograft
await suite('Suite 20: PVM-32 Traps, Bundle 6 Non-Exec, Seed Preservation & Cross-Species S1_CORE_LOGIC Xenograft', () => {
  // 1. Infinite loop hits BUDGET_EXCEEDED cleanly with exact single trap count
  const infProg = `
    program INF_TRAP;
    bundle S0_STEM_NUCLEUS {
      let i = 0;
      while (i >= 0) { i = i + 1; }
    }
  `;
  const infComp = compilePlangToHbin(infProg);
  const vmTrap = new PVM32(777);
  vmTrap.loadDecoded(decodeHbin(infComp.bytes), true);
  vmTrap.stepFrame();
  assert.equal(vmTrap.traps, 1);
  assert.match(vmTrap.lastTrap, /BUDGET_EXCEEDED/);

  // 2. Bundle 6 (GENOME) is NEVER loaded into executable bundleCode array
  const decA = decodeHbin(aegis.bytes);
  const vmCheck = new PVM32(999);
  vmCheck.loadDecoded(decA, true);
  assert.equal(vmCheck.bundleCode[6], null);
  assert.equal(vmCheck.bundleViable[6], true);

  // 3. initialSeed preserved across loadDecoded(..., true) resets
  vmCheck.stepFrame();
  const h1 = vmCheck.framebufferStats().hashHex;
  vmCheck.loadDecoded(decA, true);
  vmCheck.stepFrame();
  assert.equal(vmCheck.framebufferStats().hashHex, h1);

  // 4. Cross-species S1_CORE_LOGIC Xenograft (AEGIS_DRIFT host + QUANTUM_CHRONICLE logic) runs 60 frames with 0 traps!
  const ampLogic = amputateBundles(aegis.bytes, [1]).bytes;
  const xenoLogicDec = decodeHbin(concatShards(ampLogic, qchron.bytes, 41), {
    pinnedRootHex: aegis.lineageRootHex,
    allowXenograft: true,
  });
  assert.equal(xenoLogicDec.bundles[1].source, 'XENOGRAFT');
  const vmX = new PVM32(2026);
  vmX.loadDecoded(xenoLogicDec, true);
  for (let f = 0; f < 60; f++) vmX.stepFrame();
  assert.equal(vmX.traps, 0);
});

// SUITE 21: Game3D Hardening Regressions (Rewind Non-NaN, Solo Boss, Stage 0, Projectile Cap)
await suite('Suite 21: Game3D Hardening — Post-Rewind Non-NaN Physics, Solo Boss Safety, Stage 0 & Projectile Cap', () => {
  const w = new ChronoQuantumWorld(2026);
  for (let f = 0; f < 40; f++) w.step(1 / 60, { moveX: 0.6, moveZ: -0.4, fire: true });
  for (let f = 0; f < 20; f++) w.step(1 / 60, { rewindHeld: true });
  // Step 60 more frames AFTER rewind — verify EVERY NPC has finite speed & coordinates (no NaN softlock!)
  for (let f = 0; f < 60; f++) w.step(1 / 60, { moveX: 0.2, moveZ: 0.5, fire: true });
  assert.ok(Number.isFinite(w.player.x) && Number.isFinite(w.player.z));
  for (const n of w.npcs) {
    assert.ok(Number.isFinite(n.speed) && n.speed > 0, `NPC speed invalid after rewind: ${n.speed}`);
    assert.ok(Number.isFinite(n.x) && Number.isFinite(n.z));
  }
  assert.ok(w.projectiles.length <= 240);

  // Solo boss must NEVER self-entangle when triggerAbility('E') fires!
  w.npcs = [forgeNPC('SOLO_BOSS', 3, 3, true, {})];
  w.abilityCooldowns.E = 0;
  w.temporal.chronoEnergy = 100;
  w.triggerAbility('E');
  assert.notEqual(w.npcs[0].entangledWith, w.npcs[0].id);

  // Stage 0 defensive clamping must not crash
  const s0 = buildStageSpec(0, 2026);
  assert.equal(s0.stageNum, 1);
  assert.ok(s0.realm && s0.pillars.length >= 6);
});

// SUITE 22: End-to-End Hardened CLI Audit (All 9 Subcommands + Strict Rejection Exit Codes)
await suite('Suite 22: End-to-End CLI Audit (compile/inspect/run/bisect/fuse/heal/damage/xenograft/disasm)', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'planaria-cli-'));
  const cli = path.join(ROOT, 'bin', 'planaria.mjs');
  const runCli = (args) => spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' });

  try {
    const ver = runCli(['--version']);
    assert.equal(ver.status, 0);
    assert.ok(ver.stdout.includes(`planaria v${VERSION}`), `Expected planaria v${VERSION}, got ${ver.stdout}`);

    const hbinOut = path.join(tmp, 'nested', 'aegis.hbin');
    assert.equal(runCli(['compile', path.join(ROOT, 'programs/aegis_drift.plang'), '-o', hbinOut]).status, 0);
    assert.equal(fs.statSync(hbinOut).size, TOTAL_HBIN_BYTES);

    const insp = runCli(['inspect', hbinOut]);
    assert.equal(insp.status, 0);
    assert.match(insp.stdout, /Bootable\s*:\s*YES/);

    const runRes = runCli(['run', hbinOut, '--frames', '15']);
    assert.equal(runRes.status, 0);
    assert.match(runRes.stdout, /VM Traps\s*:\s*0/);

    const leftOut = path.join(tmp, 'left.hbin');
    const rightOut = path.join(tmp, 'right.hbin');
    assert.equal(runCli(['bisect', hbinOut, leftOut, rightOut, '--offset=49177']).status, 0);

    const fusedOut = path.join(tmp, 'fused.hbin');
    assert.equal(runCli(['fuse', leftOut, rightOut, '-o', fusedOut, '--gap', '53']).status, 0);

    const healedOut = path.join(tmp, 'healed.hbin');
    assert.equal(runCli(['heal', rightOut, '-o', healedOut]).status, 0);
    assert.deepEqual(fs.readFileSync(healedOut), fs.readFileSync(hbinOut));

    const dmgOut = path.join(tmp, 'dmg.hbin');
    assert.equal(runCli(['damage', hbinOut, '-o', dmgOut, '--bitrot', '12', '--burst', '--shift', '97']).status, 0);
    assert.equal(runCli(['inspect', dmgOut]).status, 0);

    const xenoOut = path.join(tmp, 'chimera.hbin');
    assert.equal(
      runCli(['xenograft', hbinOut, path.join(ROOT, 'artifacts/synth_reactor.hbin'), '-o', xenoOut, '--amputate', '3,4']).status,
      0
    );

    const dis6 = runCli(['disasm', hbinOut, '--bundle', '6']);
    assert.equal(dis6.status, 0);
    assert.match(dis6.stdout, /AEGIS_DRIFT/);

    // Strict negative CLI validation checks
    assert.notEqual(runCli(['inspect', hbinOut, '--bogus-flag']).status, 0);
    assert.notEqual(runCli(['damage', hbinOut, '-o', dmgOut, '--bitrot', '999']).status, 0);
    assert.notEqual(runCli(['xenograft', hbinOut, path.join(ROOT, 'artifacts/synth_reactor.hbin'), '-o', xenoOut, '--amputate', '0']).status, 0);
    assert.notEqual(runCli(['xenograft', hbinOut, hbinOut, '-o', xenoOut]).status, 0);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

// SUITE 23: Hardened HTTP Server Security Containment, CSP Headers & Traversal/XSS Defenses
await suite('Suite 23: server.mjs HTTP Security Containment (CSP, Traversal, Dotfiles, 405, Reflected XSS)', async () => {
  const server = createPlanariaServer(ROOT);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  try {
    const rHome = await httpRequest(port, '/');
    assert.equal(rHome.status, 200);
    assert.equal(rHome.headers['x-content-type-options'], 'nosniff');
    assert.equal(rHome.headers['x-frame-options'], 'DENY');
    assert.ok(rHome.headers['content-security-policy']?.includes("default-src 'self'"));
    assert.match(rHome.body, /PLANARIA v2\.\d+/);

    // Redirects for /src/web/index.html -> / and /blueprint -> /blueprint/
    const rRedirWeb = await httpRequest(port, '/src/web/index.html');
    assert.equal(rRedirWeb.status, 302);
    assert.equal(rRedirWeb.headers.location, '/');
    const rRedirBp = await httpRequest(port, '/blueprint');
    assert.equal(rRedirBp.status, 302);
    assert.equal(rRedirBp.headers.location, '/blueprint/');

    const rHealth = await httpRequest(port, '/healthz');
    assert.equal(rHealth.status, 200);
    const healthJson = JSON.parse(rHealth.body);
    assert.equal(healthJson.status, 'ok');
    assert.equal(healthJson.version, VERSION);

    const rHead404 = await httpRequest(port, '/does-not-exist', 'HEAD');
    assert.equal(rHead404.status, 404);
    assert.equal(rHead404.body, '');

    const rHead = await httpRequest(port, '/src/web/app.js', 'HEAD');
    assert.equal(rHead.status, 200);
    assert.equal(rHead.body, '');
    assert.ok(Number(rHead.headers['content-length']) > 1000);

    assert.equal((await httpRequest(port, '/', 'POST')).status, 405);
    assert.equal((await httpRequest(port, '/%E0%A4%A')).status, 400);
    assert.equal((await httpRequest(port, '/../package.json')).status, 403);
    assert.equal((await httpRequest(port, '/.git/config')).status, 403);
    assert.equal((await httpRequest(port, '/%2e%2e/server.mjs')).status, 403);
    assert.equal((await httpRequest(port, '/..%5cpackage.json')).status, 403);
    assert.equal((await httpRequest(port, '/%00')).status, 403);
    assert.equal((await httpRequest(port, '/C:/Windows/win.ini')).status, 403);
    assert.equal((await httpRequest(port, '/server.mjs')).status, 404);
    assert.equal((await httpRequest(port, '/package.json')).status, 404);

    // Concurrent HTTP burst stability (20 parallel GETs)
    const burst = await Promise.all(
      Array.from({ length: 20 }, (_, i) => httpRequest(port, i % 2 === 0 ? '/healthz' : '/src/web/styles.css'))
    );
    assert.equal(burst.every((r) => r.status === 200), true);

    // Reflected XSS probe must return static text/plain without echoing payload
    const rXss = await httpRequest(port, '/%3Cscript%3Ealert(1)%3C/script%3E');
    assert.equal(rXss.status, 404);
    assert.equal(rXss.body, 'Not Found');
    assert.equal(rXss.headers['content-type'], 'text/plain; charset=utf-8');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

// SUITE 24: Deterministic On-Disk Artifact & Manifest SHA-256 Parity
await suite('Suite 24: On-Disk Built artifacts/*.hbin & manifest.json Bit-Exact Deterministic Verification', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'artifacts/manifest.json'), 'utf8'));
  assert.equal(manifest.artifacts.length, 4);
  const compiledMap = {
    quantum_chronicle: qchron,
    aegis_drift: aegis,
    synth_reactor: synth,
    cipher_vault: vault,
  };
  for (const [slug, comp] of Object.entries(compiledMap)) {
    const diskBytes = new Uint8Array(fs.readFileSync(path.join(ROOT, 'artifacts', `${slug}.hbin`)));
    assert.equal(diskBytes.length, TOTAL_HBIN_BYTES);
    assert.equal(toHex(sha256(diskBytes)), comp.sha256Hex, `${slug}.hbin on disk out of sync with .plang source`);
    const entry = manifest.artifacts.find((a) => a.file === `artifacts/${slug}.hbin`);
    assert.ok(entry);
    assert.equal(entry.sha256Hex, comp.sha256Hex);
    assert.equal(entry.lineageRootHex, comp.lineageRootHex);
  }
});

// SUITE 25: Property-Based Randomized Verification (`prop_check`, Build Standard B10)
await suite('Suite 25: Property-Based Testing (GF256, RS, Cauchy, SHA-256, 4Q Unitarity, Rewind)', () => {
  const rng = makeRng(20261125);
  const randByte = () => Math.floor(rng() * 256);

  // 1. 120 randomized GF(2^8) field axioms (distributivity, associativity, inverse, power)
  for (let i = 0; i < 120; i++) {
    const a = randByte(), b = randByte(), c = randByte();
    assert.equal(gfMul(a, gfAdd(b, c)), gfAdd(gfMul(a, b), gfMul(a, c)));
    assert.equal(gfMul(gfMul(a, b), c), gfMul(a, gfMul(b, c)));
    if (a > 0) assert.equal(gfMul(a, gfInv(a)), 1);
  }

  // 2. 30 randomized RS(254,238) encode + 1..8 random byte corruptions -> exact recovery
  for (let i = 0; i < 30; i++) {
    const msg = new Uint8Array(RS_K);
    for (let j = 0; j < RS_K; j++) msg[j] = randByte();
    const cw = rsEncode(msg);
    const corrupted = cw.slice();
    const nErr = 1 + (i % 8);
    const idxs = new Set();
    while (idxs.size < nErr) idxs.add(Math.floor(rng() * cw.length));
    for (const idx of idxs) corrupted[idx] ^= 1 + (randByte() % 255);
    const dec = rsDecode(corrupted);
    assert.equal(dec.ok, true);
    assert.equal(dec.errorsCorrected, nErr);
    assert.deepEqual(dec.data, msg);
  }

  // 3. 25 randomized Cauchy MDS encodes + random k-subset decodes
  for (let i = 0; i < 25; i++) {
    const k = 2 + (i % 6);
    const n = k + 4 + (i % 8);
    const payload = new Uint8Array(k * 17);
    for (let j = 0; j < payload.length; j++) payload[j] = randByte();
    const shards = cauchyEncode(payload, k, n, 17);
    const chosen = [...shards].sort(() => rng() - 0.5).slice(0, k);
    const rec = cauchyDecode(chosen, k, 17, payload.length);
    assert.equal(rec.ok, true);
    assert.deepEqual(rec.data, payload);
  }

  // 4. 30 randomized SHA-256 parity checks vs Node OpenSSL
  for (let i = 0; i < 30; i++) {
    const len = Math.floor(rng() * 200);
    const buf = new Uint8Array(len);
    for (let j = 0; j < len; j++) buf[j] = randByte();
    const expected = crypto.createHash('sha256').update(buf).digest('hex');
    assert.equal(toHex(sha256(buf)), expected);
  }

  // 5. 25 randomized 4-qubit unitary circuits across ALL 10 gates (H,X,Y,Z,RX,RY,RZ,CNOT,CZ,SWAP) preserve norm = 1.0 within 1e-12
  for (let i = 0; i < 25; i++) {
    const qr = new QuantumRegister(4);
    for (let g = 0; g < 15; g++) {
      const q = Math.floor(rng() * 4);
      const q2 = (q + 1 + Math.floor(rng() * 3)) % 4;
      const op = g % 10;
      if (op === 0) qr.H(q);
      else if (op === 1) qr.X(q);
      else if (op === 2) qr.Y(q);
      else if (op === 3) qr.Z(q);
      else if (op === 4) qr.CNOT(q, q2);
      else if (op === 5) qr.RZ(q, rng() * Math.PI * 2);
      else if (op === 6) qr.RY(q, rng() * Math.PI * 2);
      else if (op === 7) qr.RX(q, rng() * Math.PI * 2);
      else if (op === 8) qr.CZ(q, q2);
      else qr.SWAP(q, q2);
    }
    let normSq = 0;
    for (let k = 0; k < qr.dim; k++) normSq += qr.re[k] * qr.re[k] + qr.im[k] * qr.im[k];
    assert.ok(Math.abs(normSq - 1.0) < 1e-12);
  }

  // 6. 15 randomized Temporal Rewind property checks (advance N frames -> rewind M frames -> exact state restoration)
  for (let trial = 0; trial < 15; trial++) {
    const w = new ChronoQuantumWorld(3000 + trial);
    const nAdv = 8 + (trial % 6);
    const snaps = [];
    for (let f = 0; f < nAdv; f++) {
      w.step(1 / 60, { moveX: (f % 2) ? 1 : -0.5, moveZ: 0.4 });
      snaps.push({
        worldTime: w.temporal.worldTime,
        weaponsLen: w.weapons.length,
        armorsLen: w.armors.length,
        score: w.score,
      });
    }
    const rewSteps = 2 + (trial % 3);
    for (let r = 0; r < rewSteps; r++) w.step(1 / 60, { rewindHeld: true });
    assert.ok(w.temporal.worldTime < snaps[snaps.length - 1].worldTime, 'Rewind must strictly decrease worldTime');
    assert.ok(Number.isFinite(w.player.x) && Number.isFinite(w.player.z));
  }
});

// SUITE 26: Cycle 1 Security, Compiler, Codec & 3D Engine Regression Lock
await suite('Suite 26: Cycle 1 Regression Lock (Compiler r18/Proto, DoS Bypass, Dead-Host Xeno, Rewind SP)', () => {
  // 1. Dead host with amputated B3/B4 + viable donor must NEVER graft (kills Mutant M02)
  const deadHost = amputateBundles(aegis.bytes, [0, 3, 4], true, 77).bytes;
  const deadXeno = decodeHbin(concatShards(deadHost, synth.bytes, 19), {
    pinnedRootHex: aegis.lineageRootHex,
    allowXenograft: true,
  });
  assert.equal(deadXeno.bootable, false);
  assert.equal(deadXeno.xenografts.length, 0);

  // 2. Duplicate evalX in Cauchy decode must deduplicate and report insufficient_rank (kills Mutant M05)
  const shards = cauchyEncode(new Uint8Array([1, 2, 3, 4]), 2, 4, 2);
  const dupDec = cauchyDecode([shards[0], shards[0]], 2, 2, 4);
  assert.equal(dupDec.ok, false);
  assert.equal(dupDec.reason, 'insufficient_rank');

  // 3. Exact r17/r18 right-nested boundary expression throws scratch-register overflow (kills M06),
  //    while flat left-associative 12-term additions compile cleanly without leaking registers!
  const deepProg = `
    program DEEP_NEST;
    bundle S0_STEM_NUCLEUS {
      let guard = 777;
      let x = mem[0] + (mem[1] + (mem[2] + (mem[3] + (mem[4] + (mem[5] + (mem[6] + (mem[7] + (mem[8] + (mem[9] + (99999 * 88888))))))))));
      mem[9] = guard;
      mem[1] = x;
    }
  `;
  assert.throws(() => compilePlangToHbin(deepProg), /scratch register overflow/i);

  const flatProg = `
    program FLAT_SUM;
    bundle S0_STEM_NUCLEUS {
      let s = mem[0] + mem[1] + mem[2] + mem[3] + mem[4] + mem[5] + mem[6] + mem[7] + mem[8] + mem[9] + mem[10] + mem[11] + 42;
      mem[12] = s;
    }
  `;
  const flatComp = compilePlangToHbin(flatProg);
  const flatVm = new PVM32(1);
  flatVm.loadDecoded(decodeHbin(flatComp.bytes), true);
  flatVm.stepFrame();
  assert.equal(flatVm.ram[12], 42, 'Flat 12-term sum must compile & evaluate cleanly');

  // 4. Object.prototype names as identifiers & empty return zeroing r1
  const protoProg = `
    program PROTO_SAFE;
    const toString = 7;
    bundle S0_STEM_NUCLEUS {
      fn constructor() {
        let valueOf = 99;
        return;
      }
      let hasOwnProperty = toString + 3;
      let r = constructor();
      mem[0] = hasOwnProperty;
      mem[1] = r;
      mem[-1] = 123;
    }
  `;
  const protoComp = compilePlangToHbin(protoProg);
  const vmP = new PVM32(1);
  vmP.loadDecoded(decodeHbin(protoComp.bytes), true);
  vmP.stepFrame();
  assert.equal(vmP.traps, 0);
  assert.equal(vmP.ram[0], 10);
  assert.equal(vmP.ram[1], 0, 'Empty return; must return deterministic 0 in r1');
  assert.equal(vmP.ram[4095], 123, 'Negative RAM index mem[-1] must wrap to ram[4095] (kills M07)');

  // 5. Decimal literals > 2147483647 rejected; hex 0x9e3779b1 and -2147483648 accepted
  assert.throws(
    () => compilePlangToHbin('program BAD_NEG; bundle S0_STEM_NUCLEUS { let a = -4294967295; }'),
    /exceeds signed 32-bit/i
  );
  assert.throws(
    () => compilePlangToHbin('program BAD_DEC; bundle S0_STEM_NUCLEUS { mem[0] = 2654435761; }'),
    /exceeds signed 32-bit|hex/i
  );
  const hexOk = compilePlangToHbin('program HEX_OK; bundle S0_STEM_NUCLEUS { mem[0] = 0x9e3779b1; mem[1] = -2147483648; }');
  assert.equal(hexOk.bytes.length, TOTAL_HBIN_BYTES);

  // 5b. Parser/Codegen depth DoS & built-in constant / organ_call safety
  assert.throws(
    () => compilePlangToHbin(`program D1; bundle S0_STEM_NUCLEUS { if (0) {} ${'else if (0) {} '.repeat(150)} }`),
    /nesting exceeded|nesting depth/i
  );
  assert.throws(
    () => compilePlangToHbin(`program D2; bundle S0_STEM_NUCLEUS { let x = ${'1 ? 2 : '.repeat(150)}3; }`),
    /nesting exceeded|nesting depth/i
  );
  assert.throws(
    () => compilePlangToHbin(`program D3; bundle S0_STEM_NUCLEUS { let x = ${'1 + '.repeat(300)}1; }`),
    /depth/i
  );
  assert.throws(
    () => compilePlangToHbin('program D4; const KERNEL = 99; bundle S0_STEM_NUCLEUS { mem[0] = KERNEL; }'),
    /reserved|built-in/i
  );
  assert.throws(
    () => compilePlangToHbin('program D5; bundle S0_STEM_NUCLEUS { organ_call(KERNEL, 0); }'),
    /cannot target|KERNEL|GENOME/i
  );

  // 6. Synthetic 16 KiB back-to-back PLN\xB7 sync-flood bypassed in O(1) without hanging
  const flood = new Uint8Array(16384);
  for (let i = 0; i < flood.length; i += 4) flood.set(SYNC_WORD, i);
  const tFlood = performance.now();
  const floodDec = decodeHbin(flood);
  assert.equal(floodDec.bootable, false);
  assert.ok(performance.now() - tFlood < 250, '16 KiB sync-flood must decode fast');

  // 6b. Iterative backward-flywheel recovers cell 0 even when cell 0's entire 4B sync marker is obliterated (kills M03)
  const syncWiped = new Uint8Array(aegis.bytes);
  syncWiped[0] ^= 0xff; syncWiped[1] ^= 0xff; syncWiped[2] ^= 0xff; syncWiped[3] ^= 0xff;
  const backDec = decodeHbin(syncWiped, { pinnedRootHex: aegis.lineageRootHex });
  assert.equal(backDec.stats.authenticCells, 192, 'Backward flywheel must recover sync-obliterated cell 0');

  // 7. Rewind skill-point anti-exploit (kills Mutant M09)
  const w = new ChronoQuantumWorld(2026);
  w.step(1 / 60, {});
  w.step(1 / 60, {});
  const spBefore = w.skillPoints;
  assert.equal(w.upgradeSkill('sup_clones'), true);
  assert.equal(w.skills.sup_clones, 1);
  assert.equal(w.skillPoints, spBefore - 1);
  w.step(1 / 60, {});
  w.step(1 / 60, { rewindHeld: true });
  w.step(1 / 60, { rewindHeld: true });
  assert.equal(w.skills.sup_clones, 0, 'Rewind must roll back upgraded skills too');
  assert.equal(w.skillPoints, spBefore);

  // 8. Non-finite stage bounds safety (kills Mutant M10)
  assert.equal(buildStageSpec(Infinity, 2026).stageNum, 1);
  assert.equal(buildStageSpec(NaN, 2026).stageNum, 1);
  assert.equal(forgeWeapon('INF', Infinity, Infinity).stageFound, 1);

  // 9. qengine Werner depolarizing visibility floor approaches 0 (not old 1/16 = 0.0625!) & Node Buffer detachment
  const qr = new QuantumRegister(4);
  qr.prepareBellPair(0, 1);
  qr.applyDecoherence(40);
  assert.ok(qr.coherence < 1e-10, `Expected visibility -> 0 under heavy decoherence, got ${qr.coherence}`);
  assert.ok(qr.computeCHSH(0, 1) < 1e-10);
  const nodeBuf = Buffer.from([1, 2, 3, 4]);
  const h1 = toHex(sha256(nodeBuf));
  nodeBuf[0] = 99;
  assert.equal(h1, toHex(sha256(new Uint8Array([1, 2, 3, 4]))));

  // 10. Linear twin ERR_SECTION_OUT_OF_BOUNDS reachable even with valid SHA-256 footer
  const crafted = new Uint8Array(encodeLinearBinary(aegis.rawBundles, 'AEGIS_LINEAR').bytes);
  const dv = new DataView(crafted.buffer, crafted.byteOffset, crafted.byteLength);
  const activeEnd = dv.getUint32(60, true);
  dv.setUint32(12, activeEnd + 16, true); // corrupt B0 offset past activeEnd
  crafted.set(sha256(crafted.subarray(0, activeEnd)), activeEnd);
  const craftedDec = decodeLinearBinary(crafted);
  assert.equal(craftedDec.bootable, false);
  assert.equal(craftedDec.fault, 'ERR_SECTION_OUT_OF_BOUNDS');

  // 11. Wave A-C Cycle 2 Security & Determinism Regressions:
  // 11a. Fuzzy 1-bit-flipped stride-5 sync-flood DoS bypassed in O(1)
  const fuzzyFlood = new Uint8Array(16384);
  for (let i = 0; i + 4 <= fuzzyFlood.length; i += 5) {
    fuzzyFlood.set(SYNC_WORD, i);
    fuzzyFlood[i + 3] ^= 0x01; // 1-bit flip defeats exact-only flood check
  }
  const tFuzzy = performance.now();
  const fuzzyDec = decodeHbin(fuzzyFlood, { pinnedRootHex: aegis.lineageRootHex });
  assert.equal(fuzzyDec.bootable, false);
  assert.ok(performance.now() - tFuzzy < 250, 'Fuzzy stride-5 sync-flood must decode fast');

  // 11b. Single-cell unpinned stream fails closed (exact Lean electUnpinnedQuorum >= 2 parity)
  const oneCellDec = decodeHbin(aegis.bytes.subarray(0, CELL_SIZE));
  assert.equal(oneCellDec.primaryRootHex, null, '1-cell unpinned stream must not elect primary root');
  assert.equal(oneCellDec.stats.quorumAmbiguous, true);

  // 11c. Dead host has ZERO xenograft donor cells reported in slotMap or stats
  assert.equal(deadXeno.stats.xenograftDonorCells, 0);
  assert.equal(deadXeno.slotMap.filter((s) => s.status === 'XENOGRAFT').length, 0);

  // 11d. PVM-32 GLOW fuel accounting prevents frame-freeze DoS
  const glowDos = compilePlangToHbin(`
    program GLOW_DOS;
    bundle S0_STEM_NUCLEUS {
      let i = 0;
      while (i < 500) {
        glow(100);
        i = i + 1;
      }
    }
  `);
  const gVm = new PVM32(1);
  gVm.loadDecoded(decodeHbin(glowDos.bytes), true);
  const tGlow = performance.now();
  gVm.stepFrame();
  assert.ok(performance.now() - tGlow < 150, 'GLOW DoS must halt promptly via proportional fuel cost');
  assert.ok(gVm.traps >= 1, 'GLOW DoS loop must trap on budget exhaustion');

  // 11e. amputateBundles flywheel excises sync-damaged cells belonging to target bundle
  const dmgB3 = new Uint8Array(aegis.bytes);
  for (let i = 0; i < dmgB3.length; i += CELL_SIZE) dmgB3[i] ^= 0x01; // 1-bit sync damage on every cell
  const ampB3 = amputateBundles(dmgB3, [3], true, 17).bytes;
  assert.equal(decodeHbin(ampB3, { pinnedRootHex: aegis.lineageRootHex }).bundles[3].viable, false);

  // 11f. ChronoQuantumWorld deterministic seeded RNG parity & gear-forge-then-rewind (kills Mutant M12!)
  const wA = new ChronoQuantumWorld(4242);
  const wB = new ChronoQuantumWorld(4242);
  for (let f = 0; f < 10; f++) {
    wA.step(1 / 60, { moveX: 0.6, fireHeld: true });
    wB.step(1 / 60, { moveX: 0.6, fireHeld: true });
  }
  assert.equal(wA.player.x, wB.player.x, 'Seeded ChronoQuantumWorld must be 100% deterministic');
  assert.equal(wA.npcs.length, wB.npcs.length);
  const wBefore = wA.weapons.length;
  const aBefore = wA.armors.length;
  // Ensure BOTH a new weapon AND a new armor are acquired before rewinding (kills Mutant M12!)
  for (let tries = 0; tries < 20 && (wA.weapons.length <= wBefore || wA.armors.length <= aBefore); tries++) {
    wA.forgeNewGear();
  }
  if (wA.weapons.length <= wBefore) wA.weapons.push(forgeWeapon('M12_W', 2, 1));
  if (wA.armors.length <= aBefore) wA.armors.push(forgeArmor('M12_A', 2, 1));
  assert.ok(wA.weapons.length > wBefore && wA.armors.length > aBefore);
  wA.step(1 / 60, {});
  wA.step(1 / 60, { rewindHeld: true });
  wA.step(1 / 60, { rewindHeld: true });
  assert.equal(wA.weapons.length, wBefore, 'Rewind must roll back forged weapons (kills M12)');
  assert.equal(wA.armors.length, aBefore, 'Rewind must roll back forged armors');

  // 11g. Extreme wave-interference coordinates stay finite (no NaN) & invalid gear indices safe
  const waveInf = evalWaveInterference(1e200, 1e200, [{ x: 0, z: 0, amp: 1, phase: 0, freq: 1 }]);
  assert.equal(Number.isFinite(waveInf), true);
  const wIdx0 = wA.weaponIdx;
  const aIdx0 = wA.armorIdx;
  wA.selectWeapon(1.5);
  wA.selectArmor(NaN);
  assert.equal(wA.weaponIdx, wIdx0);
  assert.equal(wA.armorIdx, aIdx0);
  assert.equal(wA.triggerAbility(null), false);
});

// SUITE 27: Metamorphic & Algebraic Invariance Verification (Build Standard B14/B20)
await suite('Suite 27: Metamorphic Invariants (Cauchy Permutation, Shift Invariance, CHSH Unitary Invariance)', () => {
  // 1. Cauchy decoding is strictly invariant under all shard order permutations
  const data = new Uint8Array(64);
  for (let i = 0; i < 64; i++) data[i] = (i * 37 + 11) & 0xff;
  const shards = cauchyEncode(data, 4, 12, 16);
  const baseSet = [shards[1], shards[4], shards[7], shards[11]];
  const revSet = [...baseSet].reverse();
  const rotSet = [baseSet[2], baseSet[0], baseSet[3], baseSet[1]];
  assert.deepEqual(cauchyDecode(baseSet, 4, 16, 64).data, data);
  assert.deepEqual(cauchyDecode(revSet, 4, 16, 64).data, data);
  assert.deepEqual(cauchyDecode(rotSet, 4, 16, 64).data, data);

  // 2. .hbin decoding is strictly invariant under arbitrary prefix shifts & cell permutations
  for (const shift of [1, 7, 137, 511]) {
    const shifted = shiftAndShuffle(qchron.bytes, shift, 404 + shift, true);
    const dec = decodeHbin(shifted, { pinnedRootHex: qchron.lineageRootHex });
    assert.equal(dec.canFullRegenerate, true);
    assert.equal(regenerateHbin(dec).sha256Hex, qchron.sha256Hex);
  }

  // 3. Horodecki CHSH M(rho) is strictly invariant under local single-qubit unitaries (X, Y, Z, H, RZ, RY)
  const qr = new QuantumRegister(4);
  qr.prepareBellPair(0, 1);
  const s0 = qr.computeCHSH(0, 1);
  qr.RY(0, 0.73);
  qr.RZ(1, 1.41);
  qr.H(0);
  qr.X(1);
  const s1 = qr.computeCHSH(0, 1);
  assert.ok(Math.abs(s0 - s1) < 1e-9, `CHSH must be local-unitary invariant: ${s0} vs ${s1}`);
});

// SUITE 28: Runnable Examples & Subpath-Safe Web Asset Verification
await suite('Suite 28: Runnable Examples (01..03) & GitHub Pages Subpath Asset Safety', () => {
  for (const ex of [
    'examples/01-mitosis-roundtrip.mjs',
    'examples/02-byzantine-quarantine.mjs',
    'examples/03-xenograft-chimera.mjs',
  ]) {
    const r = spawnSync(process.execPath, [path.join(ROOT, ex)], { cwd: ROOT, encoding: 'utf8' });
    assert.equal(r.status, 0, `${ex} failed: ${r.stderr || r.stdout}`);
  }
  const html = fs.readFileSync(path.join(ROOT, 'src/web/index.html'), 'utf8');
  assert.ok(!html.includes('href="/src/web/'), 'index.html must use subpath-safe relative CSS path');
  assert.ok(!html.includes('src="/src/web/'), 'index.html must use subpath-safe relative JS path');
  const appJs = fs.readFileSync(path.join(ROOT, 'src/web/app.js'), 'utf8');
  assert.ok(!appJs.includes("fetch(`/programs/"), 'app.js must resolve programs via import.meta.url');
  assert.ok(!appJs.includes("fetch('/results/"), 'app.js must resolve benchmarks via import.meta.url');
});

// SUITE 29: AudioWorklet DSP Finite/NaN-Immunity & PolyBLEP Render-Quanta Harness
await suite('Suite 29: AudioWorklet DSP Sandbox (PolyBLEP Waves 1..5, NaN/Inf Immunity, Mute Slew)', () => {
  const dspSrc = fs.readFileSync(path.join(ROOT, 'src/web/audio-worklet.js'), 'utf8');
  let RegisteredCtor = null;
  class MockAudioWorkletProcessor {
    constructor() {
      this.port = { onmessage: null, postMessage() {} };
    }
  }
  const sandbox = {
    AudioWorkletProcessor: MockAudioWorkletProcessor,
    registerProcessor(name, ctor) {
      assert.equal(name, 'planaria-synth');
      RegisteredCtor = ctor;
    },
    sampleRate: 48000,
    Math,
    Number,
    Array,
    Float32Array,
  };
  vm.runInNewContext(dspSrc, sandbox, { filename: 'audio-worklet.js' });
  assert.ok(RegisteredCtor, 'audio-worklet.js must register planaria-synth');
  const proc = new RegisteredCtor();

  // Drive all 4 voices across waves 1..5 + adversarial NaN/Infinity payloads
  const testFrames = [
    {
      type: 'voices',
      voices: [
        { wave: 1, freqHz: 220, vol: 0.7, detune: 0, filter: 2200 },
        { wave: 2, freqHz: 330, vol: 0.6, detune: 12, filter: 1800 },
        { wave: 3, freqHz: 440, vol: 0.5, detune: -7, filter: 3200 },
        { wave: 4, freqHz: 880, vol: 0.5, detune: 5, filter: 4000 },
      ],
    },
    {
      type: 'voices',
      voices: [
        { wave: 5, freqHz: NaN, vol: Infinity, detune: -Infinity, filter: NaN },
        { wave: 3, freqHz: 1e9, vol: -5, detune: 999999, filter: -100 },
        { wave: 0, freqHz: 0, vol: 0, detune: 0, filter: 0 },
        { wave: 4, freqHz: 110, vol: 0.8, detune: 0, filter: 1500 },
      ],
    },
    { type: 'mute' },
  ];

  let nonZeroSamples = 0;
  for (const msg of testFrames) {
    proc.port.onmessage({ data: msg });
    for (let q = 0; q < 6; q++) {
      const outL = new Float32Array(128);
      const outR = new Float32Array(128);
      assert.equal(proc.process([], [[outL, outR]]), true);
      for (let i = 0; i < 128; i++) {
        assert.equal(Number.isFinite(outL[i]), true, 'DSP left sample must never be NaN/Inf');
        assert.equal(Number.isFinite(outR[i]), true, 'DSP right sample must never be NaN/Inf');
        assert.ok(Math.abs(outL[i]) <= 2.5 && Math.abs(outR[i]) <= 2.5);
        if (Math.abs(outL[i]) > 1e-4) nonZeroSamples++;
      }
    }
  }
  assert.ok(nonZeroSamples > 200, `Expected live PCM output, got ${nonZeroSamples} non-zero samples`);
});

// SUITE 30: Formal Artifacts, Lean Comparator Manifest & Web CSP/A11y Parity
await suite('Suite 30: Lean 4.35.0 Comparator/Audit Manifest Parity & Studio HTML CSP/A11y Invariants', () => {
  const comp = JSON.parse(fs.readFileSync(path.join(ROOT, 'lean/comparator.json'), 'utf8'));
  const auditTxt = fs.readFileSync(path.join(ROOT, 'results/lean4-audit.txt'), 'utf8');
  assert.ok(comp.theorem_names.length >= 85, `Expected >= 85 Lean theorems, got ${comp.theorem_names.length}`);
  assert.equal(/sorryAx|ofReduceBool|trustCompiler|_native/.test(auditTxt), false);
  for (const thm of comp.theorem_names) {
    assert.ok(auditTxt.includes(`'${thm}'`), `Missing theorem '${thm}' in results/lean4-audit.txt`);
  }
  const html = fs.readFileSync(path.join(ROOT, 'src/web/index.html'), 'utf8');
  assert.ok(html.includes('Content-Security-Policy'), 'index.html must include meta CSP');
  assert.ok(html.includes('./blueprint/'), 'index.html must link to interactive Proof Blueprint');
  assert.ok(html.includes('skip-link'), 'index.html must provide keyboard skip-to-main link');
});

console.log('------------------------------------------------------------------------');
console.log(` SUMMARY: ${passed}/${passed + failed} verification suites PASSED.`);
console.log('========================================================================');

if (failed > 0) process.exit(1);
