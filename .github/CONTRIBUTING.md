# Contributing to PLANARIA

Thank you for exploring, auditing, or building on **PLANARIA**!

## Licensing Note

All contributions and derivatives of **PLANARIA** are governed by the **COSMOGONIC LICENSE — NON-COMMERCIAL RESEARCH & PLAY** ([LICENSE](../LICENSE)). By submitting a pull request or patch, you agree that your contribution may be distributed under the repository's license.

## Verification Checklist Before Opening a PR

1. **Zero Runtime Dependencies**: Do not add third-party npm packages or Mathlib dependencies.
2. **Rebuild Artifacts & Pass All 12 Suites**:
   ```bash
   npm run build
   npm test
   npm run benchmark
   ```
3. **Machine-Check All Lean 4 Proofs** (zero `sorryAx`, zero `native_decide`, zero warnings):
   ```bash
   cd lean && lake clean && lake build
   ```
4. **Update Documentation & Digests**: If you modify any `.plang` source, codec parameter, or theorem, regenerate `artifacts/`, `results/benchmarks.json`, `results/attestation.json`, and `results/lean4-audit.txt`.
