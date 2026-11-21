/**
 * PLANARIA Surgical Torture, Bisection, Radiation & Byzantine Attack Operators
 *
 * Every operator mutates RAW BINARY BYTES directly (zero cheating, zero VM side-channels)
 * to simulate physical media decay, surgical bisection, shredding, unaligned shifts,
 * and active adversarial Byzantine Trojan injection.
 */

import {
  CELL_SIZE,
  SYNC_WORD,
  CELL_HEADER_SIZE,
  CELL_PAYLOAD_SIZE,
  CELL_BODY_SIZE,
  BUNDLE_SPECS,
  PLACEMENT_SCHEDULE,
  HBIN_VERSION,
} from './hbin.js';
import { rsArmorInterleaved } from './rs.js';
import { toBytes } from './sha256.js';

/** Deterministic PRNG (Mulberry32) for 100% reproducible falsification benchmarks. */
export function makeRng(seed = 0x504c4e31) {
  let a = seed >>> 0;
  return function rand() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Planarian Zero-Overlap Bisection: slices raw binary into two completely disjoint halves
 * at an exact or arbitrary unaligned byte offset.
 */
export function bisectBinary(rawBytes, cutByteOffset = Math.floor(rawBytes.length / 2)) {
  const bytes = toBytes(rawBytes);
  const rawCut = Number.isFinite(cutByteOffset) ? Math.floor(cutByteOffset) : Math.floor(bytes.length / 2);
  const cut = Math.max(0, Math.min(bytes.length, rawCut));
  return {
    left: new Uint8Array(bytes.subarray(0, cut)),
    right: new Uint8Array(bytes.subarray(cut)),
    cutOffset: cut,
  };
}

/**
 * Multi-way Fragmentation: slices binary into `parts` completely disjoint fragments.
 */
export function splitBinary(rawBytes, parts = 3) {
  const bytes = toBytes(rawBytes);
  const p = Number.isInteger(parts) && parts >= 1 ? parts : 3;
  const out = [];
  const step = Math.floor(bytes.length / p);
  for (let i = 0; i < p; i++) {
    const start = i * step;
    const end = i === p - 1 ? bytes.length : (i + 1) * step;
    out.push(new Uint8Array(bytes.subarray(start, end)));
  }
  return out;
}

/**
 * Random Cell-Level Erasure / Shredding: zeroes/destroys a given fraction `dropRate` in [0, 1]
 * of 512-byte cell blocks (or deletes them physically when `compact = true`).
 */
export function shredCells(rawBytes, dropRate, seed = 42, compact = false) {
  const bytes = toBytes(rawBytes);
  const rate = Number.isFinite(dropRate) ? Math.max(0, Math.min(1, dropRate)) : 0;
  const rng = makeRng(seed);
  const numCells = Math.floor(bytes.length / CELL_SIZE);
  const indices = Array.from({ length: numCells }, (_, i) => i);
  // Fisher-Yates shuffle to choose exact drop count
  for (let i = numCells - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = indices[i];
    indices[i] = indices[j];
    indices[j] = tmp;
  }
  const dropCount = Math.round(numCells * rate);
  const droppedSet = new Set(indices.slice(0, dropCount));

  if (compact) {
    const kept = [];
    for (let i = 0; i < numCells; i++) {
      if (!droppedSet.has(i)) {
        kept.push(bytes.subarray(i * CELL_SIZE, (i + 1) * CELL_SIZE));
      }
    }
    const out = new Uint8Array(kept.length * CELL_SIZE);
    for (let i = 0; i < kept.length; i++) out.set(kept[i], i * CELL_SIZE);
    return { bytes: out, droppedCells: dropCount, survivingCells: kept.length };
  }

  const out = new Uint8Array(bytes);
  for (const idx of droppedSet) {
    const off = idx * CELL_SIZE;
    for (let b = 0; b < CELL_SIZE; b++) {
      out[off + b] = Math.floor(rng() * 256); // overwrite with random destructive noise
    }
  }
  return { bytes: out, droppedCells: dropCount, survivingCells: numCells - dropCount };
}

/**
 * Radiation / Bit-Rot Injector: corrupts `errorsPerCell` byte positions inside
 * EVERY cell's armored 508-byte body (or full 512B cell when `includeSync = true`).
 * Safe for all counts in [0..508] (or [0..512]); uses partial Fisher-Yates (never loops forever).
 */
export function irradiateCells(rawBytes, errorsPerCell = 8, seed = 1337, burstMode = false, includeSync = false) {
  const bytes = toBytes(rawBytes);
  const span = includeSync ? CELL_SIZE : CELL_SIZE - 4;
  const startOff = includeSync ? 0 : 4;
  const count = Number.isFinite(errorsPerCell)
    ? Math.max(0, Math.min(span, Math.floor(errorsPerCell)))
    : 0;
  const rng = makeRng(seed);
  const out = new Uint8Array(bytes);
  const numCells = Math.floor(out.length / CELL_SIZE);
  let totalCorruptedBytes = 0;

  if (count === 0) return { bytes: out, totalCorruptedBytes: 0 };

  const pool = new Uint16Array(span);
  for (let c = 0; c < numCells; c++) {
    const base = c * CELL_SIZE + startOff;
    if (burstMode) {
      const start = Math.floor(rng() * (span - count + 1));
      for (let k = 0; k < count; k++) {
        out[base + start + k] ^= 1 + Math.floor(rng() * 255);
        totalCorruptedBytes++;
      }
    } else {
      for (let p = 0; p < span; p++) pool[p] = p;
      for (let k = 0; k < count; k++) {
        const pick = k + Math.floor(rng() * (span - k));
        const pos = pool[pick];
        pool[pick] = pool[k];
        out[base + pos] ^= 1 + Math.floor(rng() * 255);
        totalCorruptedBytes++;
      }
    }
  }
  return { bytes: out, totalCorruptedBytes };
}

/**
 * Targeted Organ Scalpel: surgically destroys all cells belonging to specific bundle IDs
 * (checks all 4 sync bytes; supports arbitrary unaligned offsets).
 */
export function amputateBundles(rawBytes, targetBundleIds, replaceWithNoise = true, seed = 99) {
  const bytes = toBytes(rawBytes);
  const rng = makeRng(seed);
  const targets = new Set(targetBundleIds);
  const out = new Uint8Array(bytes);
  let amputated = 0;

  for (let off = 0; off <= out.length - CELL_SIZE; off++) {
    if (
      out[off] === SYNC_WORD[0] &&
      out[off + 1] === SYNC_WORD[1] &&
      out[off + 2] === SYNC_WORD[2] &&
      out[off + 3] === SYNC_WORD[3] &&
      targets.has(out[off + 5])
    ) {
      amputated++;
      for (let b = 0; b < CELL_SIZE; b++) {
        out[off + b] = replaceWithNoise ? Math.floor(rng() * 256) : 0;
      }
      off += CELL_SIZE - 1;
    }
  }
  return { bytes: out, amputatedCells: amputated };
}

/**
 * Byte-Shift + Noise-Padding + Chunk-Shuffle Torture:
 * Prepends `leadGarbage` unaligned random bytes, optionally shuffles cell order,
 * and optionally inserts random inter-cell garbage gaps up to `interCellGapMax`.
 */
export function shiftAndShuffle(rawBytes, leadGarbage = 137, seed = 777, shuffle = true, interCellGapMax = 0) {
  const bytes = toBytes(rawBytes);
  const lead = Number.isFinite(leadGarbage) ? Math.max(0, Math.floor(leadGarbage)) : 0;
  const maxGap = Number.isFinite(interCellGapMax) ? Math.max(0, Math.floor(interCellGapMax)) : 0;
  const rng = makeRng(seed);
  const numCells = Math.floor(bytes.length / CELL_SIZE);
  const cells = [];
  for (let i = 0; i < numCells; i++) {
    cells.push(bytes.subarray(i * CELL_SIZE, (i + 1) * CELL_SIZE));
  }
  if (shuffle) {
    for (let i = cells.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const tmp = cells[i];
      cells[i] = cells[j];
      cells[j] = tmp;
    }
  }
  const gaps = cells.map(() => (maxGap > 0 ? Math.floor(rng() * (maxGap + 1)) : 0));
  const totalGaps = gaps.reduce((a, g) => a + g, 0);
  const trailGarbage = 73;
  const out = new Uint8Array(lead + cells.length * CELL_SIZE + totalGaps + trailGarbage);
  for (let i = 0; i < lead; i++) out[i] = Math.floor(rng() * 256);
  let cursor = lead;
  for (let i = 0; i < cells.length; i++) {
    out.set(cells[i], cursor);
    cursor += CELL_SIZE;
    for (let g = 0; g < gaps[i]; g++) {
      out[cursor++] = Math.floor(rng() * 256);
    }
  }
  for (let i = cursor; i < out.length; i++) {
    out[i] = Math.floor(rng() * 256);
  }
  return out;
}

/**
 * Byzantine Trojan Syringe: crafts sophisticated adversarial forged cells that pass:
 *   1. Exact 4-byte Sync Word (`PLN\xb7`)
 *   2. Exact Spec-Compliant Cell Header (matching PLACEMENT_SCHEDULE leafIdx, evalX, k, n, stratum, organId, abiSig!)
 *   3. Exact 2-way Interleaved RS(254, 238) Inner ECC Parity (0 syndrome errors!)
 *   4. Hostile/poisoned bytecode payload designed to corrupt Cauchy Gaussian elimination!
 *
 * ONLY cryptographic Merkle inclusion verification can detect and quarantine these cells.
 */
export function injectByzantineTrojans(rawBytes, count = 24, seed = 666, prepend = true) {
  const bytes = toBytes(rawBytes);
  const nTrojans = Number.isFinite(count) ? Math.max(0, Math.min(5000, Math.floor(count))) : 0;
  const rng = makeRng(seed);
  const trojans = new Uint8Array(nTrojans * CELL_SIZE);

  for (let i = 0; i < nTrojans; i++) {
    const slot = i % PLACEMENT_SCHEDULE.length;
    const sched = PLACEMENT_SCHEDULE[slot];
    const spec = BUNDLE_SPECS[sched.bundleId];
    const body = new Uint8Array(CELL_BODY_SIZE);
    // Forge 100% spec-compliant header matching PLACEMENT_SCHEDULE!
    body[0] = HBIN_VERSION;
    body[1] = spec.id;
    body[2] = spec.stratum;
    body[3] = spec.organId;
    body[4] = spec.abiSig & 0xff;
    body[5] = (spec.abiSig >>> 8) & 0xff;
    body[6] = spec.k + sched.cellInBundle;
    body[7] = spec.k;
    body[8] = spec.n;
    body[9] = spec.xenograftable ? 0x01 : 0x00;
    body[10] = slot & 0xff;
    body[11] = (slot >>> 8) & 0xff;
    const fakeOrigLen = Math.min(512, spec.k * CELL_PAYLOAD_SIZE);
    body[12] = fakeOrigLen & 0xff;
    body[13] = (fakeOrigLen >>> 8) & 0xff;
    body[14] = 0xde;
    body[15] = 0xad;

    // Fill payload with hostile malicious bytecode / poison bytes
    for (let b = 0; b < CELL_PAYLOAD_SIZE; b++) {
      body[CELL_HEADER_SIZE + b] = (0xde ^ Math.floor(rng() * 256)) & 0xff;
    }
    // Forged Merkle proof bytes (cannot invert SHA-256!)
    for (let b = CELL_HEADER_SIZE + CELL_PAYLOAD_SIZE; b < CELL_BODY_SIZE; b++) {
      body[b] = Math.floor(rng() * 256);
    }

    // Properly RS-armor the Trojan so it passes inner ECC with ZERO errors!
    const armored = rsArmorInterleaved(body);
    const off = i * CELL_SIZE;
    trojans.set(SYNC_WORD, off);
    trojans.set(armored, off + 4);
  }

  // Prepending puts Trojans BEFORE authentic cells so an unprotected decoder picks them FIRST!
  const out = new Uint8Array(bytes.length + trojans.length);
  if (prepend) {
    out.set(trojans, 0);
    out.set(bytes, trojans.length);
  } else {
    out.set(bytes, 0);
    out.set(trojans, bytes.length);
  }
  return { bytes: out, trojanCount: nTrojans };
}

/**
 * Overlap-Eclipse Attack Generator: prepends a truncated 496-byte RS-valid Trojan directly
 * before `bytes` to test whether a decoder naively jumps `offset += 512` and skips intact Cell 0.
 */
export function injectOverlapEclipseTrojan(rawBytes, seed = 911) {
  const bytes = toBytes(rawBytes);
  const { bytes: withOne } = injectByzantineTrojans(new Uint8Array(0), 1, seed, true);
  const truncated496 = withOne.subarray(0, CELL_SIZE - 16);
  const out = new Uint8Array(truncated496.length + bytes.length);
  out.set(truncated496, 0);
  out.set(bytes, truncated496.length);
  return { bytes: out, truncatedPrefixBytes: truncated496.length };
}

/**
 * Raw OS-style Concatenation (`cat shardA shardB > fused`), optionally with random junk between them.
 */
export function concatShards(rawA, rawB, junkBetween = 0, seed = 55) {
  const shardA = toBytes(rawA);
  const shardB = toBytes(rawB);
  const junk = Number.isFinite(junkBetween) ? Math.max(0, Math.floor(junkBetween)) : 0;
  const rng = makeRng(seed);
  const out = new Uint8Array(shardA.length + junk + shardB.length);
  out.set(shardA, 0);
  for (let i = 0; i < junk; i++) {
    out[shardA.length + i] = Math.floor(rng() * 256);
  }
  out.set(shardB, shardA.length + junk);
  return out;
}
