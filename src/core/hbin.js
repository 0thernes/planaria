/**
 * PLANARIA Holographic Binary Format (.hbin) v1.0
 *
 * Zero-header, self-synchronizing, multi-stratum cellular executable container:
 *   - Fixed 512-byte Holographic Cells (192 cells = 98,304 bytes = 96 KB pristine binary)
 *   - 4-byte Fuzzy Barker Sync Marker (0x50 0x4C 0x4E 0xB7, Hamming tolerance <= 3 bits)
 *   - 16-byte Authenticated Cell Header (stratum, organ, ABI signature, Cauchy evalX, k, n, leafIdx, origLen)
 *   - 332-byte GF(2^8) Cauchy MDS Coded Organ Payload
 *   - 128-byte Depth-8 SHA-256-128 Merkle Inclusion Path committing all 348 header+payload bytes
 *   - 32-byte 2-way Interleaved RS(254, 238) Inner ECC Armor (heals up to 16B burst / 8B per lane!)
 *
 * Supports:
 *   - Zero-overlap 50/50 Planarian Mitosis & 100% bit-exact binary regeneration
 *   - Unaligned arbitrary-offset byte-stream harvesting (no header, no magic at offset 0)
 *   - Progressive 4-Stratum graceful degradation down to ~8-12% surviving bytes
 *   - Cryptographic Byzantine Immune System (Pinned-Root + Unpinned Consensus Quorum)
 *   - Raw-concatenation Anastomosis Healing (Buffer.concat([shardA, shardB]))
 *   - ABI-verified Cross-Species Chimeric Xenografting
 */

import { cauchyEncode, cauchyDecode } from './cauchy.js';
import { rsArmorInterleaved, rsUnarmorInterleaved } from './rs.js';
import {
  sha256,
  toBytes,
  toHex,
  buildMerkleTree,
  getMerkleProof,
  computeMerkleRootFromProof,
} from './sha256.js';

export const HBIN_VERSION = 1;
export const CELL_SIZE = 512;
export const SYNC_WORD = new Uint8Array([0x50, 0x4c, 0x4e, 0xb7]); // "PLN\xb7"
export const SYNC_MAX_BIT_ERRORS = 3;

export const CELL_HEADER_OFFSET = 4;
export const CELL_HEADER_SIZE = 16;
export const CELL_PAYLOAD_OFFSET = 20;
export const CELL_PAYLOAD_SIZE = 332;
export const CELL_MERKLE_OFFSET = 352;
export const CELL_MERKLE_SIZE = 128;
export const CELL_BODY_SIZE = 476; // 16 + 332 + 128
export const CELL_PARITY_OFFSET = 480;
export const CELL_PARITY_SIZE = 32;

export const ORGAN_IDS = {
  KERNEL: 0,
  LOGIC: 1,
  RENDERER: 2,
  AUDIO: 3,
  FX: 4,
  GENOME: 5,
};

export const ORGAN_NAMES = ['KERNEL', 'LOGIC', 'RENDERER', 'AUDIO', 'FX', 'GENOME'];

/** Standardized capability ABI signatures (enables safe cross-species Xenografting). */
export const ABI_SIGNATURES = {
  KERNEL_V1: 0x0101,
  LOGIC_V1: 0x0201,
  RENDERER_S1_V1: 0x0301,
  RENDERER_S2_V1: 0x0302,
  AUDIO_S2_V1: 0x0402,
  FX_S3_V1: 0x0503,
  GENOME_V1: 0x0603,
};

/**
 * The 7-Bundle Stratified Holographic Architecture (192 cells = 98,304 bytes = 96 KB).
 * Note: For every bundle b, n_b >= 2 * k_b + 4, guaranteeing exact zero-overlap 50/50
 * Planarian Mitosis even when an arbitrary unaligned byte cut severs cell boundaries!
 */
export const BUNDLE_SPECS = [
  {
    id: 0,
    name: 'S0_STEM_NUCLEUS',
    organId: ORGAN_IDS.KERNEL,
    stratum: 0,
    abiSig: ABI_SIGNATURES.KERNEL_V1,
    k: 2,
    n: 24,
    xenograftable: false,
  },
  {
    id: 1,
    name: 'S1_CORE_LOGIC',
    organId: ORGAN_IDS.LOGIC,
    stratum: 1,
    abiSig: ABI_SIGNATURES.LOGIC_V1,
    k: 4,
    n: 24,
    xenograftable: true,
  },
  {
    id: 2,
    name: 'S1_WIREFRAME',
    organId: ORGAN_IDS.RENDERER,
    stratum: 1,
    abiSig: ABI_SIGNATURES.RENDERER_S1_V1,
    k: 4,
    n: 24,
    xenograftable: true,
  },
  {
    id: 3,
    name: 'S2_CORTEX_RENDER',
    organId: ORGAN_IDS.RENDERER,
    stratum: 2,
    abiSig: ABI_SIGNATURES.RENDERER_S2_V1,
    k: 8,
    n: 32,
    xenograftable: true,
  },
  {
    id: 4,
    name: 'S2_SYNTH_AUDIO',
    organId: ORGAN_IDS.AUDIO,
    stratum: 2,
    abiSig: ABI_SIGNATURES.AUDIO_S2_V1,
    k: 6,
    n: 24,
    xenograftable: true,
  },
  {
    id: 5,
    name: 'S3_ORGANISM_FX',
    organId: ORGAN_IDS.FX,
    stratum: 3,
    abiSig: ABI_SIGNATURES.FX_S3_V1,
    k: 16,
    n: 40,
    xenograftable: true,
  },
  {
    id: 6,
    name: 'S3_GENOME_LEDGER',
    organId: ORGAN_IDS.GENOME,
    stratum: 3,
    abiSig: ABI_SIGNATURES.GENOME_V1,
    k: 8,
    n: 24,
    xenograftable: false,
  },
];

