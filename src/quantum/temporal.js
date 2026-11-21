/**
 * PLANARIA v2.2 — Temporal Causality, Timeline Scrubbing, Chrono-Wells & Paradox Echo Engine
 *
 * Implements:
 *   1. True O(1) Fixed-Capacity Circular Snapshot Ring Buffer (360 frames = 6s lossless deep-cloned rewind)
 *   2. Exact reversible Chrono-Step Clock (matches Lean 4 Theorems VI.5-VI.7!)
 *   3. Local Spherical Time-Dilation Wells (0.12x bullet-time, 2.5x hyper-haste, validated bounds)
 *   4. Chrono-Forking: spawns autonomous Past-Timeline Echo Clones replaying recorded player
 *      trajectories, weapon snapshots, and firing pulses at frame-rate-independent local time
 *   5. Retrocausal Future-Cone Predictors projecting enemy states ahead in 3D space
 */

function cloneNpcSnap(n) {
  return {
    id: n.id,
    x: n.x, y: n.y, z: n.z,
    vx: n.vx, vy: n.vy, vz: n.vz,
    hp: n.hp, maxHp: n.maxHp,
    speed: n.speed,
    mitosisDone: Boolean(n.mitosisDone),
    phase: n.phase,
    entangledWith: n.entangledWith,
    superposeAngle: n.superposeAngle,
    zenoFreeze: n.zenoFreeze,
    stasisTimer: n.stasisTimer || 0,
    seed: n.seed,
    archetypeIdx: n.archetypeIdx,
    rarityIdx: n.rarityIdx,
    name: n.name,
    lineageId: n.lineageId,
    radius: n.radius,
    color: Array.isArray(n.color) ? [...n.color] : [0.58, 0.64, 0.72],
    mutation: n.mutation,
    temporalAffix: n.temporalAffix,
    isBoss: Boolean(n.isBoss),
    cooldown: n.cooldown,
    adaptation: n.adaptation ? { ...n.adaptation } : { beamResist: 0, closeRepulse: 0, coherenceDrain: 0, counterTag: 'BASE' },
  };
}

function cloneProjSnap(p) {
  return {
    ...p,
    color: Array.isArray(p.color) ? [...p.color] : [0.13, 0.83, 0.93],
    passedPillars: p.passedPillars ? new Set(p.passedPillars) : new Set(),
    hitIds: p.hitIds ? new Set(p.hitIds) : new Set(),
  };
}

function cloneFullSnap(s) {
  return {
    worldTime: s.worldTime,
    chronoStep: s.chronoStep,
    player: { ...s.player },
    qRe: new Float64Array(s.qRe),
    qIm: new Float64Array(s.qIm),
    qCoh: s.qCoh,
    npcs: s.npcs.map(cloneNpcSnap),
    projectiles: s.projectiles.map(cloneProjSnap),
    score: s.score,
    kills: s.kills,
    xp: s.xp,
    level: s.level,
    skillPoints: s.skillPoints,
    stage: s.stage,
    wave: s.wave,
    abilityCooldowns: { ...s.abilityCooldowns },
    chronoWells: s.chronoWells.map((w) => ({ ...w })),
    echoClones: s.echoClones.map((e) => ({
      ...e,
      color: [...e.color],
      frames: e.frames.map((f) => ({ ...f })),
    })),
  };
}

class RingBuffer {
  constructor(capacity) {
    this.capacity = Math.max(1, capacity | 0);
    this._buf = new Array(this.capacity);
    this._head = 0;
    this._size = 0;
  }

  get length() { return this._size; }

  clear() {
    this._buf.fill(undefined);
    this._head = 0;
    this._size = 0;
  }

  push(item) {
    if (this._size < this.capacity) {
      this._buf[(this._head + this._size) % this.capacity] = item;
      this._size++;
    } else {
      this._buf[this._head] = item;
      this._head = (this._head + 1) % this.capacity;
    }
  }

  pop() {
    if (this._size === 0) return undefined;
    this._size--;
    const idx = (this._head + this._size) % this.capacity;
    const item = this._buf[idx];
    this._buf[idx] = undefined;
    return item;
  }

  peekLast() {
    if (this._size === 0) return undefined;
    return this._buf[(this._head + this._size - 1) % this.capacity];
  }

  toArray(tailLimit = this._size) {
    const n = Math.min(this._size, Math.max(0, tailLimit | 0));
    const startOffset = this._size - n;
    const out = new Array(n);
    for (let i = 0; i < n; i++) {
      out[i] = this._buf[(this._head + startOffset + i) % this.capacity];
    }
    return out;
  }
}

