# Changelog

All notable changes to **PLANARIA** are documented in this file.

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
