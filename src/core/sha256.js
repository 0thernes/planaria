/**
 * Zero-Dependency Synchronous FIPS 180-4 SHA-256 & Depth-8 Binary Merkle Tree
 *
 * Works identically in Node.js and browsers with zero async overhead inside 60 FPS live loops.
 * Domain-separated leaf hashing (0x00 || leafData) and internal node hashing (0x01 || left || right)
 * prevent second-preimage / leaf-internal confusion attacks.
 */

const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

const H0 = new Uint32Array([
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
  0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
]);

const W_SCRATCH = new Uint32Array(64);
const TAIL_SCRATCH = new Uint8Array(128);
const TAIL_DV = new DataView(TAIL_SCRATCH.buffer);

/** Safely coerce Uint8Array, any ArrayBufferView (DataView, Uint32Array, ...), or ArrayBuffer into a byte view. */
export function toBytes(input) {
  if (input instanceof Uint8Array) return input;
  if (ArrayBuffer.isView(input)) {
    return new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
  }
  if (input instanceof ArrayBuffer) {
    return new Uint8Array(input);
  }
  if (Array.isArray(input)) {
    return Uint8Array.from(input);
  }
  throw new TypeError('Expected Uint8Array, ArrayBufferView, ArrayBuffer, or byte Array');
}

function compressBlock(dv, off, state) {
  for (let i = 0; i < 16; i++) {
    W_SCRATCH[i] = dv.getUint32(off + i * 4, false);
  }
  for (let i = 16; i < 64; i++) {
    const w15 = W_SCRATCH[i - 15];
    const w2 = W_SCRATCH[i - 2];
    const s0 = ((w15 >>> 7) | (w15 << 25)) ^ ((w15 >>> 18) | (w15 << 14)) ^ (w15 >>> 3);
    const s1 = ((w2 >>> 17) | (w2 << 15)) ^ ((w2 >>> 19) | (w2 << 13)) ^ (w2 >>> 10);
    W_SCRATCH[i] = (W_SCRATCH[i - 16] + s0 + W_SCRATCH[i - 7] + s1) >>> 0;
  }

  let a = state[0], b = state[1], c = state[2], d = state[3];
  let e = state[4], f = state[5], g = state[6], h = state[7];

  for (let i = 0; i < 64; i++) {
    const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
    const ch = (e & f) ^ ((~e) & g);
    const t1 = (h + S1 + ch + K[i] + W_SCRATCH[i]) >>> 0;
    const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
    const maj = (a & b) ^ (a & c) ^ (b & c);
    const t2 = (S0 + maj) >>> 0;

    h = g; g = f; f = e; e = (d + t1) >>> 0;
    d = c; c = b; b = a; a = (t1 + t2) >>> 0;
  }

  state[0] = (state[0] + a) >>> 0;
  state[1] = (state[1] + b) >>> 0;
  state[2] = (state[2] + c) >>> 0;
  state[3] = (state[3] + d) >>> 0;
  state[4] = (state[4] + e) >>> 0;
  state[5] = (state[5] + f) >>> 0;
  state[6] = (state[6] + g) >>> 0;
  state[7] = (state[7] + h) >>> 0;
}

/**
 * Compute exact 32-byte FIPS 180-4 SHA-256 digest without allocating a full-message padded copy
 * and free of 32-bit signed-shift overflow for arbitrarily large inputs.
 */
export function sha256(msg) {
  const bytes = toBytes(msg);
  const len = bytes.length;
  const bitLenHi = Math.floor(len / 0x20000000);
  const bitLenLo = (len * 8) >>> 0;

  const state = new Uint32Array(H0);
  const fullBytes = len - (len % 64);

  if (fullBytes > 0) {
    const dv = new DataView(bytes.buffer, bytes.byteOffset, fullBytes);
    for (let off = 0; off < fullBytes; off += 64) {
      compressBlock(dv, off, state);
    }
  }

  const rem = len - fullBytes;
  const tailBlocks = rem >= 56 ? 2 : 1;
  const tailLen = tailBlocks * 64;
  TAIL_SCRATCH.fill(0, 0, tailLen);
  if (rem > 0) {
    TAIL_SCRATCH.set(bytes.subarray(fullBytes), 0);
  }
  TAIL_SCRATCH[rem] = 0x80;
  TAIL_DV.setUint32(tailLen - 8, bitLenHi, false);
  TAIL_DV.setUint32(tailLen - 4, bitLenLo, false);

  for (let off = 0; off < tailLen; off += 64) {
    compressBlock(TAIL_DV, off, state);
  }

  const out = new Uint8Array(32);
  const odv = new DataView(out.buffer);
  for (let i = 0; i < 8; i++) {
    odv.setUint32(i * 4, state[i], false);
  }
  return out;
}

/** Hex string helper for Uint8Array. */
export function toHex(bytes) {
  const b = toBytes(bytes);
  let s = '';
  for (let i = 0; i < b.length; i++) {
    s += b[i].toString(16).padStart(2, '0');
  }
  return s;
}

