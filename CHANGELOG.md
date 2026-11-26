# Changelog

All notable changes to **PLANARIA** are documented in this file.

## [Unreleased] - 2026-11-26

### Claim corrections from the 2026-11-26 statement audit (documentation only)
- `CLAIMS.md`: split C02 and C03 into the Lean part (placement counts; burst-to-lane counting and Singleton arithmetic) and the tested part (both-halves regeneration; RS repair of 8 errors per lane). Marked the C06 quarantine theorem as conditional on `HashBinding`, C09 as an arithmetic check, C04 as a definitional illustration, and the C05 JS correspondence as inspection plus tests. C08 now says the scaled Hadamard doubles the integer norm. C10 states the four-way axiom breakdown and "six kernel checks".
- `README.md`: corrected the axiom breakdown (15 axiom-free, 12 `propext`, 40 `propext` + `Quot.sound`, 18 with all three), described the kernel checks without claiming six independent kernels, added a short "What Lean covers" paragraph, and renamed "The Five Unnatural Phenomena" to "Five Engineering Properties".
- `LIMITATIONS.md` §2.7, `formalization.yaml` module scopes, `CITATION.cff` abstract and `docs/` (ADR-0001, ADR-0003, `faq.md`, `glossary.md`, `MASTER_REPORT.md`) aligned with the audit.
- `ERRATA.md`: recorded the paper, transcript and Lean statement issues that are not fixed in place. Audit log: <https://github.com/0thernes/0thernes-research-archive/blob/main/docs/reviews/2026-11-26-statement-audit.md>.
- No Lean, source, data or paper files changed; `MANIFEST.sha256` lines for the edited files were updated.

## [2.4.0] - 2026-11-25

### Second Full 3-Cycle Deep-Dive Hardening, Clean-Room Python Oracle, Interactive Blueprint & 85 Pure Lean 4.35.0 Proofs
- **Unsolved Problems Mega-Atlas Verification Dossier (`docs/MEGA_ATLAS_CROSSCHECK.md`):** Programmatically scanned all `1,900` entries of `MegaAtlas_Unsolved_Problems_V2.json.gz`, archiving the verbatim top 19 nearest neighbors and honest **`0 / 1,900`** verdict.
- **Layer 1 — Cellular Harvester, Flood Defense & Xenograft Fidelity (`src/core/`, `src/vm/linear-twin.js`):**
  - Replaced exact-only sync-flood guard with sliding-window fuzzy dense-flood bypass (`>= 2` fuzzy hits within `[offset+1..offset+16]`), defeating 1-bit-flipped and stride-5 sync-flood DoS attacks.
  - Enforced unconditional `bestUnique < 2` unpinned fail-closed quorum (exact Lean `electUnpinnedQuorum` parity), required `origLen >= 4 && origLen % 4 === 0` for executable bundles `B0..B5` (`origLen > 0` for `B6`), preserved surviving host sub-threshold `abiSig` for strict donor ABI matching, switched donor tie-break to deterministic code-point comparison, routed ONLY actually-grafted donor cells to `slotMap: 'XENOGRAFT'`, added ±512 B flywheel to `amputateBundles()`, preserved remainder bytes in `shiftAndShuffle()`, and added safe `toBytes` & bounds guards across `rs.js`, `cauchy.js`, `gf256.js`, `sha256.js`.
- **Layer 2 — Plang Compiler, `PVM-32` & Living Species (`src/compiler/`, `src/vm/pvm32.js`, `programs/`):**
  - Wrapped `else if` and ternary `?:` in `withDepth(...)` (`parser.js`) and replaced recursive `containsCall` with iterative traversal + `MAX_AST_DEPTH = 256` (`codegen.js`), closing all uncaught call-stack overflow DoS vectors.
  - Fixed flat-binary scratch-register reuse while preserving the strict `rR > 17` overflow guard; rejected decimal literals `> 2147483647` unless hex (`0x9e3779b1` in `cipher_vault.plang`); forbade built-in constant shadowing & compile-time `organ_call(KERNEL/GENOME)`; masked frame counters in `aegis_drift.plang` against int32 wraparound.
  - Added proportional blitter fuel costs (`GLOW` 128, `CLEAR` 64, `TRI` 4, `LINE` 2, filled `RECT`/`CIRCLE` `ceil(pixels/256)`), transactional RAM & `voiceTouched` rollback on trapped organ fallback, endian-safe `PALETTE_RGBA`, printable ASCII `& 0xff` sanitization in `SYSCALL.LABEL`, and nested `ORGAN_CALL` self-accounting.
