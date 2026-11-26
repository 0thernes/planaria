# PLANARIA Verification, Falsification & Cryptographic Authentication Protocol (`v2.3.0`)

Every technical, algebraic, operational, and security claim in **PLANARIA v2.3.0** is structured around four explicit pillars: **Provable**, **Falsifiable**, **Verifiable**, and **Authenticated**. See also [`CLAIMS.md`](CLAIMS.md), [`REPLICATION.md`](REPLICATION.md), and [`LIMITATIONS.md`](LIMITATIONS.md).

---

## 1. Provable — 6-Kernel Pure Lean 4.35.0 Palomar Audit (`lean/`)

All **70 formal theorems** across 6 pure Lean 4.35.0 `module` files (`GF256`, `MitosisBounds`, `StratumAnastomosis`, `ByzantineImmune`, `XenograftABI`, `QuantumTemporal`) are machine-checked under **`leanprover/lean4:v4.35.0`** using **core Lean 4 only** (zero Mathlib, zero `sorryAx`, zero `native_decide` / `Lean.ofReduceBool` / `Lean.trustCompiler`, zero custom axioms) with standalone Palomar specification [`lean/Challenge.lean`](lean/Challenge.lean), verified [`lean/Solution.lean`](lean/Solution.lean), [`lean/comparator.json`](lean/comparator.json), and [`formalization.yaml`](formalization.yaml).

```bash
cd lean
lake build
lake build Challenge
lake env lean VerifyAxioms.lean
leanchecker --fresh Solution
leanchecker-paranoid --fresh Solution
# On Linux with bubblewrap (automated in .github/workflows/ci.yml):
lake check --paranoid
lake comparator --config comparator.json --paranoid
```

- **Audit logs:** [`results/lean4-audit.txt`](results/lean4-audit.txt) (70 lines, pure Unix LF, 12 zero-axiom constructive proofs, 0 forbidden axioms) and [`results/lean4-multi-kernel.txt`](results/lean4-multi-kernel.txt) (`lean4`, `leanchecker`, `leanchecker-paranoid`, `nanoda_bin` 2,970 decls, `con-leche --verified` 2,715 decls, `con-ron --verified` 2,715 decls + Ubuntu CI `lean4lean` & `lake comparator --paranoid`).

---

## 2. Falsifiable — 28-Suite Verification Harness & 10-Mutant Surgical Testing

```bash
npm run build
npm test      # 28/28 suites (functional, security, property-based prop_check, metamorphic, CLI, HTTP, examples)
npm run mutate # 10/10 surgical mutants (100.0% KILLED, 0 survived)
npm run lint && npm run check:citations
```

### Additional Suites Added in `v2.3.0` (Suites 25–28 on top of Suites 01–24)

