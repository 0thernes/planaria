# PLANARIA Verification, Falsification & Cryptographic Authentication Protocol

Every technical, algebraic, operational, and security claim in **PLANARIA** is structured around four explicit pillars: **Provable**, **Falsifiable**, **Verifiable**, and **Authenticated**. This document specifies exact commands, expected outputs, formal-versus-runtime boundaries, and cryptographic digests so any third party can independently audit or attempt to falsify the entire repository.

---

## 1. Provable — Machine-Checked Pure Lean 4 Kernel Audit (`lean/`)

All **38 core algebraic, combinatorial, safety, Byzantine-isolation, ABI-soundness, and quantum-temporal theorems** are formally machine-checked under **`leanprover/lean4:v4.35.0`** using **core Lean 4 only** (zero Mathlib, zero `sorryAx`, zero `native_decide`, zero custom axioms).

### Reproduce from Scratch

```bash
cd lean
lake clean
lake build
```

### Audit Assertions

1. Exit code is `0` with **zero errors and zero warnings**.
2. Inspect [results/lean4-audit.txt](results/lean4-audit.txt) (or stdout of `lake build`):
   - `grep -i sorryAx results/lean4-audit.txt` → **0 matches**
   - `grep -i trustCompiler results/lean4-audit.txt` → **0 matches**
   - `grep -i ofReduceBool results/lean4-audit.txt` → **0 matches**
3. Constructive zero-axiom theorems verified directly (7 total):
   - `Planaria.GF256.gf_cauchy2_nonzero_det` (`does not depend on any axioms`)
   - `Planaria.Mitosis.planaria_all_7_bundles_mitosis_safe` (`does not depend on any axioms`)
   - `Planaria.Mitosis.planaria_total_cells_exact` (`does not depend on any axioms`)
   - `Planaria.Anastomosis.fusion_strict_synergy_exists` (`does not depend on any axioms`)
   - `Planaria.Anastomosis.zero_cliff_strict_separation` (`does not depend on any axioms`)
   - `Planaria.Xenograft.pvm32_ram_bounds_invariant` (`does not depend on any axioms`)
   - `Planaria.QuantumTemporal.combinatorial_1of1_space_exceeds_6_trillion` (`does not depend on any axioms`)

---

## 2. Falsifiable — Tight Boundary & Counterexample Harness (`test/verify.mjs`)

True engineering claims must state **precisely where they break** and fail cleanly when pushed past those boundaries. Run the complete **16-suite** executable verification & falsification harness:

```bash
npm run build
npm test
```

### Explicit Falsification Boundaries Tested Automatically

