# LIMITATIONS.md — Honest Boundaries, Real-vs-Metaphor & Open Dilemmas

This document states explicitly what **PLANARIA v2.3.0** does, what it does **NOT** do, where its engineering and mathematical guarantees end, and which terms are computational metaphors rather than physical or biological claims.

## 1. Real vs. Metaphor Boundary (Strict Epistemic Discipline)

| Term Used in PLANARIA | What Is **REAL** (Verified Code & Math) | What Is **METAPHOR / NOT CLAIMED** |
| :--- | :--- | :--- |
| **Planarian Mitosis / Regeneration** | Deterministic Cauchy MDS erasure coding over $\mathrm{GF}(2^8)$ with a zero-tie integer placement schedule so two disjoint 50% byte halves independently reconstruct 100% of the 98,304 B binary. | **NOT** wet-lab developmental biology, bioelectricity, stem-cell morphogenesis, or a solution to Mega-Atlas `BIO-031` / `SUB-001`. |
| **Living Species / Neural / Organism** | Four deterministic PVM-32 bytecode programs (`QUANTUM_CHRONICLE`, `AEGIS_DRIFT`, `SYNTH_REACTOR`, `CIPHER_VAULT`) executing inside a 4,096-word sandboxed VM with reactive AI heuristics (`playerProfile` EMA). | **NOT** biological life, sentience, autonomous self-replicating malware, or trained deep neural networks. |
| **Vascular Anastomosis** | Explicit software fallback table (`resolveOrgan`) routing `ORGAN_CALL` from higher strata (S3/S2) down to lower strata (S1/S0) or no-op stubs when bundles lack rank $k$. | **NOT** surgical biology or general arbitrary x86/ARM binary hot-patching. |
| **Byzantine Immune System** | Depth-8 SHA-256 Merkle authentication filtering cells against `pinnedRootHex` (or strict unique-majority quorum $\ge 2$) prior to Cauchy matrix inversion. | **NOT** an adaptive biological immune system; without `pinnedRootHex`, a coordinated majority Sybil flood overrides unpinned quorum (explicitly proved in `unpinned_quorum_sybil_counterexample`). |
| **4-Qubit Quantum Register / CHSH / WKB** | Exact classical simulation of a 16-amplitude complex statevector (`Float64Array`), exact Horodecki $3\times 3$ correlation-tensor CHSH, exact 4-qubit Mermin $M_4$, Werner depolarizing channel, and textbook 1D rectangular-barrier WKB transmission formula. | **NOT** quantum hardware, physical entanglement, or new quantum physics; simulation scales as $O(2^n)$ and is capped at $n = 4$ qubits ($16$ complex amplitudes). |
| **6 Orders of Magnitude ($10^{-15}\text{ m} \to 10^9\text{ m}$)** | Six procedurally themed 3D WebGL2 visual/audio/tunnel-boost stage biomes with logarithmic scale labels. | **NOT** a multi-scale relativistic/QFT physics engine; spatial coordinates live in a normalized $[-34, 34]$ arena coordinate system. |
| **Unsolved Problems Mega-Atlas** | Audited against all **1,900** problems in `0thernes/unsolved-problems-mega-atlas`. | **Verdict: `0 / 1,900` open problems solved.** PLANARIA is a systems engineering & formal-verification artifact adjacent to `SYS-045`, `CS-053`, and `AI-005`. |

## 2. Technical & Cryptographic Limitations

1. **4× Storage Overhead (192 coded cells / 48 source chunks):**
   Holographic survivability and 50/50 mitosis require $4\times$ payload expansion ($15{,}936\text{ B}$ raw bytecode capacity inside a $98{,}304\text{ B}$ `.hbin` file). PLANARIA is designed for compact, mission-critical, high-survivability micro-executables, NOT multi-gigabyte desktop applications.
2. **Sybil Majority Boundary in Unpinned Mode:**
   When `pinnedRootHex` is NOT supplied to `decodeHbin()`, an adversary who injects strictly more RS-valid forged cells under one coordinated fake Merkle root than surviving authentic host cells will win unpinned quorum election (`unpinned_quorum_sybil_counterexample`). For hostile channels, callers MUST pin `pinnedRootHex` (or verify against a signed manifest).
3. **128-Bit Truncated Merkle Nodes:**
   To fit an 8-level Merkle inclusion proof inside each 512 B cell ($8 \times 16 = 128\text{ B}$), internal Merkle digests truncate FIPS 180-4 SHA-256 to 128 bits. This provides 128-bit second-preimage resistance and 64-bit birthday collision resistance — strong for single-organism forensic integrity, but below 256-bit post-quantum collision margins.
4. **JavaScript-to-Lean Extraction Gap:**
   The 70 Lean 4.35.0 theorems verify mathematical models of GF(2^8), Cauchy 2×2 decoding, the integer placement schedule, 4-stratum viability, RS(254,238) burst bounds, Merkle quarantine, unpinned quorum, `BitVec 32` RAM masking, and 4-qubit unitarity. The JavaScript runtime (`src/*.js`) is NOT automatically extracted from Lean; correspondence between JS and Lean is maintained via statement-fidelity audits, differential tests, and 10/10 mutation testing (`docs/reviews/2026-11-25-10-pass-red-team-audit.md`).
5. **General $k \times k$ Cauchy Non-Singularity:**
   Lean 4 proves universal $2 \times 2$ Cauchy non-singularity and exact decoding (`cauchy2_exact_decode`, `gf256_cauchy2_exact_decode` for Stratum 0 $k = 2$). Higher bundles ($k \in \{4, 6, 8, 16\}$) rely on the classical Cauchy determinant theorem in prose and empirical property-based testing across 25+ randomized $(k, n)$ configurations in Suite 25 (not yet generalized to arbitrary $k \times k$ determinants in pure zero-Mathlib Lean 4).
6. **Desktop-First Browser Requirements & Single-Machine Benchmarks:**
   The Studio 3D viewport requires WebGL2 (falling back gracefully to 2D PVM-32 + Tissue Surgery when unavailable). Timing benchmarks in `results/benchmarks.json` reflect one workstation (CPU/Node version recorded in JSON) and are not cross-architecture hardware guarantees.

## 3. Open Design Dilemmas (Logged per Build Standard R7 & R8)

- **Dilemma D1 — Non-Commercial License vs. OSI/JOSS/Mathlib Eligibility:**
  `LICENSE` uses the owner-mandated *Cosmogonic License — Non-Commercial Research & Play* (per Turn-1 explicit instruction, which takes precedence under Hard Rule `R8`). Because non-commercial clauses are not OSI-approved, PLANARIA is ineligible for JOSS submission or upstream Mathlib inclusion unless dual-licensed (e.g., Apache-2.0 / MIT) by the owner in a future release. See [ADR-0004](docs/adr/0004-non-commercial-license-vs-osi-dilemma.md).
- **Dilemma D2 — Ephemeral vs. Persistent Attestation Signing:**
  Running `npm run benchmark` without `PLANARIA_SIGNING_KEY_PEM` produces an explicitly labeled `ephemeral-self-consistency-seal` Ed25519 signature (proving internal bundle consistency only). External release authenticity relies on GitHub Release `SHA256SUMS`, SLSA provenance (`actions/attest-build-provenance@v4`), Git commit hashes, and Software Heritage snapshots.
