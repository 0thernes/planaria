# PLANARIA — Master Index & Complete Table of Contents

Cross-referenced directory of every research document, source module, compiled `.hbin` organism, formal Lean 4 theorem, verification suite, and empirical benchmark artifact in **PLANARIA v2.2.0**.

---

## 1. Research Manuscripts & Governance Documents

| File | Role | Key Contents |
|---|---|---|
| [`README.md`](README.md) | Flagship Overview | Architecture diagram, 5 phenomena, 62 Lean 4 theorems, quickstart, CLI & Studio guide |
| [`SUMMARY.md`](SUMMARY.md) | Executive Summary Paper | Standalone technical overview, headline comparison table & novelty verdict |
| [`paper/WHITE_PAPER.md`](paper/WHITE_PAPER.md) | Publication-Grade White Paper | 12-section formal systems paper, byte-exact `.hbin` spec, benchmarks & 16 primary citations |
| [`paper/main.tex`](paper/main.tex) | AMS-LaTeX Source Manuscript | Standalone Tectonic 0.17.0 LaTeX source with native TikZ/PGFPlots vector figures |
| [`dist/Donahue_2026_planaria.pdf`](dist/Donahue_2026_planaria.pdf) | Frozen Release PDF | Compiled publication-grade white paper PDF archived in `0thernes-research-archive` |
| [`dist/arxiv_submission.tar.gz`](dist/arxiv_submission.tar.gz) | Standalone LaTeX Bundle | Verified self-contained compilation bundle (`main.tex`) |
| [`docs/MASTER_REPORT.md`](docs/MASTER_REPORT.md) | Comprehensive Master Report | Byte-level engineering audit, compiler/VM deep dive, failure modes, operations manual |
| [`VERIFICATION.md`](VERIFICATION.md) | Verification & Authentication Protocol | Provable / Falsifiable / Verifiable / Authenticated checklist, exact SHA-256 & Ed25519 checks |
| [`GLOSSARY.md`](GLOSSARY.md) | A–Z Technical Glossary | Comprehensive definitions across binary formats, coding theory, crypto, VM, 3D quantum-temporal & Lean 4 |
| [`lean/README.md`](lean/README.md) | Lean 4 Proof Library Guide | Complete 62-theorem catalog, axiom audit summary & scope boundaries |
| [`LICENSE`](LICENSE) | Legal License | Cosmogonic License — Non-Commercial Research & Play (0thernes LLC) |
| [`LEGAL.md`](LEGAL.md) | Legal & Authorship Notice | Ownership, Alexander S. Donahue ORCID, AI disclosure, patent/trademark & proof boundaries |
| [`NOTICE`](NOTICE) | Dependency Disclosure | Zero runtime dependencies & external toolchain inventory |
| [`CITATION.cff`](CITATION.cff) | Machine-Readable Citation | CFF v1.2.0 metadata for academic & independent citation |
| [`CHANGELOG.md`](CHANGELOG.md) | Release History | Full v1.0.0 → v2.2.0 feature, audit & verification history |
| [`VERSION`](VERSION) | Release Tag | `2.2.0` |

---

## 2. Source Code Architecture (`src/`, `bin/`, `scripts/`, `test/`)

