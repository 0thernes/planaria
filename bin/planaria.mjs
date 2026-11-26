#!/usr/bin/env node
/**
 * PLANARIA CLI — Standalone Command-Line Tool for Compiling, Inspecting, Executing,
 * Bisecting, Fusing, Shredding, Irradiating, Poisoning, Healing & Xenografting .hbin Binaries.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compilePlangToHbin } from '../src/compiler/compile.js';
import { decodeHbin, regenerateHbin, BUNDLE_SPECS } from '../src/core/hbin.js';
import {
  bisectBinary,
  shredCells,
  irradiateCells,
  injectByzantineTrojans,
  shiftAndShuffle,
  amputateBundles,
  concatShards,
} from '../src/core/torture.js';
import { disassembleBytes, FB_WIDTH, FB_HEIGHT } from '../src/compiler/isa.js';
import { PVM32 } from '../src/vm/pvm32.js';
import { sha256, toHex } from '../src/core/sha256.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_VERSION = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '..', 'package.json'), 'utf8')
).version;

function ensureParentDir(filePath) {
  fs.mkdirSync(path.dirname(path.resolve(filePath)), { recursive: true });
}

function isSameFilePath(a, b) {
  const resA = path.resolve(a);
  const resB = path.resolve(b);
  const caseInsensitive = process.platform === 'win32' || process.platform === 'darwin';
  if (caseInsensitive ? resA.toLowerCase() === resB.toLowerCase() : resA === resB) return true;
  try {
    const realA = fs.realpathSync(resA);
    const realB = fs.realpathSync(resB);
    return caseInsensitive ? realA.toLowerCase() === realB.toLowerCase() : realA === realB;
  } catch {
    return false;
  }
}

function parseIntStrict(raw, label, min, max) {
  if (!/^-?\d+$/.test(String(raw))) {
    throw new Error(`Invalid integer for ${label}: "${raw}"`);
  }
  const n = Number(raw);
  if (!Number.isSafeInteger(n) || n < min || n > max) {
    throw new Error(`${label} out of range [${min}, ${max}]: ${raw}`);
  }
  return n;
}

function parseFloatStrict(raw, label, min, max) {
  if (!/^-?(?:\d+\.?\d*|\.\d+)$/.test(String(raw))) {
    throw new Error(`Invalid number for ${label}: "${raw}"`);
  }
  const n = Number(raw);
  if (!Number.isFinite(n) || n < min || n > max) {
    throw new Error(`${label} out of range [${min}, ${max}]: ${raw}`);
  }
  return n;
}

function parseBundleList(raw, label, minId = 0, maxId = 6) {
  const parts = String(raw).split(',').map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) throw new Error(`${label} requires at least one bundle id (${minId}..${maxId})`);
  const out = [];
  for (const p of parts) {
    const id = parseIntStrict(p, label, minId, maxId);
    if (!out.includes(id)) out.push(id);
  }
  return out;
}

/**
 * Schema-driven strict argument parser:
 * - Rejects unknown flags
 * - Rejects missing values or flag-as-value swallowing
 * - Supports both `--key value` and `--key=value`
 */
function parseCommandArgs(rawArgs, { valueFlags = [], boolFlags = [], minPositional = 0, maxPositional = Infinity }) {
  const valueSet = new Set(valueFlags);
  const boolSet = new Set(boolFlags);
  const flags = Object.create(null);
  const positional = [];
  let endOfOpts = false;

  for (let i = 0; i < rawArgs.length; i++) {
    const tok = rawArgs[i];
    if (!endOfOpts && tok === '--') {
      endOfOpts = true;
      continue;
    }
    if (!endOfOpts && tok.startsWith('-') && tok !== '-') {
      let key = tok;
      let inlineVal = null;
      const eq = tok.indexOf('=');
      if (eq !== -1) {
        key = tok.slice(0, eq);
        inlineVal = tok.slice(eq + 1);
      }
      if (boolSet.has(key)) {
        if (inlineVal !== null) throw new Error(`Flag ${key} does not accept a value`);
        flags[key] = true;
        continue;
      }
      if (valueSet.has(key)) {
        if (Object.prototype.hasOwnProperty.call(flags, key)) {
          throw new Error(`Duplicate option: ${key}`);
        }
        if (inlineVal !== null) {
          if (inlineVal === '') throw new Error(`Missing value for option ${key}`);
          flags[key] = inlineVal;
        } else {
          if (i + 1 >= rawArgs.length) throw new Error(`Missing value for option ${key}`);
          const next = rawArgs[i + 1];
          if (next.startsWith('-') && next !== '-' && !/^-\d/.test(next)) {
            throw new Error(`Missing value for option ${key} (got option "${next}")`);
          }
          flags[key] = next;
          i++;
        }
        continue;
      }
      throw new Error(`Unknown option: ${key}`);
    }
    positional.push(tok);
  }

  if (positional.length < minPositional) {
    throw new Error(`Expected at least ${minPositional} positional argument(s), got ${positional.length}`);
  }
  if (positional.length > maxPositional) {
    throw new Error(`Expected at most ${maxPositional} positional argument(s), got ${positional.length}`);
  }
  return { flags, positional };
}

