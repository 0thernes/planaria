module

public import PlanariaProofs.Spec

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

-- Shared definitions (`ShardProfile`, `canFullRegenerate`, `RenderTarget`, `resolveRenderer`,
-- `OrganTarget`, `resolveOrgan`, `viabilityLevel`, `fuseDisjoint`, `cliffBinaryAlive`,
-- `flatEqualStorageAlive`) are imported canonically from `PlanariaProofs.Spec`.

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
