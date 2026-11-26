module

/-!
# PlanariaProofs.StratumAnastomosis

Theorem III — Progressive 4-Stratum Viability Lattice across all 7 Bundles (matching
`src/core/hbin.js` Step 4 bit-for-bit!), General 6-Organ Autonomous Control-Flow
Anastomosis Zero-Crash Safety, Monotonicity under Cell Recovery, Super-Additive Shard
Fusion, and Strict Zero-Cliff Separation vs. BOTH Single-Stratum RS(40, 16) AND
Equal-Storage Flat RS(192, 48) Monolithic Archives.

Pure Lean 4.35.0 `module` (no Mathlib, no `native_decide`, zero `sorry`).
-/

namespace Planaria.Anastomosis

/-- Count of surviving authenticated distinct cells across ALL 7 bundles (0..6). -/
public structure ShardProfile where
  b0 : Nat  -- S0_STEM_NUCLEUS  (k=2,  n=24)
  b1 : Nat  -- S1_CORE_LOGIC    (k=4,  n=24)
  b2 : Nat  -- S1_WIREFRAME     (k=4,  n=24)
  b3 : Nat  -- S2_CORTEX_RENDER (k=8,  n=32)
  b4 : Nat  -- S2_SYNTH_AUDIO   (k=6,  n=24)
  b5 : Nat  -- S3_ORGANISM_FX   (k=16, n=40)
  b6 : Nat  -- S3_GENOME_LEDGER (k=8,  n=24)
  deriving Repr, DecidableEq

/-- Total surviving cells across all 7 bundles. -/
@[expose] public def ShardProfile.totalCells (p : ShardProfile) : Nat :=
  p.b0 + p.b1 + p.b2 + p.b3 + p.b4 + p.b5 + p.b6

/-- True iff ALL 7 bundles meet their exact Cauchy MDS rank k (100% lossless regeneration). -/
@[expose] public def canFullRegenerate (p : ShardProfile) : Bool :=
  decide (p.b0 ≥ 2 ∧ p.b1 ≥ 4 ∧ p.b2 ≥ 4 ∧ p.b3 ≥ 8 ∧ p.b4 ≥ 6 ∧ p.b5 ≥ 16 ∧ p.b6 ≥ 8)

/-- Organ dispatch resolution outcome for RENDERER (S2 Cortex -> S1 Wireframe -> S0 Ghost Stub). -/
public inductive RenderTarget where
  | deadCrash
  | s0GhostStub
  | s1Wireframe
  | s2Cortex
  deriving Repr, DecidableEq

@[expose] public def RenderTarget.rank : RenderTarget → Nat
  | .deadCrash   => 0
  | .s0GhostStub => 1
  | .s1Wireframe => 2
  | .s2Cortex    => 3

/-- Exact Anastomosis Dispatcher matching `PVM32.resolveOrganBundle(RENDERER, 2)`. -/
@[expose] public def resolveRenderer (p : ShardProfile) : RenderTarget :=
  if p.b0 < 2 then .deadCrash
  else if p.b3 ≥ 8 then .s2Cortex
  else if p.b2 ≥ 4 then .s1Wireframe
  else .s0GhostStub

/-- General 6-organ anastomosis resolution outcome matching `PVM32.resolveOrganBundle(organId, maxStratum)`:
    - `deadCrash` only if S0 Stem Nucleus (`b0 < 2`) is dead
    - `execBundle b` invokes executable bundle `b ∈ {1..5}`
    - `noopStub` gracefully skips an amputated non-kernel organ without faulting the VM! -/
public inductive OrganTarget where
  | deadCrash
  | noopStub
  | execBundle (bundleId : Nat)
  deriving Repr, DecidableEq

/-- General 6-organ anastomosis dispatcher across all 6 organ classes (`organId ∈ 0..5`):
    0=KERNEL (forbidden via ORGAN_CALL -> noopStub), 1=LOGIC (B1), 2=RENDERER (B3 -> B2 -> stub),
    3=AUDIO (B4 -> stub), 4=EFFECTS (B5 -> stub), 5=GENOME (data-only -> noopStub). -/
@[expose] public def resolveOrgan (p : ShardProfile) (organId maxStratum : Nat) : OrganTarget :=
  if p.b0 < 2 then .deadCrash
  else match organId with
  | 1 => if maxStratum ≥ 1 ∧ p.b1 ≥ 4 then .execBundle 1 else .noopStub
  | 2 =>
    if maxStratum ≥ 2 ∧ p.b3 ≥ 8 then .execBundle 3
    else if maxStratum ≥ 1 ∧ p.b2 ≥ 4 then .execBundle 2
    else .noopStub
  | 3 => if maxStratum ≥ 2 ∧ p.b4 ≥ 6 then .execBundle 4 else .noopStub
  | 4 => if maxStratum ≥ 3 ∧ p.b5 ≥ 16 then .execBundle 5 else .noopStub
  | _ => .noopStub

