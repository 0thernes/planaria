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

import { gfMul, gfInv } from './gf256.js';

/** Compute single Cauchy entry C(x_i, y_j) = (x_i ^ y_j)^(-1) in GF(2^8). */
export function cauchyEntry(xVal, yVal) {
  const diff = (xVal ^ yVal) & 0xff;
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
  if (k < 1 || n < k || k + n > 256) {
    throw new RangeError(`Invalid Cauchy MDS parameters: k=${k}, n=${n}`);
  }
  const capacity = k * shardSize;
  if (payload.length > capacity) {
    throw new RangeError(`Payload (${payload.length}B) exceeds k*shardSize (${capacity}B)`);
  }

  // Partition payload into k padded source chunks D_0..D_{k-1}
  const padded = new Uint8Array(capacity);
  padded.set(payload, 0);

  const cells = new Array(n);
  for (let i = 0; i < n; i++) {
    const evalX = k + i;
    const shard = new Uint8Array(shardSize);
    for (let j = 0; j < k; j++) {
      const c = cauchyEntry(evalX, j);
      const srcOffset = j * shardSize;
      for (let b = 0; b < shardSize; b++) {
        const val = padded[srcOffset + b];
        if (val !== 0) {
          shard[b] ^= gfMul(c, val);
        }
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
  const A = new Uint8Array(mat);
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
  // Deduplicate by evalX and validate disjointness from Y = {0..k-1}
  const unique = [];
  const seen = new Set();
  for (const cell of cells) {
    if (cell.evalX < k || cell.evalX > 255) continue;
    if (seen.has(cell.evalX)) continue;
    if (!cell.shard || cell.shard.length !== shardSize) continue;
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
  const full = new Uint8Array(k * shardSize);
  for (let j = 0; j < k; j++) {
    const dstOffset = j * shardSize;
    for (let r = 0; r < k; r++) {
      const coeff = Minv[j * k + r];
      if (coeff === 0) continue;
      const src = unique[r].shard;
      for (let b = 0; b < shardSize; b++) {
        const val = src[b];
        if (val !== 0) {
          full[dstOffset + b] ^= gfMul(coeff, val);
        }
      }
    }
  }

  const clampedLen = Math.min(origLen, full.length);
  return {
    ok: true,
    data: full.subarray(0, clampedLen),
    rankUsed: k,
  };
}
