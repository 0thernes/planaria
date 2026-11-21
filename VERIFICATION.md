# PLANARIA Verification, Falsification & Cryptographic Authentication Protocol

Every technical, algebraic, operational, and security claim in **PLANARIA v2.2.0** is structured around four explicit pillars: **Provable**, **Falsifiable**, **Verifiable**, and **Authenticated**. This document specifies exact commands, expected outputs, formal-versus-runtime boundaries, and cryptographic digests so any third party can independently audit or attempt to falsify the entire repository.

---

## 1. Provable — Machine-Checked Pure Lean 4 Kernel Audit (`lean/`)

All **62 core algebraic, combinatorial, safety, Byzantine-isolation, ABI-soundness, and 4-qubit quantum-temporal theorems** are formally machine-checked under **`leanprover/lean4:v4.35.0`** using **core Lean 4 only** (zero Mathlib, zero `sorryAx`, zero `native_decide` / `Lean.ofReduceBool` / `Lean.trustCompiler`, zero custom axioms).

### Reproduce from Scratch

```bash
cd lean
lake clean
lake build
```

### Strict Axiom Allowlist Audit

1. Exit code is `0` with **zero errors and zero warnings**.
2. Every single one of the **62 audited theorems** in [results/lean4-audit.txt](results/lean4-audit.txt) is checked by an automated Python allowlist parser in `.github/workflows/ci.yml` confirming:
   - `sorryAx`, `ofReduceBool`, `trustCompiler` → **0 occurrences**
   - Every axiom set is strictly a subset of `{propext, Classical.choice, Quot.sound}` (with **10 purely constructive zero-axiom theorems**, including `gf_cauchy2_nonzero_det`, `cauchy2_exact_decode`, `planaria_all_7_bundles_mitosis_safe`, `planaria_total_cells_exact`, `planaria_cell_byte_budget_exact`, `planaria_cauchy_coord_disjoint`, `planaria_payload_capacity_exact`, `fusion_strict_synergy_exists`, `zero_cliff_strict_separation`, and `combinatorial_1of1_space_exceeds_6_trillion`).

---

## 2. Falsifiable — Tight Boundary, Security & Counterexample Harness (`test/verify.mjs`)

True engineering claims must state **precisely where they break** and fail cleanly when pushed past those boundaries. Run the complete **24-suite** executable verification, fuzz, CLI, and HTTP security harness:

```bash
npm run build
npm test
```

### Explicit Falsification & Security Boundaries Tested Automatically

