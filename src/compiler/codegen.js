/**
 * Plang Multi-Stratum Code Generator -> PVM-32 32-bit Machine Code
 *
 * Register Convention:
 *   r0       : hardwired zero
 *   r1..r7   : syscall / function arguments & return value (r1)
 *   r8..r17  : expression evaluation scratch stack (10 registers)
 *   r18..r31 : local variables (14 registers per function/bundle scope; windowed by PVM-32 CALL/RET)
 */

import {
  OP,
  SYSCALL_BY_NAME,
  encodeR,
  encodeI,
  encodeB,
  encodeJ,
  pack4,
} from './isa.js';
import { BUNDLE_SPECS, ORGAN_IDS, CELL_PAYLOAD_SIZE } from '../core/hbin.js';

const BUNDLE_ID_MAP = new Map(BUNDLE_SPECS.map((b) => [b.name, b.id]));
const ORGAN_ID_MAP = new Map(Object.entries(ORGAN_IDS));
const SYSCALL_MAP = new Map(Object.entries(SYSCALL_BY_NAME));
const BINARY_OP_MAP = new Map([
  ['+', OP.ADD], ['-', OP.SUB], ['*', OP.MUL], ['/', OP.DIV], ['%', OP.MOD],
  ['&', OP.AND], ['|', OP.OR], ['^', OP.XOR], ['<<', OP.SHL], ['>>', OP.SHR],
  ['<', OP.SLT], ['==', OP.SEQ], ['!=', OP.SNE], ['>', OP.SGT], ['<=', OP.SLE], ['>=', OP.SGE],
]);
const MAX_CONST_DEPTH = 128;

/** Evaluate compile-time constant expression (strict division/modulo by zero & depth check). */
function evalConstExpr(node, constEnv, depth = 0) {
  if (depth > MAX_CONST_DEPTH) {
    throw new RangeError('Constant expression nesting too deep');
  }
  if (node.type === 'Number') return node.value | 0;
  if (node.type === 'String') return pack4(node.value);
  if (node.type === 'Ident') {
    if (constEnv.has(node.name)) return constEnv.get(node.name);
    if (ORGAN_ID_MAP.has(node.name)) return ORGAN_ID_MAP.get(node.name);
    throw new Error(`Unknown constant '${node.name}'`);
  }
  if (node.type === 'Ternary') {
    return evalConstExpr(node.cond, constEnv, depth + 1) !== 0
      ? evalConstExpr(node.thenExpr, constEnv, depth + 1)
      : evalConstExpr(node.elseExpr, constEnv, depth + 1);
  }
  if (node.type === 'Binary') {
    if (node.op === '&&') {
      return evalConstExpr(node.left, constEnv, depth + 1) !== 0 && evalConstExpr(node.right, constEnv, depth + 1) !== 0 ? 1 : 0;
    }
    if (node.op === '||') {
      return evalConstExpr(node.left, constEnv, depth + 1) !== 0 || evalConstExpr(node.right, constEnv, depth + 1) !== 0 ? 1 : 0;
    }
    const l = evalConstExpr(node.left, constEnv, depth + 1);
    const r = evalConstExpr(node.right, constEnv, depth + 1);
    switch (node.op) {
      case '+': return (l + r) | 0;
      case '-': return (l - r) | 0;
      case '*': return Math.imul(l, r) | 0;
      case '/':
        if (r === 0) throw new RangeError('Compile-time division by zero in const expression');
        return (l / r) | 0;
      case '%':
        if (r === 0) throw new RangeError('Compile-time modulo by zero in const expression');
        return (l % r) | 0;
      case '&': return (l & r) | 0;
      case '|': return (l | r) | 0;
      case '^': return (l ^ r) | 0;
      case '<<': return (l << r) | 0;
      case '>>': return (l >> r) | 0;
      case '==': return l === r ? 1 : 0;
      case '!=': return l !== r ? 1 : 0;
      case '<': return l < r ? 1 : 0;
      case '>': return l > r ? 1 : 0;
      case '<=': return l <= r ? 1 : 0;
      case '>=': return l >= r ? 1 : 0;
      default: throw new Error(`Unsupported const op '${node.op}'`);
    }
  }
  throw new Error(`Non-constant expression in const declaration: ${node.type}`);
}

