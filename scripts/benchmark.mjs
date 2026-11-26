/**
 * PLANARIA v2.3 Reproducible Experimental Benchmark, Statistical Inference & Attestation Suite
 *
 * Generates:
 *   1. results/benchmarks.json (PLANARIA-BENCHMARKS-1.2) —
 *      - Experiment 1: Survival Phase-Transition Curve (0%..96% Erasure, 40 trials/pt)
 *        comparing FOUR architectures:
 *          (a) Traditional Linear Binary (LINBIN01)
 *          (b) Single-Stratum RS(40, 16) Cliff Binary
 *          (c) Equal-Storage Flat RS(192, 48) Monolithic Archive (identical 96 KiB & 48-chunk payload!)
 *          (d) PLANARIA 4-Stratum Progressive Holographic Binary
 *        with Wilson 95% CIs, exact two-sided McNemar/binomial p-values, Cohen's h effect sizes,
 *        and Holm-Bonferroni step-down adjusted p_Holm across all erasure thresholds!
 *      - Experiment 2: Contiguous Burst Radiation Sweep (0..22 B/cell across ALL 192 cells)
 *      - Experiment 3: Byzantine Trojan Flood Audit (1..192 RS-valid malicious cells, Immune ON vs OFF)
 *      - Experiment 4: Unaligned Planarian Mitosis Matrix & Warm-JIT Latency Profile (median/IQR/p95)
 *      - Experiment 5: Full Cross-Species Xenograft Matrix (all 4 living species!)
 *   2. results/attestation.json (PLANARIA-ATTESTATION-1.2) —
 *      SHA-256 digest manifest + Ed25519 seal covering source, scripts, CLI, UI, programs,
 *      built .hbin artifacts, Lean 4.35.0 proofs + Palomar Challenge/Solution/comparator, paper, and results.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
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
const VERSION = fs.readFileSync(path.join(ROOT, 'VERSION'), 'utf8').trim();
const RESULTS_DIR = path.join(ROOT, 'results');
fs.mkdirSync(RESULTS_DIR, { recursive: true });
const ATTEST_ONLY = process.argv.includes('--attest-only');

// ============================================================================
// EXACT STATISTICAL INFERENCE HELPERS (Wilson 95% CI, Exact McNemar, Cohen's h, Holm-Bonferroni)
// ============================================================================
function wilsonCI95(successes, n) {
  if (n <= 0) return { loPct: 0, hiPct: 0 };
  const z = 1.959963984540054;
  const z2 = z * z;
  const p = successes / n;
  const denom = 1 + z2 / n;
  const center = (p + z2 / (2 * n)) / denom;
  const half = (z * Math.sqrt((p * (1 - p) + z2 / (4 * n)) / n)) / denom;
  return {
    loPct: Number((Math.max(0, center - half) * 100).toFixed(1)),
    hiPct: Number((Math.min(1, center + half) * 100).toFixed(1)),
  };
}

function logChoose(n, k) {
  if (k < 0 || k > n) return -Infinity;
  let s = 0;
  const m = Math.min(k, n - k);
  for (let i = 1; i <= m; i++) {
    s += Math.log(n - m + i) - Math.log(i);
  }
  return s;
}

/** Exact two-sided McNemar binomial p-value for paired discordant counts (b, c). */
function exactMcNemarPValue(b, c) {
  const n = b + c;
  if (n === 0) return 1.0;
  const kMin = Math.min(b, c);
  let tail = 0;
  const lnHalfN = -n * Math.LN2;
  for (let i = 0; i <= kMin; i++) {
    tail += Math.exp(logChoose(n, i) + lnHalfN);
  }
  return Math.min(1.0, 2 * tail);
}

/** Cohen's h effect size between two proportions p1, p2 in [0, 1]. */
function cohensH(p1, p2) {
  const a1 = 2 * Math.asin(Math.sqrt(Math.max(0, Math.min(1, p1))));
  const a2 = 2 * Math.asin(Math.sqrt(Math.max(0, Math.min(1, p2))));
  return Number((a1 - a2).toFixed(3));
}

