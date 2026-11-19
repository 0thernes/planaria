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

/** Compute exact 32-byte FIPS 180-4 SHA-256 digest of Uint8Array. */
export function sha256(msg) {
  const bytes = msg instanceof Uint8Array ? msg : new Uint8Array(msg);
  const len = bytes.length;
  const bitLenHi = Math.floor(len / 0x20000000);
  const bitLenLo = (len << 3) >>> 0;

  // Pad to multiple of 64 bytes: msg + 0x80 + zeros + 8-byte big-endian bit length
  const paddedLen = ((len + 9 + 63) >>> 6) << 6;
  const padded = new Uint8Array(paddedLen);
  padded.set(bytes, 0);
  padded[len] = 0x80;
  const dv = new DataView(padded.buffer, padded.byteOffset, padded.byteLength);
  dv.setUint32(paddedLen - 8, bitLenHi, false);
  dv.setUint32(paddedLen - 4, bitLenLo, false);

  let h0 = H0[0], h1 = H0[1], h2 = H0[2], h3 = H0[3];
  let h4 = H0[4], h5 = H0[5], h6 = H0[6], h7 = H0[7];

  for (let off = 0; off < paddedLen; off += 64) {
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

    let a = h0, b = h1, c = h2, d = h3;
    let e = h4, f = h5, g = h6, h = h7;

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

    h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0; h5 = (h5 + f) >>> 0; h6 = (h6 + g) >>> 0; h7 = (h7 + h) >>> 0;
  }

  const out = new Uint8Array(32);
  const odv = new DataView(out.buffer);
  odv.setUint32(0, h0, false); odv.setUint32(4, h1, false);
  odv.setUint32(8, h2, false); odv.setUint32(12, h3, false);
  odv.setUint32(16, h4, false); odv.setUint32(20, h5, false);
  odv.setUint32(24, h6, false); odv.setUint32(28, h7, false);
  return out;
}

/** Hex string helper for Uint8Array. */
export function toHex(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i++) {
    s += bytes[i].toString(16).padStart(2, '0');
  }
  return s;
}

export function fromHex(hex) {
  const clean = hex.trim().toLowerCase();
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

export const MERKLE_DEPTH = 8;        // 2^8 = 256 leaf capacity
export const MERKLE_NODE_BYTES = 16;  // 128-bit truncated SHA-256 nodes (128B proof per cell)
export const MERKLE_LEAVES = 1 << MERKLE_DEPTH;

/** Domain-separated 128-bit leaf hash: SHA256(0x00 || leafBytes)[0..15] */
export function merkleLeafHash(leafBytes) {
  const buf = new Uint8Array(1 + leafBytes.length);
  buf[0] = 0x00;
  buf.set(leafBytes, 1);
  return sha256(buf).subarray(0, MERKLE_NODE_BYTES);
}

/** Domain-separated 128-bit internal hash: SHA256(0x01 || left16 || right16)[0..15] */
export function merkleParentHash(left16, right16) {
  const buf = new Uint8Array(1 + MERKLE_NODE_BYTES * 2);
  buf[0] = 0x01;
  buf.set(left16, 1);
  buf.set(right16, 1 + MERKLE_NODE_BYTES);
  return sha256(buf).subarray(0, MERKLE_NODE_BYTES);
}

const EMPTY_LEAF_HASH = merkleLeafHash(new Uint8Array([0x50, 0x4c, 0x4e, 0x00]));

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

  const root = levels[MERKLE_DEPTH][0];
  return { root, rootHex: toHex(root), levels };
}

/** Extract flat 128-byte (8 x 16B) sibling proof for leafIndex in 0..255. */
export function getMerkleProof(tree, leafIndex) {
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
 * Recompute implied 16-byte Lineage Root from a leaf payload, its leafIndex, and its 128-byte proof.
 * Any single bit mutation in leafBytes, leafIndex, or proof yields a uniformly random root,
 * enabling both Pinned-Root verification AND Unpinned Consensus-Quorum Byzantine isolation!
 */
export function computeMerkleRootFromProof(leafBytes, leafIndex, proof128) {
  let acc = merkleLeafHash(leafBytes);
  let idx = leafIndex;
  for (let d = 0; d < MERKLE_DEPTH; d++) {
    const sib = proof128.subarray(d * MERKLE_NODE_BYTES, (d + 1) * MERKLE_NODE_BYTES);
    if ((idx & 1) === 0) {
      acc = merkleParentHash(acc, sib);
    } else {
      acc = merkleParentHash(sib, acc);
    }
    idx >>>= 1;
  }
  return acc;
}
