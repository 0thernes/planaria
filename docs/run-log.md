# Chronological Audit & Verification Run Log (`B40`)

Append-only engineering trail documenting major verification cycles, formal proof milestones, and empirical runs for **PLANARIA** (`0thernes/planaria`).

---

> **Correction (2026-11-26):** entries below record what was claimed at the time. The kernel checks are six checks, not six independent kernels: Lean default and paranoid share the Lean C++ kernel. The axiom breakdown is 15 axiom-free, 12 `[propext]` only, 40 `[propext, Quot.sound]`, 18 `[propext, Classical.choice, Quot.sound]`. See [`CLAIMS.md`](../CLAIMS.md) C10 and [`ERRATA.md`](../ERRATA.md).

## 2026-11-26 — `v2.4.0` Exhaustive 3-Cycle Hardening, 85 Lean 4.35.0 Proofs, Python 3 Oracle, Proof Blueprint, Fuzzer & Playbook v1.3 Closure

### Cycle 1 — 4-Agent Full-Stack Adversarial Audit (128 Findings Resolved)
- **Core, Compiler, VM (`src/core/`, `src/compiler/`, `src/vm/`):** Hardened RS, Cauchy, Merkle, `hbin.js`, `Plang` compiler (`Map` symbol tables, duplicate bundle rejection, shift bounds, compound RHS), and `PVM-32` with a **pre-allocated zero-allocation LIFO undo journal** rolling back partial RAM and voice writes atomically on trapped `ORGAN_CALL`s (`28.04 MIPS` / `0.060 ms/frame` median, recovering cleanly from `12.17 MIPS` per-call array copies).
- **Quantum, Temporal, 3D WebGL2, Web Studio, Server & CLI:** Added inventory (`weapons`/`armors`) snapshot restoration on temporal rewind (locked by Mutant `M12`), refined Studio HUD typography (`CHRONO-FORK ECHO`, `Lv.0/5`, `STRATUM 3 · FULL 3D`), wired `/blueprint` & `/blueprint/` into `server.mjs`, and hardened all 10 automation scripts (incl. `Audit-Repo.ps1` non-CWD path resolution fix, `lint-check.mjs` Palomar line-1 `module` & cross-doc theorem linter, `check-citations.mjs --live` Crossref DOI/retraction verifier).

### Cycle 2 — 4 New Elite Verification Pillars + Pure Lean 4.35.0 Upgrade (70 → 85 Theorems)
- **Lean 4.35.0 (`lean/`):** Enabled `autoImplicit = false` & `relaxedAutoImplicit = false`, added line-1 `module` header to all 12 `.lean` files (incl. `VerifyAxioms.lean`), expanded from **70 to 85 theorems** across 7 modules (adding `AdversarialTests.lean` with 8 formal false-variant refutations, strengthened dual-path `merkle_path_collision_free_binding`, arbitrary-list `unpinned_quorum_honest_majority` & `unpinned_quorum_tie_fail_closed`, `xenograft_dead_host_refused`, and 10 non-vacuity witnesses). Verified cleanly across `lean4`, `leanchecker --fresh`, `leanchecker-paranoid --fresh`, `nanoda_bin` (15.24 MB export, 0 errors), `con-leche --verified` (`2,732` decls), and `con-ron --verified` (`2,732` decls) — `results/lean4-audit.txt` SHA-256 `13d723722ac5d5af...` (15 zero-axiom pure proofs, 0 forbidden axioms).
- **Interactive Proof Blueprint (`blueprint/`):** Generated & verified 85/85 theorems 1:1 with 18 intra-proof dependency edges (`npm run check:blueprint`).
- **Clean-Room Python 3 Differential Oracle (`reference/planaria_oracle.py`):** Verified 100% cross-language parity across all 768 RS+Merkle cells of all 4 species, 28 Cauchy bundles, unaligned `49,177 B` mitosis, Bell CHSH `2.828427`, and GHZ `|M_4| = 4.000000`.
- **Verification Expansion:** **30/30** verification suites (adding Suite 29 sandboxed `audio-worklet.js` DSP & Suite 30 Lean/CSP manifest parity), **12/12 (100.0%)** surgical mutants killed (`M01..M12`), and **2,000/2,000** deterministic adversarial fuzz cases (`scripts/fuzz.mjs`).
- **Academic Dossiers & Legal Hardening:** Authored `docs/MEGA_ATLAS_CROSSCHECK.md` (honest `0 / 1,900` verdict), `docs/LITERATURE_SEARCH.md`, `docs/SUBMISSION_READINESS.md` (Playbook v1.3 43-item scorecard + ACM/NeurIPS checklists), `results/bench-history.csv`, `results/citation-audit.json` (live Crossref DOI audit), Export-Control self-screen (`LEGAL.md`), and CC BY 4.0 carve-out (`LICENSE`).