| Suite | Positive Guarantee Verified | Negative Popperian Falsification Boundary Verified |
|---|---|---|
| **Suite 01** | All 65,536 $\text{GF}(2^8)$ products, 255 inverses, 40 random 16-of-40 Cauchy subsets exact | $k - 1 = 15$ Cauchy cells **MUST** fail with `insufficient_rank` |
| **Suite 02** | 50 random 8-byte RS(254,238) trials + 16-byte contiguous burst across cell boundaries heal 100% | $e = 10 > 8$ errors in one RS lane **MUST** reject cleanly (`ok === false`), never silently misdecode |
| **Suite 03** | Zero-dep sync SHA-256 matches Node OpenSSL bit-for-bit across NIST vectors & 96 KiB `.hbin` | Any bit mismatch throws immediately |
| **Suite 04** | Aligned (`49152`) & unaligned prime (`49177`, `48899`, `49401`) 50/50 cuts regenerate 100% SHA-256 on BOTH halves | Monolithic Linear Control Twin **MUST** fail on right half |
| **Suite 05** | 3-way trisection yields 3 viable S2 shards; raw `cat(partA + 137B junk + partB)` jumps to S3 bit-exact | Each individual third alone **MUST** fail Stratum-3 regeneration (`canFullRegenerate === false`) |
| **Suite 06** | 88% shredded binary (12% surviving) boots live in Stratum 0, runs 30 frames with 0 traps & lit pixels | Verified against live framebuffer stats |
| **Suite 07** | Simultaneous 14B contiguous burst in ALL 192 cells (2,688B corrupted) + 137B shift + shuffle heals 100% | Exact count `rsTotalByteErrorsFixed === 2688` & `unalignedRecoveries === 192` |
| **Suite 08** | 60 prepended RS-valid Trojans: **60/60 quarantined** in both Pinned & Unpinned Quorum modes | Disabling Immune System (`disableImmuneSystem: true`) **MUST** poison `S0_STEM_NUCLEUS` (> 50 corrupted bytes; empirically 415/416 B!) |
| **Suite 09** | Live hot-swap organ amputation (`S3 -> S1 -> S0 -> Healed`) preserves RAM score & frame continuity | Exact route transitions `S2 -> S1 -> FALLBACK_STUB -> S2` asserted |
| **Suite 10** | Cross-species Xenograft (`AEGIS_DRIFT x SYNTH_REACTOR`) boots with 0 traps, active donor audio, and exports a standalone `.hbin` capable of its own 50/50 Mitosis | Host Kernel (`B0`) remains `PRIMARY` (sovereignty invariant) |
| **Suite 11** | All 3 species (`AEGIS_DRIFT`, `SYNTH_REACTOR`, `CIPHER_VAULT`) execute 100 frames deterministically | Bit-identical framebuffer FNV-1a hash across twin VMs |
| **Suite 12** | 1-bit flip heals 100% in PLANARIA (`rsTotalByteErrorsFixed === 1`) | Identical 1-bit flip **KILLS** Linear Control Twin; retaining `< 2` cells **MUST** produce clean Cell Death (`bootable === false`) |
| **Suite 13** | 4-qubit statevector ($\mathbb{C}^{16}$) unitarity, exact CHSH Bell violation ($|S|=2\sqrt{2}\approx 2.8284$), WKB barrier tunneling & Heisenberg $\Delta x\Delta p=0.5$ | Non-unitary norm drift (`|norm - 1| > 1e-9`) or CHSH bound violation fails immediately |
| **Suite 14** | Lossless 360-frame temporal rewind bijectivity, spherical Chrono-Wells & Past-Timeline Echo replay | Exact bit-level state equality before/after forward-rewind cycle asserted |
| **Suite 15** | Endless 1/1 combinatorial uniqueness (300 forged items/NPCs with 0 collisions), adaptive AI & 6-order spatial stages | Any genome collision or out-of-range metric fails immediately |
| **Suite 16** | `QUANTUM_CHRONICLE.hbin` 4th living species — unaligned prime mitosis & live 3D engine coupling | Both disjoint halves must regenerate 100% SHA-256 bit-exact replica |

---

## 3. Verifiable — Reproducible CLI & Monte Carlo Benchmarks

### Independent Command-Line Torture Reproduction

Anyone can verify physical byte-level Planarian Mitosis, radiation healing, and Chimera splicing directly from the shell on the committed `.hbin` binaries:

```bash
# 1. Cut artifacts/aegis_drift.hbin at unaligned prime offset 49177 (zero overlap)
node bin/planaria.mjs bisect artifacts/aegis_drift.hbin left.hbin right.hbin --offset 49177

# 2. Regenerate full 98,304-byte binary solely from the headerless right half
node bin/planaria.mjs heal right.hbin -o healed.hbin

# 3. Verify 100% bit-for-bit identity against original pristine binary
sha256sum artifacts/aegis_drift.hbin healed.hbin
# Expected: 462b56071e0f52b6fb28015d4f409af27f2c6e970b2d096e8a1f19b102c54fd0 (IDENTICAL!)

# 4. Subject binary to 14B burst radiation in ALL 192 cells + 137B shift + shuffle + 25 Trojans
node bin/planaria.mjs damage artifacts/aegis_drift.hbin -o tortured.hbin \
  --bitrot 14 --burst --shift 137 --shuffle --trojans 25
node bin/planaria.mjs inspect tortured.hbin

# 5. Forge & run a standalone Cross-Species Xenograft Chimera
node bin/planaria.mjs xenograft artifacts/aegis_drift.hbin artifacts/synth_reactor.hbin -o chimera.hbin
node bin/planaria.mjs run chimera.hbin --frames 60
```

### Reproduce Monte Carlo Survival Curves & Attestation

```bash
npm run benchmark
```

Outputs full machine-readable tables to [results/benchmarks.json](results/benchmarks.json) and fresh cryptographic digests/signatures to [results/attestation.json](results/attestation.json).

---

## 4. Authenticated — Deterministic Artifact Digests & Ed25519 Manifest

