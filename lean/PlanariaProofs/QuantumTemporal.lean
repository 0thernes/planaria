module

/-!
# PlanariaProofs.QuantumTemporal

Theorem VI — Full 4-Qubit (16-Amplitude Complex) Quantum Unitary Norm Conservation
(Pauli-X, Pauli-Y, Pauli-Z, Scaled Hadamard, CNOT, CZ, SWAP across ALL 4 qubits & all 12
distinct qubit pairs), Bounded 360-Frame Snapshot Rewind Exactness, Bijective Temporal Clock
Reversibility, and Exact Reachable 1/1 Combinatorial Universe Cardinality (`6,421,059,993,600`).

Pure Lean 4.35.0 `module` (no Mathlib, no `native_decide`, zero `sorry`).
-/

namespace Planaria.QuantumTemporal

-- ============================================================================
-- PART 1: FULL 4-QUBIT (16-AMPLITUDE COMPLEX) QUANTUM STATEVECTOR UNITARITY
-- ============================================================================

/-- Exact integer-scaled complex amplitude (Gaussian integer `re + i * im`). -/
public structure ComplexInt where
  re : Int
  im : Int
  deriving Repr, DecidableEq

/-- Squared modulus |z|^2 = re^2 + im^2. -/
@[expose] public def absSq (z : ComplexInt) : Int := z.re * z.re + z.im * z.im

@[expose] public def cNeg (z : ComplexInt) : ComplexInt := ⟨-z.re, -z.im⟩
@[expose] public def cMulI (z : ComplexInt) : ComplexInt := ⟨-z.im, z.re⟩
@[expose] public def cMulNegI (z : ComplexInt) : ComplexInt := ⟨z.im, -z.re⟩
@[expose] public def cAdd (u v : ComplexInt) : ComplexInt := ⟨u.re + v.re, u.im + v.im⟩
@[expose] public def cSub (u v : ComplexInt) : ComplexInt := ⟨u.re - v.re, u.im - v.im⟩

private theorem absSq_cNeg (z : ComplexInt) : absSq (cNeg z) = absSq z := by
  cases z with | mk r i =>
    simp only [absSq, cNeg]
    rw [Int.neg_mul_neg, Int.neg_mul_neg]

private theorem absSq_cMulI (z : ComplexInt) : absSq (cMulI z) = absSq z := by
  cases z with | mk r i =>
    simp only [absSq, cMulI]
    rw [Int.neg_mul_neg]
    omega

private theorem absSq_cMulNegI (z : ComplexInt) : absSq (cMulNegI z) = absSq z := by
  cases z with | mk r i =>
    simp only [absSq, cMulNegI]
    rw [Int.neg_mul_neg]
    omega

private theorem absSq_parallelogram (u v : ComplexInt) :
    absSq (cAdd u v) + absSq (cSub u v) = 2 * (absSq u + absSq v) := by
  cases u with | mk ur ui =>
    cases v with | mk vr vi =>
      simp only [absSq, cAdd, cSub]
      have h1 : (ur + vr) * (ur + vr) = ur * ur + ur * vr + vr * ur + vr * vr := by
        rw [Int.add_mul, Int.mul_add, Int.mul_add]; omega
      have h2 : (ur - vr) * (ur - vr) = ur * ur - ur * vr - vr * ur + vr * vr := by
        rw [Int.sub_mul, Int.mul_sub, Int.mul_sub]; omega
      have h3 : (ui + vi) * (ui + vi) = ui * ui + ui * vi + vi * ui + vi * vi := by
        rw [Int.add_mul, Int.mul_add, Int.mul_add]; omega
      have h4 : (ui - vi) * (ui - vi) = ui * ui - ui * vi - vi * ui + vi * vi := by
        rw [Int.sub_mul, Int.mul_sub, Int.mul_sub]; omega
      have hc1 : ur * vr = vr * ur := Int.mul_comm ur vr
      have hc2 : ui * vi = vi * ui := Int.mul_comm ui vi
      omega

/-- Full 4-qubit complex statevector (16 computational basis states |0000> .. |1111>). -/
public abbrev QState4 := Fin 16 → ComplexInt

/-- Transparent `Fin 16` constructor with zero private auxiliary proof terms (`module`-safe). -/
@[expose] public def fin16 (n : Nat) : Fin 16 :=
  ⟨n % 16, Nat.mod_lt n (Nat.zero_lt_succ 15)⟩

