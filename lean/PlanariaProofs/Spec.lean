module

/-!
# PlanariaProofs.Spec — Pure Shared Definitions Only (Zero Proofs, Zero `sorry`)

Canonical mathematical and protocol definitions shared identically by BOTH:
  - `Challenge.lean` (isolated statement-only specification — imports ONLY this file, ZERO proof modules)
  - `PlanariaProofs/*.lean` & `Solution.lean` (sorry-free proofs checked across 6 independent kernels)

Sharing pure definitions via `PlanariaProofs.Spec` ensures bit-identical kernel constants
(including generated `.match_1` splitters and `DecidableEq`/`Repr` instances) under
`lake comparator --config comparator.json --paranoid` while maintaining strict isolation
between specifications and proofs.
-/

-- ============================================================================
-- MODULE 1 DEFINITIONS: GF(2^8) ARITHMETIC (0x11D) & CAUCHY 2x2 CODEC
-- ============================================================================
namespace Planaria.GF256

/-- Exact GF(2^8) addition on bytes (0..255). -/
@[expose] public def gfAdd (a b : Nat) : Nat := (a ^^^ b) % 256

/-- Exact xtime modulo P(x) = x^8 + x^4 + x^3 + x^2 + 1 (0x11D). -/
@[expose] public def xtime (a : Nat) : Nat :=
  let s := (a * 2) % 256
  if a ≥ 128 then s ^^^ 0x1d else s

/-- Exact Russian-peasant multiplication over GF(2^8) (matches `gfMulDirect`). -/
@[expose] public def gfMulLoop : Nat → Nat → Nat → Nat → Nat
  | 0, acc, _, _ => acc
  | n + 1, acc, a, b =>
    let acc' := if b % 2 == 1 then acc ^^^ a else acc
    gfMulLoop n acc' (xtime a) (b / 2)

@[expose] public def gfMul (a b : Nat) : Nat := gfMulLoop 8 0 (a % 256) (b % 256)

/-- Exact multiplicative inverse via Itoh-Tsujii chain a^254 over GF(2^8). -/
@[expose] public def gfInv (a : Nat) : Nat :=
  let a2   := gfMul a a
  let a3   := gfMul a2 a
  let a6   := gfMul a3 a3
  let a12  := gfMul a6 a6
  let a15  := gfMul a12 a3
  let a30  := gfMul a15 a15
  let a60  := gfMul a30 a30
  let a120 := gfMul a60 a60
  let a240 := gfMul a120 a120
  let a252 := gfMul a240 a12
  gfMul a252 a2

/-- Exact Cauchy matrix entry C(x, y) = (x XOR y)^(-1) in GF(2^8). -/
@[expose] public def cauchyEntry (x y : Nat) : Nat := gfInv (gfAdd x y)

/-- 2-cell Cauchy encode (Stratum 0 S0_STEM_NUCLEUS, k = 2). -/
@[expose] public def cauchyEncode2 (x0 x1 d0 d1 : Nat) : Nat × Nat :=
  (gfAdd (gfMul (cauchyEntry x0 0) d0) (gfMul (cauchyEntry x0 1) d1),
   gfAdd (gfMul (cauchyEntry x1 0) d0) (gfMul (cauchyEntry x1 1) d1))

/-- 2-cell Cauchy decode via exact 2x2 adjugate inverse over GF(2^8). -/
@[expose] public def cauchyDecode2 (x0 x1 p0 p1 : Nat) : Nat × Nat :=
  let c00 := cauchyEntry x0 0
  let c01 := cauchyEntry x0 1
  let c10 := cauchyEntry x1 0
  let c11 := cauchyEntry x1 1
  let det := gfAdd (gfMul c00 c11) (gfMul c01 c10)
  let dInv := gfInv det
  (gfMul dInv (gfAdd (gfMul c11 p0) (gfMul c01 p1)),
   gfMul dInv (gfAdd (gfMul c10 p0) (gfMul c00 p1)))

/-- Abstract characteristic-2 field axioms (zero Mathlib). -/
public structure Char2Field (F : Type) where
  zero : F
  one  : F
  add  : F → F → F
  mul  : F → F → F
  inv  : F → F
  one_ne_zero : one ≠ zero
  add_comm    : ∀ a b, add a b = add b a
  add_assoc   : ∀ a b c, add (add a b) c = add a (add b c)
  add_zero    : ∀ a, add a zero = a
  add_self    : ∀ a, add a a = zero
  mul_comm    : ∀ a b, mul a b = mul b a
  mul_assoc   : ∀ a b c, mul (mul a b) c = mul a (mul b c)
  mul_one     : ∀ a, mul a one = a
  mul_add     : ∀ a b c, mul a (add b c) = add (mul a b) (mul a c)
  mul_inv     : ∀ a, a ≠ zero → mul a (inv a) = one

