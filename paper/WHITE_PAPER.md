# PLANARIA: Progressive Holographic Executable Architecture (`.hbin`), Multi-Stratum Compilation, Autonomous Control-Flow Anastomosis, and Cryptographic Cellular Quorum

**Technical Research White Paper (Preprint v2.4.0 — Frozen AMS-LaTeX PDF: [`dist/Donahue_2026_planaria.pdf`](../dist/Donahue_2026_planaria.pdf))**  
**Author:** Alexander Stephen Donahue — Independent Researcher ([0thernes project](https://0thernes.art), Spokane, WA, USA · `0_0@0thernes.art` · ORCID [0009-0006-8168-9648](https://orcid.org/0009-0006-8168-9648))  
**Date:** November 26, 2026  
**Repository:** `https://github.com/0thernes/planaria`  
**License:** Cosmogonic License — Non-Commercial Research & Play ([LICENSE](../LICENSE); Build Standard audit tooling CC BY 4.0)

---

## Abstract

For eighty years, compiled computer executables (`ELF`, `PE`, `Mach-O`, `WebAssembly`) have obeyed a brittle monolithic topology: destroying the byte-0 file header, slicing a binary in half, flipping a single bit in an active code page, or injecting a forged chunk causes immediate catastrophic loader failure or silent control-flow corruption. Conventional single-rate erasure coding (such as wrapping a binary inside a flat $(n, k)$ Reed-Solomon archive) replaces fragility with a rigid **erasure cliff** — 100% recovery at $k$ surviving shards and 0% execution at $k - 1$ — while exposing outer finite-field Gaussian elimination to catastrophic **single-cell Byzantine decoder poisoning**.

We present **PLANARIA v2.4.0**, a complete, zero-dependency, end-to-end executable architecture demonstrating **Progressive Holographic Instruction Stratification (PHIS)**. PLANARIA integrates: (1) a headerless, self-synchronizing 512-byte cellular binary format (`.hbin`, 192 cells = 98,304 bytes) combining 2-way interleaved inner `RS(254, 238)` Berlekamp–Massey/Chien/Forney byte-error correction, Depth-8 domain-separated SHA-256-128 Merkle cell authentication (`0x00`/`0x01`/`0x02 || "PLN\0"`), outer Cauchy-matrix MDS erasure coding over $\text{GF}(2^8)$ (`0x11D`), and an Overlap-Eclipse-resistant sliding sync decoder with iterative backward flywheel and $O(1)$ sync-flood bypass; (2) a structured multi-stratum systems language and compiler (`Plang`); (3) a sandboxed 32-bit register virtual machine (`PVM-32`) with caller-windowed `CALL`/`RET`, native `ORGAN_CALL` **Control-Flow Anastomosis** dispatch, zero-allocation transactional RAM/audio rollback on trapped organs, and a standardized Shared-Memory World-State ABI; (4) a 3D WebGL2 Temporal-Quantum Interactive Engine (`6,421,059,993,600` reachable discrete combinations across 4 qubits, $O(1)$ 360-frame rewind, and PolyBLEP 48 kHz AudioWorklet synthesis) cross-checked by an independent clean-room Python 3 differential oracle (`reference/planaria_oracle.py`); and (5) **85 pure Lean 4.35.0 (`module` system, `autoImplicit = false`, zero Mathlib) machine-checked kernel proofs** across 7 modules (including 10 non-vacuity witnesses and 8 formal adversarial false-variant refutations), exported via Palomar `Challenge.lean`/`Solution.lean`, checked across **6 independent kernels** with live negative tamper rejection in CI, and published with an interactive Proof Blueprint (`blueprint/`).

Across four real compiled 60 FPS interactive executables (`QUANTUM_CHRONICLE`, `AEGIS_DRIFT`, `SYNTH_REACTOR`, `CIPHER_VAULT`), PLANARIA empirically demonstrates (**30/30 verification suites passing, 12/12 = 100.0% surgical mutants killed, 2,000/2,000 deterministic fuzz cases, 100% Python 3 differential parity**): **zero-overlap unaligned 50/50 Planarian Binary Mitosis** across 6 aligned and prime offsets (`17.17–21.28 ms` dual decode+regen); **100.0% survival at 76% erasure, 95.0% at 80%, 82.5% at 88%, and 65.0% at 92%** (versus **0.0%** for monolithic linear `LINBIN01`, single-stratum `RS(40,16)`, and equal-storage flat `RS(192,48)` past its 75% cliff, Holm–Bonferroni $p_{\text{Holm}} \le 6.26 \times 10^{-7}$); **100% recovery from simultaneous 16-byte contiguous burst radiation inside all 192 cells** (`3,072` corrupted bytes = `3.13%` file-wide, dropping to `0/192` with `0` miscorrections at `18 B`); **100% quarantine of 1–192 RS-valid Byzantine Trojan cells** (versus `469–472 / 472` bytes poisoned without Merkle quarantine); and **5/5 trap-free Cross-Species Executable Xenograft Chimeras**. (See [`dist/Donahue_2026_planaria.pdf`](../dist/Donahue_2026_planaria.pdf) for the authoritative `v2.4.0` AMS-LaTeX edition with full statistical inference tables, Claims Ledger `C01..C10`, Statement-Fidelity Audit Table, and `0 / 1,900` Mega-Atlas disclosure.)

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

Biological planarian flatworms (*Schmidtea mediterranea*) and optical holograms operate on an inverted structural principle: **distributed spatial redundancy coupled with progressive resolution**. Slice a planarian flatworm in half, and both zero-overlap fragments regenerate complete organisms; shatter a hologram, and small surviving fragments still project the entire scene at reduced resolution rather than blacking out completely. **PLANARIA** translates this principle into an actual compiled executable container, language compiler, 32-bit virtual machine, 3D temporal-quantum engine, independent Python 3 differential oracle, and 85-theorem formally verified systems specification.

---

## 2. Design Goals & Formal Threat Model

PLANARIA targets five simultaneous operational guarantees over raw, untrusted byte streams:

| Requirement | Concrete Operational Target |
|---|---|
| **G1 — Zero-Header Framing** | Boot from arbitrary unaligned byte offsets (`offset mod 512 ≠ 0`), noise-padded streams, shuffled cell orders, Overlap-Eclipse sync decoys, and raw OS concatenations (`cat shardA shardB`). |
| **G2 — Zero-Overlap Mitosis** | Any 50/50 physical bisection (aligned or unaligned prime cut) must allow BOTH disjoint halves to boot at Stratum 3 and re-emit a 100% SHA-256 bit-exact replica of the original `.hbin`. |
| **G3 — Zero-Cliff Degradation** | Graceful execution across 4 capability strata (`S3 -> S2 -> S1 -> S0 Ghost`) surviving up to ~88–92% total file destruction without unhandled VM traps. |
| **G4 — Dual-Layer & Byzantine Defense** | Heal up to 16 contiguous corrupted bytes inside *every* 512-byte cell simultaneously, quarantine 100% of RS-valid forged Byzantine cells before outer Cauchy decoding, and enforce strict scan DoS caps & header invariant validation. |
| **G5 — Safe Chimeric Splicing** | Permit ABI-verified organ transplantation across distinct `.plang` species onto living hosts (`bundles[0].viable`) while preserving host Kernel/Genome sovereignty (even under forged header flags), RAM bounds (`< 4096` words), transactional trap rollback, and bounded cycle termination. |

**Adversary Model**: We consider both (a) **benign physical media hazards** (random erasure, truncation, unaligned offsets, chunk reordering, contiguous 16-byte radiation bursts across all cells) and (b) an **active Byzantine injector** who knows the complete `.hbin` specification, injects Overlap-Eclipse sync decoys 1–511 bytes before authentic cells, forges Sybil cell headers (e.g., invalid `k`, `n`, `leafIdx`, `evalX`, or `xenograftable` flags), constructs valid 2-way interleaved `RS(254, 238)` parity (zero RS syndrome errors), and prepends malicious forged cells ahead of authentic cells to maximize poisoning probability. The adversary is computationally bounded (cannot invert FIPS 180-4 SHA-256 truncated to 128 bits, preserving $2^{128}$ second-preimage resistance and $2^{64}$ collision resistance).

---

## 3. The `.hbin` v1.0 Cellular Holographic Binary Specification

A pristine PLANARIA executable is exactly **98,304 bytes (96 KiB)**, consisting of **192 fixed 512-byte Holographic Cells** (`src/core/hbin.js`). There is no file header, footer, or central directory.

### 3.1 Byte-Exact 512-Byte Cell Anatomy

| Byte Range | Length | Field | Purpose & Cryptographic / ECC Coverage |
|---|---|---|---|
| `0..3` | 4 B | `SYNC_WORD` | Fixed marker `0x50 0x4C 0x4E 0xB7` (`PLN\xB7`); fuzzy-matched up to Hamming distance $\le 3$ bits |
| `4..19` | 16 B | `CellHeader` | `version(1)`, `bundleId(1)`, `stratum(1)`, `organId(1)`, `abiSig(2)`, `evalX(1)`, `k(1)`, `n(1)`, `flags(1)`, `leafIdx(2)`, `origLen(2)`, `speciesTag(2)` — **Merkle-committed + RS-armored + canonical `BUNDLE_SPECS`/`PLACEMENT_SCHEDULE` invariant checked** |
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

### 3.3 Exact Integer Low-Discrepancy Physical Placement

Rather than placing bundle cells contiguously or relying on IEEE-754 floating-point arithmetic, PLANARIA assigns cell $i \in \{0..n_b-1\}$ of bundle $b \in \{0..6\}$ the exact integer position numerator:

$$\text{posNum}(b, i) = (14 i + 2 b + 1) \cdot \frac{480}{n_b} \in (0, 6720)$$

All 192 cells are sorted by the strictly distinct lexicographic integer key `posNum * 8 + b` (`src/core/hbin.js`, matching `lean/PlanariaProofs/MitosisBounds.lean` bit-for-bit). In `planaria_schedule_nodup_and_sorted_halves`, Lean 4 proves that **zero** cells fall on the midpoint `3360`, all 192 sort keys are pairwise distinct (`List.Nodup`), and every bundle splits **exact** $n_b/2$ cells into `[0..95]` and exact $n_b/2$ cells into `[96..191]` — guaranteeing deterministic, platform-independent 50/50 unaligned mitosis and 100% SHA-256 bit-exact regeneration.

---

## 4. Dual-Layer Algebraic Coding: Inner Interleaved `RS(254, 238)` & Outer Cauchy MDS

All finite-field operations run over $\text{GF}(2^8)$ defined modulo the primitive polynomial $P(x) = x^8 + x^4 + x^3 + x^2 + 1$ (`0x11D`) with generator $\alpha = 2$, accelerated by a precomputed 64 KiB `GF_MUL_TABLE` (`src/core/gf256.js`) and independently verified in Python 3 (`reference/planaria_oracle.py`).

### 4.1 Inner Layer: 2-Way Interleaved `RS(254, 238)`

Each cell's 476-byte body (bytes `4..479`) is de-interleaved into two 238-byte lanes (even offsets and odd offsets). Each lane is systematically encoded with generator polynomial $g(x) = \prod_{i=0}^{15} (x - \alpha^i)$ (`fcr = 0`), appending 16 parity bytes to form a 254-byte codeword ($d_{\min} = 17$, unique correction radius $t = 8$ bytes). The 32 parity bytes are re-interleaved into bytes `480..511`.

During cellular harvesting, `rsDecode()` executes the complete algebraic decoding pipeline:
1. Evaluate all 16 syndromes $S_i = Y(\alpha^i)$ ($i = 0..15$) via Horner's rule.
2. Synthesize the minimal error-locator polynomial $\Lambda(x) = 1 + \sum_{m=1}^{\nu} \Lambda_m x^m$ via **Berlekamp-Massey**. Reject immediately if $\nu > 8$.
3. Run exhaustive **Chien search** across all 254 positions; verify the root count equals $\nu$.
4. Compute $\Omega(x) = (S(x)\Lambda(x)) \bmod x^{16}$ and apply **Forney's formula** (for characteristic 2, `fcr = 0`), rejecting zero-magnitude anomalies (`forney_zero_magnitude`):
   $$e_k = \frac{X_k \cdot \Omega(X_k^{-1})}{\Lambda'(X_k^{-1})}$$
5. **Mandatory Syndrome Recheck**: Re-evaluate all 16 syndromes on the corrected codeword and reject if any syndrome remains nonzero, preventing silent miscorrection past $t = 8$.

Because bytes are interleaved across even and odd offsets, any contiguous burst error of length $L \le 16$ deposits at most 8 corrupted bytes into each lane (proved universally in `ByzantineImmune.lean` and formally contrasted in `AdversarialTests.lean`), guaranteeing **100% healing of any 16-byte contiguous burst inside every single cell**, while $L = 17$ can fail and $L = 18$ always exceeds $t = 8$ in both lanes.

### 4.2 Outer Layer: Non-Systematic Cauchy MDS over $\text{GF}(2^8)$

For a bundle with parameters $(k, n)$, the payload is padded to $k \times 332$ bytes into chunks $D_0, \dots, D_{k-1}$. With disjoint coordinate sets $Y = \{0, \dots, k-1\}$ and $X = \{k, \dots, k+n-1\}$ ($k + n \le 56 \ll 256$), cell $i$ carries:

$$P_i = \bigoplus_{j=0}^{k-1} C_{i,j} \cdot D_j, \qquad C_{i,j} = (x_i \oplus y_j)^{-1} \in \text{GF}(2^8)$$

By the Cauchy determinant identity, every $k \times k$ submatrix of $C$ is guaranteed nonsingular over $\text{GF}(2^8)$:

$$\det(C_{I, Y}) = \frac{\prod_{a < b} (x_{i_b} \oplus x_{i_a})(y_b \oplus y_a)}{\prod_{a, b} (x_{i_a} \oplus y_b)} \neq 0$$

Unlike naive Vandermonde matrices over $\text{GF}(2^8)$ (which can encounter singular submatrices for $k \ge 4$), **every** subset of $k$ distinct authenticated cells guarantees exact unique inversion via Gauss-Jordan elimination (`invertMatrixGF256`).

---

## 5. Cryptographic Cellular Immune System & Byzantine Quarantine

Each cell's 348-byte commitment $L_s = \text{Header}_{16} \parallel \text{CodedPayload}_{332}$ is hashed using domain-separated FIPS 180-4 SHA-256 truncated to 128 bits (`src/core/sha256.js`), with three strictly disjoint domain prefixes (see `DEVIATIONS.md` `DEV-05`):

$$h_{\text{leaf}}(L_s) = \text{SHA256}(\texttt{0x00} \parallel L_s)[0..15], \quad h_{\text{node}}(u, v) = \text{SHA256}(\texttt{0x01} \parallel u \parallel v)[0..15], \quad h_{\text{empty}} = \text{SHA256}(\texttt{0x02} \parallel \texttt{"PLN\textbackslash 0"})[0..15]$$

Building a Depth-8 binary Merkle tree over all 192 cells (padded to 256 leaves with `EMPTY_LEAF_HASH`) yields a single 128-bit **Lineage Merkle Root** $R$. Each cell embeds its 8 sibling nodes (128 bytes) directly inside its RS-armored body.

Upon decoding any raw byte stream (`src/core/hbin.js`), the Overlap-Eclipse-hardened sliding correlator harvests candidate cells (respecting DoS budgets `maxInputBytes`, `maxSyncCandidates`, `maxRsFailures`), verifies canonical `BUNDLE_SPECS` + `PLACEMENT_SCHEDULE` header invariants (blocking 256-cell Sybil header forgery), and recomputes each cell's implied root $\hat{R}_c = \text{EvalMerkle}(L_s, \text{leafIdx}, \text{proof}_{128})$:
- **Pinned-Root Mode**: Accepts cell $c$ iff $\hat{R}_c = R_{\text{pinned}}$. Even if an attacker prepends a 99% flood of self-consistent forged cells from a bogus tree, **100% are quarantined prior to Cauchy decoding**.
- **Unpinned Consensus-Quorum Mode**: Groups harvested cells by $\hat{R}_c$, requires a strict unique majority quorum of $\ge 2$ cells (failing closed with `quorumAmbiguous: true` on exact ties), quarantines singleton/forged cells, and refuses unpinned Xenograft splicing (`xenograftBlockedUnpinned`) unless an explicit host root is pinned or policy-authorized.

---

## 6. The `Plang` Multi-Stratum Compiler & `PVM-32` Anastomosis Virtual Machine

### 6.1 `Plang` Language & Compiler (`src/compiler/`)

`Plang` is a compact structured systems language supporting compile-time constants, explicit `bundle <NAME> { ... }` blocks, lexical block-scoped `let` variables, `while`/`if`/`else` control flow, ternary expressions, unary bitwise NOT (`~`), local functions, direct shared-RAM loads/stores (`mem[idx]`), single-evaluation compound memory updates (`mem[i] += v`), 20 hardware syscalls, and first-class `organ_call(ORGAN, maxStratum)` expressions.

The zero-dependency compiler (`lexer.js` → `parser.js` → `codegen.js` → `compile.js`) enforces strict static diagnostics (rejecting unterminated block comments, malformed hex/numeric literals, >32-bit integer overflows, divide-by-zero constant expressions, duplicate function or bundle declarations, syscall collisions, arity mismatches, missing `S0_STEM_NUCLEUS`, or forbidden code inside `S3_GENOME_LEDGER`) and applies four optimization passes:
- **Lexical block register reclamation** over 14 local registers (`r18..r31`) and 10 expression scratch registers (`r8..r17`, overflow-guarded at `rR > 17`);
- **Direct-to-ABI syscall register emission** when arguments contain no nested calls;
- **Base+immediate memory folding** (`LDW`/`STW` and `ADDI` peepholes);
- **Direct conditional branch emission** (`BEQ`/`BNE`/`BLT`/`BGE`), fitting all four rich interactive programs comfortably within their power-of-two stratum budgets.

### 6.2 `PVM-32` Virtual Machine & Hot-Swap Anastomosis (`src/vm/pvm32.js`)

`PVM-32` executes fixed 32-bit little-endian RISC instructions over 32 general-purpose registers (`r0` hardwired zero) with **caller-windowed register save/restore across `OP.CALL`/`OP.RET`**, a 4,096-word (16 KiB) strictly bounds-masked linear RAM (`(base + imm16) & 0xFFF`), a **pre-allocated zero-allocation LIFO undo journal** rolling back partial RAM and voice mutations atomically if a nested organ traps, a Liang-Barsky-clipped 160×120 RGBA32 framebuffer with phosphor decay (`SYSCALL.GLOW`), and a 4-channel polyphonic audio synthesizer register bank (`VOICE.detune` clamped to `[-2400, 2400]`) driving a lock-free 48 kHz PolyBLEP `AudioWorklet` (verified in sandboxed Suite 29). Bundle 6 (`S3_GENOME_LEDGER`) is strictly excluded from executable code memory (`bundleCode[6] === null`).

When executing `ORGAN_CALL rd, organId, maxStratum`:
1. The Anastomosis Dispatch Table scans all loaded authentic/xenografted bundles matching `organId` with `stratum <= maxStratum` in strictly descending stratum order (`S3 -> S2 -> S1 -> S0`).
2. If found, `PVM-32` executes that bundle inside a fresh register frame sharing the bounded frame instruction budget (`16,000` insns/frame, single-trap `BUDGET_EXCEEDED`) and call-stack cap (`32`), logging the live vascular route and returning `1` (or rolling back RAM/voice writes and returning `0` cleanly if the called organ traps).
3. If all matching bundles are dead/amputated, `ORGAN_CALL` returns `0` cleanly without faulting, allowing `S0_STEM_NUCLEUS` to invoke its built-in emergency fallback reflex (e.g., Ghost wireframe beacon + 1-bit heartbeat).
4. **Live Hot-Swapping**: Calling `vm.loadDecoded(newDecoded, false)` swaps damaged, healed, or xenografted organ code segments **in place** without clearing RAM, preserving live game score, ship coordinates, and cipher state across mid-flight amputations and regrowth.

---

## 7. Cross-Species Executable Xenografting & Standardized World-State ABI

All four compiled living `.plang` species (`QUANTUM_CHRONICLE`, `AEGIS_DRIFT`, `SYNTH_REACTOR`, `CIPHER_VAULT`) adhere to a unified Shared-Memory World-State ABI:
- `MEM[0..15]`: frame counter, primary score/metric, energy, focal `(x, y)` coordinates, angle, combo/chord, event bitmask (`fire`, `hit`, `pickup/chord`, `alarm`), audio root/tempo, live entropy word, entity count, input mask, init flag, and **`SPECIES_MAGIC` sentinel in `MEM[15]`** (enabling safe auto-reinitialization during cross-species `S1_CORE_LOGIC` organ grafts).
- `MEM[64..255]`: up to 24 standardized entities (`8` words each: `type, x, y, vx, vy, hp, phase, color`).
- `MEM[256..511]`: 32 shared particles/scope samples.

When a living host species (`bundles[0].viable === true`) suffers organ amputation (e.g., `S2_CORTEX_RENDER` and `S2_SYNTH_AUDIO` destroyed in `AEGIS_DRIFT.hbin`) and raw bytes from a foreign species (e.g., `SYNTH_REACTOR.hbin`) are concatenated onto the byte stream with a pinned host root and `allowXenograft: true`:
1. `decodeHbin` preserves **Host Lineage Sovereignty**: Bundles `B0` (`KERNEL`) and `B6` (`GENOME`) are strictly non-xenograftable regardless of cell header flags, and dead hosts (`b0 < 2`) refuse all grafts (`xenograft_dead_host_refused`).
2. Missing xenograftable slots (`B1..B5`) verify exact 16-bit `abiSig` equality (`0x0201`, `0x0302`, `0x0402`, etc.) against coherent Merkle-authenticated donor clusters before grafting.
3. Calling `regenerateHbin(chimeraDec)` preserves `speciesTag`, rejects `immuneSystemEnabled === false`, and mints a **brand-new standalone 98,304-byte Chimera `.hbin`** with its own fresh Lineage Merkle Root that immediately inherits 50/50 Mitosis, 16-byte burst healing, and Byzantine quarantine.

---

## 8. Formal Machine-Checked Proofs in Pure Lean 4 (`v4.35.0`, 85 Theorems, 6 Kernels, Blueprint)

PLANARIA v2.4.0 ships a self-contained pure Lean 4.35.0 `module`-system proof library (`lean/PlanariaProofs/`, `autoImplicit = false`, `relaxedAutoImplicit = false`, line-1 `module` on all 12 `.lean` files, zero Mathlib, zero `sorryAx`, zero `native_decide`/`trustCompiler`/`_native`, zero warnings) auditing **85 machine-checked theorems** (including 10 explicit non-vacuity witnesses and 8 formal adversarial false-variant refutations) across a pure shared `Spec.lean` and seven proof modules ([results/lean4-audit.txt](../results/lean4-audit.txt), SHA-256 `13d723722ac5d5af...`), independently checked across **6 kernels** (`lean4`, `leanchecker --fresh`, `leanchecker-paranoid`, `lean4lean`, Rust `nanoda_bin`, `con-leche --verified`, `con-ron --verified` accepting `2,732` declarations) plus Palomar `lake comparator --config comparator.json --paranoid` against `Challenge.lean`, live negative tamper rejection in CI ([results/lean4-multi-kernel.txt](../results/lean4-multi-kernel.txt)), and an interactive Proof Blueprint ([blueprint/index.html](../blueprint/index.html)), all strictly within `{propext, Classical.choice, Quot.sound}` (with 15 purely constructive zero-axiom proofs):

1. **Theorem Family I — Full $\text{GF}(2^8)$ Field & Universal Cauchy 2×2 Invertibility (`GF256.lean`, 16 theorems)**:
   - Exhaustive verification of `gfMul_comm` (all 65,536 pairs), `gfMul_assoc` (all 16,777,216 triples via $\mathbb{F}_2$-bilinearity), `gfMul_inv_exact` (all 255 nonzero units), concrete field instance `gf256Field : Char2Field (Fin 256)`, universal `gf_cauchy2_nonzero_det` & `cauchy2_exact_decode` over *any* characteristic-2 field, concrete `gf256_cauchy2_exact_decode` over $\text{GF}(2^8)$ `0x11D`, plus non-vacuity witness `gf256_cauchy2_nonvacuous_witness`.
2. **Theorem Family II — Exact Integer Schedule, Mitosis Thresholds & Unaligned Cut Safety (`MitosisBounds.lean`, 14 theorems)**:
   - Tight iff mitosis boundary (`mitosis_exact_sufficient`, `mitosis_strict_impossibility`, `mitosis_strict_impossibility_witness`), unaligned cut safety (`mitosis_unaligned_cut_guarantee`, `planaria_all_7_bundles_mitosis_safe`), exact 512 B cell / 15,936 B payload / 98,304 B binary budgets, Cauchy disjointness, pigeonhole witness (`pigeonhole_two_way_witness`), trisection synergy, `planaria_schedule_exact_halves`, AND `planaria_schedule_nodup_and_sorted_halves` proving true `all192LexKeys.Nodup` via `msortFuel_perm` plus sorted slots `0..95 < 3360 < 96..191`.
3. **Theorem Family III — 7-Bundle Anastomosis, Super-Additive Fusion & Zero-Cliff Separation (`StratumAnastomosis.lean`, 8 theorems)**:
   - 7-bundle viability lattice including `B6` (`GENOME`), bit-exact `hbin.js` Step 4 fidelity (`viability_s3_without_b2_matches_hbin`), general 6-organ `resolveOrgan`, zero-crash safety (`anastomosis_zero_crash_safety`, `resolveOrgan_zero_crash_safety`), strict monotonicity + `anastomosis_monotonicity_witness`, super-additive fusion synergy (`fusion_strict_synergy_exists`), and `zero_cliff_strict_separation` separating PLANARIA simultaneously against single-stratum `RS(40, 16)` AND equal-storage flat `RS(192, 48)` at 12% survival.
4. **Theorem Family IV — Byte-List RS(254, 238), Tight 16/17/18 B Burst Bounds & Merkle Quarantine (`ByzantineImmune.lean`, 18 theorems)**:
   - Real byte-list Hamming triangle inequality (`hammingDist_triangle`), 508 B lane geometry, `rs_unique_correction_ball_disjoint` + `rs_unique_correction_ball_nonvacuous`, positive 16 B interleaved burst guarantee (`interleaved_burst_16_even_odd_bound`), tight negative 17 B / 18 B failure witnesses, strengthened dual-path Merkle binding (`merkle_path_collision_free_binding` binding BOTH leaf and sibling proof) + `pow2Pair_injective` & `hashBinding_mixed_nonvacuous` witnesses, zero-contamination quarantine, and arbitrary-list executable `electUnpinnedQuorum` proofs (`unpinned_quorum_honest_majority` + `unpinned_quorum_honest_majority_witness`, `unpinned_quorum_tie_fail_closed` for arbitrary lists, and `unpinned_quorum_sybil_counterexample`).
5. **Theorem Family V — Signed `BitVec 32` Sandboxing, Live-Host & Non-Vacuous Xenograft Sovereignty (`XenograftABI.lean`, 9 theorems)**:
   - Signed 32-bit `BitVec 32` RAM `< 4096` confinement (`pvm32_ram_bounds_invariant`), bounded execution termination, non-vacuous B0/B6 sovereignty even under forged cell header flags (`xenograft_preserves_sovereignty`, `xenograft_sovereign_b0_b6_immutable`), strict ABI preservation, live-host stem guard (`xenograft_dead_host_refused`, `xenograft_dead_host_witness`), and amputated host recovery + `xenograft_improves_amputated_host_witness`.
6. **Theorem Family VI — 4-Qubit Unitary Norm Conservation, Bounded 360-Frame Stack & Exact Combinatorial Space (`QuantumTemporal.lean`, 12 theorems)**:
   - Full 4-qubit 16-amplitude complex unitarity (`X`, `Y`, `Z`, `H`, `CNOT`, `CZ`, `SWAP`) + Bell-pair non-vacuity witness `cnot4Q_nonvacuous_witness`, bounded 360-frame snapshot stack push/pop lossless reversibility (`snapshot_buffer_capacity_and_exact_pop`), and `combinatorial_1of1_space_exceeds_6_trillion` certifying the exact reachable Weapon × Armor × NPC cross-product **`80,640 × 3,072 × 25,920 = 6,421,059,993,600`** ($> 6.42 \times 10^{12}$).
7. **Theorem Family VII — Adversarial False-Variant Refutations (`AdversarialTests.lean`, 8 theorems)**:
   - Explicit machine-checked refutations ($\neg P$) confirming that our specifications are sharp and non-vacuous: `refute_mitosis_below_2k`, `refute_unaligned_cut_without_margin`, `refute_interleaved_burst_17_safe`, `refute_anastomosis_dead_stem_safe`, `refute_unpinned_quorum_tie_elects`, `refute_xenograft_replaces_b0`, `refute_hadamard_preserves_unscaled_norm`, and `refute_gf256_zero_invertible`.

---

## 9. Empirical Benchmarks, Survival Phase-Transition & Popperian Falsification

All results below were measured reproducibly on Node.js `v25.8.2` (`scripts/benchmark.mjs`, stored verbatim in [results/benchmarks.json](../results/benchmarks.json), schema `PLANARIA-BENCHMARKS-1.2`, longitudinal history in [results/bench-history.csv](../results/bench-history.csv)) using `AEGIS_DRIFT.hbin` (98,304 B, 1,000 instructions, 4,000 code bytes) in a paired 4-architecture sweep (`N = 40` paired seeds per erasure level × 25 points = 4,000 paired evaluations) against monolithic `LINBIN01`, single-stratum `RS(40, 16)`, and **Equal-Storage Flat `RS(192, 48)`** (exact 98,304 B / 192 cells, 75.0% hard cliff evaluated via exact MDS rank threshold `authenticCells >= 48`).

### 9.1 Paired 4-Architecture Survival Phase-Transition Curve (0%–96% Erasure)

| Erasure (%) | Surviving (%) | `LINBIN01` | `RS(40,16)` | **Equal-Storage `RS(192,48)`** | **PLANARIA Bootable (%) `[95% Wilson CI]`** | Holm $p_{\text{Holm}}$ vs. `RS(192,48)` | Stratum (`S3/S2/S1/S0` of 40) |
|---:|---:|---:|---:|---:|---|---:|---|
| 0% | 100% | 100.0% | 100.0% | 100.0% | **100.0%** `[91.2, 100.0]` | `1.00` | `40 / 0 / 0 / 0` |
| 12% | 88% | 32.5% | 100.0% | 100.0% | **100.0%** `[91.2, 100.0]` | `1.00` | `40 / 0 / 0 / 0` |
| 44% | 56% | **0.0%** | 100.0% | 100.0% | **100.0%** `[91.2, 100.0]` | `1.00` | `40 / 0 / 0 / 0` |
| 60% | 40% | **0.0%** | 57.5% | 100.0% | **100.0%** `[91.2, 100.0]` | `1.00` | `22 / 18 / 0 / 0` |
| 72% | 28% | **0.0%** | 2.5% | 100.0% | **100.0%** `[91.2, 100.0]` | `1.00` | `0 / 36 / 4 / 0` |
| **76%** | **24%** | **0.0%** | **0.0%** | **0.0%** *(75% Cliff)* | **100.0%** `[91.2, 100.0]` | **$4.55\times 10^{-11}$** | `0 / 25 / 15 / 0` |
| **80%** | **20%** | **0.0%** | **0.0%** | **0.0%** | **95.0%** `[83.5, 98.6]` | **$1.75\times 10^{-10}$** | `0 / 13 / 25 / 0` |
| **84%** | **16%** | **0.0%** | **0.0%** | **0.0%** | **87.5%** `[73.9, 94.5]` | **$1.34\times 10^{-9}$** | `0 / 3 / 22 / 10` |
| **88%** | **12%** | **0.0%** | **0.0%** | **0.0%** | **82.5%** `[68.1, 91.3]` | **$5.12\times 10^{-9}$** | `0 / 1 / 15 / 17` |
| **92%** | **8%** | **0.0%** | **0.0%** | **0.0%** | **65.0%** `[49.5, 77.9]` | **$6.26\times 10^{-7}$** | `0 / 0 / 5 / 21` |
| **96%** | **4%** | **0.0%** | **0.0%** | **0.0%** | **32.5%** `[20.1, 48.0]` | **$4.88\times 10^{-3}$** | `0 / 0 / 0 / 13` |

### 9.2 Contiguous Burst Radiation Sweep (Applied Simultaneously to ALL 192 Cells)

| Burst Length / Cell | Total Bytes Corrupted | Raw Error Rate | Linear Twin Alive | PLANARIA Repaired Cells | Byte Errors Healed | 100% Bit-Exact Regen |
|---:|---:|---:|:---:|---:|---:|:---:|
| 0 B | 0 B | 0.00% | Yes | 192 / 192 | 0 | **Yes** |
| 2 B | 384 B | 0.39% | **No** | 192 / 192 | 384 | **Yes** |
| 8 B | 1,536 B | 1.56% | **No** | 192 / 192 | 1,536 | **Yes** |
| 14 B | 2,688 B | 2.73% | **No** | 192 / 192 | 2,688 | **Yes** |
| **16 B (Exact Theorem IV Bound)** | **3,072 B** | **3.13%** | **No** | **192 / 192** | **3,072** | **Yes** |
| **18 B (Past Bound — Falsification)** | **3,456 B** | **3.52%** | **No** | **0 / 192** | **0 (0 miscorrections!)** | **No** |

### 9.3 Byzantine Trojan Flood Audit (RS-Valid Forged Cells Prepended)

| Trojans Prepended | Immune ON: Quarantined | Immune ON: 100% Exact SHA-256 | Immune OFF: `S0_STEM_NUCLEUS` Bytes Corrupted |
|---:|---:|:---:|---:|
| 1 | **1 / 1 (100%)** | **Yes** | **469 / 472 B (99.4% Poisoned!)** |
| 5 | **5 / 5 (100%)** | **Yes** | **471 / 472 B (99.8% Poisoned!)** |
| 20 | **20 / 20 (100%)** | **Yes** | **470 / 472 B (99.6% Poisoned!)** |
| 60 | **60 / 60 (100%)** | **Yes** | **472 / 472 B (100.0% Poisoned!)** |
| 192 | **192 / 192 (100%)** | **Yes** | **470 / 472 B (99.6% Poisoned!)** |

### 9.4 Unaligned Bisection Matrix, Cross-Species Chimeras & Runtime Performance

- **Unaligned Bisection**: Across all 6 tested offsets (`49152`, `49153`, `49177`, `48701`, `49597`, `49000`), BOTH disjoint halves regenerated the 100% SHA-256 identical 98,304-byte original in **`17.17–21.28 ms`** combined (`49177`: `20.20 ms`).
- **Cross-Species Xenograft Matrix**: **5/5** chimeras (`AEGIS×SYNTH`, `AEGIS×VAULT`, `AEGIS×QC S1`, `QC×SYNTH`, `SYNTH×VAULT`) bootable S3, 60 frames, 0 VM traps.
- **Compile All 4 Species**: **`48.61 ms`** total (`QUANTUM_CHRONICLE`, `AEGIS_DRIFT`, `SYNTH_REACTOR`, `CIPHER_VAULT`).
- **Full 96 KiB Decode Latency**: **`9.669 ms`** median (mean `9.858 ms`, IQR `1.217 ms`, p95 `12.891 ms` across 40 warm-JIT steady-state passes).
- **`PVM-32` Execution Speed (with zero-allocation transactional undo-journal rollback)**: **`0.060 ms/frame`** median (mean `0.088 ms`, IQR `0.023 ms`, p95 `0.192 ms`, **`28.04 MIPS`**, **`11,364 FPS`** headless headroom).
- **Fuzzing & Differential Oracle**: **2,000/2,000** deterministic adversarial fuzz cases (`scripts/fuzz.mjs`: 0 crashes/hangs) + **100%** cross-language parity with pure Python 3 stdlib oracle (`reference/planaria_oracle.py`: all 768 cells across 4 species, 28 Cauchy bundles, unaligned `49,177 B` mitosis, Bell CHSH `2.828427`, GHZ `|M_4| = 4.000000`).

---

## 10. Security Analysis & Known Limitations

1. **Unpinned Majority-Sybil Caveat (Formally Modeled)**: In *Pinned-Root Mode*, PLANARIA resists an arbitrarily large Trojan flood (even 100,000 forged cells from a coherent fake Merkle tree). In *Unpinned Consensus-Quorum Mode*, an adversary who injects a *self-consistent* fake lineage containing strictly more valid cells than the surviving genuine shard can win quorum election (explicitly proved in `unpinned_quorum_sybil_counterexample`). Production deployments requiring trustless storage security must pin the 128-bit Lineage Root (`--pinned`) or sign manifests with a persistent Ed25519 key (`PLANARIA_SIGNING_KEY_PEM`).
2. **Storage Overhead Trade-Off (Three Exact Ratios)**: Achieving simultaneous 91.7% Stratum-0 tolerance, 50/50 unaligned Mitosis, 16-byte inner RS burst armor, and 128-byte per-cell Merkle proofs incurs `4.0×` cell-count expansion (`192 / 48`), `6.17×` canonical file vs. maximum raw payload capacity (`98,304 B / 15,936 B`), and `24.6×–57.7×` canonical file vs. actual compiled species bytecode (`4,000 B` `AEGIS_DRIFT` to `1,704 B` `QUANTUM_CHRONICLE`). This trade-off is deliberate and tunable via `BUNDLE_SPECS`.
3. **Truncated 128-Bit Merkle Nodes**: Truncating SHA-256 to 128 bits inside the Depth-8 proof gives $2^{128}$ second-preimage resistance (sufficient against cell-forging against a fixed Lineage Root) and $2^{64}$ birthday collision resistance; applications requiring $2^{128}$ collision resistance against malicious compilers can widen cell size to 1,024 bytes with full 256-bit Merkle nodes.
4. **Formal Proof Scope Boundary**: The Lean 4 formalization proves the algebraic, combinatorial, safety, and isolation laws of the specification; it does not formally extract the JavaScript runtime (`src/*.js`, e.g., `TemporalEngine`'s $O(1)$ circular `RingBuffer` vs. Lean's `List.take 360`, or concrete 128-bit SHA-256 vs. Lean's abstract injective `hashPair`). Runtime correspondence is bridged by 30 test suites, 12/12 surgical mutants, 2,000 fuzz cases, and the clean-room Python 3 differential oracle.

---

## 11. Honest Novelty Assessment: Established Primitives vs. Original Architecture

- **Established Primitives (Prior Literature)**: $\text{GF}(2^8)$ finite-field arithmetic, Reed-Solomon codes, Berlekamp-Massey/Chien/Forney decoding, Cauchy MDS erasure matrices, Priority Encoding Transmission (Unequal Error Protection), Merkle authentication trees, SHA-256, Horodecki CHSH / Mermin GHZ criteria, and Ed25519 signatures are classic, foundational results credited in Section 12 and compared systematically in [`docs/LITERATURE_SEARCH.md`](../docs/LITERATURE_SEARCH.md).
- **Original Systems Architecture (PLANARIA)**: To our knowledge, PLANARIA is the first complete, self-contained, executable, formally verified system uniting **Unequal Error Protection (PET)** with **compiled multi-stratum executable code**, **zero-header exact-integer low-discrepancy cellular interleaving for unaligned zero-overlap Binary Mitosis**, **hardware-level runtime Control-Flow Anastomosis (`ORGAN_CALL`) with zero-allocation transactional trap rollback**, **Overlap-Eclipse-hardened interleaved inner RS + per-cell Merkle Byzantine quarantine against Cauchy decoder poisoning**, and **ABI-verified live-host Cross-Species Executable Xenografting** — all backed by a live 60 FPS WebGL2 temporal-quantum Studio, clean-room Python 3 differential oracle, 30 verification suites, 12/12 (100.0%) surgical mutation kills, 2,000 adversarial fuzz cases, interactive Proof Blueprint, and 85 pure Lean 4.35.0 proofs checked across 6 independent kernels. (Honest open-problem scope: PLANARIA solves **`0 / 1,900`** open problems in the Unsolved Problems Mega-Atlas; see [`docs/MEGA_ATLAS_CROSSCHECK.md`](../docs/MEGA_ATLAS_CROSSCHECK.md) and [`LIMITATIONS.md`](../LIMITATIONS.md).)

---

## 12. Cited Primary Sources & References

All 19 DOI-bearing references below are verified live against the Crossref REST API (HTTP 200, 0 retractions; archived in [`results/citation-audit.json`](../results/citation-audit.json)):

1. **Reed, I. S., & Solomon, G.** (1960). *Polynomial Codes over Certain Finite Fields*. Journal of the Society for Industrial and Applied Mathematics, 8(2), 300–304. DOI: `10.1137/0108018`
2. **Chien, R. T.** (1964). *Cyclic Decoding Procedures for Bose-Chaudhuri-Hocquenghem Codes*. IEEE Transactions on Information Theory, 10(4), 357–363. DOI: `10.1109/TIT.1964.1053699`
3. **Singleton, R. C.** (1964). *Maximum Distance $q$-nary Codes*. IEEE Transactions on Information Theory, 10(2), 116–118. DOI: `10.1109/TIT.1964.1053661`
4. **Forney, G. D.** (1965). *On Decoding BCH Codes*. IEEE Transactions on Information Theory, 11(4), 549–557. DOI: `10.1109/TIT.1965.1053825`
5. **Berlekamp, E. R.** (1968). *Algebraic Coding Theory*. McGraw-Hill, New York (rev. ed., World Scientific, 2015). DOI: `10.1142/9407`
6. **Massey, J. L.** (1969). *Shift-Register Synthesis and BCH Decoding*. IEEE Transactions on Information Theory, 15(1), 122–127. DOI: `10.1109/TIT.1969.1054260`
7. **Merkle, R. C.** (1987). *A Digital Signature Based on a Conventional Encryption Function*. Advances in Cryptology — CRYPTO '87, LNCS 293, 369–378. DOI: `10.1007/3-540-48184-2_32`
8. **Bloemer, J., Kalfane, M., Karp, R., Karpinski, M., Luby, M., & Zuckerman, D.** (1995). *An XOR-Based Erasure-Resilient Coding Scheme*. ICSI Technical Report TR-95-048, UC Berkeley. URL: `https://api.semanticscholar.org/CorpusID:16769482`
9. **Albanese, A., Blömer, J., Edmonds, J., Luby, M., & Sudan, M.** (1996). *Priority Encoding Transmission*. IEEE Transactions on Information Theory, 42(6), 1737–1744. DOI: `10.1109/18.556670`
10. **Luby, M.** (2002). *LT Codes*. Proceedings of the 43rd Annual IEEE Symposium on Foundations of Computer Science (FOCS), 271–280. DOI: `10.1109/SFCS.2002.1181950`
11. **Reddien, P. W., & Sánchez Alvarado, A.** (2004). *Fundamentals of Planarian Regeneration*. Annual Review of Cell and Developmental Biology, 20, 725–757. DOI: `10.1146/annurev.cellbio.20.010403.095114`
12. **Plank, J. S., & Xu, L.** (2006). *Optimizing Cauchy Reed-Solomon Codes for Fault-Tolerant Network Storage Applications*. Fifth IEEE International Symposium on Network Computing and Applications (NCA '06), 173–180. DOI: `10.1109/NCA.2006.43`
13. **Bernstein, D. J., Duif, N., Lange, T., Schwabe, P., & Yang, B.-Y.** (2012). *High-Speed High-Security Signatures*. Journal of Cryptographic Engineering, 2(2), 77–89. DOI: `10.1007/s13389-012-0027-1`
14. **NIST FIPS PUB 180-4** (2015). *Secure Hash Standard (SHS)*. National Institute of Standards and Technology, U.S. Department of Commerce. DOI: `10.6028/NIST.FIPS.180-4`
15. **de Moura, L., & Ullrich, S.** (2021). *The Lean 4 Theorem Prover and Programming Language*. Automated Deduction — CADE 28, LNCS 12699, 625–635. DOI: `10.1007/978-3-030-79876-5_37`
16. **Barker, R. H.** (1953). *Group Synchronizing of Binary Digital Systems*. In *Communication Theory*, W. Jackson (Ed.), Butterworths, London, 273–287. OCLC `4575975`.
17. **Horodecki, R., Horodecki, P., & Horodecki, M.** (1995). *Violating Bell Inequality by Mixed Spin-$\frac{1}{2}$ States: Necessary and Sufficient Condition*. Physics Letters A, 200(5), 340–344. DOI: `10.1016/0375-9601(95)00214-N`
18. **Mermin, N. D.** (1990). *Extreme Quantum Entanglement in a Superposition of Macroscopically Distinct States*. Physical Review Letters, 65(15), 1838–1840. DOI: `10.1103/PhysRevLett.65.1838`
19. **Wilson, E. B.** (1927). *Probable Inference, the Law of Succession, and Statistical Inference*. Journal of the American Statistical Association, 22(158), 209–212. DOI: `10.1080/01621459.1927.10502953`
20. **McNemar, Q.** (1947). *Note on the Sampling Error of the Difference between Correlated Proportions or Percentages*. Psychometrika, 12(2), 153–157. DOI: `10.1007/BF02295996`
21. **Holm, S.** (1979). *A Simple Sequentially Rejective Multiple Test Procedure*. Scandinavian Journal of Statistics, 6(2), 65–70. URL: `https://www.jstor.org/stable/4615733`
22. **Cohen, J.** (1988). *Statistical Power Analysis for the Behavioral Sciences* (2nd ed.). Lawrence Erlbaum / Routledge. DOI: `10.4324/9780203771587`
