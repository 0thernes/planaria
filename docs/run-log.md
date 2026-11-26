# Chronological Audit & Verification Run Log (`B40`)

Append-only engineering trail documenting major verification cycles, formal proof milestones, and empirical runs for **PLANARIA** (`0thernes/planaria`).

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