### 2.1 Core Coding, Cryptography & `.hbin` Cellular Engine (`src/core/`)
- [`src/core/gf256.js`](src/core/gf256.js) — Exact $\text{GF}(2^8)$ finite-field arithmetic (`0x11D`), precomputed 256×256 `GF_MUL_TABLE`, strict `gfPow`, polynomial algebra.
- [`src/core/rs.js`](src/core/rs.js) — Exact inner `RS(254, 238)` encoder, Berlekamp-Massey + Chien + Forney decoder + zero-magnitude & syndrome recheck, and 2-way interleaved 508B cell armor (16B contiguous burst tolerance).
- [`src/core/cauchy.js`](src/core/cauchy.js) — Pure Cauchy-matrix MDS erasure encoder $C_{i,j} = (x_i \oplus y_j)^{-1}$ & exact $\text{GF}(2^8)$ Gauss-Jordan matrix inverter with strict parameter validation.
- [`src/core/sha256.js`](src/core/sha256.js) — Zero-dep streaming FIPS 180-4 SHA-256, `toBytes()` coercion, and domain-separated (`0x00`/`0x01`/`0x02`) Depth-8 binary Merkle tree.
- [`src/core/hbin.js`](src/core/hbin.js) — `.hbin` v1.0 512-byte cell format, exact integer placement schedule, byte-granular Overlap-Eclipse-resistant fuzzy Barker sync correlator with ±512B cadence flywheel & DoS budgets, Byzantine Merkle quarantine, unpinned Xenograft sovereignty guard, and bit-exact regeneration.
- [`src/core/torture.js`](src/core/torture.js) — Real raw-byte surgical operators (`bisectBinary`, `splitBinary`, `shredCells`, `irradiateCells`, `amputateBundles`, `shiftAndShuffle`, `injectByzantineTrojans`, `injectOverlapEclipseTrojan`, `concatShards`).

### 2.2 `Plang` Multi-Stratum Compiler (`src/compiler/`)
- [`src/compiler/isa.js`](src/compiler/isa.js) — `PVM-32` 32-bit ISA opcodes, 20 hardware syscalls, validated instruction encoders, disassembler.
- [`src/compiler/lexer.js`](src/compiler/lexer.js) — Strict Plang tokenizer with escape decoding and malformed-literal/overflow diagnostics.
- [`src/compiler/parser.js`](src/compiler/parser.js) — Recursive-descent multi-stratum AST parser (`program`, `const`, `bundle`, `fn`, `organ_call`, `mem[...]`, `MemCompoundAssign`, unary `~`, ternary).
- [`src/compiler/codegen.js`](src/compiler/codegen.js) — Lexical block scoping with self-referential initializer safety, `MemCompoundAssign` single-eval + `ADDI` peephole, direct-to-ABI call emitter, strict arity/function checks.
- [`src/compiler/compile.js`](src/compiler/compile.js) — End-to-end `.plang` → `.hbin` compilation pipeline.

### 2.3 Virtual Machines (`src/vm/`)
- [`src/vm/pvm32.js`](src/vm/pvm32.js) — `PVM-32` 32-bit register VM, caller-windowed `CALL`/`RET` register save/restore, signed-masked 4,096-word sandboxed RAM, Liang-Barsky clipped 160×120 RGBA framebuffer, clamped 4-voice synth registers, descending-stratum hot-swappable Anastomosis Dispatch Table (ADT), and non-executable Bundle 6 isolation.
- [`src/vm/linear-twin.js`](src/vm/linear-twin.js) — Monolithic `LINBIN01` ELF-style control binary with section-overlap validation for side-by-side falsification testing.

### 2.4 Quantum Mechanics, Temporal Causality & Endless 1/1 3D World Engine (`src/quantum/`, `src/world/`)
- [`src/quantum/qengine.js`](src/quantum/qengine.js) — 4-qubit complex statevector (`H, X, Y, Z, RX, RY, RZ, CNOT, CZ, SWAP`), Born collapse, rotation-invariant Horodecki CHSH ($|S| = 2\sqrt{2}$), exact 4-qubit Mermin GHZ ($|M_4| = 4.0$), Lindblad decoherence & purity, WKB tunneling, Heisenberg minimum-uncertainty stance, Quantum Zeno gaze, and multi-slit wave interference.
- [`src/quantum/temporal.js`](src/quantum/temporal.js) — O(1) circular `RingBuffer` 360-frame lossless 3D world rewind, spherical local Chrono-Wells, Chrono-Fork Past-Timeline Echo Allies, and Retrocausal Future-Cone predictions.
- [`src/world/generator.js`](src/world/generator.js) — 128-bit SHA-256 `sfc32` PRNG + 64-bit lineage IDs, Endless 1/1 Weapon (`80,640`), Armor (`3,072`), and Adaptive NPC/Boss (`25,920`) combinatorial forge (`6,421,059,993,600` exact reachable discrete builds × $2^{64}$ SHA-256 lineages), 6-Order Scale Realms (`10^-15 m` → `10^9 m`), 12-node 4-branch Skill Tree, and 8 Quantum-Temporal Abilities.
- [`src/world/game3d.js`](src/world/game3d.js) — Live 60 FPS adaptive 3D combat, deep rewind restoration, weapon entanglement, adaptive AI counter-evolution, endless Stage `1..∞` progression, and live `.hbin` + `PVM-32` + Bundle 4 audio coupling.