Compiled `.hbin` artifacts in `artifacts/` are 100% deterministic across platforms and Node versions:

| Artifact | Size | Lineage Merkle Root (128-bit) | Full File SHA-256 | Instructions / Type |
|---|---|---|---|---|
| [`artifacts/quantum_chronicle.hbin`](artifacts/quantum_chronicle.hbin) | 98,304 B | `60a1bb8748538186e3f4d16fa61e4289` | `299827cdc11ff3848b738d7b47f5941fd6eabac101fafd9a169a227a61bd8af0` | 418 insns |
| [`artifacts/aegis_drift.hbin`](artifacts/aegis_drift.hbin) | 98,304 B | `2ce3fb499c8f94c684a3fbfeb38496bf` | `462b56071e0f52b6fb28015d4f409af27f2c6e970b2d096e8a1f19b102c54fd0` | 958 insns |
| [`artifacts/synth_reactor.hbin`](artifacts/synth_reactor.hbin) | 98,304 B | `3650bf9e153d0eb1314f64e9eca0c2f0` | `0d7dd32f971a7f979cec418703f7ffa2843205beb2d06efa67e5ae4214a50864` | 621 insns |
| [`artifacts/cipher_vault.hbin`](artifacts/cipher_vault.hbin) | 98,304 B | `38731bc0ca687abdce12c6bfa3437e1c` | `fd902cb1ab867dc0c4e1fbebb98f91c52e1f469e41144310a9ae2a1c97f70b56` | 526 insns |
| [`dist/Donahue_2026_planaria.pdf`](dist/Donahue_2026_planaria.pdf) | 177,475 B | — | `4ace7864d3c5b119691d29ab2507afa22399e3a8a3c86ed3ee8f43e5c09306ae` | Frozen 7-page AMS-LaTeX PDF (`v2.1.0`) |
| [`dist/arxiv_submission.tar.gz`](dist/arxiv_submission.tar.gz) | 12,762 B | — | `9fdd12b103978c731c4548e73dad2dcc042a9e8b530df9bf1b296f988d651465` | Standalone Tectonic/arXiv LaTeX bundle |

Verify the Ed25519 attestation signature in `results/attestation.json`:

```bash
node --input-type=module -e "
import crypto from 'node:crypto';
import fs from 'node:fs';
const att = JSON.parse(fs.readFileSync('results/attestation.json','utf8'));
const { ed25519PublicKeyPem, ed25519SignatureHex, selfVerified, ...payload } = att;
const ok = crypto.verify(null, Buffer.from(JSON.stringify(payload, null, 2)), ed25519PublicKeyPem, Buffer.from(ed25519SignatureHex, 'hex'));
console.log('Ed25519 Attestation Verified:', ok);
if (!ok) process.exit(1);
"
```

---

## 5. Exact Formal-vs-Runtime Boundary Disclosure

| Layer | Verification Authority | Exact Scope |
|---|---|---|
| Algebraic $\text{GF}(2^8)$ inverses, universal 2×2 Cauchy nonsingularity, mitosis/unaligned thresholds, anastomosis zero-crash/monotonicity/synergy, RS(254,238) 16B burst bound, Merkle zero-contamination, PVM-32 memory/termination/sovereignty, quantum-temporal unitarity/rewind/combinatorial bounds | **Lean 4 `v4.35.0` Kernel** ([lean/](lean/)) | Machine-checked mathematical proof within stated formal models (**38 theorems**, zero `sorryAx`, zero `native_decide`) |
| Berlekamp-Massey/Chien/Forney polynomial solver, $k \le 16$ Gauss-Jordan matrix inversion, FIPS 180-4 SHA-256 bit-exactness, Plang compiler codegen, `PVM-32` instruction semantics, 4-qubit CHSH/WKB/rewind runtime, Monte Carlo survival curves | **Executable Verification & Benchmark Suite** ([test/verify.mjs](test/verify.mjs), [scripts/benchmark.mjs](scripts/benchmark.mjs)) | Empirically verified & falsification-tested across **16 randomized and adversarial test suites** |
| Interactive 60 FPS WebGL2 3D Temporal-Quantum & Surgical Vivisection Studio + 48 kHz `AudioWorklet` | **Live Browser Verification + Local Studio** ([src/web/](src/web/)) | Verified zero console errors, zero WebGL2 errors, zero VM traps, real-time live byte surgery |
