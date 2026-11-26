# Contributing to PLANARIA

Thank you for exploring, auditing, replicating, or building on **PLANARIA** (`v2.3.0`).

## Licensing Note

All files and non-commercial derivatives of **PLANARIA** are governed by the **COSMOGONIC LICENSE — NON-COMMERCIAL RESEARCH & PLAY** ([LICENSE](../LICENSE)). External non-commercial patches or bug reports submitted to this repository are accepted under the same license terms.

## Verification Checklist

1. **Zero Runtime Dependencies:** Do not introduce third-party npm packages or Lean Mathlib dependencies.
2. **Rebuild Artifacts, Pass All 28 Suites, Kill All 10 Mutants & Pass Static Analysis:**
   ```bash
   npm run build
   npm test
   npm run mutate
   npm run lint
   npm run check:citations
   ```
3. **Run Statistical Benchmarks:**
   ```bash
   npm run benchmark
   ```
4. **Machine-Check All 70 Lean 4.35.0 Proofs (0 `sorryAx`, 0 `native_decide`, 0 custom axioms):**
   ```bash
   cd lean && lake build && lake env lean VerifyAxioms.lean
   ```
   On Linux with `bubblewrap` installed, also run:
   ```bash
   cd lean && lake check --paranoid && lake comparator --config comparator.json --paranoid
   ```
5. **Update Documentation & Checksums:** If you modify any `.plang` source, codec parameter, or theorem, regenerate `artifacts/`, `results/benchmarks.json`, `results/attestation.json`, `results/lean4-audit.txt`, `MANIFEST.sha256`, and `data/MANIFEST.sha256`.

## Finding Classification

When filing an issue or audit report, please classify the finding using one of the 10 labels defined in [`.github/labels.tsv`](labels.tsv): `bug`, `error`, `issue`, `problem`, `concern`, `dilemma`, `conflict`, `gap`, `hole`, or `blindspot`.
