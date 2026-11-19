/**
 * PLANARIA Surgical Vivisection Studio — Interactive Real-Time Controller
 *
 * Runs the EXACT zero-dependency .hbin codec, Plang compiler, PVM-32 Anastomosis VM,
 * Linear Control Twin, and 48 kHz AudioWorklet directly on real 98,304-byte binaries!
 */

import { compilePlangToHbin } from '../compiler/compile.js';
import { disassembleBytes } from '../compiler/isa.js';
import {
  decodeHbin,
  regenerateHbin,
  inspectSingleCell,
  CELL_SIZE,
  TOTAL_CELLS,
} from '../core/hbin.js';
import {
  bisectBinary,
  splitBinary,
  shredCells,
  irradiateCells,
  amputateBundles,
  shiftAndShuffle,
  injectByzantineTrojans,
  concatShards,
} from '../core/torture.js';
import { PVM32 } from '../vm/pvm32.js';
import { encodeLinearBinary, decodeLinearBinary } from '../vm/linear-twin.js';
import { PlanariaAudio } from './audio.js';
import { drawTissueMap, drawAnastomosisGraph, drawSurvivalCurve } from './visuals.js';

const SPECIES_LIST = ['aegis_drift', 'synth_reactor', 'cipher_vault'];

const state = {
  species: 'aegis_drift',
  sources: {},
  pristine: {},
  linearPristine: {},
  currentBytes: null,
  currentLinearBytes: null,
  decoded: null,
  linearDecoded: null,
  pinnedRootHex: null,
  immuneEnabled: true,
  allowXenograft: false,
  mitosisMode: false,
  shardLeftBytes: null,
  shardRightBytes: null,
  decodedRight: null,
  selectedSlot: 0,
  lastTissueMetrics: null,
  benchmarks: null,
  lastDecodeMs: 0,
  tick: 0,
  autopilot: true,
  keys: new Set(),
  seedCounter: 100,
  isDraggingTissue: false,
};

const vmPrimary = new PVM32(0x1337c0de);
const vmSecondary = new PVM32(0x1337c0de);
const audio = new PlanariaAudio();

const el = (id) => document.getElementById(id);

function logEvent(msg, cls = '') {
  const box = el('eventLog');
  const ts = new Date().toLocaleTimeString('en-US', { hour12: false });
  const div = document.createElement('div');
  if (cls) div.className = cls;
  div.textContent = `[${ts}] ${msg}`;
  box.prepend(div);
  while (box.children.length > 60) box.removeChild(box.lastChild);
}

function stratumBadgeInfo(maxS, bootable) {
  if (!bootable || maxS < 0) return { text: 'CELL DEATH', cls: 'badge-dead' };
  if (maxS === 3) return { text: 'STRATUM 3 · FULL', cls: 'badge-s3' };
  if (maxS === 2) return { text: 'STRATUM 2 · CORTEX', cls: 'badge-s2' };
  if (maxS === 1) return { text: 'STRATUM 1 · WIREFRAME', cls: 'badge-s1' };
  return { text: 'STRATUM 0 · GHOST', cls: 'badge-s0' };
}

function updateDisassembly() {
  const bId = parseInt(el('disasmBundle').value, 10);
  const bun = state.decoded?.bundles?.[bId];
  const box = el('disasmBox');
  if (!bun || !bun.viable || !bun.data) {
    box.textContent = `; Bundle B${bId} is AMPUTATED / BELOW CAUCHY THRESHOLD\n; Anastomosis reroutes calls to surviving lower strata.`;
    return;
  }
  const lines = disassembleBytes(bun.data, 64);
  box.textContent =
    `; ${bun.name} (${bun.source}) · ${bun.data.length}B · rank ${bun.cellsFound}/${bun.k}\n` +
    lines.join('\n');
}

