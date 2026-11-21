# Changelog

All notable changes to **PLANARIA** are documented in this file.

## [2.1.0] — 2026-11-21

### Added & Polished
- **Publication-Grade AMS-LaTeX White Paper & Release Bundle**: Added [`paper/main.tex`](paper/main.tex) with native TikZ/PGFPlots vector figures (512-byte Holographic Cell schematic & empirical Monte Carlo Survival Phase-Transition Curve), compiled via Tectonic `0.17.0` into frozen [`dist/Donahue_2026_planaria.pdf`](dist/Donahue_2026_planaria.pdf) and standalone [`dist/arxiv_submission.tar.gz`](dist/arxiv_submission.tar.gz).
- **CI & Governance Hardening**: Upgraded `.github/workflows/ci.yml` to `actions/checkout@v5` and `actions/setup-node@v5` (eliminating Node 20 runner deprecation annotations), updated audit counts to `4 .hbin artifacts`, `16-suite falsification`, and `38 Lean 4 theorems` with explicit theorem-count & strict axiom-allowlist enforcement.
- **Documentation Parity & Master Archive Registration**: Synchronized `SUMMARY.md`, `paper/WHITE_PAPER.md`, `docs/MASTER_REPORT.md`, `VERIFICATION.md`, `INDEX.md`, and `0thernes-research-archive` (`0TH-BUILD-002_planaria`) with frozen PDF SHA-256 digests, GitHub Release `v2.1.0`, and Software Heritage preservation.

## [2.0.0] — 2026-11-18

### Added
- **Custom Zero-Dependency WebGL2 (`GLSL 300 es`) 3D Temporal-Quantum Renderer (`src/web/renderer3d.js`)**: Relativistic 6-Order Sky Dome (`10^-15 m` → `10^9 m`), live GPU-evaluated Schrödinger multi-slit wave-interference 3D arena floor, procedural 3D polyhedral NPCs/Bosses/Pillars/Astrolabe Rings, all **192 live orbiting 3D `.hbin` Holographic Cell Crystals**, real-time `.hbin` Stratum metamorphosis (`S3 Full 3D → S2 Shaded → S1 3D Wireframe → S0 Ghost Point-Cloud`), vibrating Bell-state entanglement filaments, Retrocausal Future-Cones, Past-Timeline Echo Clones, and translucent spherical 3D Chrono-Wells.
- **Real 4-Qubit Quantum Mechanics Engine (`src/quantum/qengine.js`)**: Exact complex statevector `QuantumRegister` ($\mathbb{C}^{16}$ with `H, X, Z, RX, RY, RZ, CNOT, CZ`), Born projective collapse, exact CHSH Tsirelson correlator ($|S| = 2\sqrt{2} \approx 2.828 > 2.0$), Lindblad decoherence purity damping, WKB barrier tunneling probability $T = e^{-2\kappa d}$, exact minimum-uncertainty Heisenberg Stance ($\Delta x \cdot \Delta p = 0.5$), Quantum Zeno observer suppression, and multi-source wave interference.
- **Real Temporal Causality Engine (`src/quantum/temporal.js`)**: 360-frame lossless 3D world Rewind (`Hold R`), global bullet-time (`Hold Shift`) & continuous clock slider, spherical local time-dilation Chrono-Wells (`F`), Chrono-Fork Past-Timeline Echo Allies (`T`), and Retrocausal 1.1s Future-Cone predictions.
- **Endless 1/1 Procedural Combinatorial Universe Forge (`src/world/generator.js`, `src/world/game3d.js`)**: Over 6.8 trillion discrete Weapon (`80,640`) × Armor (`3,072`) × NPC (`27,648`) builds × $2^{64}$ SHA-256 Lineage IDs across 24 spatial orders of magnitude (6 distinct realm biomes, endless Stages `1..∞`), adaptive reactive NPC evolution (countering player tactics), Weapon Quantum Entanglement, 12-node 4-branch Adaptive Skill Tree, and 8 active Quantum-Temporal abilities (`Q/E/R/T/F/V/X/C`).
- **4th Living Compiled `.hbin` Species**: `programs/quantum_chronicle.plang` → `artifacts/quantum_chronicle.hbin` (98,304 B, 418 insns, Root `60a1bb8748538186e3f4d16fa61e4289`).
- **Lean 4 Formal Proof Module #6 (`lean/PlanariaProofs/QuantumTemporal.lean`)**: Added 7 new pure Lean 4 kernel proofs (total **38/38 audited theorems**, zero `sorryAx`, zero `native_decide`, zero Mathlib) covering unitary norm preservation (`Pauli-X`, `Pauli-Z`, `CNOT`, scaled `Hadamard`), exact bijective temporal rewind reversibility, and the >6.8-trillion combinatorial cardinality bound.
- **Expanded Verification Harness (`test/verify.mjs`)**: Upgraded from 12 to **16 passing verification & falsification suites** (adding Suites 13–16 for quantum unitarity/CHSH/WKB/Heisenberg, lossless temporal rewind/echoes, 1/1 uniqueness/adaptive AI/6-order stages, and `QUANTUM_CHRONICLE.hbin` integration).

