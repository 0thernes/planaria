/**
 * PLANARIA v2.0 — Live 3D Temporal-Quantum World & Adaptive Combat Simulation Engine
 *
 * Bridges:
 *   - Real PLANARIA .hbin holographic organism state (Stratum 0..3, RS repairs, Byzantine
 *     quarantines, Mitosis twin-realms, and Cross-Species Xenografts)
 *   - Real 4-Qubit Complex QuantumRegister (Superposition, Bell/GHZ Entanglement, CHSH,
 *     WKB Tunneling, Quantum Zeno Observer Gaze, Heisenberg Stance, Multi-Slit Wavefield)
 *   - Real TemporalEngine (360-frame Rewind, Chrono-Wells, Past-Timeline Echo Clones, Future Cones)
 *   - Endless 1/1 Procedural NPCs, Bosses, Weapons, Armors, Abilities, Skills & 6-Order Stages
 */

import {
  QuantumRegister,
  wkbTunnelingProbability,
  heisenbergStance,
  zenoSuppressionFactor,
  evalWaveInterference,
} from '../quantum/qengine.js';
import { TemporalEngine } from '../quantum/temporal.js';
import {
  SCALE_REALMS,
  RARITY_TIERS,
  NPC_ARCHETYPES,
  SKILL_TREE,
  ABILITIES,
  forgeWeapon,
  forgeArmor,
  forgeNPC,
  buildStageSpec,
} from './generator.js';

export class ChronoQuantumWorld {
  constructor(seed = 2026) {
    this.seed = seed;
    this.qReg = new QuantumRegister(4);
    this.temporal = new TemporalEngine(360);

    // Prepare initial entangled Bell state so CHSH starts live & non-classical!
    this.qReg.prepareBellPair(0, 1);
    this.qReg.H(2);

    this.stage = 1;
    this.wave = 1;
    this.stageSpec = buildStageSpec(1, seed);
    this.scaleOrderOverride = -1; // -1 follows stage; 0..5 allows live Order Shift!

    this.score = 0;
    this.kills = 0;
    this.xp = 0;
    this.level = 1;
    this.skillPoints = 2; // Start with 2 points so user can upgrade immediately!
    this.skills = Object.fromEntries(SKILL_TREE.map((s) => [s.id, 0]));

    this.lootSeq = 1;
    this.weapons = [
      forgeWeapon(seed + 101, 1, 2),
      forgeWeapon(seed + 202, 1, 3),
      forgeWeapon(seed + 303, 2, 4),
      forgeWeapon(seed + 404, 3, 5), // Guaranteed starting 1/1 ANOMALY weapon to showcase!
    ];
    this.weaponIdx = 0;
    this.armors = [
      forgeArmor(seed + 501, 1, 2),
      forgeArmor(seed + 602, 2, 4),
    ];
    this.armorIdx = 0;
    this.recentLoot = [];

    this.player = {
      x: 0,
      y: 1.4,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      yaw: 0,
      pitch: 0,
      hp: 100,
      maxHp: 100,
      shield: this.equippedArmor.maxShield,
      maxShield: this.equippedArmor.maxShield,
      heisenbergStance: 0.5, // [0..1]
      superposeTimer: 0,     // > 0 => player exists in twin Hadamard superposition clones!
      fireCooldown: 0,
      firing: false,
      undoHitCd: 0,
      invulnTimer: 0,
    };

    this.abilityCooldowns = Object.fromEntries(ABILITIES.map((a) => [a.key, 0]));
    this.npcs = [];
    this.projectiles = [];
    this.particles = [];
    this.bellBeams = [];      // visual flashes & Bell-collapse arcs
    this.events = [];         // live telemetry feed

    // Adaptive AI telemetry profile tracking player playstyle
    this.playerProfile = {
      shotsFired: 0,
      beamShots: 0,
      closeKills: 0,
      entangleCount: 0,
      rewindCount: 0,
      beamRatio: 0.5,
      closeRatio: 0.2,
    };

    // Live coupling to PLANARIA .hbin holographic state (including per-organ bundle viability!)
    this.hbinState = {
      bootable: true,
      maxStratum: 3,
      authenticCells: 192,
      rsFixed: 0,
      quarantined: 0,
      xenografts: 0,
      mitosisActive: false,
      immuneEnabled: true,
      speciesName: 'QUANTUM_CHRONICLE',
      lineageRoot: '0000000000000000',
      hasLogic: true,
      hasWireframe: true,
      hasCortexRender: true,
      hasSynthAudio: true,
      hasOrganismFx: true,
      audioXenografted: false,
    };

    this.autopilot = true;
    this.chshValue = this.qReg.computeCHSH(0, 1);
    this.merminValue = this.qReg.computeMermin4();
    this.waveIntensityAtPlayer = 1.0;
    this.liveVoices = Array.from({ length: 4 }, () => ({
      wave: 0, freqHz: 0, vol: 0, detune: 0, filter: 2200,
    }));

    this._projId = 1;
    this._npcId = 1;
    this._lastRsFixed = 0;
    this._preBulletTimeScale = 1.0;
    this._bulletTimeActive = false;
    this._delayedEchoShots = [];
    this._spawnWave();
  }

  get equippedWeapon() {
    return this.weapons[this.weaponIdx] || this.weapons[0];
  }

  get equippedArmor() {
    return this.armors[this.armorIdx] || this.armors[0];
  }

  get activeRealm() {
    if (this.scaleOrderOverride >= 0) return SCALE_REALMS[this.scaleOrderOverride % SCALE_REALMS.length];
    return this.stageSpec.realm;
  }

  pushEvent(text, tone = 'cyan') {
    this.events.unshift({ t: this.temporal.worldTime.toFixed(1), text, tone });
    if (this.events.length > 40) this.events.pop();
  }

  /** Sync live PLANARIA .hbin cellular telemetry into quantum & 3D rendering layers! */
  syncHbinState(decoded, options = {}) {
    if (!decoded) return;
    const prevRsFixed = this._lastRsFixed || 0;
    const newRsFixed = decoded.stats.rsTotalByteErrorsFixed || 0;
    const rsDelta = Math.max(0, newRsFixed - prevRsFixed);
    this._lastRsFixed = newRsFixed;

    const b = decoded.bundles || [];
    this.hbinState = {
      bootable: decoded.bootable,
      maxStratum: decoded.maxViableStratum,
      authenticCells: decoded.stats.authenticCells,
      rsFixed: newRsFixed,
      quarantined: decoded.stats.byzantineQuarantined,
      xenografts: decoded.xenografts.length,
      mitosisActive: Boolean(options.mitosisActive),
      immuneEnabled: decoded.stats.immuneSystemEnabled,
      speciesName: decoded.genome?.name || 'HOLOGRAM',
      lineageRoot: decoded.primaryRootHex || 'NONE',
      hasLogic: Boolean(b[1]?.viable),
      hasWireframe: Boolean(b[2]?.viable),
      hasCortexRender: Boolean(b[3]?.viable),
      hasSynthAudio: Boolean(b[4]?.viable),
      hasOrganismFx: Boolean(b[5]?.viable),
      audioXenografted: b[4]?.source === 'XENOGRAFT',
    };

    // Only apply Lindblad decoherence on NEW radiation repairs (prevents cumulative drain on UI refreshes!)
    // MERKLE_IM armor halves Byzantine/radiation decoherence impact.
    if (rsDelta > 0) {
      const resist = this.equippedArmor.layer.id === 'MERKLE_IM' ? 0.35 : 1.0;
      this.qReg.applyDecoherence(Math.min(0.4, (rsDelta / 8000) * resist));
    }
    // Mitosis shockwave skill boost!
    if (options.mitosisTriggered) {
      this.spawnBurst(this.player.x, this.player.y, this.player.z, [0.13, 0.83, 0.93], 28);
      this.player.shield = Math.min(this.player.maxShield, this.player.shield + 35 + this.skills.hol_mitosis * 12);
      this.pushEvent('PLANARIAN MITOSIS: Zero-overlap 50/50 split triggered twin-realm surge!', 'cyan');
    }
  }

