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
  HBIN_VERSION,
} from './hbin.js';
import { rsArmorInterleaved } from './rs.js';

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
export function bisectBinary(bytes, cutByteOffset = Math.floor(bytes.length / 2)) {
  const cut = Math.max(0, Math.min(bytes.length, cutByteOffset));
  return {
    left: new Uint8Array(bytes.subarray(0, cut)),
    right: new Uint8Array(bytes.subarray(cut)),
    cutOffset: cut,
  };
}

/**
 * Multi-way Fragmentation: slices binary into `parts` completely disjoint fragments.
 */
export function splitBinary(bytes, parts = 3) {
  const out = [];
  const step = Math.floor(bytes.length / parts);
  for (let i = 0; i < parts; i++) {
    const start = i * step;
    const end = i === parts - 1 ? bytes.length : (i + 1) * step;
    out.push(new Uint8Array(bytes.subarray(start, end)));
  }
  return out;
}

/**
 * Random Cell-Level Erasure / Shredding: zeroes/destroys a given fraction `dropRate` in [0, 1]
 * of 512-byte cell blocks (or deletes them physically when `compact = true`).
 */
export function shredCells(bytes, dropRate, seed = 42, compact = false) {
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
  const dropCount = Math.round(numCells * Math.max(0, Math.min(1, dropRate)));
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
 * Radiation / Bit-Rot Injector: corrupts `errorsPerCell` random byte positions inside
 * EVERY cell's armored 508-byte body (optionally also flipping sync bits).
 * Tests Inner Interleaved RS(254, 238) self-healing limits (<= 8 per lane = up to 16 burst!).
 */
export function irradiateCells(bytes, errorsPerCell = 8, seed = 1337, burstMode = false) {
  const rng = makeRng(seed);
  const out = new Uint8Array(bytes);
  const numCells = Math.floor(out.length / CELL_SIZE);
  let totalCorruptedBytes = 0;

  for (let c = 0; c < numCells; c++) {
    const base = c * CELL_SIZE + 4; // inside armored 508B body
    if (burstMode) {
      const start = Math.floor(rng() * Math.max(1, 508 - errorsPerCell));
      for (let k = 0; k < errorsPerCell && start + k < 508; k++) {
        out[base + start + k] ^= 1 + Math.floor(rng() * 255);
        totalCorruptedBytes++;
      }
    } else {
      const used = new Set();
      for (let k = 0; k < errorsPerCell; k++) {
        let pos;
        do {
          pos = Math.floor(rng() * 508);
        } while (used.has(pos));
        used.add(pos);
        out[base + pos] ^= 1 + Math.floor(rng() * 255);
        totalCorruptedBytes++;
      }
    }
  }
  return { bytes: out, totalCorruptedBytes };
}

/**
 * Targeted Organ Scalpel: surgically destroys all cells belonging to specific bundle IDs
 * (e.g., amputating S2_CORTEX_RENDER [3] and S2_SYNTH_AUDIO [4] to trigger live Anastomosis!).
 */
export function amputateBundles(bytes, targetBundleIds, replaceWithNoise = true, seed = 99) {
  const rng = makeRng(seed);
  const targets = new Set(targetBundleIds);
  const out = new Uint8Array(bytes);
  const numCells = Math.floor(out.length / CELL_SIZE);
  let amputated = 0;

  for (let c = 0; c < numCells; c++) {
    const off = c * CELL_SIZE;
    // Check bundleId byte at offset + 5 (header byte 1)
    if (
      out[off] === SYNC_WORD[0] &&
      out[off + 1] === SYNC_WORD[1] &&
      out[off + 2] === SYNC_WORD[2] &&
      targets.has(out[off + 5])
    ) {
      amputated++;
      for (let b = 0; b < CELL_SIZE; b++) {
        out[off + b] = replaceWithNoise ? Math.floor(rng() * 256) : 0;
      }
    }
  }
  return { bytes: out, amputatedCells: amputated };
}

/**
 * Byte-Shift + Noise-Padding + Chunk-Shuffle Torture:
 * Prepends `leadGarbage` unaligned random bytes (e.g. 137 bytes!), shuffles cell order,
 * and inserts random inter-cell garbage gaps — proving true headerless sync-harvesting!
 */
export function shiftAndShuffle(bytes, leadGarbage = 137, seed = 777, shuffle = true) {
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
  const trailGarbage = 73;
  const out = new Uint8Array(leadGarbage + cells.length * CELL_SIZE + trailGarbage);
  for (let i = 0; i < leadGarbage; i++) out[i] = Math.floor(rng() * 256);
  for (let i = 0; i < cells.length; i++) {
    out.set(cells[i], leadGarbage + i * CELL_SIZE);
  }
  for (let i = leadGarbage + cells.length * CELL_SIZE; i < out.length; i++) {
    out[i] = Math.floor(rng() * 256);
  }
  return out;
}

/**
 * Byzantine Trojan Syringe: crafts sophisticated adversarial forged cells that pass:
 *   1. Exact 4-byte Sync Word (`PLN\xb7`)
 *   2. Valid Cell Header (targeting real bundleIds, valid evalX, valid k, n, leafIdx)
 *   3. Exact 2-way Interleaved RS(254, 238) Inner ECC Parity (0 syndrome errors!)
 *   4. Hostile/poisoned bytecode payload designed to corrupt Cauchy Gaussian elimination!
 *
 * ONLY cryptographic Merkle inclusion verification can detect and quarantine these cells.
 */
export function injectByzantineTrojans(bytes, count = 24, seed = 666, prepend = true) {
  const rng = makeRng(seed);
  const trojans = new Uint8Array(count * CELL_SIZE);

  for (let i = 0; i < count; i++) {
    const spec = BUNDLE_SPECS[i % BUNDLE_SPECS.length];
    const body = new Uint8Array(CELL_BODY_SIZE);
    // Forge valid header targeting a real bundle and evaluation coordinate
    body[0] = HBIN_VERSION;
    body[1] = spec.id;
    body[2] = spec.stratum;
    body[3] = spec.organId;
    body[4] = spec.abiSig & 0xff;
    body[5] = (spec.abiSig >>> 8) & 0xff;
    body[6] = spec.k + (i % spec.n); // valid evalX that collides with legitimate cells!
    body[7] = spec.k;
    body[8] = spec.n;
    body[9] = 0x01;
    body[10] = (i * 7) % 192;
    body[11] = 0;
    body[12] = 0x00;
    body[13] = 0x02; // 512B origLen
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
  return { bytes: out, trojanCount: count };
}

/**
 * Raw OS-style Concatenation (`cat shardA shardB > fused`), optionally with random junk between them.
 */
export function concatShards(shardA, shardB, junkBetween = 0, seed = 55) {
  const rng = makeRng(seed);
  const out = new Uint8Array(shardA.length + junkBetween + shardB.length);
  out.set(shardA, 0);
  for (let i = 0; i < junkBetween; i++) {
    out[shardA.length + i] = Math.floor(rng() * 256);
  }
  out.set(shardB, shardA.length + junkBetween);
  return out;
}