export const TOTAL_CELLS = BUNDLE_SPECS.reduce((acc, b) => acc + b.n, 0); // 192
export const TOTAL_HBIN_BYTES = TOTAL_CELLS * CELL_SIZE; // 98,304 bytes (96 KB)

/** Compute deterministic 16-bit species tag from program name. */
export function computeSpeciesTag(name) {
  const bytes = new TextEncoder().encode(String(name || 'PLANARIA'));
  const h = sha256(bytes);
  return h[0] | (h[1] << 8);
}

/** Precomputed 8-bit popcount lookup table for fast fuzzy sync correlation. */
const POPCOUNT8 = new Uint8Array(256);
for (let i = 0; i < 256; i++) {
  let v = i, c = 0;
  while (v) { c += v & 1; v >>>= 1; }
  POPCOUNT8[i] = c;
}

export function syncBitDistance(buf, offset) {
  return (
    POPCOUNT8[buf[offset] ^ SYNC_WORD[0]] +
    POPCOUNT8[buf[offset + 1] ^ SYNC_WORD[1]] +
    POPCOUNT8[buf[offset + 2] ^ SYNC_WORD[2]] +
    POPCOUNT8[buf[offset + 3] ^ SYNC_WORD[3]]
  );
}

/**
 * Deterministic exact-integer low-discrepancy physical cell ordering across the 192 slots.
 * Uses exact scaled integer numerator posNum(b, i) = (14 * i + 2 * b + 1) * (480 / n_b)
 * (representing pos = posNum / 6720 in (0, 1)) — eliminating all IEEE-754 tie-break ULP drift
 * and matching Lean 4 MitosisBounds.lean bit-for-bit. Every bundle places exactly n_b / 2 cells
 * strictly in the left half [0..95] and n_b / 2 strictly in the right half [96..191], with any
 * contiguous 95-cell window retaining >= floor(n_b/2) - 1 > k_b cells across all 7 bundles.
 */
function buildPlacementSchedule() {
  const entries = [];
  for (const spec of BUNDLE_SPECS) {
    const scale = 480 / spec.n; // exact integers: 20 (n=24), 15 (n=32), 12 (n=40)
    for (let i = 0; i < spec.n; i++) {
      const posNum = (14 * i + 2 * spec.id + 1) * scale;
      entries.push({ posNum, pos: posNum / 6720, bundleId: spec.id, cellInBundle: i });
    }
  }
  entries.sort((a, b) => {
    if (a.posNum !== b.posNum) return a.posNum - b.posNum;
    if (a.bundleId !== b.bundleId) return a.bundleId - b.bundleId;
    return a.cellInBundle - b.cellInBundle;
  });
  return entries;
}

export const PLACEMENT_SCHEDULE = buildPlacementSchedule();

/** Pack a 16-byte cell header into dst at offset 0. */
function packHeader(dst, h) {
  dst[0] = HBIN_VERSION;
  dst[1] = h.bundleId & 0xff;
  dst[2] = h.stratum & 0xff;
  dst[3] = h.organId & 0xff;
  dst[4] = h.abiSig & 0xff;
  dst[5] = (h.abiSig >>> 8) & 0xff;
  dst[6] = h.evalX & 0xff;
  dst[7] = h.k & 0xff;
  dst[8] = h.n & 0xff;
  dst[9] = h.flags & 0xff;
  dst[10] = h.leafIdx & 0xff;
  dst[11] = (h.leafIdx >>> 8) & 0xff;
  dst[12] = h.origLen & 0xff;
  dst[13] = (h.origLen >>> 8) & 0xff;
  dst[14] = h.speciesTag & 0xff;
  dst[15] = (h.speciesTag >>> 8) & 0xff;
}

