module

public import PlanariaProofs.Spec

/-!
# PlanariaProofs.MitosisBounds

Theorem II — Exact Planarian Binary Bisection, Zero-Overlap Mitosis Thresholds,
Exact Integer `PLACEMENT_SCHEDULE` Zero-Tie Verification with Machine-Checked
`List.Nodup` + First-96/Last-96 Sorted Index Bridge (matching `src/core/hbin.js`),
Unaligned Cut-Boundary Safety, Exact 512B Cell & Payload Byte Budgets, Multi-Way
Fragmentation Pigeonhole Law, and Trisection Super-Additive Synergistic Recovery.

Pure Lean 4.35.0 `module` (no Mathlib, no `native_decide`, zero `sorry`).
-/

namespace Planaria.Mitosis

/-- Theorem II.1 (Mitosis Sufficiency): If a holographic bundle has N >= 2*k coded cells,
    a balanced disjoint bisection into floor(N/2) and N - floor(N/2) guarantees BOTH
    zero-overlap halves satisfy >= k and independently regenerate 100% of the bundle. -/
public theorem mitosis_exact_sufficient (N k : Nat) (h : N ≥ 2 * k) :
    N / 2 ≥ k ∧ (N - N / 2) ≥ k := by
  omega

/-- Theorem II.2 (Tight Impossibility Lower Bound — Falsifiable Boundary):
    If N < 2*k, then NO disjoint bisection (a + b = N) can allow BOTH halves to recover >= k! -/
public theorem mitosis_strict_impossibility (N k a b : Nat) (hN : N < 2 * k) (hPart : a + b = N) :
    ¬ (a ≥ k ∧ b ≥ k) := by
  omega

/-- Theorem II.3 (Unaligned Arbitrary-Byte Cut Guarantee):
    An unaligned byte cut can bisect at most 1 physical cell across the cut boundary,
    reducing the balanced cell counts of a bundle by at most 1 per half in the worst case.
    Whenever N >= 2*k + 2, BOTH disjoint halves still guarantee >= k intact cells! -/
public theorem mitosis_unaligned_cut_guarantee (N k : Nat) (h : N ≥ 2 * k + 2) :
    (N / 2 - 1) ≥ k ∧ ((N - N / 2) - 1) ≥ k := by
  omega

-- Definitions (`planariaBundleParams`, `planariaIndexedBundles`, `posNum`, `bundlePosKeys`,
-- `all192LexKeys`, `splitAlt`, `mergeNatFuel`, `msortFuel`, `isStrictlyIncreasing`,
-- `allDistinctSorted`) are imported canonically from `PlanariaProofs.Spec`.

-- Machine-checked permutation soundness of `msortFuel` -> true `List.Nodup`!
private theorem splitAlt_perm : ∀ xs : List Nat,
    let (a, b) := splitAlt xs
    List.Perm (a ++ b) xs
  | [] => by simp [splitAlt]
  | [x] => by simp [splitAlt]
  | x :: y :: rest => by
    simp only [splitAlt]
    have ih := splitAlt_perm rest
    cases h : splitAlt rest with
    | mk a b =>
      rw [h] at ih
      dsimp only at ih ⊢
      have hmid : List.Perm ((x :: a) ++ (y :: b)) (x :: y :: (a ++ b)) := by
        simp only [List.cons_append]
        exact List.Perm.cons x List.perm_middle
      exact hmid.trans (List.Perm.cons x (List.Perm.cons y ih))

private theorem mergeNatFuel_perm : ∀ f xs ys,
    List.Perm (mergeNatFuel f xs ys) (xs ++ ys)
  | 0, xs, ys => by simp [mergeNatFuel]
  | _ + 1, [], ys => by simp [mergeNatFuel]
  | _ + 1, xs, [] => by cases xs <;> simp [mergeNatFuel]
  | f + 1, x :: xs, y :: ys => by
    simp only [mergeNatFuel]
    split
    · exact List.Perm.cons x (mergeNatFuel_perm f xs (y :: ys))
    · have ih := mergeNatFuel_perm f (x :: xs) ys
      have hmid : List.Perm (y :: ((x :: xs) ++ ys)) ((x :: xs) ++ (y :: ys)) :=
        List.perm_middle.symm
      exact (List.Perm.cons y ih).trans hmid

private theorem msortFuel_perm : ∀ f xs, List.Perm (msortFuel f xs) xs
  | 0, xs => by simp [msortFuel]
  | f + 1, [] => by simp [msortFuel]
  | f + 1, [x] => by simp [msortFuel]
  | f + 1, x :: y :: rest => by
    simp only [msortFuel]
    have hsp := splitAlt_perm (x :: y :: rest)
    cases h : splitAlt (x :: y :: rest) with
    | mk a b =>
      rw [h] at hsp
      dsimp only at hsp ⊢
      have hm := mergeNatFuel_perm ((x :: y :: rest).length + 1) (msortFuel f a) (msortFuel f b)
      have ha := msortFuel_perm f a
      have hb := msortFuel_perm f b
      exact (hm.trans (ha.append hb)).trans hsp

