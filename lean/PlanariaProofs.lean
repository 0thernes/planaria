module

public import PlanariaProofs.GF256
public import PlanariaProofs.MitosisBounds
public import PlanariaProofs.StratumAnastomosis
public import PlanariaProofs.ByzantineImmune
public import PlanariaProofs.XenograftABI
public import PlanariaProofs.QuantumTemporal
public import PlanariaProofs.AdversarialTests

/-!
# PLANARIA v2.4.0 Formal Verification Library Entrypoint (`PlanariaProofs.lean`)

Aggregates all seven pure Lean 4.35.0 `module` proof files (85 machine-checked theorems,
zero Mathlib, zero `sorry`, zero `native_decide`, `autoImplicit = false`,
`relaxedAutoImplicit = false`).

Axiom auditing (`#print axioms`) is run exclusively via standalone `VerifyAxioms.lean`
(`lake env lean VerifyAxioms.lean`) so library builds emit zero stdout noise while every
declaration's exact axiom footprint is recorded in `results/lean4-audit.txt`.
-/