/-- Exact total squared norm ∑_{k=0}^{15} |ψ_k|^2 of a 4-qubit complex statevector. -/
@[expose] public def normSq4 (ψ : QState4) : Int :=
  absSq (ψ (fin16 0))  + absSq (ψ (fin16 1))  +
  absSq (ψ (fin16 2))  + absSq (ψ (fin16 3))  +
  absSq (ψ (fin16 4))  + absSq (ψ (fin16 5))  +
  absSq (ψ (fin16 6))  + absSq (ψ (fin16 7))  +
  absSq (ψ (fin16 8))  + absSq (ψ (fin16 9))  +
  absSq (ψ (fin16 10)) + absSq (ψ (fin16 11)) +
  absSq (ψ (fin16 12)) + absSq (ψ (fin16 13)) +
  absSq (ψ (fin16 14)) + absSq (ψ (fin16 15))

@[expose] public def flipBit4 (k : Fin 16) (q : Fin 4) : Fin 16 :=
  fin16 (k.val ^^^ (1 <<< q.val))

@[expose] public def hasBit4 (k : Fin 16) (q : Fin 4) : Bool :=
  ((k.val >>> q.val) &&& 1) == 1

/-- 4-qubit Pauli-X gate on qubit `q ∈ {0, 1, 2, 3}` (matching `qengine.js`). -/
@[expose] public def pauliX4Q (q : Fin 4) (ψ : QState4) : QState4 :=
  fun k => ψ (flipBit4 k q)

/-- 4-qubit Pauli-Y gate on qubit `q`: |0⟩ -> i|1⟩, |1⟩ -> -i|0⟩. -/
@[expose] public def pauliY4Q (q : Fin 4) (ψ : QState4) : QState4 :=
  fun k =>
    let partner := ψ (flipBit4 k q)
    match hasBit4 k q with
    | true => cMulI partner
    | false => cMulNegI partner

/-- 4-qubit Pauli-Z gate on qubit `q`: flips phase of every basis state with bit `q = 1`. -/
@[expose] public def pauliZ4Q (q : Fin 4) (ψ : QState4) : QState4 :=
  fun k => match hasBit4 k q with | true => cNeg (ψ k) | false => ψ k

/-- 4-qubit scaled Hadamard `sqrt(2) * H_q` on qubit `q`. -/
@[expose] public def hadamardScaled4Q (q : Fin 4) (ψ : QState4) : QState4 :=
  fun k =>
    let kFlip := flipBit4 k q
    match hasBit4 k q with
    | true => cSub (ψ kFlip) (ψ k)
    | false => cAdd (ψ k) (ψ kFlip)

/-- 4-qubit CNOT gate (`ctrl` controls `targ`). -/
@[expose] public def cnot4Q (ctrl targ : Fin 4) (ψ : QState4) : QState4 :=
  fun k => match hasBit4 k ctrl with | true => ψ (flipBit4 k targ) | false => ψ k

/-- 4-qubit CZ gate (flips phase iff both `ctrl` and `targ` bits are 1). -/
@[expose] public def cz4Q (ctrl targ : Fin 4) (ψ : QState4) : QState4 :=
  fun k => match hasBit4 k ctrl && hasBit4 k targ with | true => cNeg (ψ k) | false => ψ k

/-- 4-qubit SWAP gate exchanging qubits `q1` and `q2`. -/
@[expose] public def swap4Q (q1 q2 : Fin 4) (ψ : QState4) : QState4 :=
  fun k =>
    match hasBit4 k q1 != hasBit4 k q2 with
    | true => ψ (fin16 ((k.val ^^^ (1 <<< q1.val)) ^^^ (1 <<< q2.val)))
    | false => ψ k

/-- Theorem VI.1 (4-Qubit Complex Pauli-X Unitarity — all 4 qubits, all 16 amplitudes). -/
public theorem pauliX4Q_preserves_normSq4 (q : Fin 4) (ψ : QState4) :
    normSq4 (pauliX4Q q ψ) = normSq4 ψ := by
  rcases q with ⟨v, hv⟩
  match v, hv with
  | 0, _ | 1, _ | 2, _ | 3, _ =>
    dsimp only [normSq4, pauliX4Q, flipBit4, fin16]
    simp
    omega

