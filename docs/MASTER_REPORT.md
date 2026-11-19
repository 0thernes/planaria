# PLANARIA — Comprehensive Technical, Scientific, Computational, Functional & Operational Master Report

**Document Type:** Master Engineering & Research Analysis Report  
**System:** PLANARIA v1.0.0 — Progressive Holographic Executable Architecture (`.hbin`)  
**Author:** Alexander S. Donahue ([0thernes LLC](https://0thernes.art) · `0_0@0thernes.art` · ORCID [0009-0006-8168-9648](https://orcid.org/0009-0006-8168-9648))  
**Date:** November 18, 2026  
**Verification Status:** 12/12 Falsification Suites Passed · 31/31 Pure Lean 4 (`v4.35.0`) Kernel Theorems Audited (0 `sorryAx`) · Ed25519-Attested Benchmarks

---

## Table of Contents

1. [Executive Verdict: Did We Discover Something New?](#1-executive-verdict-did-we-discover-something-new)
2. [Deep Technical Architecture Audit (Byte-by-Byte)](#2-deep-technical-architecture-audit-byte-by-byte)
3. [Coding-Theoretic & Cryptographic Analysis](#3-coding-theoretic--cryptographic-analysis)
4. [Compiler & Virtual Machine Engineering Deep Dive (`Plang` & `PVM-32`)](#4-compiler--virtual-machine-engineering-deep-dive-plang--pvm-32)
5. [Functional Analysis of the Three Living Species & Chimeric Xenografts](#5-functional-analysis-of-the-three-living-species--chimeric-xenografts)
6. [Computational Performance, Latency & Memory Profiling](#6-computational-performance-latency--memory-profiling)
7. [Formal Verification & Falsification Audit Summary](#7-formal-verification--falsification-audit-summary)
8. [Operational Manual: CLI, Interactive Studio, CI & Reproduction Playbook](#8-operational-manual-cli-interactive-studio-ci--reproduction-playbook)
9. [Failure Modes, Edge Cases & Honest Engineering Limitations](#9-failure-modes-edge-cases--honest-engineering-limitations)
10. [Future Research Roadmap](#10-future-research-roadmap)

---

## 1. Executive Verdict: Did We Discover Something New?

A rigorous engineering report must answer this question bluntly and without hype:

- **Did PLANARIA discover new physics?** **No.** PLANARIA intentionally avoids physics and cosmology entirely.
- **Did PLANARIA prove a previously open conjecture in pure mathematics?** **No.** Every algebraic and cryptographic building block ($\text{GF}(2^8)$, Reed-Solomon, Berlekamp-Massey/Chien/Forney, Cauchy MDS matrices, Priority Encoding Transmission, SHA-256 Merkle trees) comes from well-established mathematics and computer science.
- **Did PLANARIA create a genuinely novel, extreme, rare computational & systems phenomenon?** **YES.**

Specifically, PLANARIA demonstrates and formally verifies a **new executable binary paradigm — Progressive Holographic Instruction Stratification (PHIS) with Autonomous Control-Flow Anastomosis** — producing five real, reproducible, byte-level behaviors that conventional software cannot exhibit:

1. **Zero-Overlap Planarian Binary Mitosis**: Literally cut a compiled executable in half at an arbitrary unaligned byte offset (`49177`) with zero shared bytes — BOTH halves independently boot at full capability and each regenerates the 100% SHA-256 bit-exact 98,304-byte original.
2. **Zero-Cliff Sub-Threshold Survival ("The 12% Ghost")**: Delete 88%–92% of the binary file — well past the point where both monolithic executables (0% alive at 44% loss) and single-stratum `RS(40,16)` erasure-coded executables (0% alive at 72% loss) suffer total cliff death — and PLANARIA STILL boots live (82.5% survival at 88% destruction; 70.0% at 92% destruction!) in ghostly Stratum-0 wireframe survival mode.
3. **File-Wide Simultaneous Radiation Healing**: Inject a contiguous **16-byte burst error inside EVERY SINGLE ONE of the 192 cells simultaneously** (3,072 corrupted bytes = 3.13% file-wide error rate — zero untouched cells in the entire file!), shift the file by 137 unaligned random bytes, shuffle all 192 cells, and PLANARIA STILL heals 192/192 cells and regenerates the 100% bit-exact original.
4. **Cryptographic Byzantine Quarantine Before Linear Decoding**: Prepend 192 adversarially forged cells that pass sync matching, header parsing, and `RS(254, 238)` parity with zero errors; PLANARIA's Depth-8 SHA-256 Merkle Immune System quarantines 192/192 Trojans before Cauchy decoding (whereas toggling the immune system OFF proves that even **1 single Trojan** corrupts 415/416 bytes of the kernel).
5. **Raw-Concatenation Synergistic Healing & Cross-Species Executable Xenografting**: Raw OS concatenation of two crippled sub-threshold shards (`cat part1 + junk + part3`) heals super-additively back to Stratum 3; raw concatenation of an amputated host binary (`AEGIS_DRIFT`) with a foreign species (`SYNTH_REACTOR` or `CIPHER_VAULT`) dynamically transplants ABI-verified `RENDERER` and `AUDIO` organs at runtime, producing a playable hybrid Chimera exportable as its own self-healing `.hbin` binary.

---

## 2. Deep Technical Architecture Audit (Byte-by-Byte)

### 2.1 Subsystem Topology

```text
  [.plang Source]
        │
        ▼  src/compiler/{lexer,parser,codegen,compile}.js
  [6 Organ-Stratum Bytecode Bundles (PVM-32 32-bit ISA)]
        │
        ▼  src/core/cauchy.js  (GF(2^8) 0x11D Cauchy MDS)
  [192 Holographic Coded Shards (332B payload + 16B header = 348B leaf)]
        │
        ▼  src/core/sha256.js  (Depth-8 Domain-Separated Merkle Tree)
  [192 Cells × (348B leaf + 128B Merkle Proof = 476B body)]
        │
        ▼  src/core/rs.js      (2-Way Interleaved RS(254, 238) + 4B Fuzzy Sync)
  [98,304-byte .hbin Binary — Zero Header, Low-Discrepancy Interleaved]
        │
        ▼  Physical Torture / Mitosis / Radiation / Trojans / Xenograft Splice
        │
        ▼  src/core/hbin.js :: decodeHbin()
  [Sliding Sync Correlator -> RS(254,238) Self-Healer -> Merkle Quarantine
   -> Cauchy GF(2^8) Gauss-Jordan Decoder -> Optional ABI Xenograft Splicer]
        │
        ▼  src/vm/pvm32.js :: PVM32 (Hot-Swap Anastomosis Dispatch Table)
  [Live 60 FPS 160x120 Phosphor Framebuffer + 48 kHz 4-Voice AudioWorklet]
```

### 2.2 Byte-Budget Verification of the 512-Byte Cell

- `4 B` Sync Word (`0x50 0x4C 0x4E 0xB7`) — outside RS protection, protected directly by Hamming-distance-3 fuzzy matching (`syncBitDistance <= 3`).
- `476 B` Armored Body = `16 B` Header + `332 B` Cauchy Payload + `128 B` Depth-8 Merkle Proof.
- `32 B` Interleaved RS Parity = `16 B` even-lane parity + `16 B` odd-lane parity (`2 × RS(254, 238)` covering exact `2 × 238 = 476` data bytes + `2 × 16 = 32` parity bytes = `508 B`).
- `4 + 476 + 32 = 512 B` exact. Zero wasted padding bytes inside the cell envelope.

---

## 3. Coding-Theoretic & Cryptographic Analysis

### 3.1 Why Cauchy Matrices Beat Vandermonde over $\text{GF}(2^8)$

A classic pitfall in erasure-coding engineering is assuming that any Vandermonde matrix truncated to a systematic form $[I_k \mid V]$ over $\text{GF}(2^8)$ is MDS. In fact, systematic Vandermonde constructions over $\text{GF}(2^8)$ can contain singular $k \times k$ submatrices for $k \ge 4$! PLANARIA eliminates this defect structurally by using **pure Cauchy matrices** $C_{i,j} = (x_i \oplus y_j)^{-1}$ with $Y = \{0..k-1\}$ and $X = \{k..k+n-1\}$. Because $\max(k + n) = 16 + 40 = 56 \le 256$, coordinate disjointness holds with enormous margin, and every $k \times k$ submatrix is strictly invertible.

### 3.2 Inner RS(254, 238) Exactness & Syndrome Recheck

Our Berlekamp-Massey + Chien + Forney decoder (`src/core/rs.js`) includes three critical hardening guards:
1. Degree bound rejection ($\nu = 0$ or $\nu > 8$).
2. Exact Chien root multiplicity check (`positions.length === degree`).
3. Mandatory post-correction re-evaluation of all 16 syndromes (`recheck.hasError === false`).

As verified empirically in `results/benchmarks.json` (`radiationSweep`), this yields a **razor-sharp transition**: 192/192 cells healed at `burstBytesPerCell = 16`, and **0/192 cells miscorrected** at `burstBytesPerCell = 18, 20, 22`.

### 3.3 Why Byzantine Quarantine MUST Precede Cauchy Decoding

Experiment 3 (`byzantineAudit` in `results/benchmarks.json`) quantifies the exact amplification factor of an unauthenticated MDS decoder: injecting **1 single RS-valid Trojan cell** ahead of authentic cells when `disableImmuneSystem: true` corrupts **415 out of 416 bytes (99.8%)** of `S0_STEM_NUCLEUS`! Because Gaussian elimination spreads one bad input vector linearly across all $k$ output chunks, **cryptographic authentication MUST happen per coded cell BEFORE linear inversion**, not merely on the final reassembled binary. PLANARIA embeds a complete 128-byte Depth-8 SHA-256-128 Merkle proof *inside every single cell*, guaranteeing zero contamination prior to inversion (formally proved in `ByzantineImmune.lean` Theorem IV.4).

---

## 4. Compiler & Virtual Machine Engineering Deep Dive (`Plang` & `PVM-32`)

### 4.1 Compiler Optimization Impact

Without register reclamation and peephole optimizations, `AEGIS_DRIFT`'s `S1_CORE_LOGIC` compiled to 2,384 bytes (596 instructions), exceeding its $k=4$ (`1,328 B`) budget. Implementing four real compiler passes in `src/compiler/codegen.js`:
1. Lexical block-scope register reclamation (`r18..r31`);
2. Direct-to-ABI call-argument emission (`containsCall` check);
3. Base+offset `LDW`/`STW` and `ADDI` immediate folding;
4. Direct conditional branch lowering (`compileCondJumpFalse`);

compressed `S1_CORE_LOGIC` to **1,268 B (317 instructions, 95.5% utilization)** and `S0_STEM_NUCLEUS` to **416 B (104 instructions, 62.7% utilization)** — allowing all three rich interactive programs to keep exact power-of-two Stratum 0/1/2/3 recovery thresholds ($k \in \{2, 4, 8, 16\}$).

### 4.2 `PVM-32` Safety Guarantees

| Safety Vector | Runtime Enforcement (`src/vm/pvm32.js`) | Formal Proof (`lean/PlanariaProofs/XenograftABI.lean`) |
|---|---|---|
| Out-of-bounds RAM read/write | Bitwise mask `(rs1 + imm16) & 0xFFF` | `pvm32_ram_bounds_invariant` (zero axioms!) |
| Infinite loop / DoS in xenografted organ | Per-frame `budget.remaining` decrement (`16,000` cap) | `pvm32_bounded_termination` |
| Call-stack overflow | Separate hardware call stack capped at depth `32` | Bounded frame trap (`STACK_OVERFLOW`) |
| Illegal opcode in poisoned bytecode | Explicit `default:` trap counter & clean organ abort | Verified in Suite 08 |
| Host identity hijack by donor | `B0` (`KERNEL`) and `B6` (`GENOME`) have `xenograftable: false` | `xenograft_preserves_sovereignty` |
| Incompatible organ transplant | Exact 16-bit `abiSig` match enforced before grafting | `xenograft_abi_safety` |

---

## 5. Functional Analysis of the Three Living Species & Chimeric Xenografts

| Species | Source | Compiled `.hbin` | Total Insns | Code Bytes | Interactive Behavior & Visual/Acoustic Degradation Profile |
|---|---|---|---:|---:|---|
| **`AEGIS_DRIFT`** | `programs/aegis_drift.plang` | `artifacts/aegis_drift.hbin` | 958 | 3,832 B | Playable 60 FPS neon vector starfighter survival game (WASD/Arrows + Space or Autopilot). Degrades: S3 Starfield+Shrapnel+Shield Halo+4-voice synthwave → S2 Neon vector sprites → S1 Tactical radar wireframe → S0 Ghost distress triangle & 1-bit heartbeat. |
| **`SYNTH_REACTOR`** | `programs/synth_reactor.plang` | `artifacts/synth_reactor.hbin` | 621 | 2,484 B | 4-voice Lydian polyphonic synthesizer + phosphor-trailed Lissajous harmonic reactor. Arrows bend frequency ratios. Degrades: S3 Containment rings+8-band spectrum+4-voice chord engine → S2 Lissajous plasma web → S1 Green oscilloscope grid → S0 Central pulse ring. |
| **`CIPHER_VAULT`** | `programs/cipher_vault.plang` | `artifacts/cipher_vault.hbin` | 526 | 2,104 B | Live 12-lane 32-bit ARX stream-cipher & cryptographic avalanche bit-matrix + pentatonic keystream sonification. Degrades: S3 Rotating lock ring+entropy ribbon → S2 12×8 avalanche bit-matrix → S1 Parity bars → S0 Emergency lockdown cross. |
| **Chimera (`AEGIS x SYNTH`)** | Spliced live | Exportable 96 KiB `.hbin` | Mixed | Mixed | Runs `AEGIS_DRIFT`'s gameplay & enemy collisions through `SYNTH_REACTOR`'s Lissajous harmonic phase-web renderer and 4-voice Lydian FM synth engine over the shared ABI (`MEM[0..511]`) — zero traps, full 50/50 Mitosis preserved! |

---

## 6. Computational Performance, Latency & Memory Profiling

Measured on Node.js (`results/benchmarks.json`):
- **Full 96 KiB Decode Latency**: **`10.5 ms`** mean (25-iteration steady state) — fast enough to re-decode a live 192-cell binary interactively on every surgical drag or button click without stutter!
- **Dual Mitosis Decode + Bit-Exact Regeneration**: **`21.38–33.84 ms`** combined for BOTH disjoint halves.
- **In-Browser Plang Compilation**: **`12.1 ms`** end-to-end (`AEGIS_DRIFT.plang` → lexer → parser → codegen → Cauchy → Depth-8 Merkle → 384 RS codewords → 98,304B `.hbin`).
- **`PVM-32` Virtual Machine Throughput**: **`0.12 ms/frame`** (`19.45 MIPS`, > 8,300 FPS headless ceiling; < 0.8% of a 16.67 ms 60 FPS frame budget).
- **AudioWorklet DSP**: Lock-free 48 kHz stereo synthesis with per-sample amplitude slewing (`0.008` smoothing) and one-pole lowpass filtering — zero GC allocations inside `process()`.

---

## 7. Formal Verification & Falsification Audit Summary

1. **Lean 4 Kernel Proofs (`lean/`)**: **31/31 theorems built cleanly** in 7.4s under `leanprover/lean4:v4.35.0`, zero warnings, zero `sorryAx`, zero `native_decide`, zero custom axioms ([results/lean4-audit.txt](../results/lean4-audit.txt)).
2. **Executable Falsification Suite (`test/verify.mjs`)**: **12/12 suites passed** in 645 ms, validating both positive survival invariants AND tight negative Popperian failure boundaries (exact 1-bit linear death, $k-1$ Cauchy failure, $e=10>8$ RS rejection, single-Trojan poisoning under `disableImmuneSystem: true`, sub-S0 cellular death).
3. **Browser Studio Verification**: Verified live in headless/GUI Chrome at `http://127.0.0.1:4174` across all surgical operations (`Laser Bisect`, `Shred 88%`, `Inject +36 Trojans`, `Xenograft Chimera`, `Tabs 1–4`, and live in-browser Plang compilation) with **zero JS console errors and zero VM traps**.
4. **Cryptographic Attestation**: [results/attestation.json](../results/attestation.json) binds SHA-256 digests of all core source files, `.plang` sources, `.hbin` artifacts, and `results/benchmarks.json` under a verified Ed25519 signature (`selfVerified: true`).

---

## 8. Operational Manual: CLI, Interactive Studio, CI & Reproduction Playbook

### Quick Operations Cheat Sheet

| Goal | Exact Command |
|---|---|
| Compile all 3 `.plang` sources → `.hbin` | `npm run build` |
| Run 12-suite falsifiable verification harness | `npm test` |
| Run full Monte Carlo survival benchmarks & Ed25519 attestation | `npm run benchmark` |
| Launch 60 FPS + 48 kHz Surgical Vivisection Studio | `npm start` → open `http://127.0.0.1:4174` |
| Clean-build & audit all 31 Lean 4 theorems | `cd lean && lake clean && lake build` |
| Inspect any `.hbin` (damaged, shifted, or poisoned) | `node bin/planaria.mjs inspect <file.hbin>` |
| Perform unaligned 50/50 Planarian Mitosis on disk | `node bin/planaria.mjs bisect artifacts/aegis_drift.hbin L.hbin R.hbin --offset 49177` |
| Heal a damaged shard or concatenated shards back to 100% | `node bin/planaria.mjs heal R.hbin -o healed.hbin` |
| Forge & execute a standalone Cross-Species Chimera | `node bin/planaria.mjs xenograft artifacts/aegis_drift.hbin artifacts/synth_reactor.hbin -o chimera.hbin && node bin/planaria.mjs run chimera.hbin --frames 60` |
| Disassemble any surviving organ bundle | `node bin/planaria.mjs disasm artifacts/aegis_drift.hbin --bundle 0 --max 32` |

---

## 9. Failure Modes, Edge Cases & Honest Engineering Limitations

1. **Below-S0 Extinction ($< 2$ Stratum-0 cells)**: When total survival falls below ~4% (fewer than 2 surviving cells in `B0`), even the Stem Nucleus loses rank and the organism transitions cleanly to `CELL DEATH` (observed in 62.5% of trials at 96% file obliteration).
2. **Excessive Radiation Beyond 16B Contiguous Burst**: At 18+ consecutive corrupted bytes in *every* single cell simultaneously, both RS lanes receive $\ge 9 > 8$ errors and cleanly reject every cell (0 miscorrections). Note that localized >16B craters affecting *some* cells (rather than all 192 simultaneously) are seamlessly absorbed by the outer Cauchy MDS layer!
3. **Sync-Word Burst Destruction**: Because the 4-byte sync word lies outside RS parity and uses Hamming-3 fuzzy matching, corrupting all 4 bytes of a cell's sync word causes that single cell to be skipped by the sliding correlator (absorbed as an erasure by the outer Cauchy layer).
4. **Cross-Species Semantic Mismatch**: While `abiSig` guarantees memory-safe, trap-free Xenograft execution across `AEGIS_DRIFT`, `SYNTH_REACTOR`, and `CIPHER_VAULT`, aesthetic coherence relies on species populating the shared entity slots (`MEM[64..255]`) meaningfully.

---

## 10. Future Research Roadmap

- **Hardware / Native Target Backend**: Extending `Plang` codegen to emit progressive holographic RISC-V (`RV32IM`) or WebAssembly (`wasm32`) cellular micro-modules alongside `PVM-32`.
- **Full 256-Bit Merkle Cells (1,024 B Sector Mode)**: Eliminating 128-bit truncation for post-quantum / $2^{128}$ collision resistance against untrusted compilers.
- **Peer-to-Peer Cellular Anastomosis**: Streaming missing Cauchy evaluation points opportunistically over WebRTC/UDP gossip so damaged binaries autonomously scavenge missing cells from passing peers.
- **Verified Codegen Extraction**: Formally proving `Plang` compiler pass preservation in Lean 4 directly down to `PVM-32` small-step semantics.