| Suite | Positive Guarantee Verified | Negative Popperian / Security Boundary Verified |
|---|---|---|
| **Suite 01** | All 65,536 $\text{GF}(2^8)$ products, 255 inverses, 40 random 16-of-40 Cauchy subsets exact | $k - 1 = 15$ Cauchy cells fail (`insufficient_rank`); `gfPow(0, -1)` & `k = 0` throw `RangeError` |
| **Suite 02** | 50 random 8B RS(254,238) trials + 16B contiguous burst across cell offsets heal 100% + detached slices | $e = 10 > 8$ errors in one RS lane reject cleanly (`ok === false`); empty encode throws `RangeError` |
| **Suite 03** | Zero-dep streaming SHA-256 matches OpenSSL bit-for-bit + `0x02` `EMPTY_LEAF_HASH` domain separation | Malformed hex & OOB Merkle leaf indices throw `RangeError` |
| **Suite 04** | Aligned (`49152`) & unaligned prime (`49177`, `48899`, `49401`) 50/50 cuts regenerate 100% SHA-256 on BOTH halves | Monolithic Linear Control Twin **MUST** fail on right half |
| **Suite 05** | 3-way trisection yields 3 viable S2 shards; raw `cat(partA + 137B junk + partB)` jumps to S3 bit-exact | Each individual third alone **MUST** fail Stratum-3 regeneration |
| **Suite 06** | 88% shredded binary (12% surviving) boots live in Stratum 0, runs 30 frames with 0 traps & lit pixels | Verified against live framebuffer stats |
| **Suite 07** | Simultaneous 14B contiguous burst in ALL 192 cells (2,688B corrupted) + 137B shift + shuffle heals 100% | Exact `rsTotalByteErrorsFixed === 2688` & `unalignedRecoveries === 192` |
| **Suite 08** | 60 prepended Trojans & Overlap-Eclipse attacks quarantined 100% in Pinned & Unpinned Quorum modes | Disabling Immune System **MUST** poison `S0_STEM_NUCLEUS` & block `regenerateHbin` |
| **Suite 09** | Live hot-swap organ amputation (`S3 -> S1 -> S0 -> Healed`) preserves RAM score & frame continuity | Exact route transitions `S2 -> S1 -> FALLBACK_STUB -> S2` asserted |
| **Suite 10** | Cross-species Xenograft (`AEGIS_DRIFT × SYNTH_REACTOR`) boots with 0 traps, exports mitosis-capable `.hbin` | Unpinned Xenograft blocked by default (`xenograftBlockedUnpinned === true`); B0 remains `PRIMARY` |
| **Suite 11** | All **4 living species** (`QUANTUM_CHRONICLE`, `AEGIS_DRIFT`, `SYNTH_REACTOR`, `CIPHER_VAULT`) deterministic 100 frames | Bit-identical framebuffer FNV-1a hash across twin VMs & 0 traps |
| **Suite 12** | 1-bit flip heals 100% in PLANARIA | 1-bit flip kills Linear Twin; `< 2` S0 cells -> Cell Death; exact 10-vs-10 root tie fails closed (`quorumAmbiguous`) |
| **Suite 13** | 4-qubit unitarity (`X/Y/Z/H/CNOT/CZ/SWAP`), rotation-invariant Horodecki CHSH ($|S|=2\sqrt{2}$), 4-qubit Mermin GHZ ($|M_4|=4.0$), WKB, Heisenberg | `CNOT(1,1)` & OOB qubit index throw `RangeError`; decoherence drops $|S| < 2.0$ |
| **Suite 14** | Lossless 360-frame O(1) `RingBuffer` rewind, Chrono-Wells, Past-Timeline Echoes, lockstep `playerTrail` pop | Exact state & step restoration asserted |
| **Suite 15** | Exact reachable `6,421,059,993,600` combinatorial space, 300 unique 64-bit (`XXXX-XXXX-XXXX-XXXX`) items/NPCs, 6 scale orders | Any lineage collision or format mismatch fails immediately |
| **Suite 16** | `QUANTUM_CHRONICLE.hbin` unaligned prime mitosis, 3D world coupling & live Bundle 4 audio amputation coupling | Amputating Bundle 4 silences voices 1..3 cleanly |
| **Suite 17** | Nonzero `byteOffset` `Uint8Array` views, `DataView`, and `Uint32Array` inputs across SHA-256, `.hbin`, and `LinearTwin` | Zero buffer aliasing or offset drift |
| **Suite 18** | Adversarial DoS `maxInputBytes` budget cap, `irradiateCells(508B)` finite termination, `LinearTwin` overlapping-section rejection, `inspectSingleCell` OOB `leafIdx` check | Malformed / overlapping inputs rejected cleanly |
| **Suite 19** | `Plang` strict lexer/parser/codegen diagnostics, block shadowing (`let x = x + 1`), unary `~`, single-eval `mem[idx] += 22`, caller-windowed `fn` calls | Unterminated `/*`, `0x`, `123abc`, >32-bit int, missing S0, Bundle 6, div-by-0, bad call arity all throw |
| **Suite 20** | `PVM-32` single-trap `BUDGET_EXCEEDED`, Bundle 6 excluded from `bundleCode`, `initialSeed` reset parity, cross-species `S1_CORE_LOGIC` Xenograft | Cross-species `S1_CORE_LOGIC` runs 60 frames with 0 traps |
| **Suite 21** | `Game3D` post-rewind non-NaN NPC speed/physics, solo-boss no self-entangle, `buildStageSpec(0)` safety, `projectiles <= 240` | All post-rewind coordinates & speeds verified finite |
| **Suite 22** | End-to-end CLI execution across all 9 commands (`compile`, `inspect`, `run`, `bisect`, `fuse`, `heal`, `damage`, `xenograft`, `disasm`, `--version`) | Unknown flags, `--bitrot 999`, sovereign `--amputate 0`, same-species xenograft exit non-zero |
| **Suite 23** | `server.mjs` HTTP security containment (`200` + CSP/`nosniff`/`DENY`, `HEAD`, `405`, `400`, `403`, `404`) | Traversal (`/../`, `/%2e%2e/`), dotfiles (`/.git/config`), non-public `/server.mjs` & reflected XSS blocked |
| **Suite 24** | On-disk `artifacts/*.hbin` & `artifacts/manifest.json` bit-exact SHA-256 parity with freshly compiled `programs/*.plang` | Any stale artifact on disk fails immediately |

---

## 3. Verifiable — Reproducible CLI & Monte Carlo Benchmarks

```bash
# 1. Cut artifacts/aegis_drift.hbin at unaligned prime offset 49177 (zero overlap)
node bin/planaria.mjs bisect artifacts/aegis_drift.hbin left.hbin right.hbin --offset 49177

# 2. Regenerate full 98,304-byte binary solely from the headerless right half
node bin/planaria.mjs heal right.hbin -o healed.hbin

# 3. Verify 100% bit-for-bit identity against original pristine binary
sha256sum artifacts/aegis_drift.hbin healed.hbin
# Expected: 011f93b8a735e6019d36a21225bc5711cc3304a69062fb32c48292f0b3b29a1f (IDENTICAL!)

# 4. Reproduce Monte Carlo survival curves, radiation sweeps & Ed25519 attestation
npm run benchmark
```

---

## 4. Authenticated — Deterministic Artifact Digests & Ed25519 Manifest (`v2.2.0`)

