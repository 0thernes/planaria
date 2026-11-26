# PLANARIA v2.3

PLANARIA is a zero-dependency progressive holographic executable architecture (`.hbin`), structured multi-stratum compiler (`Plang`), fault-isolated virtual machine (`PVM-32`), 4-qubit temporal-quantum 3D WebGL2 Studio, and 6-kernel pure Lean 4.35.0 formal verification suite.

[![Project Status: Active](https://www.repostatus.org/badges/latest/active.svg)](https://www.repostatus.org/#active)
[![License: Cosmogonic Non-Commercial](https://img.shields.io/badge/License-Cosmogonic_Non--Commercial-0ea5e9)](LICENSE)
[![Lean 4.35.0](https://img.shields.io/badge/Lean_4.35.0-70_Theorems_%C2%B7_6_Kernels_%C2%B7_0_sorry-10b981)](lean/README.md)
[![Falsification & Security](https://img.shields.io/badge/Verification_Suites-28%2F28_Passed-10b981)](test/verify.mjs)
[![Mutation Score](https://img.shields.io/badge/Mutation_Testing-10%2F10_(100%25)_Killed-10b981)](scripts/mutation-test.mjs)
[![Runtime Dependencies](https://img.shields.io/badge/Runtime_Dependencies-0-38bdf8)](THIRD_PARTY_NOTICES.md)

**Author:** Alexander Stephen Donahue — Independent Researcher ([0thernes project](https://0thernes.art), Spokane, WA, USA · `0_0@0thernes.art` · ORCID [0009-0006-8168-9648](https://orcid.org/0009-0006-8168-9648))  
**Release:** `v2.3.0` · **Status:** Active · **License:** Cosmogonic License — Non-Commercial Research & Play ([LICENSE](LICENSE) · [LEGAL.md](LEGAL.md))

![PLANARIA v2.3.0 Interactive 3D Temporal-Quantum & Surgical Vivisection Studio](docs/media/studio-v2-3.png)

> Cut a `98,304`-byte `.hbin` executable cleanly in half at an arbitrary unaligned prime byte offset (`49177`): **BOTH** disjoint halves independently boot at full Stratum 3 and regenerate the 100.000% SHA-256 bit-exact parent binary. Obliterate **80%–92%** of the file (past the cliff where monolithic `LINBIN01`, `RS(40,16)`, and equal-storage flat `RS(192,48)` are all **0.0%** alive), and PLANARIA remains bootable (**95.0%** at 80%, **82.5%** at 88%, **65.0%** at 92%, Holm–Bonferroni $p_{\text{Holm}} \le 6.26 \times 10^{-7}$).

---

## Table of Contents

1. [Navigation & Publications](#navigation--publications)
2. [Five-Second Formal Proof Audit (`#print axioms`, 70 Theorems, 6 Kernels)](#five-second-formal-proof-audit-print-axioms-70-theorems-6-kernels)
3. [Why PLANARIA Exists (The Five Unnatural Phenomena)](#why-planaria-exists-the-five-unnatural-phenomena)
4. [Architecture Overview](#architecture-overview)
5. [Quickstart & Full Independent Verification](#quickstart--full-independent-verification)
6. [Usage & Examples (CLI Torture, Surgery & Runnable Scripts)](#usage--examples-cli-torture-surgery--runnable-scripts)
7. [Headline Statistical Benchmarks (4 Architectures Including Equal-Storage `RS(192,48)`)](#headline-statistical-benchmarks-4-architectures-including-equal-storage-rs19248)
8. [Four Compiled Living Species & 3D Temporal-Quantum Engine](#four-compiled-living-species--3d-temporal-quantum-engine)
9. [Epistemic Scope, Limitations & Licensing](#epistemic-scope-limitations--licensing)

---

## Navigation & Publications

| Document | Description |
|---|---|
| **[dist/Donahue_2026_planaria.pdf](dist/Donahue_2026_planaria.pdf)** | Frozen Tectonic AMS-LaTeX White Paper PDF (`v2.3.0`, TikZ/PGFPlots, Claims Ledger, Fidelity Table, Statistical Inference) ([`paper/main.tex`](paper/main.tex)) |
| **[CLAIMS.md](CLAIMS.md)** & **[LIMITATIONS.md](LIMITATIONS.md)** | Numbered falsifiable claims ledger, real-vs-metaphor boundaries & honest `0 / 1,900` Mega-Atlas audit |
| **[REPLICATION.md](REPLICATION.md)** & **[VERIFICATION.md](VERIFICATION.md)** | Clean-clone reproduction playbook, SHA-256 manifests (`MANIFEST.sha256`, `data/MANIFEST.sha256`) & Ed25519 attestation |
| **[docs/benchmarks.md](docs/benchmarks.md)** & **[docs/preregistration.md](docs/preregistration.md)** | Pre-registered hypotheses `H1`–`H4`, Wilson 95% CIs, McNemar/Holm–Bonferroni tables & latency budgets |
| **[docs/reviews/2026-11-25-10-pass-red-team-audit.md](docs/reviews/2026-11-25-10-pass-red-team-audit.md)** | Complete 10-pass red-team review, 114 classified findings (all 10 classes), Statement-Fidelity Audit Table & Aaronson checklist |
| **[docs/index.md](docs/index.md)** | Full documentation hub (`architecture.md`, `adr/0001..0004`, `configuration.md`, `operations.md`, `threat-model.md`, `faq.md`, `glossary.md`, `run-log.md`) |
| **[lean/README.md](lean/README.md)** & **[formalization.yaml](formalization.yaml)** | 70 pure Lean 4.35.0 theorems (`Challenge.lean`, `Solution.lean`, `comparator.json`, 6 independent kernels) |
| **[SUMMARY.md](SUMMARY.md)** & **[INDEX.md](INDEX.md)** | Standalone executive summary paper & complete file/theorem master index |
| **[LEGAL.md](LEGAL.md)** & **[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)** | Authorship, AI-assistance & copyrightability disclosure, zero-dep notice & non-commercial license |

---

## Five-Second Formal Proof Audit (`#print axioms`, 70 Theorems, 6 Kernels)

Every formal claim is proved in **pure Lean 4 (`leanprover/lean4:v4.35.0`, `module` system, zero Mathlib)** across standalone [`lean/Challenge.lean`](lean/Challenge.lean) and [`lean/Solution.lean`](lean/Solution.lean) and independently checked by **6 distinct Lean kernels** (`lean4`, `leanchecker`, `leanchecker-paranoid`, `nanoda_bin`, `con-leche`, `con-ron`, plus `lean4lean` & `lake comparator --paranoid` inside `bubblewrap` on Ubuntu CI; see [results/lean4-multi-kernel.txt](results/lean4-multi-kernel.txt)).

```bash
cd lean && lake build && lake env lean VerifyAxioms.lean
```

**Verbatim kernel output excerpt** (complete 70-line log in [results/lean4-audit.txt](results/lean4-audit.txt) — **0 `sorryAx`, 0 `native_decide`, 0 `trustCompiler`, 0 custom axioms; 12 purely constructive zero-axiom theorems**):

```text
'Planaria.GF256.gfMul_comm' depends on axioms: [propext, Classical.choice, Quot.sound]
'Planaria.GF256.gfMul_assoc' depends on axioms: [propext, Classical.choice, Quot.sound]
'Planaria.GF256.cauchy2_exact_decode' does not depend on any axioms
'Planaria.Mitosis.planaria_schedule_nodup_and_sorted_halves' depends on axioms: [propext, Quot.sound]
'Planaria.Anastomosis.viability_s3_without_b2_matches_hbin' does not depend on any axioms
'Planaria.Anastomosis.zero_cliff_strict_separation' does not depend on any axioms
'Planaria.Byzantine.unpinned_quorum_tie_fail_closed' depends on axioms: [propext, Quot.sound]
'Planaria.Byzantine.unpinned_quorum_sybil_counterexample' does not depend on any axioms
'Planaria.Xenograft.xenograft_sovereign_b0_b6_immutable' depends on axioms: [propext]
'Planaria.QuantumTemporal.cnot4Q_preserves_normSq4' depends on axioms: [propext, Quot.sound]
'Planaria.QuantumTemporal.combinatorial_1of1_space_exceeds_6_trillion' does not depend on any axioms
```

---

## Why PLANARIA Exists (The Five Unnatural Phenomena)

1. **Zero-Overlap Planarian Binary Mitosis**: Slice a pristine `98,304`-byte `.hbin` binary right down the middle — even at an unaligned prime byte offset like `49177` (zero shared bytes) — and **BOTH halves independently boot at Stratum 3 and regenerate the 100.000% SHA-256 bit-exact original 96 KiB executable** (`12.57–14.21 ms` combined).
2. **Zero-Cliff Graceful Degradation ("The 12% Ghost")**: Delete **80%–92%** of the binary (past the hard cliff where monolithic `LINBIN01`, `RS(40,16)`, and equal-storage flat `RS(192,48)` are all **0.0%** alive). PLANARIA steps down across 4 nested holographic strata (`S3 -> S2 -> S1 -> S0 Stem Nucleus`) and continues executing live via hardware `ORGAN_CALL` **Control-Flow Anastomosis**.
3. **File-Wide Simultaneous 16-Byte Burst Radiation Self-Healing**: Inject a **16-byte contiguous burst error inside EVERY SINGLE ONE of the 192 cells simultaneously** (`3,072` corrupted bytes = `3.13%` file-wide corruption), shift by `137` unaligned garbage bytes, shuffle all 192 cells, and inner 2-way interleaved `RS(254, 238)` (Berlekamp–Massey + Chien + Forney) heals **192/192 cells** to 100% bit-exactness (failing cleanly with 0 silent miscorrections at the tight `18 B` bound).
4. **Cryptographic Byzantine Immune System & Overlap-Eclipse Defense**: Every 512-byte cell carries a 128-byte Depth-8 domain-separated (`0x00`/`0x01`/`0x02`) SHA-256-128 Merkle inclusion proof harvested via an Overlap-Eclipse-resistant sliding correlator with iterative backward flywheel and O(1) sync-flood bypass. Inject `1–192` RS-valid forged Trojans — **100% are quarantined before touching Cauchy GF($2^8$) decoding** (toggling quarantine OFF allows **1 single Trojan** to corrupt `470/472` bytes of `S0_STEM_NUCLEUS`).
5. **ABI-Verified Cross-Species Executable Xenografting**: Amputate non-sovereign organs (`S1_CORE_LOGIC`, `S2_CORTEX_RENDER`, `S2_SYNTH_AUDIO`, `S3_ORGANISM_FX`) from a living host binary, raw-concatenate bytes from a second species, and boot a trap-free **Hybrid Chimera** — while strictly enforcing Kernel (`B0`) and Genome (`B6`) sovereignty and refusing dead-host grafts.

---

## Architecture Overview

```mermaid
flowchart LR
  SRC["Plang Source (.plang)"] --> CMP["Plang Multi-Stratum Compiler"]
  CMP --> BUNDLES["6 Bytecode Bundles + Genome Ledger"]
  BUNDLES --> CAUCHY["Outer Cauchy MDS over GF(2^8) (k=2,4,6,8,16)"]
  CAUCHY --> MERKLE["Depth-8 SHA-256-128 Merkle Tree (192 Cells)"]
  MERKLE --> RS["2-Way Interleaved RS(254,238) + 4B Fuzzy Sync"]
  RS --> HBIN["98,304B Headerless .hbin Binary"]
  HBIN --> SURG["Bisect / Shred / Radiate / Trojans / Xenograft"]
  SURG --> DEC["Sliding Sync + Backward Flywheel -> RS -> Merkle Quarantine -> Cauchy"]
  DEC --> PVM["PVM-32 VM + Hot-Swap Control-Flow Anastomosis"]
  PVM --> OUT["60 FPS WebGL2 3D + 2D CRT + 48 kHz PolyBLEP AudioWorklet"]
```

---

## Quickstart & Full Independent Verification

Requires **Node.js ≥ 20** (zero `npm install` runtime dependencies) and optionally **Lean 4 `v4.35.0`** and **Tectonic `>= 0.15`**.

```bash
# 1. Deterministically compile all 4 living .plang species -> 96 KiB artifacts/*.hbin
npm run build

# 2. Run all 28 verification, property-based, metamorphic, CLI & HTTP security suites
npm test

# 3. Run all 10 surgical mutation tests (target: 10/10 = 100.0% killed)
npm run mutate

# 4. Run static syntax, security-sink, placeholder, entity & citation checks
npm run lint && npm run check:citations

# 5. Reproduce 4-architecture paired Monte Carlo benchmarks + statistical tests
npm run benchmark

# 6. Machine-check all 70 pure Lean 4.35.0 theorems (0 sorryAx, 0 custom axioms)
cd lean && lake build && lake env lean VerifyAxioms.lean && cd ..

# 7. Launch the Interactive 3D Temporal-Quantum & Surgical Vivisection Studio
npm start
# Open http://127.0.0.1:4174/  (Health endpoint: http://127.0.0.1:4174/healthz)
```

With [`just`](https://github.com/casey/just), run the full clean-clone pipeline in one word: `just reproduce`.

---

## Usage & Examples (CLI Torture, Surgery & Runnable Scripts)

### Runnable Zero-Dependency JavaScript Examples (`examples/`)

```bash
node examples/01-mitosis-roundtrip.mjs   # Zero-overlap prime bisection -> bit-exact dual regeneration
node examples/02-byzantine-quarantine.mjs # RS-valid Trojans: Merkle Quarantine ON (0% poison) vs OFF (99.6%)
node examples/03-xenograft-chimera.mjs    # Live AEGIS_DRIFT x SYNTH_REACTOR chimera + 60 PVM-32 frames
```

### Standalone CLI Surgery Cookbook (`bin/planaria.mjs`)

```bash
# 1. Cut aegis_drift.hbin at unaligned prime offset 49177 (zero shared bytes)
node bin/planaria.mjs bisect artifacts/aegis_drift.hbin left.hbin right.hbin --offset 49177

# 2. Regenerate the bit-exact 98,304-byte original solely from the headerless right half
node bin/planaria.mjs heal right.hbin -o healed.hbin
sha256sum artifacts/aegis_drift.hbin healed.hbin   # 100% SHA-256 IDENTICAL

# 3. Fuse damaged shards across an unaligned 53-byte noise gap
node bin/planaria.mjs fuse left.hbin right.hbin -o fused.hbin --gap 53

# 4. Inject 14B burst radiation into ALL 192 cells + 137B shift + shuffle + 25 Trojans
node bin/planaria.mjs damage artifacts/aegis_drift.hbin -o tortured.hbin \
  --bitrot 14 --burst --shift 137 --shuffle --trojans 25
node bin/planaria.mjs inspect tortured.hbin

# 5. Amputate Render+Audio from AEGIS_DRIFT & graft SYNTH_REACTOR -> Standalone Chimera
node bin/planaria.mjs xenograft artifacts/aegis_drift.hbin artifacts/synth_reactor.hbin -o chimera.hbin
node bin/planaria.mjs run chimera.hbin --frames 60

# 6. Disassemble PVM-32 bytecode or inspect Bundle 6 Genome JSON
node bin/planaria.mjs disasm artifacts/aegis_drift.hbin --bundle 0 --max 24
node bin/planaria.mjs disasm artifacts/aegis_drift.hbin --bundle 6
```

---

## Headline Statistical Benchmarks (4 Architectures Including Equal-Storage `RS(192,48)`)

Reproduced verbatim in [results/benchmarks.json](results/benchmarks.json) (`PLANARIA-BENCHMARKS-1.2`, pre-registered in [docs/preregistration.md](docs/preregistration.md), `N = 40` paired seeds/point, Node `v25.8.2`):

| Torture Scenario | Linear (`LINBIN01`) | `RS(40,16)` Cliff | Equal-Storage `RS(192,48)` | **PLANARIA v2.3 (`.hbin`)** |
|---|---:|---:|---:|---:|
| **1-Bit Flip in Active Code** | **0.0%** *(Fatal)* | 100.0% | 100.0% | **100.0%** *(RS Healed)* |
| **Unaligned 50/50 Bisection (`49177`)** | **0.0%** | N/A | 100.0% *(aligned)* | **100.0% BOTH Halves Bit-Exact (`13.21 ms`)** |
| **16 B Burst in ALL 192 Cells (`3,072 B`)** | **0.0%** *(Dead at 2 B)* | **0.0%** | **0.0%** | **100.0% (`192/192` Repaired)** |
| **18 B Burst (Tight Bound Falsification)** | 0.0% | 0.0% | 0.0% | **0.0% (`0` Silent Miscorrections)** |
| **76% Random Obliteration** | **0.0%** | **0.0%** | **0.0%** *(75% Cliff)* | **100.0%** `[91.2, 100.0]`, $p_{\text{Holm}}=4.55\times 10^{-11}$ |
| **80% Random Obliteration** | **0.0%** | **0.0%** | **0.0%** | **95.0%** `[83.5, 98.6]`, $h=2.691$, $p_{\text{Holm}}=1.75\times 10^{-10}$ |
| **88% Random Obliteration ("12% Ghost")** | **0.0%** | **0.0%** | **0.0%** | **82.5%** `[68.1, 91.3]`, $h=2.278$, $p_{\text{Holm}}=5.12\times 10^{-9}$ |
| **92% Random Obliteration (8% Left)** | **0.0%** | **0.0%** | **0.0%** | **65.0%** `[49.5, 77.9]`, $h=1.875$, $p_{\text{Holm}}=6.26\times 10^{-7}$ |
| **1–192 RS-Valid Trojans + Overlap-Eclipse** | N/A | **99.6% Poisoned** | **99.6% Poisoned** | **100% Quarantined · 0% Poisoned** |
| **5 Cross-Species Xenograft Chimeras** | Impossible | Impossible | Impossible | **5/5 Bootable S3 · 60 Frames · 0 Traps** |
| **Median Decode / `PVM-32` Throughput** | `< 1 ms` | `~5 ms` | `~5 ms` | **5.994 ms** (`IQR 0.268 ms`) · **42.85 MIPS (`0.041 ms/f`)** |

---

## Four Compiled Living Species & 3D Temporal-Quantum Engine

- **`QUANTUM_CHRONICLE.hbin`** (`programs/quantum_chronicle.plang`, `426` insns): 3D Chrono-Quantum holographic driver coupled to the WebGL2 3D Arena (`src/web/renderer3d.js`, `src/quantum/`, `src/world/`).
- **`AEGIS_DRIFT.hbin`** (`programs/aegis_drift.plang`, `991` insns): Playable neon vector starfighter arcade with plasma bolts, shrapnel, parallax stars, and 4-voice synthwave audio.
- **`SYNTH_REACTOR.hbin`** (`programs/synth_reactor.plang`, `645` insns): 4-voice Lydian polyphonic FM/subtractive synthesizer & Lissajous plasma oscilloscope.
- **`CIPHER_VAULT.hbin`** (`programs/cipher_vault.plang`, `534` insns): 12-lane 32-bit ARX stream-cipher & cryptographic avalanche bit-matrix workstation.

---

## Epistemic Scope, Limitations & Licensing

- **No open pure-mathematics or physics conjectures are claimed solved (`0 / 1,900` in the Unsolved Problems Mega-Atlas).** All underlying coding, cryptographic, and quantum-information primitives are credited to established literature; PLANARIA's contribution is a formally verified, adversarially hardened computer-systems architecture. See [LIMITATIONS.md](LIMITATIONS.md) and [CLAIMS.md](CLAIMS.md).
- **AI Assistance Disclosure:** Built under Alexander Stephen Donahue's direction with substantive AI engineering/formalization assistance (Google DeepMind / Antigravity agents), audited by 6 independent Lean kernels, 28 verification suites, and 10 surgical mutants. See [LEGAL.md](LEGAL.md).
- **License:** Copyright © 2026 **Alexander Stephen Donahue (0thernes)** `<0_0@0thernes.art>`. Licensed under the **COSMOGONIC LICENSE — NON-COMMERCIAL RESEARCH & PLAY** ([LICENSE](LICENSE); trade-off vs. OSI documented in [ADR-0004](docs/adr/0004-non-commercial-license-vs-osi-dilemma.md)).