/** Holm-Bonferroni step-down multiplicity correction across an array of p-values. */
function holmBonferroniAdjust(pValues) {
  const m = pValues.length;
  const indexed = pValues.map((p, idx) => ({ p, idx })).sort((a, b) => a.p - b.p);
  const adjusted = new Array(m);
  let runningMax = 0;
  for (let rank = 0; rank < m; rank++) {
    const raw = Math.min(1.0, indexed[rank].p * (m - rank));
    runningMax = Math.max(runningMax, raw);
    adjusted[indexed[rank].idx] = Number(runningMax.toExponential(3));
  }
  return adjusted;
}

function summarizeTimings(samples) {
  const s = [...samples].sort((a, b) => a - b);
  const q = (p) => s[Math.min(s.length - 1, Math.floor(p * s.length))];
  const mean = s.reduce((a, b) => a + b, 0) / Math.max(1, s.length);
  return {
    n: s.length,
    meanMs: Number(mean.toFixed(3)),
    medianMs: Number(q(0.5).toFixed(3)),
    iqrMs: Number((q(0.75) - q(0.25)).toFixed(3)),
    p95Ms: Number(q(0.95).toFixed(3)),
  };
}

let totalCompileMs = null;
let decodeStats = null;
let frameStats = null;
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

  // --------------------------------------------------------------------------
  // EXPERIMENT 1: Survival Phase-Transition Curve (0%..96% Erasure, 40 paired trials/pt)
  // Compares: Linear Twin vs RS(40,16) Cliff vs Equal-Storage RS(192,48) Flat vs PLANARIA 4-Stratum
  // --------------------------------------------------------------------------
  console.log('[BENCH] Experiment 1: Paired Monte Carlo Survival Curve (4 architectures, 0%..96% erasure)...');
  const TRIALS_PER_POINT = 40;
  survivalCurve = [];
  const rawPvsFlat = [];
  const rawPvsLin = [];

  for (let dropPct = 0; dropPct <= 96; dropPct += 4) {
    const dropRate = dropPct / 100;
    let linearAlive = 0;
    let rsCliffAlive = 0;
    let rsEqualStorageAlive = 0;
    let planariaBootable = 0;
    let stratumSum = 0;
    let s3Count = 0, s2Count = 0, s1Count = 0, s0Count = 0;
    let discPlanVsFlat_b = 0, discPlanVsFlat_c = 0;
    let discPlanVsLin_b = 0, discPlanVsLin_c = 0;

    for (let t = 0; t < TRIALS_PER_POINT; t++) {
      const seed = 10000 + dropPct * 100 + t;

      const linShred = shredCells(linTwin.bytes, dropRate, seed, false).bytes;
      const linOk = decodeLinearBinary(linShred).bootable;
      if (linOk) linearAlive++;

      const plnShred = shredCells(aegis.bytes, dropRate, seed, false).bytes;
      const dec = decodeHbin(plnShred, { pinnedRootHex: aegis.lineageRootHex });

      if (dec.bundles[5].viable) rsCliffAlive++;
      // Equal-storage flat RS(192, 48) archive: identical 96 KiB size & 48-chunk raw payload capacity!
      const flatOk = dec.stats.authenticCells >= 48;
      if (flatOk) rsEqualStorageAlive++;

      if (dec.bootable) {
        planariaBootable++;
        stratumSum += dec.maxViableStratum + 1;
        if (dec.maxViableStratum === 3) s3Count++;
        else if (dec.maxViableStratum === 2) s2Count++;
        else if (dec.maxViableStratum === 1) s1Count++;
        else s0Count++;
      }

      if (dec.bootable && !flatOk) discPlanVsFlat_b++;
      if (!dec.bootable && flatOk) discPlanVsFlat_c++;
      if (dec.bootable && !linOk) discPlanVsLin_b++;
      if (!dec.bootable && linOk) discPlanVsLin_c++;
    }

    const pPln = planariaBootable / TRIALS_PER_POINT;
    const pFlat = rsEqualStorageAlive / TRIALS_PER_POINT;
    const pLin = linearAlive / TRIALS_PER_POINT;
    const pValFlat = exactMcNemarPValue(discPlanVsFlat_b, discPlanVsFlat_c);
    const pValLin = exactMcNemarPValue(discPlanVsLin_b, discPlanVsLin_c);
    rawPvsFlat.push(pValFlat);
    rawPvsLin.push(pValLin);

    survivalCurve.push({
      dropPct,
      survivingPct: 100 - dropPct,
      trials: TRIALS_PER_POINT,
      linearSurvivalPct: Number((pLin * 100).toFixed(1)),
      linearCI95: wilsonCI95(linearAlive, TRIALS_PER_POINT),
      rsCliffSurvivalPct: Number(((rsCliffAlive / TRIALS_PER_POINT) * 100).toFixed(1)),
      rsEqualStorageSurvivalPct: Number((pFlat * 100).toFixed(1)),
      rsEqualStorageCI95: wilsonCI95(rsEqualStorageAlive, TRIALS_PER_POINT),
      planariaSurvivalPct: Number((pPln * 100).toFixed(1)),
      planariaCI95: wilsonCI95(planariaBootable, TRIALS_PER_POINT),
      meanCapabilityScore: Number(((stratumSum / (TRIALS_PER_POINT * 4)) * 100).toFixed(1)),
      stratumDist: { s3: s3Count, s2: s2Count, s1: s1Count, s0: s0Count },
      statsVsEqualStorageRS192_48: {
        riskDiffPct: Number(((pPln - pFlat) * 100).toFixed(1)),
        cohensH: cohensH(pPln, pFlat),
        mcnemarExactP: Number(pValFlat.toExponential(3)),
        mcnemarHolmP: null,
      },
      statsVsLinear: {
        riskDiffPct: Number(((pPln - pLin) * 100).toFixed(1)),
        cohensH: cohensH(pPln, pLin),
        mcnemarExactP: Number(pValLin.toExponential(3)),
        mcnemarHolmP: null,
      },
    });
  }

  const holmFlat = holmBonferroniAdjust(rawPvsFlat);
  const holmLin = holmBonferroniAdjust(rawPvsLin);
  for (let i = 0; i < survivalCurve.length; i++) {
    survivalCurve[i].statsVsEqualStorageRS192_48.mcnemarHolmP = holmFlat[i];
    survivalCurve[i].statsVsLinear.mcnemarHolmP = holmLin[i];
  }

  // --------------------------------------------------------------------------
  // EXPERIMENT 2: Contiguous Burst Radiation Sweep (0..22 consecutive corrupted bytes in ALL 192 cells!)
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // EXPERIMENT 3: Byzantine Trojan Flood (1..192 RS-valid malicious cells, Immune ON vs OFF)
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // EXPERIMENT 4: Unaligned Planarian Mitosis & Warm-JIT Latency Distribution (median/IQR/p95)
  // --------------------------------------------------------------------------
  console.log('[BENCH] Experiment 4: Unaligned Bisection Matrix & Warm-JIT Latency Profiles...');
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

  // Warmup V8 JIT before sampling per-call latencies
  for (let i = 0; i < 8; i++) decodeHbin(aegis.bytes, { pinnedRootHex: aegis.lineageRootHex });
  const decodeSamples = [];
  for (let i = 0; i < 40; i++) {
    const s0 = performance.now();
    decodeHbin(aegis.bytes, { pinnedRootHex: aegis.lineageRootHex });
    decodeSamples.push(performance.now() - s0);
  }
  decodeStats = summarizeTimings(decodeSamples);

  const vm = new PVM32();
  vm.loadDecoded(decodeHbin(aegis.bytes), true);
  for (let f = 0; f < 40; f++) vm.stepFrame();
  const insnsBefore = vm.totalInsns;
  const frameSamples = [];
  const tVmStart = performance.now();
  const VM_FRAMES = 400;
  for (let f = 0; f < VM_FRAMES; f++) {
    const f0 = performance.now();
    vm.stepFrame();
    frameSamples.push(performance.now() - f0);
  }
  const vmTotalMs = Math.max(0.001, performance.now() - tVmStart);
  const measuredInsns = vm.totalInsns - insnsBefore;
  frameStats = summarizeTimings(frameSamples);
  mips = Number(((measuredInsns / (vmTotalMs / 1000)) / 1e6).toFixed(2));

  // --------------------------------------------------------------------------
  // EXPERIMENT 5: Full Cross-Species Xenograft Matrix (measuring every Paper Table 3 pair!)
  // --------------------------------------------------------------------------
  console.log('[BENCH] Experiment 5: Full 4-Species Cross-Species Xenograft Matrix...');
  function runXenograftCase(label, hostComp, donorComp, amputateIds, gapSeed) {
    const amp = amputateBundles(hostComp.bytes, amputateIds, true, gapSeed).bytes;
    const dec = decodeHbin(concatShards(amp, donorComp.bytes, 53, gapSeed), {
      pinnedRootHex: hostComp.lineageRootHex,
      allowXenograft: true,
    });
    const xvm = new PVM32(2026);
    xvm.loadDecoded(dec, true);
    for (let f = 0; f < 60; f++) xvm.stepFrame();
    return {
      chimera: label,
      amputatedBundles: amputateIds,
      transplantedBundles: dec.xenografts.map((x) => x.bundleName),
      hostStemSovereign: dec.bundles[0].source === 'PRIMARY',
      bootable: dec.bootable,
      maxStratum: dec.maxViableStratum,
      framesExecuted: 60,
      vmTraps: xvm.traps,
    };
  }

  const xenograftMatrix = [
    runXenograftCase('AEGIS_DRIFT x SYNTH_REACTOR (S2 Render+Audio)', aegis, synth, [3, 4], 59),
    runXenograftCase('AEGIS_DRIFT x CIPHER_VAULT (S2 Render+Audio)', aegis, vault, [3, 4], 73),
    runXenograftCase('AEGIS_DRIFT x QUANTUM_CHRONICLE (S1 Logic)', aegis, qchron, [1], 83),
    runXenograftCase('QUANTUM_CHRONICLE x SYNTH_REACTOR (S2 Render+Audio)', qchron, synth, [3, 4], 97),
    runXenograftCase('SYNTH_REACTOR x CIPHER_VAULT (S2 Render+Audio)', synth, vault, [3, 4], 109),
  ];

  const cpus = os.cpus();
  const benchmarks = {
    schema: 'PLANARIA-BENCHMARKS-1.2',
    generatedAt: new Date().toISOString(),
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      cpuModel: cpus?.[0]?.model || 'unknown',
      cpuCores: cpus?.length || 0,
      totalMemGiB: Number((os.totalmem() / (1024 ** 3)).toFixed(1)),
    },
    statisticalProtocol: {
      preregistration: 'docs/preregistration.md',
      trialsPerErasurePoint: TRIALS_PER_POINT,
      confidenceIntervalMethod: 'Wilson score 95%',
      pairedHypothesisTest: 'Exact two-sided McNemar binomial test',
      effectSizeMetric: "Risk difference (%) and Cohen's h",
      multiplicityCorrection: 'Holm-Bonferroni step-down across all 25 erasure thresholds (0%..96%)',
    },
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
      meanFullDecodeMs: decodeStats.meanMs,
      decodeLatencyDistribution: decodeStats,
      meanPvm32FrameMs: frameStats.meanMs,
      frameLatencyDistribution: frameStats,
      effectiveFrameRateHeadroomFps: Math.round(1000 / Math.max(0.001, frameStats.meanMs)),
      pvm32ThroughputMIPS: mips,
    },
    survivalCurve,
    radiationSweep,
    byzantineAudit,
    mitosisResults,
    xenograftMatrix,
  };

  fs.writeFileSync(path.join(RESULTS_DIR, 'benchmarks.json'), JSON.stringify(benchmarks, null, 2) + '\n');
} else {
  console.log('[BENCH] --attest-only: preserving existing results/benchmarks.json and re-sealing attestation.json...');
}