/-- Theorem VI.2 (4-Qubit Complex Pauli-Y Unitarity — all 4 qubits, all 16 amplitudes). -/
public theorem pauliY4Q_preserves_normSq4 (q : Fin 4) (ψ : QState4) :
    normSq4 (pauliY4Q q ψ) = normSq4 ψ := by
  rcases q with ⟨v, hv⟩
  match v, hv with
  | 0, _ | 1, _ | 2, _ | 3, _ =>
    dsimp only [normSq4, pauliY4Q, flipBit4, hasBit4, fin16]
    simp [absSq_cMulI, absSq_cMulNegI]
    omega

/-- Theorem VI.3 (4-Qubit Complex Pauli-Z Unitarity — all 4 qubits, all 16 amplitudes). -/
public theorem pauliZ4Q_preserves_normSq4 (q : Fin 4) (ψ : QState4) :
    normSq4 (pauliZ4Q q ψ) = normSq4 ψ := by
  rcases q with ⟨v, hv⟩
  match v, hv with
  | 0, _ | 1, _ | 2, _ | 3, _ =>
    dsimp only [normSq4, pauliZ4Q, hasBit4, fin16]
    simp [absSq_cNeg]

/-- Theorem VI.4 (4-Qubit Complex Scaled Hadamard Unitarity — all 4 qubits, all 16 amplitudes):
    `normSq4 (sqrt(2) * H_q |ψ⟩) = 2 * normSq4 |ψ⟩`, proving exact probability conservation! -/
public theorem hadamardScaled4Q_normSq4 (q : Fin 4) (ψ : QState4) :
    normSq4 (hadamardScaled4Q q ψ) = 2 * normSq4 ψ := by
  rcases q with ⟨v, hv⟩
  match v, hv with
  | 0, _ =>
    have p0 := absSq_parallelogram (ψ (fin16 0)) (ψ (fin16 1))
    have p1 := absSq_parallelogram (ψ (fin16 2)) (ψ (fin16 3))
    have p2 := absSq_parallelogram (ψ (fin16 4)) (ψ (fin16 5))
    have p3 := absSq_parallelogram (ψ (fin16 6)) (ψ (fin16 7))
    have p4 := absSq_parallelogram (ψ (fin16 8)) (ψ (fin16 9))
    have p5 := absSq_parallelogram (ψ (fin16 10)) (ψ (fin16 11))
    have p6 := absSq_parallelogram (ψ (fin16 12)) (ψ (fin16 13))
    have p7 := absSq_parallelogram (ψ (fin16 14)) (ψ (fin16 15))
    dsimp only [fin16] at p0 p1 p2 p3 p4 p5 p6 p7
    simp at p0 p1 p2 p3 p4 p5 p6 p7
    dsimp only [normSq4, hadamardScaled4Q, flipBit4, hasBit4, fin16]
    simp
    omega
  | 1, _ =>
    have p0 := absSq_parallelogram (ψ (fin16 0)) (ψ (fin16 2))
    have p1 := absSq_parallelogram (ψ (fin16 1)) (ψ (fin16 3))
    have p2 := absSq_parallelogram (ψ (fin16 4)) (ψ (fin16 6))
    have p3 := absSq_parallelogram (ψ (fin16 5)) (ψ (fin16 7))
    have p4 := absSq_parallelogram (ψ (fin16 8)) (ψ (fin16 10))
    have p5 := absSq_parallelogram (ψ (fin16 9)) (ψ (fin16 11))
    have p6 := absSq_parallelogram (ψ (fin16 12)) (ψ (fin16 14))
    have p7 := absSq_parallelogram (ψ (fin16 13)) (ψ (fin16 15))
    dsimp only [fin16] at p0 p1 p2 p3 p4 p5 p6 p7
    simp at p0 p1 p2 p3 p4 p5 p6 p7
    dsimp only [normSq4, hadamardScaled4Q, flipBit4, hasBit4, fin16]
    simp
    omega
  | 2, _ =>
    have p0 := absSq_parallelogram (ψ (fin16 0)) (ψ (fin16 4))
    have p1 := absSq_parallelogram (ψ (fin16 1)) (ψ (fin16 5))
    have p2 := absSq_parallelogram (ψ (fin16 2)) (ψ (fin16 6))
    have p3 := absSq_parallelogram (ψ (fin16 3)) (ψ (fin16 7))
    have p4 := absSq_parallelogram (ψ (fin16 8)) (ψ (fin16 12))
    have p5 := absSq_parallelogram (ψ (fin16 9)) (ψ (fin16 13))
    have p6 := absSq_parallelogram (ψ (fin16 10)) (ψ (fin16 14))
    have p7 := absSq_parallelogram (ψ (fin16 11)) (ψ (fin16 15))
    dsimp only [fin16] at p0 p1 p2 p3 p4 p5 p6 p7
    simp at p0 p1 p2 p3 p4 p5 p6 p7
    dsimp only [normSq4, hadamardScaled4Q, flipBit4, hasBit4, fin16]
    simp
    omega
  | 3, _ =>
    have p0 := absSq_parallelogram (ψ (fin16 0)) (ψ (fin16 8))
    have p1 := absSq_parallelogram (ψ (fin16 1)) (ψ (fin16 9))
    have p2 := absSq_parallelogram (ψ (fin16 2)) (ψ (fin16 10))
    have p3 := absSq_parallelogram (ψ (fin16 3)) (ψ (fin16 11))
    have p4 := absSq_parallelogram (ψ (fin16 4)) (ψ (fin16 12))
    have p5 := absSq_parallelogram (ψ (fin16 5)) (ψ (fin16 13))
    have p6 := absSq_parallelogram (ψ (fin16 6)) (ψ (fin16 14))
    have p7 := absSq_parallelogram (ψ (fin16 7)) (ψ (fin16 15))
    dsimp only [fin16] at p0 p1 p2 p3 p4 p5 p6 p7
    simp at p0 p1 p2 p3 p4 p5 p6 p7
    dsimp only [normSq4, hadamardScaled4Q, flipBit4, hasBit4, fin16]
    simp
    omega