### 2.5 Interactive 3D WebGL2 Surgical Vivisection Studio, Hardened Server & CLI (`src/web/`, `bin/`, `server.mjs`)
- [`server.mjs`](server.mjs) — Zero-dependency hardened local HTTP server (`createPlanariaServer`, `realpathSync` containment, CSP/nosniff/DENY, `GET`/`HEAD` only, static 404).
- [`bin/planaria.mjs`](bin/planaria.mjs) — Schema-validated standalone CLI (`compile`, `inspect`, `run`, `bisect`, `fuse`, `heal`, `damage`, `xenograft`, `disasm`, `--version`).
- [`src/web/renderer3d.js`](src/web/renderer3d.js) — Custom zero-dependency WebGL2 (`GLSL 300 es`) 3D Temporal-Quantum Renderer (sky dome, GPU wave-interference floor with real `uWavePhase`, inverse-transpose normals, clean wireframe EBOs, opaque/translucent pass separation, 192 orbiting `.hbin` crystals, Bundle 3 Cortex degradation coupling, context-loss recovery & `dispose()`).
- [`src/web/index.html`](src/web/index.html) & [`src/web/styles.css`](src/web/styles.css) — Unified 3D Temporal-Quantum & Surgical Vivisection Studio UI (ARIA, responsive grids, `:focus-visible`, `prefers-reduced-motion`, data-URI favicon).
- [`src/web/app.js`](src/web/app.js) — XSS-free DOM controller, live 60 FPS WebGL2 + Dual-VM loop, event-delegated 1/1 Arsenal/Skill Tree UI, Surgical Dock, graceful non-WebGL2 fallback & live Plang compiler.
- [`src/web/visuals.js`](src/web/visuals.js) — HiDPI-aware 192-cell tissue surgery canvas, live Organ Vascular Anastomosis graph, empirical survival curve renderer.
- [`src/web/audio-worklet.js`](src/web/audio-worklet.js) & [`src/web/audio.js`](src/web/audio.js) — Lock-free 48 kHz 4-voice PolyBLEP + DC-blocked WebAudio synthesizer.

---

## 3. Compiled Living Programs & Reproducible Artifacts

| Source (`programs/`) | Compiled Binary (`artifacts/`) | Description |
|---|---|---|
| [`programs/quantum_chronicle.plang`](programs/quantum_chronicle.plang) | [`artifacts/quantum_chronicle.hbin`](artifacts/quantum_chronicle.hbin) | 3D Chrono-Quantum holographic engine driver (426 insns, 96 KiB) |
| [`programs/aegis_drift.plang`](programs/aegis_drift.plang) | [`artifacts/aegis_drift.hbin`](artifacts/aegis_drift.hbin) | Playable 60 FPS vector starfighter survival arcade (991 insns, 96 KiB) |
| [`programs/synth_reactor.plang`](programs/synth_reactor.plang) | [`artifacts/synth_reactor.hbin`](artifacts/synth_reactor.hbin) | 4-voice Lydian FM/subtractive synth & Lissajous plasma reactor (645 insns, 96 KiB) |
| [`programs/cipher_vault.plang`](programs/cipher_vault.plang) | [`artifacts/cipher_vault.hbin`](artifacts/cipher_vault.hbin) | 12-lane ARX stream-cipher & cryptographic avalanche matrix (534 insns, 96 KiB) |
| — | [`artifacts/manifest.json`](artifacts/manifest.json) | Deterministic artifact catalog, Lineage Roots & SHA-256 digests |

---

## 4. Formal Proofs, Verification Suites & Experimental Data