/-- Generic 2x2 Cauchy encode over any characteristic-2 field K. -/
@[expose] public def cauchyEncode2K {F : Type} (K : Char2Field F) (x0 x1 y0 y1 d0 d1 : F) : F × F :=
  let c00 := K.inv (K.add x0 y0)
  let c01 := K.inv (K.add x0 y1)
  let c10 := K.inv (K.add x1 y0)
  let c11 := K.inv (K.add x1 y1)
  (K.add (K.mul c00 d0) (K.mul c01 d1),
   K.add (K.mul c10 d0) (K.mul c11 d1))

/-- Generic 2x2 Cauchy decode (adjugate formula) over any characteristic-2 field K. -/
@[expose] public def cauchyDecode2K {F : Type} (K : Char2Field F) (x0 x1 y0 y1 p0 p1 : F) : F × F :=
  let c00 := K.inv (K.add x0 y0)
  let c01 := K.inv (K.add x0 y1)
  let c10 := K.inv (K.add x1 y0)
  let c11 := K.inv (K.add x1 y1)
  let det := K.add (K.mul c00 c11) (K.mul c01 c10)
  let dInv := K.inv det
  (K.mul dInv (K.add (K.mul c11 p0) (K.mul c01 p1)),
   K.mul dInv (K.add (K.mul c10 p0) (K.mul c00 p1)))

end Planaria.GF256

-- ============================================================================
-- MODULE 2 DEFINITIONS: MITOSIS BOUNDS & INTEGER PLACEMENT SCHEDULE
-- ============================================================================
namespace Planaria.Mitosis

@[expose] public def planariaBundleParams : List (Nat × Nat) :=
  [(2, 24), (4, 24), (4, 24), (8, 32), (6, 24), (16, 40), (8, 24)]

@[expose] public def planariaIndexedBundles : List (Nat × Nat × Nat) :=
  [(0, 2, 24), (1, 4, 24), (2, 4, 24), (3, 8, 32), (4, 6, 24), (5, 16, 40), (6, 8, 24)]

@[expose] public def posNum (b i n_b : Nat) : Nat := (14 * i + 2 * b + 1) * (480 / n_b)

@[expose] public def bundlePosKeys (b n_b : Nat) : List Nat :=
  (List.range n_b).map (fun i => posNum b i n_b)

@[expose] public def all192LexKeys : List Nat :=
  planariaIndexedBundles.flatMap (fun (b, _, n_b) =>
    (List.range n_b).map (fun i => posNum b i n_b * 8 + b))

@[expose] public def splitAlt : List Nat → List Nat × List Nat
  | [] => ([], [])
  | [x] => ([x], [])
  | x :: y :: rest =>
    let (a, b) := splitAlt rest
    (x :: a, y :: b)

@[expose] public def mergeNatFuel : Nat → List Nat → List Nat → List Nat
  | 0, xs, ys => xs ++ ys
  | _ + 1, [], ys => ys
  | _ + 1, xs, [] => xs
  | f + 1, x :: xs, y :: ys =>
    if x ≤ y then x :: mergeNatFuel f xs (y :: ys) else y :: mergeNatFuel f (x :: xs) ys

@[expose] public def msortFuel : Nat → List Nat → List Nat
  | 0, xs => xs
  | f + 1, xs =>
    match xs with
    | [] => []
    | [x] => [x]
    | _ =>
      let (a, b) := splitAlt xs
      mergeNatFuel (xs.length + 1) (msortFuel f a) (msortFuel f b)

@[expose] public def isStrictlyIncreasing : List Nat → Bool
  | [] => true
  | [_] => true
  | x :: y :: rest => decide (x < y) && isStrictlyIncreasing (y :: rest)

@[expose] public def allDistinctSorted (xs : List Nat) : Bool :=
  let s := msortFuel 10 xs
  decide (s.length = xs.length) && isStrictlyIncreasing s

end Planaria.Mitosis

-- ============================================================================
-- MODULE 3 DEFINITIONS: 4-STRATUM LATTICE & 6-ORGAN ANASTOMOSIS
-- ============================================================================
namespace Planaria.Anastomosis

public structure ShardProfile where
  b0 : Nat
  b1 : Nat
  b2 : Nat
  b3 : Nat
  b4 : Nat
  b5 : Nat
  b6 : Nat
  deriving Repr, DecidableEq

@[expose] public def ShardProfile.totalCells (p : ShardProfile) : Nat :=
  p.b0 + p.b1 + p.b2 + p.b3 + p.b4 + p.b5 + p.b6

