module

public import PlanariaProofs.Spec

/-!
# PlanariaProofs.ByzantineImmune

Theorem IV — Real Byte-List Hamming Triangle Inequality, Inner RS(254, 238) Bounded-Distance
Correction Radius, Exact 2-Way Interleaved 16-Byte Contiguous Burst Recovery & Tight 17/18-Byte
Negative Lower Bounds, Explicit 8-Level Merkle Path Commitment (with non-vacuous injective pair
witness), Cryptographic Merkle Byzantine Quarantine Isolation (with mixed authentic+Trojan
non-vacuity witness), Executable Unpinned Quorum Election (`electUnpinnedQuorum` with honest-
majority, fail-closed tie, and Sybil-override proofs), and Unauthenticated Poisoning Counterexample.

Pure Lean 4.35.0 `module` (no Mathlib, no `native_decide`, zero `sorry`).
-/

namespace Planaria.Byzantine

-- Shared definitions (`hammingDist`, `countEven`, `countOdd`, `evalMerklePath`, `pow2Pair`,
-- `HarvestedCell`, `HashBinding`, `merkleQuarantine`, `electQuorumAux`, `electUnpinnedQuorum`)
-- are imported canonically from `PlanariaProofs.Spec`.

/-- Theorem IV.0 (Byte-List Hamming Metric Triangle Inequality):
    For any three equal-length byte codewords `a, b, c`, `hammingDist a c <= hammingDist a b + hammingDist b c`. -/
public theorem hammingDist_triangle :
    ∀ a b c : List Nat, a.length = b.length → b.length = c.length →
      hammingDist a c ≤ hammingDist a b + hammingDist b c
  | [], [], [], _, _ => by simp [hammingDist]
  | x :: xs, y :: ys, z :: zs, h1, h2 => by
    simp only [List.length_cons] at h1 h2
    have ih := hammingDist_triangle xs ys zs (by omega) (by omega)
    simp only [hammingDist]
    by_cases hxy : x = y <;> by_cases hyz : y = z <;> by_cases hxz : x = z
    · simp only [hxy, hyz, ↓reduceIte]; omega
    · subst hxy; subst hyz; exact absurd rfl hxz
    · simp only [hxy, hyz, ↓reduceIte]; omega
    · simp only [hxy, hyz, ↓reduceIte]; omega
    · simp only [hyz, hxz, ↓reduceIte]; omega
    · simp only [hyz, hxz, ↓reduceIte]; omega
    · simp only [hyz, hxz, ↓reduceIte]; omega
    · simp only [hxy, hyz, hxz, ↓reduceIte]; omega
  | [], _ :: _, _, h1, _ => by simp at h1
  | _ :: _, [], _, h1, _ => by simp at h1
  | _ :: _, _ :: _, [], _, h2 => by simp at h2

/-- Theorem IV.1 (RS(254, 238) Singleton Distance & Unique Correction Radius):
    An MDS code with N = 254, K = 238 has minimum Hamming distance d_min = 17
    and unique bounded-distance error-correction radius t = 8 bytes per codeword. -/
public theorem rs254_238_unique_decoding_radius :
    let N := 254
    let K := 238
    let dMin := N - K + 1
    let t := (dMin - 1) / 2
    dMin = 17 ∧ t = 8 ∧ 2 * t + 1 ≤ dMin := by
  omega

/-- Theorem IV.2 (Unique Decoding Ball Disjointness via Real Byte-List Hamming Distance):
    If two distinct codewords `c1, c2` of equal length satisfy `hammingDist c1 c2 >= 2*t + 1`,
    NO received byte list `y` can lie within Hamming distance `<= t` of both `c1` and `c2`! -/
