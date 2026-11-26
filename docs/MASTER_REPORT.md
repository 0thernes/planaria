# PLANARIA — Comprehensive Technical, Scientific, Computational, Functional & Operational Master Report

**Document Type:** Master Engineering, Adversarial Audit & Research Analysis Report  
**System:** PLANARIA v2.3.0 — 3D Temporal-Quantum WebGL2 Engine & Progressive Holographic Executable Architecture (`.hbin`)  
**Author:** Alexander Stephen Donahue — Independent Researcher ([0thernes project](https://0thernes.art), Spokane, WA, USA · `0_0@0thernes.art` · ORCID [0009-0006-8168-9648](https://orcid.org/0009-0006-8168-9648))  
**Date:** November 25, 2026  
**Verification Status:** 28/28 Verification & Security Suites Passed · 10/10 (100.0%) Surgical Mutants Killed · 70/70 Pure Lean 4.35.0 Proofs Audited Across 6 Kernels (0 `sorryAx`, 0 `native_decide`) · Build Standard v1.2.0 100% · Frozen Tectonic PDF ([`dist/Donahue_2026_planaria.pdf`](../dist/Donahue_2026_planaria.pdf)) · Mega-Atlas Audit: `0 / 1,900` Open Problems Solved (See [`docs/reviews/2026-11-25-10-pass-red-team-audit.md`](reviews/2026-11-25-10-pass-red-team-audit.md))

---

## Table of Contents

1. [Executive Verdict: Did We Discover Something New?](#1-executive-verdict-did-we-discover-something-new)
2. [v2.2.0 Full-Stack 5-Layer Adversarial Audit & Hardening Matrix](#2-v220-full-stack-5-layer-adversarial-audit--hardening-matrix)
3. [Deep Technical Architecture Audit (Byte-by-Byte)](#3-deep-technical-architecture-audit-byte-by-byte)
4. [Coding-Theoretic & Cryptographic Analysis](#4-coding-theoretic--cryptographic-analysis)
5. [Compiler & Virtual Machine Engineering Deep Dive (`Plang` & `PVM-32`)](#5-compiler--virtual-machine-engineering-deep-dive-plang--pvm-32)
6. [Functional Analysis of the Four Living Species, 3D Quantum Engine & Chimeric Xenografts](#6-functional-analysis-of-the-four-living-species-3d-quantum-engine--chimeric-xenografts)
7. [Computational Performance, Latency & Memory Profiling](#7-computational-performance-latency--memory-profiling)
8. [Formal Verification & Falsification Audit Summary](#8-formal-verification--falsification-audit-summary)
9. [Operational Manual: CLI, Interactive Studio, CI & Reproduction Playbook](#9-operational-manual-cli-interactive-studio-ci--reproduction-playbook)
10. [Failure Modes, Edge Cases & Honest Engineering Limitations](#10-failure-modes-edge-cases--honest-engineering-limitations)
11. [Future Research Roadmap](#11-future-research-roadmap)

---

## 1. Executive Verdict: Did We Discover Something New?

A rigorous engineering report must answer this question bluntly and without hype:

- **Did PLANARIA discover new physics?** **No.** PLANARIA uses established quantum-information formalisms (unitary statevector simulation, Horodecki CHSH tensor, Mermin GHZ observable) as interactive simulation mechanics — not new physical laws.
- **Did PLANARIA prove a previously open conjecture in pure mathematics?** **No.** Every algebraic and cryptographic building block ($\text{GF}(2^8)$, Reed-Solomon, Berlekamp-Massey/Chien/Forney, Cauchy MDS matrices, Priority Encoding Transmission, SHA-256 Merkle trees) comes from well-established mathematics and computer science.
- **Did PLANARIA create a genuinely novel, extreme, rare computational & systems phenomenon?** **YES.**

Specifically, PLANARIA demonstrates and formally verifies a **new executable binary paradigm — Progressive Holographic Instruction Stratification (PHIS) with Autonomous Control-Flow Anastomosis** — producing five real, reproducible, byte-level behaviors that conventional software cannot exhibit:

1. **Zero-Overlap Planarian Binary Mitosis**: Literally cut a compiled executable in half at an arbitrary unaligned byte offset (`49177`) with zero shared bytes — BOTH halves independently boot at Stratum 3 and each regenerates the 100% SHA-256 bit-exact 98,304-byte original.
2. **Zero-Cliff Sub-Threshold Survival ("The 12% Ghost")**: Delete 88%–92% of the binary file — well past the point where both monolithic executables (0% alive at 44% loss) and single-stratum `RS(40,16)` erasure-coded executables (0% alive at 76% loss) suffer total cliff death — and PLANARIA STILL boots live (**82.5% survival at 88% destruction; 65.0% at 92% destruction!**) in ghostly Stratum-0 wireframe survival mode.
3. **File-Wide Simultaneous Radiation Healing**: Inject a contiguous **16-byte burst error inside EVERY SINGLE ONE of the 192 cells simultaneously** (3,072 corrupted bytes = 3.13% file-wide error rate — zero untouched cells in the entire file!), shift the file by 137 unaligned random bytes, shuffle all 192 cells, and PLANARIA STILL heals 192/192 cells and regenerates the 100% bit-exact original.
4. **Cryptographic Byzantine Quarantine Before Linear Decoding**: Prepend 192 adversarially forged cells that pass sync matching, header parsing, and `RS(254, 238)` parity with zero errors; PLANARIA's Depth-8 SHA-256 Merkle Immune System quarantines 192/192 Trojans before Cauchy decoding (whereas toggling the immune system OFF proves that even **1 single Trojan** corrupts **470/472 bytes (99.6%)** of `S0_STEM_NUCLEUS`).
5. **Raw-Concatenation Synergistic Healing & Cross-Species Executable Xenografting**: Raw OS concatenation of two crippled sub-threshold shards (`cat part1 + junk + part3`) heals super-additively back to Stratum 3; raw concatenation of an amputated host binary (`AEGIS_DRIFT`) with a foreign species (`SYNTH_REACTOR`, `CIPHER_VAULT`, or `QUANTUM_CHRONICLE`) dynamically transplants ABI-verified `LOGIC`, `RENDERER`, `AUDIO`, and `FX` organs at runtime, producing a playable hybrid Chimera exportable as its own self-healing `.hbin` binary.

---

## 2. v2.2.0 Full-Stack 5-Layer Adversarial Audit & Hardening Matrix

Following `v2.1.0`, PLANARIA underwent a deep-dive comparative adversarial audit across breadth, depth, layers, margins, substrates, and boundaries. Every critical/high defect, security hole, proof gap, and UX edge case discovered was resolved and locked behind automated regression tests (Suites 17–24) and expanded Lean 4 kernel theorems (38 → 62):

| Audit Layer | Key Vulnerabilities, Bugs & Blindspots Discovered | Remediation Shipped in `v2.2.0` | Verification Lock |
|---|---|---|---|
| **Layer 1: Coding, Crypto & `.hbin`** | Overlap-Eclipse sync-word desync; 256-cell Sybil header forgery; unpinned quorum tie/singleton hijack; unpinned Xenograft sovereignty bypass; SHA-256 32-bit `paddedLen` overflow & empty-leaf `0x00` domain overlap; `irradiateCells(>508)` infinite loop; `gfPow(0, -1)` silent `1`; overlapping `LINBIN01` sections | Byte-granular sliding scan + ±512 B cadence flywheel + DoS scan caps; canonical `BUNDLE_SPECS`/`PLACEMENT_SCHEDULE` header invariants; `>= 2` strict unique quorum & fail-closed ties; `xenograftBlockedUnpinned` sovereignty guard; streaming SHA-256 + `0x02` `EMPTY_LEAF_HASH`; clamped Fisher-Yates; `GF_MUL_TABLE` + strict guards; strict `LINBIN01` overlap rejection | Suites 01–07, 17, 18 |
| **Layer 2: `Plang` Compiler & `PVM-32`** | `OP.CALL`/`OP.RET` clobbered caller registers; `ORGAN_CALL` ascending scan; Bundle 6 (`GENOME`) executable if non-empty; unclipped `_line` & unbounded `VOICE.detune`; silent lexer/parser errors (unterminated `/*`, `123abc`, >32-bit int, div-by-0 const, duplicate `fn`, arity mismatch, double-eval `mem[f()] += v`); cross-species `S1_CORE_LOGIC` graft stale RAM | Caller-windowed register save/restore; descending-stratum `ORGAN_CALL`; `bundleCode[6] === null`; Liang-Barsky clipped `_line`; clamped `[-2400, 2400]` detune; strict compiler diagnostics + unary `~` + single-eval `MemCompoundAssign` + `ADDI` peephole; `SPECIES_MAGIC` sentinel in `mem[15]` across all 4 `.plang` species | Suites 08–10, 19, 20 |
| **Layer 3: Quantum, Temporal, 3D WebGL2 & Audio** | `game3d.js` rewind dropped `n.speed` (NaN softlock) & state fields; `O(N)` `Array.shift()` history; `makePyramid()` inverted winding & non-uniform normal matrix; WebGL `pow(0)` NaN & degenerate wireframe EBOs; fake 1-basis CHSH; 32-bit lineage ID collisions; AudioWorklet race/aliasing/DC drift; 2D visuals DPR blur & bogus `[2,3]` edge | `O(1)` circular `RingBuffer` deep rewind (all NPC/stage/cooldown/Chrono-Well fields); outward CCW pyramid winding + `transpose(inverse(mat3(uModel)))` + deduplicated wireframe EBOs + `webglcontextlost`/`dispose()`; Horodecki 3×3 CHSH & 4-qubit Mermin GHZ (`|M_4|=4.0`); 128-bit `sfc32` & 64-bit `XXXX-XXXX-XXXX-XXXX` IDs (`6,421,059,993,600` exact space); PolyBLEP + DC-blocker + denormal flush; HiDPI DPR visuals | Suites 11–16, 21 |
| **Layer 4: Server, CLI, Studio UI & Build** | Reflected XSS in `server.mjs` `404` + missing CSP/symlink containment/dotfile block; 7 unescaped `innerHTML` sinks in `app.js`; stale `pinnedRootHex` post-Chimera shredding crash (`W-01`); missing CLI `fuse`/`--pinned`/validation; `benchmark.mjs` ephemeral Ed25519 mislabeling & missing artifact parity check | `realpathSync` + public allowlist + static `404` + full CSP/COOP/CORP headers; zero `innerHTML` sinks (`textContent`/DOM nodes); cleared `pinnedRootHex` on Chimera mint + ARIA/focus-visible/reduced-motion/SVG favicon; schema-validated CLI + `fuse`/`--pinned`; honest Ephemeral Ed25519 Self-Consistency Seal (`PLANARIA_SIGNING_KEY_PEM` override) + 44-file attestation | Suites 22–24 + live browser check |
| **Layer 5: Pure Lean 4 Proofs & Paper/CI** | 38→62 proof gaps: only small-instance `gfMul` checks, missing concrete `Char2Field (Fin 256)`, float `PLACEMENT_SCHEDULE` unproved, missing 7-bundle/equal-storage `RS(192,48)` separation, missing byte-list Hamming / 17B–18B negative bounds / Sybil counterexample / `BitVec 32` / 4-qubit unitarity / `RingBuffer` / exact `6.42T` arithmetic; CI grep check | **62/62 audited pure Lean 4 theorems** (0 warnings, 0 `sorryAx`, 0 `native_decide`): exhaustive 65,536-pair & 16,777,216-triple `gfMul`, exact integer `planaria_schedule_exact_halves`, `RS(192,48)` separation, tight 16/17/18 B & Sybil theorems, `BitVec 32`, 4-qubit 16-amp unitarity, bounded 360-frame `RingBuffer`, exact `6,421,059,993,600` proof; Python strict 62-theorem allowlist CI gate; crisp 8-page Tectonic PDF | `lake build` (62/62) + CI 3/3 jobs GREEN |

---

## 3. Deep Technical Architecture Audit (Byte-by-Byte)

### 3.1 Subsystem Topology

```text
  [.plang Source (4 Living Species)]
        │
        ▼  src/compiler/{lexer,parser,codegen,compile}.js
  [6 Organ-Stratum Bytecode Bundles (PVM-32 32-bit ISA) + S3_GENOME_LEDGER]
        │
        ▼  src/core/cauchy.js  (GF(2^8) 0x11D Cauchy MDS + GF_MUL_TABLE)
  [192 Holographic Coded Shards (332B payload + 16B header = 348B leaf)]
        │
        ▼  src/core/sha256.js  (Depth-8 Domain-Separated 0x00/0x01/0x02 Merkle Tree)
  [192 Cells × (348B leaf + 128B Merkle Proof = 476B body)]
        │
        ▼  src/core/rs.js      (2-Way Interleaved RS(254, 238) + 4B Fuzzy Sync)
  [98,304-byte .hbin Binary — Zero Header, Exact-Integer Low-Discrepancy Interleaved]
        │
        ▼  Physical Torture / Mitosis / Radiation / Overlap-Eclipse / Trojans / Xenograft
        │
        ▼  src/core/hbin.js :: decodeHbin()
  [Overlap-Eclipse Sliding Correlator -> RS(254,238) Self-Healer -> Header Invariant Check
   -> Merkle Quarantine / Quorum -> Cauchy GF(2^8) Gauss-Jordan Decoder -> ABI Xenograft]
        │
        ▼  src/vm/pvm32.js :: PVM32 (Caller-Windowed + Hot-Swap Anastomosis Dispatch)
  [Live 60 FPS WebGL2 3D Quantum Arena + 160x120 Phosphor Scope + 48 kHz PolyBLEP AudioWorklet]
```

### 3.2 Byte-Budget Verification of the 512-Byte Cell

- `4 B` Sync Word (`0x50 0x4C 0x4E 0xB7`) — outside RS protection, protected directly by Hamming-distance-3 fuzzy matching (`syncBitDistance <= 3`) with byte-granular Overlap-Eclipse recovery.
- `476 B` Armored Body = `16 B` Header + `332 B` Cauchy Payload + `128 B` Depth-8 Merkle Proof.
- `32 B` Interleaved RS Parity = `16 B` even-lane parity + `16 B` odd-lane parity (`2 × RS(254, 238)` covering exact `2 × 238 = 476` data bytes + `2 × 16 = 32` parity bytes = `508 B`).
- `4 + 476 + 32 = 512 B` exact. Zero wasted padding bytes inside the cell envelope (formally checked in `MitosisBounds.lean`).

---

## 4. Coding-Theoretic & Cryptographic Analysis

### 4.1 Why Cauchy Matrices Beat Vandermonde over $\text{GF}(2^8)$

A classic pitfall in erasure-coding engineering is assuming that any Vandermonde matrix truncated to a systematic form $[I_k \mid V]$ over $\text{GF}(2^8)$ is MDS. In fact, systematic Vandermonde constructions over $\text{GF}(2^8)$ can contain singular $k \times k$ submatrices for $k \ge 4$. PLANARIA eliminates this defect structurally by using **pure Cauchy matrices** $C_{i,j} = (x_i \oplus y_j)^{-1}$ with $Y = \{0..k-1\}$ and $X = \{k..k+n-1\}$. Because $\max(k + n) = 16 + 40 = 56 \le 256$, coordinate disjointness holds with enormous margin, and every $k \times k$ submatrix is strictly invertible.

### 4.2 Inner RS(254, 238) Exactness & Syndrome Recheck

Our Berlekamp-Massey + Chien + Forney decoder (`src/core/rs.js`) includes four critical hardening guards:
1. Degree bound rejection ($\nu = 0$ or $\nu > 8$).
2. Exact Chien root multiplicity check (`positions.length === degree`).
3. Forney nonzero magnitude verification (`forney_zero_magnitude` rejection).
4. Mandatory post-correction re-evaluation of all 16 syndromes (`recheck.hasError === false`).

As verified empirically in `results/benchmarks.json` (`radiationSweep`), this yields a **razor-sharp transition**: 192/192 cells healed at `burstBytesPerCell = 16`, and **0/192 cells miscorrected** at `burstBytesPerCell = 18, 20, 22`.

### 4.3 Why Byzantine Quarantine MUST Precede Cauchy Decoding

Experiment 3 (`byzantineAudit` in `results/benchmarks.json`) quantifies the exact amplification factor of an unauthenticated MDS decoder: injecting **1 single RS-valid Trojan cell** ahead of authentic cells when `disableImmuneSystem: true` corrupts **470 out of 472 bytes (99.6%)** of `S0_STEM_NUCLEUS` (and up to **472/472 = 100.0%** at 60 Trojans)! Because Gaussian elimination spreads one bad input vector linearly across all $k$ output chunks, **cryptographic authentication MUST happen per coded cell BEFORE linear inversion**, not merely on the final reassembled binary. PLANARIA embeds a complete 128-byte Depth-8 SHA-256-128 Merkle proof *inside every single cell*, guaranteeing zero contamination prior to inversion (formally proved in `ByzantineImmune.lean`).

---

## 5. Compiler & Virtual Machine Engineering Deep Dive (`Plang` & `PVM-32`)

### 5.1 Compiler Optimization Impact

Without register reclamation and peephole optimizations, `AEGIS_DRIFT`'s `S1_CORE_LOGIC` exceeded its $k=4$ (`1,328 B`) budget. Implementing five real compiler passes in `src/compiler/codegen.js`:
1. Lexical block-scope register reclamation (`r18..r31`);
2. Direct-to-ABI call-argument emission (`containsCall` check);
3. Base+offset `LDW`/`STW` and `ADDI` immediate folding;
4. Single-evaluation `MemCompoundAssign` (`mem[expr] += rhs`) lowering;
5. Direct conditional branch lowering (`compileCondJumpFalse`);

packs `AEGIS_DRIFT`'s `S1_CORE_LOGIC` (including its `v2.2.0` `SPECIES_MAGIC` sentinel logic!) into **exact 1,328 / 1,328 B (332 instructions, 100.0% utilization)** and `S0_STEM_NUCLEUS` into **472 / 664 B (118 instructions, 71.1% utilization)** — allowing all four interactive programs to keep exact power-of-two Stratum 0/1/2/3 recovery thresholds ($k \in \{2, 4, 8, 16\}$).

### 5.2 `PVM-32` Safety Guarantees

| Safety Vector | Runtime Enforcement (`src/vm/pvm32.js`) | Formal Proof (`lean/PlanariaProofs/XenograftABI.lean`) |
|---|---|---|
| Out-of-bounds RAM read/write | Signed 32-bit `(rs1 + imm16) & 0xFFF` | `pvm32_ram_bounds_invariant` (`BitVec 32`, zero axioms!) |
| Infinite loop / DoS in xenografted organ | Per-frame `budget.remaining` decrement (`16,000` cap, single trap) | `pvm32_bounded_termination` |
| Call-stack overflow / register clobber | Caller-windowed register save/restore; hardware call stack capped at `32` | Verified in Suite 20 |
| Illegal opcode or B6 code execution | Explicit `default:` trap counter; `bundleCode[6] === null` | Verified in Suites 08 & 20 |
| Host identity hijack by donor | `B0` (`KERNEL`) and `B6` (`GENOME`) forced non-xenograftable even on forged flags | `xenograft_preserves_sovereignty` |
| Incompatible organ transplant | Exact 16-bit `abiSig` match enforced before grafting | `xenograft_abi_safety` |

---

## 6. Functional Analysis of the Four Living Species, 3D Quantum Engine & Chimeric Xenografts

| Species | Source | Compiled `.hbin` | Total Insns | Code Bytes | Interactive Behavior & Visual/Acoustic Degradation Profile |
|---|---|---|---:|---:|---|
| **`QUANTUM_CHRONICLE`** | `programs/quantum_chronicle.plang` | `artifacts/quantum_chronicle.hbin` | 426 | 1,704 B | Flagship 3D Temporal-Quantum WebGL2 co-processor driving 4-qubit gate schedules, Bell/GHZ entanglement pulses, Chrono-Well dilation telemetry, and PolyBLEP harmonic synth. |
| **`AEGIS_DRIFT`** | `programs/aegis_drift.plang` | `artifacts/aegis_drift.hbin` | 991 | 3,964 B | Playable 60 FPS neon vector starfighter survival game (WASD/Arrows + Space or Autopilot). Degrades: S3 Starfield+Shrapnel+Shield Halo+4-voice synthwave → S2 Neon vector sprites → S1 Tactical radar wireframe → S0 Ghost distress triangle & 1-bit heartbeat. |
| **`SYNTH_REACTOR`** | `programs/synth_reactor.plang` | `artifacts/synth_reactor.hbin` | 645 | 2,580 B | 4-voice Lydian polyphonic synthesizer + phosphor-trailed Lissajous harmonic reactor. Arrows bend frequency ratios. Degrades: S3 Containment rings+8-band spectrum+4-voice chord engine → S2 Lissajous plasma web → S1 Green oscilloscope grid → S0 Central pulse ring. |
| **`CIPHER_VAULT`** | `programs/cipher_vault.plang` | `artifacts/cipher_vault.hbin` | 534 | 2,136 B | Live 12-lane 32-bit ARX stream-cipher & cryptographic avalanche bit-matrix + pentatonic keystream sonification. Degrades: S3 Rotating lock ring+entropy ribbon → S2 12×8 avalanche bit-matrix → S1 Parity bars → S0 Emergency lockdown cross. |
| **Chimera (`AEGIS x SYNTH`)** | Spliced live | Exportable 96 KiB `.hbin` | Mixed | Mixed | Runs `AEGIS_DRIFT`'s gameplay & enemy collisions through `SYNTH_REACTOR`'s Lissajous harmonic phase-web renderer and 4-voice Lydian FM synth engine (or even `S1_CORE_LOGIC` grafts via `SPECIES_MAGIC`!) — zero traps, full 50/50 Mitosis preserved! |

### 6.1 3D Temporal-Quantum WebGL2 Engine (`src/quantum/`, `src/world/`, `src/web/`)

- **Exact 4-Qubit Statevector Engine (`src/quantum/qengine.js`)**: 16 complex amplitudes supporting `X`, `Y`, `Z`, `H`, `S`, `T`, `RX`, `RY`, `RZ`, `CNOT`, `CZ`, `SWAP`, Born-rule measurement collapse, rotation-invariant Horodecki 3×3 tensor Bell-CHSH ($S_{\max} = 2\sqrt{2}$), and 4-qubit Mermin GHZ ($|M_4| = 4.0$).
- **$O(1)$ Reversible Temporal Rewind (`src/quantum/temporal.js`)**: 360-frame circular `RingBuffer` capturing complete player, NPC (`speed`, `mitosisDone`, coordinates, HP), stage, cooldown, Chrono-Well, Echo-Clone, and quantum snapshots with exact lockstep trail restoration.
- **Deterministic 1/1 Combinatorial Forge (`src/world/generator.js`)**: 128-bit SHA-256 `sfc32` PRNG and 64-bit `XXXX-XXXX-XXXX-XXXX` lineage IDs spanning an exact Lean-verified **`6,421,059,993,600`** reachable Weapon × Armor × NPC cross-product across 24 spatial orders of magnitude.

---

## 7. Computational Performance, Latency & Memory Profiling

Measured on Node.js `v25.8.2` (`results/benchmarks.json`, warm-JIT steady state):
- **Full 96 KiB Decode Latency**: **`8.96 ms`** mean (25-iteration steady state, accelerated by precomputed `GF_MUL_TABLE`) — fast enough to re-decode a live 192-cell binary interactively on every surgical drag or button click without stutter.
- **Dual Mitosis Decode + Bit-Exact Regeneration**: **`21.07–27.06 ms`** combined for BOTH disjoint halves across all 6 aligned and unaligned prime offsets.
- **Compile All 4 Species**: **`61.59 ms`** total end-to-end (`Plang` → `PVM-32` → Cauchy → Depth-8 Merkle → 384 RS codewords → `98,304 B` `.hbin`).
- **`PVM-32` Virtual Machine Throughput**: **`0.082 ms/frame`** (**`27.02 MIPS`**, **`12,195 FPS`** headless ceiling; `< 0.5%` of a 16.67 ms 60 FPS frame budget).
- **AudioWorklet DSP**: Lock-free 48 kHz stereo PolyBLEP synthesis with per-sample amplitude slewing (`0.008`), one-pole lowpass filtering, master DC-blocking highpass, and denormal flushing — zero GC allocations inside `process()`.

---

## 8. Formal Verification & Falsification Audit Summary

1. **Lean 4 Kernel Proofs (`lean/`)**: **62/62 theorems built cleanly** under `leanprover/lean4:v4.35.0`, zero warnings, zero `sorryAx`, zero `native_decide`/`trustCompiler`, strictly within `{propext, Classical.choice, Quot.sound}` ([results/lean4-audit.txt](../results/lean4-audit.txt)).
2. **Executable Falsification & Security Suite (`test/verify.mjs`)**: **24/24 suites passed**, validating both positive survival invariants AND tight negative Popperian failure boundaries (1-bit linear death, $k-1$ Cauchy failure, $e=10>8$ RS rejection, 18 B burst failure, Overlap-Eclipse Trojan deflection, single-Trojan poisoning under `disableImmuneSystem: true`, unpinned tie fail-closed, `BitVec` & `PVM-32` traps, Game3D rewind non-NaN, all 9 CLI subcommands, live `server.mjs` HTTP security/XSS/traversal defense, and on-disk artifact determinism).
3. **Browser Studio Verification**: Verified live against the hardened `server.mjs` at `http://127.0.0.1:4174` across 3D WebGL2 rendering, Rewind, Mitosis, and Chimera+Heal+Shred with **zero JS console errors, zero failed network fetches, and zero VM traps**.
4. **Cryptographic Attestation**: [results/attestation.json](../results/attestation.json) binds SHA-256 digests of 44 repository artifacts (all core/compiler/VM/quantum/world/web source files, 4 `.plang` sources, 4 `.hbin` binaries, 7 Lean proof files, frozen 8-page PDF & arXiv tarball, and `results/benchmarks.json`) under a verified Ed25519 self-consistency seal (`selfVerified: true`).

---

## 9. Operational Manual: CLI, Interactive Studio, CI & Reproduction Playbook

### Quick Operations Cheat Sheet

| Goal | Exact Command |
|---|---|
| Compile all 4 `.plang` sources → `.hbin` + verify round-trip | `npm run build` |
| Run 24-suite falsifiable verification & security harness | `npm test` |
| Run full Monte Carlo survival benchmarks & Ed25519 attestation | `npm run benchmark` |
| Launch 60 FPS WebGL2 + 48 kHz Surgical Vivisection Studio | `npm start` → open `http://127.0.0.1:4174` |
| Clean-build & audit all 62 Lean 4 theorems | `npm run verify:lean` (or `cd lean && lake clean && lake build`) |
| Inspect any `.hbin` (damaged, shifted, or poisoned) | `node bin/planaria.mjs inspect <file.hbin>` |
| Perform unaligned 50/50 Planarian Mitosis on disk | `node bin/planaria.mjs bisect artifacts/aegis_drift.hbin L.hbin R.hbin --offset 49177` |
| Fuse multiple damaged shards via raw concatenation | `node bin/planaria.mjs fuse shardA.hbin shardB.hbin -o fused.hbin` |
| Heal a damaged shard back to 100% (with pinned root) | `node bin/planaria.mjs heal R.hbin -o healed.hbin --pinned <rootHex>` |
| Forge & execute a standalone Cross-Species Chimera | `node bin/planaria.mjs xenograft artifacts/aegis_drift.hbin artifacts/synth_reactor.hbin -o chimera.hbin && node bin/planaria.mjs run chimera.hbin --frames 60` |
| Disassemble any surviving organ bundle (or inspect B6 JSON) | `node bin/planaria.mjs disasm artifacts/aegis_drift.hbin --bundle 0 --max 32` |

---

## 10. Failure Modes, Edge Cases & Honest Engineering Limitations

1. **Below-S0 Extinction ($< 2$ Stratum-0 cells)**: When total survival falls below ~4% (fewer than 2 surviving cells in `B0`), even the Stem Nucleus loses rank and the organism transitions cleanly to `CELL DEATH` (observed in 67.5% of trials at 96% file obliteration).
2. **Excessive Radiation Beyond 16B Contiguous Burst**: At 18+ consecutive corrupted bytes in *every* single cell simultaneously, both RS lanes receive $\ge 9 > 8$ errors and cleanly reject every cell (0 miscorrections). Localized >16B craters affecting *some* cells (rather than all 192 simultaneously) are seamlessly absorbed by the outer Cauchy MDS layer.
3. **Sync-Word Burst Destruction**: Because the 4-byte sync word lies outside RS parity and uses Hamming-3 fuzzy matching, corrupting all 4 bytes of a cell's sync word causes that single cell to be skipped by the sliding correlator (absorbed as an erasure by the outer Cauchy layer).
4. **Unpinned Majority-Sybil Trade-Off**: Without a pinned 128-bit root, a self-consistent forged lineage strictly outnumbering genuine surviving cells can win unpinned quorum election (formally proved in `ByzantineImmune.lean`). Always pass `--pinned` when booting from untrusted channels.

---

## 11. Future Research Roadmap

- **Hardware / Native Target Backend**: Extending `Plang` codegen to emit progressive holographic RISC-V (`RV32IM`) or WebAssembly (`wasm32`) cellular micro-modules alongside `PVM-32`.
- **Full 256-Bit Merkle Cells (1,024 B Sector Mode)**: Eliminating 128-bit truncation for post-quantum / $2^{128}$ collision resistance against untrusted compilers.
- **Peer-to-Peer Cellular Anastomosis**: Streaming missing Cauchy evaluation points opportunistically over WebRTC/UDP gossip so damaged binaries autonomously scavenge missing cells from passing peers.
- **Verified Codegen Extraction**: Formally proving `Plang` compiler pass preservation in Lean 4 directly down to `PVM-32` small-step semantics.