- **Layer 3 — Deterministic 3D Engine, Audio Recovery & WCAG 2.2 AA Studio (`src/quantum/`, `src/world/`, `src/web/`, `server.mjs`):**
  - Replaced all 7 unseeded `Math.random()` calls in `ChronoQuantumWorld` with a snapshotted Mulberry32 PRNG; deep-cloned & restored `weapons`, `armors`, indices, `recentLoot`, `playerProfile`, `rngState`, `qGateCounter`, and `delayedEchoShots.origin` on rewind (kills new Mutant `M12`!).
  - Fixed Werner readout visibility in `measureQubit()`, overflow-safe `Math.hypot` + `2π` phase reduction in `evalWaveInterference()`, bounded single `DILATED_AURA` slowdown (capped at 65%), lethal-only `TIME_UNDO`, balanced `_ghzMode` phase evolution (`|M_4| = 4.0`), `AudioWorklet` `onprocessorerror` recovery + `dispose()`, WebGL2 context-restore leak guards + S0/S2 organ-amputation visual degradation, meta CSP, skip-to-main link, keyboard tissue inspector & 3D orbit controls, `aria-valuetext`, 7.7:1 contrast, `/blueprint/` server route & `/src/web/index.html -> /` redirect.
- **Layer 4 — New Elite Verification Pillars (`reference/`, `blueprint/`, `scripts/`, `test/`):**
  - **Clean-Room Python 3 Differential Oracle (`reference/planaria_oracle.py`):** Zero-dependency Python 3 stdlib verification achieving 100% cross-language parity across all 4 compiled `.hbin` binaries (768 cells, 28 Cauchy bundles, unaligned `49,177 B` mitosis, Bell CHSH `2.828427`, GHZ `|M_4| = 4.0`).
  - **Deterministic 2,000-Case Fuzzer (`scripts/fuzz.mjs`):** 500 cases each across `decodeHbin`, `compilePlangToHbin`, `RS(254,238)`, and `PVM32` (0 crashes/hangs).
  - **Interactive Lean 4.35.0 Proof Blueprint (`blueprint/index.html` + `blueprint.json`):** Zero-CDN SVG dependency DAG + searchable 85-theorem table verified 1:1 via `npm run check:blueprint`.
  - **Expanded Testing & Scripts:** 30/30 test suites (incl. Suite 29 `audio-worklet.js` DSP harness & Suite 30 manifest/CSP invariants), **12/12 (100.0%)** surgical mutants killed (`M11` server traversal, `M12` temporal inventory rewind), live Crossref DOI + retraction checker (`npm run check:citations -- --live` -> `results/citation-audit.json`), verbatim README axiom checker (`npm run check:axioms`), cross-doc Lean theorem-name linter (`scripts/lint-check.mjs`), and `Audit-Repo.ps1` non-CWD path fix.
- **Layer 5 — Pure Lean 4.35.0 Proofs (70 → 85 Theorems) & Academic Governance (`lean/`, `paper/`, `docs/`):**
  - Enabled `autoImplicit = false` & `relaxedAutoImplicit = false` in `lean/lakefile.toml`; added line-1 `module` to `VerifyAxioms.lean` (12/12 `.lean` files now Palomar-clean); removed duplicate `#print axioms` from `PlanariaProofs.lean`.
  - Strengthened `merkle_path_collision_free_binding` (full dual-path commitment), `unpinned_quorum_honest_majority` (arbitrary list index), `unpinned_quorum_tie_fail_closed` (arbitrary list), added `applyXenograftWithStem` + `xenograft_dead_host_refused`, added 5 new non-vacuity witnesses (10 total), and added `lean/PlanariaProofs/AdversarialTests.lean` (8 formal false-variant refutations) + live CI negative `lake comparator --paranoid` tamper rejection.
  - Corrected Crossref-caught `forney1965` DOI (`10.1109/TIT.1965.1053833` -> `10.1109/TIT.1965.1053825`), fixed `LICENSE` patent wording + Section 6 CC BY 4.0 carve-out, removed invalid `NOASSERTION` in `CITATION.cff`, reconciled `docs/architecture.md`, `docs/glossary.md`, and `docs/threat-model.md`, and added `docs/MEGA_ATLAS_CROSSCHECK.md`, `docs/LITERATURE_SEARCH.md`, and `docs/SUBMISSION_READINESS.md`.

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
