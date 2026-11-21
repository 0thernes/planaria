# PLANARIA: Progressive Holographic Executable Architecture (`.hbin`), Multi-Stratum Compilation, Autonomous Control-Flow Anastomosis, and Cryptographic Cellular Quorum

**Technical Research White Paper (Preprint v2.1.0 — Frozen PDF: [`dist/Donahue_2026_planaria.pdf`](../dist/Donahue_2026_planaria.pdf))**  
**Author:** Alexander Stephen Donahue ([0thernes LLC](https://0thernes.art) · `0_0@0thernes.art` · ORCID [0009-0006-8168-9648](https://orcid.org/0009-0006-8168-9648))  
**Date:** November 21, 2026  
**Repository:** `https://github.com/0thernes/planaria`  
**License:** Cosmogonic License — Non-Commercial Research & Play ([LICENSE](../LICENSE))

---

## Abstract

For eighty years, compiled computer executables (`ELF`, `PE`, `Mach-O`, `WebAssembly`) have obeyed a brittle monolithic topology: destroying the byte-0 file header, slicing a binary in half, flipping a single bit in an active code page, or injecting a forged chunk causes immediate catastrophic loader failure or silent control-flow corruption. Conventional single-rate erasure coding (such as wrapping a binary inside a flat $(n, k)$ Reed-Solomon archive) replaces fragility with a rigid **erasure cliff** — 100% recovery at $k$ surviving shards and 0% execution at $k - 1$ — while exposing outer finite-field Gaussian elimination to catastrophic **single-cell Byzantine decoder poisoning**.

We present **PLANARIA**, a complete, zero-dependency, end-to-end executable architecture demonstrating **Progressive Holographic Instruction Stratification (PHIS)**. PLANARIA integrates: (1) a headerless, self-synchronizing 512-byte cellular binary format (`.hbin`, 192 cells = 98,304 bytes) combining 2-way interleaved inner `RS(254, 238)` Berlekamp-Massey/Chien/Forney byte-error correction, Depth-8 domain-separated SHA-256-128 Merkle cell authentication, and outer Cauchy-matrix MDS erasure coding over $\text{GF}(2^8)$ (`0x11D`); (2) a structured multi-stratum systems language and compiler (`Plang`); (3) a sandboxed 32-bit register virtual machine (`PVM-32`) with a native `ORGAN_CALL` **Control-Flow Anastomosis** dispatcher and standardized Shared-Memory World-State ABI; and (4) **31 pure Lean 4 (`v4.35.0`) machine-checked proofs** (zero Mathlib, zero `sorryAx`, zero `native_decide`).

Across three real compiled 60 FPS interactive executables (`AEGIS_DRIFT`, `SYNTH_REACTOR`, `CIPHER_VAULT`), PLANARIA empirically demonstrates: **zero-overlap unaligned 50/50 Planarian Binary Mitosis** (both halves independently boot at full fidelity and regenerate the 100% SHA-256 bit-exact 98,304-byte original in ~21 ms); **100% survival at 72% erasure, 97.5% at 80% erasure, and 70.0% at 92% erasure** (versus 0.0% for both monolithic linear and single-stratum `RS(40,16)` cliff controls); **100% recovery from simultaneous 16-byte contiguous burst radiation inside all 192 cells** (3,072 corrupted bytes = 3.13% file-wide error rate); **100% quarantine of RS-valid Byzantine Trojan cells** (versus 415/416-byte kernel poisoning without Merkle quarantine); and **live ABI-verified Cross-Species Executable Xenografting**.

---

## Table of Contents

1. [Introduction & Problem Formulation](#1-introduction--problem-formulation)
2. [Design Goals & Formal Threat Model](#2-design-goals--formal-threat-model)
3. [The `.hbin` v1.0 Cellular Holographic Binary Specification](#3-the-hbin-v10-cellular-holographic-binary-specification)
4. [Dual-Layer Algebraic Coding: Inner Interleaved `RS(254, 238)` & Outer Cauchy MDS](#4-dual-layer-algebraic-coding-inner-interleaved-rs254-238--outer-cauchy-mds)
5. [Cryptographic Cellular Immune System & Byzantine Quarantine](#5-cryptographic-cellular-immune-system--byzantine-quarantine)
6. [The `Plang` Multi-Stratum Compiler & `PVM-32` Anastomosis Virtual Machine](#6-the-plang-multi-stratum-compiler--pvm-32-anastomosis-virtual-machine)
7. [Cross-Species Executable Xenografting & Standardized World-State ABI](#7-cross-species-executable-xenografting--standardized-world-state-abi)
8. [Formal Machine-Checked Proofs in Pure Lean 4 (`v4.35.0`)](#8-formal-machine-checked-proofs-in-pure-lean-4-v4350)
9. [Empirical Benchmarks, Survival Phase-Transition & Popperian Falsification](#9-empirical-benchmarks-survival-phase-transition--popperian-falsification)
10. [Security Analysis & Known Limitations](#10-security-analysis--known-limitations)
11. [Honest Novelty Assessment: Established Primitives vs. Original Architecture](#11-honest-novelty-assessment-established-primitives-vs-original-architecture)
12. [Cited Primary Sources & References](#12-cited-primary-sources--references)

---

## 1. Introduction & Problem Formulation

Classical executable formats are engineered for reliable, byte-addressable storage where a file header at offset `0` describes fixed virtual memory mappings (`.text`, `.rodata`, `.data`, relocation tables, and entry pointers). That layout maximizes load speed on intact media, but exhibits **zero topological resilience**:

1. **Header Single Point of Failure**: Destroying bytes `0..63` or prepending even 1 byte of unaligned garbage prevents the OS loader from parsing the file, even if 99.9% of the machine instructions remain intact.
2. **All-or-Nothing Erasure Cliff**: Applying standard $(n, k)$ Maximum Distance Separable (MDS) erasure coding uniformly across an entire binary eliminates localized failure above $k/n$ survival, yet produces an abrupt phase transition: at $k - 1$ surviving shards, **zero instructions can be decoded** and execution availability plunges discontinuously from 100% to 0%.
3. **Byzantine Amplification in Linear Erasure Decoders**: Solving $D = M^{-1} P$ over $\text{GF}(2^8)$ mixes every input row across every output block. If an adversary injects even **one** syntactically valid forged shard with a colliding evaluation coordinate, Gaussian elimination spreads that corruption across **nearly 100% of the reconstructed machine code**.
4. **Rigid Monolithic Organ Coupling**: Traditional binaries cannot live-amputate a damaged rendering or audio subsystem, dynamically reroute control flow onto a surviving low-resolution stem fallback without process restart, or splice compatible subsystems from a second executable at raw byte level.

Biological planarian flatworms (*Schmidtea mediterranea*) and optical holograms operate on an inverted structural principle: **distributed spatial redundancy coupled with progressive resolution**. Slice a planarian flatworm in half, and both zero-overlap fragments regenerate complete organisms; shatter a hologram, and small surviving fragments still project the entire scene at reduced resolution rather than blacking out completely. **PLANARIA** translates this principle into an actual compiled executable container, language compiler, 32-bit virtual machine, and formally verified systems specification.

---

## 2. Design Goals & Formal Threat Model

PLANARIA targets five simultaneous operational guarantees over raw, untrusted byte streams:

| Requirement | Concrete Operational Target |
|---|---|
| **G1 — Zero-Header Framing** | Boot from arbitrary unaligned byte offsets (`offset mod 512 ≠ 0`), noise-padded streams, shuffled cell orders, and raw OS concatenations (`cat shardA shardB`). |
| **G2 — Zero-Overlap Mitosis** | Any 50/50 physical bisection (aligned or unaligned prime cut) must allow BOTH disjoint halves to boot at Stratum 3 and re-emit a 100% SHA-256 bit-exact replica of the original `.hbin`. |
| **G3 — Zero-Cliff Degradation** | Graceful execution across 4 capability strata (`S3 -> S2 -> S1 -> S0 Ghost`) surviving up to ~88–92% total file destruction without unhandled VM traps. |
| **G4 — Dual-Layer & Byzantine Defense** | Heal up to 16 contiguous corrupted bytes inside *every* 512-byte cell simultaneously, and quarantine 100% of RS-valid forged Byzantine cells before outer Cauchy decoding. |
| **G5 — Safe Chimeric Splicing** | Permit ABI-verified organ transplantation across distinct `.plang` species while preserving host Kernel/Genome sovereignty, RAM bounds (`< 4096` words), and bounded cycle termination. |

**Adversary Model**: We consider both (a) **benign physical media hazards** (random erasure, truncation, unaligned offsets, chunk reordering, contiguous 16-byte radiation bursts across all cells) and (b) an **active Byzantine injector** who knows the complete `.hbin` specification, knows the target `bundleId`/`evalX` coordinates, constructs valid 2-way interleaved `RS(254, 238)` parity (zero RS syndrome errors), and prepends malicious forged cells ahead of authentic cells to maximize poisoning probability. The adversary is computationally bounded (cannot invert FIPS 180-4 SHA-256 truncated to 128 bits, preserving $2^{128}$ second-preimage resistance and $2^{64}$ collision resistance).

---

## 3. The `.hbin` v1.0 Cellular Holographic Binary Specification

A pristine PLANARIA executable is exactly **98,304 bytes (96 KiB)**, consisting of **192 fixed 512-byte Holographic Cells** (`src/core/hbin.js`). There is no file header, footer, or central directory.

### 3.1 Byte-Exact 512-Byte Cell Anatomy

| Byte Range | Length | Field | Purpose & Cryptographic / ECC Coverage |
|---|---|---|---|
| `0..3` | 4 B | `SYNC_WORD` | Fixed marker `0x50 0x4C 0x4E 0xB7` (`PLN\xB7`); fuzzy-matched up to Hamming distance $\le 3$ bits |
| `4..19` | 16 B | `CellHeader` | `version(1)`, `bundleId(1)`, `stratum(1)`, `organId(1)`, `abiSig(2)`, `evalX(1)`, `k(1)`, `n(1)`, `flags(1)`, `leafIdx(2)`, `origLen(2)`, `speciesTag(2)` — **Merkle-committed + RS-armored** |
| `20..351` | 332 B | `CodedPayload` | $\text{GF}(2^8)$ Cauchy MDS linear combination of $k$ source chunks — **Merkle-committed + RS-armored** |
| `352..479` | 128 B | `MerkleProof` | Depth-8 sibling path (`8 × 16 B` truncated SHA-256 hashes) — **RS-armored** |
| `480..511` | 32 B | `InnerRSParity` | Two interleaved 16-byte `RS(254, 238)` parity blocks covering even & odd bytes of `4..479` |

### 3.2 Seven-Bundle Progressive Stratification Table

Every `.hbin` v1.0 binary partitions compiled machine code and self-regenerating metadata into 7 independent Cauchy MDS bundles:

| Bundle | Name | Organ | Stratum | ABI Sig | $k$ | $n$ | Max Payload | Code Rate | Erasure Tolerance | Xenograftable |
|---|---|---|---|---|---|---|---|---|---|---|
| `B0` | `S0_STEM_NUCLEUS` | `KERNEL` (0) | `S0` | `0x0101` | 2 | 24 | 664 B | 8.3% | **91.7%** | No (Sovereign) |
| `B1` | `S1_CORE_LOGIC` | `LOGIC` (1) | `S1` | `0x0201` | 4 | 24 | 1,328 B | 16.7% | **83.3%** | Yes |
| `B2` | `S1_WIREFRAME` | `RENDERER` (2) | `S1` | `0x0301` | 4 | 24 | 1,328 B | 16.7% | **83.3%** | Yes |
| `B3` | `S2_CORTEX_RENDER` | `RENDERER` (2) | `S2` | `0x0302` | 8 | 32 | 2,656 B | 25.0% | **75.0%** | Yes |
| `B4` | `S2_SYNTH_AUDIO` | `AUDIO` (3) | `S2` | `0x0402` | 6 | 24 | 1,992 B | 25.0% | **75.0%** | Yes |
| `B5` | `S3_ORGANISM_FX` | `FX` (4) | `S3` | `0x0503` | 16 | 40 | 5,312 B | 40.0% | **60.0%** | Yes |
| `B6` | `S3_GENOME_LEDGER` | `GENOME` (5) | `S3` | `0x0603` | 8 | 24 | 2,656 B | 33.3% | **66.7%** | No (Sovereign) |
| **Total** | — | — | `S0–S3` | — | **48** | **192** | **15,936 B** | **25.0%** | Progressive | — |

Notice two invariant properties machine-checked in `MitosisBounds.lean`:
1. $\sum_{b=0}^{6} n_b = 192 \le 256 = 2^8$, fitting inside an exact Depth-8 Merkle tree (`leafIdx` $\in \{0..191\}$).
2. Every bundle satisfies $n_b \ge 2 k_b + 4$, exceeding the unaligned mitosis threshold $2 k_b + 2$ by a margin of at least 2 extra cells per half.

### 3.3 Deterministic Low-Discrepancy Physical Placement

Rather than placing bundle cells contiguously (which would allow a 50/50 file cut to wipe out entire bundles), PLANARIA assigns cell $i \in \{0..n_b-1\}$ of bundle $b \in \{0..6\}$ the fractional coordinate:

$$p(b, i) = \frac{i + (b + 0.5)/7}{n_b} \in [0, 1)$$

Sorting all 192 cells by $(p(b, i), b, i)$ interleaves all 7 bundles uniformly across the 96 KiB file. Consequently, **any** 50% contiguous slice captures $\lfloor n_b/2 \rfloor$ or $\lceil n_b/2 \rceil$ cells of every single bundle — and re-running `encodeHbin` on reconstructed bundles reproduces the **100% bit-exact original byte stream**.

---

## 4. Dual-Layer Algebraic Coding: Inner Interleaved `RS(254, 238)` & Outer Cauchy MDS

All finite-field operations run over $\text{GF}(2^8)$ defined modulo the primitive polynomial $P(x) = x^8 + x^4 + x^3 + x^2 + 1$ (`0x11D`) with generator $\alpha = 2$ (`src/core/gf256.js`).

### 4.1 Inner Layer: 2-Way Interleaved `RS(254, 238)`

Each cell's 476-byte body (bytes `4..479`) is de-interleaved into two 238-byte lanes (even offsets and odd offsets). Each lane is systematically encoded with generator polynomial $g(x) = \prod_{i=0}^{15} (x - \alpha^i)$ (`fcr = 0`), appending 16 parity bytes to form a 254-byte codeword ($d_{\min} = 17$, unique correction radius $t = 8$ bytes). The 32 parity bytes are re-interleaved into bytes `480..511`.

During cellular harvesting, `rsDecode()` executes the complete algebraic decoding pipeline:
1. Evaluate all 16 syndromes $S_i = Y(\alpha^i)$ ($i = 0..15$) via Horner's rule.
2. Synthesize the minimal error-locator polynomial $\Lambda(x) = 1 + \sum_{m=1}^{\nu} \Lambda_m x^m$ via **Berlekamp-Massey**. Reject immediately if $\nu > 8$.
3. Run exhaustive **Chien search** across all 254 positions; verify the root count equals $\nu$.
4. Compute $\Omega(x) = (S(x)\Lambda(x)) \bmod x^{16}$ and apply **Forney's formula** (for characteristic 2, `fcr = 0`):
   $$e_k = \frac{X_k \cdot \Omega(X_k^{-1})}{\Lambda'(X_k^{-1})}$$
5. **Mandatory Syndrome Recheck**: Re-evaluate all 16 syndromes on the corrected codeword and reject if any syndrome remains nonzero, preventing silent miscorrection past $t = 8$.

Because bytes are interleaved across even and odd offsets, any contiguous burst error of length $L \le 16$ deposits at most 8 corrupted bytes into each lane (proved universally in Theorem IV.3), guaranteeing **100% healing of any 16-byte contiguous burst inside every single cell**.

### 4.2 Outer Layer: Non-Systematic Cauchy MDS over $\text{GF}(2^8)$

For a bundle with parameters $(k, n)$, the payload is padded to $k \times 332$ bytes into chunks $D_0, \dots, D_{k-1}$. With disjoint coordinate sets $Y = \{0, \dots, k-1\}$ and $X = \{k, \dots, k+n-1\}$ ($k + n \le 56 \ll 256$), cell $i$ carries:

$$P_i = \bigoplus_{j=0}^{k-1} C_{i,j} \cdot D_j, \qquad C_{i,j} = (x_i \oplus y_j)^{-1} \in \text{GF}(2^8)$$

By the Cauchy determinant identity, every $k \times k$ submatrix of $C$ is guaranteed nonsingular over $\text{GF}(2^8)$:

$$\det(C_{I, Y}) = \frac{\prod_{a < b} (x_{i_b} \oplus x_{i_a})(y_b \oplus y_a)}{\prod_{a, b} (x_{i_a} \oplus y_b)} \neq 0$$

Unlike naive Vandermonde matrices over $\text{GF}(2^8)$ (which can encounter singular submatrices for $k \ge 4$), **every** subset of $k$ distinct authenticated cells incursions exact unique inversion via Gauss-Jordan elimination (`invertMatrixGF256`).

---

## 5. Cryptographic Cellular Immune System & Byzantine Quarantine

Each cell's 348-byte commitment $L_s = \text{Header}_{16} \parallel \text{CodedPayload}_{332}$ is hashed using domain-separated FIPS 180-4 SHA-256 truncated to 128 bits (`src/core/sha256.js`):

$$h_{\text{leaf}}(L_s) = \text{SHA256}(\texttt{0x00} \parallel L_s)[0..15], \qquad h_{\text{node}}(u, v) = \text{SHA256}(\texttt{0x01} \parallel u \parallel v)[0..15]$$

Building a Depth-8 binary Merkle tree over all 192 cells (padded to 256 leaves with a fixed empty sentinel hash) yields a single 128-bit **Lineage Merkle Root** $R$. Each cell embeds its 8 sibling nodes (128 bytes) directly inside its RS-armored body.

Upon decoding any raw byte stream, every RS-validated cell recomputes its implied root $\hat{R}_c = \text{EvalMerkle}(L_s, \text{leafIdx}, \text{proof}_{128})$:
- **Pinned-Root Mode**: Accepts cell $c$ iff $\hat{R}_c = R_{\text{pinned}}$. Even if an attacker prepends a 99% flood of self-consistent forged cells from a bogus tree, **100% are quarantined prior to Cauchy decoding**.
- **Unpinned Consensus-Quorum Mode**: Groups harvested cells by $\hat{R}_c$, elects the largest distinct-coordinate quorum as primary organism, quarantines all singleton/forged cells, and optionally inspects coherent secondary quorums ($\ge 4$ cells) as candidate Xenograft donors.

---

## 6. The `Plang` Multi-Stratum Compiler & `PVM-32` Anastomosis Virtual Machine

### 6.1 `Plang` Language & Compiler (`src/compiler/`)

`Plang` is a compact structured systems language supporting compile-time constants, explicit `bundle <NAME> { ... }` blocks, lexical block-scoped `let` variables, `while`/`if`/`else` control flow, ternary expressions, local functions, direct shared-RAM loads/stores (`mem[idx]`), 20 hardware syscalls, and first-class `organ_call(ORGAN, maxStratum)` expressions.

The zero-dependency compiler (`lexer.js` → `parser.js` → `codegen.js` → `compile.js`) implements:
- **Lexical block register reclamation** over 14 local registers (`r18..r31`) and 10 expression scratch registers (`r8..r17`);
- **Direct-to-ABI syscall register emission** when arguments contain no nested calls (eliminating redundant argument-copy instructions);
- **Base+immediate memory folding** (`LDW`/`STW` and `ADDI`) and direct conditional branch emission (`BEQ`/`BNE`/`BLT`/`BGE`), keeping ultra-dense `S0_STEM_NUCLEUS` kernels under 420 bytes.

### 6.2 `PVM-32` Virtual Machine & Hot-Swap Anastomosis (`src/vm/pvm32.js`)

`PVM-32` executes fixed 32-bit little-endian RISC instructions over 32 general-purpose registers (`r0` hardwired zero), a 4,096-word (16 KiB) strictly bounds-masked linear RAM (`addr & 0xFFF`), a 160×120 RGBA32 framebuffer with phosphor decay (`SYSCALL.GLOW`), and a 4-channel polyphonic audio synthesizer register bank driving a lock-free 48 kHz `AudioWorklet`.

When executing `ORGAN_CALL rd, organId, maxStratum`:
1. The Anastomosis Dispatch Table scans all loaded authentic/xenografted bundles matching `organId` with `stratum <= maxStratum`, choosing the highest viable stratum.
2. If found, `PVM-32` executes that bundle inside a fresh register frame sharing the bounded frame instruction budget (`16,000` insns/frame) and call-stack cap (`32`), logging the live vascular route and returning `1`.
3. If all matching bundles are dead/amputated, `ORGAN_CALL` returns `0` cleanly without faulting, allowing `S0_STEM_NUCLEUS` to invoke its built-in emergency fallback reflex (e.g., Ghost wireframe beacon + 1-bit heartbeat).
4. **Live Hot-Swapping**: Calling `vm.loadDecoded(newDecoded, false)` swaps damaged, healed, or xenografted organ code segments **in place** without clearing RAM, preserving live game score, ship coordinates, and cipher state across mid-flight amputations and regrowth!

---

## 7. Cross-Species Executable Xenografting & Standardized World-State ABI

All three compiled living `.plang` species (`AEGIS_DRIFT`, `SYNTH_REACTOR`, `CIPHER_VAULT`) adhere to a unified Shared-Memory World-State ABI:
- `MEM[0..15]`: frame counter, primary score/metric, energy, focal `(x, y)` coordinates, angle, combo/chord, event bitmask (`fire`, `hit`, `pickup/chord`, `alarm`), audio root/tempo, live entropy word, entity count, input mask, init flag.
- `MEM[64..255]`: up to 24 standardized entities (`8` words each: `type, x, y, vx, vy, hp, phase, color`).
- `MEM[256..511]`: 32 shared particles/scope samples.

When a host species suffers organ amputation (e.g., `S2_CORTEX_RENDER` and `S2_SYNTH_AUDIO` destroyed in `AEGIS_DRIFT.hbin`) and raw bytes from a foreign species (e.g., `SYNTH_REACTOR.hbin`) are concatenated onto the byte stream with `allowXenograft: true`:
1. `decodeHbin` preserves **Host Lineage Sovereignty**: Bundles `B0` (`KERNEL`) and `B6` (`GENOME`) are strictly non-xenograftable.
2. Missing xenograftable slots (`B1..B5`) verify exact 16-bit `abiSig` equality (`0x0302`, `0x0402`) against coherent Merkle-authenticated donor clusters before grafting.
3. Calling `regenerateHbin(chimeraDec)` mints a **brand-new standalone 98,304-byte Chimera `.hbin`** with its own fresh Lineage Merkle Root that immediately inherits 50/50 Mitosis, 16-byte burst healing, and Byzantine quarantine!

---

## 8. Formal Machine-Checked Proofs in Pure Lean 4 (`v4.35.0`)

PLANARIA ships a self-contained Lean 4 proof library (`lean/PlanariaProofs/`, zero Mathlib, zero `sorryAx`, zero `native_decide`, zero warnings) auditing **38 machine-checked declarations** across six theorem families ([results/lean4-audit.txt](../results/lean4-audit.txt)):

1. **Theorem I — Exact $\text{GF}(2^8)$ Field & Universal Cauchy 2×2 Nonsingularity (`GF256.lean`)**:
   - `gfMul_inv_exact`: Exhaustively verifies $a \cdot a^{-1} = 1$ in $\text{GF}(2^8)$ modulo `0x11D` for all $a \in \{1..255\}$ inside the Lean kernel.
   - `gf_cauchy2_nonzero_det`: Purely constructive (zero-axiom!) algebraic proof over *any* characteristic-2 field `Char2Field F` that $(x_0 + y_0)^{-1}(x_1 + y_1)^{-1} + (x_0 + y_1)^{-1}(x_1 + y_0)^{-1} \neq 0$ whenever $x_0 \ne x_1, y_0 \ne y_1$ and $\{x_0, x_1\} \cap \{y_0, y_1\} = \emptyset$.
   - `cauchy2_exact_roundtrip`: Kernel-checked bit-exact encode→decode recovery for Stratum-0 pairs.
2. **Theorem II — Planarian Mitosis Thresholds & Unaligned Cut Safety (`MitosisBounds.lean`)**:
   - `mitosis_exact_sufficient` & `mitosis_strict_impossibility`: Tight iff boundary ($N \ge 2k$ sufficient; $N < 2k$ strictly impossible for any disjoint split).
   - `mitosis_unaligned_cut_guarantee`: $N \ge 2k + 2$ guarantees dual recovery under arbitrary unaligned byte cuts; `planaria_all_7_bundles_mitosis_safe` verifies $n_b \ge 2k_b + 4$ across all 7 real `.hbin` bundles.
   - `trisection_synergy_recovery`: Proves Bundle 5's `(13, 13, 14)` trisection leaves every individual shard dead for Stratum 3 while any pair achieves $\ge 26 \ge 16$.
3. **Theorem III — Progressive Stratum Anastomosis & Zero-Cliff Separation (`StratumAnastomosis.lean`)**:
   - `anastomosis_zero_crash_safety`: $b_0 \ge 2 \implies \texttt{resolveRenderer} \neq \texttt{.deadCrash}$.
   - `anastomosis_monotonicity` & `fusion_dominates_parents`: Recovery and raw shard concatenation are strictly monotone.
   - `fusion_strict_synergy_exists` & `zero_cliff_strict_separation`: Constructive zero-axiom proofs of super-additive healing (`S1 + S1 -> S3`) and strict survival separation vs. single-stratum RS cliff codes at 12% survival.
4. **Theorem IV — Inner `RS(254, 238)` 16-Byte Burst & Merkle Byzantine Isolation (`ByzantineImmune.lean`)**:
   - `rs254_238_unique_decoding_radius` & `rs_unique_correction_ball_disjoint`: $d_{\min} = 17$, $t = 8$ disjoint decoding balls via triangle inequality.
   - `interleaved_burst_16_even_odd_bound`: Proves every contiguous burst $L \le 16$ at any offset puts $\le 8$ errors into both even and odd lanes.
   - `merkle_quarantine_zero_contamination`, `merkle_quarantine_preserves_authentic`, & `unauthenticated_poisoning_exists`: Proves 0% Byzantine contamination and 0% authentic false-rejection under hash binding, plus an explicit counterexample showing 1 Trojan poisons an unauthenticated decoder.
5. **Theorem V — `PVM-32` Sandboxing & Xenograft ABI Soundness (`XenograftABI.lean`)**:
   - `pvm32_ram_bounds_invariant` (zero axioms!) & `pvm32_bounded_termination`: Strict `< 4096` RAM confinement and $\le \text{budget}$ step termination.
   - `xenograft_preserves_sovereignty`, `xenograft_abi_safety`, & `xenograft_improves_amputated_host`: Host Kernel/Genome sovereignty and strict ABI preservation.
6. **Theorem VI — Quantum Unitary Norm Conservation, Bijective Rewind & Combinatorial 1/1 Space (`QuantumTemporal.lean`)**:
   - `pauliX_preserves_normSq`, `pauliZ_preserves_normSq`, `cnot_preserves_normSq`, `hadamard_scaled_normSq`: Exact unitary probability norm preservation for discrete quantum gates.
   - `temporal_rewind_exact_left_inv` & `temporal_rewind_exact_right_inv`: Strict bijective step/rewind reversibility (`rewind (advance s) = s` and `advance (rewind s) = s`).
   - `combinatorial_1of1_space_exceeds_6_trillion`: Zero-axiom constructive proof that the discrete Weapon × Armor × NPC forge exceeds $6.8 \times 10^{12}$ unique builds across 24 spatial orders of magnitude before continuous gradients and $2^{64}$ SHA-256 genome seeds.

---

## 9. Empirical Benchmarks, Survival Phase-Transition & Popperian Falsification

All results below were measured reproducibly on Node.js (`scripts/benchmark.mjs`, stored verbatim in [results/benchmarks.json](../results/benchmarks.json)) using `AEGIS_DRIFT.hbin` (98,304 B, 958 instructions) against its exact monolithic Linear Control Twin (`LINBIN01`) and single-stratum `RS(40, 16)` cliff control (40 Monte Carlo trials per erasure level).

### 9.1 Survival Phase-Transition Curve (0%–96% Random File Obliteration)

| Erasure (%) | Surviving (%) | Linear Binary (`LINBIN01`) | Single-Stratum `RS(40,16)` Cliff | **PLANARIA Bootable (%)** | PLANARIA Mean Stratum Score | Stratum Breakdown (`S3 / S2 / S1 / S0` of 40) |
|---:|---:|---:|---:|---:|---:|---|
| 0% | 100% | 100.0% | 100.0% | **100.0%** | 100.0% | `40 / 0 / 0 / 0` |
| 12% | 88% | 32.5% | 100.0% | **100.0%** | 100.0% | `40 / 0 / 0 / 0` |
| 44% | 56% | **0.0%** | 100.0% | **100.0%** | 100.0% | `40 / 0 / 0 / 0` |
| 60% | 40% | **0.0%** | 52.5% | **100.0%** | 87.5% | `20 / 20 / 0 / 0` |
| 72% | 28% | **0.0%** | **0.0%** *(Cliff)* | **100.0%** | 70.0% | `0 / 32 / 8 / 0` |
| 80% | 20% | **0.0%** | **0.0%** | **97.5%** | 54.4% | `0 / 10 / 28 / 1` |
| 84% | 16% | **0.0%** | **0.0%** | **97.5%** | 43.8% | `0 / 2 / 27 / 10` |
| 88% | 12% | **0.0%** | **0.0%** | **82.5%** | 30.6% | `0 / 0 / 16 / 17` |
| 92% | 8% | **0.0%** | **0.0%** | **70.0%** | 21.9% | `0 / 0 / 7 / 21` |
| 96% | 4% | **0.0%** | **0.0%** | **37.5%** | 9.4% | `0 / 0 / 0 / 15` |

### 9.2 Contiguous Burst Radiation Sweep (Applied Simultaneously to ALL 192 Cells)

| Burst Length / Cell | Total Bytes Corrupted | Raw Error Rate | Linear Twin Alive | PLANARIA Repaired Cells | Byte Errors Healed | 100% Bit-Exact Regen |
|---:|---:|---:|:---:|---:|---:|:---:|
| 0 B | 0 B | 0.00% | Yes | 192 / 192 | 0 | **Yes** |
| 2 B | 384 B | 0.39% | **No** | 192 / 192 | 384 | **Yes** |
| 8 B | 1,536 B | 1.56% | **No** | 192 / 192 | 1,536 | **Yes** |
| 14 B | 2,688 B | 2.73% | **No** | 192 / 192 | 2,688 | **Yes** |
| **16 B (Exact Theorem IV.3 Bound)** | **3,072 B** | **3.13%** | **No** | **192 / 192** | **3,072** | **Yes** |
| **18 B (Past Bound — Falsification)** | **3,456 B** | **3.52%** | **No** | **0 / 192** | **0 (0 miscorrections!)** | **No** |

### 9.3 Byzantine Trojan Flood Audit (RS-Valid Forged Cells Prepended)

| Trojans Prepended | Immune ON: Quarantined | Immune ON: 100% Exact SHA-256 | Immune OFF: `S0_STEM_NUCLEUS` Bytes Corrupted |
|---:|---:|:---:|---:|
| 1 | **1 / 1 (100%)** | **Yes** | **415 / 416 B (99.8% Poisoned!)** |
| 5 | **5 / 5 (100%)** | **Yes** | **415 / 416 B (99.8% Poisoned!)** |
| 20 | **20 / 20 (100%)** | **Yes** | **415 / 416 B (99.8% Poisoned!)** |
| 60 | **60 / 60 (100%)** | **Yes** | **415 / 416 B (99.8% Poisoned!)** |
| 192 | **192 / 192 (100%)** | **Yes** | **415 / 416 B (99.8% Poisoned!)** |

### 9.4 Unaligned Bisection Matrix & Runtime Performance

- **Unaligned Bisection**: Across all 6 tested offsets (`49152`, `49153`, `49177`, `48701`, `49597`, `49000`), BOTH disjoint halves regenerated the 100% SHA-256 identical 98,304-byte original in **21.38–33.84 ms** combined.
- **Full 96 KiB Decode Latency**: **10.5 ms** mean (including 192 fuzzy sync checks, 384 RS syndrome passes, 192 Depth-8 SHA-256 Merkle verifications, and 7 Cauchy matrix inversions).
- **`PVM-32` Execution Speed**: **0.12 ms/frame** (**19.45 MIPS**, ~8,333 FPS headless headroom).

---

## 10. Security Analysis & Known Limitations

1. **Unpinned Majority-Sybil Caveat**: In *Pinned-Root Mode*, PLANARIA resists an arbitrarily large Trojan flood (even 100,000 forged cells from a coherent fake Merkle tree). In *Unpinned Consensus-Quorum Mode* (booting an unknown `.hbin` with no out-of-band root), an adversary who injects a *self-consistent* fake lineage containing more valid cells than the surviving genuine shard can win quorum election. Production deployments requiring trustless storage security must pin the 128-bit Lineage Root or verify the Ed25519 manifest signature.
2. **Storage Overhead Trade-Off**: Achieving simultaneous 91.7% Stratum-0 tolerance, 50/50 unaligned Mitosis, 16-byte inner RS burst armor, and 128-byte per-cell Merkle proofs incurs an overall expansion factor of ~25× relative to raw uncoded bytecode (`3,832 B` active code → `98,304 B` `.hbin`). This trade-off is deliberate and tunable via `BUNDLE_SPECS`.
3. **Truncated 128-Bit Merkle Nodes**: Truncating SHA-256 to 128 bits inside the Depth-8 proof gives $2^{128}$ second-preimage resistance (sufficient against cell-forging against a fixed Lineage Root) and $2^{64}$ birthday collision resistance; applications requiring $2^{128}$ collision resistance against malicious compilers can widen cell size to 1,024 bytes with full 256-bit Merkle nodes.
4. **Formal Proof Scope Boundary**: The Lean 4 formalization proves the algebraic, combinatorial, safety, and isolation laws of the specification; it does not formally refine the JavaScript interpreter or V8 runtime via verified extraction.

---

## 11. Honest Novelty Assessment: Established Primitives vs. Original Architecture

- **Established Primitives (Prior Literature)**: $\text{GF}(2^8)$ finite-field arithmetic, Reed-Solomon codes, Berlekamp-Massey/Chien/Forney decoding, Cauchy MDS erasure matrices, Priority Encoding Transmission (Unequal Error Protection), Merkle authentication trees, SHA-256, and Ed25519 signatures are classic, foundational results credited in Section 12.
- **Original Systems Architecture (PLANARIA)**: To our knowledge, PLANARIA is the first complete, self-contained, executable, formally verified system uniting **Unequal Error Protection (PET)** with **compiled multi-stratum executable code**, **zero-header low-discrepancy cellular interleaving for unaligned zero-overlap Binary Mitosis**, **hardware-level runtime Control-Flow Anastomosis (`ORGAN_CALL`)**, **interleaved inner RS + per-cell Merkle Byzantine quarantine against Cauchy decoder poisoning**, and **ABI-verified Cross-Species Executable Xenografting** — all backed by live 60 FPS interactive vivisection and 31 pure Lean 4 kernel proofs.

---

## 12. Cited Primary Sources & References

1. **Reed, I. S., & Solomon, G.** (1960). *Polynomial Codes over Certain Finite Fields*. Journal of the Society for Industrial and Applied Mathematics, 8(2), 300–304. DOI: `10.1137/0108018`
2. **Chien, R. T.** (1964). *Cyclic Decoding Procedures for Bose-Chaudhuri-Hocquenghem Codes*. IEEE Transactions on Information Theory, 10(4), 357–363. DOI: `10.1109/TIT.1964.1053699`
3. **Forney, G. D.** (1965). *On Decoding BCH Codes*. IEEE Transactions on Information Theory, 11(4), 549–557. DOI: `10.1109/TIT.1965.1053825`
4. **Berlekamp, E. R.** (1968). *Algebraic Coding Theory*. McGraw-Hill, New York. (Revised ed., World Scientific, 2015).
5. **Massey, J. L.** (1969). *Shift-Register Synthesis and BCH Decoding*. IEEE Transactions on Information Theory, 15(1), 122–127. DOI: `10.1109/TIT.1969.1054260`
6. **Merkle, R. C.** (1987). *A Digital Signature Based on a Conventional Encryption Function*. Advances in Cryptology — CRYPTO '87, LNCS 293, 369–378. DOI: `10.1007/3-540-48184-2_32`
7. **Bloemer, J., Kalfane, M., Karp, R., Karpinski, M., Luby, M., & Zuckerman, D.** (1995). *An XOR-Based Erasure-Resilient Coding Scheme*. ICSI Technical Report TR-95-048, UC Berkeley. (Foundational Cauchy-matrix MDS erasure coding).
8. **Albanese, A., Blömer, J., Edmonds, J., Luby, M., & Sudan, M.** (1996). *Priority Encoding Transmission*. IEEE Transactions on Information Theory, 42(6), 1737–1744. DOI: `10.1109/18.556670`
9. **Plank, J. S., & Xu, L.** (2006). *Optimizing Cauchy Reed-Solomon Codes for Fault-Tolerant Network Storage Applications*. Fifth IEEE International Symposium on Network Computing and Applications (NCA '06), 173–180. DOI: `10.1109/NCA.2006.43`
10. **Luby, M.** (2002). *LT Codes*. Proceedings of the 43rd Annual IEEE Symposium on Foundations of Computer Science (FOCS), 271–280. DOI: `10.1109/SFCS.2002.1181950`
11. **NIST FIPS PUB 180-4** (2015). *Secure Hash Standard (SHS)*. National Institute of Standards and Technology, U.S. Department of Commerce. DOI: `10.6028/NIST.FIPS.180-4`
12. **Bernstein, D. J., Duif, N., Lange, T., Schwabe, P., & Yang, B.-Y.** (2012). *High-Speed High-Security Signatures*. Journal of Cryptographic Engineering, 2(2), 77–89. DOI: `10.1007/s13389-012-0027-1` (Ed25519).
13. **Reddien, P. W., & Sánchez Alvarado, A.** (2004). *Fundamentals of Planarian Regeneration*. Annual Review of Cell and Developmental Biology, 20, 725–757. DOI: `10.1146/annurev.cellbio.20.010403.095114`
14. **Barker, R. H.** (1953). *Group Synchronizing of Binary Digital Systems*. Communication Theory, Butterworths, London, 273–287.
15. **de Moura, L., & Ullrich, S.** (2021). *The Lean 4 Theorem Prover and Programming Language*. Automated Deduction — CADE 28, LNCS 12699, 625–635. DOI: `10.1007/978-3-030-79876-5_37`
16. **Singleton, R. C.** (1964). *Maximum Distance $q$-nary Codes*. IEEE Transactions on Information Theory, 10(2), 116–118. DOI: `10.1109/TIT.1964.1053661`