@[expose] public def canFullRegenerate (p : ShardProfile) : Bool :=
  decide (p.b0 ≥ 2 ∧ p.b1 ≥ 4 ∧ p.b2 ≥ 4 ∧ p.b3 ≥ 8 ∧ p.b4 ≥ 6 ∧ p.b5 ≥ 16 ∧ p.b6 ≥ 8)

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

@[expose] public def resolveRenderer (p : ShardProfile) : RenderTarget :=
  if p.b0 < 2 then .deadCrash
  else if p.b3 ≥ 8 then .s2Cortex
  else if p.b2 ≥ 4 then .s1Wireframe
  else .s0GhostStub

public inductive OrganTarget where
  | deadCrash
  | noopStub
  | execBundle (bundleId : Nat)
  deriving Repr, DecidableEq

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

@[expose] public def viabilityLevel (p : ShardProfile) : Nat :=
  if p.b0 < 2 then 0
  else if p.b1 ≥ 4 ∧ p.b3 ≥ 8 ∧ p.b4 ≥ 6 ∧ p.b5 ≥ 16 then 4
  else if p.b1 ≥ 4 ∧ (p.b3 ≥ 8 ∨ p.b4 ≥ 6) then 3
  else if p.b1 ≥ 4 ∨ p.b2 ≥ 4 ∨ p.b3 ≥ 8 then 2
  else 1

@[expose] public def fuseDisjoint (a b : ShardProfile) : ShardProfile :=
  { b0 := a.b0 + b.b0
    b1 := a.b1 + b.b1
    b2 := a.b2 + b.b2
    b3 := a.b3 + b.b3
    b4 := a.b4 + b.b4
    b5 := a.b5 + b.b5
    b6 := a.b6 + b.b6 }

@[expose] public def cliffBinaryAlive (cells : Nat) : Bool := decide (cells ≥ 16)
@[expose] public def flatEqualStorageAlive (totalCells : Nat) : Bool := decide (totalCells ≥ 48)

end Planaria.Anastomosis

-- ============================================================================
-- MODULE 4 DEFINITIONS: BYTE-LIST HAMMING, INTERLEAVED RS, MERKLE & QUORUM
-- ============================================================================
namespace Planaria.Byzantine

@[expose] public def hammingDist : List Nat → List Nat → Nat
  | [], [] => 0
  | x :: xs, y :: ys => (if x = y then 0 else 1) + hammingDist xs ys
  | xs, [] => xs.length
  | [], ys => ys.length

@[expose] public def countEven (start len : Nat) : Nat :=
  match len with
  | 0 => 0
  | n + 1 => (if (start + n) % 2 = 0 then 1 else 0) + countEven start n

@[expose] public def countOdd (start len : Nat) : Nat :=
  match len with
  | 0 => 0
  | n + 1 => (if (start + n) % 2 = 1 then 1 else 0) + countOdd start n

@[expose] public def evalMerklePath (hashPair : Nat → Nat → Nat) : Nat → List (Bool × Nat) → Nat
  | cur, [] => cur
  | cur, (isRight, sib) :: rest =>
    let next := if isRight then hashPair sib cur else hashPair cur sib
    evalMerklePath hashPair next rest

@[expose] public def pow2Pair (a b : Nat) : Nat := (2 * a + 1) * 2 ^ b

public structure HarvestedCell where
  evalX     : Nat
  rootHash  : Nat
  authentic : Bool
  deriving Repr, DecidableEq

@[expose] public def HashBinding (pinnedRoot : Nat) (cells : List HarvestedCell) : Prop :=
  ∀ c ∈ cells, (c.rootHash = pinnedRoot) ↔ (c.authentic = true)

@[expose] public def merkleQuarantine (pinnedRoot : Nat) (cells : List HarvestedCell) : List HarvestedCell :=
  cells.filter (fun c => decide (c.rootHash = pinnedRoot))

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

end Planaria.Byzantine

-- ============================================================================
-- MODULE 5 DEFINITIONS: PVM-32 BITVEC SANDBOXING & XENOGRAFT SOVEREIGNTY
-- ============================================================================
namespace Planaria.Xenograft