  /** Equip weapon slot 0..3. */
  selectWeapon(idx) {
    if (idx >= 0 && idx < this.weapons.length) {
      this.weaponIdx = idx;
      this.pushEvent(`Equipped [${this.equippedWeapon.rarity.name}] ${this.equippedWeapon.name}`, 'gold');
    }
  }

  /** Equip armor slot. */
  selectArmor(idx) {
    if (idx >= 0 && idx < this.armors.length) {
      this.armorIdx = idx;
      const ratio = this.player.shield / Math.max(1, this.player.maxShield);
      this.player.maxShield = this.equippedArmor.maxShield;
      this.player.shield = Math.round(this.player.maxShield * ratio);
      this.pushEvent(`Equipped Armor: ${this.equippedArmor.name}`, 'good');
    }
  }

  /** Upgrade a skill node in the 4-branch adaptive skill tree. */
  upgradeSkill(skillId) {
    const def = SKILL_TREE.find((s) => s.id === skillId);
    if (!def || this.skillPoints <= 0) return false;
    if (this.skills[skillId] >= def.maxLvl) return false;
    this.skills[skillId]++;
    this.skillPoints--;
    this.pushEvent(`Skill Upgraded: ${def.name} Lv.${this.skills[skillId]}/${def.maxLvl}`, 'good');
    return true;
  }

  /** Forge fresh 1/1 Weapon & Armor from live quantum + SHA-256 entropy. */
  forgeNewGear(minRarity = 1) {
    const entropySeed = `${this.seed}:${this.lootSeq++}:${Math.floor(this.temporal.worldTime * 1000)}:${this.hbinState.lineageRoot.slice(0, 6)}`;
    const w = forgeWeapon(entropySeed, this.stage, minRarity);
    const a = forgeArmor(entropySeed + ':A', this.stage, minRarity);
    if (this.weapons.length < 4) {
      this.weapons.push(w);
      this.weaponIdx = this.weapons.length - 1;
    } else {
      // Replace the lowest-rarity non-equipped weapon (or active slot if all are equal/higher) so 1/1 Anomalies aren't accidentally clobbered!
      let replaceIdx = this.weaponIdx;
      let lowestRarity = this.weapons[replaceIdx].rarity.id;
      for (let i = 0; i < this.weapons.length; i++) {
        if (this.weapons[i].rarity.id < lowestRarity) {
          lowestRarity = this.weapons[i].rarity.id;
          replaceIdx = i;
        }
      }
      this.weapons[replaceIdx] = w;
      this.weaponIdx = replaceIdx;
    }
    if (this.armors.length < 4) {
      this.armors.push(a);
      this.armorIdx = this.armors.length - 1;
    } else {
      this.armors[this.armorIdx] = a;
    }
    this.player.maxShield = this.equippedArmor.maxShield;
    this.player.shield = Math.min(this.player.maxShield, this.player.shield + 40);
    this.recentLoot.unshift(w, a);
    if (this.recentLoot.length > 8) this.recentLoot.length = 8;
    this.pushEvent(`FORGED 1/1 [${w.rarity.name}] ${w.name} (#${w.lineageId})`, 'xeno');
    this.spawnBurst(this.player.x, this.player.y + 1, this.player.z, w.color, 22);
    return { weapon: w, armor: a };
  }

  /** Symmetrically quantum-entangle two weapons in inventory so firing either invokes BOTH mechanics! */
  entangleWeapons(idxA = 0, idxB = 1) {
    if (idxA === idxB || !this.weapons[idxA] || !this.weapons[idxB]) return false;
    this.weapons[idxA].entangledPartner = this.weapons[idxB].lineageId;
    this.weapons[idxA].entangledMod = this.weapons[idxB].qMod;
    this.weapons[idxB].entangledPartner = this.weapons[idxA].lineageId;
    this.weapons[idxB].entangledMod = this.weapons[idxA].qMod;
    this.qReg.prepareBellPair(0, 2);
    this.pushEvent(`QUANTUM-ENTANGLED Weapons #${idxA + 1} <-> #${idxB + 1} (Symmetric Bell Superposition!)`, 'xeno');
    return true;
  }

  /** Trigger one of the 8 Quantum-Temporal Abilities (Q, E, R, T, F, V, X, C). */
  triggerAbility(key) {
    const k = key.toUpperCase();
    const def = ABILITIES.find((a) => a.key === k);
    if (!def) return false;
    if (k === 'R') return false; // Rewind is hold-activated via input.rewindHeld (do not waste CD/energy!)
    if (this.abilityCooldowns[k] > 0) return false;

    // Validate preconditions BEFORE deducting Chrono Energy or starting cooldown!
    if (k === 'E' && this.npcs.length < 2) {
      this.pushEvent('E · BELL WEB requires >= 2 active hostiles to form an entangled link!', 'warn');
      return false;
    }
    if (k === 'T' && this.temporal.trailCount < 25) {
      this.pushEvent('T · CHRONO-FORK needs >= 0.5s of recorded timeline trail first!', 'warn');
      return false;
    }

    const costMult = Math.max(0.4, 1 - this.skills.chr_rewind * 0.12);
    const effCost = def.cost * costMult;
    if (this.temporal.chronoEnergy < effCost) return false;

    this.temporal.chronoEnergy -= effCost;
    this.abilityCooldowns[k] = def.cd;

    switch (k) {
      case 'Q': { // HADAMARD SPLIT — enter twin quantum superposition!
        this.qReg.H(0);
        this.qReg.H(1);
        this.player.superposeTimer = 4.2 + this.skills.sup_clones * 0.6;
        this.spawnBurst(this.player.x, this.player.y, this.player.z, [0.13, 0.83, 0.93], 24);
        this.pushEvent('Q · HADAMARD SPLIT: Player entered twin-state quantum superposition!', 'cyan');
        break;
      }
      case 'E': { // BELL / GHZ ENTANGLEMENT WEB (requires >= 2 targets; no self-entanglement!)
        this.qReg.prepareGHZ();
        this.merminValue = this.qReg.computeMermin4();
        this.playerProfile.entangleCount++;
        const maxLinks = 3 + Math.floor(this.skills.ent_ghz / 2) + 1;
        const sorted = [...this.npcs].sort((a, b) => this._dist2(a, this.player) - this._dist2(b, this.player));
        const targets = sorted.slice(0, maxLinks);
        for (let i = 0; i < targets.length; i++) {
          targets[i].entangledWith = targets[(i + 1) % targets.length].id;
        }
        this.bellBeams.push({
          x0: this.player.x, y0: this.player.y, z0: this.player.z,
          x1: targets[0].x, y1: targets[0].y, z1: targets[0].z,
          life: 0.7, color: [0.91, 0.47, 0.98],
        });
        this.pushEvent(`E · GHZ BELL WEB: Entangled ${targets.length} hostiles (|M4|=${Math.abs(this.merminValue).toFixed(2)} > 2.0)!`, 'xeno');
        break;
      }
      case 'T': { // CHRONO-FORK PAST ECHO CLONE
        const echo = this.temporal.spawnChronoFork(this.skills.chr_fork * 24);
        if (echo) {
          this.spawnBurst(echo.x, echo.y, echo.z, echo.color, 22);
          this.pushEvent(`T · CHRONO-FORK #${this.temporal.forkCount}: Past-Timeline Echo materialized!`, 'cyan');
        }
        break;
      }
      case 'F': { // SPHERICAL CHRONO-WELL (TIME DILATION)
        const armorWellBoost = this.equippedArmor.layer.id === 'CHRONO_GN' ? 1.25 : 1.0;
        const radius = 9.5 * (1 + this.skills.chr_well * 0.2) * armorWellBoost;
        const factor = Math.max(0.08, 0.18 - this.skills.chr_well * 0.02);
        const tx = this.player.x + Math.sin(this.player.yaw) * 8;
        const tz = this.player.z + Math.cos(this.player.yaw) * 8;
        this.temporal.spawnChronoWell(tx, 1.8, tz, radius, factor, 7.0, 'DILATION');
        this.pushEvent(`F · CHRONO-WELL deployed (r=${radius.toFixed(1)}m, time=${factor.toFixed(2)}x)!`, 'gold');
        break;
      }
      case 'V': { // BORN WAVEFUNCTION COLLAPSE SUPERNOVA!
        const entropy = this.qReg.basisEntropy();
        const chsh = Math.abs(this.qReg.computeCHSH(0, 1));
        const m0 = this.qReg.measureQubit(0);
        const m1 = this.qReg.measureQubit(1);
        const dmg = Math.round((75 + entropy * 45 + chsh * 38) * (1 + this.stage * 0.25));
        let hitCount = 0;
        // Snapshot array before damaging so MITOTIC splits aren't double-struck in the same wave!
        for (const npc of [...this.npcs]) {
          if (npc.hp > 0 && Math.sqrt(this._dist2(npc, this.player)) < 24) {
            this._damageNPC(npc, dmg, 'COLLAPSE', true);
            hitCount++;
          }
        }
        this.qReg.prepareBellPair(0, 1);
        this.qReg.restoreCoherence(0.35);
        this.spawnBurst(this.player.x, this.player.y, this.player.z, [0.98, 0.75, 0.14], 42);
        this.pushEvent(`V · WAVEFUNCTION COLLAPSE |${m0.outcome}${m1.outcome}>: ${dmg} dmg to ${hitCount} targets (H=${entropy.toFixed(2)} bits)!`, 'gold');
        break;
      }
      case 'X': { // SHIFT SCALE ORDER ACROSS 6 ORDERS OF MAGNITUDE
        const cur = this.activeRealm.orderIdx;
        this.scaleOrderOverride = (cur + 1) % SCALE_REALMS.length;
        const r = this.activeRealm;
        this.pushEvent(`X · SCALE ORDER SHIFT -> ${r.scaleLabel} (${r.name})!`, 'cyan');
        break;
      }
      case 'C': { // FORGE NEW 1/1 LOOT
        this.forgeNewGear(2);
        break;
      }
      default:
        break;
    }
    return true;
  }