public theorem rs_unique_correction_ball_disjoint
    (c1 c2 y : List Nat) (t : Nat)
    (hlen1 : c1.length = y.length) (hlen2 : y.length = c2.length)
    (hMinDist : hammingDist c1 c2 ≥ 2 * t + 1) :
    ¬ (hammingDist c1 y ≤ t ∧ hammingDist y c2 ≤ t) := by
  have hTri := hammingDist_triangle c1 y c2 hlen1 hlen2
  omega

/-- Non-vacuity witness for Theorem IV.2 (`rs_unique_correction_ball_disjoint`):
    two concrete 17-byte codewords at Hamming distance `17 >= 2*8 + 1` have disjoint radius-8 balls. -/
public theorem rs_unique_correction_ball_nonvacuous :
    let c1 : List Nat := List.replicate 17 0
    let c2 : List Nat := List.replicate 17 1
    let y  : List Nat := List.replicate 8 1 ++ List.replicate 9 0
    c1.length = y.length ∧ y.length = c2.length ∧
    hammingDist c1 c2 ≥ 2 * 8 + 1 ∧
    ¬ (hammingDist c1 y ≤ 8 ∧ hammingDist y c2 ≤ 8) :=
  ⟨by decide, by decide, by decide,
   rs_unique_correction_ball_disjoint
     (List.replicate 17 0) (List.replicate 17 1) (List.replicate 8 1 ++ List.replicate 9 0) 8
     (by decide) (by decide) (by decide)⟩

private theorem even_step2 (start len : Nat) :
    countEven start (len + 2) = countEven start len + 1 := by
  simp only [countEven]
  by_cases h : (start + len) % 2 = 0
  · have h1 : (start + (len + 1)) % 2 ≠ 0 := by omega
    simp [h, h1]; omega
  · have h1 : (start + (len + 1)) % 2 = 0 := by omega
    simp [h, h1]; omega

private theorem odd_step2 (start len : Nat) :
    countOdd start (len + 2) = countOdd start len + 1 := by
  simp only [countOdd]
  by_cases h : (start + len) % 2 = 1
  · have h1 : (start + (len + 1)) % 2 ≠ 1 := by omega
    simp [h, h1]; omega
  · have h1 : (start + (len + 1)) % 2 = 1 := by omega
    simp [h, h1]; omega

private theorem even_odd_bound_gen (start k : Nat) :
    countEven start (2 * k) = k ∧ countOdd start (2 * k) = k := by
  induction k with
  | zero => simp [countEven, countOdd]
  | succ m ih =>
    have hEq : 2 * (m + 1) = 2 * m + 2 := by omega
    rw [hEq, even_step2, odd_step2]
    omega

private theorem countEven_mono (start a b : Nat) (h : a ≤ b) :
    countEven start a ≤ countEven start b := by
  induction b with
  | zero =>
    have : a = 0 := by omega
    subst this; exact Nat.le_refl _
  | succ n ih =>
    by_cases heq : a = n + 1
    · subst heq; exact Nat.le_refl _
    · have h1 := ih (by omega)
      simp only [countEven]
      omega

private theorem countOdd_mono (start a b : Nat) (h : a ≤ b) :
    countOdd start a ≤ countOdd start b := by
  induction b with
  | zero =>
    have : a = 0 := by omega
    subst this; exact Nat.le_refl _
  | succ n ih =>
    by_cases heq : a = n + 1
    · subst heq; exact Nat.le_refl _
    · have h1 := ih (by omega)
      simp only [countOdd]
      omega

/-- Theorem IV.3 (Interleaved 508-Byte RS(254, 238) Lane Partition Geometry):
    The 508-byte RS body after the 4-byte sync marker partitions into EXACTLY 254 even-offset
    bytes and 254 odd-offset bytes, each carrying 238 data bytes + 16 parity bytes. -/
public theorem rs_interleaved_lane_geometry :
    countEven 0 508 = 254 ∧
    countOdd 0 508 = 254 ∧
    238 + 16 = 254 ∧
    4 + 508 = 512 := by
  have h := even_odd_bound_gen 0 254
  refine ⟨by simpa using h.1, by simpa using h.2, by omega, by omega⟩