@[expose] public def maskRamAddr32 (addr : BitVec 32) : Nat := (addr &&& 0xFFF#32).toNat

@[expose] public def stepsConsumed (stepFn : Nat → Option Nat) : Nat → Nat → Nat
  | 0, _ => 0
  | fuel + 1, state =>
    match stepFn state with
    | none => 0
    | some nextState => 1 + stepsConsumed stepFn fuel nextState

public structure BundleSlot where
  bundleId      : Nat
  abiSig        : Nat
  xenograftable : Bool
  viable        : Bool
  deriving Repr, DecidableEq

@[expose] public def isXenograftableBundle (bundleId : Nat) : Bool :=
  decide (bundleId ≥ 1 ∧ bundleId ≤ 5)

@[expose] public def applyXenograft (host donor : BundleSlot) : BundleSlot :=
  if !host.viable &&
     isXenograftableBundle host.bundleId &&
     host.xenograftable &&
     donor.xenograftable &&
     donor.viable &&
     (donor.bundleId == host.bundleId) &&
     (donor.abiSig == host.abiSig) then
    { host with viable := true }
  else
    host

/-- Full host-gated xenograft dispatch matching `src/core/hbin.js` Step 3 (`bundles[0].viable`):
    a dead host (`hostStemViable = false`) unconditionally refuses ALL donor grafts. -/
@[expose] public def applyXenograftWithStem (hostStemViable : Bool) (host donor : BundleSlot) : BundleSlot :=
  if hostStemViable then applyXenograft host donor else host

end Planaria.Xenograft

-- ============================================================================
-- MODULE 6 DEFINITIONS: 4-QUBIT COMPLEX STATEVECTOR & TEMPORAL REWIND
-- ============================================================================
namespace Planaria.QuantumTemporal

public structure ComplexInt where
  re : Int
  im : Int
  deriving Repr, DecidableEq

@[expose] public def absSq (z : ComplexInt) : Int := z.re * z.re + z.im * z.im
@[expose] public def cNeg (z : ComplexInt) : ComplexInt := ⟨-z.re, -z.im⟩
@[expose] public def cMulI (z : ComplexInt) : ComplexInt := ⟨-z.im, z.re⟩
@[expose] public def cMulNegI (z : ComplexInt) : ComplexInt := ⟨z.im, -z.re⟩
@[expose] public def cAdd (u v : ComplexInt) : ComplexInt := ⟨u.re + v.re, u.im + v.im⟩
@[expose] public def cSub (u v : ComplexInt) : ComplexInt := ⟨u.re - v.re, u.im - v.im⟩

public abbrev QState4 := Fin 16 → ComplexInt

@[expose] public def fin16 (n : Nat) : Fin 16 :=
  ⟨n % 16, Nat.mod_lt n (Nat.zero_lt_succ 15)⟩

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

@[expose] public def pauliX4Q (q : Fin 4) (ψ : QState4) : QState4 :=
  fun k => ψ (flipBit4 k q)

@[expose] public def pauliY4Q (q : Fin 4) (ψ : QState4) : QState4 :=
  fun k =>
    let partner := ψ (flipBit4 k q)
    match hasBit4 k q with
    | true => cMulI partner
    | false => cMulNegI partner

@[expose] public def pauliZ4Q (q : Fin 4) (ψ : QState4) : QState4 :=
  fun k => match hasBit4 k q with | true => cNeg (ψ k) | false => ψ k

@[expose] public def hadamardScaled4Q (q : Fin 4) (ψ : QState4) : QState4 :=
  fun k =>
    let kFlip := flipBit4 k q
    match hasBit4 k q with
    | true => cSub (ψ kFlip) (ψ k)
    | false => cAdd (ψ k) (ψ kFlip)

@[expose] public def cnot4Q (ctrl targ : Fin 4) (ψ : QState4) : QState4 :=
  fun k => match hasBit4 k ctrl with | true => ψ (flipBit4 k targ) | false => ψ k

@[expose] public def cz4Q (ctrl targ : Fin 4) (ψ : QState4) : QState4 :=
  fun k => match hasBit4 k ctrl && hasBit4 k targ with | true => cNeg (ψ k) | false => ψ k

@[expose] public def swap4Q (q1 q2 : Fin 4) (ψ : QState4) : QState4 :=
  fun k =>
    match hasBit4 k q1 != hasBit4 k q2 with
    | true => ψ (fin16 ((k.val ^^^ (1 <<< q1.val)) ^^^ (1 <<< q2.val)))
    | false => ψ k

public structure ChronoState where
  step  : Int
  phase : Int
  deriving Repr, DecidableEq

@[expose] public def chronoAdvance (delta : Int) (s : ChronoState) : ChronoState :=
  { step := s.step + 1, phase := s.phase + delta }

@[expose] public def chronoRewind (delta : Int) (s : ChronoState) : ChronoState :=
  { step := s.step - 1, phase := s.phase - delta }

@[expose] public def pushSnapshot {α : Type} (cap : Nat) (buf : List α) (snap : α) : List α :=
  (snap :: buf).take cap

@[expose] public def popSnapshot {α : Type} : List α → Option (α × List α)
  | [] => none
  | x :: xs => some (x, xs)

end Planaria.QuantumTemporal