/-- Highest viable executable organism stratum (0=dead, 1=S0, 2=S1, 3=S2, 4=S3),
    matching `src/core/hbin.js` Step 4 (lines 758-768) BIT-FOR-BIT:
      - dead (0): `b0 < 2`
      - S3   (4): `b0 ≥ 2 ∧ b1 ≥ 4 ∧ b3 ≥ 8 ∧ b4 ≥ 6 ∧ b5 ≥ 16`
      - S2   (3): `b0 ≥ 2 ∧ b1 ≥ 4 ∧ (b3 ≥ 8 ∨ b4 ≥ 6)`
      - S1   (2): `b0 ≥ 2 ∧ (b1 ≥ 4 ∨ b2 ≥ 4 ∨ b3 ≥ 8)`
      - S0   (1): `b0 ≥ 2` otherwise. -/
@[expose] public def viabilityLevel (p : ShardProfile) : Nat :=
  if p.b0 < 2 then 0
  else if p.b1 ≥ 4 ∧ p.b3 ≥ 8 ∧ p.b4 ≥ 6 ∧ p.b5 ≥ 16 then 4
  else if p.b1 ≥ 4 ∧ (p.b3 ≥ 8 ∨ p.b4 ≥ 6) then 3
  else if p.b1 ≥ 4 ∨ p.b2 ≥ 4 ∨ p.b3 ≥ 8 then 2
  else 1

/-- Raw disjoint shard union (models `cat shardA.hbin shardB.hbin`). -/
@[expose] public def fuseDisjoint (a b : ShardProfile) : ShardProfile :=
  { b0 := a.b0 + b.b0
    b1 := a.b1 + b.b1
    b2 := a.b2 + b.b2
    b3 := a.b3 + b.b3
    b4 := a.b4 + b.b4
    b5 := a.b5 + b.b5
    b6 := a.b6 + b.b6 }

/-- Theorem III.1 (Anastomosis Zero-Crash Progress Safety):
    For ANY damage pattern where Stratum-0 Stem Nucleus retains >= 2 cells,
    `resolveRenderer` ALWAYS resolves to a valid live executable target (NEVER `.deadCrash`),
    even if ALL higher strata (b1..b6 = 0) are completely obliterated! -/
public theorem anastomosis_zero_crash_safety (p : ShardProfile) (h0 : p.b0 ≥ 2) :
    resolveRenderer p ≠ .deadCrash := by
  unfold resolveRenderer
  have hnot : ¬ (p.b0 < 2) := by omega
  simp only [hnot, ↓reduceIte]
  split
  · simp
  · split <;> simp

/-- Theorem III.2 (General 6-Organ Anastomosis Zero-Crash & Non-Executable Isolation):
    When `b0 >= 2`, `resolveOrgan` NEVER crashes for ANY `(organId, maxStratum)`, and NEVER
    dispatches Bundle 0 (KERNEL) or Bundle 6 (GENOME) as an organ call target! -/
public theorem resolveOrgan_zero_crash_safety (p : ShardProfile) (organId maxStratum : Nat) (h0 : p.b0 ≥ 2) :
    resolveOrgan p organId maxStratum ≠ .deadCrash ∧
    resolveOrgan p organId maxStratum ≠ .execBundle 0 ∧
    resolveOrgan p organId maxStratum ≠ .execBundle 6 := by
  have hnot : ¬ (p.b0 < 2) := by omega
  rcases organId with _ | _ | _ | _ | _ | _
  · simp [resolveOrgan, hnot]
  · simp only [resolveOrgan, hnot, ↓reduceIte]; split <;> simp
  · simp only [resolveOrgan, hnot, ↓reduceIte]
    split
    · simp
    · split <;> simp
  · simp only [resolveOrgan, hnot, ↓reduceIte]; split <;> simp
  · simp only [resolveOrgan, hnot, ↓reduceIte]; split <;> simp
  · simp [resolveOrgan, hnot]

/-- Theorem III.3 (Stratum Monotonicity under Cell Recovery):
    Recovering additional cells across any bundle NEVER degrades the resolved renderer stratum. -/