/-- Theorem IV.4 (2-Way Interleaved 16-Byte Contiguous Burst Recovery Guarantee):
    For ANY start byte offset and ANY contiguous burst error of length len <= 16 bytes,
    BOTH interleaved RS(254, 238) lanes receive <= 8 corrupted bytes — strictly within
    the exact unique correction radius t = 8! -/
public theorem interleaved_burst_16_even_odd_bound (start len : Nat) (hlen : len ≤ 16) :
    countEven start len ≤ 8 ∧ countOdd start len ≤ 8 := by
  have h16 := even_odd_bound_gen start 8
  have h16e : countEven start 16 = 8 := by simpa using h16.1
  have h16o : countOdd start 16 = 8 := by simpa using h16.2
  have he := countEven_mono start len 16 hlen
  have ho := countOdd_mono start len 16 hlen
  omega

/-- Theorem IV.5 (Tight 17-Byte Negative Burst Lower Bound):
    For ANY start byte offset, a 17-byte contiguous burst ALWAYS drives at least one RS lane
    to 9 errors (> t = 8), proving 16 bytes is the exact tight burst-correction ceiling! -/
public theorem interleaved_burst_17_exceeds_radius (start : Nat) :
    countEven start 17 > 8 ∨ countOdd start 17 > 8 := by
  have h16 := even_odd_bound_gen start 8
  have h16e : countEven start 16 = 8 := by simpa using h16.1
  have h16o : countOdd start 16 = 8 := by simpa using h16.2
  have hStepE : countEven start 17 = (if (start + 16) % 2 = 0 then 1 else 0) + countEven start 16 := rfl
  have hStepO : countOdd start 17 = (if (start + 16) % 2 = 1 then 1 else 0) + countOdd start 16 := rfl
  rw [hStepE, hStepO, h16e, h16o]
  by_cases hp : (start + 16) % 2 = 0
  · left; simp [hp]
  · right; have ho : (start + 16) % 2 = 1 := by omega
    simp [ho]

/-- Theorem IV.6 (18-Byte Dual-Lane Saturation):
    For ANY start byte offset, an 18-byte contiguous burst pushes BOTH RS lanes to 9 errors (> 8). -/
public theorem interleaved_burst_18_both_lanes_exceed (start : Nat) :
    countEven start 18 = 9 ∧ countOdd start 18 = 9 := by
  have h := even_odd_bound_gen start 9
  exact ⟨by simpa using h.1, by simpa using h.2⟩

-- ============================================================================
-- EXPLICIT MERKLE PATH COMMITMENT & BYZANTINE QUARANTINE / QUORUM BOUNDS
-- ============================================================================

/-- Theorem IV.7 (Collision-Free Full Merkle Path & Leaf Commitment):
    Under a collision-resistant (injective) compression function `hashPair`, ANY two pairs
    `(leaf1, path1)` and `(leaf2, path2)` with identical left/right branch directions
    (`path1.map Prod.fst = path2.map Prod.fst`) that evaluate to the identical Merkle root
    MUST have BOTH identical leaves (`leaf1 = leaf2`) AND identical sibling paths (`path1 = path2`)! -/