  /** Jump immediately to next endless stage (or advance naturally when boss falls). */
  advanceStage() {
    this.stage++;
    this.wave = 1;
    this.scaleOrderOverride = -1;
    this.stageSpec = buildStageSpec(this.stage, this.seed);
    this.npcs = [];
    this.projectiles = [];
    this.qReg.prepareBellPair(0, 1);
    this.qReg.restoreCoherence(0.5);
    this.player.hp = this.player.maxHp;
    this.player.shield = this.player.maxShield;
    this._spawnWave();
    this.pushEvent(`ASCENDED TO ${this.stageSpec.title} (${this.stageSpec.realm.scaleLabel})!`, 'good');
  }

  _spawnWave() {
    const isBossWave = this.wave >= this.stageSpec.wavesPerStage;
    const count = isBossWave ? 3 + Math.min(4, this.stage) : 4 + Math.min(8, this.stage + this.wave);
    const waveSeedBase = this.seed * 31 + this.stage * 997 + this.wave * 131;

    if (isBossWave) {
      const boss = forgeNPC(waveSeedBase, this.stage, this.wave, true, this.playerProfile, this._npcId++);
      this.npcs.push(boss);
      this.pushEvent(`STAGE ${this.stage} SINGULARITY BOSS: ${boss.name} (#${boss.lineageId})!`, 'bad');
    }

    const spawned = [];
    for (let i = 0; i < count; i++) {
      const npc = forgeNPC(waveSeedBase + i * 17 + 7, this.stage, this.wave, false, this.playerProfile, this._npcId++);
      this.npcs.push(npc);
      spawned.push(npc);
    }

    // Automatically entangle any ENTANGLED-mutation NPCs into real Bell pairs!
    const entList = spawned.filter((n) => n.mutation === 'ENTANGLED');
    for (let i = 0; i + 1 < entList.length; i += 2) {
      entList[i].entangledWith = entList[i + 1].id;
      entList[i + 1].entangledWith = entList[i].id;
    }
  }

  _dist2(a, b) {
    const dx = a.x - b.x;
    const dy = (a.y || 0) - (b.y || 0);
    const dz = a.z - b.z;
    return dx * dx + dy * dy + dz * dz;
  }

  spawnBurst(x, y, z, color, count = 14) {
    for (let i = 0; i < count; i++) {
      const th = Math.random() * Math.PI * 2;
      const ph = (Math.random() - 0.3) * Math.PI;
      const spd = 3 + Math.random() * 11;
      this.particles.push({
        x, y, z,
        vx: Math.cos(th) * Math.cos(ph) * spd,
        vy: Math.sin(ph) * spd + 2,
        vz: Math.sin(th) * Math.cos(ph) * spd,
        life: 0.35 + Math.random() * 0.55,
        maxLife: 0.9,
        size: 0.18 + Math.random() * 0.25,
        color,
      });
    }
    if (this.particles.length > 360) {
      this.particles.splice(0, this.particles.length - 360);
    }
  }