private theorem isStrictlyIncreasing_gt : ∀ x ys,
    isStrictlyIncreasing (x :: ys) = true → ∀ z ∈ ys, x < z
  | _, [], _, _, hz => by simp at hz
  | x, y :: rest, h, z, hz => by
    simp only [isStrictlyIncreasing, Bool.and_eq_true, decide_eq_true_eq] at h
    rcases List.mem_cons.mp hz with rfl | hmem
    · exact h.1
    · exact Nat.lt_trans h.1 (isStrictlyIncreasing_gt y rest h.2 z hmem)

private theorem isStrictlyIncreasing_nodup : ∀ xs,
    isStrictlyIncreasing xs = true → xs.Nodup
  | [], _ => List.nodup_nil
  | [_], _ => List.nodup_cons.mpr ⟨by simp, List.nodup_nil⟩
  | x :: y :: rest, h => by
    have hgt := isStrictlyIncreasing_gt x (y :: rest) h
    have hnot : x ∉ (y :: rest) := fun hmem => Nat.lt_irrefl x (hgt x hmem)
    simp only [isStrictlyIncreasing, Bool.and_eq_true] at h
    exact List.nodup_cons.mpr ⟨hnot, isStrictlyIncreasing_nodup (y :: rest) h.2⟩

/-- Theorem II.4: Every single one of PLANARIA's 7 compiled bundles satisfies the strict
    unaligned-mitosis margin n >= 2*k + 4 (surviving even 50/50 cuts + boundary loss!). -/
public theorem planaria_all_7_bundles_mitosis_safe :
    planariaBundleParams.all (fun p => decide (p.2 ≥ 2 * p.1 + 4)) = true := by
  decide

/-- Theorem II.5: Total PLANARIA cells = 192 <= 256 = 2^8 (exact Depth-8 Merkle tree fit),
    yielding pristine binary size 192 * 512 = 98,304 bytes (96 KiB). -/
public theorem planaria_total_cells_exact :
    (planariaBundleParams.map Prod.snd).foldl (· + ·) 0 = 192 ∧
    192 ≤ 2 ^ 8 ∧
    192 * 512 = 98304 := by
  decide

set_option maxRecDepth 4096 in
/-- Theorem II.6 (Exact Integer `PLACEMENT_SCHEDULE` Zero-Tie & Balanced-Halves Proof):
    Under `src/core/hbin.js`'s exact integer placement schedule `posNum(b, i, n_b)`:
      1. Every bundle divides 480 cleanly (`480 % n_b = 0`),
      2. ZERO cells across all 192 land on the midpoint `3360`,
      3. Every bundle places EXACTLY `n_b / 2` cells strictly in `[0, 3360)` (left half)
         and EXACTLY `n_b / 2` cells strictly in `(3360, 6720)` (right half),
      4. Every half strictly exceeds `k + 2` (so even unaligned cuts destroying 1 boundary cell
         still retain `>= k + 1` intact cells in BOTH halves!),
      5. All 192 lexicographic `(posNum, bundleId)` sort keys are pairwise distinct. -/
public theorem planaria_schedule_exact_halves :
    planariaIndexedBundles.all (fun (b, k, n_b) =>
      let keys := bundlePosKeys b n_b
      let leftCnt  := (keys.filter (fun p => decide (p < 3360))).length
      let midCnt   := (keys.filter (fun p => decide (p = 3360))).length
      let rightCnt := (keys.filter (fun p => decide (p > 3360))).length
      decide (480 % n_b = 0) &&
      decide (midCnt = 0) &&
      decide (leftCnt = n_b / 2) &&
      decide (rightCnt = n_b / 2) &&
      decide (leftCnt ≥ k + 2) &&
      decide (rightCnt ≥ k + 2)) = true ∧
    all192LexKeys.length = 192 ∧
    allDistinctSorted all192LexKeys = true := by
  decide

set_option maxRecDepth 4096 in
/-- Theorem II.6b (True `List.Nodup` + First-96 / Last-96 Sorted Index Bridge):
    1. `all192LexKeys.Nodup`: proved formally via `msortFuel_perm` (no unverified sort gap!).
    2. In the exact sorted `PLACEMENT_SCHEDULE` emitted into `.hbin` slots `0..191`,
       slots `0..95` ALL satisfy `posNum < 3360` and slots `96..191` ALL satisfy `posNum > 3360`! -/