/** Compile a single bundle AST node into PVM-32 machine code Uint8Array. */
function compileBundle(bundleNode, constEnv) {
  const words = [];
  const fnArities = new Map();
  const fixups = []; // { wordIdx, kind: 'JMP'|'CALL'|'B', op, rs1, rs2, targetLabel }
  const labels = new Map();
  let labelSeq = 0;

  // Pre-validate all local fn declarations (no duplicates, no syscall shadowing, <= 7 unique params)
  for (const fn of bundleNode.funcs) {
    if (SYSCALL_MAP.has(fn.name)) {
      throw new Error(`Function '${fn.name}' in bundle ${bundleNode.name} collides with built-in syscall`);
    }
    if (fnArities.has(fn.name)) {
      throw new Error(`Duplicate function '${fn.name}' in bundle ${bundleNode.name}`);
    }
    if (fn.params.length > 7) {
      throw new Error(`Function '${fn.name}' in bundle ${bundleNode.name} has ${fn.params.length} params (max 7)`);
    }
    const seenParams = new Set();
    for (const p of fn.params) {
      if (seenParams.has(p)) {
        throw new Error(`Duplicate parameter '${p}' in function '${fn.name}' (${bundleNode.name})`);
      }
      seenParams.add(p);
    }
    fnArities.set(fn.name, fn.params.length);
  }

  function newLabel(prefix = 'L') {
    return `${prefix}_${labelSeq++}`;
  }

  function markLabel(name) {
    labels.set(name, words.length);
  }

  function emit(w) {
    words.push(w >>> 0);
  }

  function emitLoadImm(rd, val) {
    val = val | 0;
    if (val >= -32768 && val <= 32767) {
      emit(encodeI(OP.LI, rd, 0, val));
    } else {
      const lo = val & 0xffff;
      const hi = (val >>> 16) & 0xffff;
      if (lo <= 32767) {
        emit(encodeI(OP.LI, rd, 0, lo));
      } else {
        emit(encodeI(OP.LI, rd, 0, lo - 65536));
      }
      emit(encodeI(OP.LUI, rd, rd, hi));
    }
  }

  // Register allocation scope per function/main body
  // r0 = zero, r1..r7 = call args/ret, r8..r17 = expr scratch (10 regs), r18..r31 = locals (14 regs)
  function compileScope(stmts, paramNames = [], isFunction = false) {
    const locals = new Map();
    let blockDeclared = new Set();
    let nextLocalReg = 18;

    // Copy function params from r1..rN into local registers r18..
    for (let i = 0; i < paramNames.length; i++) {
      if (nextLocalReg > 31) {
        throw new Error(`Exceeded 14 local variable registers in bundle ${bundleNode.name} (param '${paramNames[i]}')`);
      }
      const reg = nextLocalReg++;
      locals.set(paramNames[i], reg);
      blockDeclared.add(paramNames[i]);
      emit(encodeR(OP.ADD, reg, i + 1, 0));
    }

    function resolveConstImm(node) {
      if (node.type === 'Number') return node.value | 0;
      if (node.type === 'Ident' && !locals.has(node.name) && constEnv.has(node.name)) {
        return constEnv.get(node.name) | 0;
      }
      return null;
    }

    function containsCall(n) {
      if (!n) return false;
      if (n.type === 'Call' || n.type === 'OrganCall') return true;
      if (n.type === 'Binary') return containsCall(n.left) || containsCall(n.right);
      if (n.type === 'Ternary') return containsCall(n.cond) || containsCall(n.thenExpr) || containsCall(n.elseExpr);
      if (n.type === 'MemLoad') return containsCall(n.index);
      return false;
    }

    function compileExpr(node, targetReg, tempBase = 8) {
      if (node.type === 'Number') {
        emitLoadImm(targetReg, node.value);
        return;
      }

      if (node.type === 'String') {
        emitLoadImm(targetReg, pack4(node.value));
        return;
      }

      if (node.type === 'Ident') {
        if (locals.has(node.name)) {
          const r = locals.get(node.name);
          if (r !== targetReg) emit(encodeR(OP.ADD, targetReg, r, 0));
          return;
        }
        if (constEnv.has(node.name)) {
          emitLoadImm(targetReg, constEnv.get(node.name));
          return;
        }
        if (ORGAN_ID_MAP.has(node.name)) {
          emitLoadImm(targetReg, ORGAN_ID_MAP.get(node.name));
          return;
        }
        throw new Error(`Undefined identifier '${node.name}' in bundle ${bundleNode.name}`);
      }

      if (tempBase > 17) {
        throw new Error(`Expression nesting too deep in bundle ${bundleNode.name}`);
      }

      if (node.type === 'MemLoad') {
        const immIdx = resolveConstImm(node.index);
        if (immIdx !== null && immIdx >= 0 && immIdx < 4096) {
          emit(encodeI(OP.LDW, targetReg, 0, immIdx));
        } else if (node.index.type === 'Ident' && locals.has(node.index.name)) {
          emit(encodeI(OP.LDW, targetReg, locals.get(node.index.name), 0));
        } else if (node.index.type === 'Binary' && node.index.op === '+') {
          const rOff = resolveConstImm(node.index.right);
          if (rOff !== null && rOff >= -32768 && rOff <= 32767) {
            if (node.index.left.type === 'Ident' && locals.has(node.index.left.name)) {
              emit(encodeI(OP.LDW, targetReg, locals.get(node.index.left.name), rOff));
            } else {
              compileExpr(node.index.left, tempBase, tempBase + 1);
              emit(encodeI(OP.LDW, targetReg, tempBase, rOff));
            }
            return;
          }
          compileExpr(node.index, tempBase, tempBase + 1);
          emit(encodeI(OP.LDW, targetReg, tempBase, 0));
        } else {
          compileExpr(node.index, tempBase, tempBase + 1);
          emit(encodeI(OP.LDW, targetReg, tempBase, 0));
        }
        return;
      }

      if (node.type === 'OrganCall') {
        if (!ORGAN_ID_MAP.has(node.organName)) {
          throw new Error(`Unknown organ '${node.organName}' in organ_call`);
        }
        const organId = ORGAN_ID_MAP.get(node.organName);
        const maxS = evalConstExpr(node.maxStratum, constEnv);
        if (!Number.isInteger(maxS) || maxS < 0 || maxS > 3) {
          throw new RangeError(`organ_call maxStratum must be in 0..3, got ${maxS}`);
        }
        emit(encodeI(OP.ORGAN_CALL, targetReg, organId, maxS));
        return;
      }

      if (node.type === 'Call') {
        const sc = SYSCALL_MAP.get(node.name);
        const anyNestedCall = node.args.some(containsCall);
        if (sc) {
          if (node.args.length !== sc.args) {
            throw new Error(`Syscall '${node.name}' expects ${sc.args} args, got ${node.args.length}`);
          }
          if (!anyNestedCall) {
            for (let i = 0; i < node.args.length; i++) {
              compileExpr(node.args[i], i + 1, tempBase);
            }
          } else {
            if (tempBase + node.args.length - 1 > 17) {
              throw new Error(`Expression nesting too deep for nested syscall '${node.name}' in ${bundleNode.name}`);
            }
            for (let i = 0; i < node.args.length; i++) {
              compileExpr(node.args[i], tempBase + i, tempBase + i + 1);
            }
            for (let i = 0; i < node.args.length; i++) {
              emit(encodeR(OP.ADD, i + 1, tempBase + i, 0));
            }
          }
          emit(encodeI(OP.SYSCALL, targetReg, 0, sc.id));
          return;
        }

        // Local bundle function call — enforce exact declared arity!
        if (!fnArities.has(node.name)) {
          throw new Error(`Undefined function '${node.name}' in bundle ${bundleNode.name}`);
        }
        const expectedArgs = fnArities.get(node.name);
        if (node.args.length !== expectedArgs) {
          throw new Error(`Function '${node.name}' expects ${expectedArgs} args, got ${node.args.length}`);
        }
        if (!anyNestedCall) {
          for (let i = 0; i < node.args.length; i++) {
            compileExpr(node.args[i], i + 1, tempBase);
          }
        } else {
          if (tempBase + node.args.length - 1 > 17) {
            throw new Error(`Expression nesting too deep for nested call '${node.name}' in ${bundleNode.name}`);
          }
          for (let i = 0; i < node.args.length; i++) {
            compileExpr(node.args[i], tempBase + i, tempBase + i + 1);
          }
          for (let i = 0; i < node.args.length; i++) {
            emit(encodeR(OP.ADD, i + 1, tempBase + i, 0));
          }
        }
        fixups.push({ wordIdx: words.length, kind: 'CALL', targetLabel: `FN_${node.name}` });
        emit(encodeJ(OP.CALL, 0, 0));
        if (targetReg !== 1) emit(encodeR(OP.ADD, targetReg, 1, 0));
        return;
      }

      if (node.type === 'Ternary') {
        const elseLbl = newLabel('TERN_E');
        const endLbl = newLabel('TERN_D');
        compileExpr(node.cond, tempBase, tempBase + 1);
        fixups.push({ wordIdx: words.length, kind: 'B', op: OP.BEQ, rs1: tempBase, rs2: 0, targetLabel: elseLbl });
        emit(0);
        compileExpr(node.thenExpr, targetReg, tempBase);
        fixups.push({ wordIdx: words.length, kind: 'JMP', targetLabel: endLbl });
        emit(0);
        markLabel(elseLbl);
        compileExpr(node.elseExpr, targetReg, tempBase);
        markLabel(endLbl);
        return;
      }

      if (node.type === 'Binary') {
        // Short-circuit && and ||
        if (node.op === '&&') {
          const falseLbl = newLabel('AND_F');
          const endLbl = newLabel('AND_E');
          compileExpr(node.left, tempBase, tempBase + 1);
          fixups.push({ wordIdx: words.length, kind: 'B', op: OP.BEQ, rs1: tempBase, rs2: 0, targetLabel: falseLbl });
          emit(0);
          compileExpr(node.right, tempBase, tempBase + 1);
          emit(encodeR(OP.SNE, targetReg, tempBase, 0));
          fixups.push({ wordIdx: words.length, kind: 'JMP', targetLabel: endLbl });
          emit(0);
          markLabel(falseLbl);
          emit(encodeI(OP.LI, targetReg, 0, 0));
          markLabel(endLbl);
          return;
        }
        if (node.op === '||') {
          const trueLbl = newLabel('OR_T');
          const endLbl = newLabel('OR_E');
          compileExpr(node.left, tempBase, tempBase + 1);
          fixups.push({ wordIdx: words.length, kind: 'B', op: OP.BNE, rs1: tempBase, rs2: 0, targetLabel: trueLbl });
          emit(0);
          compileExpr(node.right, tempBase, tempBase + 1);
          emit(encodeR(OP.SNE, targetReg, tempBase, 0));
          fixups.push({ wordIdx: words.length, kind: 'JMP', targetLabel: endLbl });
          emit(0);
          markLabel(trueLbl);
          emit(encodeI(OP.LI, targetReg, 0, 1));
          markLabel(endLbl);
          return;
        }

        // Fast immediate add/sub optimization
        if (node.op === '+' && node.right.type === 'Number' && node.right.value >= -32768 && node.right.value <= 32767) {
          if (node.left.type === 'Ident' && locals.has(node.left.name)) {
            emit(encodeI(OP.ADDI, targetReg, locals.get(node.left.name), node.right.value));
          } else {
            compileExpr(node.left, tempBase, tempBase + 1);
            emit(encodeI(OP.ADDI, targetReg, tempBase, node.right.value));
          }
          return;
        }
        if (node.op === '-' && node.right.type === 'Number' && node.right.value >= -32767 && node.right.value <= 32768) {
          if (node.left.type === 'Ident' && locals.has(node.left.name)) {
            emit(encodeI(OP.ADDI, targetReg, locals.get(node.left.name), -node.right.value));
          } else {
            compileExpr(node.left, tempBase, tempBase + 1);
            emit(encodeI(OP.ADDI, targetReg, tempBase, -node.right.value));
          }
          return;
        }

        // Fast register-direct operands when left/right are local variables!
        const leftReg = (node.left.type === 'Ident' && locals.has(node.left.name)) ? locals.get(node.left.name) : -1;
        const rightReg = (node.right.type === 'Ident' && locals.has(node.right.name)) ? locals.get(node.right.name) : -1;
        let rL = leftReg;
        let rR = rightReg;
        if (rL < 0) {
          rL = tempBase;
          compileExpr(node.left, rL, tempBase + 1);
        }
        if (rR < 0) {
          rR = (rL === tempBase) ? tempBase + 1 : tempBase;
          if (rR > 17) {
            throw new Error(`Expression nesting too deep in bundle ${bundleNode.name} (scratch register overflow)`);
          }
          compileExpr(node.right, rR, rR + 1);
        }
        const opc = BINARY_OP_MAP.get(node.op);
        if (opc === undefined) throw new Error(`Unknown binary op '${node.op}'`);
        emit(encodeR(opc, targetReg, rL, rR));
        return;
      }

      throw new Error(`Unsupported expr node '${node.type}'`);
    }

    function compileCondJumpFalse(cond, falseLabel) {
      if (cond.type === 'Binary' && ['==', '!=', '<', '>='].includes(cond.op)) {
        const inv = { '==': OP.BNE, '!=': OP.BEQ, '<': OP.BGE, '>=': OP.BLT };
        const lReg = (cond.left.type === 'Ident' && locals.has(cond.left.name)) ? locals.get(cond.left.name) : -1;
        const rReg = (cond.right.type === 'Ident' && locals.has(cond.right.name)) ? locals.get(cond.right.name)
          : (cond.right.type === 'Number' && cond.right.value === 0) ? 0 : -1;
        let rl = lReg;
        let rr = rReg;
        if (rl < 0) { rl = 8; compileExpr(cond.left, 8, 9); }
        if (rr < 0) { rr = rl === 8 ? 9 : 8; compileExpr(cond.right, rr, rr + 1); }
        fixups.push({ wordIdx: words.length, kind: 'B', op: inv[cond.op], rs1: rl, rs2: rr, targetLabel: falseLabel });
        emit(0);
        return;
      }
      compileExpr(cond, 8, 9);
      fixups.push({ wordIdx: words.length, kind: 'B', op: OP.BEQ, rs1: 8, rs2: 0, targetLabel: falseLabel });
      emit(0);
    }

    function compileStmt(stmt) {
      switch (stmt.type) {
        case 'Block': {
          const savedLocals = new Map(locals);
          const savedDeclared = blockDeclared;
          const savedNext = nextLocalReg;
          blockDeclared = new Set();
          for (const s of stmt.stmts) compileStmt(s);
          locals.clear();
          for (const [k, v] of savedLocals) locals.set(k, v);
          blockDeclared = savedDeclared;
          nextLocalReg = savedNext;
          break;
        }
        case 'LetStmt': {
          // Validate & reserve nextLocalReg, compile initializer BEFORE binding stmt.name
          // (zero extra move instruction, blocks self-ref stale-reg reads & preserves outer shadowing!)
          if (blockDeclared.has(stmt.name)) {
            throw new Error(`Variable '${stmt.name}' already declared in this block of bundle ${bundleNode.name}`);
          }
          if (nextLocalReg > 31) {
            throw new Error(`Exceeded 14 local variable registers in bundle ${bundleNode.name} (var '${stmt.name}')`);
          }
          const reg = nextLocalReg;
          compileExpr(stmt.init, reg, 8);
          locals.set(stmt.name, reg);
          blockDeclared.add(stmt.name);
          nextLocalReg = reg + 1;
          break;
        }
        case 'AssignStmt': {
          if (!locals.has(stmt.name)) {
            throw new Error(`Cannot assign to undeclared variable '${stmt.name}' in ${bundleNode.name}`);
          }
          compileExpr(stmt.value, locals.get(stmt.name), 8);
          break;
        }
        case 'MemStore': {
          const immIdx = resolveConstImm(stmt.index);
          if (immIdx !== null && immIdx >= 0 && immIdx < 4096) {
            compileExpr(stmt.value, 8, 9);
            emit(encodeI(OP.STW, 8, 0, immIdx));
          } else if (stmt.index.type === 'Ident' && locals.has(stmt.index.name)) {
            compileExpr(stmt.value, 8, 9);
            emit(encodeI(OP.STW, 8, locals.get(stmt.index.name), 0));
          } else if (stmt.index.type === 'Binary' && stmt.index.op === '+' && stmt.index.left.type === 'Ident' && locals.has(stmt.index.left.name)) {
            const rOff = resolveConstImm(stmt.index.right);
            if (rOff !== null && rOff >= -32768 && rOff <= 32767) {
              compileExpr(stmt.value, 8, 9);
              emit(encodeI(OP.STW, 8, locals.get(stmt.index.left.name), rOff));
            } else {
              compileExpr(stmt.index, 8, 9);
              compileExpr(stmt.value, 9, 10);
              emit(encodeI(OP.STW, 9, 8, 0));
            }
          } else {
            compileExpr(stmt.index, 8, 9);
            compileExpr(stmt.value, 9, 10);
            emit(encodeI(OP.STW, 9, 8, 0));
          }
          break;
        }
        case 'MemCompoundAssign': {
          // Single-evaluation of stmt.index AND evaluate rhs BEFORE LDW so rhs side-effects on mem[index] aren't lost!
          const opc = stmt.op === '+' ? OP.ADD : OP.SUB;
          const immIdx = resolveConstImm(stmt.index);
          const rhsImm = resolveConstImm(stmt.rhs);
          const signedDelta = rhsImm !== null ? (stmt.op === '+' ? rhsImm : -rhsImm) : null;
          if (immIdx !== null && immIdx >= 0 && immIdx < 4096) {
            if (signedDelta !== null && signedDelta >= -32768 && signedDelta <= 32767) {
              emit(encodeI(OP.LDW, 8, 0, immIdx));
              emit(encodeI(OP.ADDI, 8, 8, signedDelta));
            } else {
              compileExpr(stmt.rhs, 9, 10);
              emit(encodeI(OP.LDW, 8, 0, immIdx));
              emit(encodeR(opc, 8, 8, 9));
            }
            emit(encodeI(OP.STW, 8, 0, immIdx));
          } else {
            compileExpr(stmt.index, 8, 9);
            if (signedDelta !== null && signedDelta >= -32768 && signedDelta <= 32767) {
              emit(encodeI(OP.LDW, 9, 8, 0));
              emit(encodeI(OP.ADDI, 9, 9, signedDelta));
            } else {
              compileExpr(stmt.rhs, 10, 11);
              emit(encodeI(OP.LDW, 9, 8, 0));
              emit(encodeR(opc, 9, 9, 10));
            }
            emit(encodeI(OP.STW, 9, 8, 0));
          }
          break;
        }
        case 'ExprStmt':
          compileExpr(stmt.expr, 8, 8);
          break;
        case 'IfStmt': {
          const elseLbl = newLabel('ELSE');
          const endLbl = newLabel('ENDIF');
          compileCondJumpFalse(stmt.cond, stmt.elseBranch ? elseLbl : endLbl);
          compileStmt(stmt.thenBranch);
          if (stmt.elseBranch) {
            fixups.push({ wordIdx: words.length, kind: 'JMP', targetLabel: endLbl });
            emit(0);
            markLabel(elseLbl);
            compileStmt(stmt.elseBranch);
          }
          markLabel(endLbl);
          break;
        }
        case 'WhileStmt': {
          const loopLbl = newLabel('LOOP');
          const endLbl = newLabel('ENDLOOP');
          markLabel(loopLbl);
          compileCondJumpFalse(stmt.cond, endLbl);
          compileStmt(stmt.body);
          fixups.push({ wordIdx: words.length, kind: 'JMP', targetLabel: loopLbl });
          emit(0);
          markLabel(endLbl);
          break;
        }
        case 'ReturnStmt': {
          if (stmt.value) {
            compileExpr(stmt.value, 1, 8);
          } else if (isFunction) {
            emit(encodeI(OP.LI, 1, 0, 0));
          }
          emit(encodeR(isFunction ? OP.RET : OP.HALT, 0, 0, 0));
          break;
        }
        default:
          throw new Error(`Unsupported stmt node '${stmt.type}'`);
      }
    }

    for (const s of stmts) compileStmt(s);
    const lastStmt = stmts.length > 0 ? stmts[stmts.length - 1] : null;
    if (!lastStmt || lastStmt.type !== 'ReturnStmt') {
      if (isFunction) emit(encodeI(OP.LI, 1, 0, 0));
      emit(encodeR(isFunction ? OP.RET : OP.HALT, 0, 0, 0));
    }
  }

  // Entry point starts at PC = 0 (main bundle body)
  compileScope(bundleNode.body, [], false);

  // Compile bundle-local helper functions after main HALT
  for (const fn of bundleNode.funcs) {
    markLabel(`FN_${fn.name}`);
    compileScope(fn.body.stmts, fn.params, true);
  }

  // Resolve branch/jump fixups
  for (const fx of fixups) {
    const target = labels.get(fx.targetLabel);
    if (target === undefined) {
      throw new Error(`Unresolved label '${fx.targetLabel}' in bundle ${bundleNode.name}`);
    }
    if (fx.kind === 'JMP') {
      words[fx.wordIdx] = encodeJ(OP.JMP, 0, target);
    } else if (fx.kind === 'CALL') {
      words[fx.wordIdx] = encodeJ(OP.CALL, 0, target);
    } else if (fx.kind === 'B') {
      const rel = target - fx.wordIdx;
      words[fx.wordIdx] = encodeB(fx.op, fx.rs1, fx.rs2, rel);
    }
  }

  // Pack words as little-endian Uint8Array
  const bytes = new Uint8Array(words.length * 4);
  const dv = new DataView(bytes.buffer);
  for (let i = 0; i < words.length; i++) {
    dv.setUint32(i * 4, words[i], true);
  }
  return { bytes, instructionCount: words.length };
}