### Cycle 3 — Frozen White Paper PDF, Negative Tamper CI, Live Browser Audit, Release `v2.4.0` & Archive Sync
- Upgraded `paper/main.tex` (fixed `forney1965` DOI -> `10.1109/TIT.1965.1053825`, cleaned `barker1953` OCLC, 1:1 `C01..C10` Claims Ledger, 85 Lean theorems, storage ratios, MDS rank disclosure), compiled zero-overfull PDF + standalone `dist/arxiv_submission.tar.gz`, added live negative `lake comparator --paranoid` tampering test in `.github/workflows/ci.yml`, verified live Studio `/` & Proof Blueprint `/blueprint/` in browser, published clean `v2.4.0` tag with 100% GREEN CI/Pages/Release, and synced `0thernes-research-archive` (`0TH-BUILD-002`).

---

## 2026-11-25 — `v2.3.0` Three-Cycle World-Class Hardening, Build Standard v1.2.0 & 6-Kernel Palomar Verification

### Unsolved Problems Mega-Atlas Audit
- Checked all `1,900` entries in `0thernes/unsolved-problems-mega-atlas` (`MegaAtlas_Unsolved_Problems_V2.json`).
- **Verdict:** **`0 / 1,900` open problems solved** (honestly recorded in `LIMITATIONS.md`, `docs/reviews/2026-11-25-10-pass-red-team-audit.md`, and `paper/main.tex`). Closest systems adjacencies: `SYS-045`, `CS-053`, `AI-005` (non-claim).

### Cycle 1 — Full-Stack 5-Layer Code, Security, Compiler, VM, Quantum, 3D & Accessibility Hardening
- **Layer 1 (`src/core/`, `src/vm/linear-twin.js`):** Fixed detached Node `Buffer` `.slice()`, `gfPow`/`gfPolyMulAsc` bounds, Cauchy `k <= 128`, 3-arg `injectOverlapEclipseTrojan`, iterative backward-flywheel recovery for sync-obliterated cell 0, O(1) `PLN\xB7` sync-flood bypass, strict dead-host xenograft refusal (`bundles[0].viable`), deterministic lexical donor tie-break, strict `pinnedRootHex` validation, and `LINBIN01` `ERR_SECTION_OUT_OF_BOUNDS` reachability.
- **Layer 2 (`src/compiler/`, `src/vm/pvm32.js`):** Added `MAX_PARSE_DEPTH = 128`, `Map`-based symbol tables (eliminating `Object.prototype` collisions), unsigned 32-bit decimal support (`2654435761`) with signed negated overflow rejection (`-4294967295`), scratch-register overflow guard (`rR > 17`, preventing silent `r18` local clobbering), deterministic `LI r1, 0` on bare `return;`, `MemCompoundAssign` rhs-before-LDW, and exact `BigInt` `ISQRT` + budget overdraft guards.
- **Layer 3 (`src/quantum/`, `src/world/`, `src/web/`):** Fixed Werner depolarizing visibility floor (`V -> 0`), Horodecki CHSH Bell `(0,1)` preparation in `entangleWeapons()`, full rewind rollback of `skills`/`_delayedEchoShots`/`scaleOrderOverride` (closing infinite SP exploit), non-finite `safeStageInt` guard, immediate dead-NPC reaping, `SPIN_FLIP` hostile reflection, temporal NPC affixes, WebGL2 outward CCW cylinder/torus winding, CPU `mat3NormalFromMat4`, float64 phase reduction, full WAI-ARIA tabs/meters/keyboard navigation, `prefers-reduced-motion` + live Motion toggle, and GitHub Pages subpath-safe relative URLs.
- **Layer 4 (`server.mjs`, `bin/planaria.mjs`, `scripts/`):** Added `/healthz`, TOCTOU-safe `openSync`/`fstatSync`, RFC 9110 absolute-form URL handling, empty `HEAD` error bodies, `realpathSync` entrypoint check, CLI `--allow-unpinned-xenograft`, exit code `3` on VM traps, and atomic temp+rename artifact builds.

### Cycle 1–2 — Pure Lean 4.35.0 `module` Upgrade & 6-Kernel Palomar Verification
- Upgraded all 6 Lean modules + `PlanariaProofs.lean` to Lean 4.35.0 `module` system (`public import`, `@[expose] public def`, `public theorem`), expanding from **62 to 70 audited theorems** (12 zero-axiom constructive proofs, 0 `sorryAx`, 0 `native_decide`, 0 custom axioms).
- Closed all 3 Statement-Fidelity Gaps (`viability_s3_without_b2_matches_hbin`, `electUnpinnedQuorum` with `unpinned_quorum_tie_fail_closed`, and `planaria_schedule_nodup_and_sorted_halves`) and added 5 explicit non-vacuity witness lemmas.
- Created standalone `lean/Challenge.lean`, `lean/Solution.lean`, `lean/comparator.json`, and root `formalization.yaml`.
- Local Windows verification (5/6 kernels + `con-ron` = 5 distinct independent checkers):
  - `lake build` & `lake build Challenge`: **PASS (exit 0)**
  - `leanchecker --fresh Solution`: **PASS (exit 0)**
  - `leanchecker-paranoid --fresh Solution`: **PASS (exit 0)**
  - `nanoda_bin` (Rust): **PASS — 2,970 declarations checked, 0 errors**
  - `con-leche --verified`: **PASS — 2,715 declarations accepted**
  - `con-ron --verified`: **PASS — 2,715 declarations accepted**
  - Full 6-kernel (`+ lean4lean`) + `bubblewrap` `lake check --paranoid` + `lake comparator --config comparator.json --paranoid` wired into Ubuntu Linux CI.

