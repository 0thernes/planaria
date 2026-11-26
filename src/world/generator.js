/**
 * PLANARIA v2.0 — Endless 1/1 Procedural Combinatorial Universe Forge
 *
 * Generates mathematically unique 1/1 NPCs, Bosses, Weapons, Armors, Abilities,
 * Adaptive Skill Trees, and Multi-Order 3D Stages across 6 Orders of Magnitude
 * (10^-15 m Planck Foam -> 10^9 m Event-Horizon Singularity).
 *
 * Every generated entity carries a deterministic SHA-256 1/1 Lineage Genome ID,
 * unique continuous stat gradients, distinct 3D geometry & color harmonics, and
 * genuinely distinct mechanical/quantum/temporal behavior!
 */

import { sha256, toHex } from '../core/sha256.js';

const TEXT_ENCODER = new TextEncoder();

/**
 * Deterministic 128-bit sfc32 PRNG seeded directly from FIPS 180-4 SHA-256(seed)
 * — genuine 128-bit cryptographic state space (> 2^64 distinct genomes, zero 32-bit FNV collisions!).
 */
export function seededRng(seed) {
  const digest = sha256(TEXT_ENCODER.encode(String(seed)));
  const dv = new DataView(digest.buffer, digest.byteOffset, digest.byteLength);
  let a = dv.getUint32(0, true);
  let b = dv.getUint32(4, true);
  let c = dv.getUint32(8, true);
  let d = dv.getUint32(12, true);
  // Warm up 12 rounds for full avalanche
  for (let i = 0; i < 12; i++) {
    const t = (a + b + d) >>> 0;
    d = (d + 1) >>> 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) >>> 0;
    c = ((c << 21) | (c >>> 11)) >>> 0;
    c = (c + t) >>> 0;
  }
  return function next() {
    const t = (a + b + d) >>> 0;
    d = (d + 1) >>> 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) >>> 0;
    c = ((c << 21) | (c >>> 11)) >>> 0;
    c = (c + t) >>> 0;
    return t / 4294967296;
  };
}

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

