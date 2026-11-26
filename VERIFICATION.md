# PLANARIA Verification, Falsification & Cryptographic Authentication Protocol (`v2.4.0`)

Every technical, algebraic, operational, and security claim in **PLANARIA v2.4.0** is structured around four explicit pillars: **Provable**, **Falsifiable**, **Verifiable**, and **Authenticated**. See also [`CLAIMS.md`](CLAIMS.md), [`REPLICATION.md`](REPLICATION.md), [`LIMITATIONS.md`](LIMITATIONS.md), and [`docs/SUBMISSION_READINESS.md`](docs/SUBMISSION_READINESS.md).

---

## 1. Provable — 6-Kernel Pure Lean 4.35.0 Palomar Audit & Interactive Blueprint (`lean/`, `blueprint/`)

All **85 formal theorems** across 7 pure Lean 4.35.0 `module` files (`GF256`, `MitosisBounds`, `StratumAnastomosis`, `ByzantineImmune`, `XenograftABI`, `QuantumTemporal`, `AdversarialTests`) are machine-checked under **`leanprover/lean4:v4.35.0`** with **`autoImplicit = false`**, **`relaxedAutoImplicit = false`**, **zero Mathlib**, zero `sorryAx`, zero `native_decide` / `Lean.ofReduceBool` / `Lean.trustCompiler` / `_native`, and zero custom axioms, with standalone Palomar specification [`lean/Challenge.lean`](lean/Challenge.lean), verified [`lean/Solution.lean`](lean/Solution.lean), [`lean/comparator.json`](lean/comparator.json), [`formalization.yaml`](formalization.yaml), and an interactive SVG dependency Blueprint at [`blueprint/index.html`](blueprint/index.html).

```bash
cd lean
lake build
lake build Challenge
lake env lean VerifyAxioms.lean
lake env leanchecker --fresh Solution
lake env leanchecker-paranoid --fresh Solution
# On Linux with bubblewrap (automated in .github/workflows/ci.yml, including negative tamper check):
lake check --paranoid
lake comparator --config comparator.json --paranoid
```

- **Audit logs:** [`results/lean4-audit.txt`](results/lean4-audit.txt) (85 lines, pure Unix LF, 15 zero-axiom pure-kernel proofs + 70 standard `[propext, Classical.choice, Quot.sound]` proofs, **0 forbidden axioms**) and [`results/lean4-multi-kernel.txt`](results/lean4-multi-kernel.txt) (6 independent kernels: `lean4`, `leanchecker`, `leanchecker-paranoid`, `nanoda_bin`, `con-leche --verified`, `con-ron --verified`, plus `lean4lean` & `lake comparator --paranoid` + negative tampering check in Ubuntu Linux CI).

---

## 2. Falsifiable — 30-Suite Harness, 12/12 Mutants, 2,000-Case Fuzzer & Python 3 Differential Oracle

```bash
npm run build
npm test                          # 30/30 suites (functional, security, property-based, metamorphic, DSP, CLI, HTTP, examples)
npm run mutate                    # 12/12 surgical mutants (100.0% KILLED, 0 survived)
npm run fuzz                      # 2,000 deterministic fuzz cases across decodeHbin, Plang, RS(254,238), PVM-32
python3 reference/planaria_oracle.py  # Clean-room Python 3 cross-language oracle (768 cells + mitosis + 4Q CHSH/Mermin)
npm run lint && npm run check:axioms && npm run check:blueprint && npm run check:citations
```

### Verification Coverage Summary (`Suites 01–30`)

| Suite Range | Coverage | Key Invariants Locked |
|---|---|---|
| **Suites 01–24** | Core $\mathrm{GF}(2^8)$, `RS(254,238)`, SHA-256, Mitosis, Trisection, 88% Ghost, 14B Burst+Shift+Shuffle, Byzantine Trojans, Anastomosis, Xenografts, 4 Species, Popperian boundaries, 4Q Unitarity/CHSH/Mermin, 360-frame Rewind, 6.42T forge, `QUANTUM_CHRONICLE`, `byteOffset`, DoS/malformed, Compiler, PVM-32 traps, Game3D rewind, CLI 9 subcommands, HTTP CSP/XSS/traversal/concurrency/redirects, Artifact SHA-256 parity | All baseline, security, and cross-component invariants locked |
| **Suite 25 (`prop_check`)** | Property-based randomized testing (`B10`) | 120 $\mathrm{GF}(2^8)$ axioms, 30 random RS(254,238) 1–8B repairs, 25 random Cauchy MDS subsets, 30 SHA-256 OpenSSL differentials, 25 15-gate circuits across ALL 10 quantum gates (`H,X,Y,Z,RX,RY,RZ,CNOT,CZ,SWAP`), 15 randomized Temporal Rewind trials |
| **Suite 26 (Regression Lock)** | Cycle 1 & Cycle 2 security/correctness regressions (`B07`) | Dead-host xenograft refusal & zero `slotMap` contamination (`M02`), duplicate `evalX` rejection (`M05`), depth-10 `rR > 17` overflow (`M06`) + flat 12-term sum reuse, `Object.prototype` safety, decimal int32 range vs `0x9e3779b1`, `else if`/`?:`/300-term depth DoS, built-in shadowing & `organ_call(KERNEL)` rejection, exact & fuzzy stride-5 sync-flood O(1) bypass, backward flywheel (`M03`), 1-cell unpinned fail-closed quorum, PVM-32 `GLOW` proportional fuel DoS, `amputateBundles` flywheel, seeded `ChronoQuantumWorld` determinism, gear-forge-then-rewind rollback (`M09`, `M12`), finite `evalWaveInterference(1e200)`, invalid gear-index safety |
| **Suite 27 (Metamorphic)** | Algebraic invariance checks (`B14`, `B20`) | Cauchy shard-order permutation invariance, `.hbin` prefix-shift invariance (`1, 7, 137, 511`), Horodecki CHSH local single-qubit unitary invariance |
| **Suite 28 (Examples & Pages)** | End-to-end runnable examples & subpath safety (`A27`, `A43`) | Executes `examples/01..03` cleanly and verifies zero root-anchored asset URLs |
| **Suite 29 (AudioWorklet DSP)** | Sandboxed `node:vm` DSP render-quanta harness | Exercises all 5 waveforms (`sine`, `tri`, `PolyBLEP saw/sq`, `noise`), adversarial `NaN`/`Infinity` voice payloads, and mute slew across 18 render quanta with zero `NaN` latches |
| **Suite 30 (Formal & CSP Parity)** | Manifest & HTML invariants | Verifies all 85 theorems in `comparator.json` appear in `results/lean4-audit.txt` with zero forbidden axioms, plus `index.html` CSP, skip-link, and `./blueprint/` link |