  _fireWeaponFrom(origin, yaw, weapon, isEcho = false) {
    const hStance = heisenbergStance(this.player.heisenbergStance);
    const xenoBoost = this.hbinState.xenografts > 0 ? 1 + this.skills.hol_xeno * 0.22 : 1.0;
    const ridgeBoost =
      weapon.qMod.id === 'INTERFERENCE' && this.waveIntensityAtPlayer > 1.35 ? 2.2 : 1.0;
    const echoScale = isEcho ? (0.55 + this.skills.chr_fork * 0.25) : 1.0;

    // Retrocausal target leading if weapon has RETRO temporal mod!
    let aimYaw = yaw;
    if (weapon.tMod.id === 'RETRO' && this.npcs.length > 0) {
      const nearest = this.npcs.reduce((best, n) =>
        this._dist2(n, origin) < this._dist2(best, origin) ? n : best
      );
      const pred = this.temporal.predictFuturePosition(nearest, 0.45);
      aimYaw = Math.atan2(pred.x - origin.x, pred.z - origin.z);
    }

    // Schedule delayed Timeline-Echo ghost bolt (0.35s later) when weapon has ECHO temporal mod
    if (!isEcho && weapon.tMod.id === 'ECHO' && this._delayedEchoShots.length < 16) {
      this._delayedEchoShots.push({
        delay: 0.35,
        origin: { x: origin.x, y: origin.y, z: origin.z },
        yaw: aimYaw,
        weapon,
      });
    }

    const totalBolts = weapon.projectileCount;
    const copies = (!isEcho && this.player.superposeTimer > 0) ? 2 : 1;

    for (let c = 0; c < copies; c++) {
      const lateralOff = copies === 2 ? (c === 0 ? -1.4 : 1.4) : 0;
      const ox = origin.x + Math.cos(aimYaw) * lateralOff;
      const oz = origin.z - Math.sin(aimYaw) * lateralOff;

      for (let i = 0; i < totalBolts; i++) {
        if (this.projectiles.length >= 240) break;
        const frac = totalBolts === 1 ? 0 : (i / (totalBolts - 1) - 0.5);
        const jitter = (Math.random() - 0.5) * (1 - hStance.aimPrecision) * 0.16;
        const ang = aimYaw + frac * weapon.spread + jitter;
        const collapseScale = weapon.qMod.id === 'COLLAPSE' ? 1 + this.qReg.basisEntropy() * 0.14 : 1.0;
        const dmg = Math.round(
          weapon.damage * hStance.critMultiplier * xenoBoost * ridgeBoost * echoScale * collapseScale *
          (1 + this.skills.sup_clones * 0.15)
        );
        this.projectiles.push({
          id: this._projId++,
          fromPlayer: true,
          x: ox,
          y: origin.y + 0.2,
          z: oz,
          vx: Math.sin(ang) * weapon.speed,
          vy: 0,
          vz: Math.cos(ang) * weapon.speed,
          damage: dmg,
          life: 1.9,
          radius: weapon.frame.pattern === 'WAVE' ? 0.85 : 0.42,
          color: isEcho ? [0.13, 0.83, 0.93] : [...weapon.color],
          framePattern: weapon.frame.pattern,
          qModId: weapon.qMod.id,
          tModId: weapon.tMod.id,
          entangledModId: weapon.entangledMod?.id || null,
          tunnelEnergy: weapon.tunnelFactor + this.skills.sup_tunnel * 0.12,
          tunneled: false,
          splitDone: false,
          pierce: weapon.frame.pattern === 'PIERCE' ? 3 : 0,
          passedPillars: new Set(),
          hitIds: new Set(),
        });
      }
    }

    if (!isEcho) {
      // Exponential moving average so Adaptive AI dynamically responds to tactic shifts!
      const isBeam = (weapon.frame.pattern === 'BEAM' || weapon.frame.pattern === 'PIERCE') ? 1 : 0;
      this.playerProfile.shotsFired++;
      if (isBeam) this.playerProfile.beamShots++;
      this.playerProfile.beamRatio = this.playerProfile.beamRatio * 0.92 + isBeam * 0.08;
    }
  }

  _damageNPC(npc, rawDmg, sourceTag = 'BOLT', allowEcho = true, framePattern = null) {
    let dmg = rawDmg;
    // Adaptive beam resistance (now properly triggered by BEAM/PIERCE weapon frames!)
    if ((sourceTag === 'BEAM' || framePattern === 'BEAM' || framePattern === 'PIERCE') && npc.adaptation.beamResist > 0) {
      dmg *= (1 - npc.adaptation.beamResist);
    }
    // Superposed NPCs have probabilistic dodge until collapsed (DECOHERE bypasses!)
    if (npc.mutation === 'SUPERPOSED' && sourceTag !== 'COLLAPSE' && sourceTag !== 'DECOHERE' && Math.random() < 0.28) {
      this.spawnBurst(npc.x, npc.y, npc.z, [0.13, 0.83, 0.93], 5);
      return;
    }

    npc.hp -= Math.round(dmg);
    this.spawnBurst(npc.x, npc.y, npc.z, npc.color, 7);

    // Planarian Mitotic NPC splits into 2 smaller living halves at 50% HP!
    if (npc.mutation === 'MITOTIC' && !npc.mitosisDone && npc.hp > 0 && npc.hp < npc.maxHp * 0.52 && this.npcs.length < 22) {
      npc.mitosisDone = true;
      const clone = {
        ...npc,
        id: this._npcId++,
        x: npc.x + 2.4,
        z: npc.z - 2.4,
        radius: npc.radius * 0.78,
        maxHp: Math.round(npc.maxHp * 0.5),
        hp: Math.round(npc.hp),
        mitosisDone: true,
        entangledWith: null,
        color: [...npc.color],
        adaptation: { ...npc.adaptation },
      };
      this.npcs.push(clone);
      this.pushEvent(`NPC MITOSIS: ${npc.name} split into two living halves!`, 'warn');
    }

    // Non-local Quantum Bell Entanglement damage echo (strictly partner.id !== npc.id!)
    if (allowEcho && npc.entangledWith !== null && npc.entangledWith !== npc.id) {
      const partner = this.npcs.find((other) => other.id === npc.entangledWith && other.id !== npc.id && other.hp > 0);
      if (partner) {
        const echoMult = 0.55 + this.skills.ent_bell * 0.12;
        this.bellBeams.push({
          x0: npc.x, y0: npc.y, z0: npc.z,
          x1: partner.x, y1: partner.y, z1: partner.z,
          life: 0.45, color: [0.91, 0.47, 0.98],
        });
        this._damageNPC(partner, Math.round(dmg * echoMult), 'BELL_ECHO', false);
      }
    }
  }

