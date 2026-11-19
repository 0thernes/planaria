#!/usr/bin/env node
/**
 * PLANARIA CLI — Standalone Command-Line Tool for Compiling, Inspecting, Executing,
 * Bisecting, Shredding, Irradiating, Poisoning, Healing & Xenografting .hbin Binaries.
 *
 * Usage:
 *   node bin/planaria.mjs compile   <src.plang> -o <out.hbin>
 *   node bin/planaria.mjs inspect   <file.hbin> [--pinned <rootHex>] [--xenograft]
 *   node bin/planaria.mjs run       <file.hbin> [--frames 60] [--xenograft] [--ppm <out.ppm>]
 *   node bin/planaria.mjs bisect    <file.hbin> <left.hbin> <right.hbin> [--offset <bytes>]
 *   node bin/planaria.mjs heal      <in.hbin> [in2.hbin ...] -o <healed.hbin> [--xenograft]
 *   node bin/planaria.mjs damage    <in.hbin> -o <out.hbin> [--drop 0.5] [--bitrot 8] [--burst] [--trojans 20] [--shift 137] [--shuffle] [--amputate 3,4]
 *   node bin/planaria.mjs xenograft <host.hbin> <donor.hbin> -o <chimera.hbin> [--amputate 3,4]
 *   node bin/planaria.mjs disasm    <file.hbin> [--bundle 0] [--max 48]
 */

import fs from 'node:fs';
import path from 'node:path';
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

function getFlag(args, name, def = null) {
  const idx = args.indexOf(name);
  if (idx === -1 || idx + 1 >= args.length) return def;
  return args[idx + 1];
}

function hasFlag(args, name) {
  return args.includes(name);
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
  fs.writeFileSync(filePath, out);
}

function printHelp() {
  console.log(`PLANARIA CLI v1.0.0 — Progressive Holographic Executable Architecture (.hbin)

Commands:
  compile   <src.plang> -o <out.hbin>
  inspect   <file.hbin> [--pinned <rootHex>] [--xenograft] [--unsafe-no-immune]
  run       <file.hbin> [--frames 60] [--xenograft] [--ppm <snapshot.ppm>]
  bisect    <file.hbin> <left.hbin> <right.hbin> [--offset <bytes>]
  heal      <in1.hbin> [in2.hbin ...] -o <healed.hbin> [--xenograft]
  damage    <in.hbin> -o <out.hbin> [--drop 0.5] [--bitrot 8] [--burst] [--trojans 20] [--shift 137] [--shuffle] [--amputate 3,4]
  xenograft <host.hbin> <donor.hbin> -o <chimera.hbin> [--amputate 3,4]
  disasm    <file.hbin> [--bundle 0] [--max 48]
`);
}

const [, , cmd, ...args] = process.argv;

if (!cmd || cmd === '-h' || cmd === '--help') {
  printHelp();
  process.exit(0);
}

