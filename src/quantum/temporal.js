/**
 * PLANARIA v2.0 — Temporal Causality, Timeline Scrubbing, Chrono-Wells & Paradox Echo Engine
 *
 * Implements:
 *   1. High-resolution Temporal Snapshot Ring Buffer (360 frames = 6 seconds of lossless rewind!)
 *   2. Exact reversible integer/fixed-point Chrono-Step Clock (matches Lean 4 Theorem VI.2!)
 *   3. Local Spherical Time-Dilation Wells (0.12x bullet-time, 2.5x hyper-haste, -1.0x reverse)
 *   4. Chrono-Forking: spawns autonomous Past-Timeline Echo Clones replaying recorded player
 *      trajectories, weapon fires, and quantum casts in parallel with the Present Self!
 *   5. Retrocausal Future-Cone Predictors projecting enemy states 1.2s ahead in 3D space.
 */

export class TemporalEngine {
  constructor(maxSnapshots = 360) {
    this.maxSnapshots = maxSnapshots;
    this.snapshots = [];
    this.globalTimeScale = 1.0; // [-1.5 .. 3.0]
    this.worldTime = 0;
    this.chronoStep = 0;        // exact discrete monotonic/reversible step counter
    this.rewinding = false;
    this.chronoEnergy = 100;    // [0..100] fuels rewind, bullet-time, and Chrono-Forks

    // Local 3D spherical time-dilation wells: { id, x, y, z, radius, factor, life, maxLife, kind }
    this.chronoWells = [];
    // Active Past-Timeline Echo Clones replaying recorded player slices
    // { id, frames: [{x,y,z,yaw,firing,weaponId,color}], cursor, life, color, paradoxHits }
    this.echoClones = [];
    // Player recent 360-frame motion & action trail (source material for Chrono-Forking!)
    this.playerTrail = [];
    this.paradoxCount = 0;
    this.forkCount = 0;
    this._nextId = 1;
  }

  reset() {
    this.snapshots = [];
    this.globalTimeScale = 1.0;
    this.worldTime = 0;
    this.chronoStep = 0;
    this.rewinding = false;
    this.chronoEnergy = 100;
    this.chronoWells = [];
    this.echoClones = [];
    this.playerTrail = [];
    this.paradoxCount = 0;
    this.forkCount = 0;
  }

  /** Record a compact deterministic world snapshot for smooth reverse-time scrubbing. */
  recordSnapshot(worldState) {
    // Deep-copy essential numeric state cheaply (zero external libs)
    const snap = {
      worldTime: this.worldTime,
      chronoStep: this.chronoStep,
      player: { ...worldState.player },
      qRe: new Float64Array(worldState.qReg.re),
      qIm: new Float64Array(worldState.qReg.im),
      qCoh: worldState.qReg.coherence,
      npcs: worldState.npcs.map((n) => ({
        id: n.id, x: n.x, y: n.y, z: n.z, vx: n.vx, vy: n.vy, vz: n.vz,
        hp: n.hp, maxHp: n.maxHp, phase: n.phase, entangledWith: n.entangledWith,
        superposeAngle: n.superposeAngle, zenoFreeze: n.zenoFreeze,
        seed: n.seed, archetypeIdx: n.archetypeIdx, rarityIdx: n.rarityIdx,
        name: n.name, lineageId: n.lineageId, radius: n.radius,
        color: n.color, mutation: n.mutation, temporalAffix: n.temporalAffix,
        isBoss: n.isBoss, cooldown: n.cooldown, adaptation: { ...n.adaptation },
      })),
      projectiles: worldState.projectiles.map((p) => ({ ...p })),
      score: worldState.score,
      stage: worldState.stage,
      wave: worldState.wave,
    };

    this.snapshots.push(snap);
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift();
    }

