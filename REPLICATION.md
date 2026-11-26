# REPLICATION.md — Clean-Clone Reproduction & Independent Replication Protocol

This protocol lets any independent engineer or academic reviewer verify **every single claim, test, mutant, statistical benchmark, Lean 4.35.0 proof, and PDF paper** from a clean clone using only open-source toolchains.

## 1. Prerequisites

| Tool | Required Version | Purpose | Required For |
| :--- | :--- | :--- | :--- |
| **Node.js** | `>= 20.0.0` (verified on `v25.8.2` & CI `v22`) | Runtime, compiler, VM, 28 suites, mutation suite, benchmarks (zero npm deps!) | Core build, tests, Studio |
| **Lean 4 (`elan`)** | `leanprover/lean4:v4.35.0` (pinned in `lean/lean-toolchain`) | 70 formal proofs + 6-kernel verification + Palomar comparator | Formal verification |
| **bubblewrap (`bwrap`)** | Linux only (`sudo apt-get install -y bubblewrap`) | Sandboxed `lake check --paranoid` & `lake comparator --paranoid` | Linux 6-kernel sandbox |
| **Tectonic** | `>= 0.15` (optional) | Recompile `paper/main.tex` -> `dist/Donahue_2026_planaria.pdf` | White paper PDF build |

## 2. Exact Clean-Clone Reproduction Commands

```bash
git clone https://github.com/0thernes/planaria.git
cd planaria

# 1. Deterministic build of all 4 living .hbin organisms (98,304 B each)
npm run build

# 2. Full 28-suite verification, property-based, metamorphic & regression harness
npm test

# 3. Static analysis, security-sink, placeholder & citation checks
npm run lint
npm run check:citations

# 4. Surgical mutation testing (10 planted mutants -> expect 10/10 = 100.0% KILLED)
npm run mutate

# 5. Reproducible 4-architecture Monte Carlo + Wilson 95% CI + McNemar + Holm-Bonferroni benchmarks
npm run benchmark

# 6. Pure Lean 4.35.0 build & verbatim 70-theorem #print axioms audit
cd lean
lake clean && lake build
lake env lean PlanariaProofs.lean
lake env leanchecker --fresh Solution
lake env leanchecker-paranoid --fresh Solution

# 7. Full 6-kernel sandboxed verification & Palomar Challenge/Solution comparator (Linux with bwrap)
lake check --paranoid
lake comparator --config comparator.json --paranoid
cd ..

# 8. Optional: recompile AMS-LaTeX White Paper PDF
tectonic -X compile paper/main.tex --outdir dist

# 9. Launch live 3D WebGL2 Studio on http://127.0.0.1:4174/
npm start
```

Or run the full automated pipeline via `just reproduce` (or `./scripts/dev.sh reproduce`).

## 3. Expected Headline Outputs (Pass/Fail Acceptance Criteria)

- `npm run build`: writes 4 deterministic 98,304 B binaries matching `artifacts/manifest.json` SHA-256 digests bit-for-bit.
- `npm test`: `28/28 verification suites PASSED.` (exit code `0`).
- `npm run mutate`: `MUTATION SCORE: 10/10 (100.0%) KILLED | 0 SURVIVED` (exit code `0`).
- `npm run benchmark`: at 80% uniform cell erasure ($n = 40$ paired seeds), `Linear = 0.0%`, `RS(40,16) = 0.0%`, `RS(192,48)-Flat = 0.0%`, `PLANARIA >= 95%` with Holm–Bonferroni $p_{\text{Holm}} < 10^{-6}$.
- `lean/`: `70` audited `#print axioms` lines containing ONLY subsets of `[propext, Classical.choice, Quot.sound]`; zero `sorryAx` / `ofReduceBool` / `trustCompiler`; exit code `0` across all 6 kernels (`leanchecker`, `leanchecker-paranoid`, `lean4lean`, `nanoda_bin`, `con-leche --verified`, `con-ron --verified`) and `lake comparator --paranoid`.

## 4. Replication Log

> **Honest Status:** Self-replications across local Windows and GitHub Actions multi-OS runners are recorded below. **Independent third-party external replication has not yet been submitted** — community replication reports are warmly welcomed via GitHub Issues (`bug`/`issue` or `question` template).

| Date | Replicator | Environment | Commit / Tag | Outcome | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 2026-11-25 | Alexander S. Donahue (author, self-replication) | Windows 11 x64, Node v25.8.2, Lean 4.35.0, Tectonic | `v2.3.0` | PASS (28/28 suites, 10/10 mutants, 5/6 local kernels; 6/6 on Linux CI) | `lake comparator` bwrap sandbox verified on Ubuntu CI runner. |
| 2026-11-25 | GitHub Actions CI (automated clean-clone) | `ubuntu-latest`, `macos-latest`, `windows-latest` (Node 22 + Lean 4.35.0 + `bwrap`) | `v2.3.0` | Automated CI verification on push | Verifies all 6 kernels + `lake comparator --paranoid` inside `bwrap` sandbox. |
