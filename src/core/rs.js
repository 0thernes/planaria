/**
 * Exact Inner Reed-Solomon RS(254, 238) Codec over GF(2^8)
 *
 * Parameters:
 *   Codeword length N = 254 bytes
 *   Data length     K = 238 bytes
 *   Parity length  2t = 16 bytes  (minimum distance d_min = 17)
 *   Guaranteed unique error correction: up to t = 8 arbitrary byte errors per codeword.
 *
 * Inside a 512-byte PLANARIA Holographic Cell (4B sync + 476B body + 32B parity):
 *   Two interleaved RS(254, 238) codewords cover bytes 4..511, providing:
 *   - Up to 16 random byte errors (8 even-offset + 8 odd-offset), AND
 *   - Guaranteed recovery of any single contiguous burst error up to 16 consecutive bytes!
 *
 * Algebraic Decoder Pipeline:
 *   1. Exact 16-syndrome evaluation S_i = Y(alpha^i), i = 0..15 (fcr = 0)
 *   2. Berlekamp-Massey minimal error-locator synthesis Lambda(x)
 *   3. Exhaustive Chien search over all 254 positions + degree/root count check
 *   4. Forney error-evaluator Omega(x) = (S(x) * Lambda(x)) mod x^16 & exact error magnitudes
 *   5. Post-correction full-syndrome zero verification (eliminates silent miscorrection)
 */

import {
  GF_EXP,
  gfMul,
  gfDiv,
  gfInv,
  gfPolyEval,
  gfPolyEvalAsc,
  gfPolyMulDesc,
  gfPolyMulAsc,
} from './gf256.js';

export const RS_N = 254;
export const RS_K = 238;
export const RS_PARITY = 16; // 2t = 16 -> t = 8
export const RS_MAX_ERRORS = 8;

/** Build systematic generator polynomial g(x) = prod_{i=0}^{2t-1} (x + alpha^i) in descending order. */
function buildGenerator(nsym) {
  let g = new Uint8Array([1]);
  for (let i = 0; i < nsym; i++) {
    g = gfPolyMulDesc(g, new Uint8Array([1, GF_EXP[i]]));
  }
  return g; // length nsym + 1, monic (g[0] === 1)
}

export const RS_GENERATOR = buildGenerator(RS_PARITY);

/**
 * Systematic RS(254, 238) encoder.
 * Accepts any payload of length <= RS_K (shortened RS is automatically valid because leading zeros
 * do not change the polynomial remainder), returning codeword of length data.length + RS_PARITY.
 */
export function rsEncode(data) {
  if (data.length > RS_K) {
    throw new RangeError(`RS(${RS_N},${RS_K}) data length ${data.length} exceeds ${RS_K}`);
  }
  const out = new Uint8Array(data.length + RS_PARITY);
  out.set(data, 0);
  const rem = new Uint8Array(RS_PARITY);

  for (let i = 0; i < data.length; i++) {
    const feedback = data[i] ^ rem[0];
    // Shift LFSR left by 1
    for (let j = 0; j < RS_PARITY - 1; j++) {
      rem[j] = rem[j + 1];
    }
    rem[RS_PARITY - 1] = 0;
    if (feedback !== 0) {
      for (let j = 0; j < RS_PARITY; j++) {
        rem[j] ^= gfMul(RS_GENERATOR[j + 1], feedback);
      }
    }
  }
  out.set(rem, data.length);
  return out;
}

/** Compute the 16 syndromes S_i = Y(alpha^i) for i = 0..15. */
export function rsSyndromes(codeword) {
  const synd = new Uint8Array(RS_PARITY);
  let hasError = false;
  for (let i = 0; i < RS_PARITY; i++) {
    const s = gfPolyEval(codeword, GF_EXP[i]);
    synd[i] = s;
    if (s !== 0) hasError = true;
  }
  return { synd, hasError };
}

/**
 * Berlekamp-Massey algorithm over GF(2^8).
 * Returns ascending error-locator polynomial Lambda(x) = 1 + L_1 x + ... + L_nu x^nu.
 */
function berlekampMassey(synd) {
  const nsym = synd.length;
  let C = new Uint8Array(nsym + 1);
  let B = new Uint8Array(nsym + 1);
  C[0] = 1;
  B[0] = 1;
  let L = 0;
  let m = 1;
  let b = 1;

  for (let n = 0; n < nsym; n++) {
    // Discrepancy d = S_n + sum_{i=1..L} C_i * S_{n-i}
    let d = synd[n];
    for (let i = 1; i <= L; i++) {
      if (C[i] !== 0 && synd[n - i] !== 0) {
        d ^= gfMul(C[i], synd[n - i]);
      }
    }
    if (d === 0) {
      m++;
    } else {
      const T = C.slice();
      const coef = gfDiv(d, b);
      for (let i = 0; i + m <= nsym; i++) {
        if (B[i] !== 0) {
          C[i + m] ^= gfMul(coef, B[i]);
        }
      }
      if (2 * L <= n) {
        L = n + 1 - L;
        B = T;
        b = d;
        m = 1;
      } else {
        m++;
      }
    }
  }

  return { lambda: C.subarray(0, L + 1), degree: L };
}

/**
 * Algebraic RS(254, 238) decoder (Berlekamp-Massey + Chien + Forney + Syndrome Recheck).
 *
 * Returns:
 *   { ok: true, data: Uint8Array, codeword: Uint8Array, errorsCorrected: number, positions: number[] }
 *   or
 *   { ok: false, reason: string, errorsCorrected: 0, positions: [] }
 */
