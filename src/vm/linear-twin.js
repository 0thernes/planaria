/**
 * Control-Group Traditional Linear Binary Format & Loader (ELF/WASM-style Monolith)
 *
 * Packages the EXACT SAME compiled PVM-32 bytecode bundles into a conventional linear
 * executable layout (64-byte header at offset 0 + section table + flat .text segments +
 * SHA-256 integrity footer) padded to the identical 98,304-byte (96 KB) footprint.
 *
 * Used for rigorous side-by-side falsification experiments: apply the EXACT SAME byte
 * damage, bisection, radiation, unaligned shift, or Trojan injection to both the
 * Linear Control Twin and the PLANARIA Holographic Binary simultaneously.
 */

import { sha256, toBytes, toHex } from '../core/sha256.js';
import { TOTAL_HBIN_BYTES, BUNDLE_SPECS } from '../core/hbin.js';

const LINEAR_MAGIC = new Uint8Array([0x4c, 0x49, 0x4e, 0x42, 0x49, 0x4e, 0x30, 0x31]); // "LINBIN01"
const HEADER_SIZE = 64;

/** Encode the same 6 bytecode bundles into a traditional linear 96 KB binary. */
export function encodeLinearBinary(bundles, name = 'LINEAR') {
  const out = new Uint8Array(TOTAL_HBIN_BYTES);
  const dv = new DataView(out.buffer);

  out.set(LINEAR_MAGIC, 0);
  dv.setUint32(8, 6, true); // section count

  let cursor = HEADER_SIZE;
  for (let b = 0; b < 6; b++) {
    const data = bundles instanceof Map ? bundles.get(b) : bundles[b];
    const bytes = data ? toBytes(data) : new Uint8Array(0);
    const len = bytes.length;
    if (cursor + len + 32 > TOTAL_HBIN_BYTES) {
      throw new RangeError(`Linear binary payload exceeds ${TOTAL_HBIN_BYTES - 32}B capacity at section ${b}`);
    }
    dv.setUint32(12 + b * 8, cursor, true);     // section offset
    dv.setUint32(16 + b * 8, len, true);        // section length
    if (len > 0) {
      out.set(bytes, cursor);
      cursor += len;
    }
  }
  dv.setUint32(60, cursor, true); // total active code end offset

  // Write deterministic SHA-256 of active code image [0..cursor) into bytes [cursor..cursor+32)
  const digest = sha256(out.subarray(0, cursor));
  out.set(digest, cursor);

  return {
    bytes: out,
    name,
    activeLength: cursor + 32,
    codeDigestHex: toHex(digest),
  };
}

/**
 * Standard OS-style Linear Binary Loader:
 * Validates header magic at byte 0, section bounds, non-overlap, and code integrity digest.
 * Any header corruption, truncation, unaligned shift, or single bit-flip in active code
 * triggers an immediate fatal loader fault (matching real ELF/PE/WASM loaders).
 */
export function decodeLinearBinary(rawBytes) {
  const buf = toBytes(rawBytes);

  if (buf.length < HEADER_SIZE) {
    return {
      bootable: false,
      fault: 'ERR_TRUNCATED_HEADER',
      detail: `File too small (${buf.length}B < 64B header)`,
      bundles: [],
    };
  }

  for (let i = 0; i < 8; i++) {
    if (buf[i] !== LINEAR_MAGIC[i]) {
      return {
        bootable: false,
        fault: 'ERR_HEADER_MAGIC_CORRUPT',
        detail: `Invalid magic at byte 0 (expected LINBIN01)`,
        bundles: [],
      };
    }
  }

  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const secCount = dv.getUint32(8, true);
  const activeEnd = dv.getUint32(60, true);

  if (secCount !== 6 || activeEnd < HEADER_SIZE || activeEnd + 32 > buf.length) {
    return {
      bootable: false,
      fault: 'ERR_SECTION_TABLE_TRUNCATED',
      detail: `Section image truncated (needs ${activeEnd + 32}B, got ${buf.length}B)`,
      bundles: [],
    };
  }

  // Verify SHA-256 code integrity (any 1-bit flip inside header or code fails!)
  const expected = buf.subarray(activeEnd, activeEnd + 32);
  const actual = sha256(buf.subarray(0, activeEnd));
  for (let i = 0; i < 32; i++) {
    if (expected[i] !== actual[i]) {
      return {
        bootable: false,
        fault: 'ERR_CODE_CHECKSUM_SIGSEGV',
        detail: `Code segment integrity fault at byte digest index ${i}`,
        bundles: [],
      };
    }
  }

  const bundles = [];
  let prevEnd = HEADER_SIZE;
  for (let b = 0; b < 6; b++) {
    const off = dv.getUint32(12 + b * 8, true);
    const len = dv.getUint32(16 + b * 8, true);
    if (off < HEADER_SIZE || off < prevEnd || off + len > activeEnd) {
      return {
        bootable: false,
        fault: 'ERR_SECTION_OUT_OF_BOUNDS',
        detail: `Section ${b} out of bounds or overlapping (off=${off}, len=${len})`,
        bundles: [],
      };
    }
    prevEnd = off + len;
    bundles.push({
      id: b,
      name: BUNDLE_SPECS[b].name,
      organId: BUNDLE_SPECS[b].organId,
      stratum: BUNDLE_SPECS[b].stratum,
      viable: true,
      data: new Uint8Array(buf.subarray(off, off + len)),
      source: 'LINEAR',
    });
  }
  bundles.push({ id: 6, name: 'S3_GENOME_LEDGER', organId: 5, stratum: 3, viable: false, data: null, source: 'NONE' });

  return {
    bootable: true,
    fault: null,
    detail: 'LINEAR_INTACT',
    maxViableStratum: 3,
    bundles,
    xenografts: [],
  };
}
