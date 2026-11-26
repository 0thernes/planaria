# Frequently Asked Questions (`v2.4.0`)

## Science, Scope & Claims

### Did PLANARIA solve any open problems from the Unsolved Problems Mega-Atlas?
**No (`0 / 1,900` solved).** We programmatically scanned all `1,900` entries in `0thernes/unsolved-problems-mega-atlas` and archived the full nearest-neighbor audit in [docs/MEGA_ATLAS_CROSSCHECK.md](MEGA_ATLAS_CROSSCHECK.md). PLANARIA is an original computer-systems, binary-architecture, compiler, virtual-machine, and formal-verification engineering artifact. Its coding-theoretic primitives (Reed–Solomon, Cauchy MDS, Priority Encoding Transmission, Merkle trees) are established literature; its quantum module is an exact classical simulation of a 4-qubit register, not a new physical theory or quantum computer. See [LIMITATIONS.md](../LIMITATIONS.md).

### What IS genuinely novel in PLANARIA?
1. **Progressive Holographic Executable Format (`.hbin`):** Headerless 192-cell binary combining 4-stratum Cauchy MDS unequal error protection (`k=2/24` through `k=16/40`), interleaved inner `RS(254, 238)`, exact-integer placement scheduling, and Depth-8 Merkle quarantine in a single self-contained executable.
2. **Zero-Overlap Planarian Binary Mitosis:** Arbitrary half-cuts (including prime unaligned byte offsets such as `49,177 B`) yield two non-overlapping fragments that BOTH independently regenerate bit-exact copies of the original `98,304`-byte executable (independently verified in both JavaScript and clean-room Python 3).
3. **Autonomous Vascular Anastomosis in `PVM-32`:** Live organ-call fallback (`S3 -> S2 -> S1 -> S0`) with transactional RAM rollback allowing a binary missing 88% of its bytes ("12% Ghost") to boot and execute real frame logic deterministically without crashing.
4. **ABI-Verified Cross-Species Xenografting:** Transplanting non-sovereign organ bundles (`B1`–`B5`) from one living `.hbin` species into an amputated host species while preserving Kernel (`B0`) and Genome (`B6`) sovereignty and refusing grafts on dead hosts.

### Why does PLANARIA include an Equal-Storage `RS(192, 48)` baseline?
Comparing a `98,304`-byte holographic binary only against an uncoded linear binary conflates storage overhead with progressive stratification. Adding Equal-Storage `RS(192, 48)` (same `98,304` B total size, same `192` cells, same `48`-chunk raw capacity) isolates the exact effect of stratification: flat `RS(192, 48)` hits an all-or-nothing cliff at `75%` loss (`0%` survival at `76%–88%` loss), whereas PLANARIA keeps Stratum 0 alive through `84%–88%` loss.

## Formal Verification

### Why pure Lean 4.35.0 with zero Mathlib, `autoImplicit = false`, and 6 kernels?
Zero external Lean dependencies guarantee fast, bit-reproducible builds with a tiny trusted computing base (TCB). Disabling `autoImplicit` prevents accidental unbound-variable quantification bugs. Exporting standalone `lean/Challenge.lean` and `lean/Solution.lean` via the Palomar comparator lets CI run six kernel checks (Lean default and paranoid, lean4lean, nanoda, con-leche, con-ron) plus a live negative tamper-rejection test on all **85 theorems** (including 8 adversarial false-variant refutations in `AdversarialTests.lean`). The Lean default and paranoid checks share the Lean C++ kernel, so this reduces, but does not remove, reliance on a single implementation. Browse every theorem interactively in [`blueprint/index.html`](../blueprint/index.html).

### Does Lean prove the JavaScript implementation bug-free?
**No.** Lean proves mathematical and protocol invariants over pure Lean models (`GF256`, placement schedule, viability lattice, Merkle quarantine (conditional on the assumed `HashBinding` root-authenticity correspondence), arbitrary-list quorum, xenograft sovereignty & dead-host refusal, `BitVec 32` sandboxing, 4-qubit unitarity). The concrete ES2022 JavaScript runtime is verified separately via **30 test suites** (`test/verify.mjs`), **12/12 surgical mutants** (`scripts/mutation-test.mjs`), **2,000 deterministic fuzz cases** (`scripts/fuzz.mjs`), and a **clean-room Python 3 differential oracle** (`reference/planaria_oracle.py`). See the Statement-Fidelity Audit Table in [docs/reviews/2026-11-25-10-pass-red-team-audit.md](reviews/2026-11-25-10-pass-red-team-audit.md).

## Licensing & Usage

### Can I use PLANARIA for research, education, or personal projects?
**Yes.** The [Cosmogonic License — Non-Commercial Research & Play](../LICENSE) grants broad worldwide royalty-free permission to view, study, clone, run, modify, and share PLANARIA for any non-commercial purpose with attribution intact (and Build Standard audit tooling is explicitly carved out under CC BY 4.0). Commercial use requires prior written permission from `0_0@0thernes.art`. See [ADR-0004](adr/0004-non-commercial-license-vs-osi-dilemma.md).

### Why are there zero npm dependencies?
Zero runtime dependencies eliminate supply-chain drift, guarantee offline air-gapped reproducibility years from now, and keep the entire coding, cryptographic, compiler, VM, quantum, and WebGL2 stack auditable line-by-line.