export class TemporalEngine {
  constructor(maxSnapshots = 360) {
    this.maxSnapshots = Math.max(2, Math.floor(maxSnapshots) || 360);
    this._snapRing = new RingBuffer(this.maxSnapshots);
    this._trailRing = new RingBuffer(this.maxSnapshots);
    this.globalTimeScale = 1.0; // [-1.5 .. 3.0]
    this.worldTime = 0;
    this.chronoStep = 0;        // exact discrete monotonic/reversible step counter
    this.rewinding = false;
    this.chronoEnergy = 100;    // [0..100] fuels rewind, bullet-time, and Chrono-Forks

    // Local 3D spherical time-dilation wells: { id, x, y, z, radius, factor, life, maxLife, kind }
    this.chronoWells = [];
    // Active Past-Timeline Echo Clones replaying recorded player slices
    this.echoClones = [];
    this.paradoxCount = 0;
    this.forkCount = 0;
    this._nextId = 1;
  }

  /** Number of snapshots currently stored in the O(1) circular ring buffer. */
  get snapshotCount() { return this._snapRing.length; }

  /** Number of recorded player trail frames available for Chrono-Forking. */
  get trailCount() { return this._trailRing.length; }

  /** Compatibility ordered array view of snapshots. */
  get snapshots() { return this._snapRing.toArray(); }

  /** Compatibility ordered array view of player trail. */
  get playerTrail() { return this._trailRing.toArray(); }

  reset() {
    this._snapRing.clear();
    this._trailRing.clear();
    this.globalTimeScale = 1.0;
    this.worldTime = 0;
    this.chronoStep = 0;
    this.rewinding = false;
    this.chronoEnergy = 100;
    this.chronoWells = [];
    this.echoClones = [];
    this.paradoxCount = 0;
    this.forkCount = 0;
  }

  /** Record a full deep-copied world snapshot into the O(1) circular ring buffer. */
  recordSnapshot(worldState) {
    const snap = {
      worldTime: this.worldTime,
      chronoStep: this.chronoStep,
      player: { ...worldState.player },
      qRe: new Float64Array(worldState.qReg.re),
      qIm: new Float64Array(worldState.qReg.im),
      qCoh: worldState.qReg.coherence,
      npcs: worldState.npcs.map(cloneNpcSnap),
      projectiles: worldState.projectiles.map(cloneProjSnap),
      score: worldState.score,
      kills: worldState.kills ?? 0,
      xp: worldState.xp ?? 0,
      level: worldState.level ?? 1,
      skillPoints: worldState.skillPoints ?? 0,
      stage: worldState.stage,
      wave: worldState.wave,
      abilityCooldowns: worldState.abilityCooldowns ? { ...worldState.abilityCooldowns } : {},
      chronoWells: this.chronoWells.map((w) => ({ ...w })),
      echoClones: this.echoClones.map((e) => ({
        ...e,
        color: [...e.color],
        frames: e.frames.map((f) => ({ ...f })),
      })),
    };

    this._snapRing.push(snap);

    // Record player trail frame (including weapon reference) for Chrono-Forking
    this._trailRing.push({
      x: worldState.player.x,
      y: worldState.player.y,
      z: worldState.player.z,
      yaw: worldState.player.yaw,
      firing: Boolean(worldState.player.firing),
      weaponSeed: worldState.equippedWeapon?.seed || 1,
      weaponRef: worldState.equippedWeapon || null,
    });
  }

  /** Pop and return a detached deep copy of the previous timeline snapshot for exact rewind! */
  popRewindSnapshot() {
    if (this._snapRing.length <= 1) return null;
    this._snapRing.pop();
    if (this._trailRing.length > 0) this._trailRing.pop();
    const prev = this._snapRing.peekLast();
    if (!prev) return null;
    this.worldTime = prev.worldTime;
    this.chronoStep = prev.chronoStep;
    return cloneFullSnap(prev);
  }

  /** Spawn a local 3D spherical time-dilation well at (x, y, z) with strict bounds. */
  spawnChronoWell(x, y, z, radius = 9.0, factor = 0.18, duration = 6.5, kind = 'DILATION') {
    const safeRadius = Number.isFinite(radius) ? Math.max(0.5, Math.min(40, radius)) : 9.0;
    const safeDuration = Number.isFinite(duration) ? Math.max(0.1, Math.min(60, duration)) : 6.5;
    const safeFactor = Number.isFinite(factor) ? Math.max(-2.0, Math.min(4.0, factor)) : 0.18;
    const well = {
      id: this._nextId++,
      x: Number.isFinite(x) ? x : 0,
      y: Number.isFinite(y) ? y : 1.5,
      z: Number.isFinite(z) ? z : 0,
      radius: safeRadius,
      factor: safeFactor,
      life: safeDuration,
      maxLife: safeDuration,
      kind, // 'DILATION' (slow), 'HASTE' (fast), 'INVERT' (reverse)
    };
    this.chronoWells.push(well);
    if (this.chronoWells.length > 6) this.chronoWells.shift();
    return well;
  }