  /**
   * Main 60 FPS Simulation Tick (supports forward, slow-mo, haste, AND true lossless reverse Rewind!).
   * @param {number} dt real frame delta seconds (clamped <= 0.05)
   * @param {object} input { moveX, moveZ, fire, aimYaw, rewindHeld, bulletTimeHeld, customTimeScale, pvmRam, pvmVoices }
   */
  step(dt, input = {}) {
    const cdt = Math.min(0.05, Math.max(0.001, Number.isFinite(dt) ? dt : 0.016));

    // If PLANARIA .hbin Stratum 0 Stem Nucleus is dead, freeze simulation!
    if (!this.hbinState.bootable) {
      this.liveVoices.forEach((v) => { v.vol = 0; v.wave = 0; });
      return;
    }

    // 1. TRUE LOSSLESS TEMPORAL REWIND MODE (Hold R!)
    if (input.rewindHeld && this.temporal.chronoEnergy > 2 && this.temporal.snapshotCount > 2) {
      this.temporal.rewinding = true;
      this.temporal.chronoEnergy = Math.max(0, this.temporal.chronoEnergy - cdt * (26 * (1 - this.skills.chr_rewind * 0.18)));
      const snap = this.temporal.popRewindSnapshot();
      if (snap) {
        this.player = { ...this.player, ...snap.player };
        this.qReg.re.set(snap.qRe);
        this.qReg.im.set(snap.qIm);
        this.qReg.coherence = snap.qCoh;
        this.chshValue = this.qReg.computeCHSH(0, 1);
        this.merminValue = this.qReg.computeMermin4();
        this.npcs = snap.npcs.map((n) => ({
          ...n,
          archetype: NPC_ARCHETYPES[n.archetypeIdx] || NPC_ARCHETYPES[0],
          rarity: RARITY_TIERS[n.rarityIdx] || RARITY_TIERS[0],
          speed: Number.isFinite(n.speed) ? n.speed : (NPC_ARCHETYPES[n.archetypeIdx]?.speed || 6.0),
        }));
        this.projectiles = snap.projectiles;
        this.score = snap.score;
        this.kills = snap.kills;
        this.xp = snap.xp;
        this.level = snap.level;
        this.skillPoints = snap.skillPoints;
        if (snap.stage !== this.stage) {
          this.stage = snap.stage;
          this.stageSpec = buildStageSpec(this.stage, this.seed);
        }
        this.wave = snap.wave;
        if (snap.abilityCooldowns) this.abilityCooldowns = { ...snap.abilityCooldowns };
        if (snap.chronoWells) this.temporal.chronoWells = snap.chronoWells;
        if (snap.echoClones) this.temporal.echoClones = snap.echoClones;
        this.playerProfile.rewindCount++;
      }
      this._updateAdaptiveAudio(true, input.pvmVoices);
      return;
    }
    this.temporal.rewinding = false;

    // Bullet-time global slow-motion (Hold Shift) — cleanly saves/restores customTimeScale!
    if (input.bulletTimeHeld && this.temporal.chronoEnergy > 2) {
      if (!this._bulletTimeActive) {
        this._preBulletTimeScale = this.temporal.globalTimeScale;
        this._bulletTimeActive = true;
      }
      this.temporal.globalTimeScale = 0.24;
      const btDrain = 18 * Math.max(0.28, 1 - this.skills.chr_rewind * 0.18);
      this.temporal.chronoEnergy = Math.max(0, this.temporal.chronoEnergy - cdt * btDrain);
    } else {
      if (this._bulletTimeActive) {
        this._bulletTimeActive = false;
        if (input.customTimeScale) {
          this.temporal.globalTimeScale = this._preBulletTimeScale;
        }
      }
      if (!input.customTimeScale) {
        const alpha = 1 - Math.exp(-9 * cdt);
        this.temporal.globalTimeScale += (1.0 - this.temporal.globalTimeScale) * alpha;
      }
    }

    // Advance temporal clock, wells & Past-Timeline Echo Clones
    const chronoRegenMult = this.equippedArmor.layer.id === 'CHRONO_GN' ? 1.45 : 1.0;
    this.temporal.step(cdt, chronoRegenMult);
    const wdt = cdt * Math.max(0.05, Math.abs(this.temporal.globalTimeScale));

    // Unitary continuous phase evolution driven by ALL 4 living .hbin species' PVM-32 RAM!
    const pvmEntropy = input.pvmRam
      ? (((input.pvmRam[11] || 0) ^ (input.pvmRam[1] || 0) ^ (input.pvmRam[3] || 0)) & 255) / 255
      : 0.3;
    this.qReg.RZ(0, wdt * (1.2 + pvmEntropy));
    this.qReg.RY(2, wdt * 0.85);
    this.qReg.RZ(3, wdt * 1.4);
    this.chshValue = this.qReg.computeCHSH(0, 1);
    this.merminValue = this.qReg.computeMermin4();

    // Process delayed Timeline-Echo weapon shots
    for (let i = this._delayedEchoShots.length - 1; i >= 0; i--) {
      this._delayedEchoShots[i].delay -= cdt;
      if (this._delayedEchoShots[i].delay <= 0) {
        const s = this._delayedEchoShots.splice(i, 1)[0];
        this._fireWeaponFrom(s.origin, s.yaw, s.weapon, true);
      }
    }

    // Passive coherence & shield recovery (boosted by RS_HEAL armor & hol_rs skill)
    const regen = (this.equippedArmor.regenRate + this.skills.hol_rs * 3.5) * cdt;
    this.player.shield = Math.min(this.player.maxShield, this.player.shield + regen);
    this.qReg.restoreCoherence(cdt * (0.04 + this.skills.hol_rs * 0.025));

    // Decay timers
    for (const k of Object.keys(this.abilityCooldowns)) {
      if (this.abilityCooldowns[k] > 0) this.abilityCooldowns[k] = Math.max(0, this.abilityCooldowns[k] - cdt);
    }
    if (this.player.superposeTimer > 0) this.player.superposeTimer = Math.max(0, this.player.superposeTimer - cdt);
    if (this.player.fireCooldown > 0) this.player.fireCooldown = Math.max(0, this.player.fireCooldown - cdt);
    if (this.player.undoHitCd > 0) this.player.undoHitCd = Math.max(0, this.player.undoHitCd - cdt);
    if (this.player.invulnTimer > 0) this.player.invulnTimer = Math.max(0, this.player.invulnTimer - cdt);

    // 2. PLAYER MOVEMENT & AUTOPILOT COMBAT
    let mx = input.moveX || 0;
    let mz = input.moveZ || 0;
    let wantFire = Boolean(input.fire);
    let aimYaw = input.aimYaw !== undefined ? input.aimYaw : this.player.yaw;

    const manualActive = Math.abs(mx) > 0.05 || Math.abs(mz) > 0.05;
    if (this.autopilot && !manualActive) {
      // Smart tactical autopilot: orbits stage, surfs constructive wave ridges, aims at nearest threat!
      const t = this.temporal.worldTime;
      const targetX = Math.cos(t * 0.62) * 12.5 + Math.sin(t * 1.35) * 4.2;
      const targetZ = Math.sin(t * 0.55) * 12.5 + Math.cos(t * 1.1) * 4.2;
      mx = targetX - this.player.x;
      mz = targetZ - this.player.z;
      const mLen = Math.hypot(mx, mz) || 1;
      mx /= mLen;
      mz /= mLen;

      if (this.npcs.length > 0) {
        const nearest = this.npcs.reduce((b, n) =>
          this._dist2(n, this.player) < this._dist2(b, this.player) ? n : b
        );
        aimYaw = Math.atan2(nearest.x - this.player.x, nearest.z - this.player.z);
        wantFire = true;

        // Autopilot opportunistically triggers quantum abilities for awesome live demos!
        if (this.abilityCooldowns.E <= 0 && this.npcs.length >= 3 && Math.random() < 0.015) this.triggerAbility('E');
        else if (this.abilityCooldowns.Q <= 0 && Math.random() < 0.008) this.triggerAbility('Q');
        else if (this.abilityCooldowns.T <= 0 && this.temporal.trailCount > 100 && Math.random() < 0.006) this.triggerAbility('T');
        else if (this.abilityCooldowns.F <= 0 && Math.random() < 0.005) this.triggerAbility('F');
      }
    }

    // Normalize manual diagonal movement so WASD doesn't move 1.414x faster diagonally
    const mMag = Math.hypot(mx, mz);
    if (mMag > 1) { mx /= mMag; mz /= mMag; }

    const moveSpd = 12.8 * this.equippedArmor.speedMult * (this.hbinState.xenografts > 0 ? 1 + this.skills.hol_xeno * 0.06 : 1.0);
    this.player.vx = mx * moveSpd;
    this.player.vz = mz * moveSpd;
    this.player.x += this.player.vx * cdt;
    this.player.z += this.player.vz * cdt;
    this.player.y = 1.45 + Math.sin(this.temporal.worldTime * 3.1) * 0.28;
    this.player.yaw = aimYaw;

    // Keep inside arena radius
    const pR = Math.hypot(this.player.x, this.player.z);
    const maxR = this.stageSpec.arenaRadius - 2.2;
    if (pR > maxR) {
      this.player.x = (this.player.x / pR) * maxR;
      this.player.z = (this.player.z / pR) * maxR;
    }

    // Evaluate real multi-slit wave interference intensity beneath player!
    this.waveIntensityAtPlayer = evalWaveInterference(
      this.player.x, this.player.z, this.temporal.worldTime, this.stageSpec.waveSources
    );

    // Fire equipped 1/1 weapon
    this.player.firing = false;
    if (wantFire && this.player.fireCooldown <= 0) {
      this._fireWeaponFrom(this.player, aimYaw, this.equippedWeapon, false);
      this.player.fireCooldown = 1 / Math.max(0.5, this.equippedWeapon.fireRate);
      this.player.firing = true;
    }

    // Past-Timeline Echo Clones fire EVERY recorded pulse using their recorded weapon snapshot!
    for (const echo of this.temporal.echoClones) {
      if (echo.firing) {
        this._fireWeaponFrom(echo, echo.yaw, echo.weaponRef || this.equippedWeapon, true);
      }
    }

    // 3. UPDATE ADAPTIVE QUANTUM-TEMPORAL NPCs
    const lookDx = Math.sin(this.player.yaw);
    const lookDz = Math.cos(this.player.yaw);

    for (let i = this.npcs.length - 1; i >= 0; i--) {
      const n = this.npcs[i];
      if (n.hp <= 0) {
        this._handleNPCDeath(n);
        this.npcs.splice(i, 1);
        continue;
      }

      if (n.stasisTimer > 0) {
        n.stasisTimer = Math.max(0, n.stasisTimer - cdt);
        n.zenoFreeze = 0.95;
        continue;
      }

      // Local spherical time dilation + Quantum Zeno Observer Gaze!
      const localTime = Math.max(0.05, Math.abs(this.temporal.localTimeFactor(n.x, n.y, n.z)));
      const toNx = n.x - this.player.x;
      const toNz = n.z - this.player.z;
      const dist = Math.hypot(toNx, toNz) || 1;
      const gazeDot = (toNx * lookDx + toNz * lookDz) / dist;

      // Observer Effect / Quantum Zeno Suppression when player looks straight at NPC!
      let zenoMult = 1.0;
      if (gazeDot > 0.86) {
        const zStr = (n.mutation === 'ZENO_LOCKED' ? 4.2 : 0.8) + this.skills.ent_zeno * 0.45;
        zenoMult = zenoSuppressionFactor((gazeDot - 0.86) / 0.14, zStr);
        n.zenoFreeze = Math.max(n.zenoFreeze * 0.85, 1 - zenoMult);
      } else {
        n.zenoFreeze *= 0.85;
        if (n.mutation === 'ZENO_LOCKED') zenoMult = 1.65;
      }
      if (n.zenoFreeze > 0.1) zenoMult = Math.min(zenoMult, 1 - n.zenoFreeze * 0.7);

      // Adaptive AI counters: ANTI-CLOSE repulsion & ANTI-BELL coherence drain
      if (n.adaptation.closeRepulse > 0 && dist < 8.5) {
        const push = (8.5 - dist) * 2.2 * cdt;
        this.player.x -= (toNx / dist) * push;
        this.player.z -= (toNz / dist) * push;
      }
      if ((n.adaptation.coherenceDrain > 0 || n.mutation === 'BYZANTINE') && !this.hbinState.immuneEnabled) {
        this.qReg.applyDecoherence(cdt * 0.12);
      }

      const ndt = cdt * localTime * zenoMult;
      n.phase += ndt * 2.6;
      n.superposeAngle += ndt * 3.4;

      // Orbit & pursue tactical AI
      const desiredRange = n.isBoss ? 14 : (n.archetype?.range || 12) * 0.72;
      const radialDir = dist > desiredRange ? -1 : (dist < desiredRange * 0.6 ? 1 : 0);
      const tangX = -toNz / dist;
      const tangZ = toNx / dist;
      const orbitSign = (n.id & 1) ? 1 : -1;

      n.vx = ((toNx / dist) * radialDir * 0.75 + tangX * orbitSign * 0.65) * n.speed;
      n.vz = ((toNz / dist) * radialDir * 0.75 + tangZ * orbitSign * 0.65) * n.speed;
      n.x += n.vx * ndt;
      n.z += n.vz * ndt;
      n.y = (n.isBoss ? 3.2 : 1.7) + Math.sin(n.phase) * 0.65;

      // Keep inside arena
      const nr = Math.hypot(n.x, n.z);
      if (nr > this.stageSpec.arenaRadius - 2) {
        n.x = (n.x / nr) * (this.stageSpec.arenaRadius - 2);
        n.z = (n.z / nr) * (this.stageSpec.arenaRadius - 2);
      }

      // Hostile quantum firing
      n.cooldown -= ndt;
      if (n.cooldown <= 0 && this.projectiles.length < 240) {
        n.cooldown = (n.archetype?.fireCd || 1.6) * (n.isBoss ? 0.65 : 1.0);
        const aim = Math.atan2(this.player.x - n.x, this.player.z - n.z);
        const burst = n.isBoss ? 5 : (n.mutation === 'INTERFERING' ? 3 : 1);
        const resonantBoost = n.mutation === 'RESONANT' ? 1.25 : 1.0;
        for (let b = 0; b < burst; b++) {
          const spread = burst === 1 ? 0 : (b / (burst - 1) - 0.5) * 0.55;
          this.projectiles.push({
            id: this._projId++,
            fromPlayer: false,
            x: n.x, y: n.y, z: n.z,
            vx: Math.sin(aim + spread) * (n.isBoss ? 18 : 14.5),
            vy: 0,
            vz: Math.cos(aim + spread) * (n.isBoss ? 18 : 14.5),
            damage: Math.round((n.isBoss ? 22 : 11) * (1 + this.stage * 0.16) * resonantBoost),
            life: 2.6,
            radius: n.isBoss ? 0.55 : 0.36,
            color: n.isBoss ? [0.96, 0.25, 0.37] : [0.98, 0.45, 0.25],
            tunnelEnergy: n.mutation === 'TUNNELER' ? 0.95 : 0.15,
            tunneled: false,
            sourceNpcId: n.id,
            passedPillars: new Set(),
            hitIds: new Set(),
          });
        }
      }
    }

    // 4. UPDATE PROJECTILES (WKB PILLAR TUNNELING ONCE/PILLAR, CHRONO-WELLS, SAFE COLLISIONS)
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      const locF = p.fromPlayer ? 1.0 : Math.max(0.12, Math.abs(this.temporal.localTimeFactor(p.x, p.y, p.z)));
      const zenoAura = (!p.fromPlayer && this.equippedArmor.layer.id === 'ZENO_AURA' && this._dist2(p, this.player) < 81) ? 0.62 : 1.0;
      const pdt = cdt * locF * zenoAura;

      // Berry Phase homing curve for PHASE_SHIFT weapons
      if (p.fromPlayer && (p.qModId === 'PHASE_SHIFT' || p.entangledModId === 'PHASE_SHIFT') && this.npcs.length > 0) {
        const tgt = this.npcs[0];
        const desiredAng = Math.atan2(tgt.x - p.x, tgt.z - p.z);
        const curAng = Math.atan2(p.vx, p.vz);
        let diff = desiredAng - curAng;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        const spd = Math.hypot(p.vx, p.vz);
        const newAng = curAng + Math.max(-2.6 * pdt, Math.min(2.6 * pdt, diff));
        p.vx = Math.sin(newAng) * spd;
        p.vz = Math.cos(newAng) * spd;
      }

      p.x += p.vx * pdt;
      p.z += p.vz * pdt;
      p.life -= cdt;

      // Mid-flight Planarian Mitosis temporal weapon mod!
      if (p.fromPlayer && p.tModId === 'MITOSIS' && !p.splitDone && p.life < 1.55 && this.projectiles.length < 240) {
        p.splitDone = true;
        const ang = Math.atan2(p.vx, p.vz);
        const spd = Math.hypot(p.vx, p.vz);
        this.projectiles.push({
          ...p,
          id: this._projId++,
          vx: Math.sin(ang + 0.2) * spd,
          vz: Math.cos(ang + 0.2) * spd,
          color: [...p.color],
          passedPillars: new Set(p.passedPillars),
          hitIds: new Set(p.hitIds),
          splitDone: true,
        });
      }

      if (p.life <= 0 || Math.hypot(p.x, p.z) > this.stageSpec.arenaRadius + 4) {
        this.projectiles.splice(i, 1);
        continue;
      }

      // Check WKB Quantum Tunneling STRICTLY ONCE per (projectile, pillar) encounter!
      if (!p.passedPillars) p.passedPillars = new Set();
      let absorbedByPillar = false;
      for (let pilIdx = 0; pilIdx < this.stageSpec.pillars.length; pilIdx++) {
        if (p.passedPillars.has(pilIdx)) continue;
        const pil = this.stageSpec.pillars[pilIdx];
        const dx = p.x - pil.x;
        const dz = p.z - pil.z;
        if (dx * dx + dz * dz < (pil.radius + p.radius) * (pil.radius + p.radius)) {
          const T = wkbTunnelingProbability(
            p.tunnelEnergy * this.activeRealm.tunnelBoost,
            pil.barrierV0,
            pil.radius * 0.35
          );
          if (Math.random() < T) {
            p.passedPillars.add(pilIdx);
            if (!p.tunneled) {
              p.tunneled = true;
              const skillBoost = 1 + this.skills.sup_tunnel * 0.18;
              const modBoost = p.qModId === 'TUNNEL_CRIT' || p.entangledModId === 'TUNNEL_CRIT' ? 1.8 : 1.0;
              p.damage = Math.round(p.damage * skillBoost * modBoost);
              if (modBoost > 1.0) { p.vx *= 1.35; p.vz *= 1.35; }
              this.spawnBurst(p.x, p.y, p.z, [0.13, 0.83, 0.93], 4);
            }
          } else {
            absorbedByPillar = true;
            this.spawnBurst(p.x, p.y, p.z, p.color, 5);
            break;
          }
        }
      }
      if (absorbedByPillar) {
        this.projectiles.splice(i, 1);
        continue;
      }

      if (p.fromPlayer) {
        if (!p.hitIds) p.hitIds = new Set();
        let consumed = false;
        // Snapshot NPCs so MITOTIC splits aren't hit on their birth tick!
        for (const n of [...this.npcs]) {
          if (n.hp <= 0 || p.hitIds.has(n.id)) continue;
          const dx = p.x - n.x;
          const dz = p.z - n.z;
          const hitR = n.radius + p.radius;
          if (dx * dx + dz * dz < hitR * hitR) {
            p.hitIds.add(n.id);
            // Paradox-Rift bonus near any active Timeline Echo!
            let hitDmg = p.damage;
            if (p.tModId === 'PARADOX' && this.temporal.echoClones.some((e) => Math.hypot(n.x - e.x, n.z - e.z) < 8)) {
              hitDmg = Math.round(hitDmg * 1.65);
            }
            this._damageNPC(n, hitDmg, p.qModId, true, p.framePattern);

            // Apply Quantum & Temporal weapon hit hooks (primary + entangled weapon mod!)
            const hasMod = (id) => p.qModId === id || p.entangledModId === id;
            if (hasMod('ENTANGLE') || hasMod('GHZ_CASCADE')) {
              const others = this.npcs.filter((o) => o.id !== n.id && o.hp > 0);
              if (others.length >= 1) {
                n.entangledWith = others[0].id;
                others[0].entangledWith = (hasMod('GHZ_CASCADE') && others.length >= 2) ? others[1].id : n.id;
                if (hasMod('GHZ_CASCADE') && others.length >= 2) others[1].entangledWith = n.id;
              }
            }
            if (hasMod('ZENO')) n.zenoFreeze = Math.max(n.zenoFreeze, 0.68);
            if (hasMod('DECOHERE')) n.adaptation.beamResist = 0;
            if (hasMod('SPIN_FLIP')) { n.vx = -n.vx; n.vz = -n.vz; }
            if (hasMod('CAUCHY')) {
              this.player.shield = Math.min(this.player.maxShield, this.player.shield + 6);
            }
            if (p.tModId === 'REWIND') {
              this.temporal.chronoEnergy = Math.min(100, this.temporal.chronoEnergy + 4);
            }
            if (p.tModId === 'STASIS') {
              n.stasisTimer = Math.max(n.stasisTimer || 0, 0.6);
            }
            if (p.tModId === 'DILATE' && this.temporal.chronoWells.length < 4) {
              this.temporal.spawnChronoWell(n.x, n.y, n.z, 4.5, 0.28, 2.2, 'DILATION');
            }
            if (p.pierce > 0) {
              p.pierce--;
            } else {
              consumed = true;
              break;
            }
          }
        }
        if (consumed) this.projectiles.splice(i, 1);
      } else {
        // Hostile projectile hitting Past-Timeline Echo (explicit `intercepted` flag prevents double-hit/splice bug!)
        let intercepted = false;
        for (const echo of this.temporal.echoClones) {
          if (Math.hypot(p.x - echo.x, p.z - echo.z) < 1.3) {
            echo.paradoxHits++;
            this.temporal.paradoxCount++;
            this.spawnBurst(echo.x, echo.y, echo.z, [0.91, 0.47, 0.98], 12);
            this.projectiles.splice(i, 1);
            intercepted = true;
            break;
          }
        }
        if (intercepted) continue;

        if (Math.hypot(p.x - this.player.x, p.z - this.player.z) < 1.25) {
          this._damagePlayer(p);
          this.projectiles.splice(i, 1);
        }
      }
    }

