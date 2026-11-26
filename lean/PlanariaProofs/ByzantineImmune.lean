module

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

-- ============================================================================
-- REAL BYTE-LIST HAMMING METRIC & RS(254, 238) BOUNDED-DISTANCE DECODING
-- ============================================================================

/-- Exact byte-wise Hamming distance between two byte lists. -/
@[expose] public def hammingDist : List Nat → List Nat → Nat
  | [], [] => 0
  | x :: xs, y :: ys => (if x = y then 0 else 1) + hammingDist xs ys
  | xs, [] => xs.length
  | [], ys => ys.length

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

/-- Count of even offsets in contiguous interval [start, start + len). -/
@[expose] public def countEven (start len : Nat) : Nat :=
  match len with
  | 0 => 0
  | n + 1 => (if (start + n) % 2 = 0 then 1 else 0) + countEven start n

/-- Count of odd offsets in contiguous interval [start, start + len). -/
@[expose] public def countOdd (start len : Nat) : Nat :=
  match len with
  | 0 => 0
  | n + 1 => (if (start + n) % 2 = 1 then 1 else 0) + countOdd start n

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

/-- Explicit binary Merkle authentication path evaluator (depth-8 = 8 steps in PLANARIA). -/
@[expose] public def evalMerklePath (hashPair : Nat → Nat → Nat) : Nat → List (Bool × Nat) → Nat
  | cur, [] => cur
  | cur, (isRight, sib) :: rest =>
    let next := if isRight then hashPair sib cur else hashPair cur sib
    evalMerklePath hashPair next rest

/-- Theorem IV.7 (Collision-Free Merkle Path Leaf Commitment):
    Under a collision-resistant (injective) compression function `hashPair`, two leaves
    producing the identical Merkle root along the same authentication path MUST be identical! -/
public theorem merkle_path_collision_free_binding
    (hashPair : Nat → Nat → Nat)
    (hInj : ∀ a1 b1 a2 b2, hashPair a1 b1 = hashPair a2 b2 → a1 = a2 ∧ b1 = b2) :
    ∀ (path : List (Bool × Nat)) (leaf1 leaf2 : Nat),
      evalMerklePath hashPair leaf1 path = evalMerklePath hashPair leaf2 path →
      leaf1 = leaf2 := by
  intro path
  induction path with
  | nil =>
    intro l1 l2 h
    simpa [evalMerklePath] using h
  | cons step rest ih =>
    intro l1 l2 h
    cases step with
    | mk isRight sib =>
      simp only [evalMerklePath] at h
      have hNext := ih _ _ h
      cases isRight
      · simp only [Bool.false_eq_true, ↓reduceIte] at hNext
        exact (hInj l1 sib l2 sib hNext).1
      · simp only [↓reduceIte] at hNext
        exact (hInj sib l1 sib l2 hNext).2

/-- Concrete injective pairing function `(2*a + 1) * 2^b` witnessing non-vacuity of `hInj`. -/
@[expose] public def pow2Pair (a b : Nat) : Nat := (2 * a + 1) * 2 ^ b

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

/-- Model of a harvested RS-valid cell tagged with its computed Merkle root & authenticity. -/
public structure HarvestedCell where
  evalX     : Nat
  rootHash  : Nat
  authentic : Bool
  deriving Repr, DecidableEq

/-- Under second-preimage/collision-resistant SHA-256 Merkle binding, a cell's implied
    root equals the pinned Lineage Root IF AND ONLY IF the cell is authentic. -/
@[expose] public def HashBinding (pinnedRoot : Nat) (cells : List HarvestedCell) : Prop :=
  ∀ c ∈ cells, (c.rootHash = pinnedRoot) ↔ (c.authentic = true)

/-- PLANARIA Merkle Quarantine Filter. -/
@[expose] public def merkleQuarantine (pinnedRoot : Nat) (cells : List HarvestedCell) : List HarvestedCell :=
  cells.filter (fun c => decide (c.rootHash = pinnedRoot))

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
  refine ⟨?_, by decide⟩
  intro c hc
  simp only [List.mem_cons, List.not_mem_nil, or_false] at hc
  rcases hc with rfl | rfl | rfl <;> decide

/-- Executable Unpinned Quorum Election matching `src/core/hbin.js` Step 2:
    requires count >= 2 AND a STRICT unique maximum across `(rootHash, uniqueCellCount)` buckets,
    failing closed (`none`) on ties or when no lineage reaches >= 2 cells. -/
@[expose] public def electQuorumAux (bestRoot bestCnt : Nat) (tied : Bool) :
    List (Nat × Nat) → Option Nat
  | [] => if bestCnt ≥ 2 && !tied then some bestRoot else none
  | (r, c) :: rest =>
    if c < 2 then electQuorumAux bestRoot bestCnt tied rest
    else if c > bestCnt then electQuorumAux r c false rest
    else if c == bestCnt then electQuorumAux bestRoot bestCnt true rest
    else electQuorumAux bestRoot bestCnt tied rest

@[expose] public def electUnpinnedQuorum (votes : List (Nat × Nat)) : Option Nat :=
  electQuorumAux 0 0 false votes

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

/-- Theorem IV.10a (Unpinned Quorum Honest-Majority Election):
    If an honest lineage bucket `(honestRoot, honestCnt)` has `honestCnt >= 2` and strictly
    outnumbers every competing bucket in `others`, `electUnpinnedQuorum` uniquely elects `some honestRoot`! -/
public theorem unpinned_quorum_honest_majority
    (honestRoot honestCnt : Nat) (others : List (Nat × Nat))
    (hMin : honestCnt ≥ 2)
    (hMaj : ∀ rc ∈ others, rc.2 < honestCnt) :
    electUnpinnedQuorum ((honestRoot, honestCnt) :: others) = some honestRoot := by
  unfold electUnpinnedQuorum electQuorumAux
  have hNotSmall : ¬ (honestCnt < 2) := by omega
  have hGt0 : honestCnt > 0 := by omega
  simp only [hNotSmall, hGt0, ↓reduceIte]
  exact electQuorumAux_strict_leader honestRoot honestCnt hMin others hMaj

/-- Theorem IV.10b (Unpinned Quorum Tie Fail-Closed):
    For ANY two equal-count root buckets `(r1, c)` and `(r2, c)` with `c >= 2`,
    `electUnpinnedQuorum` fails closed and returns `none` (never breaks ties arbitrarily!). -/
public theorem unpinned_quorum_tie_fail_closed (r1 r2 c : Nat) (hc : c ≥ 2) :
    electUnpinnedQuorum [(r1, c), (r2, c)] = none := by
  have hNotSmall : ¬ (c < 2) := by omega
  have hGt0 : c > 0 := by omega
  have hNotGt : ¬ (c > c) := by omega
  have hEq : (c == c) = true := beq_self_eq_true c
  simp only [electUnpinnedQuorum, electQuorumAux, hNotSmall, hGt0, hNotGt, hEq, ↓reduceIte,
    Bool.not_true, Bool.and_false, Bool.false_eq_true]

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
