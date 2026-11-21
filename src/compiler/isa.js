/**
 * PVM-32 — 32-bit Register-Based Anastomosis Virtual Machine ISA Specification
 *
 * Fixed 32-bit little-endian instruction words:
 *   R-type: [op:6][rd:5][rs1:5][rs2:5][unused:11]
 *   I-type: [op:6][rd:5][rs1:5][imm16_signed:16]
 *   B-type: [op:6][rs1:5][rs2:5][rel16_signed:16]
 *   J-type: [op:6][rd:5][imm21_signed:21]
 */

export const OP = {
  NOP: 0,
  HALT: 1,
  RET: 2,
  // R-type ALU
  ADD: 3,
  SUB: 4,
  MUL: 5,
  DIV: 6,
  MOD: 7,
  AND: 8,
  OR: 9,
  XOR: 10,
  SHL: 11,
  SHR: 12,
  SLT: 13,
  SEQ: 14,
  SNE: 15,
  SGT: 16,
  SLE: 17,
  SGE: 18,
  // I-type
  LI: 19,    // rd = sign_ext(imm16)
  LUI: 20,   // rd = (imm16 << 16) | (rs1 & 0xFFFF)
  ADDI: 21,  // rd = rs1 + sign_ext(imm16)
  LDW: 22,   // rd = MEM[(rs1 + imm16) & 0xFFF]
  STW: 23,   // MEM[(rs1 + imm16) & 0xFFF] = rd
  // Branches (B-type: rs1 in bits 6..10, rs2 in bits 11..15, rel16 in bits 16..31)
  BEQ: 24,
  BNE: 25,
  BLT: 26,
  BGE: 27,
  // Jumps (J-type: imm21 in bits 11..31 = absolute word PC within bundle)
  JMP: 28,
  CALL: 29,
  // Syscall & Anastomosis Organ Dispatch
  SYSCALL: 30,     // rd = dest reg for return value; imm16 = syscall ID; args in r1..r7
  ORGAN_CALL: 31,  // rd = return (1=executed, 0=fallback/missing); rs1 = organId; imm16 = maxStratum
};

export const OP_NAMES = Object.fromEntries(Object.entries(OP).map(([k, v]) => [v, k]));

export const SYSCALL = {
  CLEAR: 0,       // clear(color)
  PIXEL: 1,       // pixel(x, y, color)
  LINE: 2,        // line(x0, y0, x1, y1, color)
  RECT: 3,        // rect(x, y, w, h, color, filled)
  CIRCLE: 4,      // circle(cx, cy, r, color, filled)
  TRI: 5,         // tri(x0, y0, x1, y1, x2, y2, color)
  NUMBER: 6,      // number(x, y, value, color)
  LABEL: 7,       // label(x, y, pack0, pack1, color) — 8 ASCII chars packed in 2x32-bit ints
  SIN: 8,         // sin(deg) -> [-256..256]
  COS: 9,         // cos(deg) -> [-256..256]
  RAND: 10,       // rand(max) -> [0..max-1]
  VOICE: 11,      // voice(ch, wave, freqHz16, vol, detune, filter)
  HEALTH: 12,     // health() -> bitmask: stratum(0..3) | aliveMask<<4 | xenoCount<<12
  INPUT: 13,      // input() -> bitmask
  FRAME: 14,      // frame() -> uint32 frame counter
  GLOW: 15,       // glow(decay0_255) -> fades existing framebuffer for phosphor trails
  DIST: 16,       // dist(dx, dy) -> integer sqrt(dx^2 + dy^2)
  ABS: 17,        // abs(v) -> |v|
  BUNDLE_OK: 18,  // bundle_ok(bundleId) -> 1 if viable, 0 if missing
  SILENCE: 19,    // silence() -> mutes all 4 audio voices cleanly
};

export const SYSCALL_BY_NAME = {
  clear: { id: SYSCALL.CLEAR, args: 1 },
  pixel: { id: SYSCALL.PIXEL, args: 3 },
  line: { id: SYSCALL.LINE, args: 5 },
  rect: { id: SYSCALL.RECT, args: 6 },
  circle: { id: SYSCALL.CIRCLE, args: 5 },
  tri: { id: SYSCALL.TRI, args: 7 },
  number: { id: SYSCALL.NUMBER, args: 4 },
  label: { id: SYSCALL.LABEL, args: 5 },
  sin: { id: SYSCALL.SIN, args: 1 },
  cos: { id: SYSCALL.COS, args: 1 },
  rand: { id: SYSCALL.RAND, args: 1 },
  voice: { id: SYSCALL.VOICE, args: 6 },
  health: { id: SYSCALL.HEALTH, args: 0 },
  input: { id: SYSCALL.INPUT, args: 0 },
  frame: { id: SYSCALL.FRAME, args: 0 },
  glow: { id: SYSCALL.GLOW, args: 1 },
  dist: { id: SYSCALL.DIST, args: 2 },
  abs: { id: SYSCALL.ABS, args: 1 },
  bundle_ok: { id: SYSCALL.BUNDLE_OK, args: 1 },
  silence: { id: SYSCALL.SILENCE, args: 0 },
};

/** Pack up to 4 printable ASCII characters into a signed 32-bit int for label(). */
export function pack4(str) {
  if (typeof str !== 'string') {
    throw new TypeError('pack4 expects a string');
  }
  if (str.length > 4) {
    throw new RangeError(`pack4 string "${str}" exceeds 4-character limit (${str.length} chars)`);
  }
  let v = 0;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code > 0x7f) {
      throw new RangeError(`pack4 character '${str[i]}' (0x${code.toString(16)}) is non-ASCII`);
    }
    v |= code << (i * 8);
  }
  return v | 0;
}