export function rsDecode(codeword) {
  const len = codeword.length;
  if (len <= RS_PARITY || len > RS_N) {
    return { ok: false, reason: 'invalid_length', errorsCorrected: 0, positions: [] };
  }

  const out = new Uint8Array(codeword);
  const { synd, hasError } = rsSyndromes(out);
  if (!hasError) {
    return {
      ok: true,
      data: out.subarray(0, len - RS_PARITY),
      codeword: out,
      errorsCorrected: 0,
      positions: [],
    };
  }

  // Step 1: Berlekamp-Massey
  const { lambda, degree } = berlekampMassey(synd);
  if (degree === 0 || degree > RS_MAX_ERRORS) {
    return { ok: false, reason: 'uncorrectable_degree', errorsCorrected: 0, positions: [] };
  }

  // Step 2: Chien Search across all codeword byte indices j = 0..len-1
  // Byte index j corresponds to polynomial power p = len - 1 - j, locator X_k = alpha^p, root X_k^-1 = alpha^(255-p).
  const positions = [];
  const xInvList = [];
  const xList = [];
  for (let j = 0; j < len; j++) {
    const p = len - 1 - j;
    const xInv = p === 0 ? 1 : GF_EXP[255 - p];
    if (gfPolyEvalAsc(lambda, xInv) === 0) {
      positions.push(j);
      xInvList.push(xInv);
      xList.push(GF_EXP[p]);
    }
  }

  if (positions.length !== degree) {
    return { ok: false, reason: 'chien_root_mismatch', errorsCorrected: 0, positions: [] };
  }

  // Step 3: Forney Error Evaluator
  // Omega(x) = (S(x) * Lambda(x)) mod x^RS_PARITY
  const omega = gfPolyMulAsc(synd, lambda, RS_PARITY);

  // Formal derivative of Lambda(x) in GF(2^8): odd-indexed coefficients only
  const lambdaDeriv = new Uint8Array(lambda.length);
  for (let i = 1; i < lambda.length; i += 2) {
    lambdaDeriv[i - 1] = lambda[i];
  }

  for (let k = 0; k < positions.length; k++) {
    const xInv = xInvList[k];
    const xVal = xList[k];
    const num = gfMul(xVal, gfPolyEvalAsc(omega, xInv));
    const den = gfPolyEvalAsc(lambdaDeriv, xInv);
    if (den === 0) {
      return { ok: false, reason: 'forney_zero_derivative', errorsCorrected: 0, positions: [] };
    }
    const errMag = gfDiv(num, den);
    out[positions[k]] ^= errMag;
  }

  // Step 4: Mandatory post-correction zero-syndrome verification
  const recheck = rsSyndromes(out);
  if (recheck.hasError) {
    return { ok: false, reason: 'post_syndrome_nonzero', errorsCorrected: 0, positions: [] };
  }

  return {
    ok: true,
    data: out.subarray(0, len - RS_PARITY),
    codeword: out,
    errorsCorrected: positions.length,
    positions,
  };
}

/**
 * 2-way interleaved RS(254, 238) armor for a 476-byte cell body -> 508-byte armored block.
 * Interleave 0 covers even indices (0, 2, 4, ...); Interleave 1 covers odd indices (1, 3, 5, ...).
 * Result layout: [body 476B][interleaved parity 32B] so contiguous bursts up to 16B span <= 8B per lane!
 */
export function rsArmorInterleaved(body476) {
  if (body476.length !== 476) {
    throw new RangeError(`Expected 476-byte body, got ${body476.length}`);
  }
  const lane0 = new Uint8Array(RS_K);
  const lane1 = new Uint8Array(RS_K);
  for (let i = 0; i < RS_K; i++) {
    lane0[i] = body476[i * 2];
    lane1[i] = body476[i * 2 + 1];
  }
  const enc0 = rsEncode(lane0);
  const enc1 = rsEncode(lane1);

  const out = new Uint8Array(508);
  out.set(body476, 0);
  for (let i = 0; i < RS_PARITY; i++) {
    out[476 + i * 2] = enc0[RS_K + i];
    out[476 + i * 2 + 1] = enc1[RS_K + i];
  }
  return out;
}

/**
 * Decode 2-way interleaved 508-byte armored cell block -> 476-byte verified body.
 */
export function rsUnarmorInterleaved(block508) {
  if (block508.length !== 508) {
    return { ok: false, reason: 'invalid_block_size', errorsCorrected: 0 };
  }
  const cw0 = new Uint8Array(RS_N);
  const cw1 = new Uint8Array(RS_N);
  for (let i = 0; i < RS_K; i++) {
    cw0[i] = block508[i * 2];
    cw1[i] = block508[i * 2 + 1];
  }
  for (let i = 0; i < RS_PARITY; i++) {
    cw0[RS_K + i] = block508[476 + i * 2];
    cw1[RS_K + i] = block508[476 + i * 2 + 1];
  }

  const r0 = rsDecode(cw0);
  if (!r0.ok) {
    return { ok: false, reason: `lane0:${r0.reason}`, errorsCorrected: 0 };
  }
  const r1 = rsDecode(cw1);
  if (!r1.ok) {
    return { ok: false, reason: `lane1:${r1.reason}`, errorsCorrected: 0 };
  }

  const body = new Uint8Array(476);
  for (let i = 0; i < RS_K; i++) {
    body[i * 2] = r0.data[i];
    body[i * 2 + 1] = r1.data[i];
  }
  return {
    ok: true,
    body,
    errorsCorrected: r0.errorsCorrected + r1.errorsCorrected,
    lane0Errors: r0.errorsCorrected,
    lane1Errors: r1.errorsCorrected,
  };
}
