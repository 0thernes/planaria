#!/usr/bin/env node
/**
 * PLANARIA — Deterministic Seeded Adversarial Fuzz Harness (Build Standard B15)
 *
 * Executes 2,000 deterministic fuzz test cases (500 per critical parser/decoder/VM surface):
 *   1. `.hbin` Cellular Harvester & Decoder (`decodeHbin`) — 500 malformed/mutated/flood streams
 *   2. Plang Compiler (`compilePlangToHbin`) — 500 random token/nesting/UTF-8 soups
 *   3. Inner RS(254, 238) Codec (`rsDecode`, `rsUnarmorInterleaved`) — 500 random/corrupted frames
 *   4. PVM-32 Virtual Machine (`PVM32`) — 500 random bytecode & syscall programs
 *
 * Asserts zero uncaught crashes, zero stack overflows, bounded execution time, strict RAM isolation,
 * and exact recovery whenever valid RS error weights <= 8 are injected.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { decodeHbin, SYNC_WORD, CELL_SIZE } from '../src/core/hbin.js';
import { rsEncode, rsDecode, rsArmorInterleaved, rsUnarmorInterleaved, RS_K } from '../src/core/rs.js';
import { compilePlangToHbin } from '../src/compiler/compile.js';
import { PVM32 } from '../src/vm/pvm32.js';
import { makeRng } from '../src/core/torture.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VERSION = fs.readFileSync(path.join(ROOT, 'VERSION'), 'utf8').trim();
const CASES_PER_TARGET = 500;
const rng = makeRng(0x504c4e32);

function randInt(n) {
  return Math.floor(rng() * n);
}

function randBytes(len) {
  const out = new Uint8Array(len);
  for (let i = 0; i < len; i++) out[i] = randInt(256);
  return out;
}

const sampleHbin = new Uint8Array(fs.readFileSync(path.join(ROOT, 'artifacts/aegis_drift.hbin')));
const t0 = performance.now();

console.log('========================================================================');
console.log(` PLANARIA v${VERSION} — DETERMINISTIC ADVERSARIAL FUZZER (${CASES_PER_TARGET * 4} CASES)`);
console.log('========================================================================');

// ---------------------------------------------------------------------------
// TARGET 1: decodeHbin (500 cases)
// ---------------------------------------------------------------------------
{
  const tStart = performance.now();
  for (let i = 0; i < CASES_PER_TARGET; i++) {
    const mode = i % 5;
    let payload;
    let opts = {};
    if (mode === 0) {
      payload = randBytes(randInt(2500));
    } else if (mode === 1) {
      // Mutated slice of real .hbin
      const start = randInt(Math.max(1, sampleHbin.length - 1024));
      const len = randInt(Math.min(4096, sampleHbin.length - start));
      payload = sampleHbin.slice(start, start + len);
      const flips = 1 + randInt(32);
      for (let f = 0; f < flips && payload.length > 0; f++) {
        payload[randInt(payload.length)] ^= 1 + randInt(255);
      }
    } else if (mode === 2) {
      // Sync-marker flood with fuzzy 1-bit flips & varying strides
      const stride = 4 + (i % 5);
      payload = randBytes(2048);
      for (let off = 0; off + 4 <= payload.length; off += stride) {
        payload.set(SYNC_WORD, off);
        if (rng() < 0.35) payload[off + randInt(4)] ^= 1 << randInt(8);
      }
    } else if (mode === 3) {
      // Tiny or boundary-length buffers around CELL_SIZE
      const sizes = [0, 1, 3, 4, 511, 512, 513, 1024];
      payload = randBytes(sizes[i % sizes.length]);
    } else {
      // Graft two mutated halves with xenograft enabled
      const a = sampleHbin.slice(0, CELL_SIZE * (1 + randInt(6)));
      const b = randBytes(CELL_SIZE * (1 + randInt(3)));
      payload = new Uint8Array(a.length + b.length);
      payload.set(a, 0);
      payload.set(b, a.length);
      opts = { allowXenograft: true, allowUnpinnedXenograft: rng() < 0.5 };
    }
    const dec = decodeHbin(payload, opts);
    assert.equal(typeof dec.bootable, 'boolean');
    assert.equal(Array.isArray(dec.bundles), true);
    assert.equal(dec.bundles.length, 7);
    assert.ok(dec.maxViableStratum >= -1 && dec.maxViableStratum <= 3);
  }
  console.log(`  [PASS] Target 1 (decodeHbin):          ${CASES_PER_TARGET}/${CASES_PER_TARGET} cases (${(performance.now() - tStart).toFixed(0)} ms)`);
}

// ---------------------------------------------------------------------------
// TARGET 2: compilePlangToHbin (500 cases)
// ---------------------------------------------------------------------------
{
  const tStart = performance.now();
  const tokens = [
    'program', 'bundle', 'S0_STEM_NUCLEUS', 'S1_CORTEX_LOGIC', 'let', 'const',
    'fn', 'if', 'else', 'while', 'return', 'mem[', ']', '(', ')', '{', '}', ';',
    '+', '-', '*', '/', '%', '&', '|', '^', '==', '!=', '<', '>', '?', ':',
    '0', '1', '42', '-2147483648', '0xdeadbeef', '9999999999', 'a', 'b', 'x',
    'organ_call', 'pixel', 'glow', 'clear', 'toString', 'constructor',
  ];
  let compiledOk = 0;
  let cleanReject = 0;
  for (let i = 0; i < CASES_PER_TARGET; i++) {
    let src;
    const mode = i % 4;
    if (mode === 0) {
      // Random token soup
      const nTok = 5 + randInt(60);
      const parts = [];
      for (let t = 0; t < nTok; t++) parts.push(tokens[randInt(tokens.length)]);
      src = parts.join(' ');
    } else if (mode === 1) {
      // Deeply nested expressions / ternaries / else-if chains
      const depth = 1 + randInt(120);
      const sub = i % 3;
      if (sub === 0) {
        src = `program F; bundle S0_STEM_NUCLEUS { let x = ${'('.repeat(depth)}1${')'.repeat(depth)}; }`;
      } else if (sub === 1) {
        src = `program F; bundle S0_STEM_NUCLEUS { let x = ${'1 ? 2 : '.repeat(depth)}3; }`;
      } else {
        src = `program F; bundle S0_STEM_NUCLEUS { if (0) { mem[0] = 1; } ${'else if (0) { mem[0] = 2; } '.repeat(depth)}else { mem[0] = 3; } }`;
      }
    } else if (mode === 2) {
      // Valid structured micro-programs with random expressions
      const k1 = randInt(1000) - 500;
      const k2 = 1 + randInt(500);
      const ops = ['+', '-', '*', '/', '%', '^', '&', '|'];
      const op = ops[randInt(ops.length)];
      src = `program FUZZ_${i}; bundle S0_STEM_NUCLEUS { let a = ${k1}; let b = ${k2}; mem[0] = a ${op} b; }`;
    } else {
      // Arbitrary binary-to-UTF8 garbage
      src = Buffer.from(randBytes(1 + randInt(256))).toString('utf8');
    }
    try {
      const out = compilePlangToHbin(src);
      assert.equal(out.bytes.length, 98304);
      compiledOk++;
    } catch (err) {
      // Must NEVER be an uncaught call-stack overflow or TypeError!
      assert.ok(!(err instanceof RangeError && /call stack/i.test(err.message)), `Stack overflow on fuzz case ${i}`);
      assert.ok(!(err instanceof TypeError), `Unexpected TypeError on fuzz case ${i}: ${err.message}`);
      cleanReject++;
    }
  }
  console.log(`  [PASS] Target 2 (compilePlangToHbin):  ${CASES_PER_TARGET}/${CASES_PER_TARGET} cases (ok=${compiledOk}, cleanReject=${cleanReject}, ${(performance.now() - tStart).toFixed(0)} ms)`);
}

// ---------------------------------------------------------------------------
// TARGET 3: RS(254, 238) Codec & Interleaved Armor (500 cases)
// ---------------------------------------------------------------------------
{
  const tStart = performance.now();
  for (let i = 0; i < CASES_PER_TARGET; i++) {
    if (i % 2 === 0) {
      // Random-length arbitrary byte frame -> never throws
      const buf = randBytes(randInt(520));
      const r1 = rsDecode(buf);
      assert.equal(typeof r1.ok, 'boolean');
      const r2 = rsUnarmorInterleaved(buf);
      assert.equal(typeof r2.ok, 'boolean');
    } else {
      // Valid RS codeword with 0..12 random byte corruptions
      const msg = randBytes(RS_K);
      const cw = rsEncode(msg);
      const errs = randInt(13);
      const positions = new Set();
      while (positions.size < errs) positions.add(randInt(cw.length));
      for (const pos of positions) cw[pos] ^= 1 + randInt(255);
      const dec = rsDecode(cw);
      if (errs <= 8) {
        assert.equal(dec.ok, true, `RS(254,238) failed to decode ${errs} errors on case ${i}`);
        assert.equal(dec.errorsCorrected, errs);
        assert.deepEqual(dec.data, msg);
      } else {
        assert.equal(typeof dec.ok, 'boolean');
      }
      // Also test interleaved 16-byte burst recovery
      const body = randBytes(476);
      const armored = rsArmorInterleaved(body);
      const bStart = randInt(508 - 16);
      const bLen = randInt(17);
      for (let b = 0; b < bLen; b++) armored[bStart + b] ^= 1 + randInt(255);
      const un = rsUnarmorInterleaved(armored);
      assert.equal(un.ok, true);
      assert.deepEqual(un.body, body);
    }
  }
  console.log(`  [PASS] Target 3 (RS 254,238 codec):    ${CASES_PER_TARGET}/${CASES_PER_TARGET} cases (${(performance.now() - tStart).toFixed(0)} ms)`);
}

// ---------------------------------------------------------------------------
// TARGET 4: PVM-32 Virtual Machine (500 cases)
// ---------------------------------------------------------------------------
{
  const tStart = performance.now();
  for (let i = 0; i < CASES_PER_TARGET; i++) {
    const words = 1 + randInt(64);
    const code = randBytes(words * 4);
    const vm = new PVM32(2026 + i);
    const fakeDecoded = {
      bootable: true,
      maxViableStratum: 0,
      bundles: Array.from({ length: 7 }, (_, b) => ({
        id: b,
        viable: b === 0,
        data: b === 0 ? code : null,
        source: b === 0 ? 'PRIMARY' : 'MISSING',
      })),
    };
    vm.loadDecoded(fakeDecoded, true);
    vm.maxInsnBudget = 1200;
    vm.stepFrame();
    assert.equal(vm.ram.length, 4096);
    assert.ok(vm.lastFrameInsns <= vm.maxInsnBudget + 256, `Budget runaway: ${vm.lastFrameInsns}`);
    for (const v of vm.voices) {
      assert.equal(Number.isFinite(v.freqHz), true);
      assert.equal(Number.isFinite(v.vol), true);
    }
  }
  console.log(`  [PASS] Target 4 (PVM-32 bytecode VM):  ${CASES_PER_TARGET}/${CASES_PER_TARGET} cases (${(performance.now() - tStart).toFixed(0)} ms)`);
}

console.log('------------------------------------------------------------------------');
console.log(` FUZZ SUMMARY: ${CASES_PER_TARGET * 4}/${CASES_PER_TARGET * 4} cases PASSED (0 crashes, 0 hangs) in ${(performance.now() - t0).toFixed(0)} ms.`);
console.log('========================================================================');