    // 5. PARTICLES & BELL BEAMS
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx * cdt;
      pt.y += pt.vy * cdt;
      pt.z += pt.vz * cdt;
      pt.vy -= 9.5 * cdt;
      if (pt.y < 0.1) { pt.y = 0.1; pt.vy *= -0.4; }
      pt.life -= cdt;
      if (pt.life <= 0) this.particles.splice(i, 1);
    }
    for (let i = this.bellBeams.length - 1; i >= 0; i--) {
      this.bellBeams[i].life -= cdt;
      if (this.bellBeams[i].life <= 0) this.bellBeams.splice(i, 1);
    }

    // 6. WAVE / STAGE PROGRESSION
    if (this.npcs.length === 0) {
      if (this.wave < this.stageSpec.wavesPerStage) {
        this.wave++;
        this._spawnWave();
        this.pushEvent(`Stage ${this.stage} · Wave ${this.wave}/${this.stageSpec.wavesPerStage} materialized!`, 'cyan');
      } else {
        this.forgeNewGear(Math.min(5, 2 + Math.floor(this.stage / 2)));
        this.advanceStage();
      }
    }

    // 7. RECORD TEMPORAL SNAPSHOT & UPDATE ADAPTIVE HARMONIC AUDIO
    this.temporal.recordSnapshot(this);
    this._updateAdaptiveAudio(false, input.pvmVoices);
  }

  _damagePlayer(proj) {
    if (this.player.invulnTimer > 0) return;
    const hStance = heisenbergStance(this.player.heisenbergStance);
    const totalDodge = Math.min(
      0.82,
      this.equippedArmor.phaseDodge +
        hStance.evasionChance * (1 + this.skills.sup_heisen * 0.08) +
        (this.player.superposeTimer > 0 ? 0.35 : 0)
    );
    if (Math.random() < totalDodge) {
      this.spawnBurst(this.player.x, this.player.y, this.player.z, [0.13, 0.83, 0.93], 6);
      return;
    }

    // Retrocausal Hit-Rewind Armor Layer
    if (this.equippedArmor.layer.id === 'TIME_UNDO' && this.player.undoHitCd <= 0 && this.player.shield < proj.damage) {
      this.player.undoHitCd = 10.0;
      this.player.shield = Math.min(this.player.maxShield, this.player.shield + 45);
      this.pushEvent('ARMOR RETROCAUSAL UNDO: Lethal hit erased from timeline!', 'gold');
      return;
    }

    // Superposition Decoy Armor Layer: briefly grants twin superposition decoy on hit
    if (this.equippedArmor.layer.id === 'SUPER_DEC' && this.player.superposeTimer <= 0) {
      this.player.superposeTimer = 1.6;
    }

    // Bell-State Reflection Armor Layer: reflects exact 45% back to entangled attackers
    if (this.equippedArmor.layer.id === 'BELL_REFL' && proj.sourceNpcId) {
      const attacker = this.npcs.find((n) => n.id === proj.sourceNpcId && n.hp > 0);
      if (attacker && attacker.entangledWith !== null) {
        this._damageNPC(attacker, Math.round(proj.damage * 0.45), 'BELL_REFL', false);
      }
    }

    // MERKLE_IM Armor Layer: +30% boss resistance
    const attackerIsBoss = proj.sourceNpcId && this.npcs.some((n) => n.id === proj.sourceNpcId && n.isBoss);
    const bossResist = (this.equippedArmor.layer.id === 'MERKLE_IM' && attackerIsBoss) ? 0.70 : 1.0;
    const effDmg = (proj.damage * bossResist) / hStance.shieldDensity;
    if (this.player.shield >= effDmg) {
      this.player.shield -= effDmg;
    } else {
      const rem = effDmg - this.player.shield;
      this.player.shield = 0;
      this.player.hp = Math.max(0, this.player.hp - rem);
    }
    this.spawnBurst(this.player.x, this.player.y, this.player.z, [0.96, 0.25, 0.37], 10);

    // Self-healing Planarian emergency resurrection (never locks up demo!)
    if (this.player.hp <= 0) {
      this.player.hp = this.player.maxHp;
      this.player.shield = this.player.maxShield;
      this.player.invulnTimer = 2.0;
      this.qReg.prepareBellPair(0, 1);
      this.pushEvent('PLANARIAN STEM REGENERATION: Emergency cellular reboot restored organism!', 'warn');
    }
  }

  _handleNPCDeath(npc) {
    this.kills++;
    const xpGain = npc.isBoss ? 140 : 28 + npc.rarityIdx * 12;
    this.score += npc.isBoss ? 500 * this.stage : 75 + npc.rarityIdx * 40;
    this.xp += xpGain;
    this.temporal.chronoEnergy = Math.min(100, this.temporal.chronoEnergy + (npc.isBoss ? 35 : 8));
    const wasClose = Math.hypot(npc.x - this.player.x, npc.z - this.player.z) < 8 ? 1 : 0;
    if (wasClose) this.playerProfile.closeKills++;
    this.playerProfile.closeRatio = this.playerProfile.closeRatio * 0.85 + wasClose * 0.15;

    while (this.xp >= this.level * 120) {
      this.xp -= this.level * 120;
      this.level++;
      this.skillPoints++;
      this.player.maxHp += 15;
      this.player.hp = this.player.maxHp;
      this.pushEvent(`LEVEL UP -> Lv.${this.level}! (+1 Adaptive Skill Point)`, 'good');
    }

    this.spawnBurst(npc.x, npc.y, npc.z, npc.color, npc.isBoss ? 48 : 18);

    // Drop rare 1/1 loot from mythic/anomaly NPCs or bosses!
    if (npc.isBoss || npc.rarityIdx >= 4) {
      const drop = forgeWeapon(`${this.seed}:${npc.lineageId}`, this.stage, Math.min(5, npc.rarityIdx));
      this.recentLoot.unshift(drop);
      if (this.recentLoot.length > 8) this.recentLoot.length = 8;
      this.pushEvent(`LOOT DROP: [${drop.rarity.name}] ${drop.name} (#${drop.lineageId})!`, 'xeno');
    }
  }

  /**
   * Generate live 4-voice adaptive quantum harmonic synth parameters for AudioWorklet!
   * Directly honors Bundle 4 (S2_SYNTH_AUDIO) amputation AND Cross-Species Audio Xenografts!
   */
  _updateAdaptiveAudio(isRewinding, pvmVoices = null) {
    const realm = this.activeRealm;
    const s = this.hbinState.maxStratum;
    const t = this.temporal.worldTime;
    const root = realm.scaleRootHz * (isRewinding ? 0.75 : Math.max(0.5, Math.min(1.8, this.temporal.globalTimeScale)));
    const scale = realm.musicalIntervals;

    // If S2_SYNTH_AUDIO (Bundle 4) was xenografted from a donor species, play the donor PVM-32 synth directly!
    if (this.hbinState.audioXenografted && Array.isArray(pvmVoices) && pvmVoices.length === 4 && !isRewinding) {
      for (let i = 0; i < 4; i++) {
        this.liveVoices[i] = { ...pvmVoices[i] };
      }
      return;
    }

    // If Stratum 0 OR Bundle 4 (S2_SYNTH_AUDIO) was surgically amputated -> S0 Stem Heartbeat!
    if (s <= 0 || !this.hbinState.hasSynthAudio) {
      const tick = (((Math.floor(t * 60) % 42) + 42) % 42);
      const beat = tick < 5;
      this.liveVoices[0] = { wave: beat ? 4 : 0, freqHz: root, vol: beat ? 0.22 : 0, detune: 0, filter: 800 };
      this.liveVoices[1] = { wave: 0, freqHz: 0, vol: 0, detune: 0, filter: 1200 };
      this.liveVoices[2] = { wave: 0, freqHz: 0, vol: 0, detune: 0, filter: 1200 };
      this.liveVoices[3] = { wave: 0, freqHz: 0, vol: 0, detune: 0, filter: 1200 };
      return;
    }

    // Voice 0: Deep Quantum Carrier Sub-Drone modulated by coherence
    const chordStep = Math.floor(Math.abs(t) * 0.5) % scale.length;
    this.liveVoices[0] = {
      wave: isRewinding ? 2 : 1,
      freqHz: root * (chordStep % 2 === 0 ? 1 : scale[4] * 0.5),
      vol: 0.26,
      detune: (1 - this.qReg.coherence) * 45,
      filter: 450 + this.qReg.coherence * 700,
    };

    // Voice 1: Harmonic Fifth / Wave-Interference Pad
    this.liveVoices[1] = {
      wave: this.hbinState.xenografts > 0 ? 3 : 2,
      freqHz: root * scale[(chordStep + 2) % scale.length] * 2,
      vol: s >= 1 ? 0.16 : 0,
      detune: this.chshValue * 4,
      filter: 1400 + this.waveIntensityAtPlayer * 600,
    };

    // Voice 2: Quantum Statevector Arpeggiator
    const arpIdx = Math.floor(Math.abs(t) * (isRewinding ? 10 : 6.5)) % scale.length;
    this.liveVoices[2] = {
      wave: 1,
      freqHz: root * scale[arpIdx] * (isRewinding ? 3 : 4),
      vol: s >= 2 ? 0.15 : 0,
      detune: -6,
      filter: 3200,
    };

    // Voice 3: Reactive Firing / Bell-Collapse / Chrono-Rewind Synth Shimmer
    if (this.bellBeams.length > 0) {
      this.liveVoices[3] = { wave: 2, freqHz: root * 6, vol: s >= 3 ? 0.22 : 0, detune: 14, filter: 5200 };
    } else if (this.player.firing && s >= 2) {
      this.liveVoices[3] = { wave: 4, freqHz: root * (3 + this.weaponIdx), vol: 0.14, detune: 0, filter: 2800 };
    } else {
      this.liveVoices[3] = { wave: 0, freqHz: 0, vol: 0, detune: 0, filter: 1200 };
    }
  }
}
