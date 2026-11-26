/**
 * PLANARIA v2.2 — Unified 3D Temporal-Quantum Holographic Engine & Surgical Vivisection Controller
 *
 * Simultaneously runs:
 *   1. Real WebGL2 3D Temporal-Quantum Universe (ChronoQuantumWorld + Renderer3D with graceful 2D fallback)
 *   2. Real PLANARIA .hbin codec (192x512B cells, RS(254,238), Cauchy GF(2^8), Depth-8 SHA-256 Merkle)
 *   3. Real Dual PVM-32 VM + Linear Binary Control Twin (LINBIN01)
 *   4. Real Lock-Free 48 kHz 4-Voice AudioWorklet Synthesizer coupled to Bundle 4 (S2_SYNTH_AUDIO)
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
  lastExcisedSlot: -1,
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
  lastGearSignature: '',
  lastNpcSignature: '',
  loopErrorLogged: false,
  reducedMotion: false,
};

const vmPrimary = new PVM32(0x1337c0de);
const vmSecondary = new PVM32(0x1337c0de);
const audio = new PlanariaAudio();
const world = new ChronoQuantumWorld(2026);
let renderer3d = null;

const el = (id) => document.getElementById(id);

function node(tag, { cls = '', text = '', style = null, attrs = null } = {}, children = []) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== '') n.textContent = String(text);
  if (style) Object.assign(n.style, style);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  }
  for (const ch of children) {
    if (typeof ch === 'string') n.appendChild(document.createTextNode(ch));
    else if (ch) n.appendChild(ch);
  }
  return n;
}

function logEvent(msg, cls = '') {
  const box = el('eventLog');
  if (!box) return;
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
  bar.replaceChildren();
  for (const ab of ABILITIES) {
    const btn = node(
      'button',
      {
        cls: 'ab-btn',
        attrs: { id: `ab-${ab.key}`, title: ab.desc, type: 'button', 'aria-label': `${ab.name} (${ab.key})` },
      },
      [
        node('span', { cls: 'ab-key', text: `[${ab.key}]` }),
        node('span', { cls: 'ab-name', text: ab.name }),
        node('span', { cls: 'ab-cd', text: 'READY', attrs: { id: `abcd-${ab.key}` } }),
      ]
    );
    btn.addEventListener('click', () => {
      if (ab.key === 'R') {
        if (!world.hbinState.bootable || world.temporal.snapshotCount <= 1 || world.temporal.chronoEnergy <= 2) {
          logEvent('R · CHRONO REWIND unavailable (organism dead, low chrono energy, or insufficient timeline history).', 'log-warn');
          return;
        }
        state.rewindBurstFrames = 45;
        logEvent('R · CHRONO REWIND: Scrubbing 3D timeline backwards!', 'log-cyan');
      } else {
        const ok = world.triggerAbility(ab.key);
        if (ok) renderRpgPanels(true);
      }
    });
    bar.appendChild(btn);
  }
}

function computeGearSignature() {
  const wSig = world.weapons.map((w, i) => `${i === world.weaponIdx ? '*' : ''}${w.lineageId}:${w.entangledPartner || ''}`).join(',');
  const aSig = world.armors.map((a, i) => `${i === world.armorIdx ? '*' : ''}${a.lineageId}`).join(',');
  const sSig = `${world.skillPoints}|${SKILL_TREE.map((s) => world.skills[s.id] || 0).join(',')}`;
  return `${wSig}||${aSig}||${sSig}`;
}

function computeNpcSignature() {
  return world.npcs
    .slice(0, 12)
    .map((n) => `${n.id}:${Math.max(0, n.hp)}:${n.entangledWith ?? ''}:${n.zenoFreeze > 0.3 ? 1 : 0}:${n.adaptation?.counterTag || ''}`)
    .join(',');
}

function renderRpgPanels(force = false) {
  const gearSig = computeGearSignature();
  const npcSig = computeNpcSignature();

  // Split gear/skill DOM updates from high-frequency NPC HP updates AND preserve keyboard focus!
  if (force || gearSig !== state.lastGearSignature) {
    state.lastGearSignature = gearSig;
    const activeEl = document.activeElement;
    let restoreFocusSelector = null;
    if (activeEl?.dataset?.weaponIdx !== undefined) {
      restoreFocusSelector = `#weaponList [data-weapon-idx="${activeEl.dataset.weaponIdx}"]`;
    } else if (activeEl?.dataset?.armorIdx !== undefined) {
      restoreFocusSelector = `#armorList [data-armor-idx="${activeEl.dataset.armorIdx}"]`;
    } else if (activeEl?.dataset?.skillId !== undefined) {
      restoreFocusSelector = `#skillList [data-skill-id="${activeEl.dataset.skillId}"]`;
    }

    // 1. Weapons (event-delegated click + keyboard handler attached once in wireEvents)
    const wBox = el('weaponList');
    const wFrag = document.createDocumentFragment();
    world.weapons.forEach((w, idx) => {
      const subParts = [
        `DMG ${w.damage} · ${w.fireRate}/s · ×${w.projectileCount} · Tunnel ${Math.round(w.tunnelFactor * 100)}% · #${w.lineageId}`,
        node('br'),
        node('span', { text: w.tMod.tag, style: { color: '#22d3ee' } }),
        ` · ${w.qMod.desc}`,
      ];
      if (w.entangledPartner) {
        subParts.push(
          node('br'),
          node('span', { text: `BELL-ENTANGLED ↔ #${w.entangledPartner}`, style: { color: '#e879f9' } })
        );
      }
      const card = node(
        'div',
        {
          cls: `item-card ${idx === world.weaponIdx ? 'equipped' : ''}`,
          attrs: { 'data-weapon-idx': idx, role: 'button', tabindex: '0', 'aria-pressed': idx === world.weaponIdx ? 'true' : 'false' },
        },
        [
          node('div', {
            cls: 'item-title',
            text: `[${idx + 1}] ${w.rarity.name} · ${w.name}`,
            style: { color: w.rarity.color },
          }),
          node('div', { cls: 'item-sub' }, subParts),
        ]
      );
      wFrag.appendChild(card);
    });
    wBox.replaceChildren(wFrag);

    // 2. Armors (event-delegated)
    const aBox = el('armorList');
    const aFrag = document.createDocumentFragment();
    world.armors.forEach((a, idx) => {
      const card = node(
        'div',
        {
          cls: `item-card ${idx === world.armorIdx ? 'equipped' : ''}`,
          attrs: { 'data-armor-idx': idx, role: 'button', tabindex: '0', 'aria-pressed': idx === world.armorIdx ? 'true' : 'false' },
        },
        [
          node('div', {
            cls: 'item-title',
            text: `${a.rarity.name} · ${a.name}`,
            style: { color: a.rarity.color },
          }),
          node('div', { cls: 'item-sub' }, [
            `SHIELD ${a.maxShield} · Regen +${a.regenRate}/s · Dodge ${Math.round(a.phaseDodge * 100)}% · #${a.lineageId}`,
            node('br'),
            a.layer.desc,
          ]),
        ]
      );
      aFrag.appendChild(card);
    });
    aBox.replaceChildren(aFrag);

    // 3. Adaptive 4-Branch Skill Tree (event-delegated)
    el('spBadge').textContent = `${world.skillPoints} SP`;
    const sBox = el('skillList');
    const sFrag = document.createDocumentFragment();
    for (const sk of SKILL_TREE) {
      const lvl = world.skills[sk.id] || 0;
      const card = node(
        'div',
        {
          cls: `item-card ${lvl > 0 ? 'equipped' : ''}`,
          attrs: { 'data-skill-id': sk.id, role: 'button', tabindex: '0' },
        },
        [
          node(
            'div',
            { cls: 'item-title', style: { display: 'flex', justifyContent: 'space-between' } },
            [
              node('span', {}, [
                node('span', { text: `[${sk.branch.slice(0, 4)}]`, style: { color: 'var(--cyan)', fontSize: '10px' } }),
                ` ${sk.name}`,
              ]),
              node('span', { cls: 'skill-rank', text: `Lv.${lvl}/${sk.maxLvl}` }),
            ]
          ),
          node('div', { cls: 'item-sub', text: sk.desc }),
        ]
      );
      sFrag.appendChild(card);
    }
    sBox.replaceChildren(sFrag);
    if (restoreFocusSelector) {
      document.querySelector(restoreFocusSelector)?.focus();
    }
  }

  if (force || npcSig !== state.lastNpcSignature) {
    state.lastNpcSignature = npcSig;
    // 4. Live Adaptive 1/1 NPC Roster
    const nBox = el('npcList');
    const nFrag = document.createDocumentFragment();
    for (const n of world.npcs.slice(0, 12)) {
      const pct = Math.max(0, Math.round((n.hp / Math.max(1, n.maxHp)) * 100));
      const subParts = [
        `HP ${Math.max(0, n.hp)}/${n.maxHp} (${pct}%) · #${n.lineageId}`,
        node('br'),
        'Temporal: ',
        node('span', { text: n.temporalAffix, style: { color: '#fbbf24' } }),
        ' · Adapt: ',
        node('span', { text: n.adaptation?.counterTag || 'BASE', style: { color: '#10f5a8' } }),
      ];
      if (n.entangledWith !== null) {
        subParts.push(' · ', node('span', { text: 'BELL-LINKED', style: { color: '#e879f9' } }));
      }
      if (n.zenoFreeze > 0.3) {
        subParts.push(' · ', node('span', { text: 'ZENO-FROZEN', style: { color: '#22d3ee' } }));
      }
      const card = node(
        'div',
        { cls: 'item-card', style: { borderColor: n.isBoss ? '#f43f5e' : '#1b2c40' } },
        [
          node('div', {
            cls: 'item-title',
            text: `${n.isBoss ? '★ BOSS · ' : ''}${n.name}`,
            style: { color: n.isBoss ? '#fda4af' : (n.rarity?.color || '#e2e8f0') },
          }),
          node('div', { cls: 'item-sub' }, subParts),
        ]
      );
      nFrag.appendChild(card);
    }
    nBox.replaceChildren(nFrag);
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
  if (bId === 6) {
    box.textContent =
      `; ${bun.name} (${bun.source}) · ${bun.data.length}B · rank ${bun.cellsFound}/${bun.k}\n` +
      (state.decoded.genome
        ? JSON.stringify(state.decoded.genome, null, 2)
        : new TextDecoder().decode(bun.data).replace(/\0+$/, ''));
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
    box.replaceChildren(
      node('strong', { text: `CELL SLOT #${slot}` }),
      node('br'),
      node('span', { text: 'TRUNCATED OUT OF BOUNDS', style: { color: '#fda4af' } })
    );
    return;
  }
  const st = entry ? entry.status : 'NECROTIC';
  const col = st === 'INTACT' ? '#10f5a8' : st === 'REPAIRED' ? '#fbbf24' : st === 'XENOGRAFT' ? '#e879f9' : '#f43f5e';
  box.replaceChildren(
    node('strong', { text: `CELL SLOT #${slot}` }),
    ' · ',
    node('span', { text: st, style: { color: col, fontWeight: '700' } }),
    node('br'),
    'Offset: ',
    node('code', { text: String(off) }),
    ' | Sync: ',
    node('code', { text: `0x${info.syncHex}` }),
    ` (err ${info.syncBitErrors}/3)`,
    node('br'),
    'RS(254,238): ',
    node('code', { text: info.rsOk ? `OK (${info.rsErrorsFixed}B healed)` : String(info.rsReason) }),
    node('br'),
    'Bundle: ',
    node('code', { text: String(info.bundleName) }),
    ` (S${info.header.stratum} · ${info.organName})`,
    node('br'),
    'Cauchy x_i=',
    node('code', { text: String(info.header.evalX) }),
    ' · k/n=',
    node('code', { text: `${info.header.k}/${info.header.n}` }),
    ' · ABI ',
    node('code', { text: `0x${info.header.abiSig.toString(16)}` }),
    node('br'),
    'Root: ',
    node('code', { text: info.impliedRootHex || 'NONE' }),
    node('br'),
    'Payload: ',
    node('code', { text: `${info.payloadPreviewHex.slice(0, 32)}...` })
  );
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
      disableImmuneSystem: !state.immuneEnabled,
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
      vmSecondary._drawText(8, 88, (state.linearDecoded.fault || 'FAULT').slice(0, 24), 0xff24bffb);
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

  const hpPct = Math.round(Math.max(0, Math.min(100, (pl.hp / Math.max(1, pl.maxHp)) * 100)));
  const shPct = Math.round(Math.max(0, Math.min(100, (pl.shield / Math.max(1, pl.maxShield)) * 100)));
  const chPct = Math.round(Math.max(0, Math.min(100, world.temporal.chronoEnergy)));
  const coPct = Math.round(Math.max(0, Math.min(100, world.qReg.coherence * 100)));
  el('barHp').style.width = `${hpPct}%`;
  el('trackHp')?.setAttribute('aria-valuenow', String(hpPct));
  el('valHp').textContent = String(Math.round(pl.hp));
  el('barShield').style.width = `${shPct}%`;
  el('trackShield')?.setAttribute('aria-valuenow', String(shPct));
  el('valShield').textContent = String(Math.round(pl.shield));
  el('trackHp')?.setAttribute('aria-valuetext', `${Math.round(pl.hp)} / ${pl.maxHp} HP`);
  el('trackShield')?.setAttribute('aria-valuetext', `${Math.round(pl.shield)} / ${pl.maxShield} Shield`);
  el('barChrono').style.width = `${chPct}%`;
  el('trackChrono')?.setAttribute('aria-valuenow', String(chPct));
  el('trackChrono')?.setAttribute('aria-valuetext', `${Math.round(world.temporal.chronoEnergy)} / 100 Chrono Energy`);
  el('valChrono').textContent = String(Math.round(world.temporal.chronoEnergy));
  el('barCoh').style.width = `${coPct}%`;
  el('trackCoh')?.setAttribute('aria-valuenow', String(coPct));
  el('trackCoh')?.setAttribute('aria-valuetext', `${coPct}% Quantum Coherence`);
  el('valCoh').textContent = `${coPct}%`;

  const absS = Math.abs(world.chshValue);
  const absM = Math.abs(world.merminValue || 0);
  if (absM > 2.005) {
    el('hudChsh').textContent = `CHSH |S|=${absS.toFixed(2)} · GHZ |M₄|=${absM.toFixed(2)} (NON-LOCAL!)`;
  } else {
    el('hudChsh').textContent = `CHSH |S| = ${absS.toFixed(2)} ${absS > 2.005 ? '(BELL VIOLATION!)' : '(CLASSICAL)'}`;
  }
  el('hudWaveRidge').textContent = `WAVE |ψ|² = ${world.waveIntensityAtPlayer.toFixed(2)} ${world.waveIntensityAtPlayer > 1.35 ? '· CONSTRUCTIVE 2.2x!' : '· FIELD'}`;
  el('hudScore').textContent = `SCORE ${world.score} · KILLS ${world.kills} · SP ${world.skillPoints}`;
  el('hudEchoes').textContent = `ECHOES ${world.temporal.echoClones.length} · WELLS ${world.temporal.chronoWells.length} · PARADOX ${world.temporal.paradoxCount}`;

  const w = world.equippedWeapon;
  const a = world.equippedArmor;
  el('hudEquipped').replaceChildren(
    node('span', { text: `[${world.weaponIdx + 1}] ${w.shortName}`, style: { color: w.rarity.color, fontWeight: '700' } }),
    ` (${w.qMod.id}/${w.tMod.tag}) · `,
    node('span', { text: a.shortName, style: { color: a.rarity.color } })
  );

  el('statEntropy').textContent = `${world.qReg.basisEntropy().toFixed(2)} b`;
  el('statLatency').textContent = `${state.lastDecodeMs.toFixed(1)}ms · ${world.npcs.length} NPC`;

  const mb = el('modeBadge');
  const effClock = world.temporal.globalTimeScale;
  if (world.temporal.rewinding) {
    mb.textContent = '◀◀ REWINDING TIME';
    mb.className = 'badge badge-s1';
  } else if (effClock < 0.5) {
    mb.textContent = `BULLET-TIME ${effClock.toFixed(2)}x`;
    mb.className = 'badge badge-s0';
  } else {
    mb.textContent = `CLOCK ${effClock.toFixed(2)}x`;
    mb.className = 'badge badge-s2';
  }
  const timeSlider = el('sliderTime');
  if (timeSlider && document.activeElement !== timeSlider) {
    const pctVal = Math.max(15, Math.min(250, Math.round(effClock * 100)));
    if (Math.abs(Number(timeSlider.value) - pctVal) >= 2) {
      timeSlider.value = String(pctVal);
      el('timeLabel').textContent = `${effClock.toFixed(2)}x · ${effClock < 0.6 ? 'Time Dilation' : effClock > 1.3 ? 'Hyper-Chronon' : 'Real-Time'}`;
    }
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
  try {
    const dt = Math.max(0, Math.min(0.05, (now - lastTime) / 1000));
    lastTime = now;
    state.tick++;

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

    let fwd = 0, right = 0;
    if (state.keys.has('KeyW') || state.keys.has('ArrowUp')) fwd += 1;
    if (state.keys.has('KeyS') || state.keys.has('ArrowDown')) fwd -= 1;
    if (state.keys.has('KeyD') || state.keys.has('ArrowRight')) right += 1;
    if (state.keys.has('KeyA') || state.keys.has('ArrowLeft')) right -= 1;

    const yaw = renderer3d ? renderer3d.camYaw : 0.45;
    const sy = Math.sin(yaw);
    const cy = Math.cos(yaw);
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
      pvmVoices: vmPrimary.voices,
    });

    if (renderer3d) {
      // Keyboard 3D orbit & zoom accessibility shortcuts (J/L/I/K and +/-)
      if (state.keys.has('KeyJ')) renderer3d.camYaw += 1.6 * dt;
      if (state.keys.has('KeyL')) renderer3d.camYaw -= 1.6 * dt;
      if (state.keys.has('KeyI')) renderer3d.camPitch = Math.max(0.14, renderer3d.camPitch - 1.1 * dt);
      if (state.keys.has('KeyK')) renderer3d.camPitch = Math.min(1.42, renderer3d.camPitch + 1.1 * dt);
      if (state.keys.has('Equal') || state.keys.has('NumpadAdd')) renderer3d.camDist = Math.max(11, renderer3d.camDist - 22 * dt);
      if (state.keys.has('Minus') || state.keys.has('NumpadSubtract')) renderer3d.camDist = Math.min(64, renderer3d.camDist + 22 * dt);
      renderer3d.render(world, state.decoded);
    }

    // Only blit 2D CRT canvases when Tab 2 is visible (saves redundant putImageData per frame)
    if (el('tab-crt')?.classList.contains('active')) {
      imgPrimary.data.set(vmPrimary.fbBytes);
      ctxPrimary.putImageData(imgPrimary, 0, 0);
      imgSecondary.data.set(vmSecondary.fbBytes);
      ctxSecondary.putImageData(imgSecondary, 0, 0);
    }

    // Dirty-check AudioWorklet voice payload before structured-clone postMessage
    const vSig = world.liveVoices.map((v) => `${v.wave}:${Math.round(v.freqHz * 4)}:${Math.round(v.vol * 100)}:${v.detune}:${v.filter}`).join('|');
    if (vSig !== state.lastVoiceSig) {
      state.lastVoiceSig = vSig;
      audio.pushVoices(world.liveVoices);
    }

    if (state.tick % 4 === 0) {
      el('primaryFps').textContent = `${r1.insns} insns/f · traps:${vmPrimary.traps}`;
      updateLive3DHud();
      if (el('tab-vascular')?.classList.contains('active')) {
        drawAnastomosisGraph(el('canvasVascular'), state.decoded, vmPrimary.lastFrameRoutes, state.tick);
      }
    }
    if (state.tick % 24 === 0) {
      renderRpgPanels(false);
    }
    state.loopErrorLogged = false;
  } catch (err) {
    if (!state.loopErrorLogged) {
      state.loopErrorLogged = true;
      logEvent(`Frame loop warning: ${err.message}`, 'log-bad');
    }
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
  if (rect.width <= 0 || rect.height <= 0) return -1;
  const logicalW = m.logicalWidth || canvas.width;
  const logicalH = m.logicalHeight || canvas.height;
  const x = ((evt.clientX - rect.left) / rect.width) * logicalW;
  const y = ((evt.clientY - rect.top) / rect.height) * logicalH;
  const col = Math.floor((x - m.padX) / m.cellW);
  const row = Math.floor((y - m.padY) / m.cellH);
  if (col < 0 || col >= m.cols || row < 0 || row >= m.rows) return -1;
  return row * m.cols + col;
}

function exciseSlot(slot) {
  if (slot < 0 || slot >= TOTAL_CELLS || !state.currentBytes) return;
  const entry = state.decoded?.slotMap?.[slot];
  const off = entry ? entry.byteOffset : slot * CELL_SIZE;
  if (off + CELL_SIZE <= state.currentBytes.length) {
    for (let i = 0; i < CELL_SIZE; i++) state.currentBytes[off + i] = (i * 73) & 0xff;
  }
  const linOff = slot * CELL_SIZE;
  if (!state.mitosisMode && state.currentLinearBytes && linOff + CELL_SIZE <= state.currentLinearBytes.length) {
    for (let i = 0; i < CELL_SIZE; i++) state.currentLinearBytes[linOff + i] = (i * 73) & 0xff;
  }
  refreshDecodedState(false);
}

function isEditableTarget(target) {
  if (!target) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || Boolean(target.isContentEditable);
}

function isInteractiveActivationTarget(target) {
  if (!target || typeof target.closest !== 'function') return false;
  return Boolean(target.closest('button, a, [role="button"], [role="tab"]'));
}

function activateTab(btn, moveFocus = false) {
  const tabs = Array.from(document.querySelectorAll('.tab-btn'));
  tabs.forEach((b) => {
    const active = b === btn;
    b.classList.toggle('active', active);
    b.setAttribute('aria-selected', active ? 'true' : 'false');
    b.setAttribute('tabindex', active ? '0' : '-1');
  });
  document.querySelectorAll('.tab-pane').forEach((p) => p.classList.remove('active'));
  el(`tab-${btn.dataset.tab}`)?.classList.add('active');
  if (moveFocus) btn.focus();
}

function applyReducedMotion(enabled, quiet = false) {
  state.reducedMotion = Boolean(enabled);
  world.reducedMotion = state.reducedMotion;
  document.documentElement.classList.toggle('reduced-motion', state.reducedMotion);
  const btn = el('btnMotion');
  if (btn) {
    btn.textContent = state.reducedMotion ? 'Motion: REDUCED' : 'Motion: FULL';
    btn.classList.toggle('active', state.reducedMotion);
    btn.setAttribute('aria-pressed', state.reducedMotion ? 'true' : 'false');
  }
  if (state.reducedMotion && world.autopilot) {
    world.autopilot = false;
    const autoBtn = el('btnAuto');
    if (autoBtn) {
      autoBtn.textContent = 'Autopilot: OFF';
      autoBtn.classList.remove('active');
      autoBtn.setAttribute('aria-pressed', 'false');
    }
  }
  if (!quiet) {
    logEvent(state.reducedMotion ? 'Reduced Motion mode enabled (autopilot paused, particle bursts dampened).' : 'Full Motion mode restored.', 'log-cyan');
  }
}

function wireEvents() {
  // 3D Orbit & Zoom controls on WebGL2 viewport (Pointer Events with single-pointer lock)
  const wrap3d = el('viewport3dWrap');
  wrap3d.addEventListener('pointerdown', (e) => {
    if (!renderer3d || e.button > 0 || state.isDragging3D) return;
    state.isDragging3D = true;
    state.dragPointerId = e.pointerId;
    state.lastMouseX = e.clientX;
    state.lastMouseY = e.clientY;
    try { wrap3d.setPointerCapture(e.pointerId); } catch { /* ignore */ }
  });
  wrap3d.addEventListener('pointermove', (e) => {
    if (state.isDragging3D && e.pointerId === state.dragPointerId && renderer3d) {
      const dx = e.clientX - state.lastMouseX;
      const dy = e.clientY - state.lastMouseY;
      state.lastMouseX = e.clientX;
      state.lastMouseY = e.clientY;
      renderer3d.camYaw -= dx * 0.0075;
      renderer3d.camPitch = Math.max(0.14, Math.min(1.42, renderer3d.camPitch + dy * 0.006));
    }
  });
  const endPointerDrag = (e) => {
    if (e && state.dragPointerId !== undefined && e.pointerId !== undefined && e.pointerId !== state.dragPointerId && state.isDragging3D) {
      return;
    }
    state.isDragging3D = false;
    state.dragPointerId = undefined;
    state.isDraggingTissue = false;
    state.lastExcisedSlot = -1;
  };
  const clearPointerAndKeys = () => {
    state.isDragging3D = false;
    state.dragPointerId = undefined;
    state.isDraggingTissue = false;
    state.lastExcisedSlot = -1;
    state.keys.clear();
  };
  wrap3d.addEventListener('pointerup', endPointerDrag);
  wrap3d.addEventListener('pointercancel', endPointerDrag);
  window.addEventListener('pointerup', endPointerDrag);
  window.addEventListener('blur', clearPointerAndKeys);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearPointerAndKeys();
  });
  window.addEventListener('pagehide', (e) => {
    if (e.persisted) {
      audio.mute();
    } else {
      renderer3d?.dispose();
      audio.dispose();
    }
  });
  wrap3d.addEventListener('wheel', (e) => {
    if (!renderer3d) return;
    e.preventDefault();
    renderer3d.camDist = Math.max(11, Math.min(64, renderer3d.camDist + e.deltaY * 0.025));
  }, { passive: false });

  // Event-delegated RPG panel interactions (click + Enter/Space keyboard activation!)
  const activateWeaponCard = (target) => {
    const card = target.closest('[data-weapon-idx]');
    if (!card) return;
    world.selectWeapon(parseInt(card.dataset.weaponIdx, 10));
    renderRpgPanels(true);
  };
  const activateArmorCard = (target) => {
    const card = target.closest('[data-armor-idx]');
    if (!card) return;
    world.selectArmor(parseInt(card.dataset.armorIdx, 10));
    renderRpgPanels(true);
  };
  const activateSkillCard = (target) => {
    const card = target.closest('[data-skill-id]');
    if (!card) return;
    if (world.upgradeSkill(card.dataset.skillId)) {
      renderRpgPanels(true);
    }
  };
  const bindCardEvents = (boxId, activateFn) => {
    const box = el(boxId);
    box.addEventListener('click', (e) => activateFn(e.target));
    box.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activateFn(e.target);
      }
    });
  };
  bindCardEvents('weaponList', activateWeaponCard);
  bindCardEvents('armorList', activateArmorCard);
  bindCardEvents('skillList', activateSkillCard);

  // Heisenberg Uncertainty Slider
  el('sliderHeisen').addEventListener('input', (e) => {
    const s = parseInt(e.target.value, 10) / 100;
    world.player.heisenbergStance = s;
    const h = heisenbergStance(s);
    const mode = s < 0.35 ? 'POSITION-LOCK' : s > 0.65 ? 'MOMENTUM-BLUR' : 'BALANCED';
    const label = `${mode} · ${h.critMultiplier.toFixed(2)}x Crit · ${Math.round(h.evasionChance * 100)}% Dodge`;
    el('heisenLabel').textContent = label;
    e.target.setAttribute('aria-valuetext', label);
  });

  // Temporal Clock Slider
  el('sliderTime').addEventListener('input', (e) => {
    const v = parseInt(e.target.value, 10) / 100;
    state.customTimeScale = Math.abs(v - 1.0) > 0.03;
    world.temporal.globalTimeScale = v;
    const label = `${v.toFixed(2)}x · ${v < 0.6 ? 'Time Dilation' : v > 1.3 ? 'Hyper-Chronon' : 'Real-Time'}`;
    el('timeLabel').textContent = label;
    e.target.setAttribute('aria-valuetext', label);
  });

  el('btnRewindHold').addEventListener('click', () => {
    if (!world.hbinState.bootable || world.temporal.snapshotCount <= 1 || world.temporal.chronoEnergy <= 2) {
      logEvent('REWIND PULSE unavailable (organism dead, low chrono energy, or insufficient recorded frames).', 'log-warn');
      return;
    }
    state.rewindBurstFrames = 55;
    logEvent('REWIND PULSE: Scrubbing 3D world 1s backwards in time!', 'log-cyan');
  });

  el('btnOrderNext').addEventListener('click', () => world.triggerAbility('X'));
  el('btnNextStage').addEventListener('click', () => { world.advanceStage(); renderRpgPanels(true); });
  el('btnForgeLoot').addEventListener('click', () => { world.forgeNewGear(2); renderRpgPanels(true); });
  el('btnEntangleWpns').addEventListener('click', () => { world.entangleWeapons(0, 1); renderRpgPanels(true); });

  el('speciesSelect').addEventListener('change', (e) => selectSpecies(e.target.value));
  el('btnAudio').addEventListener('click', async () => {
    const btn = el('btnAudio');
    btn.disabled = true;
    try {
      const on = await audio.toggle();
      btn.textContent = `48kHz Audio: ${on ? 'ON' : 'OFF'}`;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      logEvent(on ? '48 kHz Lock-Free AudioWorklet Synth ONLINE.' : '48 kHz AudioWorklet Synth muted.', 'log-cyan');
    } catch (err) {
      btn.textContent = '48kHz Audio: OFF';
      btn.classList.remove('active');
      btn.setAttribute('aria-pressed', 'false');
      logEvent(`AudioWorklet error: ${err.message}`, 'log-bad');
    } finally {
      btn.disabled = false;
    }
  });
  el('btnAuto').addEventListener('click', () => {
    world.autopilot = !world.autopilot;
    const btn = el('btnAuto');
    btn.textContent = `Autopilot: ${world.autopilot ? 'ON' : 'OFF'}`;
    btn.classList.toggle('active', world.autopilot);
    btn.setAttribute('aria-pressed', world.autopilot ? 'true' : 'false');
  });
  el('btnMotion')?.addEventListener('click', () => applyReducedMotion(!state.reducedMotion, false));
  el('btnRestore').addEventListener('click', () => selectSpecies(state.species));
  el('btnDownload').addEventListener('click', () => {
    if (!state.currentBytes) return;
    const blob = new Blob([state.currentBytes], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.species}_${state.decoded?.xenografts?.length ? 'chimera' : 'live'}.hbin`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    logEvent(`Exported ${state.currentBytes.length}B raw .hbin binary.`, 'log-good');
  });

  // 1. Laser Bisect (50/50 Planarian Mitosis!)
  el('btnMitosis').addEventListener('click', () => {
    const cut = 49177;
    const pristine = state.pristine[state.species];
    const { left, right } = bisectBinary(pristine.bytes, cut);
    state.mitosisMode = true;
    state.allowXenograft = false;
    state.pinnedRootHex = pristine.lineageRootHex;
    state.shardLeftBytes = left;
    state.shardRightBytes = right;
    state.currentBytes = new Uint8Array(left);
    refreshDecodedState(false, true);
    if (state.immuneEnabled && state.decoded.canFullRegenerate && state.decodedRight.canFullRegenerate) {
      const regL = regenerateHbin(state.decoded);
      const regR = regenerateHbin(state.decodedRight);
      const exact = regL.sha256Hex === pristine.sha256Hex && regR.sha256Hex === pristine.sha256Hex;
      logEvent(`MITOSIS BISECT @ byte ${cut}: ZERO overlap! Both halves S3 ALIVE & SHA-256 bit-exact=${exact} (${regL.sha256Hex.slice(0, 12)})`, 'log-cyan');
    } else {
      logEvent(`MITOSIS BISECT @ byte ${cut}: Both halves decoded (enable Immune ON for verified regeneration).`, 'log-warn');
    }
  });

  el('btnHeal').addEventListener('click', () => {
    if (!state.immuneEnabled) {
      logEvent('Regeneration blocked while Immune System is OFF — re-enable Merkle Immune first!', 'log-bad');
      return;
    }
    if (!state.decoded?.canFullRegenerate) {
      logEvent('Below full Cauchy threshold k — use Trisect+cat or Restore.', 'log-bad');
      return;
    }
    try {
      const healed = regenerateHbin(state.decoded);
      state.currentBytes = new Uint8Array(healed.bytes);
      state.mitosisMode = false;
      state.allowXenograft = false;
      state.pinnedRootHex = healed.lineageRootHex;
      refreshDecodedState(false);
      logEvent(`REGENERATED 98,304B pristine .hbin! SHA-256=${healed.sha256Hex.slice(0, 16)}`, 'log-good');
    } catch (err) {
      logEvent(`Regeneration failed: ${err.message}`, 'log-bad');
    }
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
    state.allowXenograft = false;
    const pristine = state.pristine[state.species];
    state.pinnedRootHex = pristine.lineageRootHex;
    const parts = splitBinary(pristine.bytes, 3);
    state.currentBytes = concatShards(parts[0], parts[2], 97, ++state.seedCounter);
    const linParts = splitBinary(state.linearPristine[state.species].bytes, 3);
    state.currentLinearBytes = concatShards(linParts[0], linParts[2], 97, state.seedCounter);
    refreshDecodedState(false);
    logEvent(`TRISECT + cat(A+C): Super-additive healing jumped back to Stratum S${state.decoded.maxViableStratum}; Linear Twin CRASHED.`, 'log-cyan');
  });

  // 2. Shredders (Reset pinnedRootHex to pristine species so post-Chimera shredding never mismatches!)
  document.querySelectorAll('[data-shred]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.mitosisMode = false;
      state.allowXenograft = false;
      const drop = parseFloat(btn.dataset.shred);
      const seed = ++state.seedCounter;
      const pristine = state.pristine[state.species];
      const baseP = pristine.bytes;
      const baseL = state.linearPristine[state.species].bytes;
      state.pinnedRootHex = pristine.lineageRootHex;
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
      state.allowXenograft = false;
      const errCnt = parseInt(btn.dataset.rad, 10);
      const burst = btn.dataset.burst === '1';
      const seed = ++state.seedCounter;
      const pristine = state.pristine[state.species];
      state.pinnedRootHex = pristine.lineageRootHex;
      state.currentBytes = irradiateCells(pristine.bytes, errCnt, seed, burst).bytes;
      state.currentLinearBytes = irradiateCells(state.linearPristine[state.species].bytes, errCnt, seed, burst).bytes;
      refreshDecodedState(false);
      world.syncHbinState(state.decoded, { mitosisActive: false, radiationTriggered: true });
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
    const btn = el('btnToggleImmune');
    btn.textContent = state.immuneEnabled ? 'Immune: ON (Safe)' : 'Immune: OFF (Unsafe!)';
    btn.className = state.immuneEnabled ? 'btn-emerald' : 'btn-crimson';
    btn.setAttribute('aria-pressed', state.immuneEnabled ? 'true' : 'false');
    refreshDecodedState(false);
  });

  // 5. Targeted Organ Scalpel
  document.querySelectorAll('[data-amp]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.mitosisMode = false;
      const ids = btn.dataset.amp.split(',').map((s) => parseInt(s, 10));
      const seed = ++state.seedCounter;
      state.currentBytes = amputateBundles(state.currentBytes, ids, true, seed).bytes;
      if (state.currentLinearBytes) {
        state.currentLinearBytes = shredCells(state.currentLinearBytes, 0.15, seed, false).bytes;
      }
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
    if (state.linearPristine[state.species] && state.linearPristine[donorName]) {
      const ampLin = shredCells(state.linearPristine[state.species].bytes, 0.25, state.seedCounter, false).bytes;
      state.currentLinearBytes = concatShards(ampLin, state.linearPristine[donorName].bytes, 53, state.seedCounter);
    }
    state.pinnedRootHex = hostPristine.lineageRootHex;
    refreshDecodedState(false);
    logEvent(`3D XENOGRAFT CHIMERA FORGED! ${hostPristine.name} × ${donorPristine.name} (${state.decoded.xenografts.length} organs transplanted live!)`, 'log-xeno');
  });

  // Full WAI-ARIA Tabs with roving tabindex & Arrow/Home/End keyboard navigation (stops propagation so 3D player doesn't move!)
  const tabBtns = Array.from(document.querySelectorAll('.tab-btn'));
  tabBtns.forEach((btn, idx) => {
    btn.addEventListener('click', () => activateTab(btn, false));
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); e.stopPropagation(); activateTab(tabBtns[(idx + 1) % tabBtns.length], true); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); e.stopPropagation(); activateTab(tabBtns[(idx - 1 + tabBtns.length) % tabBtns.length], true); }
      else if (e.key === 'Home') { e.preventDefault(); e.stopPropagation(); activateTab(tabBtns[0], true); }
      else if (e.key === 'End') { e.preventDefault(); e.stopPropagation(); activateTab(tabBtns[tabBtns.length - 1], true); }
    });
  });
  el('disasmBundle').addEventListener('change', updateDisassembly);

  // Live Plang Compiler (cleanly resets mitosis & xenograft modes)
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
      state.shardLeftBytes = null;
      state.shardRightBytes = null;
      refreshDecodedState(true);
      el('compileStatus').textContent = `Compiled ${res.name} in ${dt} ms -> 98,304B .hbin | ${res.codegen.totalInstructions} insns`;
      logEvent(`LIVE COMPILED ${res.name}.hbin in ${dt} ms!`, 'log-good');
    } catch (err) {
      el('compileStatus').textContent = `Compile Error: ${err.message}`;
      logEvent(`Plang compile error: ${err.message}`, 'log-bad');
    }
  });

  // Tissue Canvas click/drag surgery (Pointer Events + deduplicated per-slot on drag)
  const tissueCanvas = el('canvasTissue');
  tissueCanvas.addEventListener('pointerdown', (e) => {
    const slot = slotFromCanvasEvent(e);
    if (slot < 0) return;
    if (e.shiftKey) {
      state.isDraggingTissue = true;
      state.lastExcisedSlot = slot;
      try { tissueCanvas.setPointerCapture(e.pointerId); } catch { /* ignore */ }
      exciseSlot(slot);
    } else {
      updateCellInspector(slot);
      drawTissueMap(tissueCanvas, state.decoded, slot, state.mitosisMode ? 96 : -1);
    }
  });
  tissueCanvas.addEventListener('pointermove', (e) => {
    if (!state.isDraggingTissue) return;
    const slot = slotFromCanvasEvent(e);
    if (slot >= 0 && slot !== state.lastExcisedSlot) {
      state.lastExcisedSlot = slot;
      exciseSlot(slot);
    }
  });
  tissueCanvas.addEventListener('pointerup', endPointerDrag);
  tissueCanvas.addEventListener('pointercancel', endPointerDrag);
  // Keyboard accessibility for 192-Cell Tissue Surgery Map (Arrow keys inspect, Delete/Backspace excises)
  state.kbdTissueSlot = 0;
  tissueCanvas.addEventListener('keydown', (e) => {
    const cols = 24;
    let next = state.kbdTissueSlot;
    if (e.key === 'ArrowRight') next = Math.min(191, next + 1);
    else if (e.key === 'ArrowLeft') next = Math.max(0, next - 1);
    else if (e.key === 'ArrowDown') next = Math.min(191, next + cols);
    else if (e.key === 'ArrowUp') next = Math.max(0, next - cols);
    else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      e.stopPropagation();
      exciseSlot(state.kbdTissueSlot);
      return;
    } else {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    state.kbdTissueSlot = next;
    updateCellInspector(next);
    drawTissueMap(tissueCanvas, state.decoded, next, state.mitosisMode ? 96 : -1);
  });

  // Physical-code keyboard shortcuts (works under Shift bullet-time & non-Latin layouts; never hijacks focused tabs/buttons!)
  const ABILITY_BY_CODE = {
    KeyQ: 'Q', KeyE: 'E', KeyT: 'T', KeyF: 'F', KeyV: 'V', KeyX: 'X', KeyC: 'C',
  };
  const WEAPON_BY_CODE = {
    Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3,
  };
  window.addEventListener('keydown', (e) => {
    if (isEditableTarget(e.target) || isEditableTarget(document.activeElement)) return;
    if (e.target?.closest?.('[role="tab"], [role="tablist"]') && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.code === 'Space' && isInteractiveActivationTarget(document.activeElement)) return;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
    state.keys.add(e.code);
    if (!e.repeat) {
      if (ABILITY_BY_CODE[e.code]) {
        if (world.triggerAbility(ABILITY_BY_CODE[e.code])) renderRpgPanels(true);
      } else if (WEAPON_BY_CODE[e.code] !== undefined) {
        world.selectWeapon(WEAPON_BY_CODE[e.code]);
        renderRpgPanels(true);
      }
    }
  });
  window.addEventListener('keyup', (e) => state.keys.delete(e.code));
}

async function boot() {
  buildAbilityBar();

  const fallbackEl = el('webglFallback');
  try {
    renderer3d = new Renderer3D(el('canvas3d'));
    renderer3d.onContextStateChange = (lost) => {
      if (fallbackEl) fallbackEl.hidden = !lost;
      logEvent(lost ? 'WebGL2 context lost — displaying 2D fallback notice.' : 'WebGL2 context restored!', lost ? 'log-warn' : 'log-good');
    };
  } catch (err) {
    renderer3d = null;
    if (fallbackEl) fallbackEl.hidden = false;
    logEvent(`WebGL2 unavailable (${err.message}); continuing in 2D Dual-Patient PVM-32 mode.`, 'log-warn');
  }

  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    applyReducedMotion(true, true);
  }

  const cm = combinatorialSpaceMetrics();
  el('comboSpaceLabel').textContent =
    `1/1 Combinatorial Space: ${(cm.jointLoadoutCrossProduct / 1e12).toFixed(2)} Trillion discrete builds × 2^64 SHA-256 lineages · ${cm.scaleOrdersOfMagnitude} Orders of Magnitude (${cm.realmBiomes} Realms)`;

  // Resolve asset URLs relative to import.meta.url so Studio works identically on localhost AND GitHub Pages subpaths!
  for (const name of SPECIES_LIST) {
    const progUrl = new URL(`../../programs/${name}.plang`, import.meta.url);
    const resp = await fetch(progUrl);
    if (!resp.ok) {
      throw new Error(`Failed to load ${progUrl.pathname} (HTTP ${resp.status})`);
    }
    const src = await resp.text();
    state.sources[name] = src;
    const comp = compilePlangToHbin(src);
    state.pristine[name] = comp;
    state.linearPristine[name] = encodeLinearBinary(comp.rawBundles, comp.name);
  }

  try {
    const benchUrl = new URL('../../results/benchmarks.json', import.meta.url);
    const bResp = await fetch(benchUrl);
    if (bResp.ok) {
      state.benchmarks = await bResp.json();
      const p80 = state.benchmarks.survivalCurve?.find((x) => x.dropPct === 80);
      if (p80) {
        const flatPart = Number.isFinite(p80.rsEqualStorageSurvivalPct) ? `, RS(192,48)-Flat=${p80.rsEqualStorageSurvivalPct}%` : '';
        el('benchSummary').textContent =
          `Verified Monte Carlo Benchmark: @ 80% erasure -> Linear=${p80.linearSurvivalPct}%, RS(40,16)=${p80.rsCliffSurvivalPct}%${flatPart}, PLANARIA=${p80.planariaSurvivalPct}%`;
      }
    }
  } catch { /* optional */ }

  wireEvents();
  selectSpecies('quantum_chronicle');
  renderRpgPanels(true);
  logEvent('PLANARIA v2.3 3D Temporal-Quantum Holographic Engine ONLINE!', 'log-xeno');
  requestAnimationFrame(frameLoop);
}

boot().catch((err) => {
  console.error('[PLANARIA BOOT ERROR]', err);
  logEvent(`Boot failure: ${err.message}`, 'log-bad');
});
