# LIMITATIONS.md — Honest Boundaries, Real-vs-Metaphor & Open Dilemmas

This document states explicitly what **PLANARIA v2.4.0** does, what it does **NOT** do, where its engineering and mathematical guarantees end, and which terms are computational metaphors rather than physical or biological claims.

## 1. Real vs. Metaphor Boundary (Strict Epistemic Discipline)

| Term Used in PLANARIA | What Is **REAL** (Verified Code & Math) | What Is **METAPHOR / NOT CLAIMED** |
| :--- | :--- | :--- |
| **Planarian Mitosis / Regeneration** | Deterministic Cauchy MDS erasure coding over $\mathrm{GF}(2^8)$ with an exact-integer zero-tie placement schedule so two disjoint 50% byte halves independently reconstruct 100% of the 98,304 B binary. | **NOT** wet-lab developmental biology, bioelectricity, stem-cell morphogenesis, or a solution to Mega-Atlas `BIO-031` / `SUB-001`. |
| **Living Species / Neural / Organism** | Four deterministic PVM-32 bytecode programs (`QUANTUM_CHRONICLE`, `AEGIS_DRIFT`, `SYNTH_REACTOR`, `CIPHER_VAULT`) executing inside a 4,096-word sandboxed VM with reactive AI heuristics (`playerProfile` EMA). | **NOT** biological life, sentience, autonomous self-replicating malware, or trained deep neural networks. |
| **Vascular Anastomosis** | Explicit software fallback table (`resolveOrgan`) routing `ORGAN_CALL` from higher strata (S3/S2) down to lower strata (S1/S0) or no-op stubs when bundles lack rank $k$, with transactional RAM rollback on traps. | **NOT** surgical biology or general arbitrary x86/ARM binary hot-patching. |
| **Byzantine Immune System** | Depth-8 SHA-256 Merkle authentication filtering cells against `pinnedRootHex` (or strict unique-majority quorum $\ge 2$) prior to Cauchy matrix inversion. | **NOT** an adaptive biological immune system; without `pinnedRootHex`, a coordinated majority Sybil flood overrides unpinned quorum (explicitly proved in `unpinned_quorum_sybil_counterexample`). |
| **4-Qubit Quantum Register / CHSH / WKB** | Exact classical simulation of a 16-amplitude complex statevector (`Float64Array`), exact Horodecki $3\times 3$ correlation-tensor CHSH, exact 4-qubit Mermin $|M_4| = 4.0$, Werner depolarizing channel, and textbook 1D rectangular-barrier WKB transmission formula. | **NOT** quantum hardware, physical entanglement, or new quantum physics; simulation scales as $O(2^n)$ and is capped at $n = 4$ qubits ($16$ complex amplitudes). |
| **24 Orders of Magnitude across 6 Scale Realms ($10^{-15}\text{ m} \to 10^9\text{ m}$)** | Six procedurally themed 3D WebGL2 visual/audio/tunnel-boost stage realms spanning logarithmic physical scale labels from femtometers to gigameters. | **NOT** a multi-scale relativistic/QFT physics engine; spatial coordinates live in a normalized $[-34, 34]$ arena coordinate system. |
| **Unsolved Problems Mega-Atlas** | Programmatically audited against all **1,900** problems in `0thernes/unsolved-problems-mega-atlas` ([docs/MEGA_ATLAS_CROSSCHECK.md](docs/MEGA_ATLAS_CROSSCHECK.md)). | **Verdict: `0 / 1,900` open problems solved.** PLANARIA is a systems engineering & formal-verification artifact adjacent to `SYS-045`, `CS-053`, `AI-005`, `BIO-031`, and `SUB-001`. |

## 2. Technical, Storage & Cryptographic Limitations

1. **Exact Storage Expansion Ratios (Transparent Overhead Disclosure):**
   - **Cell-count expansion:** `4.0×` (`192` coded cells / `48` source chunks).
   - **Canonical file vs. raw payload capacity:** `6.17×` (`98,304 B` fixed `.hbin` container / `15,936 B` maximum raw payload across all 7 bundles, due to inner RS parity, 128 B Merkle proofs, 16 B headers, and 4 B sync words).
   - **Canonical file vs. actual compiled species bytecode:** `24.6×` (`AEGIS_DRIFT`, `4,000 B` bytecode) to `57.7×` (`QUANTUM_CHRONICLE`, `1,704 B` bytecode) because `.hbin` is a fixed-size 96 KiB container reserving headroom for larger strata.
   PLANARIA is designed for compact, mission-critical, high-survivability micro-executables, NOT multi-gigabyte desktop applications.