| Suite | Coverage | Key Invariants Locked |
|---|---|---|
| **Suites 01–24** | Core $\mathrm{GF}(2^8)$, `RS(254,238)`, SHA-256, Mitosis, Trisection, 88% Ghost, 14B Burst+Shift+Shuffle, Byzantine Trojans, Anastomosis, Xenografts, 4 Species, Popperian boundaries, 4Q Unitarity/CHSH/Mermin, 360-frame Rewind, 6.42T forge, `QUANTUM_CHRONICLE`, `byteOffset`, DoS/malformed, Compiler, PVM-32 traps, Game3D rewind, CLI 9 subcommands, HTTP CSP/XSS/traversal, Artifact SHA-256 parity | All 24 baseline & v2.2 regression guarantees preserved bit-exact |
| **Suite 25 (`prop_check`)** | Property-based randomized testing (`B10`) | 120 GF(2^8) field axioms, 30 random RS(254,238) 1–8B repairs, 25 random Cauchy MDS subsets, 30 SHA-256 OpenSSL differentials, 25 12-gate 4Q circuits preserving norm within $10^{-12}$ |
| **Suite 26 (Cycle 1 Lock)** | Regression lock for every Cycle 1 finding (`B07`) | Dead-host xenograft refusal (`M02`), duplicate `evalX` rejection (`M05`), exact `tempBase=17` `rR > 17` scratch-overflow guard (`M06`), `Object.prototype` identifier safety & empty `return;` -> `0`, unsigned `2654435761` vs `-4294967295`, O(1) 16 KiB sync-flood bypass, iterative backward flywheel on sync-wiped cell 0 (`M03`), rewind SP anti-exploit (`M09`), `Infinity`/`NaN` stage clamping (`M10`), Werner `coherence -> 0`, detached Node `Buffer`, `LINBIN01` `ERR_SECTION_OUT_OF_BOUNDS` |
| **Suite 27 (Metamorphic)** | Algebraic invariance checks (`B14`, `B20`) | Cauchy shard-order permutation invariance, `.hbin` prefix-shift invariance (`1, 7, 137, 511`), Horodecki CHSH local single-qubit unitary invariance |
| **Suite 28 (Examples & Pages)** | End-to-end runnable examples & subpath safety (`A27`, `A43`) | Executes `examples/01..03` cleanly and verifies zero root-anchored `/src/web/` or `/programs/` paths in `src/web/` |

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
| [`artifacts/quantum_chronicle.hbin`](artifacts/quantum_chronicle.hbin) | 98,304 B | `09b9ce24a0a181f485406f2d5ad5324c` | `14844a15539ee678a35bb2c09ef6bf726c2c7a50f1ec16f4ed886b515c0a19ab` | 426 insns |
| [`artifacts/aegis_drift.hbin`](artifacts/aegis_drift.hbin) | 98,304 B | `b0b2f1e397e21270977a2a5b7bfad758` | `011f93b8a735e6019d36a21225bc5711cc3304a69062fb32c48292f0b3b29a1f` | 991 insns |
| [`artifacts/synth_reactor.hbin`](artifacts/synth_reactor.hbin) | 98,304 B | `c61ac049c1e5fa34eec90c7fec7f4b35` | `987d159ec31814398d2591a59b13f52363a8464d6602f82cb01762b3fbd60ab0` | 645 insns |
| [`artifacts/cipher_vault.hbin`](artifacts/cipher_vault.hbin) | 98,304 B | `1abcda703778272dd61f7704b83844a4` | `09916c53c472866375a4bc3bca806fabbb97a53100845a39937eb0996a89f7bd` | 534 insns |

Complete repository and dataset SHA-256 inventories are verified via:

```bash
sha256sum -c data/MANIFEST.sha256
sha256sum -c MANIFEST.sha256
```

Verify the 59-file Ed25519 self-consistency seal in `results/attestation.json` (external provenance is anchored via Git commits, GitHub Releases with `SHA256SUMS` + SLSA `attest-build-provenance`, `0thernes-research-archive`, and Software Heritage):

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

See the full Statement-Fidelity Audit Table in [`docs/reviews/2026-11-25-10-pass-red-team-audit.md`](docs/reviews/2026-11-25-10-pass-red-team-audit.md#4-statement-fidelity--non-vacuity-audit-table-lean-vs-src):
- **Lean 4.35.0 (6 Kernels):** Machine-checks all **70 theorems** over exact mathematical and protocol models (zero `sorryAx`, zero custom axioms).
- **Executable Harness (`test/verify.mjs`, `scripts/mutation-test.mjs`, `scripts/benchmark.mjs`):** Empirically verifies concrete JS implementation fidelity (`rs.js`, `cauchy.js`, `sha256.js`, `Plang`, `PVM-32`, `server.mjs`, `bin/planaria.mjs`, `game3d.js`) across **28 suites** and **10/10 killed mutants**.
- **Live Browser Verification:** Confirms 0 console errors, 0 WebGL2 errors, WAI-ARIA accessibility, live surgery, and rewind in the interactive Studio.
