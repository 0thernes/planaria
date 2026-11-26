# ROADMAP.md — PLANARIA Development Roadmap

## Shipped Releases

- **`v1.0.0`** — Core `.hbin` codec (GF(2^8), interleaved RS(254,238), Cauchy MDS, Depth-8 SHA-256 Merkle), Plang compiler, PVM-32 VM, 3 initial species (`AEGIS_DRIFT`, `SYNTH_REACTOR`, `CIPHER_VAULT`), 2D Studio, initial Lean 4 proofs.
- **`v2.0.0` – `v2.1.0`** — 3D WebGL2 Temporal-Quantum Engine (`ChronoQuantumWorld`, `Renderer3D`), 4-qubit `QuantumRegister` (Horodecki CHSH, Mermin GHZ), `TemporalEngine` 360-frame rewind, 6.42T combinatorial generator, 4th species `QUANTUM_CHRONICLE`, 48 kHz lock-free AudioWorklet synth, AMS-LaTeX White Paper.
- **`v2.2.0`** — Deep 5-layer security/hardening pass (O(1) `RingBuffer`, 62 pure Lean 4 theorems, CLI & HTTP server hardening, 24 test suites, CI + Software Heritage archival).
- **`v2.3.0` (Current)** — 3-cycle exhaustive hardening pass:
  - 70 pure Lean 4.35.0 `module` theorems + standalone Palomar `Challenge.lean`/`Solution.lean`/`comparator.json` verified across **all 6 independent kernels** (`leanchecker`, `leanchecker-paranoid`, `lean4lean`, `nanoda_bin`, `con-leche --verified`, `con-ron --verified`)
  - Closed all 3 formal statement-fidelity gaps (`viabilityLevel`, `electUnpinnedQuorum`, `all192LexKeys.Nodup` + sorted-halves bridge) and added 5 non-vacuity witness lemmas
  - 28 verification suites (property-based, metamorphic, regression lock, examples), 10/10 (100%) surgical mutation testing, static & citation verifiers
  - Equal-storage flat `RS(192,48)` empirical baseline + Wilson 95% CIs + exact McNemar p-values + Cohen's $h$ + Holm–Bonferroni multiplicity correction
  - Build Standard v1.2.0 full compliance + live GitHub Pages deployment + WAI-ARIA accessibility + Pointer Events + Reduced Motion

## Planned Future Work (`v2.4+`)

1. **General $k \times k$ Cauchy Determinant Formalization in Pure Lean 4:** Extend `cauchy2_exact_decode` ($k = 2$) to arbitrary $k \times k$ Cauchy submatrices over $\mathrm{GF}(2^8)$ without requiring Mathlib.
2. **WASM / Native PVM-32 Companion Decoder:** Optional Rust/WASM decoder compiled alongside the zero-dependency JS reference implementation for differential fuzzing (`B15`/`B16`).
3. **Interactive Cross-Species Xenograft Composer in Studio:** Allow drag-and-drop mixing of arbitrary individual organs (B1–B5) across all 4 living species in the WebGL2 Studio.
4. **Independent Third-Party Replication:** Invite and record external replications in [REPLICATION.md](REPLICATION.md) and publish Zenodo archive deposit upon independent review.
5. **Licensing Review:** Evaluate dual-licensing core `.hbin` codec modules under an OSI-approved license if pursued for JOSS or Mathlib submission (see [ADR-0004](docs/adr/0004-non-commercial-license-vs-osi-dilemma.md)).
