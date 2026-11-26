/**
 * Exact Cauchy-Matrix MDS Erasure Codec over GF(2^8)
 *
 * Every coded cell i in {0..n-1} is a holographic linear combination of all k source chunks:
 *     P_i = sum_{j=0}^{k-1} C_{i,j} * D_j   over GF(2^8)
 * where the Cauchy generator matrix has entries:
 *     C_{i,j} = 1 / (x_i XOR y_j)
 * with disjoint coordinate sets:
 *     Y = { 0, 1, ..., k-1 }
 *     X = { k, k+1, ..., k+n-1 }   (valid whenever k + n <= 256)
 *
 * Crucial algebraic property (Cauchy Determinant Theorem):
 *   Every k x k submatrix of C is GUARANTEED nonsingular over GF(2^8) — unlike naive
 *   Vandermonde matrices over GF(2^8), which can fail invertibility for k >= 4 when
 *   not constructed carefully. Thus ANY k distinct cells out of n reconstruct the exact
 *   original payload with 100% mathematical certainty.
 */

import { GF_MUL_TABLE, gfMul, gfInv } from './gf256.js';
import { toBytes } from './sha256.js';

/** Compute single Cauchy entry C(x_i, y_j) = (x_i ^ y_j)^(-1) in GF(2^8). */
export function cauchyEntry(xVal, yVal) {
  if (!Number.isInteger(xVal) || xVal < 0 || xVal > 255 || !Number.isInteger(yVal) || yVal < 0 || yVal > 255) {
    throw new RangeError(`Cauchy coordinates must be integers in 0..255, got x=${xVal}, y=${yVal}`);
  }
  const diff = xVal ^ yVal;
  if (diff === 0) {
    throw new RangeError(`Cauchy coordinate collision: x=${xVal}, y=${yVal}`);
  }
  return gfInv(diff);
}

/**
 * Encode raw payload bytes into n holographic Cauchy-coded shards of length shardSize each.
 * Payload length must be <= k * shardSize (zero-padded internally; exact origLen stored in cell header).
 *
 * Returns array of n objects: { evalX: k + i, shard: Uint8Array(shardSize) }
 */
export function cauchyEncode(payload, k, n, shardSize) {
  const srcBytes = toBytes(payload);
  if (!Number.isInteger(k) || !Number.isInteger(n) || !Number.isInteger(shardSize) ||
      k < 1 || n < k || k + n > 256 || shardSize < 1) {
    throw new RangeError(`Invalid Cauchy MDS parameters: k=${k}, n=${n}, shardSize=${shardSize}`);
  }
  const capacity = k * shardSize;
  if (srcBytes.length > capacity) {
    throw new RangeError(`Payload (${srcBytes.length}B) exceeds k*shardSize (${capacity}B)`);
  }

  // Partition payload into k padded source chunks D_0..D_{k-1}
  const padded = new Uint8Array(capacity);
  padded.set(srcBytes, 0);

  const cells = new Array(n);
  for (let i = 0; i < n; i++) {
    const evalX = k + i;
    const shard = new Uint8Array(shardSize);
    for (let j = 0; j < k; j++) {
      const c = cauchyEntry(evalX, j);
      const cRow = c << 8;
      const srcOffset = j * shardSize;
      for (let b = 0; b < shardSize; b++) {
        shard[b] ^= GF_MUL_TABLE[cRow | padded[srcOffset + b]];
      }
    }
    cells[i] = { evalX, shard };
  }
  return cells;
}

/**
 * Invert a k x k matrix over GF(2^8) via exact Gauss-Jordan elimination.
 * Matrix is flat row-major Uint8Array(k * k).
 * Returns flat inverse Uint8Array(k * k) or null if singular.
 */
