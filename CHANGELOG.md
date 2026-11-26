# Changelog

All notable changes to **PLANARIA** are documented in this file.

## [2.3.0] - 2026-11-25

### Three-Cycle World-Class Hardening, 6-Kernel Palomar Proofs, Statistical Inference & Build Standard v1.2.0
- **Unsolved Problems Mega-Atlas Audit:** Audited all `1,900` entries in `0thernes/unsolved-problems-mega-atlas`; honestly confirmed `0 / 1,900` open problems solved and explicitly separated engineering systems instantiations from biological/physical metaphors (`LIMITATIONS.md`, `docs/reviews/2026-11-25-10-pass-red-team-audit.md`).
- **Layer 1 — Coding, Crypto & `.hbin` Hardening (`src/core/`, `src/vm/linear-twin.js`):**
  - Detached Node `Buffer` `.slice()` copies in `toBytes()`, hardened `gfPow`/`gfPolyMulAsc` bounds and Cauchy `k <= 128` cap, fixed 3-arg `injectOverlapEclipseTrojan`.
  - Upgraded backward flywheel to iterative recovery (recovers sync-obliterated cell `0`), added O(1) `PLN\xB7` sync-flood DoS bypass, enforced strict live-host gate (`bundles[0].viable`) before xenografting, deterministic lexical donor tie-break, strict `pinnedRootHex` validation, and made `LINBIN01` `ERR_SECTION_OUT_OF_BOUNDS` reachable even with valid SHA-256 footers.
- **Layer 2 — Plang Compiler & `PVM-32` Hardening (`src/compiler/`, `src/vm/pvm32.js`):**
  - Added `MAX_PARSE_DEPTH = 128`, migrated symbol tables to `Map` (eliminating 6 `Object.prototype` identifier collisions), allowed unsigned 32-bit decimal literals (`2654435761`) while rejecting negated signed overflow (`-4294967295`), added scratch-register overflow guard (`rR > 17`, eliminating a real silent `r18` local-register clobbering bug), emitted deterministic `LI r1, 0` on bare `return;`, fixed `MemCompoundAssign` rhs-before-LDW order, and added exact `BigInt` `ISQRT` + budget overdraft guards.
- **Layer 3 — Quantum, Temporal, 3D WebGL2 & Studio Accessibility (`src/quantum/`, `src/world/`, `src/web/`):**
  - Fixed Werner depolarizing visibility floor (`V -> 0` instead of `1/16`), Bell `(0,1)` preparation in `entangleWeapons()` so CHSH reaches $2\sqrt{2}$, full rewind restoration of `skills`/`_delayedEchoShots`/`scaleOrderOverride` (closing infinite skill-point exploit), `safeStageInt(Infinity/NaN)`, immediate dead-NPC reaping, `SPIN_FLIP` hostile reflection, temporal NPC affixes, and `hol_mitosis` heal pulse.
  - Fixed `makeCylinder`/`makeTorus` outward CCW winding, replaced GPU `inverse()` with CPU `mat3NormalFromMat4`, added float64 CPU phase reduction modulo $2\pi$ + wrapped `skyTime`, zero-alloc trail rendering, `forEachTrailSegment()`, and Equal-Storage `RS(192,48)` curve plotting in `visuals.js`.
  - Made Studio assets 100% subpath-safe for GitHub Pages (`./src/web/...` & `new URL('../../...', import.meta.url)`), added Mermin $|M_4|$ HUD, split `gearSig`/`npcSig` to preserve focus, full WAI-ARIA tabs/meters/keyboard navigation, `prefers-reduced-motion` + live Motion toggle, Pointer Events, and `#webglFallback` banner.
- **Layer 4 — Server, CLI & Artifact Pipeline (`server.mjs`, `bin/planaria.mjs`, `scripts/`):**
  - Added `/healthz` liveness endpoint, TOCTOU-safe `openSync`/`fstatSync`, RFC 9110 absolute-form URL parsing, empty `HEAD` error bodies, `realpathSync` entrypoint check, CLI `--allow-unpinned-xenograft` explicit opt-in & exit code `3` on traps, and atomic temp+rename artifact builds.