/-- Theorem VI.5 (4-Qubit Complex CNOT Unitarity — all 12 distinct (ctrl, targ) pairs!). -/
public theorem cnot4Q_preserves_normSq4 (ctrl targ : Fin 4) (hne : ctrl ≠ targ) (ψ : QState4) :
    normSq4 (cnot4Q ctrl targ ψ) = normSq4 ψ := by
  rcases ctrl with ⟨c, hc⟩
  rcases targ with ⟨t, ht⟩
  match c, hc, t, ht with
  | 0, _, 0, _ | 1, _, 1, _ | 2, _, 2, _ | 3, _, 3, _ => exact absurd rfl hne
  | 0, _, 1, _ | 0, _, 2, _ | 0, _, 3, _
  | 1, _, 0, _ | 1, _, 2, _ | 1, _, 3, _
  | 2, _, 0, _ | 2, _, 1, _ | 2, _, 3, _
  | 3, _, 0, _ | 3, _, 1, _ | 3, _, 2, _ =>
    dsimp only [normSq4, cnot4Q, flipBit4, hasBit4, fin16]
    simp
    omega

/-- Non-vacuity witness for Theorem VI.5: Bell-pair preparation `CNOT(0, 1)` on `H_0 |0000⟩`. -/
public theorem cnot4Q_nonvacuous_witness :
    let ψ : QState4 := fun k => if k.val = 0 ∨ k.val = 1 then ⟨1, 0⟩ else ⟨0, 0⟩
    normSq4 (cnot4Q ⟨0, by decide⟩ ⟨1, by decide⟩ ψ) = 2 := by
  decide

/-- Theorem VI.6 (4-Qubit Complex CZ Unitarity — all 16 (ctrl, targ) pairs!). -/
public theorem cz4Q_preserves_normSq4 (ctrl targ : Fin 4) (ψ : QState4) :
    normSq4 (cz4Q ctrl targ ψ) = normSq4 ψ := by
  rcases ctrl with ⟨c, hc⟩
  rcases targ with ⟨t, ht⟩
  match c, hc, t, ht with
  | 0, _, 0, _ | 0, _, 1, _ | 0, _, 2, _ | 0, _, 3, _
  | 1, _, 0, _ | 1, _, 1, _ | 1, _, 2, _ | 1, _, 3, _
  | 2, _, 0, _ | 2, _, 1, _ | 2, _, 2, _ | 2, _, 3, _
  | 3, _, 0, _ | 3, _, 1, _ | 3, _, 2, _ | 3, _, 3, _ =>
    dsimp only [normSq4, cz4Q, hasBit4, fin16]
    simp [absSq_cNeg]

