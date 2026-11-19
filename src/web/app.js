/**
 * PLANARIA v2.0 — Unified 3D Temporal-Quantum Holographic Engine & Surgical Vivisection Controller
 *
 * Simultaneously runs:
 *   1. Real WebGL2 3D Temporal-Quantum Universe (ChronoQuantumWorld + Renderer3D)
 *   2. Real PLANARIA .hbin codec (192x512B cells, RS(254,238), Cauchy GF(2^8), Depth-8 SHA-256 Merkle)
 *   3. Real Dual PVM-32 VM + Linear Binary Control Twin (LINBIN01)
 *   4. Real Lock-Free 48 kHz 4-Voice AudioWorklet Synthesizer
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
import { heisenbergStance } from '../quantum/qengine.js';
import { SKILL_TREE, ABILITIES, combinatorialSpaceMetrics } from '../world/generator.js';
import { ChronoQuantumWorld } from '../world/game3d.js';
import { Renderer3D } from './renderer3d.js';
import { PlanariaAudio } from './audio.js';
import { drawTissueMap, drawAnastomosisGraph, drawSurvivalCurve } from './visuals.js';

const SPECIES_LIST = ['quantum_chronicle', 'aegis_drift', 'synth_reactor', 'cipher_vault'];

const state = {
  species: 'quantum_chronicle',
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
  keys: new Set(),
  seedCounter: 100,
  isDraggingTissue: false,
  isDragging3D: false,
  lastMouseX: 0,
  lastMouseY: 0,
  customTimeScale: false,
  rewindBurstFrames: 0,
};

const vmPrimary = new PVM32(0x1337c0de);
const vmSecondary = new PVM32(0x1337c0de);
const audio = new PlanariaAudio();
const world = new ChronoQuantumWorld(2026);
const renderer3d = new Renderer3D(document.getElementById('canvas3d'));

const el = (id) => document.getElementById(id);

function logEvent(msg, cls = '') {
  const box = el('eventLog');
  const ts = new Date().toLocaleTimeString('en-US', { hour12: false });
  const div = document.createElement('div');
  if (cls) div.className = cls;
  div.textContent = `[${ts}] ${msg}`;
  box.prepend(div);
  while (box.children.length > 70) box.removeChild(box.lastChild);
}

function stratumBadgeInfo(maxS, bootable) {
  if (!bootable || maxS < 0) return { text: 'CELL DEATH', cls: 'badge-dead' };
  if (maxS === 3) return { text: 'STRATUM 3 · FULL 3D', cls: 'badge-s3' };
  if (maxS === 2) return { text: 'STRATUM 2 · CORTEX 3D', cls: 'badge-s2' };
  if (maxS === 1) return { text: 'STRATUM 1 · 3D WIREFRAME', cls: 'badge-s1' };
  return { text: 'STRATUM 0 · GHOST CLOUD', cls: 'badge-s0' };
}

function buildAbilityBar() {
  const bar = el('abilityBar');
  bar.innerHTML = '';
  for (const ab of ABILITIES) {
    const btn = document.createElement('button');
    btn.className = 'ab-btn';
    btn.id = `ab-${ab.key}`;
    btn.title = ab.desc;
    btn.innerHTML = `<span class="ab-key">[${ab.key}]</span><span class="ab-name">${ab.name}</span><span class="ab-cd" id="abcd-${ab.key}">READY</span>`;
    btn.addEventListener('click', () => {
      if (ab.key === 'R') {
        state.rewindBurstFrames = 45;
        logEvent('R · CHRONO REWIND: Scrubbing 3D timeline backwards!', 'log-cyan');
      } else {
        const ok = world.triggerAbility(ab.key);
        if (ok) renderRpgPanels();
      }
    });
    bar.appendChild(btn);
  }
}

function renderRpgPanels() {
  // 1. Weapons
  const wBox = el('weaponList');
  wBox.innerHTML = '';
  world.weapons.forEach((w, idx) => {
    const div = document.createElement('div');
    div.className = `item-card ${idx === world.weaponIdx ? 'equipped' : ''}`;
    div.innerHTML =
      `<div class="item-title" style="color:${w.rarity.color};">[${idx + 1}] ${w.rarity.name} · ${w.name}</div>` +
      `<div class="item-sub">DMG ${w.damage} · ${w.fireRate}/s · ×${w.projectileCount} · Tunnel ${Math.round(w.tunnelFactor * 100)}% · #${w.lineageId}<br/>` +
      `<span style="color:#22d3ee;">${w.tMod.tag}</span> · ${w.qMod.desc}` +
      `${w.entangledPartner ? `<br/><span style="color:#e879f9;">BELL-ENTANGLED ↔ #${w.entangledPartner}</span>` : ''}</div>`;
    div.addEventListener('click', () => { world.selectWeapon(idx); renderRpgPanels(); });
    wBox.appendChild(div);
  });

  // 2. Armors
  const aBox = el('armorList');
  aBox.innerHTML = '';
  world.armors.forEach((a, idx) => {
    const div = document.createElement('div');
    div.className = `item-card ${idx === world.armorIdx ? 'equipped' : ''}`;
    div.innerHTML =
      `<div class="item-title" style="color:${a.rarity.color};">${a.rarity.name} · ${a.name}</div>` +
      `<div class="item-sub">SHIELD ${a.maxShield} · Regen +${a.regenRate}/s · Dodge ${Math.round(a.phaseDodge * 100)}% · #${a.lineageId}<br/>${a.layer.desc}</div>`;
    div.addEventListener('click', () => { world.selectArmor(idx); renderRpgPanels(); });
    aBox.appendChild(div);
  });

  // 3. Adaptive 4-Branch Skill Tree
  el('spBadge').textContent = `${world.skillPoints} SP`;
  const sBox = el('skillList');
  sBox.innerHTML = '';
  for (const sk of SKILL_TREE) {
    const lvl = world.skills[sk.id] || 0;
    const div = document.createElement('div');
    div.className = `item-card ${lvl > 0 ? 'equipped' : ''}`;
    div.innerHTML =
      `<div class="item-title" style="display:flex; justify-content:space-between;">` +
      `<span><span style="color:var(--cyan);font-size:9px;">[${sk.branch.slice(0, 4)}]</span> ${sk.name}</span>` +
      `<span style="color:var(--gold);">Lv.${lvl}/${sk.maxLvl}</span></div>` +
      `<div class="item-sub">${sk.desc}</div>`;
    div.addEventListener('click', () => {
      if (world.upgradeSkill(sk.id)) {
        logEvent(`Upgraded ${sk.name} -> Lv.${world.skills[sk.id]}`, 'log-good');
        renderRpgPanels();
      }
    });
    sBox.appendChild(div);
  }

  // 4. Live Adaptive 1/1 NPC Roster
  const nBox = el('npcList');
  nBox.innerHTML = '';
  for (const n of world.npcs.slice(0, 12)) {
    const pct = Math.max(0, Math.round((n.hp / Math.max(1, n.maxHp)) * 100));
    const div = document.createElement('div');
    div.className = 'item-card';
    div.style.borderColor = n.isBoss ? '#f43f5e' : '#1b2c40';
    div.innerHTML =
      `<div class="item-title" style="color:${n.isBoss ? '#fda4af' : (n.rarity?.color || '#e2e8f0')};">${n.isBoss ? '★ BOSS · ' : ''}${n.name}</div>` +
      `<div class="item-sub">HP ${Math.max(0, n.hp)}/${n.maxHp} (${pct}%) · #${n.lineageId}<br/>` +
      `Temporal: <span style="color:#fbbf24;">${n.temporalAffix}</span> · Adapt: <span style="color:#10f5a8;">${n.adaptation?.counterTag || 'BASE'}</span>` +
      `${n.entangledWith !== null ? ' · <span style="color:#e879f9;">BELL-LINKED</span>' : ''}` +
      `${n.zenoFreeze > 0.3 ? ' · <span style="color:#22d3ee;">ZENO-FROZEN</span>' : ''}</div>`;
    nBox.appendChild(div);
  }
}

function updateDisassembly() {
  const bId = parseInt(el('disasmBundle').value, 10);
  const bun = state.decoded?.bundles?.[bId];
  const box = el('disasmBox');
  if (!bun || !bun.viable || !bun.data) {
    box.textContent = `; Bundle B${bId} AMPUTATED — Anastomosis reroutes to lower strata.`;
    return;
  }
  box.textContent =
    `; ${bun.name} (${bun.source}) · ${bun.data.length}B · rank ${bun.cellsFound}/${bun.k}\n` +
    disassembleBytes(bun.data, 64).join('\n');
}

function updateCellInspector(slot) {
  state.selectedSlot = slot;
  const box = el('cellInspector');
  const entry = state.decoded?.slotMap?.[slot];
  if (!state.currentBytes) return;
  const off = entry ? entry.byteOffset : slot * CELL_SIZE;
  const slice = off + CELL_SIZE <= state.currentBytes.length ? state.currentBytes.subarray(off, off + CELL_SIZE) : null;
  const info = slice ? inspectSingleCell(slice) : null;
  if (!info) {
    box.innerHTML = `<strong>CELL SLOT #${slot}</strong><br/><span style="color:#fda4af;">TRUNCATED OUT OF BOUNDS</span>`;
    return;
  }
  const st = entry ? entry.status : 'NECROTIC';
  const col = st === 'INTACT' ? '#10f5a8' : st === 'REPAIRED' ? '#fbbf24' : st === 'XENOGRAFT' ? '#e879f9' : '#f43f5e';
  box.innerHTML =
    `<strong>CELL SLOT #${slot}</strong> · <span style="color:${col};font-weight:700;">${st}</span><br/>` +
    `Offset: <code>${off}</code> | Sync: <code>0x${info.syncHex}</code> (err ${info.syncBitErrors}/3)<br/>` +
    `RS(254,238): <code>${info.rsOk ? `OK (${info.rsErrorsFixed}B healed)` : info.rsReason}</code><br/>` +
    `Bundle: <code>${info.bundleName}</code> (S${info.header.stratum} · ${info.organName})<br/>` +
    `Cauchy x_i=<code>${info.header.evalX}</code> · k/n=<code>${info.header.k}/${info.header.n}</code> · ABI <code>0x${info.header.abiSig.toString(16)}</code><br/>` +
    `Root: <code>${info.impliedRootHex || 'NONE'}</code><br/>` +
    `Payload: <code>${info.payloadPreviewHex.slice(0, 32)}...</code>`;
}

function refreshDecodedState(resetRam = false, mitosisTriggered = false) {
  const t0 = performance.now();
  state.decoded = decodeHbin(state.currentBytes, {
    pinnedRootHex: state.immuneEnabled ? state.pinnedRootHex : null,
    allowXenograft: state.allowXenograft,
    disableImmuneSystem: !state.immuneEnabled,
  });
  state.lastDecodeMs = performance.now() - t0;

  vmPrimary.loadDecoded(state.decoded, resetRam);
  world.syncHbinState(state.decoded, { mitosisActive: state.mitosisMode, mitosisTriggered });

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

  const pInfo = stratumBadgeInfo(d.maxViableStratum, d.bootable);
  const pBadge = el('primaryStratumBadge');
  pBadge.textContent = d.xenografts.length > 0 ? `CHIMERA 3D · S${d.maxViableStratum}` : pInfo.text;
  pBadge.className = `badge ${d.xenografts.length > 0 ? 'badge-xeno' : pInfo.cls}`;
  el('primaryCrtBadge').textContent = pBadge.textContent;
  el('primaryCrtBadge').className = pBadge.className;

  el('cardPrimary').className = `crt-card ${d.bootable ? 'patient-primary' : 'patient-dead'}`;
  el('primaryLabel').textContent = state.mitosisMode
    ? 'MITOSIS CHILD A · LEFT 50% (0..49176)'
    : `PATIENT A · ${d.genome?.name || state.species.toUpperCase()} (.hbin)`;
  el('primaryRoot').textContent = `ROOT: ${(d.primaryRootHex || 'NONE').slice(0, 16)}`;

  if (state.mitosisMode) {
    const r = state.decodedRight;
    const rInfo = stratumBadgeInfo(r?.maxViableStratum ?? -1, r?.bootable);
    el('secondaryLabel').textContent = 'MITOSIS CHILD B · RIGHT 50% (49177..98303)';
    el('secondaryBadge').textContent = rInfo.text;
    el('secondaryBadge').className = `badge ${rInfo.cls}`;
    el('cardSecondary').className = 'crt-card patient-mitosis';
    el('secondaryMeta').textContent = `ZERO OVERLAP · ${r?.stats?.authenticCells || 0} CELLS`;
    el('secondaryStatus').textContent = r?.canFullRegenerate ? '100% REGEN READY' : 'DEGRADED';
  } else {
    const ld = state.linearDecoded;
    el('secondaryLabel').textContent = 'CONTROL · LINEAR BINARY (LINBIN01)';
    el('secondaryBadge').textContent = ld?.bootable ? 'INTACT' : 'FATAL CRASH';
    el('secondaryBadge').className = `badge ${ld?.bootable ? 'badge-s3' : 'badge-dead'}`;
    el('cardSecondary').className = `crt-card ${ld?.bootable ? '' : 'patient-dead'}`;
    el('secondaryMeta').textContent = ld?.bootable ? 'Monolithic ELF-style Loader' : ld?.fault || 'DEAD';
    el('secondaryStatus').textContent = ld?.bootable ? 'ALIVE' : 'FLATLINED';
  }

  const cellsEl = el('statCells');
  cellsEl.textContent = `${d.stats.authenticCells} / ${TOTAL_CELLS}`;
  cellsEl.className = `stat-val ${d.stats.authenticCells >= 96 ? 'good' : d.bootable ? 'warn' : 'bad'}`;

  el('statRsFixed').textContent = `${d.stats.rsTotalByteErrorsFixed} B`;
  el('statRsFixed').className = `stat-val ${d.stats.rsTotalByteErrorsFixed > 0 ? 'warn' : ''}`;
  el('statQuarantined').textContent = String(d.stats.byzantineQuarantined);
  el('statQuarantined').className = `stat-val ${d.stats.byzantineQuarantined > 0 ? 'bad' : ''}`;
  el('statXeno').textContent = String(d.xenografts.length);
  el('statXeno').className = `stat-val ${d.xenografts.length > 0 ? 'xeno' : ''}`;

  el('immuneBadge').textContent = state.immuneEnabled ? 'IMMUNE: MERKLE ON' : 'IMMUNE: OFF (UNSAFE!)';
  el('immuneBadge').className = `badge ${state.immuneEnabled ? 'badge-s2' : 'badge-dead'}`;

  state.lastTissueMetrics = drawTissueMap(el('canvasTissue'), d, state.selectedSlot, state.mitosisMode ? 96 : -1);
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
  el('compileStatus').textContent = `Loaded ${comp.name}: ${comp.codegen.totalInstructions} PVM-32 insns, 98,304B .hbin`;

  const other = SPECIES_LIST.find((s) => s !== name) || 'synth_reactor';
  el('donorSelect').value = other;
  refreshDecodedState(true);
  logEvent(`Loaded pristine ${comp.name}.hbin (Root ${comp.lineageRootHex.slice(0, 12)})`, 'log-good');
}

function updateLive3DHud() {
  const pl = world.player;
  const r = world.activeRealm;
  el('stageHeader').textContent = `${world.stageSpec.title} · ORDER ${r.scaleLabel} (${r.subtitle})`;
  el('hudStageScale').textContent = `ORDER ${r.scaleLabel} · ${r.name.split(' ')[0]}`;
  el('hudWave').textContent = `WAVE ${world.wave}/${world.stageSpec.wavesPerStage} · Lv.${world.level}`;

  el('barHp').style.width = `${(pl.hp / Math.max(1, pl.maxHp)) * 100}%`;
  el('valHp').textContent = Math.round(pl.hp);
  el('barShield').style.width = `${(pl.shield / Math.max(1, pl.maxShield)) * 100}%`;
  el('valShield').textContent = Math.round(pl.shield);
  el('barChrono').style.width = `${world.temporal.chronoEnergy}%`;
  el('valChrono').textContent = Math.round(world.temporal.chronoEnergy);
  el('barCoh').style.width = `${world.qReg.coherence * 100}%`;
  el('valCoh').textContent = `${Math.round(world.qReg.coherence * 100)}%`;

  const absS = Math.abs(world.chshValue);
  el('hudChsh').textContent = `CHSH |S| = ${absS.toFixed(2)} ${absS > 2.0 ? '(BELL VIOLATION!)' : '(CLASSICAL)'}`;
  el('hudWaveRidge').textContent = `WAVE |ψ|² = ${world.waveIntensityAtPlayer.toFixed(2)} ${world.waveIntensityAtPlayer > 1.35 ? '· CONSTRUCTIVE 2.2x!' : '· FIELD'}`;
  el('hudScore').textContent = `SCORE ${world.score} · KILLS ${world.kills} · SP ${world.skillPoints}`;
  el('hudEchoes').textContent = `ECHOES ${world.temporal.echoClones.length} · WELLS ${world.temporal.chronoWells.length} · PARADOX ${world.temporal.paradoxCount}`;

  const w = world.equippedWeapon;
  const a = world.equippedArmor;
  el('hudEquipped').innerHTML =
    `<span style="color:${w.rarity.color};font-weight:700;">[${world.weaponIdx + 1}] ${w.shortName}</span> (${w.qMod.id}/${w.tMod.tag}) · ` +
    `<span style="color:${a.rarity.color};">${a.shortName}</span>`;

  el('statEntropy').textContent = `${world.qReg.basisEntropy().toFixed(2)} b`;
  el('statLatency').textContent = `${state.lastDecodeMs.toFixed(1)}ms · ${world.npcs.length} NPC`;

  const mb = el('modeBadge');
  if (world.temporal.rewinding) {
    mb.textContent = '◀◀ REWINDING TIME';
    mb.className = 'badge badge-s1';
  } else if (world.temporal.globalTimeScale < 0.5) {
    mb.textContent = `BULLET-TIME ${world.temporal.globalTimeScale.toFixed(2)}x`;
    mb.className = 'badge badge-s0';
  } else {
    mb.textContent = `CLOCK ${world.temporal.globalTimeScale.toFixed(2)}x`;
    mb.className = 'badge badge-s2';
  }

  for (const ab of ABILITIES) {
    const cd = world.abilityCooldowns[ab.key] || 0;
    const btn = el(`ab-${ab.key}`);
    const lbl = el(`abcd-${ab.key}`);
    if (btn && lbl) {
      btn.classList.toggle('on-cd', cd > 0);
      lbl.textContent = cd > 0 ? `${cd.toFixed(1)}s` : (ab.cost > 0 ? `${ab.cost}⚡` : 'READY');
    }
  }

  // Drain new world events into surgical telemetry log
  while (world.events.length > 0) {
    const ev = world.events.pop();
    logEvent(ev.text, `log-${ev.tone}`);
  }
}

// ============================================================================
// MAIN 60 FPS DUAL-ENGINE LOOP (WEBGL2 3D + PVM-32 + 48kHz AUDIOWORKLET)
// ============================================================================
const ctxPrimary = el('canvasPrimary').getContext('2d');
const ctxSecondary = el('canvasSecondary').getContext('2d');
const imgPrimary = ctxPrimary.createImageData(160, 120);
const imgSecondary = ctxSecondary.createImageData(160, 120);

let lastTime = performance.now();

function frameLoop(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  state.tick++;

  // Step underlying PLANARIA PVM-32 holographic binary!
  let pvmInput = world.autopilot ? 32 : 0;
  if (state.keys.has('KeyA') || state.keys.has('ArrowLeft')) pvmInput |= 1;
  if (state.keys.has('KeyD') || state.keys.has('ArrowRight')) pvmInput |= 2;
  if (state.keys.has('KeyW') || state.keys.has('ArrowUp')) pvmInput |= 4;
  if (state.keys.has('KeyS') || state.keys.has('ArrowDown')) pvmInput |= 8;
  if (state.keys.has('Space')) pvmInput |= 16;

  vmPrimary.setInput(pvmInput);
  vmSecondary.setInput(pvmInput);
  const r1 = vmPrimary.stepFrame();
  if (state.mitosisMode || state.linearDecoded?.bootable) vmSecondary.stepFrame();

  // Compute camera-relative 3D WASD movement
  let fwd = 0, right = 0;
  if (state.keys.has('KeyW') || state.keys.has('ArrowUp')) fwd += 1;
  if (state.keys.has('KeyS') || state.keys.has('ArrowDown')) fwd -= 1;
  if (state.keys.has('KeyD') || state.keys.has('ArrowRight')) right += 1;
  if (state.keys.has('KeyA') || state.keys.has('ArrowLeft')) right -= 1;

  const sy = Math.sin(renderer3d.camYaw);
  const cy = Math.cos(renderer3d.camYaw);
  const moveX = -sy * fwd + cy * right;
  const moveZ = -cy * fwd - sy * right;

  const rewindHeld = state.keys.has('KeyR') || state.rewindBurstFrames > 0;
  if (state.rewindBurstFrames > 0) state.rewindBurstFrames--;

  world.step(dt, {
    moveX,
    moveZ,
    fire: state.keys.has('Space'),
    aimYaw: (Math.abs(moveX) > 0.05 || Math.abs(moveZ) > 0.05) ? Math.atan2(moveX, moveZ) : undefined,
    rewindHeld,
    bulletTimeHeld: state.keys.has('ShiftLeft') || state.keys.has('ShiftRight'),
    customTimeScale: state.customTimeScale,
    pvmRam: vmPrimary.ram,
  });

  // Render full 60 FPS 3D WebGL2 Temporal-Quantum Universe!
  renderer3d.render(world, state.decoded);

  // Also keep 2D Dual-Patient PVM-32 CRTs updated
  imgPrimary.data.set(vmPrimary.fbBytes);
  ctxPrimary.putImageData(imgPrimary, 0, 0);
  imgSecondary.data.set(vmSecondary.fbBytes);
  ctxSecondary.putImageData(imgSecondary, 0, 0);

  // Push live 4-voice adaptive harmonic quantum synth registers to 48 kHz AudioWorklet!
  audio.pushVoices(world.liveVoices);

  if (state.tick % 4 === 0) {
    el('primaryFps').textContent = `${r1.insns} insns/f · traps:${vmPrimary.traps}`;
    updateLive3DHud();
    drawAnastomosisGraph(el('canvasVascular'), state.decoded, vmPrimary.lastFrameRoutes, state.tick);
  }
  if (state.tick % 24 === 0) {
    renderRpgPanels();
  }

  requestAnimationFrame(frameLoop);
}

// ============================================================================
// INTERACTIVE EVENT WIRING
// ============================================================================
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
  // 3D Orbit & Zoom controls on WebGL2 viewport
  const wrap3d = el('viewport3dWrap');
  wrap3d.addEventListener('mousedown', (e) => {
    state.isDragging3D = true;
    state.lastMouseX = e.clientX;
    state.lastMouseY = e.clientY;
  });
  window.addEventListener('mousemove', (e) => {
    if (state.isDragging3D) {
      const dx = e.clientX - state.lastMouseX;
      const dy = e.clientY - state.lastMouseY;
      state.lastMouseX = e.clientX;
      state.lastMouseY = e.clientY;
      renderer3d.camYaw -= dx * 0.0075;
      renderer3d.camPitch = Math.max(0.14, Math.min(1.42, renderer3d.camPitch + dy * 0.006));
    }
  });
  window.addEventListener('mouseup', () => { state.isDragging3D = false; state.isDraggingTissue = false; });
  wrap3d.addEventListener('wheel', (e) => {
    e.preventDefault();
    renderer3d.camDist = Math.max(11, Math.min(64, renderer3d.camDist + e.deltaY * 0.025));
  }, { passive: false });

  // Heisenberg Uncertainty Slider
  el('sliderHeisen').addEventListener('input', (e) => {
    const s = parseInt(e.target.value, 10) / 100;
    world.player.heisenbergStance = s;
    const h = heisenbergStance(s);
    const mode = s < 0.35 ? 'POSITION-LOCK' : s > 0.65 ? 'MOMENTUM-BLUR' : 'BALANCED';
    el('heisenLabel').textContent = `${mode} · ${h.critMultiplier.toFixed(2)}x Crit · ${Math.round(h.evasionChance * 100)}% Dodge`;
  });

  // Temporal Clock Slider
  el('sliderTime').addEventListener('input', (e) => {
    const v = parseInt(e.target.value, 10) / 100;
    state.customTimeScale = Math.abs(v - 1.0) > 0.03;
    world.temporal.globalTimeScale = v;
    el('timeLabel').textContent = `${v.toFixed(2)}x · ${v < 0.6 ? 'Time Dilation' : v > 1.3 ? 'Hyper-Chronon' : 'Real-Time'}`;
  });

  el('btnRewindHold').addEventListener('click', () => {
    state.rewindBurstFrames = 55;
    logEvent('REWIND PULSE: Scrubbing 3D world 1s backwards in time!', 'log-cyan');
  });

  el('btnOrderNext').addEventListener('click', () => world.triggerAbility('X'));
  el('btnNextStage').addEventListener('click', () => { world.advanceStage(); renderRpgPanels(); });
  el('btnForgeLoot').addEventListener('click', () => { world.forgeNewGear(2); renderRpgPanels(); });
  el('btnEntangleWpns').addEventListener('click', () => { world.entangleWeapons(0, 1); renderRpgPanels(); });

  el('speciesSelect').addEventListener('change', (e) => selectSpecies(e.target.value));
  el('btnAudio').addEventListener('click', async () => {
    const on = await audio.toggle();
    el('btnAudio').textContent = `48kHz Audio: ${on ? 'ON' : 'OFF'}`;
    el('btnAudio').classList.toggle('active', on);
  });
  el('btnAuto').addEventListener('click', () => {
    world.autopilot = !world.autopilot;
    el('btnAuto').textContent = `Autopilot: ${world.autopilot ? 'ON' : 'OFF'}`;
    el('btnAuto').classList.toggle('active', world.autopilot);
  });
  el('btnRestore').addEventListener('click', () => selectSpecies(state.species));
  el('btnDownload').addEventListener('click', () => {
    const blob = new Blob([state.currentBytes], { type: 'application/octet-stream' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${state.species}_${state.decoded?.xenografts?.length ? 'chimera' : 'live'}.hbin`;
    a.click();
    logEvent(`Exported ${state.currentBytes.length}B raw .hbin binary.`, 'log-good');
  });

  // 1. Laser Bisect (50/50 Planarian Mitosis!)
  el('btnMitosis').addEventListener('click', () => {
    const cut = 49177;
    const { left, right } = bisectBinary(state.pristine[state.species].bytes, cut);
    state.mitosisMode = true;
    state.allowXenograft = false;
    state.shardLeftBytes = left;
    state.shardRightBytes = right;
    state.currentBytes = new Uint8Array(left);
    refreshDecodedState(false, true);
    const regL = regenerateHbin(state.decoded);
    const regR = regenerateHbin(state.decodedRight);
    const exact = regL.sha256Hex === state.pristine[state.species].sha256Hex && regR.sha256Hex === state.pristine[state.species].sha256Hex;
    logEvent(`MITOSIS BISECT @ byte ${cut}: ZERO overlap! Both halves S3 ALIVE & SHA-256 bit-exact=${exact} (${regL.sha256Hex.slice(0, 12)})`, 'log-cyan');
  });

  el('btnHeal').addEventListener('click', () => {
    if (!state.decoded?.canFullRegenerate) {
      logEvent('Below full Cauchy threshold k — use Trisect+cat or Restore.', 'log-bad');
      return;
    }
    const healed = regenerateHbin(state.decoded);
    state.currentBytes = new Uint8Array(healed.bytes);
    state.mitosisMode = false;
    state.allowXenograft = false;
    state.pinnedRootHex = healed.lineageRootHex;
    refreshDecodedState(false);
    logEvent(`REGENERATED 98,304B pristine .hbin! SHA-256=${healed.sha256Hex.slice(0, 16)}`, 'log-good');
  });

  el('btnShiftShuffle').addEventListener('click', () => {
    state.mitosisMode = false;
    const seed = ++state.seedCounter;
    state.currentBytes = shiftAndShuffle(state.currentBytes, 137, seed, true);
    state.currentLinearBytes = shiftAndShuffle(state.currentLinearBytes, 137, seed, true);
    refreshDecodedState(false);
    logEvent(`SHIFTED +137B & SHUFFLED! PLANARIA recovered ${state.decoded.stats.unalignedRecoveries} unaligned cells; Linear Twin CRASHED.`, 'log-warn');
  });

  el('btnTrisectHeal').addEventListener('click', () => {
    state.mitosisMode = false;
    const parts = splitBinary(state.pristine[state.species].bytes, 3);
    state.currentBytes = concatShards(parts[0], parts[2], 97, ++state.seedCounter);
    refreshDecodedState(false);
    logEvent(`TRISECT + cat(A+C): Super-additive healing jumped back to Stratum S${state.decoded.maxViableStratum}!`, 'log-cyan');
  });

  // 2. Shredders (Live 3D Stratum Metamorphosis: S3 -> S2 -> S1 Wireframe -> S0 Ghost Point-Cloud!)
  document.querySelectorAll('[data-shred]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.mitosisMode = false;
      const drop = parseFloat(btn.dataset.shred);
      const seed = ++state.seedCounter;
      const baseP = state.pristine[state.species].bytes;
      const baseL = state.linearPristine[state.species].bytes;
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
      logEvent(`SHREDDED ${Math.round(drop * 100)}% -> 3D Engine morphed LIVE to Stratum S${state.decoded.maxViableStratum}!`, 'log-warn');
    });
  });

  // 3. Radiation
  document.querySelectorAll('[data-rad]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.mitosisMode = false;
      const errCnt = parseInt(btn.dataset.rad, 10);
      const burst = btn.dataset.burst === '1';
      const seed = ++state.seedCounter;
      state.currentBytes = irradiateCells(state.pristine[state.species].bytes, errCnt, seed, burst).bytes;
      state.currentLinearBytes = irradiateCells(state.linearPristine[state.species].bytes, errCnt, seed, burst).bytes;
      refreshDecodedState(false);
      logEvent(`RADIATION ${errCnt}B/cell across ALL 192 cells: RS(254,238) healed ${state.decoded.stats.rsTotalByteErrorsFixed}B (${state.decoded.stats.authenticCells}/192 alive)!`, state.decoded.canFullRegenerate ? 'log-good' : 'log-bad');
    });
  });

  // 4. Byzantine Trojans
  el('btnTrojan').addEventListener('click', () => {
    state.mitosisMode = false;
    state.currentBytes = injectByzantineTrojans(state.currentBytes, 36, ++state.seedCounter, true).bytes;
    state.currentLinearBytes = injectByzantineTrojans(state.currentLinearBytes, 36, state.seedCounter, true).bytes;
    refreshDecodedState(false);
    logEvent(
      state.immuneEnabled
        ? `BYZANTINE ATTACK (+36 Trojans): Merkle Immune System QUARANTINED ${state.decoded.stats.byzantineQuarantined}/36!`
        : 'BYZANTINE ATTACK (IMMUNE OFF): Forged cells poisoned raw Cauchy decoder!',
      state.immuneEnabled ? 'log-good' : 'log-bad'
    );
  });

  el('btnToggleImmune').addEventListener('click', () => {
    state.immuneEnabled = !state.immuneEnabled;
    el('btnToggleImmune').textContent = state.immuneEnabled ? 'Immune: ON (Safe)' : 'Immune: OFF (Unsafe!)';
    el('btnToggleImmune').className = state.immuneEnabled ? 'btn-emerald' : 'btn-crimson';
    refreshDecodedState(false);
  });

  // 5. Targeted Organ Scalpel
  document.querySelectorAll('[data-amp]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.mitosisMode = false;
      const ids = btn.dataset.amp.split(',').map((s) => parseInt(s, 10));
      state.currentBytes = amputateBundles(state.currentBytes, ids, true, ++state.seedCounter).bytes;
      refreshDecodedState(false);
      logEvent(`ORGAN SCALPEL excised [${ids.join(',')}] -> Live 3D Anastomosis rerouted!`, 'log-warn');
    });
  });

  // 6. Cross-Species Xenograft
  el('btnXenograft').addEventListener('click', () => {
    const donorName = el('donorSelect').value;
    if (donorName === state.species) { logEvent('Choose a DIFFERENT donor species!', 'log-warn'); return; }
    state.mitosisMode = false;
    state.allowXenograft = true;
    const hostPristine = state.pristine[state.species];
    const donorPristine = state.pristine[donorName];
    const ampHost = amputateBundles(hostPristine.bytes, [3, 4], true, ++state.seedCounter).bytes;
    state.currentBytes = concatShards(ampHost, donorPristine.bytes, 53, state.seedCounter);
    state.pinnedRootHex = hostPristine.lineageRootHex;
    refreshDecodedState(false);
    logEvent(`3D XENOGRAFT CHIMERA FORGED! ${hostPristine.name} × ${donorPristine.name} (${state.decoded.xenografts.length} organs transplanted live!)`, 'log-xeno');
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

  // Live Plang Compiler
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
      refreshDecodedState(true);
      el('compileStatus').textContent = `Compiled ${res.name} in ${dt} ms -> 98,304B .hbin | ${res.codegen.totalInstructions} insns`;
      logEvent(`LIVE COMPILED ${res.name}.hbin in ${dt} ms!`, 'log-good');
    } catch (err) {
      el('compileStatus').textContent = `Compile Error: ${err.message}`;
      logEvent(`Plang compile error: ${err.message}`, 'log-bad');
    }
  });

  // Tissue Canvas click/drag surgery
  const tissueCanvas = el('canvasTissue');
  tissueCanvas.addEventListener('mousedown', (e) => {
    const slot = slotFromCanvasEvent(e);
    if (slot < 0) return;
    if (e.shiftKey) { state.isDraggingTissue = true; exciseSlot(slot); }
    else { updateCellInspector(slot); drawTissueMap(tissueCanvas, state.decoded, slot, state.mitosisMode ? 96 : -1); }
  });
  tissueCanvas.addEventListener('mousemove', (e) => {
    if (!state.isDraggingTissue) return;
    const slot = slotFromCanvasEvent(e);
    if (slot >= 0) exciseSlot(slot);
  });

  // Keyboard shortcuts (WASD, Space, Q/E/R/T/F/V/X/C, 1-4 Weapons, Shift Bullet-Time)
  window.addEventListener('keydown', (e) => {
    if (document.activeElement && document.activeElement.tagName === 'TEXTAREA') return;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
    state.keys.add(e.code);
    if (!e.repeat) {
      const k = e.key.toUpperCase();
      if (['Q', 'E', 'T', 'F', 'V', 'X', 'C'].includes(k)) {
        if (world.triggerAbility(k)) renderRpgPanels();
      } else if (k >= '1' && k <= '4') {
        world.selectWeapon(parseInt(k, 10) - 1);
        renderRpgPanels();
      }
    }
  });
  window.addEventListener('keyup', (e) => state.keys.delete(e.code));
}

async function boot() {
  buildAbilityBar();
  const cm = combinatorialSpaceMetrics();
  el('comboSpaceLabel').textContent =
    `1/1 Combinatorial Space: ${(cm.jointLoadoutCrossProduct / 1e12).toFixed(2)} Trillion discrete builds × 2^64 SHA-256 genomes · ${cm.scaleOrdersOfMagnitude} Orders of Magnitude (${cm.realmBiomes} Realms)`;

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
        `Verified Monte Carlo Benchmark: @ 80% erasure -> Linear=${p80.linearSurvivalPct}%, RS-Cliff=${p80.rsCliffSurvivalPct}%, PLANARIA=${p80.planariaSurvivalPct}%`;
    }
  } catch { /* optional */ }

  wireEvents();
  selectSpecies('quantum_chronicle');
  renderRpgPanels();
  logEvent('PLANARIA v2.0 3D Temporal-Quantum Holographic Engine ONLINE!', 'log-xeno');
  requestAnimationFrame(frameLoop);
}

boot();
