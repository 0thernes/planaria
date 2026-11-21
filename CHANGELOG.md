# Changelog

All notable changes to **PLANARIA** are documented in this file.

## [2.2.0] — 2026-11-21

### Full-Stack 5-Layer Adversarial Audit, Formal Proof Expansion & Hardening
- **Layer 1 — Coding, Crypto & `.hbin` Hardening (`src/core/`, `src/vm/linear-twin.js`)**:
  - Precomputed 256×256 `GF_MUL_TABLE` + strict `gfPow` validation (`0^negative` throws `RangeError`); streaming block-wise SHA-256 eliminating 32-bit `paddedLen` overflow and 2× RAM duplication; distinct `0x02` domain prefix on `EMPTY_LEAF_HASH`; detached return slices and nonzero-`byteOffset` `toBytes()` coercion across all codecs.
  - Replaced floating-point cell schedule with exact integer `posNum(b, i) = (14*i + 2*b + 1)*(480/n_b)` (zero IEEE-754 ULP drift, matching Lean 4 bit-for-bit).
  - Byte-granular sliding-window sync scan defeating Overlap-Eclipse attacks + ±512B cadence flywheel + explicit DoS scan budgets (`maxInputBytes`, `maxSyncCandidates`, `maxRsFailures`).
  - Strict `BUNDLE_SPECS` + `PLACEMENT_SCHEDULE` header checks blocking 256-cell Sybil forgery; enforced `>= 2` quorum & fail-closed ties (`quorumAmbiguous`); unpinned Xenograft sovereignty guard (`xenograftBlockedUnpinned`); `regenerateHbin` blocks `immuneSystemEnabled === false` and preserves `speciesTag` for bit-exact determinism.
  - Fixed `irradiateCells` `> 508` infinite loop & burst off-by-one; added `injectOverlapEclipseTrojan`; hardened `decodeLinearBinary` against overlapping/header-overlapping section tables.
- **Layer 2 — Plang Compiler, `PVM-32` & Living Species (`src/compiler/`, `src/vm/`, `programs/`)**:
  - Hardened lexer/parser diagnostics (unterminated `/*`, empty `0x`, trailing ident `123abc`, >32-bit overflow, div-by-0 const fold, duplicate `fn`/syscall collisions, strict call arity, forbidden `bundle S3_GENOME_LEDGER`, unary `~`, single-eval `MemCompoundAssign`).
  - Fixed block shadowing & self-referential `let x = x + 1` with zero-move initialization; implemented caller-windowed register save/restore across `OP.CALL`/`OP.RET` preserving locals across nested/recursive calls.
  - Hardened `PVM-32`: descending-stratum `ORGAN_CALL` fallback on trapping S2 bundles, Bundle 6 (`GENOME`) excluded from executable dispatch, clamped `VOICE.detune` (`[-2400, 2400]`), Liang-Barsky clipped `_line`, preserved `initialSeed`, and per-species `SPECIES_MAGIC` sentinels in `mem[15]` enabling trap-free cross-species `S1_CORE_LOGIC` Xenografts.
- **Layer 3 — Quantum, Temporal, 3D WebGL2 & 48 kHz Audio (`src/quantum/`, `src/world/`, `src/web/`)**:
  - Upgraded `QuantumRegister` with `Y`/`SWAP` gates, rotation-invariant Horodecki 3×3 correlation tensor CHSH, exact 4-qubit Mermin GHZ correlator (`|M_4| = 4.0`), `renormalize()`, and `purity()`.
  - Replaced `Array.shift()` with O(1) circular `RingBuffer` in `TemporalEngine`; fixed post-rewind NPC `speed = undefined` NaN softlock, echo-splice double-hit, solo-boss self-entanglement, duplicate WKB pillar rolls, projectile overflow, and `buildStageSpec(0)`.
  - Upgraded procedural PRNG to 128-bit SHA-256 `sfc32` with full 64-bit formatted lineage IDs and exact reachable combinatorial count (`6,421,059,993,600 > 6.42 × 10^{12}`).
  - Fixed `makePyramid()` inside-out winding, `MESH_VS` inverse-transpose normals, GLSL `pow(0)` guards, real `uWavePhase[5]`, clean deduplicated wireframe EBOs, opaque/translucent depth-mask separation, `webglcontextlost`/`restored` recovery, Bundle 3 (`hasCortexRender`) & Bundle 4 (`pvmVoices`) live coupling, and PolyBLEP + DC-blocking highpass AudioWorklet.