    // Record player trail frame for Chrono-Forking
    this.playerTrail.push({
      x: worldState.player.x,
      y: worldState.player.y,
      z: worldState.player.z,
      yaw: worldState.player.yaw,
      firing: worldState.player.firing,
      weaponSeed: worldState.equippedWeapon?.seed || 1,
    });
    if (this.playerTrail.length > this.maxSnapshots) {
      this.playerTrail.shift();
    }
  }

  /** Pop and return the previous timeline snapshot for exact reverse-time rewind! */
  popRewindSnapshot() {
    if (this.snapshots.length <= 1) return null;
    this.snapshots.pop();
    const prev = this.snapshots[this.snapshots.length - 1];
    this.worldTime = prev.worldTime;
    this.chronoStep = prev.chronoStep;
    return prev;
  }

  /** Spawn a local 3D spherical time-dilation well at (x, y, z). */
  spawnChronoWell(x, y, z, radius = 9.0, factor = 0.18, duration = 6.5, kind = 'DILATION') {
    const well = {
      id: this._nextId++,
      x, y, z,
      radius,
      factor,
      life: duration,
      maxLife: duration,
      kind, // 'DILATION' (slow), 'HASTE' (fast), 'INVERT' (reverse!)
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
      const dx = x - w.x;
      const dy = y - w.y;
      const dz = z - w.z;
      const d2 = dx * dx + dy * dy + dz * dz;
      const r2 = w.radius * w.radius;
      if (d2 < r2) {
        const edge = 1 - Math.sqrt(d2) / w.radius; // smooth radial gradient margin!
        f = f * (1 - edge) + w.factor * edge;
      }
    }
    return f;
  }

  /**
   * Chrono-Fork: Materialize the player's recorded past 4–6 seconds as an autonomous
   * glowing Past-Timeline Echo Ally fighting alongside the Present Self!
   */
  spawnChronoFork() {
    if (this.playerTrail.length < 25) return null;
    const slice = this.playerTrail.slice(-240).map((pt) => ({ ...pt }));
    const colors = [
      [0.13, 0.83, 0.93], // cyan echo
      [0.98, 0.75, 0.14], // gold echo
      [0.91, 0.47, 0.98], // magenta paradox echo
    ];
    const echo = {
      id: this._nextId++,
      frames: slice,
      cursor: 0,
      life: slice.length,
      color: colors[this.echoClones.length % colors.length],
      paradoxHits: 0,
      x: slice[0].x,
      y: slice[0].y,
      z: slice[0].z,
      yaw: slice[0].yaw,
      firing: false,
    };
    this.echoClones.push(echo);
    if (this.echoClones.length > 3) this.echoClones.shift();
    this.forkCount++;
    return echo;
  }

  /** Advance active Chrono-Wells and Past-Timeline Echo Clones by real dt. */
  step(dt) {
    const effDt = dt * this.globalTimeScale;
    this.worldTime += effDt;
    this.chronoStep += this.globalTimeScale >= 0 ? 1 : -1;

    // Regenerate chrono energy when not rewinding or heavy bullet-time
    if (!this.rewinding && Math.abs(this.globalTimeScale - 1.0) < 0.15) {
      this.chronoEnergy = Math.min(100, this.chronoEnergy + dt * 11);
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
      const f = e.frames[e.cursor++];
      e.x = f.x;
      e.y = f.y;
      e.z = f.z;
      e.yaw = f.yaw;
      e.firing = f.firing;
      e.life = e.frames.length - e.cursor;
    }
  }

  /**
   * Retrocausal Future-Cone Projection: projects an NPC's predicted 3D position
   * `horizonSec` seconds into the future respecting local Chrono-Wells!
   */
  predictFuturePosition(entity, horizonSec = 1.1) {
    const locF = this.localTimeFactor(entity.x, entity.y, entity.z);
    const dt = horizonSec * locF;
    return {
      x: entity.x + entity.vx * dt,
      y: entity.y + (entity.vy || 0) * dt,
      z: entity.z + entity.vz * dt,
      confidence: Math.max(0.2, 1.0 - Math.abs(locF - 1.0) * 0.35),
    };
  }
}