function assertReg(r, label) {
  if (!Number.isInteger(r) || r < 0 || r > 31) {
    throw new RangeError(`Invalid register ${label}=${r} (expected integer 0..31)`);
  }
}

function assertOp(op) {
  if (!Number.isInteger(op) || op < 0 || op > 63) {
    throw new RangeError(`Invalid opcode ${op} (expected integer 0..63)`);
  }
}

export function encodeR(op, rd, rs1, rs2) {
  assertOp(op);
  assertReg(rd, 'rd');
  assertReg(rs1, 'rs1');
  assertReg(rs2, 'rs2');
  return (
    (op & 0x3f) |
    ((rd & 0x1f) << 6) |
    ((rs1 & 0x1f) << 11) |
    ((rs2 & 0x1f) << 16)
  ) >>> 0;
}

export function encodeI(op, rd, rs1, imm16) {
  assertOp(op);
  assertReg(rd, 'rd');
  assertReg(rs1, 'rs1');
  const minImm = op === OP.LUI ? 0 : -32768;
  const maxImm = op === OP.LUI ? 65535 : 32767;
  if (!Number.isInteger(imm16) || imm16 < minImm || imm16 > maxImm) {
    throw new RangeError(`Immediate ${imm16} out of range [${minImm}..${maxImm}] for opcode ${op}`);
  }
  return (
    (op & 0x3f) |
    ((rd & 0x1f) << 6) |
    ((rs1 & 0x1f) << 11) |
    ((imm16 & 0xffff) << 16)
  ) >>> 0;
}

export function encodeB(op, rs1, rs2, rel16) {
  assertOp(op);
  assertReg(rs1, 'rs1');
  assertReg(rs2, 'rs2');
  if (!Number.isInteger(rel16) || rel16 < -32768 || rel16 > 32767) {
    throw new RangeError(`Branch offset ${rel16} out of signed 16-bit range [-32768..32767]`);
  }
  return (
    (op & 0x3f) |
    ((rs1 & 0x1f) << 6) |
    ((rs2 & 0x1f) << 11) |
    ((rel16 & 0xffff) << 16)
  ) >>> 0;
}

export function encodeJ(op, rd, imm21) {
  assertOp(op);
  assertReg(rd, 'rd');
  if (!Number.isInteger(imm21) || imm21 < -1048576 || imm21 > 1048575) {
    throw new RangeError(`Jump target ${imm21} out of signed 21-bit range [-1048576..1048575]`);
  }
  return (
    (op & 0x3f) |
    ((rd & 0x1f) << 6) |
    ((imm21 & 0x1fffff) << 11)
  ) >>> 0;
}

export function signExt16(v) {
  return (v << 16) >> 16;
}

export function signExt21(v) {
  return (v << 11) >> 11;
}

/** Disassemble a single 32-bit PVM-32 instruction word to human-readable assembly. */
export function disassembleWord(word, pc = 0) {
  const op = word & 0x3f;
  const name = OP_NAMES[op] || `UNK_${op}`;
  const rd = (word >>> 6) & 0x1f;
  const rs1 = (word >>> 11) & 0x1f;
  const rs2 = (word >>> 16) & 0x1f;
  const imm16 = signExt16((word >>> 16) & 0xffff);
  const imm21 = signExt21((word >>> 11) & 0x1fffff);

  if (op === OP.NOP || op === OP.HALT || op === OP.RET) return name;
  if (op >= OP.ADD && op <= OP.SGE) return `${name} r${rd}, r${rs1}, r${rs2}`;
  if (op === OP.LI) return `LI r${rd}, ${imm16}`;
  if (op === OP.LUI) return `LUI r${rd}, r${rs1}, 0x${((word >>> 16) & 0xffff).toString(16)}`;
  if (op === OP.ADDI) return `ADDI r${rd}, r${rs1}, ${imm16}`;
  if (op === OP.LDW) return `LDW r${rd}, ${imm16}(r${rs1})`;
  if (op === OP.STW) return `STW r${rd}, ${imm16}(r${rs1})`;
  if (op >= OP.BEQ && op <= OP.BGE) return `${name} r${rd}, r${rs1}, @${pc + imm16}`;
  if (op === OP.JMP || op === OP.CALL) return `${name} @${imm21}`;
  if (op === OP.SYSCALL) return `SYSCALL r${rd}, #${imm16}`;
  if (op === OP.ORGAN_CALL) return `ORGAN_CALL r${rd}, organ=${rs1}, maxS=${imm16}`;
  return `${name} 0x${(word >>> 0).toString(16)}`;
}

/** Disassemble a byte buffer (little-endian 32-bit words). */
export function disassembleBytes(bytes, maxWords = 64) {
  const words = Math.min(Math.floor(bytes.length / 4), maxWords);
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const lines = [];
  for (let i = 0; i < words; i++) {
    const w = dv.getUint32(i * 4, true);
    lines.push(`${i.toString(16).padStart(4, '0')}: ${w.toString(16).padStart(8, '0')}  ${disassembleWord(w, i)}`);
  }
  return lines;
}

export const FB_WIDTH = 160;
export const FB_HEIGHT = 120;
export const FB_PIXELS = FB_WIDTH * FB_HEIGHT;
export const RAM_WORDS = 4096;