2. **Sybil Majority Boundary in Unpinned Mode:**
   When `pinnedRootHex` is NOT supplied to `decodeHbin()`, an adversary who injects strictly more RS-valid forged cells under one coordinated fake Merkle root than surviving authentic host cells will win unpinned quorum election (`unpinned_quorum_sybil_counterexample`). For hostile channels, callers MUST pin `pinnedRootHex` (or verify against a signed manifest).
3. **128-Bit Truncated Merkle Nodes:**
   To fit an 8-level Merkle inclusion proof inside each 512 B cell ($8 \times 16 = 128\text{ B}$), internal Merkle digests truncate FIPS 180-4 SHA-256 to 128 bits. This provides 128-bit second-preimage resistance and **64-bit birthday collision resistance** — strong for single-organism forensic integrity, but below 256-bit post-quantum collision margins.
4. **JavaScript-to-Lean Extraction Gap & Model Boundaries:**
   The **85 Lean 4.35.0 theorems** verify mathematical and protocol models of $\mathrm{GF}(2^8)$, Cauchy $2\times 2$ decoding, the integer placement schedule, 4-stratum viability, RS(254,238) burst bounds, Merkle path commitment & quarantine, arbitrary-list unpinned quorum, `BitVec 32` RAM masking, dead-host xenograft refusal, 4-qubit complex unitarity, and a list-based 360-frame snapshot stack (`pushSnapshot`/`popSnapshot`).
   - The JavaScript runtime (`src/*.js`) is **not** extracted from Lean; in particular, `TemporalEngine` uses an $O(1)$ circular `RingBuffer` (vs. Lean's functional `List.take 360`), and `sha256.js` uses 128-bit truncated SHA-256 (vs. Lean's abstract injective `hashPair` with `pow2Pair` witness).
   - Runtime correspondence is bridged via the **30-suite** test harness (`test/verify.mjs`), **12/12** mutation testing (`scripts/mutation-test.mjs`), **2,000-case** seeded fuzzer (`scripts/fuzz.mjs`), clean-room **Python 3 differential oracle** (`reference/planaria_oracle.py`), and Statement-Fidelity Audit Table (`docs/reviews/2026-11-25-10-pass-red-team-audit.md`).
5. **General $k \times k$ Cauchy Non-Singularity:**
   Lean 4 proves universal $2 \times 2$ Cauchy non-singularity and exact decoding (`cauchy2_exact_decode`, `gf256_cauchy2_exact_decode` for Stratum 0 $k = 2$). Higher bundles ($k \in \{4, 6, 8, 16\}$) rely on the classical Cauchy determinant theorem in prose, randomized property tests across 25+ $(k, n)$ configurations in Suite 25, and independent Python 3 Gauss-Jordan verification in `reference/planaria_oracle.py`.
6. **Desktop-First Browser Requirements & Single-Machine Benchmarks:**
   The Studio 3D viewport requires WebGL2 (falling back gracefully to 2D PVM-32 + Tissue Surgery when unavailable). Timing benchmarks in `results/benchmarks.json` reflect one workstation (CPU/Node version recorded in JSON) and are not cross-architecture hardware guarantees. Note also that the Equal-Storage `RS(192, 48)` baseline in Experiment 1 evaluates the exact MDS rank threshold (`authenticCells >= 48`) on the same paired erasure patterns as `.hbin` rather than inverting a $48 \times 48$ matrix per trial; latency numbers therefore reflect PLANARIA's real full Cauchy decode.

## 3. Open Design Dilemmas (Logged per Build Standard R7 & R8)

- **Dilemma D1 — Non-Commercial License vs. OSI/JOSS/Mathlib Eligibility:**
  `LICENSE` uses the owner-mandated *Cosmogonic License — Non-Commercial Research & Play* (per Turn-1 explicit instruction, which takes precedence under Hard Rule `R8`; Build Standard audit tooling is explicitly carved out as CC BY 4.0). Because non-commercial clauses are not OSI-approved, PLANARIA is ineligible for JOSS submission or upstream Mathlib inclusion unless dual-licensed (e.g., Apache-2.0 / MIT) by the owner in a future release. See [ADR-0004](docs/adr/0004-non-commercial-license-vs-osi-dilemma.md).
- **Dilemma D2 — Ephemeral vs. Persistent Attestation Signing:**
  Running `npm run benchmark` without `PLANARIA_SIGNING_KEY_PEM` produces an explicitly labeled `ephemeral-self-consistency-seal` Ed25519 signature (proving internal bundle consistency only). External release authenticity relies on GitHub Release `SHA256SUMS`, SLSA provenance (`actions/attest-build-provenance@v4`), Git commit hashes, and Software Heritage snapshots.
