/**
 * PVM-32 — 32-bit Register-Based Anastomosis Virtual Machine
 *
 * Features:
 *   - 32 general-purpose 32-bit integer registers per organ invocation (r0 hardwired to 0)
 *   - Sandboxed 4,096-word (16 KB) linear shared RAM (strictly bounds-masked to [0..4095])
 *   - 160x120 32-bit RGBA framebuffer with phosphor decay & hardware vector/pixel/HUD blitter
 *   - 4-channel polyphonic hardware audio synth register bank (drives 48 kHz AudioWorklet)
 *   - Anastomosis Organ Dispatch Table (ADT): dynamically routes ORGAN_CALL(organId, maxStratum)
 *     to the highest intact/authenticated (or ABI-verified xenografted) bundle <= maxStratum
 *   - Hot-Swap Live Tissue Update: updateFromDecoded(decoded) swaps regenerated or amputated
 *     organs IN PLACE without resetting RAM or halting the running program!
 */

import {
  OP,
  SYSCALL,
  FB_WIDTH,
  FB_HEIGHT,
  FB_PIXELS,
  RAM_WORDS,
  signExt16,
  signExt21,
} from '../compiler/isa.js';
import { BUNDLE_SPECS, ORGAN_NAMES } from '../core/hbin.js';

/** Minimal crisp 5x7 uppercase + digit + symbol bitmap font for HUD labels & numbers. */
const FONT_5X7 = {
  '0': [0x0e, 0x11, 0x13, 0x15, 0x19, 0x11, 0x0e],
  '1': [0x04, 0x0c, 0x04, 0x04, 0x04, 0x04, 0x0e],
  '2': [0x0e, 0x11, 0x01, 0x06, 0x08, 0x10, 0x1f],
  '3': [0x1e, 0x01, 0x01, 0x0e, 0x01, 0x01, 0x1e],
  '4': [0x02, 0x06, 0x0a, 0x12, 0x1f, 0x02, 0x02],
  '5': [0x1f, 0x10, 0x1e, 0x01, 0x01, 0x11, 0x0e],
  '6': [0x0e, 0x10, 0x1e, 0x11, 0x11, 0x11, 0x0e],
  '7': [0x1f, 0x01, 0x02, 0x04, 0x08, 0x08, 0x08],
  '8': [0x0e, 0x11, 0x11, 0x0e, 0x11, 0x11, 0x0e],
  '9': [0x0e, 0x11, 0x11, 0x0f, 0x01, 0x02, 0x0c],
  'A': [0x0e, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x11],
  'B': [0x1e, 0x11, 0x11, 0x1e, 0x11, 0x11, 0x1e],
  'C': [0x0e, 0x11, 0x10, 0x10, 0x10, 0x11, 0x0e],
  'D': [0x1c, 0x12, 0x11, 0x11, 0x11, 0x12, 0x1c],
  'E': [0x1f, 0x10, 0x10, 0x1e, 0x10, 0x10, 0x1f],
  'F': [0x1f, 0x10, 0x10, 0x1e, 0x10, 0x10, 0x10],
  'G': [0x0e, 0x11, 0x10, 0x17, 0x11, 0x11, 0x0f],
  'H': [0x11, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x11],
  'I': [0x0e, 0x04, 0x04, 0x04, 0x04, 0x04, 0x0e],
  'J': [0x07, 0x02, 0x02, 0x02, 0x12, 0x12, 0x0c],
  'K': [0x11, 0x12, 0x14, 0x18, 0x14, 0x12, 0x11],
  'L': [0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x1f],
  'M': [0x11, 0x1b, 0x15, 0x15, 0x11, 0x11, 0x11],
  'N': [0x11, 0x19, 0x15, 0x13, 0x11, 0x11, 0x11],
  'O': [0x0e, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e],
  'P': [0x1e, 0x11, 0x11, 0x1e, 0x10, 0x10, 0x10],
  'Q': [0x0e, 0x11, 0x11, 0x11, 0x15, 0x12, 0x0d],
  'R': [0x1e, 0x11, 0x11, 0x1e, 0x14, 0x12, 0x11],
  'S': [0x0f, 0x10, 0x10, 0x0e, 0x01, 0x01, 0x1e],
  'T': [0x1f, 0x04, 0x04, 0x04, 0x04, 0x04, 0x04],
  'U': [0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e],
  'V': [0x11, 0x11, 0x11, 0x11, 0x11, 0x0a, 0x04],
  'W': [0x11, 0x11, 0x11, 0x15, 0x15, 0x1b, 0x11],
  'X': [0x11, 0x11, 0x0a, 0x04, 0x0a, 0x11, 0x11],
  'Y': [0x11, 0x11, 0x0a, 0x04, 0x04, 0x04, 0x04],
  'Z': [0x1f, 0x01, 0x02, 0x04, 0x08, 0x10, 0x1f],
  '-': [0x00, 0x00, 0x00, 0x1f, 0x00, 0x00, 0x00],
  ':': [0x00, 0x04, 0x04, 0x00, 0x04, 0x04, 0x00],
  '.': [0x00, 0x00, 0x00, 0x00, 0x00, 0x04, 0x04],
  '/': [0x01, 0x02, 0x02, 0x04, 0x08, 0x08, 0x10],
  '%': [0x19, 0x19, 0x02, 0x04, 0x08, 0x13, 0x13],
  '!': [0x04, 0x04, 0x04, 0x04, 0x04, 0x00, 0x04],
  ' ': [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
};

/**
 * Curated 256-color Cyber-Biological Palette:
 *   0..15   : Named high-contrast phosphor colors
 *   16..255 : Full RGB332 color cube for rich shaders/gradients
 */
export const PALETTE_RGBA = new Uint32Array(256);
(function initPalette() {
  const named = [
    [6, 10, 14],      // 0: Deep surgical obsidian
    [16, 28, 38],     // 1: Dark slate grid
    [16, 245, 168],   // 2: Phosphor emerald (Stratum 2 / primary)
    [34, 211, 238],   // 3: Surgical cyan (Stratum 1 / shields)
    [251, 191, 36],   // 4: Stem amber-gold (Stratum 0 / warning)
    [244, 63, 94],    // 5: Arterial crimson (hostiles / quarantine)
    [168, 85, 247],   // 6: Genome violet (Stratum 3 / plasma)
    [240, 253, 250],  // 7: Crisp surgical white
    [56, 189, 248],   // 8: Electric sky
    [251, 113, 133],  // 9: Neon coral
    [74, 222, 128],   // 10: Bio lime
    [253, 224, 71],   // 11: Laser yellow
    [129, 140, 248],  // 12: Indigo pulse
    [232, 121, 249],  // 13: Magenta chimera (Xenograft!)
    [100, 116, 139],  // 14: Muted telemetry gray
    [30, 58, 72],     // 15: Deep radar teal
  ];
  for (let i = 0; i < 16; i++) {
    const [r, g, b] = named[i];
    PALETTE_RGBA[i] = (255 << 24) | (b << 16) | (g << 8) | r;
  }
  for (let i = 16; i < 256; i++) {
    const r = ((i >> 5) & 7) * 36;
    const g = ((i >> 2) & 7) * 36;
    const b = (i & 3) * 85;
    PALETTE_RGBA[i] = (255 << 24) | (b << 16) | (g << 8) | r;
  }
})();

const SIN_LUT = new Int16Array(360);
const COS_LUT = new Int16Array(360);
for (let d = 0; d < 360; d++) {
  const rad = (d * Math.PI) / 180;
  SIN_LUT[d] = Math.round(Math.sin(rad) * 256);
  COS_LUT[d] = Math.round(Math.cos(rad) * 256);
}

/** Convert a decoded bundle's Uint8Array into a Uint32Array instruction segment. */
function bytesToWords(bytes) {
  if (!bytes || bytes.length < 4) return null;
  const count = Math.floor(bytes.length / 4);
  const words = new Uint32Array(count);
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  for (let i = 0; i < count; i++) {
    words[i] = dv.getUint32(i * 4, true);
  }
  return words;
}

export class PVM32 {
  constructor(seed = 0x1337c0de) {
    this.ram = new Int32Array(RAM_WORDS);
    this.fb = new Uint32Array(FB_PIXELS); // RGBA32 little-endian for zero-copy ImageData!
    this.fbBytes = new Uint8ClampedArray(this.fb.buffer);
    this.voices = Array.from({ length: 4 }, () => ({
      wave: 0,
      freqHz: 0,
      vol: 0,
      detune: 0,
      filter: 1800,
    }));

    this.frameCount = 0;
    this.inputMask = 0x20; // bit 5 = autopilot enabled by default for instant live motion!
    this.rngState = seed >>> 0;

    this.decoded = null;
    this.bundleCode = new Array(BUNDLE_SPECS.length).fill(null);
    this.bundleSources = new Array(BUNDLE_SPECS.length).fill('MISSING');

    // Live execution & anastomosis telemetry
    this.lastFrameInsns = 0;
    this.totalInsns = 0;
    this.lastFrameRoutes = []; // [{ organId, organName, requestedMaxS, resolvedBundle, resolvedStratum, source, insns }]
    this.traps = 0;
    this.lastTrap = null;
    this.lastRegisters = new Int32Array(32);
    this.alive = false;
  }

  /** Reset RAM, framebuffer, audio, and frame counter. */
  resetState(seed = 0x1337c0de) {
    this.ram.fill(0);
    this.fb.fill(PALETTE_RGBA[0]);
    this.silenceVoices();
    this.frameCount = 0;
    this.rngState = seed >>> 0;
    this.traps = 0;
    this.lastTrap = null;
    this.totalInsns = 0;
  }

  silenceVoices() {
    for (const v of this.voices) {
      v.wave = 0;
      v.freqHz = 0;
      v.vol = 0;
    }
  }

  /**
   * Hot-swap live organ bytecode from a newly decoded .hbin tissue state
   * WITHOUT clearing RAM or restarting execution!
   */
  loadDecoded(decoded, resetRam = false) {
    if (resetRam) this.resetState();
    this.decoded = decoded;
    this.alive = Boolean(decoded && decoded.bootable);

    for (let b = 0; b < BUNDLE_SPECS.length; b++) {
      const bun = decoded?.bundles?.[b];
      if (bun && bun.viable && bun.data) {
        this.bundleCode[b] = bytesToWords(bun.data);
        this.bundleSources[b] = bun.source;
      } else {
        this.bundleCode[b] = null;
        this.bundleSources[b] = 'MISSING';
      }
    }
    if (!this.alive) {
      this.silenceVoices();
      this.renderFlatline();
    }
  }

  setInput(mask) {
    this.inputMask = mask | 0;
  }

  nextRand(max) {
    let x = this.rngState || 1;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    this.rngState = x >>> 0;
    if (max <= 1) return 0;
    return (this.rngState % max) | 0;
  }

  /**
   * Anastomosis Organ Resolver (matches Lean 4 `resolveOrgan` specification!):
   * Given an organId and maxStratum, selects the highest viable bundle for that organ
   * with stratum <= maxStratum.
   */
  resolveOrganBundle(organId, maxStratum) {
    let bestId = -1;
    let bestStratum = -1;
    for (let b = 0; b < BUNDLE_SPECS.length; b++) {
      const spec = BUNDLE_SPECS[b];
      if (spec.organId === organId && spec.stratum <= maxStratum && this.bundleCode[b]) {
        if (spec.stratum > bestStratum) {
          bestStratum = spec.stratum;
          bestId = b;
        }
      }
    }
    return bestId;
  }

  /** Execute one complete 60 Hz frame starting at Bundle 0 (S0_STEM_NUCLEUS). */
  stepFrame(maxInsnBudget = 16000) {
    this.lastFrameRoutes = [];
    this.lastFrameInsns = 0;

    if (!this.alive || !this.bundleCode[0]) {
      this.silenceVoices();
      this.renderFlatline();
      return { alive: false, insns: 0, maxStratum: -1, routes: [] };
    }

    // Track whether any voice was written this frame; mute stale voices if audio organ dies
    const voiceTouched = [false, false, false, false];
    const budget = { remaining: maxInsnBudget, voiceTouched };

    this.lastFrameRoutes.push({
      organId: 0,
      organName: 'KERNEL',
      requestedMaxS: 0,
      resolvedBundle: 0,
      resolvedStratum: 0,
      source: this.bundleSources[0],
      insns: 0,
    });
    const rootRoute = this.lastFrameRoutes[0];
    const startRem = budget.remaining;

    this._execBundle(0, budget, 0);
    rootRoute.insns = startRem - budget.remaining;

    // Mute any voice not touched during this frame (prevents stuck notes when AUDIO organ amputated)
    for (let ch = 0; ch < 4; ch++) {
      if (!voiceTouched[ch]) {
        this.voices[ch].vol = 0;
        this.voices[ch].wave = 0;
      }
    }

    this.frameCount++;
    this.lastFrameInsns = maxInsnBudget - budget.remaining;
    this.totalInsns += this.lastFrameInsns;

    return {
      alive: true,
      insns: this.lastFrameInsns,
      maxStratum: this.decoded?.maxViableStratum ?? 0,
      routes: this.lastFrameRoutes,
      traps: this.traps,
    };
  }

  _execBundle(bundleId, budget, depth) {
    const code = this.bundleCode[bundleId];
    if (!code || depth > 4) return false;

    const regs = new Int32Array(32);
    const callStack = [];
    let pc = 0;
    const len = code.length;

    while (pc >= 0 && pc < len && budget.remaining > 0) {
      budget.remaining--;
      const word = code[pc++];
      const op = word & 0x3f;
      const rd = (word >>> 6) & 0x1f;
      const rs1 = (word >>> 11) & 0x1f;
      const rs2 = (word >>> 16) & 0x1f;

      switch (op) {
        case OP.NOP:
          break;
        case OP.HALT:
          this.lastRegisters.set(regs);
          return true;
        case OP.RET:
          if (callStack.length === 0) {
            this.lastRegisters.set(regs);
            return true;
          }
          pc = callStack.pop();
          break;
        case OP.ADD: regs[rd] = (regs[rs1] + regs[rs2]) | 0; break;
        case OP.SUB: regs[rd] = (regs[rs1] - regs[rs2]) | 0; break;
        case OP.MUL: regs[rd] = Math.imul(regs[rs1], regs[rs2]) | 0; break;
        case OP.DIV: regs[rd] = regs[rs2] === 0 ? 0 : (regs[rs1] / regs[rs2]) | 0; break;
        case OP.MOD: regs[rd] = regs[rs2] === 0 ? 0 : (regs[rs1] % regs[rs2]) | 0; break;
        case OP.AND: regs[rd] = (regs[rs1] & regs[rs2]) | 0; break;
        case OP.OR:  regs[rd] = (regs[rs1] | regs[rs2]) | 0; break;
        case OP.XOR: regs[rd] = (regs[rs1] ^ regs[rs2]) | 0; break;
        case OP.SHL: regs[rd] = (regs[rs1] << (regs[rs2] & 31)) | 0; break;
        case OP.SHR: regs[rd] = (regs[rs1] >> (regs[rs2] & 31)) | 0; break;
        case OP.SLT: regs[rd] = regs[rs1] < regs[rs2] ? 1 : 0; break;
        case OP.SEQ: regs[rd] = regs[rs1] === regs[rs2] ? 1 : 0; break;
        case OP.SNE: regs[rd] = regs[rs1] !== regs[rs2] ? 1 : 0; break;
        case OP.SGT: regs[rd] = regs[rs1] > regs[rs2] ? 1 : 0; break;
        case OP.SLE: regs[rd] = regs[rs1] <= regs[rs2] ? 1 : 0; break;
        case OP.SGE: regs[rd] = regs[rs1] >= regs[rs2] ? 1 : 0; break;

        case OP.LI:
          regs[rd] = signExt16((word >>> 16) & 0xffff);
          break;
        case OP.LUI:
          regs[rd] = ((((word >>> 16) & 0xffff) << 16) | (regs[rs1] & 0xffff)) | 0;
          break;
        case OP.ADDI:
          regs[rd] = (regs[rs1] + signExt16((word >>> 16) & 0xffff)) | 0;
          break;
        case OP.LDW: {
          const addr = (regs[rs1] + signExt16((word >>> 16) & 0xffff)) & 0xfff;
          regs[rd] = this.ram[addr];
          break;
        }
        case OP.STW: {
          const addr = (regs[rs1] + signExt16((word >>> 16) & 0xffff)) & 0xfff;
          this.ram[addr] = regs[rd];
          break;
        }

        case OP.BEQ:
          if (regs[rd] === regs[rs1]) pc = (pc - 1) + signExt16((word >>> 16) & 0xffff);
          break;
        case OP.BNE:
          if (regs[rd] !== regs[rs1]) pc = (pc - 1) + signExt16((word >>> 16) & 0xffff);
          break;
        case OP.BLT:
          if (regs[rd] < regs[rs1]) pc = (pc - 1) + signExt16((word >>> 16) & 0xffff);
          break;
        case OP.BGE:
          if (regs[rd] >= regs[rs1]) pc = (pc - 1) + signExt16((word >>> 16) & 0xffff);
          break;

        case OP.JMP:
          pc = signExt21((word >>> 11) & 0x1fffff);
          break;
        case OP.CALL: {
          const target = signExt21((word >>> 11) & 0x1fffff);
          if (callStack.length < 32) {
            callStack.push(pc);
            pc = target;
          } else {
            this.traps++;
            this.lastTrap = `STACK_OVERFLOW@B${bundleId}`;
            return false;
          }
          break;
        }

        case OP.SYSCALL: {
          const scId = signExt16((word >>> 16) & 0xffff);
          regs[rd] = this._syscall(scId, regs, budget.voiceTouched) | 0;
          break;
        }

        case OP.ORGAN_CALL: {
          const organId = rs1;
          const maxStratum = signExt16((word >>> 16) & 0xffff);
          const resolvedId = this.resolveOrganBundle(organId, maxStratum);
          if (resolvedId >= 0) {
            const before = budget.remaining;
            const ok = this._execBundle(resolvedId, budget, depth + 1);
            const used = before - budget.remaining;
            this.lastFrameRoutes.push({
              organId,
              organName: ORGAN_NAMES[organId] || `ORG_${organId}`,
              requestedMaxS: maxStratum,
              resolvedBundle: resolvedId,
              resolvedStratum: BUNDLE_SPECS[resolvedId].stratum,
              source: this.bundleSources[resolvedId],
              insns: used,
            });
            regs[rd] = ok ? 1 : 0;
          } else {
            this.lastFrameRoutes.push({
              organId,
              organName: ORGAN_NAMES[organId] || `ORG_${organId}`,
              requestedMaxS: maxStratum,
              resolvedBundle: -1,
              resolvedStratum: -1,
              source: 'FALLBACK_STUB',
              insns: 0,
            });
            regs[rd] = 0;
          }
          break;
        }

        default:
          // Invalid opcode (e.g., poisoned cell when Immune System is disabled!)
          this.traps++;
          this.lastTrap = `ILLEGAL_OP_${op}@B${bundleId}:PC${pc - 1}`;
          return false;
      }

      regs[0] = 0; // r0 hardwired zero
    }

    if (budget.remaining <= 0) {
      this.traps++;
      this.lastTrap = `BUDGET_EXCEEDED@B${bundleId}`;
    }
    this.lastRegisters.set(regs);
    return true;
  }

  _syscall(id, regs, voiceTouched) {
    const a1 = regs[1], a2 = regs[2], a3 = regs[3], a4 = regs[4], a5 = regs[5], a6 = regs[6], a7 = regs[7];
    switch (id) {
      case SYSCALL.CLEAR:
        this.fb.fill(PALETTE_RGBA[a1 & 0xff]);
        return 0;
      case SYSCALL.PIXEL:
        this._plot(a1, a2, PALETTE_RGBA[a3 & 0xff]);
        return 0;
      case SYSCALL.LINE:
        this._line(a1, a2, a3, a4, PALETTE_RGBA[a5 & 0xff]);
        return 0;
      case SYSCALL.RECT:
        this._rect(a1, a2, a3, a4, PALETTE_RGBA[a5 & 0xff], a6 !== 0);
        return 0;
      case SYSCALL.CIRCLE:
        this._circle(a1, a2, a3, PALETTE_RGBA[a4 & 0xff], a5 !== 0);
        return 0;
      case SYSCALL.TRI: {
        const col = PALETTE_RGBA[a7 & 0xff];
        this._line(a1, a2, a3, a4, col);
        this._line(a3, a4, a5, a6, col);
        this._line(a5, a6, a1, a2, col);
        return 0;
      }
      case SYSCALL.NUMBER:
        this._drawText(a1, a2, String(a3), PALETTE_RGBA[a4 & 0xff]);
        return 0;
      case SYSCALL.LABEL: {
        let s = '';
        for (let k = 0; k < 4; k++) {
          const ch = (a3 >>> (k * 8)) & 0x7f;
          if (ch >= 32) s += String.fromCharCode(ch);
        }
        for (let k = 0; k < 4; k++) {
          const ch = (a4 >>> (k * 8)) & 0x7f;
          if (ch >= 32) s += String.fromCharCode(ch);
        }
        this._drawText(a1, a2, s, PALETTE_RGBA[a5 & 0xff]);
        return 0;
      }
      case SYSCALL.SIN: {
        let d = a1 % 360;
        if (d < 0) d += 360;
        return SIN_LUT[d];
      }
      case SYSCALL.COS: {
        let d = a1 % 360;
        if (d < 0) d += 360;
        return COS_LUT[d];
      }
      case SYSCALL.RAND:
        return this.nextRand(a1);
      case SYSCALL.VOICE: {
        const ch = a1 & 3;
        const v = this.voices[ch];
        v.wave = Math.max(0, Math.min(5, a2));
        v.freqHz = Math.max(0, Math.min(8000, a3 / 16));
        v.vol = Math.max(0, Math.min(100, a4)) / 100;
        v.detune = a5;
        v.filter = Math.max(120, Math.min(12000, a6 || 2400));
        voiceTouched[ch] = true;
        return 0;
      }
      case SYSCALL.HEALTH: {
        const maxS = Math.max(0, this.decoded?.maxViableStratum ?? 0);
        let mask = 0;
        for (let b = 0; b < BUNDLE_SPECS.length; b++) {
          if (this.bundleCode[b]) mask |= 1 << b;
        }
        const xeno = this.decoded?.xenografts?.length ?? 0;
        return (maxS & 0xf) | ((mask & 0xff) << 4) | ((xeno & 0xf) << 12);
      }
      case SYSCALL.INPUT:
        return this.inputMask;
      case SYSCALL.FRAME:
        return this.frameCount | 0;
      case SYSCALL.GLOW: {
        // Fast phosphor persistence decay in-place
        const decay = Math.max(0, Math.min(250, a1));
        const b = this.fbBytes;
        for (let i = 0; i < b.length; i += 4) {
          b[i] = (b[i] * decay) >> 8;
          b[i + 1] = (b[i + 1] * decay) >> 8;
          b[i + 2] = (b[i + 2] * decay) >> 8;
        }
        return 0;
      }
      case SYSCALL.DIST:
        return Math.round(Math.hypot(a1, a2)) | 0;
      case SYSCALL.ABS:
        return a1 < 0 ? -a1 : a1;
      case SYSCALL.BUNDLE_OK:
        return a1 >= 0 && a1 < this.bundleCode.length && this.bundleCode[a1] ? 1 : 0;
      case SYSCALL.SILENCE:
        this.silenceVoices();
        return 0;
      default:
        return 0;
    }
  }

  _plot(x, y, col) {
    if (x >= 0 && x < FB_WIDTH && y >= 0 && y < FB_HEIGHT) {
      this.fb[y * FB_WIDTH + x] = col;
    }
  }

  _line(x0, y0, x1, y1, col) {
    x0 |= 0; y0 |= 0; x1 |= 0; y1 |= 0;
    let dx = Math.abs(x1 - x0);
    let dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    let guard = 320;
    while (guard-- > 0) {
      this._plot(x0, y0, col);
      if (x0 === x1 && y0 === y1) break;
      const e2 = err << 1;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  }

  _rect(x, y, w, h, col, filled) {
    if (w <= 0 || h <= 0) return;
    if (filled) {
      const x0 = Math.max(0, x | 0);
      const y0 = Math.max(0, y | 0);
      const x1 = Math.min(FB_WIDTH, (x + w) | 0);
      const y1 = Math.min(FB_HEIGHT, (y + h) | 0);
      for (let yy = y0; yy < y1; yy++) {
        const row = yy * FB_WIDTH;
        for (let xx = x0; xx < x1; xx++) {
          this.fb[row + xx] = col;
        }
      }
    } else {
      this._line(x, y, x + w - 1, y, col);
      this._line(x, y + h - 1, x + w - 1, y + h - 1, col);
      this._line(x, y, x, y + h - 1, col);
      this._line(x + w - 1, y, x + w - 1, y + h - 1, col);
    }
  }

  _circle(cx, cy, r, col, filled) {
    if (r <= 0) { this._plot(cx, cy, col); return; }
    if (r > 90) r = 90;
    let x = r, y = 0, err = 1 - r;
    while (x >= y) {
      if (filled) {
        this._line(cx - x, cy + y, cx + x, cy + y, col);
        this._line(cx - x, cy - y, cx + x, cy - y, col);
        this._line(cx - y, cy + x, cx + y, cy + x, col);
        this._line(cx - y, cy - x, cx + y, cy - x, col);
      } else {
        this._plot(cx + x, cy + y, col); this._plot(cx - x, cy + y, col);
        this._plot(cx + x, cy - y, col); this._plot(cx - x, cy - y, col);
        this._plot(cx + y, cy + x, col); this._plot(cx - y, cy + x, col);
        this._plot(cx + y, cy - x, col); this._plot(cx - y, cy - x, col);
      }
      y++;
      if (err < 0) {
        err += 2 * y + 1;
      } else {
        x--;
        err += 2 * (y - x + 1);
      }
    }
  }

  _drawText(x, y, text, col) {
    const up = String(text).toUpperCase();
    let cx = x | 0;
    for (let i = 0; i < up.length; i++) {
      const glyph = FONT_5X7[up[i]] || FONT_5X7[' '];
      for (let row = 0; row < 7; row++) {
        const bits = glyph[row];
        for (let bit = 0; bit < 5; bit++) {
          if ((bits >>> (4 - bit)) & 1) {
            this._plot(cx + bit, y + row, col);
          }
        }
      }
      cx += 6;
    }
  }

  renderFlatline() {
    this.fb.fill(PALETTE_RGBA[0]);
    this._line(0, 60, 159, 60, PALETTE_RGBA[5]);
    this._drawText(34, 42, 'CELL DEATH', PALETTE_RGBA[5]);
    this._drawText(16, 72, 'STRATUM 0 LOST', PALETTE_RGBA[14]);
  }

  /** Compute simple perceptual checksum of framebuffer to verify live graphical output in tests. */
  framebufferStats() {
    let nonBg = 0;
    let hash = 2166136261 >>> 0;
    const bg = PALETTE_RGBA[0];
    for (let i = 0; i < this.fb.length; i++) {
      const px = this.fb[i];
      if (px !== bg) nonBg++;
      hash ^= px & 0xff;
      hash = Math.imul(hash, 16777619) >>> 0;
    }
    return { nonBgPixels: nonBg, hashHex: hash.toString(16).padStart(8, '0') };
  }
}