/** Unpack a 16-byte cell header from src at offset 0. */
function unpackHeader(src) {
  return {
    version: src[0],
    bundleId: src[1],
    stratum: src[2],
    organId: src[3],
    abiSig: src[4] | (src[5] << 8),
    evalX: src[6],
    k: src[7],
    n: src[8],
    flags: src[9],
    leafIdx: src[10] | (src[11] << 8),
    origLen: src[12] | (src[13] << 8),
    speciesTag: src[14] | (src[15] << 8),
  };
}

/**
 * Encode 7 compiled organ-stratum payloads into a pristine 98,304-byte .hbin binary.
 *
 * @param {object} programSpec
 *   - name: string
 *   - bundles: Map<bundleId, Uint8Array> or Array<Uint8Array> (length 7; bundle 6 may be omitted to auto-generate Genome Ledger)
 *   - metadata?: object (optional metadata embedded in Genome Ledger)
 * @returns {{ bytes: Uint8Array, lineageRoot: Uint8Array, lineageRootHex: string, sha256Hex: string, speciesTag: number, manifest: object }}
 */
export function encodeHbin(programSpec) {
  const name = programSpec.name || 'UNNAMED';
  const speciesTag =
    Number.isInteger(programSpec.speciesTag) && programSpec.speciesTag >= 0 && programSpec.speciesTag <= 0xffff
      ? programSpec.speciesTag
      : computeSpeciesTag(name);

  // Prepare raw payloads for bundles 0..5 first
  const rawPayloads = new Array(BUNDLE_SPECS.length);
  const bundleHashes = {};
  for (let b = 0; b < 6; b++) {
    const spec = BUNDLE_SPECS[b];
    const data = programSpec.bundles instanceof Map
      ? programSpec.bundles.get(b)
      : programSpec.bundles[b];
    if (data != null && !(data instanceof Uint8Array)) {
      throw new TypeError(`Bundle ${spec.name} payload must be a Uint8Array`);
    }
    const bytes = data || new Uint8Array(0);
    const maxCap = spec.k * CELL_PAYLOAD_SIZE;
    if (bytes.length > maxCap) {
      throw new RangeError(
        `Bundle ${spec.name} payload (${bytes.length}B) exceeds capacity ${maxCap}B`
      );
    }
    rawPayloads[b] = bytes;
    bundleHashes[spec.name] = toHex(sha256(bytes)).slice(0, 16);
  }

  // Bundle 6: Genome Ledger (either supplied or deterministically constructed JSON manifest)
  const suppliedGenome = programSpec.bundles instanceof Map
    ? programSpec.bundles.get(6)
    : programSpec.bundles[6];

  if (suppliedGenome != null && !(suppliedGenome instanceof Uint8Array)) {
    throw new TypeError('Bundle S3_GENOME_LEDGER payload must be a Uint8Array');
  }
  if (suppliedGenome && suppliedGenome.length > 0) {
    const maxCap = BUNDLE_SPECS[6].k * CELL_PAYLOAD_SIZE;
    if (suppliedGenome.length > maxCap) {
      throw new RangeError(`Genome ledger (${suppliedGenome.length}B) exceeds ${maxCap}B`);
    }
    rawPayloads[6] = suppliedGenome;
  } else {
    const genomeObj = {
      format: 'PLANARIA-HBIN-1',
      name,
      speciesTag,
      cellSize: CELL_SIZE,
      totalCells: TOTAL_CELLS,
      bundleLengths: rawPayloads.slice(0, 6).map((p) => p.length),
      bundleHashes,
      meta: programSpec.metadata || {},
    };
    const encoded = new TextEncoder().encode(JSON.stringify(genomeObj));
    const maxCap = BUNDLE_SPECS[6].k * CELL_PAYLOAD_SIZE;
    if (encoded.length > maxCap) {
      throw new RangeError(`Genome ledger (${encoded.length}B) exceeds ${maxCap}B`);
    }
    rawPayloads[6] = encoded;
  }

  // Step 1: Cauchy MDS encode every bundle into its n_b holographic shards
  const codedByBundle = BUNDLE_SPECS.map((spec, idx) =>
    cauchyEncode(rawPayloads[idx], spec.k, spec.n, CELL_PAYLOAD_SIZE)
  );

  // Step 2: Assemble 192 unarmored leaf commitments (header 16B || payload 332B = 348B)
  // in exact deterministic physical placement order (leafIdx === physical slot index)
  const leafCommitments = new Array(TOTAL_CELLS);
  const cellMeta = new Array(TOTAL_CELLS);

  for (let slot = 0; slot < TOTAL_CELLS; slot++) {
    const { bundleId, cellInBundle } = PLACEMENT_SCHEDULE[slot];
    const spec = BUNDLE_SPECS[bundleId];
    const coded = codedByBundle[bundleId][cellInBundle];

    const commit = new Uint8Array(CELL_HEADER_SIZE + CELL_PAYLOAD_SIZE); // 348 bytes
    packHeader(commit, {
      bundleId: spec.id,
      stratum: spec.stratum,
      organId: spec.organId,
      abiSig: spec.abiSig,
      evalX: coded.evalX,
      k: spec.k,
      n: spec.n,
      flags: spec.xenograftable ? 0x01 : 0x00,
      leafIdx: slot,
      origLen: rawPayloads[bundleId].length,
      speciesTag,
    });
    commit.set(coded.shard, CELL_HEADER_SIZE);
    leafCommitments[slot] = commit;
    cellMeta[slot] = { slot, bundleId, stratum: spec.stratum, organId: spec.organId, evalX: coded.evalX };
  }

  // Step 3: Build Depth-8 SHA-256 Merkle Tree over all 192 cells -> single 128-bit Lineage Root
  const merkle = buildMerkleTree(leafCommitments);

  // Step 4: Armor every cell with its 128-byte Merkle proof + 2-way interleaved RS(254, 238) + 4B sync
  const out = new Uint8Array(TOTAL_HBIN_BYTES);
  const bodyScratch = new Uint8Array(CELL_BODY_SIZE);

  for (let slot = 0; slot < TOTAL_CELLS; slot++) {
    const proof = getMerkleProof(merkle, slot);
    bodyScratch.set(leafCommitments[slot], 0);
    bodyScratch.set(proof, CELL_HEADER_SIZE + CELL_PAYLOAD_SIZE);

    const armored508 = rsArmorInterleaved(bodyScratch);
    const cellOff = slot * CELL_SIZE;
    out.set(SYNC_WORD, cellOff);
    out.set(armored508, cellOff + 4);
  }

  const fileHash = toHex(sha256(out));
  return {
    bytes: out,
    lineageRoot: merkle.root,
    lineageRootHex: merkle.rootHex,
    sha256Hex: fileHash,
    speciesTag,
    manifest: {
      name,
      speciesTag,
      lineageRootHex: merkle.rootHex,
      sha256Hex: fileHash,
      totalBytes: out.length,
      totalCells: TOTAL_CELLS,
      bundles: BUNDLE_SPECS.map((s, i) => ({
        id: s.id,
        name: s.name,
        organId: s.organId,
        stratum: s.stratum,
        k: s.k,
        n: s.n,
        origLen: rawPayloads[i].length,
      })),
    },
  };
}

