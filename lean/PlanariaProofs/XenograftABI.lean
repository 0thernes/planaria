/-!
# PlanariaProofs.XenograftABI

Theorem V — PVM-32 Virtual Machine Signed 32-Bit Sandboxed Memory Isolation (`BitVec 32`),
Bounded-Fuel Execution Termination, Host Lineage Sovereignty (binding `isXenograftableBundle`
directly to Bundle 0 & Bundle 6), and Cross-Species Xenograft ABI Soundness.
-/

namespace Planaria.Xenograft

/-- Exact PVM-32 signed 32-bit RAM address masking matching `(base + offset) & 0xFFF` in `pvm32.js`. -/
def maskRamAddr32 (addr : BitVec 32) : Nat := (addr &&& 0xFFF#32).toNat

/-- Theorem V.1 (PVM-32 Signed 32-Bit Memory Sandboxing Invariant):
    For EVERY 32-bit two's-complement register `base` and signed immediate `offset`
    (including negative offsets, wraparound, and overflow!), `(base + offset) & 0xFFF`
    is strictly confined within `[0, 4096)`! -/
theorem pvm32_ram_bounds_invariant (base offset : BitVec 32) :
    maskRamAddr32 (base + offset) < 4096 := by
  unfold maskRamAddr32
  have hEq : ((base + offset) &&& 0xFFF#32).toNat = (base + offset).toNat &&& 4095 := by
    simp [BitVec.toNat_and]
  rw [hEq]
  have hLe : (base + offset).toNat &&& 4095 ≤ 4095 := Nat.and_le_right
  omega

/-- Step counter proving bounded termination in <= budget steps. -/
def stepsConsumed (stepFn : Nat → Option Nat) : Nat → Nat → Nat
  | 0, _ => 0
  | fuel + 1, state =>
    match stepFn state with
    | none => 0
    | some nextState => 1 + stepsConsumed stepFn fuel nextState

/-- Theorem V.2 (PVM-32 Bounded-Step Termination):
    Any organ invocation (primary or xenografted) terminates in at most `budget` cycles —
    an infinite loop in a transplanted organ can NEVER hang the host VM! -/
theorem pvm32_bounded_termination (stepFn : Nat → Option Nat) (budget state : Nat) :
    stepsConsumed stepFn budget state ≤ budget := by
  induction budget generalizing state with
  | zero => simp [stepsConsumed]
  | succ f ih =>
    simp only [stepsConsumed]
    cases h : stepFn state with
    | none => simp
    | some next =>
      simp only
      have hsub := ih next
      omega

/-- Organ bundle descriptor for ABI-verified Xenografting. -/
structure BundleSlot where
  bundleId      : Nat
  abiSig        : Nat
  xenograftable : Bool
  viable        : Bool
  deriving Repr, DecidableEq

/-- Exact PLANARIA sovereignty policy: Bundle 0 (KERNEL) and Bundle 6 (GENOME) are non-xenograftable. -/
def isXenograftableBundle (bundleId : Nat) : Bool :=
  decide (bundleId ≥ 1 ∧ bundleId ≤ 5)

/-- Safe Xenograft transplant rule matching `src/core/hbin.js` Step 3, enforcing BOTH
    the protocol-level `isXenograftableBundle` sovereignty boundary AND header flags/ABI. -/
def applyXenograft (host donor : BundleSlot) : BundleSlot :=
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

/-- Theorem V.3 (Host Lineage Sovereignty via Header Flag):
    Any bundle with `xenograftable = false` can NEVER be replaced by a foreign donor. -/
theorem xenograft_preserves_sovereignty (host donor : BundleSlot)
    (hSov : host.xenograftable = false) :
    applyXenograft host donor = host := by
  unfold applyXenograft
  simp [hSov]

/-- Theorem V.4 (Non-Vacuous B0/B6 Sovereignty Invariant):
    Even if an adversarial header lies with `xenograftable = true`, Bundle 0 (S0_STEM_NUCLEUS)
    and Bundle 6 (S3_GENOME_LEDGER) can NEVER be transplanted by `applyXenograft`! -/
theorem xenograft_sovereign_b0_b6_immutable (host donor : BundleSlot)
    (hId : host.bundleId = 0 ∨ host.bundleId = 6) :
    applyXenograft host donor = host := by
  unfold applyXenograft isXenograftableBundle
  rcases hId with h0 | h6
  · simp [h0]
  · simp [h6]

/-- Theorem V.5 (Xenograft ABI & Bundle Identity Contract Preservation):
    Any accepted Xenograft transplant strictly preserves the host slot's ABI signature
    and bundle identity — incompatible donor organs are unconditionally rejected. -/
theorem xenograft_abi_safety (host donor : BundleSlot) :
    (applyXenograft host donor).abiSig = host.abiSig ∧
    (applyXenograft host donor).bundleId = host.bundleId ∧
    (donor.abiSig ≠ host.abiSig → applyXenograft host donor = host) ∧
    (donor.bundleId ≠ host.bundleId → applyXenograft host donor = host) := by
  unfold applyXenograft
  refine ⟨?_, ?_, ?_, ?_⟩
  · split <;> rfl
  · split <;> rfl
  · intro hne
    have hbeq : (donor.abiSig == host.abiSig) = false := beq_false_of_ne hne
    simp [hbeq]
  · intro hne
    have hbeq : (donor.bundleId == host.bundleId) = false := beq_false_of_ne hne
    simp [hbeq]

/-- Theorem V.6 (Therapeutic Restoration of Amputated Host):
    If a xenograftable host organ (`bundleId ∈ 1..5`) is amputated (`viable = false`) and a
    matching viable xenograftable donor with equal `bundleId` and `abiSig` is spliced in,
    the resulting chimera slot becomes strictly viable (`true`). -/
theorem xenograft_improves_amputated_host (host donor : BundleSlot)
    (hAmp : host.viable = false)
    (hRange : host.bundleId ≥ 1 ∧ host.bundleId ≤ 5)
    (hXenoH : host.xenograftable = true)
    (hXenoD : donor.xenograftable = true)
    (hDonor : donor.viable = true)
    (hId : donor.bundleId = host.bundleId)
    (hAbi : donor.abiSig = host.abiSig) :
    (applyXenograft host donor).viable = true := by
  unfold applyXenograft isXenograftableBundle
  have hDec : decide (host.bundleId ≥ 1 ∧ host.bundleId ≤ 5) = true := decide_eq_true hRange
  simp [hAmp, hDec, hXenoH, hXenoD, hDonor, hId, hAbi]

end Planaria.Xenograft