/**
 * Compile a full Plang AST into 6 executable organ-stratum bytecode payloads.
 */
export function generateCode(ast) {
  const constEnv = new Map();
  // Inject built-in organ & bundle ID constants
  for (const [k, v] of Object.entries(ORGAN_IDS)) constEnv.set(k, v);
  for (const b of BUNDLE_SPECS) constEnv.set(`BUNDLE_${b.name}`, b.id);

  const userConsts = new Set();
  for (const c of ast.consts) {
    if (userConsts.has(c.name)) {
      throw new Error(`Duplicate const declaration '${c.name}' in program '${ast.name}'`);
    }
    userConsts.add(c.name);
    constEnv.set(c.name, evalConstExpr(c.expr, constEnv));
  }

  const bundles = new Map();
  const report = [];

  for (const bNode of ast.bundles) {
    const bid = BUNDLE_ID_MAP.get(bNode.name);
    if (bid === undefined) {
      throw new Error(`Unknown bundle name '${bNode.name}'. Valid: ${BUNDLE_SPECS.slice(0, 6).map((b) => b.name).join(', ')}`);
    }
    if (bid === 6) {
      throw new Error(`Bundle '${bNode.name}' is reserved for the JSON Genome Ledger and cannot hold executable code`);
    }
    if (bundles.has(bid)) {
      throw new Error(`Duplicate bundle declaration '${bNode.name}'`);
    }
    const compiled = compileBundle(bNode, constEnv);
    const maxCap = BUNDLE_SPECS[bid].k * CELL_PAYLOAD_SIZE;
    if (compiled.bytes.length > maxCap) {
      throw new Error(
        `Bundle ${bNode.name} compiled to ${compiled.bytes.length}B (${compiled.instructionCount} insns), exceeding capacity ${maxCap}B`
      );
    }
    bundles.set(bid, compiled.bytes);
    report.push({
      bundleId: bid,
      name: bNode.name,
      instructions: compiled.instructionCount,
      bytes: compiled.bytes.length,
      capacityBytes: maxCap,
      utilizationPct: Number(((compiled.bytes.length / maxCap) * 100).toFixed(1)),
    });
  }

  if (!bundles.has(0)) {
    throw new Error(`Program '${ast.name}' is missing mandatory S0_STEM_NUCLEUS bundle`);
  }

  return {
    name: ast.name,
    bundles,
    report,
    totalInstructions: report.reduce((a, r) => a + r.instructions, 0),
    totalCodeBytes: report.reduce((a, r) => a + r.bytes, 0),
  };
}