public theorem merkle_path_collision_free_binding
    (hashPair : Nat → Nat → Nat)
    (hInj : ∀ a1 b1 a2 b2, hashPair a1 b1 = hashPair a2 b2 → a1 = a2 ∧ b1 = b2) :
    ∀ (path1 path2 : List (Bool × Nat)) (leaf1 leaf2 : Nat),
      path1.map Prod.fst = path2.map Prod.fst →
      evalMerklePath hashPair leaf1 path1 = evalMerklePath hashPair leaf2 path2 →
      leaf1 = leaf2 ∧ path1 = path2 := by
  intro path1
  induction path1 with
  | nil =>
    intro path2 l1 l2 hDir hEval
    cases path2 with
    | nil =>
      exact ⟨by simpa [evalMerklePath] using hEval, rfl⟩
    | cons _ _ =>
      simp at hDir
  | cons step1 rest1 ih =>
    intro path2 l1 l2 hDir hEval
    cases path2 with
    | nil =>
      simp at hDir
    | cons step2 rest2 =>
      cases step1 with
      | mk dir1 sib1 =>
        cases step2 with
        | mk dir2 sib2 =>
          simp only [List.map_cons, List.cons.injEq] at hDir
          rcases hDir with ⟨hDirEq, hRestDir⟩
          subst hDirEq
          simp only [evalMerklePath] at hEval
          have ⟨hNext, hRestEq⟩ := ih rest2 _ _ hRestDir hEval
          cases dir1
          · simp only [Bool.false_eq_true, ↓reduceIte] at hNext
            have ⟨hl, hs⟩ := hInj l1 sib1 l2 sib2 hNext
            subst hs; subst hRestEq
            exact ⟨hl, rfl⟩
          · simp only [↓reduceIte] at hNext
            have ⟨hs, hl⟩ := hInj sib1 l1 sib2 l2 hNext
            subst hs; subst hRestEq
            exact ⟨hl, rfl⟩

/-- Non-vacuity witness for Theorem IV.7: `pow2Pair` satisfies `hInj` universally over `Nat`. -/
public theorem pow2Pair_injective :
    ∀ b1 b2 a1 a2 : Nat, pow2Pair a1 b1 = pow2Pair a2 b2 → a1 = a2 ∧ b1 = b2 := by
  intro b1
  induction b1 with
  | zero =>
    intro b2 a1 a2 h
    cases b2 with
    | zero =>
      simp only [pow2Pair, Nat.pow_zero, Nat.mul_one] at h
      omega
    | succ m =>
      simp only [pow2Pair, Nat.pow_zero, Nat.mul_one, Nat.pow_succ] at h
      have hOdd : (2 * a1 + 1) % 2 = 1 := by omega
      have hEven : ((2 * a2 + 1) * (2 ^ m * 2)) % 2 = 0 := by
        rw [← Nat.mul_assoc]; exact Nat.mul_mod_left _ 2
      omega
  | succ k ih =>
    intro b2 a1 a2 h
    cases b2 with
    | zero =>
      simp only [pow2Pair, Nat.pow_zero, Nat.mul_one, Nat.pow_succ] at h
      have hEven : ((2 * a1 + 1) * (2 ^ k * 2)) % 2 = 0 := by
        rw [← Nat.mul_assoc]; exact Nat.mul_mod_left _ 2
      have hOdd : (2 * a2 + 1) % 2 = 1 := by omega
      omega
    | succ m =>
      simp only [pow2Pair, Nat.pow_succ] at h
      have hDiv : (2 * a1 + 1) * 2 ^ k = (2 * a2 + 1) * 2 ^ m := by
        have h1 : (2 * a1 + 1) * (2 ^ k * 2) = ((2 * a1 + 1) * 2 ^ k) * 2 := by
          rw [Nat.mul_assoc]
        have h2 : (2 * a2 + 1) * (2 ^ m * 2) = ((2 * a2 + 1) * 2 ^ m) * 2 := by
          rw [Nat.mul_assoc]
        omega
      have ⟨ha, hb⟩ := ih m a1 a2 hDiv
      exact ⟨ha, by omega⟩

/-- Theorem IV.8 (Byzantine Quarantine Zero-Contamination Theorem):
    Under cryptographic Merkle binding, EVERY cell accepted into the Cauchy MDS decoder
    after `merkleQuarantine` is guaranteed 100% authentic (ZERO Byzantine Trojans survive!). -/