- **Layer 5 — Pure Lean 4.35.0 `module` Proofs (62 → 70 Theorems) & 6-Kernel Palomar Verification (`lean/`, `formalization.yaml`):**
  - Migrated all 6 modules + `PlanariaProofs.lean` to Lean 4.35.0 `module` system (`0 sorryAx`, `0 native_decide`, `0 custom axioms`, 12 purely constructive zero-axiom proofs).
  - Closed all 3 Statement-Fidelity Gaps (`viability_s3_without_b2_matches_hbin`, `electUnpinnedQuorum` with `unpinned_quorum_tie_fail_closed`, `planaria_schedule_nodup_and_sorted_halves`) and added 5 non-vacuity witness lemmas.
  - Added standalone zero-import `lean/Challenge.lean`, `lean/Solution.lean`, `lean/comparator.json`, and `formalization.yaml`; independently verified across `lean4`, `leanchecker`, `leanchecker-paranoid`, `nanoda_bin`, `con-leche`, `con-ron` locally and full 6-kernel (`+ lean4lean`) `bubblewrap` `lake check --paranoid` + `lake comparator --paranoid` in Ubuntu Linux CI.
- **Statistical Benchmarks (`PLANARIA-BENCHMARKS-1.2`), Testing & Mutation Harness:**
  - Expanded `test/verify.mjs` from 24 → **28 suites** (property-based `prop_check`, Cycle 1 regressions, metamorphic invariants, runnable `examples/01..03`).
  - Added `scripts/mutation-test.mjs` (**10/10 = 100.0% mutants killed**), `scripts/lint-check.mjs`, `scripts/check-citations.mjs`, `scripts/build-pages.mjs`, `scripts/gen-manifest.mjs`, and `scripts/build-llms-full.mjs`.
  - Added Equal-Storage Flat `RS(192,48)` baseline, Wilson 95% CIs, exact paired McNemar binomial tests, Cohen's $h$, Holm–Bonferroni $p_{\text{Holm}}$, median/IQR/p95 latency profiles (`5.994 ms` decode median, `42.85 MIPS`), and full 5-chimera Xenograft matrix (`results/benchmarks.json`, 61 attested files).
- **Build Standard for LLMs v1.2.0 & Publication-Grade White Paper:**
  - Achieved **100.0%** compliance across all applicable Build Standard v1.2.0 items (`repo.yaml`, `AGENTS.md` + pointers, `llms.txt`/`llms-full.txt`, `CLAIMS.md`, `LIMITATIONS.md`, `REPLICATION.md`, `ROADMAP.md`, `SUPPORT.md`, `THIRD_PARTY_NOTICES.md`, `UPGRADING.md`, `ERRATA.md`, `DEVIATIONS.md`, `package-lock.json`, `MANIFEST.sha256`, `data/MANIFEST.sha256`, 4 ADRs, `docs/threat-model.md`, `docs/preregistration.md`, `docs/benchmarks.md`, `docs/operations.md`, `docs/configuration.md`, `docs/run-log.md`, `docs/reviews/2026-11-25-10-pass-red-team-audit.md`, cross-platform CI + Release `SHA256SUMS`/SLSA + GitHub Pages workflows).
  - Corrected prior corporate affiliation drift (`0thernes LLC` -> `Alexander Stephen Donahue, Independent Researcher, 0thernes project, Spokane, WA, USA` across all active files; logged in `ERRATA.md`).
  - Upgraded `paper/main.tex` to `v2.3.0` with Claims Ledger, Statement-Fidelity Audit Table, 6-Kernel Palomar section, Equal-Storage `RS(192,48)` PGFPlots curve, Statistical Inference Table, Threats to Validity, CRediT, COI, AI-Contribution Statement, and 21 verified citations with DOIs/standard IDs.

## [2.2.0] — 2026-11-21