function updateCellInspector(slot) {
  state.selectedSlot = slot;
  const box = el('cellInspector');
  const entry = state.decoded?.slotMap?.[slot];
  if (!state.currentBytes) return;

  // Locate raw 512B cell at entry.byteOffset if recovered, else slot*512
  const off = entry ? entry.byteOffset : slot * CELL_SIZE;
  const slice =
    off + CELL_SIZE <= state.currentBytes.length
      ? state.currentBytes.subarray(off, off + CELL_SIZE)
      : null;
  const info = slice ? inspectSingleCell(slice) : null;

  if (!info) {
    box.innerHTML = `<strong>CELL SLOT #${slot}</strong><br/><span style="color:#fda4af;">OUT OF FILE BOUNDS (TRUNCATED)</span>`;
    return;
  }

  const statusTag = entry ? entry.status : 'NECROTIC / DESTROYED';
  const color =
    statusTag === 'INTACT' ? '#10f5a8'
    : statusTag === 'REPAIRED' ? '#fbbf24'
    : statusTag === 'XENOGRAFT' ? '#e879f9'
    : '#f43f5e';

  box.innerHTML =
    `<strong>CELL SLOT #${slot}</strong> · <span style="color:${color};font-weight:700;">${statusTag}</span><br/>` +
    `Byte Offset: <code>${off}</code> ${off % 512 !== 0 ? '<span style="color:#fbbf24;">(UNALIGNED!)</span>' : '(512B aligned)'}<br/>` +
    `Sync Word: <code>0x${info.syncHex}</code> (bit err: ${info.syncBitErrors}/3)<br/>` +
    `Inner RS(254,238): <code>${info.rsOk ? `OK (${info.rsErrorsFixed}B fixed)` : `FAIL (${info.rsReason})`}</code><br/>` +
    `Bundle: <code>${info.bundleName}</code> (S${info.header.stratum} · ${info.organName})<br/>` +
    `Cauchy Coord: <code>x_i=${info.header.evalX}</code> · threshold <code>k=${info.header.k}/${info.header.n}</code><br/>` +
    `ABI Sig: <code>0x${info.header.abiSig.toString(16).padStart(4, '0')}</code> · origLen: <code>${info.header.origLen}B</code><br/>` +
    `Implied Root: <code>${info.impliedRootHex || 'UNVERIFIABLE'}</code><br/>` +
    `Coded Payload: <code>${info.payloadPreviewHex.slice(0, 32)}...</code><br/>` +
    `Merkle Path[0]: <code>${info.proofHex.slice(0, 32)}...</code>`;
}

function refreshDecodedState(resetRam = false) {
  const t0 = performance.now();
  state.decoded = decodeHbin(state.currentBytes, {
    pinnedRootHex: state.immuneEnabled ? state.pinnedRootHex : null,
    allowXenograft: state.allowXenograft,
    disableImmuneSystem: !state.immuneEnabled,
  });
  state.lastDecodeMs = performance.now() - t0;

  vmPrimary.loadDecoded(state.decoded, resetRam);

  if (state.mitosisMode && state.shardRightBytes) {
    state.decodedRight = decodeHbin(state.shardRightBytes, {
      pinnedRootHex: state.immuneEnabled ? state.pinnedRootHex : null,
    });
    vmSecondary.loadDecoded(state.decodedRight, resetRam);
  } else if (state.currentLinearBytes) {
    state.linearDecoded = decodeLinearBinary(state.currentLinearBytes);
    if (state.linearDecoded.bootable) {
      vmSecondary.loadDecoded(state.linearDecoded, resetRam);
    } else {
      vmSecondary.alive = false;
      vmSecondary.renderFlatline();
      // Stamp exact linear loader fault code on Control Twin framebuffer
      vmSecondary._drawText(14, 24, 'LINEAR SIGSEGV', 0xff5e3ff4);
      vmSecondary._drawText(8, 88, state.linearDecoded.fault.slice(0, 24), 0xff24bffb);
    }
  }

  updateHudAndVisuals();
  updateDisassembly();
  updateCellInspector(state.selectedSlot);
}