// ----------------------------------------------------------------------------
// CRYPTOGRAPHIC ATTESTATION (SHA-256 Digest Manifest + Ed25519 Seal)
// ----------------------------------------------------------------------------
let publicKey;
let privateKey;
let signatureMode;
if (process.env.PLANARIA_SIGNING_KEY_PEM) {
  privateKey = crypto.createPrivateKey(process.env.PLANARIA_SIGNING_KEY_PEM);
  if (privateKey.asymmetricKeyType !== 'ed25519') {
    throw new Error(`PLANARIA_SIGNING_KEY_PEM must be an Ed25519 private key (got '${privateKey.asymmetricKeyType}').`);
  }
  publicKey = crypto.createPublicKey(privateKey);
  signatureMode = 'persistent-key';
} else {
  ({ publicKey, privateKey } = crypto.generateKeyPairSync('ed25519'));
  signatureMode = 'ephemeral-self-consistency-seal';
}

const filesToAttest = [
  'package.json',
  'VERSION',
  'formalization.yaml',
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
  'src/web/index.html',
  'src/web/styles.css',
  'src/web/renderer3d.js',
  'src/web/visuals.js',
  'src/web/audio.js',
  'src/web/audio-worklet.js',
  'src/web/app.js',
  'server.mjs',
  'bin/planaria.mjs',
  'scripts/build-artifacts.mjs',
  'scripts/benchmark.mjs',
  'scripts/mutation-test.mjs',
  'scripts/fuzz.mjs',
  'scripts/build-blueprint.mjs',
  'scripts/check-blueprint.mjs',
  'scripts/check-readme-axioms.mjs',
  'scripts/lint-check.mjs',
  'scripts/check-citations.mjs',
  'scripts/build-pages.mjs',
  'test/verify.mjs',
  'reference/planaria_oracle.py',
  'blueprint/index.html',
  'blueprint/blueprint.json',
  'programs/quantum_chronicle.plang',
  'programs/aegis_drift.plang',
  'programs/synth_reactor.plang',
  'programs/cipher_vault.plang',
  'artifacts/quantum_chronicle.hbin',
  'artifacts/aegis_drift.hbin',
  'artifacts/synth_reactor.hbin',
  'artifacts/cipher_vault.hbin',
  'artifacts/manifest.json',
  'lean/PlanariaProofs.lean',
  'lean/VerifyAxioms.lean',
  'lean/Challenge.lean',
  'lean/Solution.lean',
  'lean/comparator.json',
  'lean/PlanariaProofs/Spec.lean',
  'lean/PlanariaProofs/GF256.lean',
  'lean/PlanariaProofs/MitosisBounds.lean',
  'lean/PlanariaProofs/StratumAnastomosis.lean',
  'lean/PlanariaProofs/ByzantineImmune.lean',
  'lean/PlanariaProofs/XenograftABI.lean',
  'lean/PlanariaProofs/QuantumTemporal.lean',
  'lean/PlanariaProofs/AdversarialTests.lean',
  'paper/main.tex',
  'dist/Donahue_2026_planaria.pdf',
  'dist/arxiv_submission.tar.gz',
  'results/benchmarks.json',
  'results/bench-history.csv',
  'results/citation-audit.json',
  'results/lean4-audit.txt',
  'results/lean4-multi-kernel.txt',
];