/** Strict hexadecimal decoder rejecting odd lengths and non-hex characters. */
export function fromHex(hex) {
  if (typeof hex !== 'string') {
    throw new TypeError('fromHex expects a string');
  }
  const clean = hex.trim().toLowerCase();
  if (clean.length % 2 !== 0 || !/^[0-9a-f]*$/.test(clean)) {
    throw new RangeError(`Invalid hex string: "${hex.slice(0, 32)}"`);
  }
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

export const MERKLE_DEPTH = 8;        // 2^8 = 256 leaf capacity
export const MERKLE_NODE_BYTES = 16;  // 128-bit truncated SHA-256 nodes (128B proof per cell; 128b 2nd-preimage / 64b collision)
export const MERKLE_LEAVES = 1 << MERKLE_DEPTH;

/** Domain-separated 128-bit leaf hash: SHA256(0x00 || leafBytes)[0..15] (detached 16B Uint8Array). */
export function merkleLeafHash(leafBytes) {
  const lb = toBytes(leafBytes);
  const buf = new Uint8Array(1 + lb.length);
  buf[0] = 0x00;
  buf.set(lb, 1);
  return sha256(buf).slice(0, MERKLE_NODE_BYTES);
}

/** Domain-separated 128-bit internal hash: SHA256(0x01 || left16 || right16)[0..15] (detached 16B Uint8Array). */
export function merkleParentHash(left16, right16) {
  const l = toBytes(left16);
  const r = toBytes(right16);
  if (l.length !== MERKLE_NODE_BYTES || r.length !== MERKLE_NODE_BYTES) {
    throw new RangeError(`merkleParentHash expects two ${MERKLE_NODE_BYTES}-byte nodes, got ${l.length} & ${r.length}`);
  }
  const buf = new Uint8Array(1 + MERKLE_NODE_BYTES * 2);
  buf[0] = 0x01;
  buf.set(l, 1);
  buf.set(r, 1 + MERKLE_NODE_BYTES);
  return sha256(buf).slice(0, MERKLE_NODE_BYTES);
}

/** Domain-separated empty-leaf padding hash using distinct 0x02 domain prefix (prevents leaf/empty collision). */
export const EMPTY_LEAF_HASH = sha256(new Uint8Array([0x02, 0x50, 0x4c, 0x4e, 0x00])).slice(0, MERKLE_NODE_BYTES);

/**
 * Build a complete Depth-8 Merkle tree over <= 256 leaf payloads.
 * Returns { root: Uint8Array(16), rootHex: string, levels: Uint8Array[][] }
 */
export function buildMerkleTree(leafByteArrays) {
  if (leafByteArrays.length > MERKLE_LEAVES) {
    throw new RangeError(`Merkle tree max leaves is ${MERKLE_LEAVES}, got ${leafByteArrays.length}`);
  }
  const levels = [];
  const level0 = new Array(MERKLE_LEAVES);
  for (let i = 0; i < MERKLE_LEAVES; i++) {
    level0[i] = i < leafByteArrays.length ? merkleLeafHash(leafByteArrays[i]) : EMPTY_LEAF_HASH;
  }
  levels.push(level0);

  let curr = level0;
  for (let d = 0; d < MERKLE_DEPTH; d++) {
    const next = new Array(curr.length >>> 1);
    for (let i = 0; i < next.length; i++) {
      next[i] = merkleParentHash(curr[i * 2], curr[i * 2 + 1]);
    }
    levels.push(next);
    curr = next;
  }

  const root = levels[MERKLE_DEPTH][0].slice();
  return { root, rootHex: toHex(root), levels };
}

/** Extract flat 128-byte (8 x 16B) sibling proof for leafIndex in 0..255. */
export function getMerkleProof(tree, leafIndex) {
  if (!Number.isInteger(leafIndex) || leafIndex < 0 || leafIndex >= MERKLE_LEAVES) {
    throw new RangeError(`leafIndex must be an integer in 0..${MERKLE_LEAVES - 1}, got ${leafIndex}`);
  }
  const proof = new Uint8Array(MERKLE_DEPTH * MERKLE_NODE_BYTES);
  let idx = leafIndex;
  for (let d = 0; d < MERKLE_DEPTH; d++) {
    const siblingIdx = idx ^ 1;
    proof.set(tree.levels[d][siblingIdx], d * MERKLE_NODE_BYTES);
    idx >>>= 1;
  }
  return proof;
}

/**
 * Recompute implied 16-byte Lineage Root from a leaf payload, its leafIndex in 0..255, and its 128-byte proof.
 * Any single bit mutation in leafBytes, leafIndex, or proof yields a uniformly random root,
 * enabling both Pinned-Root verification AND Unpinned Consensus-Quorum Byzantine isolation.
 */
export function computeMerkleRootFromProof(leafBytes, leafIndex, proof128) {
  if (!Number.isInteger(leafIndex) || leafIndex < 0 || leafIndex >= MERKLE_LEAVES) {
    throw new RangeError(`leafIndex must be an integer in 0..${MERKLE_LEAVES - 1}, got ${leafIndex}`);
  }
  const p = toBytes(proof128);
  const expectedProofLen = MERKLE_DEPTH * MERKLE_NODE_BYTES;
  if (p.length !== expectedProofLen) {
    throw new RangeError(`Merkle proof must be ${expectedProofLen} bytes, got ${p.length}`);
  }
  let acc = merkleLeafHash(leafBytes);
  let idx = leafIndex;
  for (let d = 0; d < MERKLE_DEPTH; d++) {
    const sib = p.subarray(d * MERKLE_NODE_BYTES, (d + 1) * MERKLE_NODE_BYTES);
    if ((idx & 1) === 0) {
      acc = merkleParentHash(acc, sib);
    } else {
      acc = merkleParentHash(sib, acc);
    }
    idx >>>= 1;
  }
  return acc;
}