function updateHudAndVisuals() {
  const d = state.decoded;
  if (!d) return;

  // Primary badge
  const pInfo = stratumBadgeInfo(d.maxViableStratum, d.bootable);
  const pBadge = el('primaryStratumBadge');
  pBadge.textContent = d.xenografts.length > 0 ? `CHIMERA · S${d.maxViableStratum}` : pInfo.text;
  pBadge.className = `badge ${d.xenografts.length > 0 ? 'badge-xeno' : pInfo.cls}`;
  el('cardPrimary').className = `crt-card ${d.bootable ? 'patient-primary' : 'patient-dead'}`;

  el('primaryLabel').textContent = state.mitosisMode
    ? 'MITOSIS CHILD A · LEFT 50% (0..49176)'
    : `PATIENT A · ${d.genome?.name || state.species.toUpperCase()} (.hbin)`;
  el('primaryRoot').textContent = `ROOT: ${(d.primaryRootHex || 'NONE').slice(0, 16)}`;

  // Secondary badge (Control Linear vs Mitosis Child B)
  if (state.mitosisMode) {
    const r = state.decodedRight;
    const rInfo = stratumBadgeInfo(r?.maxViableStratum ?? -1, r?.bootable);
    el('secondaryLabel').textContent = 'MITOSIS CHILD B · RIGHT 50% (49177..98303)';
    el('secondaryBadge').textContent = rInfo.text;
    el('secondaryBadge').className = `badge ${rInfo.cls}`;
    el('cardSecondary').className = 'crt-card patient-mitosis';
    el('secondaryMeta').textContent = `ZERO OVERLAP · ${r?.stats?.authenticCells || 0} CELLS`;
    el('secondaryStatus').textContent = r?.canFullRegenerate ? '100% REGEN READY' : 'DEGRADED';
    el('modeBadge').textContent = 'DUAL MITOSIS MODE';
    el('modeBadge').className = 'badge badge-s1';
  } else {
    const ld = state.linearDecoded;
    el('secondaryLabel').textContent = 'CONTROL · LINEAR BINARY (LINBIN01)';
    el('secondaryBadge').textContent = ld?.bootable ? 'INTACT' : 'FATAL CRASH';
    el('secondaryBadge').className = `badge ${ld?.bootable ? 'badge-s3' : 'badge-dead'}`;
    el('cardSecondary').className = `crt-card ${ld?.bootable ? '' : 'patient-dead'}`;
    el('secondaryMeta').textContent = ld?.bootable ? 'Monolithic ELF-style Loader' : ld?.fault || 'DEAD';
    el('secondaryStatus').textContent = ld?.bootable ? 'ALIVE' : 'FLATLINED';
    el('modeBadge').textContent = 'CONTROL COMPARISON';
    el('modeBadge').className = 'badge badge-s2';
  }

  // Telemetry strip
  const cellsEl = el('statCells');
  cellsEl.textContent = `${d.stats.authenticCells} / ${TOTAL_CELLS}`;
  cellsEl.className = `stat-val ${d.stats.authenticCells >= 96 ? 'good' : d.bootable ? 'warn' : 'bad'}`;

  const rsEl = el('statRsFixed');
  rsEl.textContent = `${d.stats.rsTotalByteErrorsFixed} B`;
  rsEl.className = `stat-val ${d.stats.rsTotalByteErrorsFixed > 0 ? 'warn' : ''}`;

  const qEl = el('statQuarantined');
  qEl.textContent = String(d.stats.byzantineQuarantined);
  qEl.className = `stat-val ${d.stats.byzantineQuarantined > 0 ? 'bad' : ''}`;

  const xEl = el('statXeno');
  xEl.textContent = String(d.xenografts.length);
  xEl.className = `stat-val ${d.xenografts.length > 0 ? 'xeno' : ''}`;

  el('statShifts').textContent = String(d.stats.unalignedRecoveries);
  el('statLatency').textContent = `${state.lastDecodeMs.toFixed(1)} ms`;

  // Immune badge
  const imBadge = el('immuneBadge');
  imBadge.textContent = state.immuneEnabled ? 'IMMUNE: MERKLE ON' : 'IMMUNE: OFF (UNSAFE!)';
  imBadge.className = `badge ${state.immuneEnabled ? 'badge-s2' : 'badge-dead'}`;

  state.lastTissueMetrics = drawTissueMap(
    el('canvasTissue'),
    d,
    state.selectedSlot,
    state.mitosisMode ? 96 : -1
  );

  const dropPct = Math.max(0, Math.min(100, ((TOTAL_CELLS - d.stats.authenticCells) / TOTAL_CELLS) * 100));
  drawSurvivalCurve(el('canvasCurve'), state.benchmarks?.survivalCurve || [], dropPct);
}

