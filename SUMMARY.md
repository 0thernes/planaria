# PLANARIA — Executive & Technical Summary Paper

**Title:** PLANARIA: Progressive Holographic Executable Architecture (`.hbin`), Multi-Stratum Compilation, Autonomous Control-Flow Anastomosis, and Cryptographic Cellular Quorum  
**Author:** Alexander S. Donahue ([0thernes LLC](https://0thernes.art) · `0_0@0thernes.art` · ORCID [0009-0006-8168-9648](https://orcid.org/0009-0006-8168-9648))  
**Release:** `v2.1.0` · **License:** Cosmogonic Non-Commercial Research & Play ([LICENSE](LICENSE))  
**Full Manuscript:** [paper/WHITE_PAPER.md](paper/WHITE_PAPER.md) · **Frozen PDF:** [dist/Donahue_2026_planaria.pdf](dist/Donahue_2026_planaria.pdf) · **Master Report:** [docs/MASTER_REPORT.md](docs/MASTER_REPORT.md)

---

## 1. The Structural Fragility of Classical Software

For eight decades since the stored-program architecture, compiled machine executables (`ELF`, `PE`, `Mach-O`, `WebAssembly`) have shared a single fatal topological assumption: **linear monolithic fragility**. Corrupting one byte inside a file header, flipping a critical jump offset, shifting the binary by a single unaligned byte, or truncating half of the file causes immediate, irreversible process death (`SIGSEGV` / loader rejection).

Naive remedies fail in two distinct ways:
1. **Simple File Duplication** wastes linear storage, still fails under distributed uniform corruption, and exhibits no graceful degradation below full-copy loss.
2. **Single-Rate Erasure Coding** (e.g., wrapping an executable in an $(n, k)$ Reed-Solomon archive) introduces a sharp **erasure cliff**: 100% execution at $k$ surviving shards, and **0% total binary death** at $k - 1$ shards — while leaving outer linear decoding catastrophically exposed to **single-cell Byzantine poisoning**.

---

## 2. The PLANARIA Paradigm (Five Unnatural Phenomena in One Real Machine)

**PLANARIA** introduces a complete, zero-dependency executable ecosystem — binary format (`.hbin`), compiler (`Plang`), 32-bit virtual machine (`PVM-32`), standalone CLI, interactive 60 FPS + 48 kHz Surgical Vivisection Studio, and 31 pure Lean 4 (`v4.35.0`) machine-checked proofs — built around **Progressive Holographic Instruction Stratification (PHIS)**:

1. **Zero-Header Self-Synchronizing Cellular Container (`.hbin`)**: No header at byte 0, no central table, no fixed offsets. Every pristine 98,304-byte (96 KiB) binary is a low-discrepancy interleaved stream of **192 fixed 512-byte Holographic Cells**, each carrying a 32-bit fuzzy Barker sync word (tolerating $\le 3$ bit flips), 16B header, 332B Cauchy-coded payload, 128B Depth-8 SHA-256-128 Merkle proof, and 32B 2-way interleaved `RS(254, 238)` inner ECC armor.
2. **Zero-Overlap Planarian Binary Mitosis**: Slicing any pristine `.hbin` file cleanly down the middle — even at an **unaligned prime byte offset** (`49177`) with zero shared bytes — yields TWO independent halves that BOTH boot at full Stratum 3 and each regenerate the **100.000% SHA-256 bit-exact original 96 KiB executable** in ~21 ms.
3. **Zero-Cliff Graceful Degradation & Autonomous Control-Flow Anastomosis**: Every compiled program stratifies its organs across 4 nested Cauchy MDS thresholds ($k_0=2$, $k_1=4$, $k_2 \in \{6, 8\}$, $k_3 \in \{8, 16\}$). When damaged or surgically amputated at runtime, `PVM-32`'s native `ORGAN_CALL` instruction dynamically rewires the call graph (`S3 -> S2 -> S1 -> S0 Ghost Stub`) without halting execution or wiping RAM.
4. **Dual-Layer Self-Healing & Cryptographic Byzantine Immune System**: Inner interleaved `RS(254, 238)` (Berlekamp-Massey + Chien + Forney) heals up to **16 consecutive burst-error bytes inside EVERY single cell simultaneously** (3,072 corrupted bytes = 3.13% raw error rate across the entire file!). Every cell is then authenticated via its embedded Depth-8 SHA-256 Merkle proof *before* entering Cauchy GF($2^8$) decoding — quarantining **100% of RS-valid forged Byzantine Trojan cells** (whereas disabling Merkle quarantine allows **1 single Trojan cell** to corrupt 415/416 bytes of the boot kernel).
5. **ABI-Verified Cross-Species Executable Xenografting**: All compiled `.plang` species (`AEGIS_DRIFT`, `SYNTH_REACTOR`, `CIPHER_VAULT`) communicate across organs via a standardized 512-word Shared-Memory World-State ABI. Amputating a host's `RENDERER` and `AUDIO` organs and raw-concatenating bytes from a foreign species boots a **live hybrid Chimera executable** (e.g., arcade starfighter combat rendered through a Lissajous FM plasma oscilloscope) that can be exported as its own self-healing, mitosis-capable 96 KiB `.hbin` binary.

---

## 3. Headline Empirical & Formal Verification Results

| Metric / Torture Scenario | Traditional Linear Binary (`LINBIN01`) | Single-Stratum `RS(40,16)` Cliff | **PLANARIA 4-Stratum (`.hbin`)** |
|---|---|---|---|
| **Single 1-Bit Flip in Code** | **0% (Fatal `SIGSEGV`)** | 100% | **100% (Inner RS Healed)** |
| **Unaligned 50/50 Bisection (`49177`)** | **0% (Right Half Dead)** | 100% (aligned only) | **100% BOTH Halves Bit-Exact SHA-256** |
| **16-Byte Burst Inside ALL 192 Cells (3,072B)** | **0% (Dead at 2B)** | **0% (All Cells Fail)** | **100% (192/192 Cells Repaired)** |
| **+137B Noise Shift + Full Cell Shuffle** | **0% (Header Destroyed)** | **0% (Framing Lost)** | **100% (192/192 Unaligned Recovered)** |
| **60% Random File Obliteration** | **0.0%** | 52.5% | **100.0%** (20 S3, 20 S2 / 40 trials) |
| **72% Random File Obliteration** | **0.0%** | **0.0% (Cliff Death)** | **100.0%** (32 S2, 8 S1 / 40 trials) |
| **80% Random File Obliteration** | **0.0%** | **0.0%** | **97.5%** (10 S2, 28 S1, 1 S0 / 40 trials) |
| **92% Random File Obliteration (8% Left)** | **0.0%** | **0.0%** | **70.0%** (7 S1, 21 S0 Ghost / 40 trials) |
| **1–192 RS-Valid Byzantine Trojans Prepended** | N/A | **100% Poisoned (415/416B)** | **100% Quarantined · 0% Poisoned** |
| **Full 96 KiB Decode / `PVM-32` Throughput** | < 1 ms | ~5 ms | **10.5 ms decode · 19.45 MIPS (`0.12 ms/f`)** |
| **Machine-Checked Formal Proofs** | — | — | **38 Lean 4 (`v4.35.0`) Theorems · 0 `sorryAx` · 16/16 Suites** |

---

## 4. Honest Novelty Verdict

- **Did PLANARIA discover new laws of physics or solve an open pure-mathematics conjecture?** **No.** All underlying finite-field, Reed-Solomon, Cauchy-matrix, Priority Encoding Transmission, and SHA-256 Merkle primitives belong to well-established coding-theory and cryptographic literature (cited in [paper/WHITE_PAPER.md](paper/WHITE_PAPER.md) §12).
- **What IS genuinely novel and 1/1 here?** PLANARIA synthesizes those primitives into the **first complete, end-to-end, compiled, executable, interactive, and formally verified Progressive Holographic Executable Architecture**: an actual programming language (`Plang`), register VM (`PVM-32`), headerless cellular binary format (`.hbin`), inner-interleaved RS + Merkle Byzantine quarantine + stratified outer Cauchy MDS codec, live hot-swappable Control-Flow Anastomosis, zero-overlap unaligned Binary Mitosis, and ABI-verified Cross-Species Executable Xenografting — verified simultaneously by **31 pure Lean 4 kernel proofs** and a **12-suite Popperian falsification harness**.