/**
 * Unaligned Sliding-Window Cellular Harvester, Inner RS(254,238) Self-Healer,
 * Merkle Byzantine Immune System, Outer Cauchy MDS Decoder & Xenograft Splicer.
 *
 * Accepts ANY raw byte stream — truncated, shifted, shuffled, bit-rotted, noise-padded,
 * Byzantine-poisoned, or raw-concatenated from multiple shards / multiple species!
 *
 * @param {Uint8Array} rawBytes
 * @param {object} [options]
 *   - pinnedRootHex?: string       (Strict cryptographic pinning; rejects ALL non-matching roots!)
 *   - allowXenograft?: boolean     (Allow ABI-compatible secondary-lineage donor organs when primary organ is amputated)
 *   - disableImmuneSystem?: boolean (Falsification mode ONLY: bypasses Merkle quarantine to expose raw Cauchy poisoning!)
 */
export function decodeHbin(rawBytes, options = {}) {
  const buf = toBytes(rawBytes);
  const pinnedRootHex = options.pinnedRootHex ? String(options.pinnedRootHex).trim().toLowerCase() : null;
  const requestedXenograft = Boolean(options.allowXenograft);
  const disableImmuneSystem = Boolean(options.disableImmuneSystem);
  const maxInputBytes = Number.isInteger(options.maxInputBytes) && options.maxInputBytes > 0
    ? options.maxInputBytes
    : 8 * 1024 * 1024;
  const maxSyncCandidates = Number.isInteger(options.maxSyncCandidates) && options.maxSyncCandidates > 0
    ? options.maxSyncCandidates
    : 16384;
  const maxRsFailures = Number.isInteger(options.maxRsFailures) && options.maxRsFailures > 0
    ? options.maxRsFailures
    : 4096;

  // Enforce host sovereignty on Xenografting: require pinnedRootHex unless explicitly opted into unpinned mode
  const xenograftBlockedUnpinned = requestedXenograft && !pinnedRootHex && !options.allowUnpinnedXenograft;
  const allowXenograft = requestedXenograft && !xenograftBlockedUnpinned;

  const harvested = [];
  const harvestedOffsets = new Set();
  const flywheelOffsets = new Set();
  let syncCandidates = 0;
  let rsFailedCells = 0;
  let rsRepairedCells = 0;
  let rsTotalByteErrorsFixed = 0;
  let unalignedRecoveries = 0;
  let flywheelRecoveries = 0;
  let truncatedByBudget = false;

  const scanLen = Math.min(buf.length, maxInputBytes);
  if (buf.length > maxInputBytes) truncatedByBudget = true;
  const limit = scanLen - CELL_SIZE;

  function tryHarvestAt(off, dist, fromFlywheel) {
    if (off < 0 || off > limit || harvestedOffsets.has(off)) return null;
    if (syncCandidates >= maxSyncCandidates || rsFailedCells >= maxRsFailures) {
      truncatedByBudget = true;
      return null;
    }
    syncCandidates++;
    const block508 = buf.subarray(off + 4, off + CELL_SIZE);
    const rsRes = rsUnarmorInterleaved(block508);
    if (!rsRes.ok) {
      rsFailedCells++;
      return null;
    }
    const body = rsRes.body;
    const header = unpackHeader(body.subarray(0, CELL_HEADER_SIZE));
    const spec = BUNDLE_SPECS[header.bundleId];
    const sched = header.leafIdx < TOTAL_CELLS ? PLACEMENT_SCHEDULE[header.leafIdx] : null;

    // Strict structural validation against BUNDLE_SPECS and PLACEMENT_SCHEDULE
    // (blocks 256-cell header-forgery Sybil inflation and invalid origLen)
    const validSpec =
      Boolean(spec && sched) &&
      header.version === HBIN_VERSION &&
      header.stratum === spec.stratum &&
      header.organId === spec.organId &&
      header.k === spec.k &&
      header.n === spec.n &&
      sched.bundleId === header.bundleId &&
      header.evalX === spec.k + sched.cellInBundle &&
      header.origLen <= spec.k * CELL_PAYLOAD_SIZE;

    if (!validSpec) {
      rsFailedCells++;
      return null;
    }

    const commit348 = body.subarray(0, CELL_HEADER_SIZE + CELL_PAYLOAD_SIZE);
    const payload = body.subarray(CELL_HEADER_SIZE, CELL_HEADER_SIZE + CELL_PAYLOAD_SIZE);
    const merkleProof = body.subarray(CELL_HEADER_SIZE + CELL_PAYLOAD_SIZE, CELL_BODY_SIZE);
    const impliedRoot = computeMerkleRootFromProof(commit348, header.leafIdx, merkleProof);
    const impliedRootHex = toHex(impliedRoot);

    harvestedOffsets.add(off);
    if (rsRes.errorsCorrected > 0) {
      rsRepairedCells++;
      rsTotalByteErrorsFixed += rsRes.errorsCorrected;
    }
    if (off % CELL_SIZE !== 0) {
      unalignedRecoveries++;
    }
    if (fromFlywheel && dist > SYNC_MAX_BIT_ERRORS) {
      flywheelRecoveries++;
    }

    const cellObj = {
      byteOffset: off,
      syncBitErrors: dist,
      rsErrorsFixed: rsRes.errorsCorrected,
      header,
      payload: new Uint8Array(payload),
      merkleProof: new Uint8Array(merkleProof),
      impliedRootHex,
    };
    harvested.push(cellObj);

    // CCSDS-style cell-cadence flywheel: once an authentic (or pinned) cell locks cadence,
    // probe immediately adjacent +/- 512B slots even if their 4-byte sync word took a burst!
    const cadenceTrusted = !pinnedRootHex || impliedRootHex === pinnedRootHex;
    if (cadenceTrusted) {
      if (off + CELL_SIZE <= limit && !harvestedOffsets.has(off + CELL_SIZE)) {
        flywheelOffsets.add(off + CELL_SIZE);
      }
      if (off - CELL_SIZE >= 0 && !harvestedOffsets.has(off - CELL_SIZE)) {
        const prevDist = syncBitDistance(buf, off - CELL_SIZE);
        if (prevDist > SYNC_MAX_BIT_ERRORS) {
          tryHarvestAt(off - CELL_SIZE, prevDist, true);
        }
      }
    }
    return cellObj;
  }

  // Step 1: Byte-granular sliding-window fuzzy sync correlator + cadence flywheel.
  // Never jumps blindly across unverified/repaired offsets -> eliminates Overlap-Eclipse & Cell-Eating!
  for (let offset = 0; offset <= limit; offset++) {
    if (harvestedOffsets.has(offset)) continue;
    const isFlywheel = flywheelOffsets.has(offset);
    const dist = syncBitDistance(buf, offset);
    if (dist <= SYNC_MAX_BIT_ERRORS || isFlywheel) {
      tryHarvestAt(offset, dist, isFlywheel);
      if (truncatedByBudget) break;
    }
  }

  // Step 2: Cryptographic Byzantine Immune System (Merkle Quorum / Pinned Root Filter)
  const rootGroups = new Map();
  const rootUniqueCounts = new Map();
  for (const cell of harvested) {
    let arr = rootGroups.get(cell.impliedRootHex);
    if (!arr) {
      arr = [];
      rootGroups.set(cell.impliedRootHex, arr);
    }
    arr.push(cell);
  }
  for (const [rHex, cells] of rootGroups.entries()) {
    rootUniqueCounts.set(
      rHex,
      new Set(cells.map((c) => `${c.header.bundleId}:${c.header.evalX}`)).size
    );
  }

  let primaryRootHex = pinnedRootHex;
  let quorumAmbiguous = false;
  if (!primaryRootHex && !disableImmuneSystem) {
    // Consensus Quorum Election: choose the unique lineage root with the largest number of
    // distinct authenticated cells; enforce >= 2 quorum when multiple roots compete, and fail
    // closed on exact ties (no byte-stream insertion-order bias).
    let bestRoot = null;
    let bestUnique = 0;
    let tieCount = 0;
    for (const [rHex, uniq] of rootUniqueCounts.entries()) {
      if (uniq > bestUnique) {
        bestUnique = uniq;
        bestRoot = rHex;
        tieCount = 1;
      } else if (uniq === bestUnique && uniq > 0) {
        tieCount++;
      }
    }
    if (bestUnique < 2 && rootGroups.size > 1) {
      primaryRootHex = null;
      quorumAmbiguous = true;
    } else if (tieCount > 1) {
      primaryRootHex = null;
      quorumAmbiguous = true;
    } else {
      primaryRootHex = bestRoot;
    }
  }

  const authenticPrimary = [];
  const quarantinedCells = [];
  const donorGroups = new Map(); // rootHex -> cells (for Xenografting)

  if (disableImmuneSystem) {
    // UNSAFE FALSIFICATION MODE: Accept every RS-valid cell without Merkle verification!
    for (const cell of harvested) {
      authenticPrimary.push(cell);
    }
  } else {
    for (const cell of harvested) {
      if (primaryRootHex && cell.impliedRootHex === primaryRootHex) {
        authenticPrimary.push(cell);
      } else {
        // Require >= 4 UNIQUE (bundleId:evalX) cells to form a genuine coherent donor quorum
        // (prevents single-Trojan duplicate-replay amplification into donorGroups)
        const uniqDonorSize = rootUniqueCounts.get(cell.impliedRootHex) || 0;
        if (allowXenograft && uniqDonorSize >= 4) {
          let dArr = donorGroups.get(cell.impliedRootHex);
          if (!dArr) {
            dArr = [];
            donorGroups.set(cell.impliedRootHex, dArr);
          }
          dArr.push(cell);
        } else {
          quarantinedCells.push(cell);
        }
      }
    }
  }

  // Helper to group cells by bundleId and decode each bundle via exact Cauchy GF(2^8) elimination
  function decodeGroup(cells) {
    const uniqueByBundle = Array.from({ length: BUNDLE_SPECS.length }, () => new Map());
    for (const c of cells) {
      const b = c.header.bundleId;
      if (!uniqueByBundle[b].has(c.header.evalX)) {
        uniqueByBundle[b].set(c.header.evalX, c);
      }
    }

    const bundles = new Array(BUNDLE_SPECS.length);
    for (let b = 0; b < BUNDLE_SPECS.length; b++) {
      const spec = BUNDLE_SPECS[b];
      const uniqCells = Array.from(uniqueByBundle[b].values());
      const count = uniqCells.length;
      if (count >= spec.k) {
        const firstHdr = uniqCells[0].header;
        const origLen = firstHdr.origLen;
        const headerAbiSig = firstHdr.abiSig;
        const headerFlags = firstHdr.flags;
        const headerSpeciesTag = firstHdr.speciesTag;

        // Require cross-cell metadata consistency (skipped only in unsafe disableImmuneSystem mode
        // so falsification tests can observe raw unauthenticated Cauchy poisoning!)
        const metadataConsistent =
          disableImmuneSystem ||
          (origLen <= spec.k * CELL_PAYLOAD_SIZE &&
            uniqCells.every(
              (c) =>
                c.header.origLen === origLen &&
                c.header.abiSig === headerAbiSig &&
                c.header.flags === headerFlags &&
                c.header.speciesTag === headerSpeciesTag
            ));

        const dec = metadataConsistent
          ? cauchyDecode(
              uniqCells.map((c) => ({ evalX: c.header.evalX, shard: c.payload })),
              spec.k,
              CELL_PAYLOAD_SIZE,
              origLen
            )
          : { ok: false, reason: 'inconsistent_bundle_headers' };

        bundles[b] = {
          id: b,
          name: spec.name,
          organId: spec.organId,
          stratum: spec.stratum,
          abiSig: headerAbiSig,
          xenograftable: (headerFlags & 0x01) !== 0,
          k: spec.k,
          n: spec.n,
          cellsFound: count,
          viable: dec.ok,
          data: dec.ok ? dec.data : null,
          source: 'PRIMARY',
          lineageRootHex: uniqCells[0].impliedRootHex,
          speciesTag: headerSpeciesTag,
        };
      } else {
        bundles[b] = {
          id: b,
          name: spec.name,
          organId: spec.organId,
          stratum: spec.stratum,
          abiSig: spec.abiSig,
          xenograftable: spec.xenograftable,
          k: spec.k,
          n: spec.n,
          cellsFound: count,
          viable: false,
          data: null,
          source: 'MISSING',
          lineageRootHex: null,
          speciesTag: null,
        };
      }
    }
    return bundles;
  }

  const bundles = decodeGroup(authenticPrimary);

  // Step 3: Optional ABI-Verified Cross-Species Xenograft Anastomosis
  const xenografts = [];
  if (allowXenograft && donorGroups.size > 0) {
    // Sort donors by UNIQUE cell count descending (immune to duplicate-cell flooding)
    const sortedDonors = Array.from(donorGroups.entries()).sort(
      (a, b) => (rootUniqueCounts.get(b[0]) || 0) - (rootUniqueCounts.get(a[0]) || 0)
    );
    for (const [donorRootHex, donorCells] of sortedDonors) {
      const donorBundles = decodeGroup(donorCells);
      for (let b = 0; b < BUNDLE_SPECS.length; b++) {
        const spec = BUNDLE_SPECS[b];
        if (!spec.xenograftable) continue;
        if (
          !bundles[b].viable &&
          donorBundles[b].viable &&
          donorBundles[b].abiSig === spec.abiSig &&
          donorBundles[b].xenograftable
        ) {
          bundles[b] = {
            ...donorBundles[b],
            source: 'XENOGRAFT',
            donorRootHex,
          };
          xenografts.push({
            bundleId: b,
            bundleName: spec.name,
            organName: ORGAN_NAMES[spec.organId],
            stratum: spec.stratum,
            abiSig: spec.abiSig,
            donorRootHex,
            donorSpeciesTag: donorBundles[b].speciesTag,
            donorCellsUsed: donorBundles[b].cellsFound,
          });
        }
      }
    }
  }

  // Step 4: Compute highest viable Stratum and Genome Ledger parsing
  let maxViableStratum = -1;
  if (bundles[0].viable) {
    maxViableStratum = 0;
    if (bundles[1].viable || bundles[2].viable || bundles[3].viable) {
      maxViableStratum = 1;
      if (bundles[1].viable && (bundles[3].viable || bundles[4].viable)) {
        maxViableStratum = 2;
        if (bundles[3].viable && bundles[4].viable && bundles[5].viable) {
          maxViableStratum = 3;
        }
      }
    }
  }

  let genome = null;
  if (bundles[6].viable && bundles[6].data) {
    try {
      genome = JSON.parse(new TextDecoder().decode(bundles[6].data));
    } catch {
      genome = null;
    }
  }

  const canFullRegenerate = bundles.every((b) => b.viable);

  // Build per-slot cell status map (0..191) for visual Cellular Tissue Map inspection
  const slotMap = new Array(TOTAL_CELLS).fill(null);
  for (const c of authenticPrimary) {
    if (c.header.leafIdx < TOTAL_CELLS && !slotMap[c.header.leafIdx]) {
      slotMap[c.header.leafIdx] = {
        status: c.rsErrorsFixed > 0 ? 'REPAIRED' : 'INTACT',
        bundleId: c.header.bundleId,
        stratum: c.header.stratum,
        organId: c.header.organId,
        evalX: c.header.evalX,
        rsErrorsFixed: c.rsErrorsFixed,
        syncBitErrors: c.syncBitErrors,
        byteOffset: c.byteOffset,
        impliedRootHex: c.impliedRootHex,
      };
    }
  }
  for (const c of quarantinedCells) {
    if (c.header.leafIdx < TOTAL_CELLS && !slotMap[c.header.leafIdx]) {
      slotMap[c.header.leafIdx] = {
        status: 'QUARANTINED',
        bundleId: c.header.bundleId,
        stratum: c.header.stratum,
        organId: c.header.organId,
        evalX: c.header.evalX,
        rsErrorsFixed: c.rsErrorsFixed,
        syncBitErrors: c.syncBitErrors,
        byteOffset: c.byteOffset,
        impliedRootHex: c.impliedRootHex,
      };
    }
  }
  if (allowXenograft) {
    for (const [, dCells] of donorGroups.entries()) {
      for (const c of dCells) {
        if (c.header.leafIdx < TOTAL_CELLS && !slotMap[c.header.leafIdx]) {
          slotMap[c.header.leafIdx] = {
            status: 'XENOGRAFT',
            bundleId: c.header.bundleId,
            stratum: c.header.stratum,
            organId: c.header.organId,
            evalX: c.header.evalX,
            rsErrorsFixed: c.rsErrorsFixed,
            syncBitErrors: c.syncBitErrors,
            byteOffset: c.byteOffset,
            impliedRootHex: c.impliedRootHex,
          };
        }
      }
    }
  }

  return {
    bootable: bundles[0].viable,
    maxViableStratum,
    canFullRegenerate,
    primaryRootHex,
    genome,
    bundles,
    xenografts,
    stats: {
      inputBytes: buf.length,
      syncCandidates,
      harvestedCells: harvested.length,
      authenticCells: authenticPrimary.length,
      rsRepairedCells,
      rsTotalByteErrorsFixed,
      rsFailedCells,
      byzantineQuarantined: quarantinedCells.length,
      xenograftDonorCells: Array.from(donorGroups.values()).reduce((a, g) => a + g.length, 0),
      unalignedRecoveries,
      flywheelRecoveries,
      truncatedByBudget,
      quorumAmbiguous,
      xenograftBlockedUnpinned,
      immuneSystemEnabled: !disableImmuneSystem,
    },
    slotMap,
    rawHarvested: harvested,
    quarantinedCells,
  };
}