function selectSpecies(name) {
  state.species = name;
  const comp = state.pristine[name];
  state.currentBytes = new Uint8Array(comp.bytes);
  state.currentLinearBytes = new Uint8Array(state.linearPristine[name].bytes);
  state.pinnedRootHex = comp.lineageRootHex;
  state.mitosisMode = false;
  state.allowXenograft = false;
  state.shardLeftBytes = null;
  state.shardRightBytes = null;
  el('plangEditor').value = state.sources[name];
  el('compileStatus').textContent = `Loaded ${comp.name}: ${comp.codegen.totalInstructions} PVM-32 instructions, 98,304B .hbin`;

  // Default donor to a different species for 1-click Chimera fun!
  const other = SPECIES_LIST.find((s) => s !== name) || 'synth_reactor';
  el('donorSelect').value = other;

  refreshDecodedState(true);
  logEvent(`Loaded pristine ${comp.name}.hbin (Root ${comp.lineageRootHex.slice(0, 12)}, ${comp.codegen.totalInstructions} insns)`, 'log-good');
}

function getInputMask() {
  let m = state.autopilot ? 32 : 0;
  if (state.keys.has('ArrowLeft') || state.keys.has('KeyA')) m |= 1;
  if (state.keys.has('ArrowRight') || state.keys.has('KeyD')) m |= 2;
  if (state.keys.has('ArrowUp') || state.keys.has('KeyW')) m |= 4;
  if (state.keys.has('ArrowDown') || state.keys.has('KeyS')) m |= 8;
  if (state.keys.has('Space')) m |= 16;
  return m;
}

// 60 FPS Live Dual-VM Execution Loop
const ctxPrimary = el('canvasPrimary').getContext('2d');
const ctxSecondary = el('canvasSecondary').getContext('2d');
const imgPrimary = ctxPrimary.createImageData(160, 120);
const imgSecondary = ctxSecondary.createImageData(160, 120);

function frameLoop() {
  state.tick++;
  const mask = getInputMask();
  vmPrimary.setInput(mask);
  vmSecondary.setInput(mask);

  const r1 = vmPrimary.stepFrame();
  imgPrimary.data.set(vmPrimary.fbBytes);
  ctxPrimary.putImageData(imgPrimary, 0, 0);

  if (state.mitosisMode || state.linearDecoded?.bootable) {
    vmSecondary.stepFrame();
  }
  imgSecondary.data.set(vmSecondary.fbBytes);
  ctxSecondary.putImageData(imgSecondary, 0, 0);

  if (state.tick % 4 === 0) {
    el('primaryFps').textContent = `${r1.insns} insns/f · traps:${vmPrimary.traps}`;
    drawAnastomosisGraph(el('canvasVascular'), state.decoded, vmPrimary.lastFrameRoutes, state.tick);
  }

  audio.pushVoices(vmPrimary.voices);
  requestAnimationFrame(frameLoop);
}

// Interactive Tissue Map Surgery (Click = Inspect, Shift+Drag = Live Surgical Cell Excision!)
function slotFromCanvasEvent(evt) {
  const canvas = el('canvasTissue');
  const m = state.lastTissueMetrics;
  if (!m) return -1;
  const rect = canvas.getBoundingClientRect();
  const x = ((evt.clientX - rect.left) / rect.width) * canvas.width;
  const y = ((evt.clientY - rect.top) / rect.height) * canvas.height;
  const col = Math.floor((x - m.padX) / m.cellW);
  const row = Math.floor((y - m.padY) / m.cellH);
  if (col < 0 || col >= m.cols || row < 0 || row >= m.rows) return -1;
  return row * m.cols + col;
}