export function invertMatrixGF256(mat, k) {
  if (!Number.isInteger(k) || k < 1) {
    throw new RangeError(`Matrix dimension k must be a positive integer, got ${k}`);
  }
  const mBytes = toBytes(mat);
  if (mBytes.length !== k * k) {
    throw new RangeError(`Expected ${k * k}-byte matrix for k=${k}, got ${mBytes.length}`);
  }
  const A = new Uint8Array(mBytes);
  const Inv = new Uint8Array(k * k);
  for (let i = 0; i < k; i++) Inv[i * k + i] = 1;

  for (let col = 0; col < k; col++) {
    // Find non-zero pivot in column `col` at or below row `col`
    let pivotRow = -1;
    for (let r = col; r < k; r++) {
      if (A[r * k + col] !== 0) {
        pivotRow = r;
        break;
      }
    }
    if (pivotRow === -1) return null;

    // Swap rows if needed
    if (pivotRow !== col) {
      for (let c = 0; c < k; c++) {
        const tmpA = A[col * k + c];
        A[col * k + c] = A[pivotRow * k + c];
        A[pivotRow * k + c] = tmpA;

        const tmpI = Inv[col * k + c];
        Inv[col * k + c] = Inv[pivotRow * k + c];
        Inv[pivotRow * k + c] = tmpI;
      }
    }

    // Normalize pivot row
    const invPivot = gfInv(A[col * k + col]);
    if (invPivot !== 1) {
      for (let c = 0; c < k; c++) {
        A[col * k + c] = gfMul(A[col * k + c], invPivot);
        Inv[col * k + c] = gfMul(Inv[col * k + c], invPivot);
      }
    }

    // Eliminate column in all other rows
    for (let r = 0; r < k; r++) {
      if (r === col) continue;
      const factor = A[r * k + col];
      if (factor === 0) continue;
      for (let c = 0; c < k; c++) {
        A[r * k + c] ^= gfMul(factor, A[col * k + c]);
        Inv[r * k + c] ^= gfMul(factor, Inv[col * k + c]);
      }
    }
  }

  return Inv;
}

/**
 * Decode original payload from any >= k distinct Cauchy-coded cells.
 * cells: array of { evalX: number, shard: Uint8Array(shardSize) }
 * origLen: original unpadded byte length
 *
 * Returns { ok: true, data: Uint8Array(origLen), rankUsed: k } or { ok: false, reason }
 */
export function cauchyDecode(cells, k, shardSize, origLen) {
  if (!Number.isInteger(k) || k < 1 || k > 128) {
    return { ok: false, reason: 'invalid_k', rankFound: 0, rankNeeded: k };
  }
  if (!Number.isInteger(shardSize) || shardSize < 1) {
    return { ok: false, reason: 'invalid_shard_size', rankFound: 0, rankNeeded: k };
  }
  const maxLen = k * shardSize;
  if (!Number.isSafeInteger(maxLen) || maxLen > 64 * 1024 * 1024) {
    return { ok: false, reason: 'invalid_shard_size', rankFound: 0, rankNeeded: k };
  }
  if (!Number.isInteger(origLen) || origLen < 0 || origLen > maxLen) {
    return { ok: false, reason: 'invalid_orig_len', rankFound: 0, rankNeeded: k };
  }
  if (!Array.isArray(cells)) {
    return { ok: false, reason: 'invalid_cells', rankFound: 0, rankNeeded: k };
  }

  // Deduplicate by exact integer evalX and validate disjointness from Y = {0..k-1}
  const unique = [];
  const seen = new Set();
  for (const cell of cells) {
    if (!cell || !Number.isInteger(cell.evalX) || cell.evalX < k || cell.evalX > 255) continue;
    if (seen.has(cell.evalX)) continue;
    if (!(cell.shard instanceof Uint8Array) || cell.shard.length !== shardSize) continue;
    seen.add(cell.evalX);
    unique.push(cell);
    if (unique.length === k) break;
  }

  if (unique.length < k) {
    return { ok: false, reason: 'insufficient_rank', rankFound: unique.length, rankNeeded: k };
  }

  // Build k x k Cauchy submatrix
  const M = new Uint8Array(k * k);
  for (let r = 0; r < k; r++) {
    const xVal = unique[r].evalX;
    for (let c = 0; c < k; c++) {
      M[r * k + c] = cauchyEntry(xVal, c);
    }
  }

  const Minv = invertMatrixGF256(M, k);
  if (!Minv) {
    return { ok: false, reason: 'singular_matrix', rankFound: unique.length, rankNeeded: k };
  }

  // Reconstruct k source blocks: D_j = sum_{r=0}^{k-1} Minv[j, r] * P_r
  const full = new Uint8Array(maxLen);
  for (let j = 0; j < k; j++) {
    const dstOffset = j * shardSize;
    for (let r = 0; r < k; r++) {
      const coeff = Minv[j * k + r];
      if (coeff === 0) continue;
      const cRow = coeff << 8;
      const src = unique[r].shard;
      for (let b = 0; b < shardSize; b++) {
        full[dstOffset + b] ^= GF_MUL_TABLE[cRow | src[b]];
      }
    }
  }

  return {
    ok: true,
    data: full.slice(0, origLen),
    rankUsed: k,
  };
}