  /** Compute local effective time-dilation multiplier at any 3D point (x, y, z). */
  localTimeFactor(x, y, z) {
    let f = this.globalTimeScale;
    for (let i = 0; i < this.chronoWells.length; i++) {
      const w = this.chronoWells[i];
      if (w.radius <= 0) continue;
      const dx = x - w.x;
      const dy = y - w.y;
      const dz = z - w.z;
      const d2 = dx * dx + dy * dy + dz * dz;
      const r2 = w.radius * w.radius;
      if (d2 < r2) {
        const edge = Math.max(0, Math.min(1, 1 - Math.sqrt(d2) / w.radius));
        f = f * (1 - edge) + w.factor * edge;
      }
    }
    return f;
  }

  /**
   * Chrono-Fork: Materialize the player's recorded past 4-6 seconds as an autonomous
   * glowing Past-Timeline Echo Ally fighting alongside the Present Self!
   */
  spawnChronoFork(extraFrames = 0) {
    if (this._trailRing.length < 25) return null;
    const maxLen = Math.min(this.maxSnapshots, 240 + Math.max(0, Math.floor(extraFrames)));
    const slice = this._trailRing.toArray(maxLen).map((pt) => ({ ...pt }));
    const colors = [
      [0.13, 0.83, 0.93], // cyan echo
      [0.98, 0.75, 0.14], // gold echo
      [0.91, 0.47, 0.98], // magenta paradox echo
    ];
    const echo = {
      id: this._nextId++,
      frames: slice,
      cursor: 0,
      accum: 0,
      life: slice.length,
      color: [...colors[this.forkCount % colors.length]],
      paradoxHits: 0,
      x: slice[0].x,
      y: slice[0].y,
      z: slice[0].z,
      yaw: slice[0].yaw,
      firing: false,
      weaponRef: slice[0].weaponRef || null,
    };
    this.echoClones.push(echo);
    if (this.echoClones.length > 3) this.echoClones.shift();
    this.forkCount++;
    return echo;
  }

  /** Advance active Chrono-Wells and Past-Timeline Echo Clones by real dt. */
  step(dt, energyRegenMult = 1.0) {
    const effDt = dt * this.globalTimeScale;
    this.worldTime += effDt;
    if (this.globalTimeScale > 0) this.chronoStep += 1;
    else if (this.globalTimeScale < 0) this.chronoStep -= 1;

    // Regenerate chrono energy when not rewinding or heavy bullet-time
    if (!this.rewinding && Math.abs(this.globalTimeScale - 1.0) < 0.15) {
      this.chronoEnergy = Math.min(100, this.chronoEnergy + dt * 11 * energyRegenMult);
    }

    for (let i = this.chronoWells.length - 1; i >= 0; i--) {
      this.chronoWells[i].life -= dt;
      if (this.chronoWells[i].life <= 0) this.chronoWells.splice(i, 1);
    }

    for (let i = this.echoClones.length - 1; i >= 0; i--) {
      const e = this.echoClones[i];
      if (e.cursor >= e.frames.length) {
        this.echoClones.splice(i, 1);
        continue;
      }
      // Frame-rate-independent playback scaled by local time dilation (60 fps reference)
      const locF = Math.max(0.15, Math.abs(this.localTimeFactor(e.x, e.y, e.z)));
      e.accum = (e.accum || 0) + dt * 60 * locF;
      let firedThisStep = false;
      let steps = Math.floor(e.accum);
      if (steps < 1) steps = 1; // always advance at least 1 recorded tick at <=60 Hz
      e.accum = Math.max(0, e.accum - steps);

      let lastFrame = e.frames[Math.min(e.cursor, e.frames.length - 1)];
      for (let s = 0; s < steps && e.cursor < e.frames.length; s++) {
        lastFrame = e.frames[e.cursor++];
        if (lastFrame.firing) firedThisStep = true;
      }
      e.x = lastFrame.x;
      e.y = lastFrame.y;
      e.z = lastFrame.z;
      e.yaw = lastFrame.yaw;
      e.firing = firedThisStep;
      e.weaponRef = lastFrame.weaponRef || e.weaponRef;
      e.life = e.frames.length - e.cursor;
    }
  }

  /**
   * Retrocausal Future-Cone Projection: projects an NPC's predicted 3D position
   * `horizonSec` seconds into the future respecting local Chrono-Wells!
   */
  predictFuturePosition(entity, horizonSec = 1.1) {
    const locF = this.localTimeFactor(entity.x, entity.y, entity.z);
    const dt = horizonSec * Math.max(0.05, Math.abs(locF));
    return {
      x: entity.x + entity.vx * dt,
      y: entity.y + (entity.vy || 0) * dt,
      z: entity.z + entity.vz * dt,
      confidence: Math.max(0.2, 1.0 - Math.abs(locF - 1.0) * 0.35),
    };
  }
}