function writePPM(filePath, fbBytes) {
  const header = `P6\n${FB_WIDTH} ${FB_HEIGHT}\n255\n`;
  const hBytes = new TextEncoder().encode(header);
  const rgb = new Uint8Array(FB_WIDTH * FB_HEIGHT * 3);
  for (let i = 0, j = 0; i < fbBytes.length; i += 4, j += 3) {
    rgb[j] = fbBytes[i];
    rgb[j + 1] = fbBytes[i + 1];
    rgb[j + 2] = fbBytes[i + 2];
  }
  const out = new Uint8Array(hBytes.length + rgb.length);
  out.set(hBytes, 0);
  out.set(rgb, hBytes.length);
  ensureParentDir(filePath);
  fs.writeFileSync(filePath, out);
}

function printHelp() {
  console.log(`PLANARIA CLI v${PKG_VERSION} — Progressive Holographic Executable Architecture (.hbin)

Commands:
  compile   <src.plang> [-o <out.hbin>]
  inspect   <file.hbin> [--pinned <rootHex>] [--xenograft] [--allow-unpinned-xenograft] [--unsafe-no-immune]
  run       <file.hbin> [--frames 60] [--pinned <rootHex>] [--xenograft] [--allow-unpinned-xenograft] [--ppm <snapshot.ppm>]
  bisect    <file.hbin> <left.hbin> <right.hbin> [--offset <bytes>]
  fuse      <shard1.hbin> <shard2.hbin> [shard3...] -o <fused.hbin> [--gap 0] [--seed 42]
  heal      <in1.hbin> [in2.hbin ...] -o <healed.hbin> [--pinned <rootHex>] [--xenograft] [--allow-unpinned-xenograft]
  damage    <in.hbin> -o <out.hbin> [--drop 0.5] [--bitrot 8] [--burst] [--trojans 20] [--shift 137] [--shuffle] [--amputate 3,4] [--seed 42]
  xenograft <host.hbin> <donor.hbin> -o <chimera.hbin> [--amputate 3,4] [--gap 37] [--seed 42]
  disasm    <file.hbin> [--bundle 0] [--max 48] [--pinned <rootHex>] [--xenograft] [--allow-unpinned-xenograft]

Flags:
  -h, --help      Show this help message
  -v, --version   Show PLANARIA CLI version
`);
}

const [, , cmd, ...args] = process.argv;

if (!cmd || cmd === '-h' || cmd === '--help' || args.includes('-h') || args.includes('--help')) {
  printHelp();
  process.exit(0);
}
if (cmd === '-v' || cmd === '--version') {
  console.log(`planaria v${PKG_VERSION}`);
  process.exit(0);
}

