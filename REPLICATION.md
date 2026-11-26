# REPLICATION.md — Clean-Clone Reproduction & Independent Replication Protocol (`v2.4.0`)

This protocol lets any independent engineer or academic reviewer verify **every single claim, test, mutant, fuzz run, cross-language Python oracle, statistical benchmark, Lean 4.35.0 proof, interactive Blueprint, citation DOI, and PDF paper** from a clean clone using only open-source toolchains.

## 1. Prerequisites

| Tool | Required Version | Purpose | Required For |
| :--- | :--- | :--- | :--- |
| **Node.js** | `>= 20.0.0` (verified on `v25.8.2` & CI `v22`) | Runtime, compiler, VM, 30 suites, 12-mutant suite, 2,000-case fuzzer, Blueprint, benchmarks (zero npm deps!) | Core build, tests, Studio |
| **Python 3** | `>= 3.10` (stdlib only, zero pip packages) | Clean-room cross-language differential oracle (`reference/planaria_oracle.py`) | Cross-language verification |
| **Lean 4 (`elan`)** | `leanprover/lean4:v4.35.0` (pinned in `lean/lean-toolchain`) | 85 formal proofs (`autoImplicit = false`) + 6-kernel verification + Palomar comparator | Formal verification |
| **bubblewrap (`bwrap`)** | Linux only (`sudo apt-get install -y bubblewrap`) | Sandboxed `lake check --paranoid` & `lake comparator --paranoid` (+ negative tamper check) | Linux 6-kernel sandbox |
| **Tectonic** | `>= 0.15` (optional) | Recompile `paper/main.tex` -> `dist/Donahue_2026_planaria.pdf` | White paper PDF build |

## 2. Exact Clean-Clone Reproduction Commands

```bash
git clone https://github.com/0thernes/planaria.git
cd planaria

# 1. Deterministic build of all 4 living .hbin organisms (98,304 B each)
npm run build

# 2. Full 30-suite verification, property-based, metamorphic, DSP & regression harness
npm test

# 3. Clean-room Python 3 cross-language differential oracle (768 cells + mitosis + 4Q CHSH/Mermin)
python3 reference/planaria_oracle.py

# 4. Deterministic 2,000-case adversarial fuzzer (decodeHbin, Plang, RS, PVM-32)
npm run fuzz

# 5. Surgical mutation testing (12 planted mutants -> expect 12/12 = 100.0% KILLED)
npm run mutate

# 6. Static analysis, cross-doc Lean theorem linter, README axiom check, Blueprint check & live Crossref DOI audit
npm run lint
npm run check:axioms
npm run blueprint && npm run check:blueprint
npm run check:citations -- --live

# 7. Reproducible 4-architecture Monte Carlo + Wilson 95% CI + McNemar + Holm-Bonferroni benchmarks
npm run benchmark

# 8. Pure Lean 4.35.0 build & verbatim 85-theorem #print axioms audit (autoImplicit = false)
cd lean
lake clean && lake build
lake build Challenge
lake env lean VerifyAxioms.lean
lake env leanchecker --fresh Solution
lake env leanchecker-paranoid --fresh Solution

# 9. Full 6-kernel sandboxed verification & Palomar Challenge/Solution comparator (Linux with bwrap)
lake check --paranoid
lake comparator --config comparator.json --paranoid
cd ..

# 10. Optional: recompile AMS-LaTeX White Paper PDF
npm run paper

# 11. Launch live 3D WebGL2 Studio (http://127.0.0.1:4174/) & Proof Blueprint (http://127.0.0.1:4174/blueprint/)
npm start
```

Or run the full automated pipeline via `just reproduce` (or `./scripts/dev.sh reproduce`).

## 3. Expected Headline Outputs (Pass/Fail Acceptance Criteria)

- `npm run build`: writes 4 deterministic 98,304 B binaries matching `artifacts/manifest.json` SHA-256 digests bit-for-bit.
- `npm test`: `30/30 verification suites PASSED.` (exit code `0`).
- `python3 reference/planaria_oracle.py`: `100% CROSS-LANGUAGE PARITY (768 cells, 4 species, 0 mismatches).`
- `npm run fuzz`: `2000/2000 cases PASSED (0 crashes, 0 hangs)`.
- `npm run mutate`: `MUTATION SCORE: 12/12 (100.0%) KILLED | 0 SURVIVED`.
- `npm run check:axioms` & `npm run check:blueprint`: `85/85` theorems matched 1:1 with `0` forbidden axioms.
- `npm run benchmark`: at 80% uniform cell erasure ($n = 40$ paired seeds), `Linear = 0.0%`, `RS(40,16) = 0.0%`, `RS(192,48)-Flat = 0.0%`, `PLANARIA >= 95%` with Holm–Bonferroni $p_{\text{Holm}} < 10^{-6}$.
- `lean/`: `85` audited `#print axioms` lines containing ONLY subsets of `[propext, Classical.choice, Quot.sound]`; zero `sorryAx` / `ofReduceBool` / `trustCompiler` / `_native`; exit code `0` across all 6 kernels (`leanchecker`, `leanchecker-paranoid`, `lean4lean`, `nanoda_bin`, `con-leche --verified`, `con-ron --verified`) and `lake comparator --paranoid`.

## 4. Replication Log

> **Honest Status:** Self-replications across local Windows and GitHub Actions multi-OS runners are recorded below. **Independent third-party external replication has not yet been submitted** — community replication reports are warmly welcomed via GitHub Issues (`question` or `falsification` template).

| Date | Replicator | Environment | Commit / Tag | Outcome | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 2026-11-25 | Alexander S. Donahue (author, self-replication) | Windows 11 x64, Node v25.8.2, Python 3.12, Lean 4.35.0, Tectonic | `v2.4.0` | PASS (30/30 suites, 12/12 mutants, 2,000/2,000 fuzz, 768/768 Python oracle cells, 85/85 Lean theorems) | Local `leanchecker` + `leanchecker-paranoid` passed; 6-kernel `bwrap` sandbox verified on Ubuntu CI. |
| 2026-11-25 | GitHub Actions CI (automated clean-clone) | `ubuntu-latest`, `macos-latest`, `windows-latest` (Node 22 + Python 3 + Lean 4.35.0 + `bwrap`) | `v2.4.0` | Automated CI verification on push | Verifies all 6 kernels + `lake comparator --paranoid` + negative tampering rejection + SLSA provenance. |