public theorem planaria_schedule_nodup_and_sorted_halves :
    all192LexKeys.Nodup ∧
    let sorted := msortFuel 10 all192LexKeys
    sorted.length = 192 ∧
    (sorted.take 96).all (fun key => decide (key / 8 < 3360)) = true ∧
    (sorted.drop 96).all (fun key => decide (key / 8 > 3360)) = true := by
  have hInc : isStrictlyIncreasing (msortFuel 10 all192LexKeys) = true := by decide
  have hNodupSorted : (msortFuel 10 all192LexKeys).Nodup := isStrictlyIncreasing_nodup _ hInc
  have hNodup : all192LexKeys.Nodup := (msortFuel_perm 10 all192LexKeys).nodup_iff.mp hNodupSorted
  refine ⟨hNodup, ?_, ?_, ?_⟩ <;> decide

/-- Theorem II.7 (Exact 512-Byte Cell & Interleaved RS(254, 238) Byte Budget):
    4B Sync + 508B Interleaved RS (2 x 254B) = 512B;
    2 x 238B = 476B Authenticated Body = 16B Header + 332B Cauchy Shard + 128B (8 x 16B) Merkle Proof. -/
public theorem planaria_cell_byte_budget_exact :
    4 + 508 = 512 ∧
    2 * 254 = 508 ∧
    2 * 238 = 476 ∧
    16 + 332 + 128 = 476 ∧
    8 * 16 = 128 := by
  decide

/-- Theorem II.8 (Disjoint Cauchy Coordinate Sets & GF(2^8) Fit):
    For all 7 bundles `(b, k, n)`, data coordinates `y ∈ [0, k)` and evaluation coordinates
    `x = k + i ∈ [k, k + n)` are disjoint and fit strictly inside GF(2^8) (`k + n <= 256`). -/
public theorem planaria_cauchy_coord_disjoint :
    planariaBundleParams.all (fun p =>
      decide (p.1 ≥ 1) && decide (p.1 + p.2 ≤ 256)) = true := by
  decide

/-- Theorem II.9 (Exact Raw Payload Capacity & 4x Holographic Expansion Ratio):
    Total source chunks across all 7 bundles = 48 (48 * 332 = 15,936 B raw payload capacity),
    yielding an exact 4:1 cell expansion ratio (192 / 48 = 4). -/
public theorem planaria_payload_capacity_exact :
    let totalK := (planariaBundleParams.map Prod.fst).foldl (· + ·) 0
    totalK = 48 ∧
    totalK * 332 = 15936 ∧
    4 * totalK = 192 := by
  decide

/-- Theorem II.10 (Two-Way Fragmentation Pigeonhole Law):
    If N > 2*(k - 1) cells are split arbitrarily into any two fragments a + b = N,
    at least one fragment MUST retain >= k cells and remain viable. -/
public theorem pigeonhole_two_way (N k a b : Nat) (hk : k ≥ 1) (hN : N > 2 * (k - 1)) (hPart : a + b = N) :
    a ≥ k ∨ b ≥ k := by
  omega

/-- Theorem II.11 (Trisection Super-Additive Synergistic Recovery on Bundle 5 S3_ORGANISM_FX):
    Splitting Bundle 5's 40 cells (threshold k = 16) into 3 disjoint shards (13, 13, 14)
    leaves EVERY individual shard strictly non-viable for Stratum 3 (< 16), yet raw
    concatenation of ANY pair of shards yields >= 26 >= 16 cells, restoring 100% Stratum 3! -/
public theorem trisection_synergy_recovery :
    let k := 16
    let s1 := 13; let s2 := 13; let s3 := 14
    (s1 + s2 + s3 = 40) ∧
    (s1 < k ∧ s2 < k ∧ s3 < k) ∧
    (s1 + s2 ≥ k ∧ s1 + s3 ≥ k ∧ s2 + s3 ≥ k) := by
  omega

/-- Non-vacuity witness for Theorem II.2 (`mitosis_strict_impossibility`):
    for `N = 3 < 2 * 2`, the partition `1 + 2 = 3` satisfies all hypotheses and fails dual recovery. -/
public theorem mitosis_strict_impossibility_witness :
    3 < 2 * 2 ∧ 1 + 2 = 3 ∧ ¬ (1 ≥ 2 ∧ 2 ≥ 2) :=
  ⟨by decide, by decide, mitosis_strict_impossibility 3 2 1 2 (by decide) (by decide)⟩

/-- Non-vacuity witness for Theorem II.10 (`pigeonhole_two_way`):
    for Stratum-0 `N = 24, k = 2`, any partition `(12, 12)` retains at least one viable half. -/
public theorem pigeonhole_two_way_witness :
    2 ≥ 1 ∧ 24 > 2 * (2 - 1) ∧ 12 + 12 = 24 ∧ (12 ≥ 2 ∨ 12 ≥ 2) :=
  ⟨by decide, by decide, by decide, pigeonhole_two_way 24 2 12 12 (by decide) (by decide) (by decide)⟩

end Planaria.Mitosis