## [1.0.0] — 2026-11-18

### Added
- **`.hbin` v1.0 Progressive Holographic Executable Format** (`src/core/hbin.js`): Zero-header, self-synchronizing 512-byte cellular binary container (192 cells = 98,304 bytes = 96 KiB) stratified across 7 Cauchy-coded organ bundles (`S0_STEM_NUCLEUS` through `S3_GENOME_LEDGER`) with low-discrepancy physical interleaving.
- **Exact Dual-Layer Coding Engine** (`src/core/gf256.js`, `src/core/rs.js`, `src/core/cauchy.js`): Zero-dependency $\text{GF}(2^8)$ (`0x11D`), 2-way interleaved inner `RS(254, 238)` Berlekamp-Massey + Chien + Forney decoder (correcting up to 16 contiguous burst bytes per cell), and outer Cauchy-matrix MDS erasure codec.
- **Cryptographic Cellular Immune System** (`src/core/sha256.js`, `src/core/hbin.js`): Synchronous zero-dep FIPS 180-4 SHA-256 Depth-8 Merkle tree authentication with Pinned-Root and Unpinned Consensus-Quorum Byzantine Trojan quarantine (plus explicit falsification mode switch).
- **Plang Language & Multi-Stratum Compiler** (`src/compiler/`): Full lexer, recursive-descent parser, lexical block register allocator, direct-ABI/conditional-branch optimizer, and `PVM-32` codegen + disassembler.
- **`PVM-32` Anastomosis Virtual Machine & Linear Control Twin** (`src/vm/pvm32.js`, `src/vm/linear-twin.js`): 32-bit sandboxed register VM with 160×120 framebuffer, 4-channel audio synth register bank, hot-swappable Anastomosis Organ Dispatch Table (ADT), and side-by-side monolithic `LINBIN01` control binary.
- **Three Compiled Living Executables** (`programs/*.plang` -> `artifacts/*.hbin`): `AEGIS_DRIFT.hbin` (958 insns), `SYNTH_REACTOR.hbin` (621 insns), and `CIPHER_VAULT.hbin` (526 insns), supporting live ABI-verified cross-species Xenograft Chimeras.
- **Standalone CLI** (`bin/planaria.mjs`): `compile`, `inspect`, `run`, `bisect`, `heal`, `damage`, `xenograft`, and `disasm`.
- **Interactive Surgical Vivisection Studio** (`src/web/`, `server.mjs`): Real-time 60 FPS dual-VM operating theater, 48 kHz lock-free `AudioWorklet` synthesizer, interactive 192-cell tissue surgery map, live organ vascular anastomosis graph, empirical survival curve plot, and live in-browser Plang compiler.
- **Pure Lean 4 (`v4.35.0`) Formal Proof Library** (`lean/PlanariaProofs/`): 31 machine-checked theorems across 5 modules with zero `sorryAx`, zero `native_decide`, zero custom axioms, and zero Mathlib dependency ([results/lean4-audit.txt](results/lean4-audit.txt)).
- **12-Suite Falsifiable Verification Harness & Attested Benchmarks** (`test/verify.mjs`, `scripts/benchmark.mjs`, `results/benchmarks.json`, `results/attestation.json`).
- **Complete Research Publication Suite**: [paper/WHITE_PAPER.md](paper/WHITE_PAPER.md), [SUMMARY.md](SUMMARY.md), [docs/MASTER_REPORT.md](docs/MASTER_REPORT.md), [INDEX.md](INDEX.md), [GLOSSARY.md](GLOSSARY.md), [VERIFICATION.md](VERIFICATION.md), and [LEGAL.md](LEGAL.md).