- **Layer 4 — Hardened HTTP Server, CLI, Studio UI & Build/Benchmark Pipeline (`server.mjs`, `bin/planaria.mjs`, `src/web/`, `scripts/`)**:
  - Hardened `server.mjs` with `fs.realpathSync` containment, public-root allowlisting, dotfile/traversal rejection, `GET`/`HEAD` only (`405`), static `text/plain` `404` (eliminating reflected XSS), and full CSP/`nosniff`/`DENY`/`COOP`/`CORP` headers.
  - Upgraded `bin/planaria.mjs` with schema-driven strict option parsing, numeric range validation (`--bitrot 0..508`), `--version`, `fuse` subcommand, `--pinned` support on `run`/`heal`/`disasm`, JSON output for `disasm --bundle 6`, and sovereign `xenograft` checks.
  - Eliminated all 7 unescaped `innerHTML` sinks in `src/web/app.js`, fixed post-Chimera `pinnedRootHex` mismatch, added graceful non-WebGL2 fallback, ARIA attributes, `:focus-visible`, `prefers-reduced-motion`, and data-URI favicon.
  - Expanded `test/verify.mjs` from 16 to **24 suites** and attested **44 files** in `results/attestation.json` with explicit ephemeral-seal trust-boundary disclosure.
- **Layer 5 — Pure Lean 4 Formal Proof Expansion (38 → 62 Audited Theorems) & Strict CI Allowlist**:
  - Expanded `lean/PlanariaProofs/` from 38 to **62 pure Lean 4 (`v4.35.0`) machine-checked theorems** (zero Mathlib, zero errors/warnings, zero `sorryAx`, zero `native_decide`), adding full 65,536-pair `gfMul_comm`, full 16,777,216-triple `gfMul_assoc`, concrete `gf256Field : Char2Field (Fin 256)`, universal `cauchy2_exact_decode`, exact integer `PLACEMENT_SCHEDULE` zero-tie balanced halves, general 6-organ `resolveOrgan`, equal-storage flat `RS(192,48)` separation, real byte-list `hammingDist_triangle`, tight 17/18-byte negative burst lower bounds, 8-level Merkle path binding, unpinned Sybil quorum counterexample, signed `BitVec 32` RAM sandboxing, non-vacuous B0/B6 sovereignty, full 4-qubit 16-amplitude complex unitarity across `X/Y/Z/H/CNOT/CZ/SWAP`, 360-frame snapshot rewind exactness, and exact reachable `6,421,059,993,600` cardinality.
  - Upgraded `.github/workflows/ci.yml` to enforce a strict Python axiom allowlist parser over all 62 theorems and recompiled the frozen 8-page AMS-LaTeX PDF (`dist/Donahue_2026_planaria.pdf`).

## [2.1.0] — 2026-11-21

### Added & Polished
- **Publication-Grade AMS-LaTeX White Paper & Release Bundle**: Added [`paper/main.tex`](paper/main.tex) with native TikZ/PGFPlots vector figures (512-byte Holographic Cell schematic & empirical Monte Carlo Survival Phase-Transition Curve), compiled via Tectonic `0.17.0` into frozen [`dist/Donahue_2026_planaria.pdf`](dist/Donahue_2026_planaria.pdf) and standalone [`dist/arxiv_submission.tar.gz`](dist/arxiv_submission.tar.gz).
- **CI & Governance Hardening**: Upgraded `.github/workflows/ci.yml` to `actions/checkout@v7` and `actions/setup-node@v7`, updated audit counts to `4 .hbin artifacts`, `16-suite falsification`, and `38 Lean 4 theorems`.
- **Documentation Parity & Master Archive Registration**: Synchronized docs and registered `0TH-BUILD-002_planaria` in `0thernes-research-archive` with Software Heritage snapshot `swh:1:snp:857e93d1418813cb4f3196428083c436c3b1a040`.

## [2.0.0] — 2026-11-18

### Added
- **Custom Zero-Dependency WebGL2 (`GLSL 300 es`) 3D Temporal-Quantum Renderer (`src/web/renderer3d.js`)**, **4-Qubit Quantum Mechanics Engine (`src/quantum/qengine.js`)**, **Temporal Causality Engine (`src/quantum/temporal.js`)**, **Endless 1/1 Procedural Combinatorial Universe Forge (`src/world/generator.js`, `src/world/game3d.js`)**, **4th Living Compiled `.hbin` Species (`QUANTUM_CHRONICLE.hbin`)**, and **Lean 4 Module #6 (`QuantumTemporal.lean`, 38 total theorems)**.

## [1.0.0] — 2026-11-18

### Added
- Initial release of `.hbin` v1.0, `GF(2^8)` + `RS(254, 238)` + Cauchy MDS + Depth-8 SHA-256 Merkle codec, `Plang` compiler, `PVM-32` VM, 3 living species (`AEGIS_DRIFT`, `SYNTH_REACTOR`, `CIPHER_VAULT`), standalone CLI, Surgical Vivisection Studio, 31 pure Lean 4 proofs, and 12-suite falsification harness.