public theorem anastomosis_monotonicity (p q : ShardProfile)
    (h0 : p.b0 ≤ q.b0) (h2 : p.b2 ≤ q.b2) (h3 : p.b3 ≤ q.b3) :
    (resolveRenderer p).rank ≤ (resolveRenderer q).rank := by
  unfold resolveRenderer
  by_cases hp0 : p.b0 < 2
  · simp [hp0, RenderTarget.rank]
  · have hq0 : ¬ (q.b0 < 2) := by omega
    simp only [hp0, hq0, ↓reduceIte]
    by_cases hp3 : p.b3 ≥ 8
    · have hq3 : q.b3 ≥ 8 := by omega
      simp [hp3, hq3, RenderTarget.rank]
    · by_cases hq3 : q.b3 ≥ 8
      · simp only [hp3, hq3, ↓reduceIte]
        by_cases hp2 : p.b2 ≥ 4 <;> simp [hp2, RenderTarget.rank]
      · simp only [hp3, hq3, ↓reduceIte]
        by_cases hp2 : p.b2 ≥ 4
        · have hq2 : q.b2 ≥ 4 := by omega
          simp [hp2, hq2, RenderTarget.rank]
        · by_cases hq2 : q.b2 ≥ 4 <;> simp [hp2, hq2, RenderTarget.rank]

private theorem viabilityLevel_mono (p q : ShardProfile)
    (h0 : p.b0 ≤ q.b0) (h1 : p.b1 ≤ q.b1) (h2 : p.b2 ≤ q.b2)
    (h3 : p.b3 ≤ q.b3) (h4 : p.b4 ≤ q.b4) (h5 : p.b5 ≤ q.b5) :
    viabilityLevel p ≤ viabilityLevel q := by
  unfold viabilityLevel
  by_cases hp0 : p.b0 < 2
  · simp [hp0]
  · have hq0 : ¬ (q.b0 < 2) := by omega
    simp only [hp0, hq0, ↓reduceIte]
    by_cases hp3 : p.b1 ≥ 4 ∧ p.b3 ≥ 8 ∧ p.b4 ≥ 6 ∧ p.b5 ≥ 16
    · have hq3 : q.b1 ≥ 4 ∧ q.b3 ≥ 8 ∧ q.b4 ≥ 6 ∧ q.b5 ≥ 16 := by omega
      simp [hp3, hq3]
    · by_cases hq3 : q.b1 ≥ 4 ∧ q.b3 ≥ 8 ∧ q.b4 ≥ 6 ∧ q.b5 ≥ 16
      · simp only [hp3, ↓reduceIte]
        have hq3_rhs : (if q.b1 ≥ 4 ∧ q.b3 ≥ 8 ∧ q.b4 ≥ 6 ∧ q.b5 ≥ 16 then 4
            else if q.b1 ≥ 4 ∧ (q.b3 ≥ 8 ∨ q.b4 ≥ 6) then 3
            else if q.b1 ≥ 4 ∨ q.b2 ≥ 4 ∨ q.b3 ≥ 8 then 2 else 1) = 4 := by simp [hq3]
        rw [hq3_rhs]
        split
        · omega
        · split <;> omega
      · simp only [hp3, hq3, ↓reduceIte]
        by_cases hp2 : p.b1 ≥ 4 ∧ (p.b3 ≥ 8 ∨ p.b4 ≥ 6)
        · have hq2 : q.b1 ≥ 4 ∧ (q.b3 ≥ 8 ∨ q.b4 ≥ 6) := by omega
          simp [hp2, hq2]
        · by_cases hq2 : q.b1 ≥ 4 ∧ (q.b3 ≥ 8 ∨ q.b4 ≥ 6)
          · simp only [hp2, ↓reduceIte]
            have hq2_rhs : (if q.b1 ≥ 4 ∧ (q.b3 ≥ 8 ∨ q.b4 ≥ 6) then 3
                else if q.b1 ≥ 4 ∨ q.b2 ≥ 4 ∨ q.b3 ≥ 8 then 2 else 1) = 3 := by simp [hq2]
            rw [hq2_rhs]
            split <;> omega
          · simp only [hp2, hq2, ↓reduceIte]
            by_cases hp1 : p.b1 ≥ 4 ∨ p.b2 ≥ 4 ∨ p.b3 ≥ 8
            · have hq1 : q.b1 ≥ 4 ∨ q.b2 ≥ 4 ∨ q.b3 ≥ 8 := by omega
              simp [hp1, hq1]
            · by_cases hq1 : q.b1 ≥ 4 ∨ q.b2 ≥ 4 ∨ q.b3 ≥ 8 <;> simp [hp1, hq1]

