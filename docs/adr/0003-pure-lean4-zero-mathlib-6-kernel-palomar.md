# ADR-0003: Pure Lean 4.35.0 (`module`, Zero Mathlib) + 6-Kernel Palomar Comparator

- **Status:** Accepted
- **Date:** 2026-11-25

## Context

Formal proof suites tied to multi-gigabyte Mathlib snapshots suffer toolchain churn, slow CI builds, and large trusted computing bases. Moreover, relying on a single Lean kernel leaves subtle soundness or statement-mismatch risks unverified.

## Decision

1. Pin `leanprover/lean4:v4.35.0` with **zero Mathlib dependencies** using Lean 4.35.0's `module` system across 6 focused modules (`GF256`, `MitosisBounds`, `StratumAnastomosis`, `ByzantineImmune`, `XenograftABI`, `QuantumTemporal`, total **70 theorems**).
2. Publish a standalone, zero-import `lean/Challenge.lean` alongside `lean/Solution.lean`, `lean/comparator.json`, and `formalization.yaml` so independent auditors can verify exact theorem statements without reading project internals.
3. Verify `Solution` across **6 independent kernels** (`lean4`, `leanchecker`, `leanchecker-paranoid`, `nanoda_bin`, `con-leche`, `con-ron`, plus `lean4lean` + `lake check --paranoid` + `lake comparator --paranoid` inside `bubblewrap` on Ubuntu Linux CI).
4. Keep `Challenge` excluded from `defaultTargets` in `lakefile.toml` so `lake check --paranoid` checks zero `sorryAx` proofs while `lake comparator` validates exact statement equivalence.

## Consequences

- **Positive:** Cold CI builds complete in seconds, trusted axioms are strictly `[propext, Classical.choice, Quot.sound]`, and statement-fidelity gaps (`viabilityLevel`, `electUnpinnedQuorum`, `all192LexKeys.Nodup`) are formally closed.
- **Negative / Trade-off:** Elementary list/permutation/matrix lemmas are proved from first principles instead of imported from Mathlib; concrete JavaScript runtime fidelity remains outside the Lean kernel boundary (covered by `test/verify.mjs` and `scripts/mutation-test.mjs`).