### Full-Stack 5-Layer Adversarial Audit, Formal Proof Expansion & Hardening
- **Layer 1 — Coding, Crypto & `.hbin` Hardening (`src/core/`, `src/vm/linear-twin.js`)**:
  - Precomputed 256×256 `GF_MUL_TABLE` + strict `gfPow` validation (`0^negative` throws `RangeError`); streaming block-wise SHA-256 eliminating 32-bit `paddedLen` overflow and 2× RAM duplication; distinct `0x02` domain prefix on `EMPTY_LEAF_HASH`; detached return slices and nonzero-`byteOffset` `toBytes()` coercion across all codecs.
  - Replaced floating-point cell schedule with exact integer `posNum(b, i) = (14*i + 2*b + 1)*(480/n_b)` (zero IEEE-754 ULP drift, matching Lean 4 bit-for-bit).
  - Byte-granular sliding-window sync scan defeating Overlap-Eclipse attacks + ±512B cadence flywheel + explicit DoS scan budgets (`maxInputBytes`, `maxSyncCandidates`, `maxRsFailures`).
  - Strict `BUNDLE_SPECS` + `PLACEMENT_SCHEDULE` header checks blocking 256-cell Sybil forgery; enforced `>= 2` quorum & fail-closed ties (`quorumAmbiguous`); unpinned Xenograft sovereignty guard (`xenograftBlockedUnpinned`); `regenerateHbin` blocks `immuneSystemEnabled === false` and preserves `speciesTag` for bit-exact determinism.
  - Fixed `irradiateCells` `> 508` infinite loop & burst off-by-one; added `injectOverlapEclipseTrojan`; hardened `decodeLinearBinary` against overlapping/header-overlapping section tables.
- **Layer 2 — Plang Compiler, `PVM-32` & Living Species (`src/compiler/`, `src/vm/`, `programs/`)**:
  - Hardened lexer/parser diagnostics, fixed block shadowing & self-referential `let x = x + 1`, implemented caller-windowed register save/restore across `OP.CALL`/`OP.RET`, descending-stratum `ORGAN_CALL`, Bundle 6 exclusion, Liang–Barsky clipped `_line`, and per-species `SPECIES_MAGIC` sentinels.
- **Layer 3 — Quantum, Temporal, 3D WebGL2 & 48 kHz Audio (`src/quantum/`, `src/world/`, `src/web/`)**:
  - Upgraded `QuantumRegister` with `Y`/`SWAP`, Horodecki 3×3 CHSH, 4-qubit Mermin GHZ; O(1) circular `RingBuffer`; 128-bit SHA-256 `sfc32` & 64-bit lineage IDs (`6,421,059,993,600` reachable space); PolyBLEP + DC-blocking AudioWorklet.
- **Layer 4 & 5 — Server, CLI, Studio UI & 62 Pure Lean 4 Proofs**:
  - Hardened `server.mjs`, CLI `bin/planaria.mjs`, eliminated `innerHTML` sinks in `app.js`, expanded tests 16 → 24 suites, expanded Lean 4 proofs 38 → 62 theorems, and compiled the 8-page AMS-LaTeX PDF.

## [2.1.0] — 2026-11-21
- Added AMS-LaTeX white paper (`paper/main.tex`) with native TikZ/PGFPlots vector figures compiled via Tectonic into `dist/Donahue_2026_planaria.pdf` and `dist/arxiv_submission.tar.gz`, and registered `0TH-BUILD-002_planaria` in `0thernes-research-archive`.

## [2.0.0] — 2026-11-18
- Added zero-dependency WebGL2 (`GLSL 300 es`) 3D Temporal-Quantum Renderer, 4-Qubit Quantum Engine, Temporal Causality Engine, 1/1 Procedural Combinatorial Forge, 4th Living Species (`QUANTUM_CHRONICLE.hbin`), and Lean 4 Module #6 (`QuantumTemporal.lean`, 38 total theorems).

## [1.0.0] — 2026-11-18
- Initial release of `.hbin` v1.0, `GF(2^8)` + `RS(254, 238)` + Cauchy MDS + Depth-8 SHA-256 Merkle codec, `Plang` compiler, `PVM-32` VM, 3 living species (`AEGIS_DRIFT`, `SYNTH_REACTOR`, `CIPHER_VAULT`), CLI, Studio, 31 pure Lean 4 proofs, and 12-suite falsification harness.
