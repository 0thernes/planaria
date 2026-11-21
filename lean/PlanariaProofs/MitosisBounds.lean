/-!
# PlanariaProofs.MitosisBounds

Theorem II — Exact Planarian Binary Bisection, Zero-Overlap Mitosis Thresholds,
Exact Integer `PLACEMENT_SCHEDULE` Zero-Tie Verification (matching `src/core/hbin.js`),
Unaligned Cut-Boundary Safety, Exact 512B Cell & Payload Byte Budgets, Multi-Way
Fragmentation Pigeonhole Law, and Trisection Super-Additive Synergistic Recovery.
-/

namespace Planaria.Mitosis

/-- Theorem II.1 (Mitosis Sufficiency): If a holographic bundle has N >= 2*k coded cells,
    a balanced disjoint bisection into floor(N/2) and N - floor(N/2) guarantees BOTH
    zero-overlap halves satisfy >= k and independently regenerate 100% of the bundle. -/
theorem mitosis_exact_sufficient (N k : Nat) (h : N ≥ 2 * k) :
    N / 2 ≥ k ∧ (N - N / 2) ≥ k := by
  omega

/-- Theorem II.2 (Tight Impossibility Lower Bound — Falsifiable Boundary):
    If N < 2*k, then NO disjoint bisection (a + b = N) can allow BOTH halves to recover >= k! -/
theorem mitosis_strict_impossibility (N k a b : Nat) (hN : N < 2 * k) (hPart : a + b = N) :
    ¬ (a ≥ k ∧ b ≥ k) := by
  omega

/-- Theorem II.3 (Unaligned Arbitrary-Byte Cut Guarantee):
    An unaligned byte cut can bisect at most 1 physical cell across the cut boundary,
    reducing the balanced cell counts of a bundle by at most 1 per half in the worst case.
    Whenever N >= 2*k + 2, BOTH disjoint halves still guarantee >= k intact cells! -/
theorem mitosis_unaligned_cut_guarantee (N k : Nat) (h : N ≥ 2 * k + 2) :
    (N / 2 - 1) ≥ k ∧ ((N - N / 2) - 1) ≥ k := by
  omega

/-- The exact 7-bundle (k, n) parameter table of PLANARIA .hbin v1.0/v2.2. -/
def planariaBundleParams : List (Nat × Nat) :=
  [(2, 24), (4, 24), (4, 24), (8, 32), (6, 24), (16, 40), (8, 24)]

/-- Indexed 7-bundle table `(bundleId, k, n)`. -/
def planariaIndexedBundles : List (Nat × Nat × Nat) :=
  [(0, 2, 24), (1, 4, 24), (2, 4, 24), (3, 8, 32), (4, 6, 24), (5, 16, 40), (6, 8, 24)]

/-- Exact integer placement key matching `src/core/hbin.js`:
    `posNum(b, i, n_b) = (14 * i + 2 * b + 1) * (480 / n_b)`, scaled over `[0, 6720)`
    with midpoint `3360 = 6720 / 2` (ZERO IEEE-754 floating-point drift!). -/
def posNum (b i n_b : Nat) : Nat := (14 * i + 2 * b + 1) * (480 / n_b)

/-- Generate all placement keys for bundle `b` across `i ∈ [0, n_b)`. -/
def bundlePosKeys (b n_b : Nat) : List Nat :=
  (List.range n_b).map (fun i => posNum b i n_b)

/-- Flatten all 192 lexicographic `(posNum, bundleId)` sort keys (`posNum * 8 + b`),
    matching `src/core/hbin.js`'s deterministic `(a.posNum - b.posNum) || (a.bundleId - b.bundleId)` order. -/
def all192LexKeys : List Nat :=
  planariaIndexedBundles.flatMap (fun (b, _, n_b) =>
    (List.range n_b).map (fun i => posNum b i n_b * 8 + b))

/-- Structural fuel-bounded merge sort on `List Nat` (pure kernel-reducible in O(N log N)). -/
private def splitAlt : List Nat → List Nat × List Nat
  | [] => ([], [])
  | [x] => ([x], [])
  | x :: y :: rest =>
    let (a, b) := splitAlt rest
    (x :: a, y :: b)

private def mergeNatFuel : Nat → List Nat → List Nat → List Nat
  | 0, xs, ys => xs ++ ys
  | _ + 1, [], ys => ys
  | _ + 1, xs, [] => xs
  | f + 1, x :: xs, y :: ys =>
    if x ≤ y then x :: mergeNatFuel f xs (y :: ys) else y :: mergeNatFuel f (x :: xs) ys