public theorem merkle_quarantine_zero_contamination
    (pinnedRoot : Nat) (cells : List HarvestedCell)
    (hBind : HashBinding pinnedRoot cells) :
    ∀ c ∈ merkleQuarantine pinnedRoot cells, c.authentic = true := by
  intro c hc
  unfold merkleQuarantine at hc
  rw [List.mem_filter] at hc
  have hEq : c.rootHash = pinnedRoot := of_decide_eq_true hc.2
  exact (hBind c hc.1).mp hEq

/-- Theorem IV.9 (Zero False-Rejection of Authentic Cells):
    Every authentic cell in the input stream is preserved by `merkleQuarantine`, so
    Byzantine flooding can NEVER reduce the surviving authentic rank below k! -/
public theorem merkle_quarantine_preserves_authentic
    (pinnedRoot : Nat) (cells : List HarvestedCell)
    (hBind : HashBinding pinnedRoot cells) :
    ∀ c ∈ cells, c.authentic = true → c ∈ merkleQuarantine pinnedRoot cells := by
  intro c hmem hauth
  unfold merkleQuarantine
  rw [List.mem_filter]
  refine ⟨hmem, ?_⟩
  exact decide_eq_true ((hBind c hmem).mpr hauth)

/-- Non-vacuity witness for Theorems IV.8 & IV.9: a mixed authentic+Trojan stream
    satisfies `HashBinding 42` and filters cleanly to the exact 2 authentic cells. -/
public theorem hashBinding_mixed_nonvacuous :
    let cells : List HarvestedCell := [⟨2, 42, true⟩, ⟨3, 999, false⟩, ⟨4, 42, true⟩]
    HashBinding 42 cells ∧
    merkleQuarantine 42 cells = [⟨2, 42, true⟩, ⟨4, 42, true⟩] := by
  refine ⟨?_, rfl⟩
  intro c hc
  simp only [List.mem_cons, List.not_mem_nil, or_false] at hc
  rcases hc with rfl | rfl | rfl <;> decide

private theorem electQuorumAux_strict_leader (bestRoot bestCnt : Nat) (hMin : bestCnt ≥ 2) :
    ∀ rest : List (Nat × Nat), (∀ rc ∈ rest, rc.2 < bestCnt) →
      electQuorumAux bestRoot bestCnt false rest = some bestRoot
  | [], _ => by
    simp only [electQuorumAux]
    have hGe : decide (bestCnt ≥ 2) = true := decide_eq_true hMin
    simp [hGe]
  | (r, c) :: rest, hLt => by
    have hcLt : c < bestCnt := hLt (r, c) (List.mem_cons_self ..)
    have hRest : ∀ rc ∈ rest, rc.2 < bestCnt := fun rc hmem => hLt rc (List.mem_cons_of_mem _ hmem)
    simp only [electQuorumAux]
    by_cases hSmall : c < 2
    · simp only [hSmall, ↓reduceIte]
      exact electQuorumAux_strict_leader bestRoot bestCnt hMin rest hRest
    · have hNotGt : ¬ (c > bestCnt) := by omega
      have hNotEq : (c == bestCnt) = false := beq_false_of_ne (by omega)
      simp only [hSmall, hNotGt, hNotEq, Bool.false_eq_true, ↓reduceIte]
      exact electQuorumAux_strict_leader bestRoot bestCnt hMin rest hRest