const digests = {};
const missingAttest = [];
for (const rel of filesToAttest) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) {
    missingAttest.push(rel);
    continue;
  }
  digests[rel] = toHex(sha256(new Uint8Array(fs.readFileSync(full))));
}
if (missingAttest.length > 0) {
  throw new Error(`Attestation failed: missing expected files: ${missingAttest.join(', ')}`);
}

const payloadObj = {
  schema: 'PLANARIA-ATTESTATION-1.2',
  signatureMode,
  trustBoundary:
    signatureMode === 'persistent-key'
      ? 'Signed with persistent caller-supplied Ed25519 private key (PLANARIA_SIGNING_KEY_PEM).'
      : 'Ephemeral session Ed25519 key: proves internal bundle self-consistency against the embedded public key; external authenticity comes from git commit / GitHub release / SLSA provenance / Software Heritage archival.',
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
  const p80 = survivalCurve.find((x) => x.dropPct === 80);
  console.log(`[BENCH] Done! Compile(4) = ${totalCompileMs} ms | Decode median = ${decodeStats.medianMs} ms (IQR=${decodeStats.iqrMs} ms) | PVM-32 frame median = ${frameStats.medianMs} ms (${mips} MIPS)`);
  console.log(`[BENCH] Survival @ 80% erasure: Linear=${p80.linearSurvivalPct}% | RS(40,16)=${p80.rsCliffSurvivalPct}% | RS(192,48)-Flat=${p80.rsEqualStorageSurvivalPct}% | PLANARIA=${p80.planariaSurvivalPct}% (95% CI [${p80.planariaCI95.loPct}%, ${p80.planariaCI95.hiPct}%], p_Holm=${p80.statsVsEqualStorageRS192_48.mcnemarHolmP}, h=${p80.statsVsEqualStorageRS192_48.cohensH})`);
}
console.log(`[BENCH] Wrote results/attestation.json (${Object.keys(digests).length} files attested, mode=${signatureMode}, verified=${verified}).`);