Compiled `.hbin` artifacts in `artifacts/` are 100% deterministic across platforms and Node versions:

| Artifact | Size | Lineage Merkle Root (128-bit) | Full File SHA-256 | Instructions / Type |
|---|---|---|---|---|
| [`artifacts/quantum_chronicle.hbin`](artifacts/quantum_chronicle.hbin) | 98,304 B | `09b9ce24a0a181f485406f2d5ad5324c` | `14844a15539ee678a35bb2c09ef6bf726c2c7a50f1ec16f4ed886b515c0a19ab` | 426 insns |
| [`artifacts/aegis_drift.hbin`](artifacts/aegis_drift.hbin) | 98,304 B | `b0b2f1e397e21270977a2a5b7bfad758` | `011f93b8a735e6019d36a21225bc5711cc3304a69062fb32c48292f0b3b29a1f` | 991 insns |
| [`artifacts/synth_reactor.hbin`](artifacts/synth_reactor.hbin) | 98,304 B | `c61ac049c1e5fa34eec90c7fec7f4b35` | `987d159ec31814398d2591a59b13f52363a8464d6602f82cb01762b3fbd60ab0` | 645 insns |
| [`artifacts/cipher_vault.hbin`](artifacts/cipher_vault.hbin) | 98,304 B | `1abcda703778272dd61f7704b83844a4` | `09916c53c472866375a4bc3bca806fabbb97a53100845a39937eb0996a89f7bd` | 534 insns |
| [`dist/Donahue_2026_planaria.pdf`](dist/Donahue_2026_planaria.pdf) | 181,882 B | — | `a7d24c36cf82b398cc850232f34f0775bc2efc925341e4558f3352813be0dfbd` | Frozen 8-page AMS-LaTeX PDF (`v2.2.0`) |
| [`dist/arxiv_submission.tar.gz`](dist/arxiv_submission.tar.gz) | 14,148 B | — | `dedf23610126025f99361b818ad8888c0b9c58932b0c5641b1a4d82e4eb944f7` | Standalone Tectonic/arXiv LaTeX bundle |

Verify the Ed25519 self-consistency seal in `results/attestation.json` (44 attested files; unless signed with a persistent `PLANARIA_SIGNING_KEY_PEM`, the embedded ephemeral key certifies internal bundle consistency while external authenticity derives from git commits, GitHub Releases, and Software Heritage snapshots):

```bash
node --input-type=module -e "
import crypto from 'node:crypto';
import fs from 'node:fs';
const att = JSON.parse(fs.readFileSync('results/attestation.json','utf8'));
const { ed25519PublicKeyPem, ed25519SignatureHex, selfVerified, ...payload } = att;
const ok = crypto.verify(null, Buffer.from(JSON.stringify(payload, null, 2)), ed25519PublicKeyPem, Buffer.from(ed25519SignatureHex, 'hex'));
console.log('Ed25519 Attestation Verified:', ok, '| Mode:', att.signatureMode, '| Files:', Object.keys(att.digests).length);
if (!ok) process.exit(1);
"
```

---

## 5. Exact Formal-vs-Runtime Boundary Disclosure

| Layer | Verification Authority | Exact Scope |
|---|---|---|
| Full 65,536-pair `gfMul_comm` & 16,777,216-triple `gfMul_assoc`, concrete `gf256Field`, universal 2×2 Cauchy decoding, mitosis/integer-schedule/budget bounds, 6-organ anastomosis & equal-storage separation, byte-list Hamming & tight 16/17/18B burst bounds, 8-level Merkle binding & Sybil quorum, signed `BitVec 32` RAM & non-vacuous B0/B6 sovereignty, full 4-qubit 16-amplitude complex unitarity, 360-frame rewind & `6,421,059,993,600` space | **Lean 4 `v4.35.0` Kernel** ([lean/](lean/)) | Machine-checked mathematical proof within stated formal models (**62 theorems**, zero `sorryAx`, zero `native_decide`, strict CI allowlist) |
| Berlekamp-Massey/Chien/Forney polynomial solver, $k \le 16$ Gauss-Jordan matrix inversion, FIPS 180-4 SHA-256 bit-exactness, Plang compiler codegen, `PVM-32` instruction semantics, Horodecki CHSH / Mermin GHZ / WKB / rewind runtime, CLI & HTTP server security, Monte Carlo survival curves | **Executable Verification & Benchmark Suite** ([test/verify.mjs](test/verify.mjs), [scripts/benchmark.mjs](scripts/benchmark.mjs)) | Empirically verified & falsification-tested across **24 randomized, security, and adversarial test suites** |
| Interactive 60 FPS WebGL2 3D Temporal-Quantum & Surgical Vivisection Studio + 48 kHz PolyBLEP `AudioWorklet` | **Live Browser Verification + Local Studio** ([src/web/](src/web/)) | Verified zero console errors, zero WebGL2 errors, zero VM traps, live byte surgery & rewind |