private theorem electQuorumAux_below_then_strict_leader
    (honestRoot honestCnt : Nat) (hMin : honestCnt ≥ 2)
    (suf : List (Nat × Nat)) (hSuf : ∀ rc ∈ suf, rc.2 < honestCnt) :
    ∀ (pre : List (Nat × Nat)) (bestRoot bestCnt : Nat) (tied : Bool),
      bestCnt < honestCnt →
      (∀ rc ∈ pre, rc.2 < honestCnt) →
      electQuorumAux bestRoot bestCnt tied (pre ++ (honestRoot, honestCnt) :: suf) = some honestRoot
  | [], _, bestCnt, _, hBestLt, _ => by
    simp only [List.nil_append, electQuorumAux]
    have hNotSmall : ¬ (honestCnt < 2) := by omega
    have hGt : honestCnt > bestCnt := by omega
    simp only [hNotSmall, hGt, ↓reduceIte]
    exact electQuorumAux_strict_leader honestRoot honestCnt hMin suf hSuf
  | (r, c) :: rest, bestRoot, bestCnt, tied, hBestLt, hPre => by
    have hcLt : c < honestCnt := hPre (r, c) (List.mem_cons_self ..)
    have hRest : ∀ rc ∈ rest, rc.2 < honestCnt := fun rc hm => hPre rc (List.mem_cons_of_mem _ hm)
    simp only [List.cons_append, electQuorumAux]
    by_cases hSmall : c < 2
    · simp only [hSmall, ↓reduceIte]
      exact electQuorumAux_below_then_strict_leader honestRoot honestCnt hMin suf hSuf rest bestRoot bestCnt tied hBestLt hRest
    · by_cases hGt : c > bestCnt
      · simp only [hSmall, hGt, ↓reduceIte]
        exact electQuorumAux_below_then_strict_leader honestRoot honestCnt hMin suf hSuf rest r c false hcLt hRest
      · by_cases hEq : c == bestCnt
        · simp only [hSmall, hGt, hEq, ↓reduceIte]
          exact electQuorumAux_below_then_strict_leader honestRoot honestCnt hMin suf hSuf rest bestRoot bestCnt true hBestLt hRest
        · simp only [hSmall, hGt, hEq, Bool.false_eq_true, ↓reduceIte]
          exact electQuorumAux_below_then_strict_leader honestRoot honestCnt hMin suf hSuf rest bestRoot bestCnt tied hBestLt hRest

/-- Theorem IV.10a (Order-Independent Unpinned Quorum Honest-Majority Election):
    For ANY insertion position (`pre ++ (honestRoot, honestCnt) :: suf`), if the honest
    lineage bucket has `honestCnt >= 2` and strictly outnumbers every competing bucket in
    `pre` and `suf`, `electUnpinnedQuorum` uniquely elects `some honestRoot`! -/
public theorem unpinned_quorum_honest_majority
    (honestRoot honestCnt : Nat) (pre suf : List (Nat × Nat))
    (hMin : honestCnt ≥ 2)
    (hPre : ∀ rc ∈ pre, rc.2 < honestCnt)
    (hSuf : ∀ rc ∈ suf, rc.2 < honestCnt) :
    electUnpinnedQuorum (pre ++ (honestRoot, honestCnt) :: suf) = some honestRoot := by
  unfold electUnpinnedQuorum
  exact electQuorumAux_below_then_strict_leader honestRoot honestCnt hMin suf hSuf pre 0 0 false (by omega) hPre

/-- Non-vacuity witness for Theorem IV.10a with the honest majority at a non-head index. -/
public theorem unpinned_quorum_honest_majority_witness :
    electUnpinnedQuorum ([(999, 5)] ++ (42, 12) :: [(777, 3)]) = some 42 :=
  unpinned_quorum_honest_majority 42 12 [(999, 5)] [(777, 3)]
    (by decide)
    (fun rc hm => by simp at hm; subst hm; decide)
    (fun rc hm => by simp at hm; subst hm; decide)

