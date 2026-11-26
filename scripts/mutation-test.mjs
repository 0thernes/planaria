#!/usr/bin/env node
/**
 * PLANARIA — Surgical Mutation Testing Harness (Build Standard B13)
 *
 * Plants 12 real-world high-severity single-line mutants across Layer 1-4 critical paths,
 * runs `node test/verify.mjs`, verifies EVERY mutant is KILLED (non-zero exit without spawn error),
 * and restores the exact original file contents unconditionally in `finally` AND on SIGINT/SIGTERM.
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VERSION = fs.readFileSync(path.join(ROOT, 'VERSION'), 'utf8').trim();

const MUTANTS = [
  {
    id: 'M01',
    file: 'src/core/hbin.js',
    desc: 'Skip Merkle quarantine filter (accepts unauthenticated cells)',
    find: 'if (primaryRootHex && cell.impliedRootHex === primaryRootHex) {',
    replace: 'if (true) {',
  },
  {
    id: 'M02',
    file: 'src/core/hbin.js',
    desc: 'Allow xenograft transplant on dead host (bypass bundles[0].viable check)',
    find: 'if (allowXenograft && primaryRootHex && bundles[0].viable && donorGroups.size > 0) {',
    replace: 'if (allowXenograft && donorGroups.size > 0) {',
  },
  {
    id: 'M03',
    file: 'src/core/hbin.js',
    desc: 'Drop iterative backward-flywheel recovery (breaks damaged-sync recovery)',
    find: 'let backOff = off - CELL_SIZE;',
    replace: 'let backOff = -1;',
  },
  {
    id: 'M04',
    file: 'src/core/rs.js',
    desc: 'Off-by-one RS(254,238) correction ceiling (> RS_MAX_ERRORS -> >= RS_MAX_ERRORS)',
    find: 'if (degree === 0 || degree > RS_MAX_ERRORS) {',
    replace: 'if (degree === 0 || degree >= RS_MAX_ERRORS) {',
  },
  {
    id: 'M05',
    file: 'src/core/cauchy.js',
    desc: 'Skip Cauchy coordinate deduplication check (allows duplicate evalX)',
    find: 'if (seen.has(cell.evalX)) continue;',
    replace: 'if (false && seen.has(cell.evalX)) continue;',
  },
  {
    id: 'M06',
    file: 'src/compiler/codegen.js',
    desc: 'Disable scratch-register overflow guard (allows clobbering r18)',
    find: 'if (rR > 17) {',
    replace: 'if (false && rR > 17) {',
  },
  {
    id: 'M07',
    file: 'src/vm/pvm32.js',
    desc: 'Disable STW RAM address sandboxing mask (& 0xfff)',
    find: 'case OP.STW: {\n          const addr = (regs[rs1] + signExt16((word >>> 16) & 0xffff)) & 0xfff;',
    replace: 'case OP.STW: {\n          const addr = (regs[rs1] + signExt16((word >>> 16) & 0xffff));',
  },
  {
    id: 'M08',
    file: 'src/quantum/qengine.js',
    desc: 'Corrupt Horodecki CHSH factor (2 * Math.sqrt -> 1 * Math.sqrt)',
    find: 'const maxRaw = 2 * Math.sqrt(Math.max(0, l0 + l1));',
    replace: 'const maxRaw = 1 * Math.sqrt(Math.max(0, l0 + l1));',
  },
  {
    id: 'M09',
    file: 'src/world/game3d.js',
    desc: 'Re-introduce Rewind skill-point exploit (skip restoring snap.skills)',
    find: 'if (snap.skills) this.skills = { ...snap.skills };',
    replace: 'if (false && snap.skills) this.skills = { ...snap.skills };',
  },
  {
    id: 'M10',
    file: 'src/world/generator.js',
    desc: 'Remove non-finite stage guard (breaks buildStageSpec(Infinity))',
    find: 'if (!Number.isFinite(n)) return fallback;',
    replace: 'if (false && !Number.isFinite(n)) return fallback;',
  },
  {
    id: 'M11',
    file: 'server.mjs',
    desc: 'Disable HTTP path-traversal & hidden-dotfile segment guard',
    find: "if (seg === '.' || seg === '..' || seg.startsWith('.')) return true;",
    replace: 'if (false) return true;',
  },
  {
    id: 'M12',
    file: 'src/quantum/temporal.js',
    desc: 'Drop weapons snapshot cloning on temporal rewind (breaks inventory rollback)',
    find: 'weapons: Array.isArray(worldState.weapons) ? worldState.weapons.map(cloneWeaponSnap) : null,',
    replace: 'weapons: null,',
  },
];

let activeRestore = null;
function restoreIfActive() {
  if (activeRestore) {
    const { fullPath, original } = activeRestore;
    activeRestore = null;
    try {
      fs.writeFileSync(fullPath, original, 'utf8');
    } catch { /* best-effort restore */ }
  }
}

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => {
    restoreIfActive();
    process.exit(130);
  });
}

let killed = 0;
let survived = 0;

console.log('========================================================================');
console.log(` PLANARIA v${VERSION} — SURGICAL MUTATION TESTING HARNESS (${MUTANTS.length} MUTANTS)`);
console.log('========================================================================');

for (const m of MUTANTS) {
  const fullPath = path.join(ROOT, m.file);
  const original = fs.readFileSync(fullPath, 'utf8');
  const parts = original.split(m.find);
  if (parts.length !== 2) {
    console.error(`  [ERROR] ${m.id}: Expected exactly 1 match in ${m.file}, found ${parts.length - 1}`);
    survived++;
    continue;
  }
  const mutated = original.replace(m.find, () => m.replace);
  const t0 = performance.now();
  activeRestore = { fullPath, original };
  try {
    fs.writeFileSync(fullPath, mutated, 'utf8');
    const res = spawnSync(process.execPath, [path.join(ROOT, 'test/verify.mjs')], {
      cwd: ROOT,
      encoding: 'utf8',
      timeout: 30000,
    });
    const dt = (performance.now() - t0).toFixed(0);
    if (res.error == null && res.status !== 0) {
      killed++;
      console.log(`  [KILLED]   ${m.id} (${m.file}): ${m.desc} (${dt} ms)`);
    } else if (res.error != null) {
      survived++;
      console.error(`  [ERROR]    ${m.id} (${m.file}): test runner error: ${res.error.message} (${dt} ms)`);
    } else {
      survived++;
      console.error(`  [SURVIVED] ${m.id} (${m.file}): ${m.desc} (${dt} ms)`);
    }
  } finally {
    restoreIfActive();
  }
}

const rate = ((killed / MUTANTS.length) * 100).toFixed(1);
console.log('------------------------------------------------------------------------');
console.log(` MUTATION SCORE: ${killed}/${MUTANTS.length} (${rate}%) KILLED | ${survived} SURVIVED`);
console.log('========================================================================');

if (survived > 0) process.exit(1);