/-- Theorem III.4 (Monotone Fusion Dominance):
    Concatenating two disjoint damaged shards A and B yields an organism whose viability
    is ALWAYS >= max(viability(A), viability(B)). -/
public theorem fusion_dominates_parents (a b : ShardProfile) :
    viabilityLevel (fuseDisjoint a b) ≥ max (viabilityLevel a) (viabilityLevel b) := by
  have ha : viabilityLevel a ≤ viabilityLevel (fuseDisjoint a b) :=
    viabilityLevel_mono a (fuseDisjoint a b) (by simp [fuseDisjoint]) (by simp [fuseDisjoint])
      (by simp [fuseDisjoint]) (by simp [fuseDisjoint]) (by simp [fuseDisjoint]) (by simp [fuseDisjoint])
  have hb : viabilityLevel b ≤ viabilityLevel (fuseDisjoint a b) :=
    viabilityLevel_mono b (fuseDisjoint a b) (by simp [fuseDisjoint]) (by simp [fuseDisjoint])
      (by simp [fuseDisjoint]) (by simp [fuseDisjoint]) (by simp [fuseDisjoint]) (by simp [fuseDisjoint])
  omega

/-- Theorem III.5 (Strict Super-Additive Synergistic Healing + Full 7-Bundle Regeneration):
    There exist two crippled sub-threshold shards A and B (each trapped at Stratum 1 / level 2
    and unable to regenerate) whose raw concatenation A + B jumps all the way to full Stratum 3
    AND satisfies `canFullRegenerate = true` across all 7 bundles including B6 GENOME! -/
public theorem fusion_strict_synergy_exists :
    ∃ a b : ShardProfile,
      viabilityLevel a = 2 ∧
      viabilityLevel b = 2 ∧
      canFullRegenerate a = false ∧
      canFullRegenerate b = false ∧
      viabilityLevel (fuseDisjoint a b) = 4 ∧
      canFullRegenerate (fuseDisjoint a b) = true ∧
      viabilityLevel (fuseDisjoint a b) > max (viabilityLevel a) (viabilityLevel b) := by
  refine ⟨⟨4, 4, 4, 4, 3, 8, 4⟩, ⟨4, 4, 4, 4, 3, 8, 4⟩, ?_, ?_, ?_, ?_, ?_, ?_, ?_⟩ <;> decide

/-- Single-stratum RS(40, 16) cliff binary viability model (threshold k = 16 out of 40). -/
@[expose] public def cliffBinaryAlive (cells : Nat) : Bool := decide (cells ≥ 16)

/-- Equal-storage flat RS(192, 48) monolithic archive viability model (threshold k = 48 out of 192). -/
@[expose] public def flatEqualStorageAlive (totalCells : Nat) : Bool := decide (totalCells ≥ 48)

/-- Theorem III.6 (Zero-Cliff Strict Separation vs BOTH RS(40, 16) AND Equal-Storage Flat RS(192, 48)):
    At ~12% survival (23 total cells out of 192), BOTH a single-stratum RS(40, 16) binary AND
    an equal-storage flat RS(192, 48) monolithic archive (same total payload capacity 48 chunks
    and same 192-cell storage budget!) are 100% DEAD (`false`), while PLANARIA remains strictly
    ALIVE (`viabilityLevel >= 1`, `resolveRenderer != deadCrash`)! -/
public theorem zero_cliff_strict_separation :
    ∃ p : ShardProfile,
      p.totalCells = 23 ∧
      cliffBinaryAlive p.b5 = false ∧
      flatEqualStorageAlive p.totalCells = false ∧
      viabilityLevel p ≥ 1 ∧
      resolveRenderer p ≠ .deadCrash := by
  refine ⟨⟨3, 3, 3, 4, 3, 4, 3⟩, ?_, ?_, ?_, ?_, ?_⟩ <;> decide

/-- Spec-fidelity witness matching `src/core/hbin.js` Step 4:
    when `b2` (S1 Wireframe) is amputated (`b2 = 0`) while `b0, b1, b3, b4, b5` are viable,
    PLANARIA still achieves S3 (`viabilityLevel = 4`) via `b3` (S2 Cortex Render)! -/
public theorem viability_s3_without_b2_matches_hbin :
    viabilityLevel ⟨2, 4, 0, 8, 6, 16, 0⟩ = 4 ∧
    viabilityLevel ⟨2, 0, 0, 8, 0, 0, 0⟩ = 2 := by
  decide

end Planaria.Anastomosis