/**
 * Self-Regenerate a complete pristine 98,304-byte .hbin binary from a decoded organism
 * (e.g., from a 50% bisected shard, concatenated pair of damaged shards, or chimeric xenograft!).
 *
 * When all 7 bundles of a pure organism survive (canFullRegenerate === true), the re-emitted
 * binary is 100.000% SHA-256 bit-for-bit IDENTICAL to the original pristine .hbin!
 */
export function regenerateHbin(decoded, overrideName = null, options = {}) {
  if (!decoded || !decoded.bootable) {
    throw new Error('Cannot regenerate: Stratum 0 Stem Nucleus is dead.');
  }
  if (decoded.stats && decoded.stats.immuneSystemEnabled === false) {
    throw new Error('Cannot regenerate from an unauthenticated decode (immuneSystemEnabled === false).');
  }
  const hasAll = decoded.bundles.every((b) => b.viable);
  const allowPartial = Boolean(options.allowPartial);
  if (!hasAll && !allowPartial) {
    throw new Error(
      'Cannot perform 100% lossless regeneration: one or more bundles are below Cauchy threshold k.'
    );
  }
  const isChimera = decoded.xenografts.length > 0;
  const name =
    overrideName ||
    (isChimera
      ? `${decoded.genome?.name || 'HOST'}_X_CHIMERA`
      : decoded.genome?.name || 'REGENERATED');

  const bundlePayloads = decoded.bundles.map((b) => (b.viable && b.data ? b.data : new Uint8Array(0)));
  // If pure regeneration (not chimera, no name override) preserve exact bundle 6 genome ledger bytes
  // AND original speciesTag so SHA-256 matches the pristine original bit-for-bit even on non-JSON Bundle 6!
  const preservePure = !isChimera && !overrideName && hasAll;
  if (!preservePure) {
    bundlePayloads[6] = new Uint8Array(0); // regenerate fresh chimera/override genome ledger
  }

  return encodeHbin({
    name,
    speciesTag: preservePure ? decoded.bundles[0].speciesTag : undefined,
    bundles: bundlePayloads,
    metadata: isChimera
      ? {
          chimera: true,
          parentHostRoot: decoded.primaryRootHex,
          xenografts: decoded.xenografts,
        }
      : decoded.genome?.meta || {},
  });
}