try {
  if (cmd === 'compile') {
    const { flags, positional } = parseCommandArgs(args, {
      valueFlags: ['-o'],
      minPositional: 1,
      maxPositional: 1,
    });
    const srcPath = positional[0];
    const defaultOut = /\.plang$/i.test(srcPath) ? srcPath.replace(/\.plang$/i, '.hbin') : `${srcPath}.hbin`;
    const outPath = flags['-o'] || defaultOut;
    if (isSameFilePath(outPath, srcPath)) {
      throw new Error('Output path must differ from input source path');
    }
    const src = fs.readFileSync(srcPath, 'utf8');
    const res = compilePlangToHbin(src);
    ensureParentDir(outPath);
    fs.writeFileSync(outPath, res.bytes);
    console.log(`[PLANARIA] Compiled ${res.name} -> ${outPath} (${res.bytes.length} bytes)`);
    console.log(`  Lineage Root : ${res.lineageRootHex}`);
    console.log(`  File SHA-256 : ${res.sha256Hex}`);
    for (const r of res.codegen.report) {
      console.log(`  Bundle ${r.bundleId} ${r.name.padEnd(18)} ${String(r.instructions).padStart(4)} insns  ${String(r.bytes).padStart(4)}/${r.capacityBytes}B (${r.utilizationPct}%)`);
    }
  } else if (cmd === 'inspect') {
    const { flags, positional } = parseCommandArgs(args, {
      valueFlags: ['--pinned'],
      boolFlags: ['--xenograft', '--allow-unpinned-xenograft', '--unsafe-no-immune'],
      minPositional: 1,
      maxPositional: 1,
    });
    const filePath = positional[0];
    const bytes = new Uint8Array(fs.readFileSync(filePath));
    const dec = decodeHbin(bytes, {
      pinnedRootHex: flags['--pinned'] || null,
      allowXenograft: Boolean(flags['--xenograft']),
      allowUnpinnedXenograft: Boolean(flags['--allow-unpinned-xenograft']),
      disableImmuneSystem: Boolean(flags['--unsafe-no-immune']),
    });
    console.log(`[PLANARIA] Cellular Autopsy: ${filePath} (${bytes.length} bytes)`);
    console.log(`  Bootable           : ${dec.bootable ? 'YES' : 'NO'} (Max Stratum: S${dec.maxViableStratum})`);
    console.log(`  100% Regenerable   : ${dec.canFullRegenerate ? 'YES' : 'NO'}`);
    console.log(`  Lineage Root       : ${dec.primaryRootHex || 'NONE'}`);
    console.log(`  Organism Name      : ${dec.genome?.name || '(Genome Ledger Missing / Degraded)'}`);
    console.log(`  Authentic Cells    : ${dec.stats.authenticCells} / ${dec.stats.harvestedCells} harvested`);
    console.log(`  RS(254,238) Fixed  : ${dec.stats.rsRepairedCells} cells (${dec.stats.rsTotalByteErrorsFixed} byte errors healed)`);
    console.log(`  Unaligned Shifts   : ${dec.stats.unalignedRecoveries} cells recovered off 512B boundary`);
    console.log(`  Flywheel Recovered : ${dec.stats.flywheelRecoveries} sync-damaged cells recovered by +/-512B cadence`);
    console.log(`  Byzantine Blocked  : ${dec.stats.byzantineQuarantined} forged/poisoned cells quarantined`);
    console.log(`  Xenografts Active  : ${dec.xenografts.length}${dec.stats.xenograftBlockedUnpinned ? ' (blocked: pass --pinned <rootHex> or --allow-unpinned-xenograft)' : ''}`);
    if (dec.stats.quorumAmbiguous) console.log('  WARNING            : Unpinned consensus quorum tie detected (failed closed)');
    if (dec.stats.truncatedByBudget) console.log('  WARNING            : Input scan truncated by DoS safety budget');
    console.log('');
    for (const b of dec.bundles) {
      const status = b.viable ? `ALIVE (${b.source})` : 'DEAD';
      console.log(`  [B${b.id}] ${b.name.padEnd(18)} S${b.stratum}  rank ${String(b.cellsFound).padStart(2)}/${String(b.k).padStart(2)} (of ${b.n})  ${status}`);
    }
  } else if (cmd === 'run') {
    const { flags, positional } = parseCommandArgs(args, {
      valueFlags: ['--frames', '--ppm', '--pinned'],
      boolFlags: ['--xenograft', '--allow-unpinned-xenograft'],
      minPositional: 1,
      maxPositional: 1,
    });
    const filePath = positional[0];
    const frames = flags['--frames'] !== undefined ? parseIntStrict(flags['--frames'], '--frames', 1, 100000) : 60;
    const ppmPath = flags['--ppm'] || null;
    const bytes = new Uint8Array(fs.readFileSync(filePath));
    const dec = decodeHbin(bytes, {
      pinnedRootHex: flags['--pinned'] || null,
      allowXenograft: Boolean(flags['--xenograft']),
      allowUnpinnedXenograft: Boolean(flags['--allow-unpinned-xenograft']),
    });
    if (!dec.bootable) {
      console.error('[PLANARIA] Organism dead: Stratum 0 Stem Nucleus below threshold (k=2).');
      process.exit(2);
    }
    const vm = new PVM32();
    vm.loadDecoded(dec, true);
    for (let f = 0; f < frames; f++) vm.stepFrame();
    const fb = vm.framebufferStats();
    console.log(`[PLANARIA] Executed ${frames} frames of ${dec.genome?.name || filePath} (Stratum S${dec.maxViableStratum})`);
    console.log(`  Instructions Executed : ${vm.totalInsns} (${Math.round(vm.totalInsns / frames)}/frame)`);
    console.log(`  VM Traps              : ${vm.traps}${vm.lastTrap ? ` (last: ${vm.lastTrap})` : ''}`);
    console.log(`  Framebuffer Hash      : 0x${fb.hashHex} (${fb.nonBgPixels} lit pixels)`);
    console.log(`  Primary Metric RAM[1] : ${vm.ram[1]}`);
    console.log(`  Live Vascular Routes  : ${vm.lastFrameRoutes.map((r) => `${r.organName}->S${r.resolvedStratum}(${r.source})`).join(', ')}`);
    if (ppmPath) {
      writePPM(ppmPath, vm.fbBytes);
      console.log(`  Saved PPM Framebuffer : ${ppmPath}`);
    }
    if (vm.traps > 0) process.exit(3);
  } else if (cmd === 'bisect') {
    const { flags, positional } = parseCommandArgs(args, {
      valueFlags: ['--offset'],
      minPositional: 3,
      maxPositional: 3,
    });
    const [inPath, leftPath, rightPath] = positional;
    if (isSameFilePath(leftPath, rightPath)) {
      throw new Error('Bisect left and right output paths must be distinct');
    }
    if (isSameFilePath(inPath, leftPath) || isSameFilePath(inPath, rightPath)) {
      throw new Error('Bisect output paths must differ from input path');
    }
    const bytes = new Uint8Array(fs.readFileSync(inPath));
    if (bytes.length < 2) throw new Error(`Cannot bisect file of length ${bytes.length}`);
    const cutOff = flags['--offset'] !== undefined
      ? parseIntStrict(flags['--offset'], '--offset', 1, bytes.length - 1)
      : Math.floor(bytes.length / 2);
    const { left, right, cutOffset } = bisectBinary(bytes, cutOff);
    ensureParentDir(leftPath);
    ensureParentDir(rightPath);
    fs.writeFileSync(leftPath, left);
    fs.writeFileSync(rightPath, right);
    console.log(`[PLANARIA] Bisected ${inPath} at byte ${cutOffset} (zero overlap):`);
    console.log(`  Left  -> ${leftPath} (${left.length}B)`);
    console.log(`  Right -> ${rightPath} (${right.length}B)`);
  } else if (cmd === 'fuse') {
    const { flags, positional } = parseCommandArgs(args, {
      valueFlags: ['-o', '--gap', '--seed'],
      minPositional: 2,
    });
    const outPath = flags['-o'];
    if (!outPath) throw new Error('Missing -o <fused.hbin>');
    const gap = flags['--gap'] !== undefined ? parseIntStrict(flags['--gap'], '--gap', 0, 65536) : 0;
    const seed = flags['--seed'] !== undefined ? parseIntStrict(flags['--seed'], '--seed', 0, 0x7fffffff) : 42;
    let fused = new Uint8Array(fs.readFileSync(positional[0]));
    for (let i = 1; i < positional.length; i++) {
      const next = new Uint8Array(fs.readFileSync(positional[i]));
      fused = concatShards(fused, next, gap, seed + i);
    }
    ensureParentDir(outPath);
    fs.writeFileSync(outPath, fused);
    console.log(`[PLANARIA] Fused ${positional.length} shards -> ${outPath} (${fused.length}B, gap=${gap}B)`);
  } else if (cmd === 'heal') {
    const { flags, positional } = parseCommandArgs(args, {
      valueFlags: ['-o', '--pinned'],
      boolFlags: ['--xenograft', '--allow-unpinned-xenograft'],
      minPositional: 1,
    });
    const outPath = flags['-o'];
    if (!outPath) throw new Error('Missing -o <healed.hbin>');
    const chunks = positional.map((p) => new Uint8Array(fs.readFileSync(p)));
    const totalLen = chunks.reduce((s, c) => s + c.length, 0);
    if (totalLen > 8 * 1024 * 1024) {
      console.error(`[PLANARIA WARN] Combined input (${totalLen}B) exceeds default 8 MiB scan budget; trailing bytes may be skipped.`);
    }
    const merged = new Uint8Array(totalLen);
    let pos = 0;
    for (const c of chunks) { merged.set(c, pos); pos += c.length; }
    const dec = decodeHbin(merged, {
      pinnedRootHex: flags['--pinned'] || null,
      allowXenograft: Boolean(flags['--xenograft']),
      allowUnpinnedXenograft: Boolean(flags['--allow-unpinned-xenograft']),
    });
    const healed = regenerateHbin(dec);
    ensureParentDir(outPath);
    fs.writeFileSync(outPath, healed.bytes);
    console.log(`[PLANARIA] Regenerated pristine binary -> ${outPath} (${healed.bytes.length}B)`);
    console.log(`  Lineage Root : ${healed.lineageRootHex}`);
    console.log(`  File SHA-256 : ${healed.sha256Hex}`);
  } else if (cmd === 'damage') {
    const { flags, positional } = parseCommandArgs(args, {
      valueFlags: ['-o', '--drop', '--bitrot', '--trojans', '--shift', '--amputate', '--seed'],
      boolFlags: ['--burst', '--shuffle'],
      minPositional: 1,
      maxPositional: 1,
    });
    const inPath = positional[0];
    const outPath = flags['-o'];
    if (!outPath) throw new Error('Missing -o <out.hbin>');
    let buf = new Uint8Array(fs.readFileSync(inPath));
    const drop = flags['--drop'] !== undefined ? parseFloatStrict(flags['--drop'], '--drop', 0, 1) : 0;
    const bitrot = flags['--bitrot'] !== undefined ? parseIntStrict(flags['--bitrot'], '--bitrot', 0, 508) : 0;
    const burst = Boolean(flags['--burst']);
    const trojans = flags['--trojans'] !== undefined ? parseIntStrict(flags['--trojans'], '--trojans', 0, 5000) : 0;
    const shift = flags['--shift'] !== undefined ? parseIntStrict(flags['--shift'], '--shift', 0, 65536) : 0;
    const shuffle = Boolean(flags['--shuffle']);
    const ampIds = flags['--amputate'] !== undefined ? parseBundleList(flags['--amputate'], '--amputate', 0, 6) : null;
    const seed = flags['--seed'] !== undefined ? parseIntStrict(flags['--seed'], '--seed', 0, 0x7fffffff) : 42;

    if (ampIds) buf = amputateBundles(buf, ampIds, true, seed).bytes;
    if (drop > 0) buf = shredCells(buf, drop, seed, false).bytes;
    if (bitrot > 0) buf = irradiateCells(buf, bitrot, seed + 1, burst).bytes;
    if (shift > 0 || shuffle) buf = shiftAndShuffle(buf, shift, seed + 2, shuffle);
    if (trojans > 0) buf = injectByzantineTrojans(buf, trojans, seed + 3, true).bytes;

    ensureParentDir(outPath);
    fs.writeFileSync(outPath, buf);
    console.log(`[PLANARIA] Damaged binary written -> ${outPath} (${buf.length}B, SHA-256=${toHex(sha256(buf)).slice(0, 16)})`);
  } else if (cmd === 'xenograft') {
    const { flags, positional } = parseCommandArgs(args, {
      valueFlags: ['-o', '--amputate', '--gap', '--seed'],
      minPositional: 2,
      maxPositional: 2,
    });
    const [hostPath, donorPath] = positional;
    const outPath = flags['-o'];
    if (!outPath) throw new Error('Missing -o <chimera.hbin>');
    // Sovereign bundles 0 (S0_STEM_NUCLEUS) and 6 (S3_GENOME_LEDGER) cannot be xenografted
    const ampIds = parseBundleList(flags['--amputate'] || '3,4', '--amputate', 1, 5);
    const gap = flags['--gap'] !== undefined ? parseIntStrict(flags['--gap'], '--gap', 0, 65536) : 37;
    const seed = flags['--seed'] !== undefined ? parseIntStrict(flags['--seed'], '--seed', 0, 0x7fffffff) : 42;
    const hostBytes = new Uint8Array(fs.readFileSync(hostPath));
    const donorBytes = new Uint8Array(fs.readFileSync(donorPath));
    const hostDec = decodeHbin(hostBytes);
    const donorDec = decodeHbin(donorBytes);
    if (!hostDec.bootable || !hostDec.primaryRootHex) {
      throw new Error(`Host binary ${hostPath} is not bootable or has no valid Merkle lineage root`);
    }
    if (!donorDec.bootable || !donorDec.primaryRootHex) {
      throw new Error(`Donor binary ${donorPath} is not bootable or has no valid Merkle lineage root`);
    }
    if (hostDec.primaryRootHex === donorDec.primaryRootHex) {
      throw new Error('Host and donor share the identical lineage root; supply two distinct species binaries');
    }
    const amputated = amputateBundles(hostBytes, ampIds, true, seed).bytes;
    const spliced = concatShards(amputated, donorBytes, gap, seed + 1);
    const chimeraDec = decodeHbin(spliced, { pinnedRootHex: hostDec.primaryRootHex, allowXenograft: true });
    if (chimeraDec.xenografts.length === 0) {
      throw new Error(`No compatible xenograft organs transplanted for bundles [${ampIds.join(',')}]`);
    }
    const chimeraBin = regenerateHbin(chimeraDec);
    ensureParentDir(outPath);
    fs.writeFileSync(outPath, chimeraBin.bytes);
    console.log(`[PLANARIA] Xenograft Chimera forged -> ${outPath} (${chimeraBin.bytes.length}B)`);
    console.log(`  Transplanted Organs: ${chimeraDec.xenografts.map((x) => `${x.bundleName}<-${x.donorRootHex.slice(0, 8)}`).join(', ')}`);
    console.log(`  New Lineage Root   : ${chimeraBin.lineageRootHex}`);
  } else if (cmd === 'disasm') {
    const { flags, positional } = parseCommandArgs(args, {
      valueFlags: ['--bundle', '--max', '--pinned'],
      boolFlags: ['--xenograft', '--allow-unpinned-xenograft'],
      minPositional: 1,
      maxPositional: 1,
    });
    const filePath = positional[0];
    const bundleId = flags['--bundle'] !== undefined ? parseIntStrict(flags['--bundle'], '--bundle', 0, 6) : 0;
    const maxW = flags['--max'] !== undefined ? parseIntStrict(flags['--max'], '--max', 1, 4096) : 48;
    const dec = decodeHbin(new Uint8Array(fs.readFileSync(filePath)), {
      pinnedRootHex: flags['--pinned'] || null,
      allowXenograft: Boolean(flags['--xenograft']),
      allowUnpinnedXenograft: Boolean(flags['--allow-unpinned-xenograft']),
    });
    const b = dec.bundles[bundleId];
    if (!b || !b.viable) {
      console.error(`Bundle ${bundleId} (${BUNDLE_SPECS[bundleId]?.name}) is not viable.`);
      process.exit(2);
    }
    if (bundleId === 6) {
      console.log(`; Genome Ledger JSON of ${filePath} :: Bundle 6 (${b.name}, ${b.data.length}B)`);
      console.log(dec.genome ? JSON.stringify(dec.genome, null, 2) : new TextDecoder().decode(b.data).replace(/\0+$/, ''));
    } else {
      console.log(`; Disassembly of ${filePath} :: Bundle ${bundleId} (${b.name}, ${b.data.length}B)`);
      for (const line of disassembleBytes(b.data, maxW)) {
        console.log(line);
      }
    }
  } else {
    console.error(`[PLANARIA ERROR] Unknown command: "${cmd}"`);
    printHelp();
    process.exit(1);
  }
} catch (err) {
  console.error(`[PLANARIA ERROR] ${err.message}`);
  process.exit(1);
}