---

## 3. Verifiable — Reproducible 4-Architecture Statistical Benchmarks (`v1.2`)

```bash
npm run benchmark   # Regenerates results/benchmarks.json (PLANARIA-BENCHMARKS-1.2) & results/attestation.json
```

Evaluates `LINBIN01`, `RS(40,16)`, Equal-Storage Flat `RS(192,48)`, and `PLANARIA .hbin` across `N = 40` paired deterministic seeds per threshold (`0%..96%`), reporting Wilson 95% CIs, exact two-sided paired McNemar binomial p-values, Cohen's $h$, Holm–Bonferroni $p_{\text{Holm}}$, median/IQR/p95 latencies, and all 5 Cross-Species Xenograft chimeras.

---

## 4. Authenticated — Deterministic Digests, SHA-256 Manifests & Ed25519 Seal

| Artifact | Size | Lineage Merkle Root (128-bit) | Full File SHA-256 | Type |
|---|---:|---|---|---|
| [`artifacts/quantum_chronicle.hbin`](artifacts/quantum_chronicle.hbin) | 98,304 B | `917d90dceecc8be9f47e523ff39d9b6e` | `d41408cee6edc3f80265d5b5f0b19c602d1565820a050957ef9690a6384f197d` | 426 insns |
| [`artifacts/aegis_drift.hbin`](artifacts/aegis_drift.hbin) | 98,304 B | `4f72e7e292b0ece834259950ff02b800` | `12b1e3eb05ef62957842cf5c057d509c656bae89278459148b822b309b328392` | 1,000 insns |
| [`artifacts/synth_reactor.hbin`](artifacts/synth_reactor.hbin) | 98,304 B | `863ac05d26947b382e017a92e09ae46e` | `63dbacf6c0757f63d482c47dde0f6a7315bf9bfd8266e4f3317c98cb94b26f24` | 645 insns |
| [`artifacts/cipher_vault.hbin`](artifacts/cipher_vault.hbin) | 98,304 B | `47dae7cb244e4dfc0eed17cb89366b68` | `95f8e0535e974680d9304f799b89ca3fb0312f9605edd67afc1441d57337c829` | 534 insns |

Complete repository and dataset SHA-256 inventories are verified via:

```bash
sha256sum -c data/MANIFEST.sha256
sha256sum -c MANIFEST.sha256
```

Verify the Ed25519 self-consistency seal in `results/attestation.json` (external provenance is anchored via Git commits, GitHub Releases with `SHA256SUMS` + SLSA `attest-build-provenance`, `0thernes-research-archive`, and Software Heritage):

```bash
node --input-type=module -e "
import crypto from 'node:crypto'; import fs from 'node:fs';
const att = JSON.parse(fs.readFileSync('results/attestation.json','utf8'));
const { ed25519PublicKeyPem, ed25519SignatureHex, selfVerified, ...payload } = att;
const ok = crypto.verify(null, Buffer.from(JSON.stringify(payload, null, 2)), ed25519PublicKeyPem, Buffer.from(ed25519SignatureHex, 'hex'));
console.log('Ed25519 Verified:', ok, '| Mode:', att.signatureMode, '| Files:', Object.keys(att.digests).length);
if (!ok) process.exit(1);
"
```

---

## 5. Exact Formal-vs-Runtime Boundary Disclosure

See the full Statement-Fidelity Audit Table in [`docs/reviews/2026-11-25-10-pass-red-team-audit.md`](docs/reviews/2026-11-25-10-pass-red-team-audit.md):
- **Lean 4.35.0 (6 Kernels):** Machine-checks all **85 theorems** over exact mathematical and protocol models (`autoImplicit = false`, zero `sorryAx`, zero custom axioms).
- **Executable Harness + Python 3 Oracle:** Empirically verifies concrete JS implementation fidelity (`rs.js`, `cauchy.js`, `sha256.js`, `Plang`, `PVM-32`, `server.mjs`, `bin/planaria.mjs`, `game3d.js`, `audio-worklet.js`) across **30 suites**, **12/12 killed mutants**, **2,000 fuzz cases**, and **768 cross-language decoded `.hbin` cells**.
- **Live Browser Verification:** Confirms 0 console errors, 0 failed fetches, WebGL2 operation, WAI-ARIA accessibility, live surgery, rewind, and interactive `/blueprint/` inspection.