| Path | Description |
|---|---|
| [`lean/PlanariaProofs.lean`](lean/PlanariaProofs.lean) | Master Lean 4 (`v4.35.0`) `#print axioms` audit entrypoint (**62/62 theorems**) |
| [`lean/PlanariaProofs/GF256.lean`](lean/PlanariaProofs/GF256.lean) | Theorem I (15 proofs): Full 65,536-pair `gfMul_comm`, 16,777,216-triple `gfMul_assoc`, `gf256Field`, universal & concrete Cauchy 2×2 decode |
| [`lean/PlanariaProofs/MitosisBounds.lean`](lean/PlanariaProofs/MitosisBounds.lean) | Theorem II (11 proofs): Tight Mitosis iff bounds, unaligned cuts, exact integer `PLACEMENT_SCHEDULE` zero-tie halves, 512B/15,936B budgets, trisection synergy |
| [`lean/PlanariaProofs/StratumAnastomosis.lean`](lean/PlanariaProofs/StratumAnastomosis.lean) | Theorem III (6 proofs): 7-bundle profile, general 6-organ `resolveOrgan`, monotonicity, synergy & separation vs. BOTH `RS(40,16)` and equal-storage `RS(192,48)` |
| [`lean/PlanariaProofs/ByzantineImmune.lean`](lean/PlanariaProofs/ByzantineImmune.lean) | Theorem IV (13 proofs): Byte-list `hammingDist_triangle`, `RS(254,238)` $t=8$ balls, 16B burst + tight 17B/18B bounds, 8-level Merkle path, Sybil quorum boundary |
| [`lean/PlanariaProofs/XenograftABI.lean`](lean/PlanariaProofs/XenograftABI.lean) | Theorem V (6 proofs): Signed `BitVec 32` RAM $<4096$, bounded termination, non-vacuous B0/B6 sovereignty & Xenograft ABI safety |
| [`lean/PlanariaProofs/QuantumTemporal.lean`](lean/PlanariaProofs/QuantumTemporal.lean) | Theorem VI (11 proofs): Full 4-qubit 16-amplitude complex unitarity (`X/Y/Z/H/CNOT/CZ/SWAP`), clock/360-frame rewind, exact `6,421,059,993,600` space |
| [`test/verify.mjs`](test/verify.mjs) | **24-suite** executable verification, fuzz, CLI, HTTP security & Popperian falsification harness |
| [`scripts/build-artifacts.mjs`](scripts/build-artifacts.mjs) | Deterministic `.plang` → `.hbin` build & round-trip regeneration script |
| [`scripts/benchmark.mjs`](scripts/benchmark.mjs) | Monte Carlo survival curve, radiation sweep, Byzantine audit & Ed25519 attestation runner |
| [`results/benchmarks.json`](results/benchmarks.json) | Complete reproducible empirical benchmark tables |
| [`results/attestation.json`](results/attestation.json) | SHA-256 + Ed25519 self-consistency attestation across 44 repository files |
| [`results/lean4-audit.txt`](results/lean4-audit.txt) | Verbatim Lean 4 `lake build` & `#print axioms` verification log (62 theorems) |

---

## 5. GitHub Governance & CI (`.github/`)

- [`.github/workflows/ci.yml`](.github/workflows/ci.yml) — Automated Node build/24-suite/CLI/benchmark + Lean 4 strict 62-theorem axiom allowlist + Tectonic AMS-LaTeX PDF & arXiv tarball CI pipeline
- [`.github/ISSUE_TEMPLATE/falsification.yml`](.github/ISSUE_TEMPLATE/falsification.yml) — Falsification, counterexample & security audit template
- [`.github/ISSUE_TEMPLATE/bug.yml`](.github/ISSUE_TEMPLATE/bug.yml) · [`.github/ISSUE_TEMPLATE/feature.yml`](.github/ISSUE_TEMPLATE/feature.yml) · [`.github/ISSUE_TEMPLATE/config.yml`](.github/ISSUE_TEMPLATE/config.yml)
- [`.github/SECURITY.md`](.github/SECURITY.md) · [`.github/CONTRIBUTING.md`](.github/CONTRIBUTING.md) · [`.github/CODE_OF_CONDUCT.md`](.github/CODE_OF_CONDUCT.md)