### Cycle 2 — Testing, Mutation Testing, Statistical Benchmarks & Build Standard v1.2.0
- Expanded `test/verify.mjs` from 24 to **28 suites** (property-based `prop_check`, Cycle 1 regressions, metamorphic invariants, runnable examples + Pages path checks): **28/28 PASS**.
- Built `scripts/mutation-test.mjs` with 10 surgical mutants across Layers 1–3. Initial run killed 9/10; root-caused M06 (`rR > 17` boundary reached at `tempBase = 17` via `(mem[0]+(mem[1]+(mem[2]+(mem[3]+(99999*88888))))) + mem[4]`), confirming a genuine silent `r18` clobber bug if the guard were absent -> **10/10 (100.0%) KILLED**.
- Upgraded `scripts/benchmark.mjs` to `PLANARIA-BENCHMARKS-1.2` adding Equal-Storage Flat `RS(192, 48)`, Wilson 95% CIs, exact paired two-sided McNemar p-values, Cohen's $h$, Holm–Bonferroni $p_{\text{Holm}}$, median/IQR/p95 latencies, and 5-chimera Xenograft matrix:
  - `@80% erasure`: `LINBIN01 = 0%`, `RS(40,16) = 0%`, `RS(192,48) = 0%`, **`PLANARIA = 95.0%`** (`95% CI [83.5%, 98.6%]`, $h = 2.691$, $p_{\text{Holm}} = 1.746 \times 10^{-10}$).
  - Median full decode: `5.994 ms` (`IQR 0.268 ms`), `PVM-32` frame median: `0.041 ms` (`42.85 MIPS`).
- Completed Build Standard for LLMs v1.2.0 (`repo.yaml`, `repo-standard.schema.json`, `AGENTS.md` + pointers, `llms.txt`, `llms-full.txt`, `CLAIMS.md`, `LIMITATIONS.md`, `REPLICATION.md`, `ROADMAP.md`, `SUPPORT.md`, `THIRD_PARTY_NOTICES.md`, `UPGRADING.md`, `ERRATA.md`, `DEVIATIONS.md`, `docs/*`, 4 ADRs, 16 finding-class labels, `MANIFEST.sha256`, `data/MANIFEST.sha256`, cross-platform CI/Release/Pages workflows).
- Resolved entity conflict (`0thernes LLC` -> `Alexander Stephen Donahue, Independent Researcher, 0thernes project, Spokane, WA, USA` across all active files; historical audit trail preserved only in `CHANGELOG.md`, `ERRATA.md`, `docs/run-log.md`, and the 10-pass review).

### Cycle 3 — White Paper PDF Upgrade, Live Studio Verification, Release & Archive Sync
- Upgraded `paper/main.tex` to `v2.3.0` with Claims Ledger, Statement-Fidelity Audit Table, 6-Kernel Palomar section, Equal-Storage `RS(192, 48)` plot curve, Statistical Inference Table, 5-Chimera measured matrix, Mega-Atlas honesty note, Threats to Validity, CRediT, COI, AI-Contribution & Accountability, and verified references.
- Compiled via Tectonic, verified standalone `dist/arxiv_submission.tar.gz`, visually inspected every PDF page, verified hardened Studio UI live in browser on `http://127.0.0.1:4174/`, verified `Audit-Repo.ps1` `100.0%`, pushed `v2.3.0` with all CI/Release/Pages workflows GREEN, and synced `0thernes-research-archive` (`0TH-BUILD-002`).

---

## 2026-11-21 — `v2.2.0` 5-Layer Adversarial Audit & 62 Lean 4 Proofs
- Hardened Layers 1–5, expanded tests 16 → 24 suites, expanded Lean 4 proofs 38 → 62 theorems, compiled frozen 8-page AMS-LaTeX PDF, and published `v2.2.0`.

## 2026-11-18 — `v1.0.0` & `v2.0.0` Initial Architecture Releases
- Initial `.hbin` codec, `Plang` compiler, `PVM-32`, 31 → 38 Lean 4 proofs, 4th species `QUANTUM_CHRONICLE.hbin`, WebGL2 3D engine, and 48 kHz PolyBLEP `AudioWorklet`.