try {
  if (cmd === 'compile') {
    const srcPath = args[0];
    const outPath = getFlag(args, '-o') || srcPath.replace(/\.plang$/i, '.hbin');
    const src = fs.readFileSync(srcPath, 'utf8');
    const res = compilePlangToHbin(src);
    fs.mkdirSync(path.dirname(path.resolve(outPath)), { recursive: true });
    fs.writeFileSync(outPath, res.bytes);
    console.log(`[PLANARIA] Compiled ${res.name} -> ${outPath} (${res.bytes.length} bytes)`);
    console.log(`  Lineage Root : ${res.lineageRootHex}`);
    console.log(`  File SHA-256 : ${res.sha256Hex}`);
    for (const r of res.codegen.report) {
      console.log(`  Bundle ${r.bundleId} ${r.name.padEnd(18)} ${String(r.instructions).padStart(4)} insns  ${String(r.bytes).padStart(4)}/${r.capacityBytes}B (${r.utilizationPct}%)`);
    }
  } else if (cmd === 'inspect') {
    const filePath = args[0];
    const bytes = new Uint8Array(fs.readFileSync(filePath));
    const dec = decodeHbin(bytes, {
      pinnedRootHex: getFlag(args, '--pinned'),
      allowXenograft: hasFlag(args, '--xenograft'),
      disableImmuneSystem: hasFlag(args, '--unsafe-no-immune'),
    });
    console.log(`[PLANARIA] Cellular Autopsy: ${filePath} (${bytes.length} bytes)`);
    console.log(`  Bootable           : ${dec.bootable ? 'YES' : 'NO'} (Max Stratum: S${dec.maxViableStratum})`);
    console.log(`  100% Regenerable   : ${dec.canFullRegenerate ? 'YES' : 'NO'}`);
    console.log(`  Lineage Root       : ${dec.primaryRootHex || 'NONE'}`);
    console.log(`  Organism Name      : ${dec.genome?.name || '(Genome Ledger Missing / Degraded)'}`);
    console.log(`  Authentic Cells    : ${dec.stats.authenticCells} / ${dec.stats.harvestedCells} harvested`);
    console.log(`  RS(254,238) Fixed  : ${dec.stats.rsRepairedCells} cells (${dec.stats.rsTotalByteErrorsFixed} byte errors healed)`);
    console.log(`  Unaligned Shifts   : ${dec.stats.unalignedRecoveries} cells recovered off 512B boundary`);
    console.log(`  Byzantine Blocked  : ${dec.stats.byzantineQuarantined} forged/poisoned cells quarantined`);
    console.log(`  Xenografts Active  : ${dec.xenografts.length}`);
    console.log('');
    for (const b of dec.bundles) {
      const status = b.viable ? `ALIVE (${b.source})` : 'DEAD';
      console.log(`  [B${b.id}] ${b.name.padEnd(18)} S${b.stratum}  rank ${String(b.cellsFound).padStart(2)}/${String(b.k).padStart(2)} (of ${b.n})  ${status}`);
    }
  } else if (cmd === 'run') {
    const filePath = args[0];
    const frames = parseInt(getFlag(args, '--frames', '60'), 10);
    const ppmPath = getFlag(args, '--ppm');
    const bytes = new Uint8Array(fs.readFileSync(filePath));
    const dec = decodeHbin(bytes, { allowXenograft: hasFlag(args, '--xenograft') });
    if (!dec.bootable) {
      console.error(`[PLANARIA] Organism dead: Stratum 0 Stem Nucleus below threshold (k=2).`);
      process.exit(2);
    }
    const vm = new PVM32();
    vm.loadDecoded(dec, true);
    for (let f = 0; f < frames; f++) vm.stepFrame();
    const fb = vm.framebufferStats();
    console.log(`[PLANARIA] Executed ${frames} frames of ${dec.genome?.name || filePath} (Stratum S${dec.maxViableStratum})`);
    console.log(`  Instructions Executed : ${vm.totalInsns} (${Math.round(vm.totalInsns / frames)}/frame)`);
    console.log(`  VM Traps              : ${vm.traps}`);
    console.log(`  Framebuffer Hash      : 0x${fb.hashHex} (${fb.nonBgPixels} lit pixels)`);
    console.log(`  Primary Metric RAM[1] : ${vm.ram[1]}`);
    console.log(`  Live Vascular Routes  : ${vm.lastFrameRoutes.map((r) => `${r.organName}->S${r.resolvedStratum}(${r.source})`).join(', ')}`);
    if (ppmPath) {
      writePPM(ppmPath, vm.fbBytes);
      console.log(`  Saved PPM Framebuffer : ${ppmPath}`);
    }
  } else if (cmd === 'bisect') {
    const inPath = args[0];
    const leftPath = args[1];
    const rightPath = args[2];
    const bytes = new Uint8Array(fs.readFileSync(inPath));
    const offsetStr = getFlag(args, '--offset');
    const cutOff = offsetStr ? parseInt(offsetStr, 10) : Math.floor(bytes.length / 2);
    const { left, right, cutOffset } = bisectBinary(bytes, cutOff);
    fs.writeFileSync(leftPath, left);
    fs.writeFileSync(rightPath, right);
    console.log(`[PLANARIA] Bisected ${inPath} at byte ${cutOffset} (zero overlap):`);
    console.log(`  Left  -> ${leftPath} (${left.length}B)`);
    console.log(`  Right -> ${rightPath} (${right.length}B)`);
  } else if (cmd === 'heal') {
    const outPath = getFlag(args, '-o');
    if (!outPath) throw new Error('Missing -o <healed.hbin>');
    const oIdx = args.indexOf('-o');
    const inputs = args.filter((a, i) => !a.startsWith('--') && i !== oIdx && i !== oIdx + 1);
    const chunks = inputs.map((p) => new Uint8Array(fs.readFileSync(p)));
    const totalLen = chunks.reduce((s, c) => s + c.length, 0);
    const merged = new Uint8Array(totalLen);
    let pos = 0;
    for (const c of chunks) { merged.set(c, pos); pos += c.length; }
    const dec = decodeHbin(merged, { allowXenograft: hasFlag(args, '--xenograft') });
    const healed = regenerateHbin(dec);
    fs.writeFileSync(outPath, healed.bytes);
    console.log(`[PLANARIA] Regenerated pristine binary -> ${outPath} (${healed.bytes.length}B)`);
    console.log(`  Lineage Root : ${healed.lineageRootHex}`);
    console.log(`  File SHA-256 : ${healed.sha256Hex}`);
  } else if (cmd === 'damage') {
    const inPath = args[0];
    const outPath = getFlag(args, '-o');
    if (!outPath) throw new Error('Missing -o <out.hbin>');
    let buf = new Uint8Array(fs.readFileSync(inPath));
    const drop = parseFloat(getFlag(args, '--drop', '0'));
    const bitrot = parseInt(getFlag(args, '--bitrot', '0'), 10);
    const burst = hasFlag(args, '--burst');
    const trojans = parseInt(getFlag(args, '--trojans', '0'), 10);
    const shift = parseInt(getFlag(args, '--shift', '0'), 10);
    const shuffle = hasFlag(args, '--shuffle');
    const ampStr = getFlag(args, '--amputate');
    const seed = parseInt(getFlag(args, '--seed', '42'), 10);

    if (ampStr) {
      const ids = ampStr.split(',').map((s) => parseInt(s.trim(), 10));
      buf = amputateBundles(buf, ids, true, seed).bytes;
    }
    if (drop > 0) buf = shredCells(buf, drop, seed, false).bytes;
    if (bitrot > 0) buf = irradiateCells(buf, bitrot, seed + 1, burst).bytes;
    if (shift > 0 || shuffle) buf = shiftAndShuffle(buf, shift, seed + 2, shuffle);
    if (trojans > 0) buf = injectByzantineTrojans(buf, trojans, seed + 3, true).bytes;

    fs.writeFileSync(outPath, buf);
    console.log(`[PLANARIA] Damaged binary written -> ${outPath} (${buf.length}B, SHA-256=${toHex(sha256(buf)).slice(0, 16)})`);
  } else if (cmd === 'xenograft') {
    const hostPath = args[0];
    const donorPath = args[1];
    const outPath = getFlag(args, '-o');
    if (!outPath) throw new Error('Missing -o <chimera.hbin>');
    const ampStr = getFlag(args, '--amputate', '3,4');
    const ampIds = ampStr.split(',').map((s) => parseInt(s.trim(), 10));
    const hostBytes = new Uint8Array(fs.readFileSync(hostPath));
    const donorBytes = new Uint8Array(fs.readFileSync(donorPath));
    const hostRoot = decodeHbin(hostBytes).primaryRootHex;
    const amputated = amputateBundles(hostBytes, ampIds).bytes;
    const spliced = concatShards(amputated, donorBytes, 37);
    const chimeraDec = decodeHbin(spliced, { pinnedRootHex: hostRoot, allowXenograft: true });
    const chimeraBin = regenerateHbin(chimeraDec);
    fs.writeFileSync(outPath, chimeraBin.bytes);
    console.log(`[PLANARIA] Xenograft Chimera forged -> ${outPath} (${chimeraBin.bytes.length}B)`);
    console.log(`  Transplanted Organs: ${chimeraDec.xenografts.map((x) => `${x.bundleName}<-${x.donorRootHex.slice(0, 8)}`).join(', ')}`);
    console.log(`  New Lineage Root   : ${chimeraBin.lineageRootHex}`);
  } else if (cmd === 'disasm') {
    const filePath = args[0];
    const bundleId = parseInt(getFlag(args, '--bundle', '0'), 10);
    const maxW = parseInt(getFlag(args, '--max', '48'), 10);
    const dec = decodeHbin(new Uint8Array(fs.readFileSync(filePath)));
    const b = dec.bundles[bundleId];
    if (!b || !b.viable) {
      console.error(`Bundle ${bundleId} (${BUNDLE_SPECS[bundleId]?.name}) is not viable.`);
      process.exit(2);
    }
    console.log(`; Disassembly of ${filePath} :: Bundle ${bundleId} (${b.name}, ${b.data.length}B)`);
    for (const line of disassembleBytes(b.data, maxW)) {
      console.log(line);
    }
  } else {
    printHelp();
    process.exit(1);
  }
} catch (err) {
  console.error(`[PLANARIA ERROR] ${err.message}`);
  process.exit(1);
}
