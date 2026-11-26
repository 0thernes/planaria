/**
 * Exact Finite Field GF(2^8) Arithmetic
 * Primitive polynomial: P(x) = x^8 + x^4 + x^3 + x^2 + 1 (0x11D)
 * Generator: alpha = 2
 *
 * Bit-for-bit identical to the Lean 4 formalization in lean/PlanariaProofs/GF256.lean.
 */

export const GF_POLY = 0x11d;
export const GF_SIZE = 256;

export const GF_EXP = new Uint8Array(512);
export const GF_LOG = new Uint8Array(256);
/** Precomputed 256x256 flat multiplication table (GF_MUL_TABLE[(a << 8) | b] = gfMul(a, b)). */
export const GF_MUL_TABLE = new Uint8Array(256 * 256);

(function initTables() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) {
      x ^= GF_POLY;
    }
  }
  for (let i = 255; i < 512; i++) {
    GF_EXP[i] = GF_EXP[i - 255];
  }
  GF_LOG[0] = 0; // sentinel; never index log(0) in mul/div

  for (let a = 1; a < 256; a++) {
    const la = GF_LOG[a];
    const rowOff = a << 8;
    for (let b = 1; b < 256; b++) {
      GF_MUL_TABLE[rowOff | b] = GF_EXP[la + GF_LOG[b]];
    }
  }
})();

/** Addition in GF(2^8) is bitwise XOR. */
export function gfAdd(a, b) {
  return (a ^ b) & 0xff;
}

/** Subtraction in GF(2^8) is identical to addition (characteristic 2). */
export function gfSub(a, b) {
  return (a ^ b) & 0xff;
}

/** Exact multiplication in GF(2^8) using precomputed exp/log tables. */
export function gfMul(a, b) {
  a &= 0xff;
  b &= 0xff;
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

/** Direct Russian-peasant multiplication (no tables; used to cross-verify tables). */
export function gfMulDirect(a, b) {
  let p = 0;
  let aa = a & 0xff;
  let bb = b & 0xff;
  for (let i = 0; i < 8; i++) {
    if (bb & 1) p ^= aa;
    const hi = aa & 0x80;
    aa = (aa << 1) & 0xff;
    if (hi) aa ^= (GF_POLY & 0xff);
    bb >>>= 1;
  }
  return p;
}

/** Multiplicative inverse in GF(2^8). Throws on 0. */
export function gfInv(a) {
  a &= 0xff;
  if (a === 0) {
    throw new RangeError('GF(2^8) division by zero');
  }
  return GF_EXP[255 - GF_LOG[a]];
}

/** Division a / b in GF(2^8). Throws when b === 0. */
export function gfDiv(a, b) {
  a &= 0xff;
  b &= 0xff;
  if (b === 0) {
    throw new RangeError('GF(2^8) division by zero');
  }
  if (a === 0) return 0;
  return GF_EXP[GF_LOG[a] + 255 - GF_LOG[b]];
}

/** Exponentiation a^e in GF(2^8) for safe integer exponents e (throws on 0^negative or unsafe int). */
export function gfPow(a, e) {
  if (!Number.isSafeInteger(e)) {
    throw new RangeError(`GF(2^8) exponent must be a safe integer, got ${e}`);
  }
  a &= 0xff;
  if (e === 0) return 1;
  if (a === 0) {
    if (e < 0) {
      throw new RangeError('GF(2^8) division by zero');
    }
    return 0;
  }
  const idx = (GF_LOG[a] * (e % 255)) % 255;
  return GF_EXP[idx < 0 ? idx + 255 : idx];
}

/** Evaluate polynomial poly[0]*x^(d-1) + ... + poly[d-1] at x using Horner's rule. */
export function gfPolyEval(poly, x) {
  let acc = 0;
  const xRow = (x & 0xff) << 8;
  for (let i = 0; i < poly.length; i++) {
    acc = GF_MUL_TABLE[xRow | acc] ^ (poly[i] & 0xff);
  }
  return acc;
}

/** Evaluate ascending polynomial p[0] + p[1]*x + p[2]*x^2 + ... at x. */
export function gfPolyEvalAsc(poly, x) {
  let acc = 0;
  let xp = 1;
  const xb = x & 0xff;
  for (let i = 0; i < poly.length; i++) {
    const c = poly[i] & 0xff;
    if (c !== 0) {
      acc ^= GF_MUL_TABLE[(c << 8) | xp];
    }
    xp = GF_MUL_TABLE[(xp << 8) | xb];
  }
  return acc;
}

/** Multiply two descending polynomials over GF(2^8). */
export function gfPolyMulDesc(p, q) {
  if (!p || !q || p.length === 0 || q.length === 0) {
    return new Uint8Array(0);
  }
  const out = new Uint8Array(p.length + q.length - 1);
  for (let i = 0; i < p.length; i++) {
    const pi = p[i] & 0xff;
    if (pi === 0) continue;
    const row = pi << 8;
    for (let j = 0; j < q.length; j++) {
      const qj = q[j] & 0xff;
      if (qj === 0) continue;
      out[i + j] ^= GF_MUL_TABLE[row | qj];
    }
  }
  return out;
}

/** Multiply two ascending polynomials over GF(2^8), optionally truncated to maxLen. */
export function gfPolyMulAsc(p, q, maxLen = undefined) {
  if (!p || !q || p.length === 0 || q.length === 0) {
    return new Uint8Array(0);
  }
  const naturalLen = p.length + q.length - 1;
  const limit = maxLen === undefined ? naturalLen : Math.min(maxLen, naturalLen);
  if (!Number.isSafeInteger(limit) || limit <= 0) {
    return new Uint8Array(0);
  }
  const out = new Uint8Array(limit);
  for (let i = 0; i < p.length; i++) {
    const pi = p[i] & 0xff;
    if (pi === 0) continue;
    const row = pi << 8;
    for (let j = 0; j < q.length && i + j < limit; j++) {
      const qj = q[j] & 0xff;
      if (qj === 0) continue;
      out[i + j] ^= GF_MUL_TABLE[row | qj];
    }
  }
  return out;
}