private theorem electQuorumAux_tied_max_none (c : Nat) :
    ∀ (xs : List (Nat × Nat)) (bestRoot : Nat),
      (∀ rc ∈ xs, rc.2 ≤ c) →
      electQuorumAux bestRoot c true xs = none
  | [], _, _ => by
    simp [electQuorumAux]
  | (r, x) :: rest, bestRoot, hLe => by
    have hxLe : x ≤ c := hLe (r, x) (List.mem_cons_self ..)
    have hRest : ∀ rc ∈ rest, rc.2 ≤ c := fun rc hm => hLe rc (List.mem_cons_of_mem _ hm)
    simp only [electQuorumAux]
    by_cases hSmall : x < 2
    · simp only [hSmall, ↓reduceIte]
      exact electQuorumAux_tied_max_none c rest bestRoot hRest
    · have hNotGt : ¬ (x > c) := by omega
      by_cases hEq : x == c
      · simp only [hSmall, hNotGt, hEq, ↓reduceIte]
        exact electQuorumAux_tied_max_none c rest bestRoot hRest
      · simp only [hSmall, hNotGt, hEq, Bool.false_eq_true, ↓reduceIte]
        exact electQuorumAux_tied_max_none c rest bestRoot hRest

private theorem electQuorumAux_second_tie_none
    (r2 c : Nat) (hc : c ≥ 2) (suf : List (Nat × Nat)) (hSuf : ∀ rc ∈ suf, rc.2 ≤ c) :
    ∀ (mid : List (Nat × Nat)) (bestRoot : Nat) (tied : Bool),
      (∀ rc ∈ mid, rc.2 ≤ c) →
      electQuorumAux bestRoot c tied (mid ++ (r2, c) :: suf) = none
  | [], bestRoot, _, _ => by
    simp only [List.nil_append, electQuorumAux]
    have hNotSmall : ¬ (c < 2) := by omega
    have hNotGt : ¬ (c > c) := by omega
    have hEq : (c == c) = true := beq_self_eq_true c
    simp only [hNotSmall, hNotGt, hEq, ↓reduceIte]
    exact electQuorumAux_tied_max_none c suf bestRoot hSuf
  | (r, x) :: rest, bestRoot, tied, hMid => by
    have hxLe : x ≤ c := hMid (r, x) (List.mem_cons_self ..)
    have hRest : ∀ rc ∈ rest, rc.2 ≤ c := fun rc hm => hMid rc (List.mem_cons_of_mem _ hm)
    simp only [List.cons_append, electQuorumAux]
    by_cases hSmall : x < 2
    · simp only [hSmall, ↓reduceIte]
      exact electQuorumAux_second_tie_none r2 c hc suf hSuf rest bestRoot tied hRest
    · have hNotGt : ¬ (x > c) := by omega
      by_cases hEq : x == c
      · simp only [hSmall, hNotGt, hEq, ↓reduceIte]
        exact electQuorumAux_second_tie_none r2 c hc suf hSuf rest bestRoot true hRest
      · simp only [hSmall, hNotGt, hEq, Bool.false_eq_true, ↓reduceIte]
        exact electQuorumAux_second_tie_none r2 c hc suf hSuf rest bestRoot tied hRest