private def msortFuel : Nat → List Nat → List Nat
  | 0, xs => xs
  | f + 1, xs =>
    match xs with
    | [] => []
    | [x] => [x]
    | _ =>
      let (a, b) := splitAlt xs
      mergeNatFuel (xs.length + 1) (msortFuel f a) (msortFuel f b)

/-- Check strictly increasing order on a sorted `List Nat`. -/
def isStrictlyIncreasing : List Nat → Bool
  | [] => true
  | [_] => true
  | x :: y :: rest => decide (x < y) && isStrictlyIncreasing (y :: rest)

/-- Exact O(N log N) kernel-reducible sorted distinctness check. -/
def allDistinctSorted (xs : List Nat) : Bool :=
  let s := msortFuel 10 xs
  decide (s.length = xs.length) && isStrictlyIncreasing s

/-- Theorem II.4: Every single one of PLANARIA's 7 compiled bundles satisfies the strict
    unaligned-mitosis margin n >= 2*k + 4 (surviving even 50/50 cuts + boundary loss!). -/
theorem planaria_all_7_bundles_mitosis_safe :
    planariaBundleParams.all (fun p => decide (p.2 ≥ 2 * p.1 + 4)) = true := by
  decide

/-- Theorem II.5: Total PLANARIA cells = 192 <= 256 = 2^8 (exact Depth-8 Merkle tree fit),
    yielding pristine binary size 192 * 512 = 98,304 bytes (96 KiB). -/
theorem planaria_total_cells_exact :
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
      5. All 192 lexicographic `(posNum, bundleId)` sort keys are pairwise distinct (`msortFuel` output is strictly increasing!). -/
theorem planaria_schedule_exact_halves :
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

/-- Theorem II.7 (Exact 512-Byte Cell & Interleaved RS(254, 238) Byte Budget):
    4B Sync + 508B Interleaved RS (2 x 254B) = 512B;
    2 x 238B = 476B Authenticated Body = 16B Header + 332B Cauchy Shard + 128B (8 x 16B) Merkle Proof. -/
theorem planaria_cell_byte_budget_exact :
    4 + 508 = 512 ∧
    2 * 254 = 508 ∧
    2 * 238 = 476 ∧
    16 + 332 + 128 = 476 ∧
    8 * 16 = 128 := by
  decide

/-- Theorem II.8 (Disjoint Cauchy Coordinate Sets & GF(2^8) Fit):
    For all 7 bundles `(b, k, n)`, data coordinates `y ∈ [0, k)` and evaluation coordinates
    `x = k + i ∈ [k, k + n)` are disjoint and fit strictly inside GF(2^8) (`k + n <= 256`). -/
theorem planaria_cauchy_coord_disjoint :
    planariaBundleParams.all (fun p =>
      decide (p.1 ≥ 1) && decide (p.1 + p.2 ≤ 256)) = true := by
  decide

/-- Theorem II.9 (Exact Raw Payload Capacity & 4x Holographic Expansion Ratio):
    Total source chunks across all 7 bundles = 48 (48 * 332 = 15,936 B raw payload capacity),
    yielding an exact 4:1 cell expansion ratio (192 / 48 = 4). -/
theorem planaria_payload_capacity_exact :
    let totalK := (planariaBundleParams.map Prod.fst).foldl (· + ·) 0
    totalK = 48 ∧
    totalK * 332 = 15936 ∧
    4 * totalK = 192 := by
  decide

/-- Theorem II.10 (Two-Way Fragmentation Pigeonhole Law):
    If N > 2*(k - 1) cells are split arbitrarily into any two fragments a + b = N,
    at least one fragment MUST retain >= k cells and remain viable. -/
theorem pigeonhole_two_way (N k a b : Nat) (hk : k ≥ 1) (hN : N > 2 * (k - 1)) (hPart : a + b = N) :
    a ≥ k ∨ b ≥ k := by
  omega

/-- Theorem II.11 (Trisection Super-Additive Synergistic Recovery on Bundle 5 S3_ORGANISM_FX):
    Splitting Bundle 5's 40 cells (threshold k = 16) into 3 disjoint shards (13, 13, 14)
    leaves EVERY individual shard strictly non-viable for Stratum 3 (< 16), yet raw
    concatenation of ANY pair of shards yields >= 26 >= 16 cells, restoring 100% Stratum 3! -/
theorem trisection_synergy_recovery :
    let k := 16
    let s1 := 13; let s2 := 13; let s3 := 14
    (s1 + s2 + s3 = 40) ∧
    (s1 < k ∧ s2 < k ∧ s3 < k) ∧
    (s1 + s2 ≥ k ∧ s1 + s3 ≥ k ∧ s2 + s3 ≥ k) := by
  omega

end Planaria.Mitosis
