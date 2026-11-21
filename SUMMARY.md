# PLANARIA — Executive & Technical Summary Paper

**Title:** PLANARIA: Progressive Holographic Executable Architecture (`.hbin`), Multi-Stratum Compilation, Autonomous Control-Flow Anastomosis, and Cryptographic Cellular Quorum  
**Author:** Alexander S. Donahue ([0thernes LLC](https://0thernes.art) · `0_0@0thernes.art` · ORCID [0009-0006-8168-9648](https://orcid.org/0009-0006-8168-9648))  
**Release:** `v2.2.0` · **License:** Cosmogonic Non-Commercial Research & Play ([LICENSE](LICENSE))  
**Full Manuscript:** [paper/WHITE_PAPER.md](paper/WHITE_PAPER.md) · **Frozen 8-Page PDF:** [dist/Donahue_2026_planaria.pdf](dist/Donahue_2026_planaria.pdf) · **Master Report:** [docs/MASTER_REPORT.md](docs/MASTER_REPORT.md)

---

## 1. The Structural Fragility of Classical Software

For eight decades since the stored-program architecture, compiled machine executables (`ELF`, `PE`, `Mach-O`, `WebAssembly`) have shared a single fatal topological assumption: **linear monolithic fragility**. Corrupting one byte inside a file header, flipping a critical jump offset, shifting the binary by a single unaligned byte, or truncating half of the file causes immediate, irreversible process death (`SIGSEGV` / loader rejection).

Naive remedies fail in two distinct ways:
1. **Simple File Duplication** wastes linear storage, still fails under distributed uniform corruption, and exhibits no graceful degradation below full-copy loss.
2. **Single-Rate Erasure Coding** (e.g., wrapping an executable in an $(n, k)$ Reed-Solomon archive) introduces a sharp **erasure cliff**: 100% execution at $k$ surviving shards, and **0% total binary death** at $k - 1$ shards — while leaving outer linear decoding catastrophically exposed to **single-cell Byzantine poisoning**.

---

## 2. The PLANARIA Paradigm (Five Unnatural Phenomena in One Real Machine)

**PLANARIA v2.2.0** introduces a complete, zero-dependency, adversarially hardened executable ecosystem — binary format (`.hbin`), compiler (`Plang`), 32-bit virtual machine (`PVM-32`), hardened CLI & HTTP server, WebGL2 3D temporal-quantum engine, 48 kHz PolyBLEP AudioWorklet Surgical Vivisection Studio, **24/24 verification & security suites**, and **62 pure Lean 4 (`v4.35.0`) machine-checked proofs** — built around **Progressive Holographic Instruction Stratification (PHIS)**:

1. **Zero-Header Self-Synchronizing Cellular Container (`.hbin`)**: No header at byte 0, no central table, no fixed offsets. Every pristine 98,304-byte (96 KiB) binary is an exact-integer low-discrepancy interleaved stream (`posNum(b,i) = (14i+2b+1)(480/n_b)`) of **192 fixed 512-byte Holographic Cells**, harvested by a byte-granular Overlap-Eclipse-resistant sliding correlator with ±512B cadence flywheel and explicit DoS caps.
2. **Zero-Overlap Planarian Binary Mitosis**: Slicing any pristine `.hbin` file cleanly down the middle — even at an **unaligned prime byte offset** (`49177`) with zero shared bytes — yields TWO independent halves that BOTH boot at full Stratum 3 and each regenerate the **100.000% SHA-256 bit-exact original 96 KiB executable** in ~21–25 ms.
3. **Zero-Cliff Graceful Degradation & Autonomous Control-Flow Anastomosis**: Every compiled program stratifies its organs across 4 nested Cauchy MDS thresholds ($k_0=2$, $k_1=4$, $k_2 \in \{6, 8\}$, $k_3 \in \{8, 16\}$). When damaged or surgically amputated at runtime, `PVM-32`'s native `ORGAN_CALL` instruction dynamically rewires the call graph (`S3 -> S2 -> S1 -> S0 Ghost Stub`) without halting execution or wiping RAM — outperforming both single-stratum `RS(40,16)` and equal-storage flat `RS(192,48)`.
4. **Dual-Layer Self-Healing & Cryptographic Byzantine Immune System**: Inner interleaved `RS(254, 238)` (Berlekamp-Massey + Chien + Forney) heals up to **16 consecutive burst-error bytes inside EVERY single cell simultaneously** (`3,072` corrupted bytes = `3.13%` raw error rate across the entire file!). Every cell is authenticated via its embedded Depth-8 domain-separated (`0x00`/`0x01`/`0x02`) SHA-256-128 Merkle proof *before* entering Cauchy GF($2^8$) decoding — quarantining **100% of RS-valid forged Byzantine Trojan & Overlap-Eclipse cells** (whereas disabling Merkle quarantine allows **1 single Trojan cell** to corrupt 470/472 bytes of the boot kernel).
5. **ABI-Verified Cross-Species Executable Xenografting & 3D Temporal-Quantum Coupling**: All four compiled living species (`QUANTUM_CHRONICLE`, `AEGIS_DRIFT`, `SYNTH_REACTOR`, `CIPHER_VAULT`) share a 512-word World-State ABI with per-species `mem[15]` sentinels, enabling live Cross-Species Chimeras (`RENDERER`, `AUDIO`, `FX`, and `S1_CORE_LOGIC` transplants) while coupling directly to a WebGL2 3D temporal-quantum engine (4-qubit Horodecki CHSH $|S|=2\sqrt{2}$ & Mermin GHZ $|M_4|=4.0$, 360-frame $O(1)$ rewind, and `6,421,059,993,600` exact reachable 1/1 builds × $2^{64}$ SHA-256 lineages).

---

## 3. Headline Empirical & Formal Verification Results

| Metric / Torture Scenario | Traditional Linear Binary (`LINBIN01`) | Single-Stratum `RS(40,16)` Cliff / Unsafe | **PLANARIA v2.2.0 (`.hbin`)** |
|---|---|---|---|
| **Single 1-Bit Flip in Code** | **0% (Fatal `SIGSEGV`)** | 100% | **100% (Inner RS Healed)** |
| **Unaligned 50/50 Bisection (`49177`)** | **0% (Right Half Dead)** | 100% (aligned only) | **100% BOTH Halves Bit-Exact SHA-256** |
| **16-Byte Burst Inside ALL 192 Cells (3,072B)** | **0% (Dead at 2B)** | **0% (All Cells Fail)** | **100% (192/192 Cells Repaired)** |
| **18-Byte Burst (Tight Bound Falsification)** | 0% | 0% | **0% (0 Silent Miscorrections)** |
| **+137B Noise Shift + Full Cell Shuffle** | **0% (Header Destroyed)** | **0% (Framing Lost)** | **100% (192/192 Unaligned Recovered)** |
| **60% Random File Obliteration** | **0.0%** | 57.5% | **100.0%** (`22 S3, 18 S2` / 40 trials) |
| **76% Random File Obliteration** | **0.0%** | **0.0% (Cliff Death)** | **100.0%** (`25 S2, 15 S1` / 40 trials) |
| **80% Random File Obliteration** | **0.0%** | **0.0%** | **95.0%** (`13 S2, 25 S1` / 40 trials) |
| **92% Random File Obliteration (8% Left)** | **0.0%** | **0.0%** | **65.0%** (`5 S1, 21 S0 Ghost` / 40 trials) |
| **1–192 RS-Valid Trojans + Overlap-Eclipse** | N/A | **99.6% Poisoned (`470/472B`)** | **100% Quarantined · 0% Poisoned** |
| **Warm-JIT Full Decode / `PVM-32` Speed** | < 1 ms | ~5 ms | **8.96 ms decode · 27.02 MIPS (`0.082 ms/f`)** |
| **Machine-Checked Formal Proofs & Tests** | — | — | **62 Lean 4 (`v4.35.0`) Theorems · 0 `sorryAx` · 24/24 Suites** |

---

## 4. Honest Novelty Verdict

- **Did PLANARIA discover new laws of physics or solve an open pure-mathematics conjecture?** **No.** All underlying finite-field, Reed-Solomon, Cauchy-matrix, Priority Encoding Transmission, SHA-256 Merkle, and 4-qubit quantum mechanics primitives belong to well-established coding-theory, cryptographic, and physics literature (cited in [paper/WHITE_PAPER.md](paper/WHITE_PAPER.md) §12).
- **What IS genuinely novel and 1/1 here?** PLANARIA synthesizes those primitives into a **complete, zero-dependency, adversarially hardened, compiled, executable, interactive 3D, and formally verified Progressive Holographic Executable Architecture**: an actual programming language (`Plang`), register VM (`PVM-32`), headerless cellular binary format (`.hbin`), inner-interleaved RS + Merkle Byzantine quarantine + stratified outer Cauchy MDS codec, live hot-swappable Control-Flow Anastomosis, zero-overlap unaligned Binary Mitosis, and ABI-verified Cross-Species Executable Xenografting — verified simultaneously by **62 pure Lean 4 kernel proofs** and a **24-suite Popperian falsification & security harness**.