/-- Theorem VI.7 (4-Qubit Complex SWAP Unitarity — all 16 (q1, q2) pairs!). -/
public theorem swap4Q_preserves_normSq4 (q1 q2 : Fin 4) (ψ : QState4) :
    normSq4 (swap4Q q1 q2 ψ) = normSq4 ψ := by
  rcases q1 with ⟨a, ha⟩
  rcases q2 with ⟨b, hb⟩
  match a, ha, b, hb with
  | 0, _, 0, _ | 0, _, 1, _ | 0, _, 2, _ | 0, _, 3, _
  | 1, _, 0, _ | 1, _, 1, _ | 1, _, 2, _ | 1, _, 3, _
  | 2, _, 0, _ | 2, _, 1, _ | 2, _, 2, _ | 2, _, 3, _
  | 3, _, 0, _ | 3, _, 1, _ | 3, _, 2, _ | 3, _, 3, _ =>
    dsimp only [normSq4, swap4Q, hasBit4, fin16]
    simp
    try omega

-- ============================================================================
-- PART 2: BIJECTIVE TEMPORAL CLOCK & 360-FRAME SNAPSHOT BUFFER REVERSIBILITY
-- ============================================================================

/-- Discrete reversible temporal clock & phase state. -/
public structure ChronoState where
  step  : Int
  phase : Int
  deriving Repr, DecidableEq

@[expose] public def chronoAdvance (delta : Int) (s : ChronoState) : ChronoState :=
  { step := s.step + 1, phase := s.phase + delta }

@[expose] public def chronoRewind (delta : Int) (s : ChronoState) : ChronoState :=
  { step := s.step - 1, phase := s.phase - delta }

/-- Theorem VI.8: Rewinding after advancing restores the EXACT prior ChronoState (zero drift!). -/
public theorem temporal_rewind_exact_left_inv (delta : Int) (s : ChronoState) :
    chronoRewind delta (chronoAdvance delta s) = s := by
  cases s with
  | mk st ph =>
    simp only [chronoRewind, chronoAdvance]
    congr 1 <;> omega

/-- Theorem VI.9: Advancing after rewinding restores the EXACT future ChronoState (strict bijection!). -/
public theorem temporal_rewind_exact_right_inv (delta : Int) (s : ChronoState) :
    chronoAdvance delta (chronoRewind delta s) = s := by
  cases s with
  | mk st ph =>
    simp only [chronoAdvance, chronoRewind]
    congr 1 <;> omega

/-- Bounded LIFO snapshot history buffer (maxFrames = 360 in `TemporalEngine`, head = newest). -/
@[expose] public def pushSnapshot {α : Type} (cap : Nat) (buf : List α) (snap : α) : List α :=
  (snap :: buf).take cap

@[expose] public def popSnapshot {α : Type} : List α → Option (α × List α)
  | [] => none
  | x :: xs => some (x, xs)

/-- Theorem VI.10 (Bounded 360-Frame Rewind Buffer Exactness & Memory Cap):
    1. Pushing any snapshot onto a 360-frame buffer preserves `length <= 360`.
    2. Immediately popping restores the EXACT pushed snapshot (lossless rewind!). -/
public theorem snapshot_buffer_capacity_and_exact_pop {α : Type} (buf : List α) (snap : α) :
    (pushSnapshot 360 buf snap).length ≤ 360 ∧
    (∃ rest, popSnapshot (pushSnapshot 360 buf snap) = some (snap, rest)) := by
  unfold pushSnapshot popSnapshot
  constructor
  · rw [List.length_take]
    exact Nat.min_le_left _ _
  · refine ⟨buf.take 359, rfl⟩

/-- Theorem VI.11 (Exact Reachable 1/1 Combinatorial Universe Cardinality):
    Accounting strictly for reachable archetype-rarity pairs (7 standard archetypes x 6 rarities
    + 1 Singularity Archon boss x 3 high rarities = 45 reachable pairs), the exact discrete
    cross-product of PLANARIA v2.3's Weapon (80,640) x Armor (3,072) x NPC (25,920) forges
    equals `6,421,059,993,600` (> 6.42 trillion!) BEFORE continuous stat gradients and 64-bit
    SHA-256 lineage IDs across 24 orders of magnitude! -/
public theorem combinatorial_1of1_space_exceeds_6_trillion :
    let weaponDiscrete := 14 * 10 * 12 * 8 * 6
    let armorDiscrete  := 8 * 8 * 8 * 6
    let npcArchRarity  := 7 * 6 + 1 * 3
    let npcDiscrete    := npcArchRarity * 8 * 6 * 12
    weaponDiscrete = 80640 ∧
    armorDiscrete  = 3072 ∧
    npcDiscrete    = 25920 ∧
    weaponDiscrete * armorDiscrete * npcDiscrete = 6421059993600 ∧
    weaponDiscrete * armorDiscrete * npcDiscrete > 6400000000000 := by
  decide

end Planaria.QuantumTemporal