/**
 * Inspect a single 512-byte cell slice for forensic / UI Hex Anatomy viewing.
 */
export function inspectSingleCell(rawCell512) {
  const cell512 = toBytes(rawCell512);
  if (cell512.length < CELL_SIZE) return null;
  const syncDist = syncBitDistance(cell512, 0);
  const block508 = cell512.subarray(4, CELL_SIZE);
  const rsRes = rsUnarmorInterleaved(block508);
  const rawBody = rsRes.ok ? rsRes.body : block508.subarray(0, CELL_BODY_SIZE);
  const header = unpackHeader(rawBody.subarray(0, CELL_HEADER_SIZE));
  const payload = rawBody.subarray(CELL_HEADER_SIZE, CELL_HEADER_SIZE + CELL_PAYLOAD_SIZE);
  const proof = rawBody.subarray(CELL_HEADER_SIZE + CELL_PAYLOAD_SIZE, CELL_BODY_SIZE);
  const commit = rawBody.subarray(0, CELL_HEADER_SIZE + CELL_PAYLOAD_SIZE);
  const impliedRootHex =
    rsRes.ok && header.leafIdx < TOTAL_CELLS
      ? toHex(computeMerkleRootFromProof(commit, header.leafIdx, proof))
      : null;

  return {
    syncHex: toHex(cell512.subarray(0, 4)),
    syncBitErrors: syncDist,
    rsOk: rsRes.ok,
    rsReason: rsRes.ok ? 'OK' : rsRes.reason,
    rsErrorsFixed: rsRes.errorsCorrected || 0,
    header,
    bundleName: BUNDLE_SPECS[header.bundleId]?.name || 'CORRUPT',
    organName: ORGAN_NAMES[header.organId] || 'UNKNOWN',
    payloadPreviewHex: toHex(payload.subarray(0, 32)),
    proofHex: toHex(proof.subarray(0, 32)),
    parityHex: toHex(cell512.subarray(CELL_PARITY_OFFSET, CELL_SIZE)),
    impliedRootHex,
  };
}