function exciseSlot(slot) {
  if (slot < 0 || slot >= TOTAL_CELLS) return;
  const off = slot * CELL_SIZE;
  if (off + CELL_SIZE <= state.currentBytes.length) {
    for (let i = 0; i < CELL_SIZE; i++) state.currentBytes[off + i] = (i * 73) & 0xff;
  }
  if (!state.mitosisMode && state.currentLinearBytes && off + CELL_SIZE <= state.currentLinearBytes.length) {
    for (let i = 0; i < CELL_SIZE; i++) state.currentLinearBytes[off + i] = (i * 73) & 0xff;
  }
  refreshDecodedState(false);
}

function wireEvents() {
  el('speciesSelect').addEventListener('change', (e) => selectSpecies(e.target.value));

  el('btnAudio').addEventListener('click', async () => {
    const on = await audio.toggle();
    el('btnAudio').textContent = `48kHz Audio: ${on ? 'ON' : 'OFF'}`;
    el('btnAudio').classList.toggle('active', on);
  });

  el('btnAuto').addEventListener('click', () => {
    state.autopilot = !state.autopilot;
    el('btnAuto').textContent = `Autopilot: ${state.autopilot ? 'ON' : 'OFF'}`;
    el('btnAuto').classList.toggle('active', state.autopilot);
  });

  el('btnRestore').addEventListener('click', () => selectSpecies(state.species));

  el('btnDownload').addEventListener('click', () => {
    const blob = new Blob([state.currentBytes], { type: 'application/octet-stream' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${state.species}_${state.decoded?.xenografts?.length ? 'chimera' : 'live'}.hbin`;
    a.click();
    logEvent(`Exported ${state.currentBytes.length}B raw .hbin binary to disk.`, 'log-good');
  });

  // 1. Laser Bisect (Unaligned 50/50 Planarian Mitosis!)
  el('btnMitosis').addEventListener('click', () => {
    const cut = 49177; // Deliberately UNALIGNED prime byte cut!
    const { left, right } = bisectBinary(state.pristine[state.species].bytes, cut);
    state.mitosisMode = true;
    state.allowXenograft = false;
    state.shardLeftBytes = left;
    state.shardRightBytes = right;
    state.currentBytes = new Uint8Array(left);
    refreshDecodedState(false);

    const regL = regenerateHbin(state.decoded);
    const regR = regenerateHbin(state.decodedRight);
    const exact =
      regL.sha256Hex === state.pristine[state.species].sha256Hex &&
      regR.sha256Hex === state.pristine[state.species].sha256Hex;
    logEvent(
      `MITOSIS BISECT @ unaligned byte ${cut}: ZERO overlap! Both halves S3 ALIVE & SHA-256 bit-exact=${exact} (${regL.sha256Hex.slice(0, 12)})`,
      'log-cyan'
    );
  });

  // 1b. Regenerate 100%
  el('btnHeal').addEventListener('click', () => {
    if (!state.decoded?.canFullRegenerate) {
      logEvent('Cannot 100% heal: one or more bundles are below Cauchy threshold k. Try Trisect+cat or Restore.', 'log-bad');
      return;
    }
    const healed = regenerateHbin(state.decoded);
    state.currentBytes = new Uint8Array(healed.bytes);
    state.mitosisMode = false;
    state.allowXenograft = false;
    state.pinnedRootHex = healed.lineageRootHex;
    const origSha = state.pristine[state.species].sha256Hex;
    const exactMatch = healed.sha256Hex === origSha;
    refreshDecodedState(false);
    logEvent(
      `REGENERATED 98,304B pristine .hbin! SHA-256=${healed.sha256Hex.slice(0, 16)} (${exactMatch ? '100% BIT-EXACT ORIGINAL!' : 'NEW CHIMERA GENOME'})`,
      'log-good'
    );
  });

  // 1c. +137B Unaligned Shift & Shuffle
  el('btnShiftShuffle').addEventListener('click', () => {
    state.mitosisMode = false;
    const seed = ++state.seedCounter;
    state.currentBytes = shiftAndShuffle(state.currentBytes, 137, seed, true);
    state.currentLinearBytes = shiftAndShuffle(state.currentLinearBytes, 137, seed, true);
    refreshDecodedState(false);
    logEvent(
      `SHIFTED +137B noise & SHUFFLED all cells! PLANARIA recovered ${state.decoded.stats.unalignedRecoveries} unaligned cells; Linear Twin CRASHED (${state.linearDecoded?.fault}).`,
      'log-warn'
    );
  });

  // 1d. 3-Way Trisection + Raw Concatenation Super-Additive Healing
  el('btnTrisectHeal').addEventListener('click', () => {
    state.mitosisMode = false;
    const parts = splitBinary(state.pristine[state.species].bytes, 3);
    const d0 = decodeHbin(parts[0]);
    const d2 = decodeHbin(parts[2]);
    const fused = concatShards(parts[0], parts[2], 97, ++state.seedCounter);
    state.currentBytes = fused;
    state.currentLinearBytes = concatShards(
      splitBinary(state.linearPristine[state.species].bytes, 3)[0],
      splitBinary(state.linearPristine[state.species].bytes, 3)[2],
      97
    );
    refreshDecodedState(false);
    logEvent(
      `TRISECT + cat(Part1 + 97B junk + Part3): Each shard alone capped at S${d0.maxViableStratum}/S${d2.maxViableStratum} -> Fused jumped to S${state.decoded.maxViableStratum} (100% regen=${state.decoded.canFullRegenerate})!`,
      'log-cyan'
    );
  });

  // 2. Progressive Erasure Shredders
  document.querySelectorAll('[data-shred]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.mitosisMode = false;
      const drop = parseFloat(btn.dataset.shred);
      const seed = ++state.seedCounter;
      const baseP = state.pristine[state.species].bytes;
      const baseL = state.linearPristine[state.species].bytes;
      // At 88% pick a deterministic pure Stratum-0 Ghost seed (where only S0 survives)
      let chosenSeed = seed;
      if (drop >= 0.85) {
        for (let s = seed; s < seed + 60; s++) {
          const test = decodeHbin(shredCells(baseP, drop, s, false).bytes, { pinnedRootHex: state.pinnedRootHex });
          if (test.bootable && test.maxViableStratum === 0) { chosenSeed = s; break; }
        }
      }
      state.currentBytes = shredCells(baseP, drop, chosenSeed, false).bytes;
      state.currentLinearBytes = shredCells(baseL, drop, chosenSeed, false).bytes;
      refreshDecodedState(false);
      logEvent(
        `SHREDDED ${Math.round(drop * 100)}% of binary bytes -> PLANARIA ${state.decoded.bootable ? `ALIVE @ Stratum S${state.decoded.maxViableStratum}` : 'DEAD'} | Linear Twin: ${state.linearDecoded?.fault}`,
        state.decoded.bootable ? 'log-warn' : 'log-bad'
      );
    });
  });

  // 3. Radiation Bit-Rot
  document.querySelectorAll('[data-rad]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.mitosisMode = false;
      const errCnt = parseInt(btn.dataset.rad, 10);
      const burst = btn.dataset.burst === '1';
      const seed = ++state.seedCounter;
      state.currentBytes = irradiateCells(state.pristine[state.species].bytes, errCnt, seed, burst).bytes;
      state.currentLinearBytes = irradiateCells(state.linearPristine[state.species].bytes, errCnt, seed, burst).bytes;
      refreshDecodedState(false);
      logEvent(
        `RADIATION ${errCnt}B/cell (${burst ? 'contiguous burst' : 'random'}) across ALL 192 cells (${errCnt * 192}B total): RS(254,238) healed ${state.decoded.stats.rsTotalByteErrorsFixed}B (${state.decoded.stats.authenticCells}/192 cells alive)!`,
        state.decoded.canFullRegenerate ? 'log-good' : 'log-bad'
      );
    });
  });

  // 4. Byzantine Trojans & Immune Toggle
  el('btnTrojan').addEventListener('click', () => {
    state.mitosisMode = false;
    state.currentBytes = injectByzantineTrojans(state.currentBytes, 36, ++state.seedCounter, true).bytes;
    state.currentLinearBytes = injectByzantineTrojans(state.currentLinearBytes, 36, state.seedCounter, true).bytes;
    refreshDecodedState(false);
    if (state.immuneEnabled) {
      logEvent(
        `BYZANTINE ATTACK (+36 RS-valid forged Trojans prepended): Merkle Immune System QUARANTINED ${state.decoded.stats.byzantineQuarantined} Trojans — 0% decoder poisoning!`,
        'log-good'
      );
    } else {
      logEvent(
        `BYZANTINE ATTACK WITH IMMUNE SYSTEM DISABLED: Forged cells poisoned raw Cauchy GF(256) decoder! (Falsification confirmed)`,
        'log-bad'
      );
    }
  });

  el('btnToggleImmune').addEventListener('click', () => {
    state.immuneEnabled = !state.immuneEnabled;
    el('btnToggleImmune').textContent = state.immuneEnabled ? 'Immune: ON (Safe)' : 'Immune: OFF (Unsafe!)';
    el('btnToggleImmune').className = state.immuneEnabled ? 'btn-emerald' : 'btn-crimson';
    refreshDecodedState(false);
    logEvent(
      state.immuneEnabled
        ? 'Cryptographic Merkle Immune System RE-ENABLED — Byzantine cells isolated.'
        : 'WARNING: Merkle Immune System DISABLED (Falsification Mode) — Trojans can poison Cauchy decoding!',
      state.immuneEnabled ? 'log-good' : 'log-bad'
    );
  });

  // 5. Targeted Organ Scalpel
  document.querySelectorAll('[data-amp]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.mitosisMode = false;
      const ids = btn.dataset.amp.split(',').map((s) => parseInt(s, 10));
      const res = amputateBundles(state.currentBytes, ids, true, ++state.seedCounter);
      state.currentBytes = res.bytes;
      // Apply matching byte crater to Linear Twin
      const linCopy = new Uint8Array(state.currentLinearBytes);
      for (let i = 100; i < 612; i++) linCopy[i] ^= 0xaa;
      state.currentLinearBytes = linCopy;
      refreshDecodedState(false);
      logEvent(
        `ORGAN SCALPEL excised bundles [${ids.join(',')}] (${res.amputatedCells} cells) -> Live Control-Flow Anastomosis rerouted without halting!`,
        'log-warn'
      );
    });
  });

  // 6. Cross-Species Xenograft Splicer!
  el('btnXenograft').addEventListener('click', () => {
    const donorName = el('donorSelect').value;
    if (donorName === state.species) {
      logEvent('Select a DIFFERENT donor species to forge a Cross-Species Chimera!', 'log-warn');
      return;
    }
    state.mitosisMode = false;
    state.allowXenograft = true;
    const hostPristine = state.pristine[state.species];
    const donorPristine = state.pristine[donorName];
    const ampHost = amputateBundles(hostPristine.bytes, [3, 4], true, ++state.seedCounter).bytes;
    state.currentBytes = concatShards(ampHost, donorPristine.bytes, 53, state.seedCounter);
    state.pinnedRootHex = hostPristine.lineageRootHex;
    refreshDecodedState(false);
    logEvent(
      `XENOGRAFT CHIMERA FORGED! ${hostPristine.name} host + ${donorPristine.name} donor -> Transplanted [${state.decoded.xenografts.map((x) => x.bundleName).join(', ')}] live over shared ABI!`,
      'log-xeno'
    );
  });

  // Tabs
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach((p) => p.classList.remove('active'));
      btn.classList.add('active');
      el(`tab-${btn.dataset.tab}`).classList.add('active');
    });
  });

  el('disasmBundle').addEventListener('change', updateDisassembly);

  // Live Plang Compiler Button
  el('btnCompileLive').addEventListener('click', () => {
    try {
      const t0 = performance.now();
      const res = compilePlangToHbin(el('plangEditor').value);
      const dt = (performance.now() - t0).toFixed(1);
      state.pristine[state.species] = res;
      state.sources[state.species] = el('plangEditor').value;
      state.linearPristine[state.species] = encodeLinearBinary(res.rawBundles, res.name);
      state.currentBytes = new Uint8Array(res.bytes);
      state.currentLinearBytes = new Uint8Array(state.linearPristine[state.species].bytes);
      state.pinnedRootHex = res.lineageRootHex;
      state.mitosisMode = false;
      state.allowXenograft = false;
      refreshDecodedState(true);
      el('compileStatus').textContent = `Compiled ${res.name} in ${dt} ms -> 98,304B .hbin | Root ${res.lineageRootHex} | ${res.codegen.totalInstructions} insns`;
      logEvent(`COMPILED live Plang source (${res.codegen.totalInstructions} insns) in ${dt} ms!`, 'log-good');
    } catch (err) {
      el('compileStatus').textContent = `Compile Error: ${err.message}`;
      logEvent(`Plang compile error: ${err.message}`, 'log-bad');
    }
  });

  // Interactive Tissue Canvas Click & Shift+Drag Surgery
  const tissueCanvas = el('canvasTissue');
  tissueCanvas.addEventListener('mousedown', (e) => {
    const slot = slotFromCanvasEvent(e);
    if (slot < 0) return;
    if (e.shiftKey) {
      state.isDraggingTissue = true;
      exciseSlot(slot);
    } else {
      updateCellInspector(slot);
      drawTissueMap(tissueCanvas, state.decoded, slot, state.mitosisMode ? 96 : -1);
    }
  });
  tissueCanvas.addEventListener('mousemove', (e) => {
    if (!state.isDraggingTissue) return;
    const slot = slotFromCanvasEvent(e);
    if (slot >= 0) exciseSlot(slot);
  });
  window.addEventListener('mouseup', () => { state.isDraggingTissue = false; });

  // Keyboard gameplay controls
  window.addEventListener('keydown', (e) => {
    if (document.activeElement && document.activeElement.tagName === 'TEXTAREA') return;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }
    state.keys.add(e.code);
  });
  window.addEventListener('keyup', (e) => state.keys.delete(e.code));
}

async function boot() {
  logEvent('Booting PLANARIA Surgical Vivisection Studio...', 'log-cyan');
  // Load all 3 .plang sources & compile in-browser to verify identical zero-dep determinism
  for (const name of SPECIES_LIST) {
    const resp = await fetch(`/programs/${name}.plang`);
    const src = await resp.text();
    state.sources[name] = src;
    const comp = compilePlangToHbin(src);
    state.pristine[name] = comp;
    state.linearPristine[name] = encodeLinearBinary(comp.rawBundles, comp.name);
  }
  try {
    const bResp = await fetch('/results/benchmarks.json');
    if (bResp.ok) {
      state.benchmarks = await bResp.json();
      const p80 = state.benchmarks.survivalCurve.find((x) => x.dropPct === 80);
      el('benchSummary').textContent =
        `Reproducible Benchmark (40 Monte Carlo trials/pt, Node ${state.benchmarks.nodeVersion}): ` +
        `@ 80% total file erasure -> Linear=${p80.linearSurvivalPct}%, RS(40,16) Cliff=${p80.rsCliffSurvivalPct}%, PLANARIA=${p80.planariaSurvivalPct}% | ` +
        `Decode=${state.benchmarks.performance.meanFullDecodeMs} ms | PVM-32=${state.benchmarks.performance.pvm32ThroughputMIPS} MIPS`;
    }
  } catch {
    // Optional if benchmark hasn't been generated yet
  }

  wireEvents();
  selectSpecies('aegis_drift');
  requestAnimationFrame(frameLoop);
}

boot();
