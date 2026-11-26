# ADR-0003: Pure Lean 4.35.0 (`module`, `autoImplicit=false`, Zero Mathlib) + 6-Kernel Palomar Comparator & Blueprint

- **Status:** Accepted
- **Date:** 2026-11-25 (upgraded `v2.4.0`)

## Context

Formal proof suites tied to multi-gigabyte Mathlib snapshots suffer toolchain churn, slow CI builds, and large trusted computing bases. Relying on implicit variable binding (`autoImplicit = true`) or a single Lean kernel risks silent specification drift or soundness blindspots.

## Decision

1. Pin `leanprover/lean4:v4.35.0` with **zero Mathlib dependencies**, **`autoImplicit = false`**, **`relaxedAutoImplicit = false`**, and line-1 `module` headers across ALL `.lean` files (`Spec.lean`, `GF256`, `MitosisBounds`, `StratumAnastomosis`, `ByzantineImmune`, `XenograftABI`, `QuantumTemporal`, `AdversarialTests`, `PlanariaProofs`, `VerifyAxioms`, `Challenge`, `Solution`), proving **85 theorems** (including 10 non-vacuity witnesses and 8 formal adversarial refutations).
2. Factor all pure shared definitions into `lean/PlanariaProofs/Spec.lean` (zero proofs, zero `sorry`) so `lean/Challenge.lean` imports ONLY `PlanariaProofs.Spec` while sharing bit-identical kernel constants with `lean/Solution.lean`.
3. Check `Solution` with `leanchecker`, `leanchecker-paranoid`, `lake check --paranoid` and `lake comparator --paranoid`, which together report six kernel checks (Lean default and paranoid, lean4lean, nanoda, con-leche, con-ron; the first two share the Lean C++ kernel), and run a live negative tampering test in Ubuntu CI.
4. Generate an interactive zero-CDN SVG Proof Blueprint (`blueprint/index.html` + `blueprint/blueprint.json`) checked 1:1 against `comparator.json` and `results/lean4-audit.txt` in CI (`npm run check:blueprint`).

## Consequences

- **Positive:** Cold CI builds complete in seconds, trusted axioms are strictly `[propext, Classical.choice, Quot.sound]` (15 theorems use zero axioms), tampering with `Challenge.lean` is provably rejected by CI, and every theorem is browsable interactively.
- **Negative / Trade-off:** Elementary list/permutation/matrix lemmas are proved from first principles instead of imported from Mathlib; concrete JavaScript runtime fidelity remains outside the Lean kernel boundary (bridged via 30 test suites, 12/12 mutation testing, 2,000-case fuzzing, and the clean-room Python 3 differential oracle).
