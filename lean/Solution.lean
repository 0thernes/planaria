module

public import PlanariaProofs

/-!
# PLANARIA v2.4.0 Formal Solution Entrypoint (`Solution.lean`)

Exports all 85 machine-checked theorems from `PlanariaProofs` (7 pure Lean 4.35.0
modules including `AdversarialTests.lean`, with `autoImplicit = false`) for isolated
judging against `Challenge.lean` via `lake comparator --config comparator.json --paranoid`.
-/