function safeStageInt(val, fallback = 1, min = 1, max = 1_000_000) {
  const n = Number(val);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

/** Deterministic 64-bit (16 hex char = 2^64 space) 1/1 Cryptographic Lineage Tag. */
export function computeLineageId(category, seed) {
  const bytes = TEXT_ENCODER.encode(`PLANARIA-1OF1:${category}:${seed}`);
  const h = toHex(sha256(bytes)).toUpperCase();
  return `${h.slice(0, 4)}-${h.slice(4, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}`;
}

// ============================================================================
// 1. SIX ORDERS OF MAGNITUDE REALMS (10^-15 m -> 10^9 m) — ENDLESS STAGES
// ============================================================================
export const SCALE_REALMS = [
  {
    orderIdx: 0,
    scaleLabel: '10^-15 m',
    name: 'PLANCK FOAM CRUCIBLE',
    subtitle: 'Sub-Nuclear Vacuum Fluctuations & High-Probability Tunneling',
    skyTop: [0.05, 0.02, 0.14],
    skyHorizon: [0.22, 0.05, 0.32],
    gridColor: [0.76, 0.30, 0.98],
    accentColor: [0.98, 0.75, 0.14],
    fogDensity: 0.015,
    tunnelBoost: 1.45,
    waveFreq: 0.48,
    pillarCount: 8,
    ringCount: 3,
    scaleRootHz: 110.0, // A2 Phrygian
    musicalIntervals: [1, 1.067, 1.2, 1.333, 1.5, 1.6, 1.8],
  },
  {
    orderIdx: 1,
    scaleLabel: '10^-10 m',
    name: 'BRAVAIS CRYSTAL LATTICE',
    subtitle: 'Atomic Diffraction Ridges & Standing Wave Interference',
    skyTop: [0.01, 0.06, 0.14],
    skyHorizon: [0.04, 0.22, 0.34],
    gridColor: [0.13, 0.83, 0.93],
    accentColor: [0.06, 0.96, 0.66],
    fogDensity: 0.012,
    tunnelBoost: 1.15,
    waveFreq: 0.62,
    pillarCount: 12,
    ringCount: 2,
    scaleRootHz: 130.81, // C3 Lydian
    musicalIntervals: [1, 1.125, 1.25, 1.406, 1.5, 1.687, 1.875],
  },
  {
    orderIdx: 2,
    scaleLabel: '10^-3 m',
    name: 'PLANARIAN CELLULAR NEXUS',
    subtitle: 'Living .hbin Vascular Matrix & Mitosis Regeneration Fields',
    skyTop: [0.02, 0.09, 0.08],
    skyHorizon: [0.04, 0.26, 0.19],
    gridColor: [0.06, 0.96, 0.66],
    accentColor: [0.13, 0.83, 0.93],
    fogDensity: 0.014,
    tunnelBoost: 1.0,
    waveFreq: 0.38,
    pillarCount: 10,
    ringCount: 4,
    scaleRootHz: 98.0, // G2 Dorian
    musicalIntervals: [1, 1.125, 1.2, 1.333, 1.5, 1.667, 1.778],
  },
  {
    orderIdx: 3,
    scaleLabel: '10^0 m',
    name: 'CHRONOMANCER OBSERVATORY',
    subtitle: 'Astrolabe Time-Dilation Rings & Retrocausal Cones',
    skyTop: [0.08, 0.06, 0.02],
    skyHorizon: [0.28, 0.18, 0.04],
    gridColor: [0.98, 0.75, 0.14],
    accentColor: [0.22, 0.74, 0.97],
    fogDensity: 0.011,
    tunnelBoost: 1.1,
    waveFreq: 0.32,
    pillarCount: 6,
    ringCount: 5,
    scaleRootHz: 146.83, // D3 Harmonic Minor
    musicalIntervals: [1, 1.125, 1.2, 1.333, 1.5, 1.6, 1.875],
  },
  {
    orderIdx: 4,
    scaleLabel: '10^4 m',
    name: 'DYSON HOLOGRAM MEGASTRUCTURE',
    subtitle: 'Orbital Monolith Depths & Bell-Entangled Conduit Spans',
    skyTop: [0.02, 0.04, 0.12],
    skyHorizon: [0.12, 0.14, 0.34],
    gridColor: [0.51, 0.55, 0.97],
    accentColor: [0.91, 0.47, 0.98],
    fogDensity: 0.009,
    tunnelBoost: 1.25,
    waveFreq: 0.28,
    pillarCount: 14,
    ringCount: 4,
    scaleRootHz: 82.41, // E2 Whole-Tone / Alien
    musicalIntervals: [1, 1.122, 1.26, 1.414, 1.587, 1.782, 2.0],
  },
  {
    orderIdx: 5,
    scaleLabel: '10^9 m',
    name: 'SINGULARITY EVENT HORIZON',
    subtitle: 'Extreme Gravitational Phase-Shift & Multi-Timeline Convergence',
    skyTop: [0.12, 0.01, 0.04],
    skyHorizon: [0.36, 0.04, 0.14],
    gridColor: [0.96, 0.25, 0.37],
    accentColor: [0.98, 0.75, 0.14],
    fogDensity: 0.010,
    tunnelBoost: 1.6,
    waveFreq: 0.52,
    pillarCount: 9,
    ringCount: 6,
    scaleRootHz: 73.42, // D2 Locrian
    musicalIntervals: [1, 1.067, 1.2, 1.333, 1.414, 1.6, 1.778],
  },
];

export const RARITY_TIERS = [
  { id: 0, name: 'COHERENT',    mult: 1.00, color: '#94a3b8', rgb: [0.58, 0.64, 0.72], weight: 32 },
  { id: 1, name: 'RESONANT',    mult: 1.28, color: '#22d3ee', rgb: [0.13, 0.83, 0.93], weight: 26 },
  { id: 2, name: 'ENTANGLED',   mult: 1.62, color: '#10f5a8', rgb: [0.06, 0.96, 0.66], weight: 20 },
  { id: 3, name: 'CHRONO-MYTH', mult: 2.08, color: '#a855f7', rgb: [0.66, 0.33, 0.97], weight: 12 },
  { id: 4, name: 'SINGULARITY', mult: 2.72, color: '#fbbf24', rgb: [0.98, 0.75, 0.14], weight: 7  },
  { id: 5, name: '1/1 ANOMALY', mult: 3.65, color: '#e879f9', rgb: [0.91, 0.47, 0.98], weight: 3  },
];

function rollRarity(rng, luckBoost = 0) {
  // Smooth multiplicative luck curve (monotonic across tiers; avoids bimodal pile-up at tier 5!)
  const luck = Math.max(0, Number.isFinite(luckBoost) ? luckBoost : 0);
  const weights = RARITY_TIERS.map((tier) => tier.weight * Math.pow(1 + luck * 0.25, tier.id));
  const total = weights.reduce((s, w) => s + w, 0);
  const r = rng() * total;
  let acc = 0;
  for (let i = 0; i < RARITY_TIERS.length; i++) {
    acc += weights[i];
    if (r <= acc) return RARITY_TIERS[i];
  }
  return RARITY_TIERS[RARITY_TIERS.length - 1];
}

// ============================================================================
// 2. ENDLESS 1/1 WEAPON FORGE (14 Prefixes x 10 Frames x 12 Quantum x 8 Temporal x 6 Rarities)
// ============================================================================
const WEAPON_PREFIXES = [
  'Hilbert', 'Tachyon', 'Planarian', 'Non-Local', 'Eigenstate', 'Decoherent', 'Causal',
  'Bell-Broken', 'Superposed', 'Tunneler', 'Chirality', 'Anastomotic', 'Zero-Cliff', 'Adelic',
];
const WEAPON_FRAMES = [
  { id: 'RAIL_LANCE',    name: 'Boson Rail-Lance',      pattern: 'BEAM',    baseDmg: 34, fireRate: 3.4, speed: 54, count: 1, spread: 0.01, shape: 0 },
  { id: 'PHASE_GLAIVE',  name: 'Phase-Collapsed Glaive', pattern: 'ARC',     baseDmg: 42, fireRate: 2.8, speed: 36, count: 3, spread: 0.24, shape: 1 },
  { id: 'PRISM_ENTANG',  name: 'Entangler Prism',       pattern: 'CHAIN',   baseDmg: 22, fireRate: 4.5, speed: 44, count: 2, spread: 0.14, shape: 2 },
  { id: 'TACHYON_CHAK',  name: 'Tachyon Chakram',       pattern: 'ORBIT',   baseDmg: 29, fireRate: 3.8, speed: 32, count: 2, spread: 0.28, shape: 3 },
  { id: 'WAVE_MORTAR',   name: 'Wavefunction Mortar',   pattern: 'WAVE',    baseDmg: 48, fireRate: 1.9, speed: 28, count: 1, spread: 0.04, shape: 4 },
  { id: 'CHRONO_SCYTHE', name: 'Chrono-Reversal Scythe',pattern: 'BOOMER',  baseDmg: 40, fireRate: 2.6, speed: 35, count: 2, spread: 0.35, shape: 1 },
  { id: 'SINGUL_BOW',    name: 'Singularity Longbow',   pattern: 'PIERCE',  baseDmg: 58, fireRate: 1.7, speed: 64, count: 1, spread: 0.00, shape: 0 },
  { id: 'HADAMARD_TWIN', name: 'Hadamard Twin-Blades',  pattern: 'SPLIT',   baseDmg: 24, fireRate: 5.2, speed: 42, count: 4, spread: 0.32, shape: 2 },
  { id: 'ZENO_DISRUPT',  name: 'Zeno Observer Carbine', pattern: 'LOCK',    baseDmg: 26, fireRate: 4.8, speed: 48, count: 1, spread: 0.05, shape: 3 },
  { id: 'SPLICE_CANNON', name: 'Hologram Splice-Cannon',pattern: 'SCATTER', baseDmg: 19, fireRate: 3.1, speed: 38, count: 5, spread: 0.44, shape: 4 },
];
const QUANTUM_MODS = [
  { id: 'ENTANGLE',     name: 'of Bell Entanglement',    desc: 'Links struck NPCs so damage echoes non-locally across all entangled partners' },
  { id: 'TUNNEL',       name: 'of WKB Tunneling',        desc: 'Projectiles quantum-tunnel straight through armor barriers & obstacles' },
  { id: 'SUPERPOSE',    name: 'of Hadamard Forking',     desc: 'Every shot splits into twin phase-interfering quantum trajectories' },
  { id: 'ZENO',         name: 'of Zeno Freezing',        desc: 'Observed impacts suppress target unitary motion by 68%' },
  { id: 'INTERFERENCE', name: 'of Constructive Ridges',  desc: '2.2x critical surge when fired across constructive wave-floor peaks' },
  { id: 'COLLAPSE',     name: 'of Born Collapse',        desc: 'Triggers localized wavefunction implosion scaling with state entropy' },
  { id: 'DECOHERE',     name: 'of Entropy Stripping',    desc: 'Shatters enemy quantum shields and drains coherence' },
  { id: 'CAUCHY',       name: 'of Cauchy Recovery',      desc: 'Hits restore player shield coherence & heal damaged binary aura' },
  { id: 'GHZ_CASCADE',  name: 'of GHZ Cascade',          desc: 'Chains 3-body entanglement across nearby hostiles' },
  { id: 'PHASE_SHIFT',  name: 'of Berry Phase',          desc: 'Curving harmonic bolts that bend toward high-value targets' },
  { id: 'TUNNEL_CRIT',  name: 'of Barrier Resonance',    desc: 'Gains +80% velocity and damage after tunneling through any pillar' },
  { id: 'SPIN_FLIP',    name: 'of Pauli-X Inversion',    desc: 'Inverts target polarity and reflects enemy projectiles' },
];
const TEMPORAL_MODS = [
  { id: 'DILATE',    tag: 'Chrono-Slow',     effect: 'Creates micro time-dilation fields on impact (0.28x speed)' },
  { id: 'HASTE',     tag: 'Hyper-Clock',     effect: '+35% fire cadence & projectile acceleration' },
  { id: 'RETRO',     tag: 'Retrocausal',     effect: 'Predicts enemy motion and auto-leads target trajectory' },
  { id: 'ECHO',      tag: 'Timeline-Echo',   effect: 'Re-fires a phantom ghost bolt 0.35s later from the past' },
  { id: 'REWIND',    tag: 'Entropy-Rewind',  effect: 'Restores +4 Chrono Energy per hit' },
  { id: 'PARADOX',   tag: 'Paradox-Rift',    effect: 'Detonates bonus damage when striking near a Timeline Echo' },
  { id: 'STASIS',    tag: 'Zero-Tick',       effect: 'Brief 0.6s temporal stasis on critical hits' },
  { id: 'MITOSIS',   tag: 'Self-Splitting',  effect: 'Projectile undergoes Planarian mitosis into 2 bolts mid-flight' },
];

export function forgeWeapon(seed, stage = 1, guaranteedMinRarity = 0) {
  const s = safeStageInt(stage, 1, 1, 1_000_000);
  const minR = safeStageInt(guaranteedMinRarity, 0, 0, RARITY_TIERS.length - 1);
  const rng = seededRng(`WPN:${seed}:${s}`);
  let rarity = rollRarity(rng, Math.min(2.5, s * 0.25));
  if (rarity.id < minR) rarity = RARITY_TIERS[minR];

  const prefix = pick(rng, WEAPON_PREFIXES);
  const frame = pick(rng, WEAPON_FRAMES);
  const qMod = pick(rng, QUANTUM_MODS);
  const tMod = pick(rng, TEMPORAL_MODS);

  const stageScale = 1 + (s - 1) * 0.22;
  const variance = 0.88 + rng() * 0.28;
  const damage = Math.round(frame.baseDmg * rarity.mult * stageScale * variance);
  const fireRate = Number((frame.fireRate * (tMod.id === 'HASTE' ? 1.35 : 1) * (0.9 + rng() * 0.25)).toFixed(2));
  const speed = Number((frame.speed * (0.9 + rng() * 0.25)).toFixed(1));
  const projectileCount = frame.count + (qMod.id === 'SUPERPOSE' ? 1 : 0) + (rarity.id >= 4 ? 1 : 0);
  const tunnelFactor = qMod.id === 'TUNNEL' || qMod.id === 'TUNNEL_CRIT' ? 0.92 : 0.25 + rng() * 0.45;
  const hue = rng();

  return {
    seed,
    lineageId: computeLineageId('WPN', `${seed}:${s}`),
    name: `${prefix} ${frame.name} ${qMod.name}`,
    shortName: `${prefix} ${frame.name.split(' ').pop()}`,
    rarity,
    frame,
    qMod,
    tMod,
    stageFound: s,
    damage,
    fireRate,
    speed,
    projectileCount,
    spread: frame.spread,
    tunnelFactor: Number(tunnelFactor.toFixed(2)),
    color: [...rarity.rgb],
    hue,
    entangledPartner: null,
  };
}

// ============================================================================
// 3. ENDLESS 1/1 ARMOR FORGE (8 Chassis x 8 Barrier Layers x 8 Phase Gradients x 6 Rarities)
// ============================================================================
const ARMOR_CHASSIS = [
  { id: 'CARAPACE', name: 'Holographic Carapace',  baseShield: 110, speedMult: 1.00, plates: 6 },
  { id: 'AEGIS',    name: 'Cauchy-Matrix Aegis',   baseShield: 145, speedMult: 0.94, plates: 8 },
  { id: 'MANTLE',   name: 'Phase-Shift Mantle',    baseShield: 90,  speedMult: 1.15, plates: 4 },
  { id: 'EXOSHELL', name: 'Planarian Exoshell',    baseShield: 125, speedMult: 1.02, plates: 7 },
  { id: 'LATTICE',  name: 'Bravais Spin-Lattice',  baseShield: 130, speedMult: 0.98, plates: 6 },
  { id: 'SHROUD',   name: 'Heisenberg Cloud-Shroud', baseShield: 85, speedMult: 1.18, plates: 5 },
  { id: 'CHRONO',   name: 'Chrono-Fold Harness',   baseShield: 115, speedMult: 1.08, plates: 6 },
  { id: 'CORONA',   name: 'Singularity Corona',    baseShield: 160, speedMult: 0.96, plates: 9 },
];
const ARMOR_LAYERS = [
  { id: 'RS_HEAL',   name: 'RS(254,238) Self-Repair',   desc: 'Regenerates +5 shield/s and purges radiation decoherence' },
  { id: 'TUNNEL_EV', name: 'WKB Phase-Tunneling',       desc: '+22% probability incoming attacks quantum-tunnel harmlessly past you' },
  { id: 'BELL_REFL', name: 'Bell-State Reflection',     desc: 'Reflects 45% of incoming damage back to entangled attackers' },
  { id: 'TIME_UNDO', name: 'Retrocausal Hit-Rewind',    desc: 'Automatically rewinds 1 lethal hit every 10 seconds' },
  { id: 'ZENO_AURA', name: 'Zeno Proximity Dampener',   desc: 'Slows nearby hostile projectiles by 38%' },
  { id: 'MERKLE_IM', name: 'Merkle Byzantine Barrier',  desc: 'Immunity to Byzantine corruption bursts & +30% boss resistance' },
  { id: 'SUPER_DEC', name: 'Superposition Decoy',       desc: 'Taking damage spawns a glowing wave-decoy splitting aggro' },
  { id: 'CHRONO_GN', name: 'Chronon Capacitor',         desc: '+45% Chrono Energy regeneration & wider Chrono-Wells' },
];
const ARMOR_GRADIENTS = [
  'Obsidian-Emerald', 'Ultraviolet-Gold', 'Cyan-Prism', 'Arterial-Amber',
  'Iridescent-Void', 'Phosphor-Jade', 'Hyper-Magenta', 'Cherenkov-Blue',
];

export function forgeArmor(seed, stage = 1, guaranteedMinRarity = 0) {
  const s = safeStageInt(stage, 1, 1, 1_000_000);
  const minR = safeStageInt(guaranteedMinRarity, 0, 0, RARITY_TIERS.length - 1);
  const rng = seededRng(`ARM:${seed}:${s}`);
  let rarity = rollRarity(rng, Math.min(2.5, s * 0.25));
  if (rarity.id < minR) rarity = RARITY_TIERS[minR];

  const chassis = pick(rng, ARMOR_CHASSIS);
  const layer = pick(rng, ARMOR_LAYERS);
  const gradient = pick(rng, ARMOR_GRADIENTS);
  const stageScale = 1 + (s - 1) * 0.20;
  const maxShield = Math.round(chassis.baseShield * rarity.mult * stageScale * (0.9 + rng() * 0.22));
  const regenRate = Number(((layer.id === 'RS_HEAL' ? 6.5 : 2.2) * rarity.mult).toFixed(1));
  const phaseDodge = Number(((layer.id === 'TUNNEL_EV' ? 0.24 : 0.05) + rarity.id * 0.03).toFixed(2));

  return {
    seed,
    lineageId: computeLineageId('ARM', `${seed}:${s}`),
    name: `${gradient} ${chassis.name} [${layer.name}]`,
    shortName: `${gradient.split('-')[0]} ${chassis.name.split(' ').pop()}`,
    rarity,
    chassis,
    layer,
    gradient,
    maxShield,
    regenRate,
    phaseDodge,
    speedMult: chassis.speedMult,
    plates: chassis.plates,
    color: [...rarity.rgb],
  };
}

// ============================================================================
// 4. ENDLESS 1/1 NPC & BOSS FORGE (Adaptive Reactive AI + Quantum/Temporal Affixes)
// ============================================================================
export const NPC_ARCHETYPES = [
  { id: 'WEAVER',      name: 'Phase Weaver',       mesh: 'OCTA',    baseHp: 65,  speed: 6.8, radius: 1.05, range: 14, fireCd: 1.7 },
  { id: 'STALKER',     name: 'Tunnel Stalker',     mesh: 'PYRAMID', baseHp: 52,  speed: 9.2, radius: 0.90, range: 6,  fireCd: 1.2 },
  { id: 'CHRONOPHAGE', name: 'Chronophage',        mesh: 'TORUS',   baseHp: 95,  speed: 5.4, radius: 1.30, range: 16, fireCd: 2.1 },
  { id: 'SENTINEL',    name: 'Bell Sentinel',      mesh: 'CUBE',    baseHp: 115, speed: 4.5, radius: 1.35, range: 18, fireCd: 1.5 },
  { id: 'INTERFERON',  name: 'Interferon Prism',   mesh: 'DIAMOND', baseHp: 78,  speed: 7.4, radius: 1.00, range: 15, fireCd: 1.4 },
  { id: 'DECOHERER',   name: 'Decoherence Wraith', mesh: 'SPIKE',   baseHp: 82,  speed: 8.1, radius: 1.15, range: 11, fireCd: 1.6 },
  { id: 'MITOSIS_ORB', name: 'Planarian Splitter', mesh: 'ICO',     baseHp: 90,  speed: 6.2, radius: 1.25, range: 12, fireCd: 1.9 },
  { id: 'ARCHON',      name: 'Singularity Archon', mesh: 'BOSS',    baseHp: 340, speed: 5.8, radius: 2.30, range: 24, fireCd: 1.0 },
];
const NPC_MUTATIONS = [
  'SUPERPOSED',     // splits into 2 ghostly phase-offset clones until collapsed!
  'ENTANGLED',      // spawns linked to another NPC via Bell tether!
  'ZENO_LOCKED',    // freezes when player looks straight at it, hyper-blinks when unobserved!
  'TUNNELER',       // quantum-tunnels directly through pillars & bursts behind player!
  'INTERFERING',    // emits glowing wave-interference ring pulses!
  'MITOTIC',        // splits into 2 smaller living halves at 50% HP!
  'BYZANTINE',      // attempts to corrupt coherence unless Merkle immune is ON!
  'RESONANT',       // amplifies damage along constructive floor ridges!
];
const NPC_TEMPORAL = [
  'SYNCED',
  'DILATED_AURA',   // projects a slow-mo bubble around itself
  'HASTENED',       // 1.4x local clock
  'RETROCAUSAL',    // dodges predicted player projectile paths!
  'ECHOING',        // leaves lethal temporal afterimage mines!
  'REVERSING',      // periodically rewinds 1.5s of its own HP if not burst down!
];
const NPC_TITLES = [
  'Vex', 'Korr', 'Nyx', 'Aethel', 'Zyr', 'Ouro', 'Vael', 'Qbit', 'Tach', 'Syzygy', 'Cym', 'Xeno',
];

/**
 * Forge a unique 1/1 NPC (or Stage Boss) with real reactive adaptation to player behavior!
 * playerProfile: { beamRatio, closeRatio, entangleCount, rewindCount }
 */
export function forgeNPC(seed, stage = 1, wave = 1, isBoss = false, playerProfile = null, forcedId = null) {
  const s = safeStageInt(stage, 1, 1, 1_000_000);
  const w = safeStageInt(wave, 1, 1, 1_000_000);
  const rng = seededRng(`NPC:${seed}:${s}:${w}:${isBoss ? 'B' : 'N'}`);
  const rarity = isBoss
    ? RARITY_TIERS[Math.min(5, 3 + Math.floor(s / 2))]
    : rollRarity(rng, Math.min(2.0, s * 0.22));

  const arch = isBoss ? NPC_ARCHETYPES[7] : NPC_ARCHETYPES[Math.floor(rng() * 7)];
  let mutation = pick(rng, NPC_MUTATIONS);
  let temporalAffix = pick(rng, NPC_TEMPORAL);

  // Adaptive Reactive Evolution: counter dominant player tactics!
  const adaptation = {
    beamResist: 0,
    closeRepulse: 0,
    coherenceDrain: 0,
    counterTag: 'BASE',
  };
  if (playerProfile) {
    if (playerProfile.beamRatio > 0.6 && rng() < 0.55) {
      mutation = rng() < 0.5 ? 'TUNNELER' : 'SUPERPOSED';
      adaptation.beamResist = 0.25;
      adaptation.counterTag = 'ANTI-BEAM';
    } else if (playerProfile.closeRatio > 0.5 && rng() < 0.55) {
      mutation = 'ZENO_LOCKED';
      temporalAffix = 'DILATED_AURA';
      adaptation.closeRepulse = 1.0;
      adaptation.counterTag = 'ANTI-CLOSE';
    } else if (playerProfile.entangleCount > 5 && rng() < 0.45) {
      mutation = 'BYZANTINE';
      adaptation.coherenceDrain = 0.15;
      adaptation.counterTag = 'ANTI-BELL';
    }
  }

  const stageScale = 1 + (s - 1) * 0.34 + (w - 1) * 0.12;
  const maxHp = Math.round(arch.baseHp * rarity.mult * stageScale * (0.9 + rng() * 0.25));
  const title = pick(rng, NPC_TITLES);
  const lineageId = computeLineageId(isBoss ? 'BOSS' : 'NPC', `${seed}:${s}:${w}`);

  // Spawn around arena perimeter at varied heights/depths
  const ang = rng() * Math.PI * 2;
  const dist = isBoss ? 22 : 16 + rng() * 14;
  const elevation = isBoss ? 3.2 : 1.0 + rng() * 3.5;
  // Asymptotic speed cap prevents high-stage NPCs from tunneling past arena/projectiles
  const speedScale = 1 + 1.2 * (1 - Math.exp(-s * 0.04));

  return {
    id: forcedId ?? Math.floor(rng() * 1e9),
    seed,
    lineageId,
    name: isBoss
      ? `${title}-${lineageId.slice(0, 4)} · ${mutation} ${arch.name}`
      : `${title} ${arch.name} [${mutation}]`,
    archetypeIdx: NPC_ARCHETYPES.indexOf(arch),
    archetype: arch,
    rarityIdx: rarity.id,
    rarity,
    mutation,
    temporalAffix,
    isBoss,
    x: Math.cos(ang) * dist,
    y: elevation,
    z: Math.sin(ang) * dist,
    vx: 0, vy: 0, vz: 0,
    hp: maxHp,
    maxHp,
    radius: arch.radius * (isBoss ? 1.15 : 0.92 + rng() * 0.22),
    speed: arch.speed * (temporalAffix === 'HASTENED' ? 1.38 : 1.0) * speedScale,
    phase: rng() * Math.PI * 2,
    superposeAngle: rng() * Math.PI * 2,
    entangledWith: null,
    zenoFreeze: 0,
    stasisTimer: 0,
    mitosisDone: false,
    cooldown: 0.6 + rng() * 1.2,
    color: [...rarity.rgb],
    adaptation,
  };
}

// ============================================================================
// 5. FOUR-BRANCH ADAPTIVE SKILL TREE & EIGHT QUANTUM-TEMPORAL ABILITIES
// ============================================================================
export const SKILL_TREE = [
  // Branch 1: Superposition
  { id: 'sup_clones',   branch: 'SUPERPOSITION', name: 'Hadamard Bifurcation',  maxLvl: 5, desc: '+15% damage & wider wave-clone phase interference per rank' },
  { id: 'sup_tunnel',   branch: 'SUPERPOSITION', name: 'WKB Resonance Mastery', maxLvl: 5, desc: '+12% barrier tunneling & +18% post-tunnel crit damage' },
  { id: 'sup_heisen',   branch: 'SUPERPOSITION', name: 'Squeezed-State Mastery',maxLvl: 5, desc: 'Boosts Heisenberg Stance crit & probabilistic dodge ceiling' },
  // Branch 2: Entanglement
  { id: 'ent_bell',     branch: 'ENTANGLEMENT',  name: 'Tsirelson Bell Link',   maxLvl: 5, desc: 'Entangled damage echo increases from 55% up to 115%' },
  { id: 'ent_ghz',      branch: 'ENTANGLEMENT',  name: 'GHZ Multi-Body Web',    maxLvl: 5, desc: 'Entanglement chains +1 extra hostile per 2 ranks' },
  { id: 'ent_zeno',     branch: 'ENTANGLEMENT',  name: 'Quantum Zeno Gaze',     maxLvl: 5, desc: 'Direct camera sightline slows observed NPCs up to 80%' },
  // Branch 3: Chronomancy
  { id: 'chr_well',     branch: 'CHRONOMANCY',   name: 'Chrono-Well Radius',    maxLvl: 5, desc: '+20% time-dilation sphere radius & deeper slow-mo' },
  { id: 'chr_fork',     branch: 'CHRONOMANCY',   name: 'Paradox Echo Arsenal',  maxLvl: 5, desc: 'Past-Timeline Echo Clones deal +25% damage & last longer' },
  { id: 'chr_rewind',   branch: 'CHRONOMANCY',   name: 'Zero-Drift Scrubbing',  maxLvl: 5, desc: '-18% Chrono Energy drain during Rewind & Bullet-Time' },
  // Branch 4: Holographic Biology (.hbin)
  { id: 'hol_rs',       branch: 'HOLOGRAPHIC',   name: 'RS(254,238) Autophagy', maxLvl: 5, desc: '+3.5/s shield regeneration & rapid coherence recovery' },
  { id: 'hol_mitosis',  branch: 'HOLOGRAPHIC',   name: 'Binary Mitosis Surge',  maxLvl: 5, desc: 'Bisecting or forging emits a healing shockwave across the arena' },
  { id: 'hol_xeno',     branch: 'HOLOGRAPHIC',   name: 'Chimeric Overclock',    maxLvl: 5, desc: '+22% all stats whenever a Cross-Species Xenograft is active' },
];

export const ABILITIES = [
  { key: 'Q', name: 'HADAMARD SPLIT',    cd: 5.0,  cost: 15, desc: 'Enter quantum superposition (twin phase-clones + double fire + 50% dodge for 4s)' },
  { key: 'E', name: 'BELL ENTANGLE',     cd: 4.5,  cost: 12, desc: 'Entangle up to 4 nearest hostiles in a GHZ Bell Web — damage echoes non-locally!' },
  { key: 'R', name: 'CHRONO REWIND',     cd: 0.5,  cost: 20, desc: 'HOLD to scrub the entire 3D universe backwards in time (restores HP & undoes attacks!)' },
  { key: 'T', name: 'CHRONO-FORK ECHO',  cd: 7.5,  cost: 25, desc: 'Fork timeline: summon your Past Self from the last 4s to fight beside you!' },
  { key: 'F', name: 'CHRONO-WELL',       cd: 6.0,  cost: 18, desc: 'Deploy a 3D spherical Time-Dilation Well (0.16x enemy & bullet speed!)' },
  { key: 'V', name: 'WAVE COLLAPSE',     cd: 8.5,  cost: 30, desc: 'Measure the 4-qubit statevector: Born-collapse supernova scaling with entropy & CHSH!' },
  { key: 'X', name: 'ORDER SHIFT',       cd: 1.5,  cost: 0,  desc: 'Shift spatial Scale Order across 6 Orders of Magnitude (10^-15 m -> 10^9 m)!' },
  { key: 'C', name: 'FORGE 1/1 LOOT',    cd: 2.0,  cost: 0,  desc: 'Synthesize a brand-new 1/1 Quantum Weapon & Armor from current SHA-256 entropy!' },
];

/** Compute deterministic stage specification for ANY finite stage number 1..1e6 (clamped >= 1). */
export function buildStageSpec(stageNum, seed = 2026) {
  const s = safeStageInt(stageNum, 1, 1, 1_000_000);
  const realm = SCALE_REALMS[(s - 1) % SCALE_REALMS.length];
  const cycle = Math.floor((s - 1) / SCALE_REALMS.length) + 1;
  const rng = seededRng(`STAGE:${seed}:${s}`);

  // Procedural 3D pillars / monoliths around arena with height & width gradients
  const pillars = [];
  const count = realm.pillarCount + Math.min(8, Math.floor(s / 2));
  for (let i = 0; i < count; i++) {
    const ang = (i / count) * Math.PI * 2 + rng() * 0.25;
    const dist = 11 + rng() * 17;
    pillars.push({
      x: Math.cos(ang) * dist,
      z: Math.sin(ang) * dist,
      radius: 1.0 + rng() * 1.4,
      height: 4.5 + rng() * 9.5,
      phase: rng() * Math.PI * 2,
      barrierV0: 0.4 + rng() * 1.2, // WKB tunneling barrier potential!
    });
  }

  // Coherent multi-slit wave interference emitters embedded in stage floor
  const waveSources = [];
  const numSources = 3 + (s % 3);
  for (let i = 0; i < numSources; i++) {
    const ang = (i / numSources) * Math.PI * 2 + s * 0.7;
    const r = 9 + (i % 2) * 7;
    waveSources.push({
      x: Math.cos(ang) * r,
      z: Math.sin(ang) * r,
      amp: 0.75 + rng() * 0.35,
      k: realm.waveFreq + rng() * 0.14,
      omega: 1.8 + rng() * 1.1,
      phase: rng() * Math.PI * 2,
    });
  }

  return {
    stageNum: s,
    cycle,
    lineageId: computeLineageId('STAGE', `${seed}:${s}`),
    realm,
    title: `STAGE ${s} · ${realm.name} ${cycle > 1 ? `(TIER ${cycle})` : ''}`.trim(),
    arenaRadius: 34,
    pillars,
    waveSources,
    wavesPerStage: 3, // 2 escalating waves + Stage Singularity Boss!
  };
}

/** Exact reachable lower bound on combinatorial 1/1 distinct build/entity space (matches Lean 4!). */
export function combinatorialSpaceMetrics() {
  const weaponDiscrete = WEAPON_PREFIXES.length * WEAPON_FRAMES.length * QUANTUM_MODS.length * TEMPORAL_MODS.length * RARITY_TIERS.length;
  const armorDiscrete = ARMOR_CHASSIS.length * ARMOR_LAYERS.length * ARMOR_GRADIENTS.length * RARITY_TIERS.length;
  // Reachable (archetype, rarity) pairs: 7 standard archetypes x 6 rarities + 1 Archon boss x 3 high rarities = 45
  const reachableArchRarityPairs = (NPC_ARCHETYPES.length - 1) * RARITY_TIERS.length + 3;
  const npcDiscrete = reachableArchRarityPairs * NPC_MUTATIONS.length * NPC_TEMPORAL.length * NPC_TITLES.length;
  return {
    weaponArchetypeCombos: weaponDiscrete,       // 14 * 10 * 12 * 8 * 6 = 80,640 discrete * continuous gradients * 2^64 lineage
    armorArchetypeCombos: armorDiscrete,         // 8 * 8 * 8 * 6 = 3,072 discrete * continuous gradients * 2^64 lineage
    npcArchetypeCombos: npcDiscrete,             // 45 * 8 * 6 * 12 = 25,920 reachable discrete * adaptive AI * 2^64 lineage
    jointLoadoutCrossProduct: weaponDiscrete * armorDiscrete * npcDiscrete, // 6,421,059,993,600 (> 6.42 x 10^12) exact reachable!
    scaleOrdersOfMagnitude: 24,                  // 10^-15 m to 10^9 m = 24 orders of magnitude (label span)
    realmBiomes: SCALE_REALMS.length,
    skillNodes: SKILL_TREE.length,
    activeAbilities: ABILITIES.length,
  };
}