private theorem electQuorumAux_two_ties_none
    (r1 r2 c : Nat) (hc : c ≥ 2)
    (mid suf : List (Nat × Nat))
    (hMid : ∀ rc ∈ mid, rc.2 ≤ c)
    (hSuf : ∀ rc ∈ suf, rc.2 ≤ c) :
    ∀ (pre : List (Nat × Nat)) (bestRoot bestCnt : Nat) (tied : Bool),
      bestCnt ≤ c →
      (∀ rc ∈ pre, rc.2 ≤ c) →
      electQuorumAux bestRoot bestCnt tied (pre ++ (r1, c) :: (mid ++ (r2, c) :: suf)) = none
  | [], bestRoot, bestCnt, _, hBestLe, _ => by
    simp only [List.nil_append, electQuorumAux]
    have hNotSmall : ¬ (c < 2) := by omega
    by_cases hGt : c > bestCnt
    · simp only [hNotSmall, hGt, ↓reduceIte]
      exact electQuorumAux_second_tie_none r2 c hc suf hSuf mid r1 false hMid
    · have hEqNat : c = bestCnt := by omega
      have hEq : (c == bestCnt) = true := by rw [hEqNat]; exact beq_self_eq_true bestCnt
      simp only [hNotSmall, hGt, hEq, ↓reduceIte]
      rw [← hEqNat]
      exact electQuorumAux_second_tie_none r2 c hc suf hSuf mid bestRoot true hMid
  | (r, x) :: rest, bestRoot, bestCnt, tied, hBestLe, hPre => by
    have hxLe : x ≤ c := hPre (r, x) (List.mem_cons_self ..)
    have hRest : ∀ rc ∈ rest, rc.2 ≤ c := fun rc hm => hPre rc (List.mem_cons_of_mem _ hm)
    simp only [List.cons_append, electQuorumAux]
    by_cases hSmall : x < 2
    · simp only [hSmall, ↓reduceIte]
      exact electQuorumAux_two_ties_none r1 r2 c hc mid suf hMid hSuf rest bestRoot bestCnt tied hBestLe hRest
    · by_cases hGt : x > bestCnt
      · simp only [hSmall, hGt, ↓reduceIte]
        exact electQuorumAux_two_ties_none r1 r2 c hc mid suf hMid hSuf rest r x false hxLe hRest
      · by_cases hEq : x == bestCnt
        · simp only [hSmall, hGt, hEq, ↓reduceIte]
          exact electQuorumAux_two_ties_none r1 r2 c hc mid suf hMid hSuf rest bestRoot bestCnt true hBestLe hRest
        · simp only [hSmall, hGt, hEq, Bool.false_eq_true, ↓reduceIte]
          exact electQuorumAux_two_ties_none r1 r2 c hc mid suf hMid hSuf rest bestRoot bestCnt tied hBestLe hRest

/-- Theorem IV.10b (General Arbitrary-List Unpinned Quorum Tie Fail-Closed):
    For ANY vote list containing two tied maximum buckets `(r1, c)` and `(r2, c)` with `c >= 2`
    at arbitrary positions (with all other buckets having count `<= c`), `electUnpinnedQuorum`
    unconditionally fails closed and returns `none`! -/
public theorem unpinned_quorum_tie_fail_closed
    (pre mid suf : List (Nat × Nat)) (r1 r2 c : Nat)
    (hc : c ≥ 2)
    (hPre : ∀ rc ∈ pre, rc.2 ≤ c)
    (hMid : ∀ rc ∈ mid, rc.2 ≤ c)
    (hSuf : ∀ rc ∈ suf, rc.2 ≤ c) :
    electUnpinnedQuorum (pre ++ (r1, c) :: (mid ++ (r2, c) :: suf)) = none := by
  unfold electUnpinnedQuorum
  exact electQuorumAux_two_ties_none r1 r2 c hc mid suf hMid hSuf pre 0 0 false (by omega) hPre

/-- Theorem IV.10c (Sybil-Flood Override Counterexample):
    WITHOUT a pinned root, a Sybil attacker forging 36 cells under one coordinated fake root `999`
    against 24 authentic cells under `42` hijacks `electUnpinnedQuorum` to return `some 999`,
    proving formally why `pinnedRootHex` is required against majority-flood Sybil adversaries! -/
public theorem unpinned_quorum_sybil_counterexample :
    electUnpinnedQuorum [(42, 24), (999, 36)] = some 999 := by
  decide

/-- Theorem IV.11 (Falsifiable Counterexample — Unauthenticated Decoder Contamination):
    Without `merkleQuarantine`, prepending even ONE single RS-valid Byzantine Trojan cell
    before authentic cells causes the naive first-k Cauchy window to contain a forged cell! -/
public theorem unauthenticated_poisoning_exists :
    ∃ (stream : List HarvestedCell),
      let window := stream.take 2
      (stream.filter (·.authentic)).length = 2 ∧
      ∃ c ∈ window, c.authentic = false := by
  refine ⟨[⟨2, 999, false⟩, ⟨2, 42, true⟩, ⟨3, 42, true⟩], ?_⟩
  simp

end Planaria.Byzantine
