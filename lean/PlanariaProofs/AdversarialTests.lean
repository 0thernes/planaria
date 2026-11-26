module

public import PlanariaProofs.Spec
public import PlanariaProofs.GF256
public import PlanariaProofs.MitosisBounds
public import PlanariaProofs.StratumAnastomosis
public import PlanariaProofs.ByzantineImmune
public import PlanariaProofs.XenograftABI
public import PlanariaProofs.QuantumTemporal

/-!
# PlanariaProofs.AdversarialTests — Formal Refutations of False Variants (Playbook #12)

Machine-checked negative witnesses proving that weakening any core hypothesis across
PLANARIA's six theorem families produces a PROVABLY FALSE statement (`¬ P`).
Confirms that the specifications in `PlanariaProofs.Spec` are tight, non-degenerate,
and genuinely falsifiable rather than tautologically satisfied.

Pure Lean 4.35.0 `module` (no Mathlib, no `native_decide`, zero `sorry`, `autoImplicit = false`).
-/

namespace Planaria.Adversarial

open Planaria.GF256
open Planaria.Mitosis
open Planaria.Anastomosis
open Planaria.Byzantine
open Planaria.Xenograft
open Planaria.QuantumTemporal

/-- Adversarial Test 1: Tightness of `mitosis_exact_sufficient` (`N >= 2*k` cannot be weakened to `2*k - 1`). -/
public theorem refute_mitosis_below_2k :
    ¬ (∀ N k : Nat, N ≥ 2 * k - 1 → N / 2 ≥ k ∧ (N - N / 2) ≥ k) := by
  intro h
  have hBad := h 3 2 (by decide)
  omega

/-- Adversarial Test 2: Tightness of `mitosis_unaligned_cut_guarantee` (`N >= 2*k` is insufficient under boundary loss). -/
public theorem refute_unaligned_cut_without_margin :
    ¬ (∀ N k : Nat, N ≥ 2 * k → (N / 2 - 1) ≥ k ∧ ((N - N / 2) - 1) ≥ k) := by
  intro h
  have hBad := h 4 2 (by decide)
  omega

/-- Adversarial Test 3: Tightness of `interleaved_burst_16_even_odd_bound` (17-byte bursts ALWAYS break radius 8). -/
public theorem refute_interleaved_burst_17_safe :
    ¬ (∀ start : Nat, countEven start 17 ≤ 8 ∧ countOdd start 17 ≤ 8) := by
  intro h
  have h0 := h 0
  have h17 := interleaved_burst_17_exceeds_radius 0
  omega

/-- Adversarial Test 4: Tightness of `anastomosis_zero_crash_safety` (removing `b0 >= 2` permits `.deadCrash`). -/
public theorem refute_anastomosis_dead_stem_safe :
    ¬ (∀ p : ShardProfile, resolveRenderer p ≠ .deadCrash) := by
  intro h
  have hDead := h ⟨1, 4, 4, 8, 6, 16, 8⟩
  exact hDead (by decide)

/-- Adversarial Test 5: Tightness of `unpinned_quorum_tie_fail_closed` (equal-count ties NEVER elect a winner). -/
public theorem refute_unpinned_quorum_tie_elects :
    ¬ (∀ r1 r2 c : Nat, c ≥ 2 → ∃ w, electUnpinnedQuorum [(r1, c), (r2, c)] = some w) := by
  intro h
  obtain ⟨w, hw⟩ := h 1 2 2 (by decide)
  have hNone : electUnpinnedQuorum ([] ++ (1, 2) :: ([] ++ (2, 2) :: [])) = none :=
    unpinned_quorum_tie_fail_closed [] [] [] 1 2 2 (by decide)
      (by simp) (by simp) (by simp)
  simp only [List.nil_append] at hNone
  rw [hNone] at hw
  cases hw

/-- Adversarial Test 6: Tightness of `xenograft_sovereign_b0_b6_immutable` (no donor can ever graft Bundle 0). -/
public theorem refute_xenograft_replaces_b0 :
    ¬ (∃ host donor : BundleSlot,
        host.bundleId = 0 ∧ host.viable = false ∧ (applyXenograft host donor).viable = true) := by
  intro ⟨host, donor, hId, hDead, hViable⟩
  have hImm := xenograft_sovereign_b0_b6_immutable host donor (Or.inl hId)
  rw [hImm, hDead] at hViable
  cases hViable

/-- Adversarial Test 7: Tightness of `hadamardScaled4Q_normSq4` (unscaled Hadamard doubles norm-squared, not preserves it). -/
public theorem refute_hadamard_preserves_unscaled_norm :
    ¬ (∀ q : Fin 4, ∀ ψ : QState4, normSq4 (hadamardScaled4Q q ψ) = normSq4 ψ) := by
  intro h
  let ψ0 : QState4 := fun k => if k.val = 0 then ⟨1, 0⟩ else ⟨0, 0⟩
  have hBad := h ⟨0, by decide⟩ ψ0
  have hScaled := hadamardScaled4Q_normSq4 ⟨0, by decide⟩ ψ0
  have hNorm : normSq4 ψ0 = 1 := by decide
  omega

/-- Adversarial Test 8: Tightness of `gfMul_inv_exact` (`1 <= a` is essential; zero has no multiplicative inverse in GF(2^8)). -/
public theorem refute_gf256_zero_invertible :
    ¬ (∃ x : Nat, gfMul 0 x = 1) := by
  intro ⟨x, hx⟩
  rw [gfMul_zero_left] at hx
  omega

end Planaria.Adversarial
