/**
 * PLANARIA v2.2 Reproducible Experimental Benchmark & Cryptographic Attestation Suite
 *
 * Generates:
 *   1. results/benchmarks.json  — Empirical Survival Phase-Transition Curve (Linear vs
 *      Single-Stratum RS Cliff vs PLANARIA 4-Stratum), Radiation Burst Sweep (0..22B/cell),
 *      Byzantine Trojan Flood Audit (Immune ON vs OFF), Unaligned Mitosis Matrix, and
 *      Warm-JIT Compilation / Decode / PVM-32 Execution Latency Profiles.
 *   2. results/attestation.json — SHA-256 digest manifest + Ed25519 self-consistency seal
 *      (or persistent-key signature when PLANARIA_SIGNING_KEY_PEM is provided) covering
 *      code, programs, compiled .hbin artifacts, Lean 4 proofs, paper, and benchmark outputs.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { compilePlangToHbin } from '../src/compiler/compile.js';
import { decodeHbin, regenerateHbin, TOTAL_CELLS } from '../src/core/hbin.js';
import {
  bisectBinary,
  shredCells,
  irradiateCells,
  injectByzantineTrojans,
  amputateBundles,
  concatShards,
} from '../src/core/torture.js';
import { encodeLinearBinary, decodeLinearBinary } from '../src/vm/linear-twin.js';
import { PVM32 } from '../src/vm/pvm32.js';
import { sha256, toHex } from '../src/core/sha256.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const RESULTS_DIR = path.join(ROOT, 'results');
fs.mkdirSync(RESULTS_DIR, { recursive: true });
const ATTEST_ONLY = process.argv.includes('--attest-only');

let totalCompileMs = null;
let meanDecodeMs = null;
let meanFrameMs = null;
let mips = null;
let survivalCurve = [];

if (!ATTEST_ONLY) {
console.log('[BENCH] Compiling QUANTUM_CHRONICLE, AEGIS_DRIFT, SYNTH_REACTOR, CIPHER_VAULT...');
const tCompileStart = performance.now();
const qchron = compilePlangToHbin(fs.readFileSync(path.join(ROOT, 'programs/quantum_chronicle.plang'), 'utf8'));
const aegis = compilePlangToHbin(fs.readFileSync(path.join(ROOT, 'programs/aegis_drift.plang'), 'utf8'));
const synth = compilePlangToHbin(fs.readFileSync(path.join(ROOT, 'programs/synth_reactor.plang'), 'utf8'));
const vault = compilePlangToHbin(fs.readFileSync(path.join(ROOT, 'programs/cipher_vault.plang'), 'utf8'));
totalCompileMs = Number((performance.now() - tCompileStart).toFixed(2));
const linTwin = encodeLinearBinary(aegis.rawBundles, 'AEGIS_LINEAR');

// Assert on-disk artifacts/*.hbin match freshly compiled SHA-256 digests
for (const [slug, comp] of [
  ['quantum_chronicle', qchron],
  ['aegis_drift', aegis],
  ['synth_reactor', synth],
  ['cipher_vault', vault],
]) {
  const artPath = path.join(ROOT, 'artifacts', `${slug}.hbin`);
  if (!fs.existsSync(artPath)) {
    throw new Error(`Missing built artifact ${artPath} — run "npm run build" first.`);
  }
  const diskHash = toHex(sha256(new Uint8Array(fs.readFileSync(artPath))));
  if (diskHash !== comp.sha256Hex) {
    throw new Error(`Stale artifact ${artPath}: on-disk SHA-256 ${diskHash} != compiled ${comp.sha256Hex}. Run "npm run build".`);
  }
}

// ----------------------------------------------------------------------------
// EXPERIMENT 1: Survival Phase-Transition Curve (0%..96% Erasure, 40 trials/pt)
// Compares: Traditional Linear Binary vs Single-Stratum RS(40,16) Cliff vs PLANARIA 4-Stratum
// ----------------------------------------------------------------------------
console.log('[BENCH] Experiment 1: Monte Carlo Survival Phase-Transition Curve (0%..96% erasure)...');
const TRIALS_PER_POINT = 40;
survivalCurve = [];

for (let dropPct = 0; dropPct <= 96; dropPct += 4) {
  const dropRate = dropPct / 100;
  let linearAlive = 0;
  let rsCliffAlive = 0;
  let planariaBootable = 0;
  let stratumSum = 0;
  let s3Count = 0, s2Count = 0, s1Count = 0, s0Count = 0;

  for (let t = 0; t < TRIALS_PER_POINT; t++) {
    const seed = 10000 + dropPct * 100 + t;

    const linShred = shredCells(linTwin.bytes, dropRate, seed, false).bytes;
    if (decodeLinearBinary(linShred).bootable) linearAlive++;

    const plnShred = shredCells(aegis.bytes, dropRate, seed, false).bytes;
    const dec = decodeHbin(plnShred, { pinnedRootHex: aegis.lineageRootHex });

    if (dec.bundles[5].viable) rsCliffAlive++;

    if (dec.bootable) {
      planariaBootable++;
      stratumSum += dec.maxViableStratum + 1;
      if (dec.maxViableStratum === 3) s3Count++;
      else if (dec.maxViableStratum === 2) s2Count++;
      else if (dec.maxViableStratum === 1) s1Count++;
      else s0Count++;
    }
  }

  survivalCurve.push({
    dropPct,
    survivingPct: 100 - dropPct,
    linearSurvivalPct: Number(((linearAlive / TRIALS_PER_POINT) * 100).toFixed(1)),
    rsCliffSurvivalPct: Number(((rsCliffAlive / TRIALS_PER_POINT) * 100).toFixed(1)),
    planariaSurvivalPct: Number(((planariaBootable / TRIALS_PER_POINT) * 100).toFixed(1)),
    meanCapabilityScore: Number(((stratumSum / (TRIALS_PER_POINT * 4)) * 100).toFixed(1)),
    stratumDist: { s3: s3Count, s2: s2Count, s1: s1Count, s0: s0Count },
  });
}

// ----------------------------------------------------------------------------
// EXPERIMENT 2: Contiguous Burst Radiation Sweep (0..22 consecutive corrupted bytes in ALL 192 cells!)
// ----------------------------------------------------------------------------
console.log('[BENCH] Experiment 2: Inner RS(254,238) Interleaved Radiation Burst Sweep...');
const radiationSweep = [];
for (let burstBytes = 0; burstBytes <= 22; burstBytes += 2) {
  const rad = irradiateCells(aegis.bytes, burstBytes, 500 + burstBytes, true).bytes;
  const dec = decodeHbin(rad, { pinnedRootHex: aegis.lineageRootHex });
  const linRad = irradiateCells(linTwin.bytes, burstBytes, 500 + burstBytes, true).bytes;
  const linDec = decodeLinearBinary(linRad);

  radiationSweep.push({
    burstBytesPerCell: burstBytes,
    totalFileBytesCorrupted: burstBytes * TOTAL_CELLS,
    rawErrorRatePct: Number((((burstBytes * TOTAL_CELLS) / aegis.bytes.length) * 100).toFixed(2)),
    linearAlive: linDec.bootable,
    planariaCellsRepaired: dec.stats.authenticCells,
    planariaByteErrorsHealed: dec.stats.rsTotalByteErrorsFixed,
    planariaFullExactRegen: dec.canFullRegenerate,
  });
}

// ----------------------------------------------------------------------------
// EXPERIMENT 3: Byzantine Trojan Flood (1..192 RS-valid malicious cells, Immune ON vs OFF)
// ----------------------------------------------------------------------------
console.log('[BENCH] Experiment 3: Byzantine Trojan Injection Audit (Immune ON vs OFF)...');
const byzantineAudit = [];
for (const trojans of [1, 5, 20, 60, 192]) {
  const attacked = injectByzantineTrojans(aegis.bytes, trojans, 666 + trojans, true).bytes;
  const safe = decodeHbin(attacked, { pinnedRootHex: aegis.lineageRootHex });
  const unsafe = decodeHbin(attacked, { disableImmuneSystem: true });

  const origB0 = aegis.rawBundles.get(0);
  const unsafeB0 = unsafe.bundles[0].data || new Uint8Array(0);
  let corruptedB0Bytes = 0;
  for (let i = 0; i < origB0.length; i++) {
    if (origB0[i] !== unsafeB0[i]) corruptedB0Bytes++;
  }

  byzantineAudit.push({
    trojansInjected: trojans,
    immuneOnQuarantined: safe.stats.byzantineQuarantined,
    immuneOnExactMatch: safe.canFullRegenerate && regenerateHbin(safe).sha256Hex === aegis.sha256Hex,
    immuneOffB0CorruptedBytes: corruptedB0Bytes,
    immuneOffPoisoned: corruptedB0Bytes > 0,
  });
}

// ----------------------------------------------------------------------------
// EXPERIMENT 4: Unaligned Planarian Mitosis & Warm-JIT Latency Profile
// ----------------------------------------------------------------------------
console.log('[BENCH] Experiment 4: Unaligned Bisection Matrix & Warm-JIT Latency Benchmarks...');
const mitosisOffsets = [49152, 49153, 49177, 48701, 49597, 49000];
const mitosisResults = [];
for (const off of mitosisOffsets) {
  const { left, right } = bisectBinary(aegis.bytes, off);
  const t0 = performance.now();
  const dl = decodeHbin(left);
  const dr = decodeHbin(right);
  const rl = regenerateHbin(dl);
  const rr = regenerateHbin(dr);
  const dt = performance.now() - t0;
  mitosisResults.push({
    cutByteOffset: off,
    aligned512: off % 512 === 0,
    leftBytes: left.length,
    rightBytes: right.length,
    leftExactSha256: rl.sha256Hex === aegis.sha256Hex,
    rightExactSha256: rr.sha256Hex === aegis.sha256Hex,
    dualDecodeRegenMs: Number(dt.toFixed(2)),
  });
}

// Warmup V8 JIT before timing decode & PVM-32 execution
for (let i = 0; i < 5; i++) decodeHbin(aegis.bytes, { pinnedRootHex: aegis.lineageRootHex });
const tDecStart = performance.now();
const DEC_ITERS = 30;
for (let i = 0; i < DEC_ITERS; i++) decodeHbin(aegis.bytes, { pinnedRootHex: aegis.lineageRootHex });
meanDecodeMs = Number(((performance.now() - tDecStart) / DEC_ITERS).toFixed(2));

const vm = new PVM32();
vm.loadDecoded(decodeHbin(aegis.bytes), true);
for (let f = 0; f < 30; f++) vm.stepFrame();
const insnsBefore = vm.totalInsns;
const tVmStart = performance.now();
const VM_FRAMES = 400;
for (let f = 0; f < VM_FRAMES; f++) vm.stepFrame();
const vmTotalMs = Math.max(0.001, performance.now() - tVmStart);
const measuredInsns = vm.totalInsns - insnsBefore;
meanFrameMs = Number((vmTotalMs / VM_FRAMES).toFixed(3));
mips = Number(((measuredInsns / (vmTotalMs / 1000)) / 1e6).toFixed(2));

// Experiment 5: Cross-Species Xenograft Matrix
const ampAegis = amputateBundles(aegis.bytes, [3, 4]).bytes;
const xenoSynth = decodeHbin(concatShards(ampAegis, synth.bytes, 59), {
  pinnedRootHex: aegis.lineageRootHex,
  allowXenograft: true,
});
const xenoVault = decodeHbin(concatShards(ampAegis, vault.bytes, 73), {
  pinnedRootHex: aegis.lineageRootHex,
  allowXenograft: true,
});

const benchmarks = {
  schema: 'PLANARIA-BENCHMARKS-1.1',
  generatedAt: new Date().toISOString(),
  nodeVersion: process.version,
  artifacts: [qchron, aegis, synth, vault].map((p) => ({
    name: p.name,
    bytes: p.bytes.length,
    lineageRootHex: p.lineageRootHex,
    sha256Hex: p.sha256Hex,
    instructions: p.codegen.totalInstructions,
    codeBytes: p.codegen.totalCodeBytes,
  })),
  performance: {
    compileAll4SpeciesMs: totalCompileMs,
    meanFullDecodeMs: meanDecodeMs,
    meanPvm32FrameMs: meanFrameMs,
    effectiveFrameRateHeadroomFps: Math.round(1000 / Math.max(0.001, meanFrameMs)),
    pvm32ThroughputMIPS: mips,
  },
  survivalCurve,
  radiationSweep,
  byzantineAudit,
  mitosisResults,
  xenograftMatrix: [
    {
      chimera: 'AEGIS_DRIFT x SYNTH_REACTOR',
      transplantedBundles: xenoSynth.xenografts.map((x) => x.bundleName),
      bootable: xenoSynth.bootable,
      maxStratum: xenoSynth.maxViableStratum,
    },
    {
      chimera: 'AEGIS_DRIFT x CIPHER_VAULT',
      transplantedBundles: xenoVault.xenografts.map((x) => x.bundleName),
      bootable: xenoVault.bootable,
      maxStratum: xenoVault.maxViableStratum,
    },
  ],
};

const benchJson = JSON.stringify(benchmarks, null, 2) + '\n';
fs.writeFileSync(path.join(RESULTS_DIR, 'benchmarks.json'), benchJson);
} else {
  console.log('[BENCH] --attest-only: preserving existing results/benchmarks.json and re-sealing attestation.json...');
}

// ----------------------------------------------------------------------------
// CRYPTOGRAPHIC ATTESTATION (SHA-256 Digest Manifest + Ed25519 Seal)
// Supports persistent private key via PLANARIA_SIGNING_KEY_PEM; otherwise emits
// an explicitly labeled ephemeral self-consistency Ed25519 seal.
// ----------------------------------------------------------------------------
let publicKey;
let privateKey;
let signatureMode;
if (process.env.PLANARIA_SIGNING_KEY_PEM) {
  privateKey = crypto.createPrivateKey(process.env.PLANARIA_SIGNING_KEY_PEM);
  publicKey = crypto.createPublicKey(privateKey);
  signatureMode = 'persistent-key';
} else {
  ({ publicKey, privateKey } = crypto.generateKeyPairSync('ed25519'));
  signatureMode = 'ephemeral-self-consistency-seal';
}

const filesToAttest = [
  'src/core/gf256.js',
  'src/core/rs.js',
  'src/core/cauchy.js',
  'src/core/sha256.js',
  'src/core/hbin.js',
  'src/core/torture.js',
  'src/compiler/isa.js',
  'src/compiler/lexer.js',
  'src/compiler/parser.js',
  'src/compiler/codegen.js',
  'src/compiler/compile.js',
  'src/vm/pvm32.js',
  'src/vm/linear-twin.js',
  'src/quantum/qengine.js',
  'src/quantum/temporal.js',
  'src/world/generator.js',
  'src/world/game3d.js',
  'src/web/renderer3d.js',
  'src/web/visuals.js',
  'src/web/audio.js',
  'src/web/audio-worklet.js',
  'src/web/app.js',
  'server.mjs',
  'bin/planaria.mjs',
  'test/verify.mjs',
  'programs/quantum_chronicle.plang',
  'programs/aegis_drift.plang',
  'programs/synth_reactor.plang',
  'programs/cipher_vault.plang',
  'artifacts/quantum_chronicle.hbin',
  'artifacts/aegis_drift.hbin',
  'artifacts/synth_reactor.hbin',
  'artifacts/cipher_vault.hbin',
  'lean/PlanariaProofs.lean',
  'lean/PlanariaProofs/GF256.lean',
  'lean/PlanariaProofs/MitosisBounds.lean',
  'lean/PlanariaProofs/StratumAnastomosis.lean',
  'lean/PlanariaProofs/ByzantineImmune.lean',
  'lean/PlanariaProofs/XenograftABI.lean',
  'lean/PlanariaProofs/QuantumTemporal.lean',
  'paper/main.tex',
  'dist/Donahue_2026_planaria.pdf',
  'dist/arxiv_submission.tar.gz',
  'results/benchmarks.json',
];

const digests = {};
for (const rel of filesToAttest) {
  const full = path.join(ROOT, rel);
  if (fs.existsSync(full)) {
    digests[rel] = toHex(sha256(new Uint8Array(fs.readFileSync(full))));
  }
}

const payloadObj = {
  schema: 'PLANARIA-ATTESTATION-1.1',
  signatureMode,
  trustBoundary:
    signatureMode === 'persistent-key'
      ? 'Signed with persistent caller-supplied Ed25519 private key (PLANARIA_SIGNING_KEY_PEM).'
      : 'Ephemeral session Ed25519 key: proves internal bundle self-consistency against the embedded public key; external authenticity comes from git commit / GitHub release / Software Heritage archival.',
  timestamp: new Date().toISOString(),
  digests,
};
const canonicalPayload = JSON.stringify(payloadObj, null, 2);
const sig = crypto.sign(null, Buffer.from(canonicalPayload), privateKey);
const verified = crypto.verify(null, Buffer.from(canonicalPayload), publicKey, sig);

const attestation = {
  ...payloadObj,
  ed25519PublicKeyPem: publicKey.export({ type: 'spki', format: 'pem' }),
  ed25519SignatureHex: sig.toString('hex'),
  selfVerified: verified,
};
fs.writeFileSync(path.join(RESULTS_DIR, 'attestation.json'), JSON.stringify(attestation, null, 2) + '\n');

if (!ATTEST_ONLY) {
  console.log(`[BENCH] Done! Compile(4) = ${totalCompileMs} ms | Mean decode = ${meanDecodeMs} ms | PVM-32 frame = ${meanFrameMs} ms (${mips} MIPS)`);
  console.log(`[BENCH] Survival @ 80% erasure: Linear=${survivalCurve.find((x) => x.dropPct === 80).linearSurvivalPct}% | RS-Cliff=${survivalCurve.find((x) => x.dropPct === 80).rsCliffSurvivalPct}% | PLANARIA=${survivalCurve.find((x) => x.dropPct === 80).planariaSurvivalPct}%`);
}
console.log(`[BENCH] Wrote results/attestation.json (${Object.keys(digests).length} files attested, mode=${signatureMode}, verified=${verified}).`);
