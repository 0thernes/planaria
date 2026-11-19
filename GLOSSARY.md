# PLANARIA Technical Glossary (A–Z)

Comprehensive definitions of all binary-architecture, coding-theory, cryptographic, virtual-machine, compiler, surgical-vivisection, and formal-verification terms used across the **PLANARIA** repository.

---

### A

- **ABI Signature (`abiSig`)**: A 16-bit capability contract identifier embedded in every `.hbin` cell header (e.g., `0x0302` for `S2_CORTEX_RENDER`, `0x0402` for `S2_SYNTH_AUDIO`) that certifies a bundle obeys the standardized `PVM-32` Shared-Memory World-State ABI (`MEM[0..511]`), enabling safe Cross-Species Xenografting.
- **Amputation (Organ Amputation)**: Surgical destruction or removal of all Holographic Cells belonging to one or more targeted organ bundles (e.g., excising `S2_CORTEX_RENDER`), triggering live Control-Flow Anastomosis without halting execution.
- **Anastomosis (Control-Flow Anastomosis)**: Borrowed from vascular biology (reconnecting blood vessels around an occlusion). In `PVM-32`, the dynamic runtime rerouting of `ORGAN_CALL(organId, maxStratum)` instructions across surviving strata (`S3 -> S2 -> S1 -> S0 -> SafeStub`) when higher-stratum organs lose Cauchy rank.
- **Anastomosis Dispatch Table (ADT)**: The live per-frame organ viability table inside `PVM-32` that maps `(organId, maxStratum)` to the highest authenticated (or ABI-verified xenografted) executable bundle segment currently loaded in VM memory.
- **ARX Cipher**: Add-Rotate-XOR symmetric stream/block mixing structure implemented inside `programs/cipher_vault.plang` to generate live verifiable keystream entropy in `PVM-32`.
- **AudioWorklet**: WebAudio's dedicated off-main-thread real-time audio rendering thread (`src/web/audio-worklet.js`), executing PLANARIA's lock-free 48 kHz 4-voice polyphonic synthesizer directly from `PVM-32` hardware audio registers.

### B

- **Barker / Self-Synchronizing Sync Word**: The 32-bit marker `0x50 0x4C 0x4E 0xB7` (`PLN\xB7`) prepended to every 512-byte Holographic Cell, allowing the sliding-window correlator to recover cells at arbitrary unaligned byte offsets even with up to 3 corrupted bits inside the sync word itself.
- **Berlekamp-Massey Algorithm**: Iterative algebraic algorithm over $\text{GF}(2^8)$ (`src/core/rs.js`) that synthesizes the minimal-degree error-locator polynomial $\Lambda(x)$ from the 16 Reed-Solomon syndromes in $O(t^2)$ operations.
- **Bisection (Zero-Overlap Planarian Bisection)**: Physically cutting a `.hbin` binary into two disjoint byte slices (`[0..cut)` and `[cut..N)`) with zero overlapping bytes — even at arbitrary prime/unaligned byte offsets — such that BOTH halves boot at Stratum 3 and regenerate the 100% SHA-256 bit-exact original file.
- **Bounded-Distance Decoding**: Error correction guaranteed to uniquely recover the exact transmitted codeword whenever the Hamming error weight $e \le t = \lfloor(d_{\min} - 1)/2\rfloor$ (here $t = 8$ bytes per RS lane).
- **Bundle (`BUNDLE_SPECS`)**: One of the 7 stratified organ-capability partitions in `.hbin` v1.0 (`B0: S0_STEM_NUCLEUS`, `B1: S1_CORE_LOGIC`, `B2: S1_WIREFRAME`, `B3: S2_CORTEX_RENDER`, `B4: S2_SYNTH_AUDIO`, `B5: S3_ORGANISM_FX`, `B6: S3_GENOME_LEDGER`), each independently Cauchy-MDS encoded with its own threshold $k_b$ and cell count $n_b$.
- **Burst Error**: A contiguous run of consecutive corrupted bytes (such as physical media scratches or flash page decay). PLANARIA's 2-way interleaved `RS(254, 238)` armor provably heals any contiguous burst up to **16 consecutive bytes inside every single 512-byte cell**.
- **Byzantine Cell / Trojan Cell**: An adversarially forged 512-byte cell carrying a valid sync word, valid cell header, valid Cauchy coordinate `evalX`, and valid `RS(254, 238)` inner parity, but containing malicious payload bytes intended to poison outer GF($2^8$) Gaussian elimination.
- **Byzantine Immune System**: PLANARIA's cryptographic Depth-8 SHA-256-128 Merkle authentication and quarantine layer that isolates and discards 100% of forged Byzantine cells *before* they can enter the Cauchy MDS decoder.

### C

- **Cauchy Matrix ($C_{i,j} = (x_i \oplus y_j)^{-1}$)**: A finite-field matrix constructed from disjoint coordinate sets $X, Y \subset \text{GF}(2^8)$ with the theorem-backed MDS guarantee that **every** $k \times k$ submatrix is strictly invertible (unlike naive Vandermonde constructions over $\text{GF}(2^8)$).
- **Cellular Tissue Map**: Interactive 24×8 (192-cell) visual map in the Surgical Vivisection Studio representing every 512-byte cell of a `.hbin` file colored by stratum and live forensic state (`INTACT`, `REPAIRED`, `NECROTIC`, `QUARANTINED`, `XENOGRAFT`).
- **Chien Search**: Exhaustive finite-field root-finding sweep (`src/core/rs.js`) that evaluates $\Lambda(\alpha^{-p})$ across all 254 codeword byte positions to pinpoint exact corrupted byte indices.
- **Chimera (Executable Chimera)**: A living hybrid `.hbin` organism formed by splicing ABI-compatible donor organs (`RENDERER`, `AUDIO`, `FX`, `LOGIC`) from one compiled species into an amputated host species, exportable as its own standalone self-healing 96 KiB `.hbin` binary.
- **Cliff Effect (Erasure Cliff)**: The catastrophic all-or-nothing failure mode of conventional single-rate MDS/Reed-Solomon coding: 100% recovery at $k$ shards, and **0% total execution failure** at $k - 1$ shards. Eliminated by PLANARIA's 4-stratum progressive architecture.
- **Consensus Quorum Election**: Unpinned boot-mode authentication (`decodeHbin` without `pinnedRootHex`) where harvested cells self-compute their implied Depth-8 Merkle roots and elect the largest coherent cryptographic root cluster as the primary organism, isolating disjoint forged/corrupted cells.

### D–F

- **Domain Separation**: Prepending distinct byte tags (`0x00` for Merkle leaves, `0x01` for internal parent nodes) prior to SHA-256 hashing to prevent second-preimage leaf/internal confusion attacks.
- **Ed25519 Attestation**: Elliptic-curve digital signature over Curve25519 generated by `scripts/benchmark.mjs` into `results/attestation.json` to cryptographically bind source files, compiled `.hbin` artifacts, and benchmark results.
- **Falsifiability (Popperian Falsification)**: Designing explicit negative boundary tests (e.g., $e = 10 > 8$ RS errors, $18\text{B} > 16\text{B}$ burst errors, $N < 2k$ mitosis impossibility, Immune OFF Byzantine poisoning, `< 2` Stratum-0 cell extinction) verifying the system fails *precisely* where formal theorems prove it must fail.
- **Forney Algorithm**: Closed-form algebraic formula $e_k = X_k \Omega(X_k^{-1}) / \Lambda'(X_k^{-1})$ over characteristic-2 $\text{GF}(2^8)$ (`fcr = 0`) computing exact byte error magnitudes at every root identified by Chien search.
- **Fuzzy Sync Correlation**: Sliding-window byte scan accepting candidate cell frames whose 32-bit sync marker differs from `PLN\xB7` by $\le 3$ bit flips (Hamming distance $\le 3$).

### G–L

- **Galois Field $\text{GF}(2^8)$**: Finite field of 256 elements constructed modulo irreducible primitive polynomial $P(x) = x^8 + x^4 + x^3 + x^2 + 1$ (`0x11D`), generator $\alpha = 2$. Used identically by `gf256.js`, `rs.js`, `cauchy.js`, and `lean/PlanariaProofs/GF256.lean`.
- **Genome Ledger (`S3_GENOME_LEDGER`, Bundle 6)**: The self-describing metadata bundle ($k=8, n=24$) storing organism name, species tag, bundle lengths, and hashes so any surviving half can re-emit a 100% SHA-256 bit-exact replica of the original `.hbin`.
- **Ghost Mode (Stratum-0 Stem Execution)**: Ultra-degraded emergency execution mode surviving up to ~92% total file obliteration, driven solely by `S0_STEM_NUCLEUS` ($k_0 = 2, n_0 = 24$), displaying a monochrome wireframe distress beacon and pulsing a 1-bit heartbeat.
- **`.hbin` (Holographic Binary)**: PLANARIA's headerless 98,304-byte (96 KiB) executable container format composed of 192 interleaved 512-byte Holographic Cells.
- **Holographic Cell**: The atomic 512-byte self-contained execution unit of `.hbin`: 4B sync word + 16B header + 332B Cauchy-coded payload + 128B Depth-8 SHA-256-128 Merkle proof + 32B 2-way interleaved `RS(254, 238)` parity.
- **Hot-Swap Tissue Update**: Replacing decoded organ bytecode segments inside a running `PVM-32` instance (`vm.loadDecoded(decoded, false)`) without resetting RAM or pausing frame execution.
- **Interleaving (2-Way Interleaved RS)**: Splitting the 476-byte cell body into even-indexed and odd-indexed lanes of 238 bytes each, armored independently by `RS(254, 238)`, doubling contiguous burst-error tolerance from 8 bytes to 16 bytes.
- **Lean 4 (`v4.35.0`)**: Interactive theorem prover and dependent type theory kernel used in `lean/` to machine-check all 31 PLANARIA formal theorems with zero `sorryAx` and zero custom axioms.
- **Lineage Merkle Root (`lineageRootHex`)**: The unique 128-bit cryptographic root of a `.hbin` binary's Depth-8 SHA-256 Merkle tree committing all 192 Holographic Cells (348 header+payload bytes per cell).
- **Linear Control Twin (`LINBIN01`)**: Monolithic ELF/WASM-style control binary (`src/vm/linear-twin.js`) carrying the exact same compiled `PVM-32` bytecode with a 64-byte header at offset 0 and SHA-256 code digest, used for side-by-side falsification testing.
- **Low-Discrepancy Placement Schedule (`PLACEMENT_SCHEDULE`)**: Deterministic fractional interleaving $p(b, i) = (i + (b + 0.5)/7) / n_b$ spreading every bundle uniformly across `[0, 1)` so any 50% contiguous cut captures $\approx n_b/2$ cells of every bundle.

### M–R

- **MDS Code (Maximum Distance Separable)**: An $(n, k)$ linear code achieving the Singleton bound $d_{\min} = n - k + 1$, meaning **any** $k$ out of $n$ coded symbols reconstruct the exact source message with zero storage overhead waste.
- **Merkle Inclusion Proof**: The 128-byte (8 sibling hashes × 16 bytes) cryptographic path embedded inside every Holographic Cell proving membership in the binary's Lineage Merkle Root.
- **Mitosis (Binary Mitosis)**: Splitting one living `.hbin` binary into two zero-overlap halves that both boot independently and each regenerate a 100% SHA-256 bit-exact copy of the parent binary.
- **`ORGAN_CALL` (Opcode 31)**: Native `PVM-32` machine instruction dispatching dynamically through the Anastomosis Dispatch Table (`ORGAN_CALL rd, organId, maxStratum`), returning `1` on live execution or `0` to trigger lower-stratum fallback.
- **Pinned-Root Authentication**: Zero-trust decoding mode supplying an expected `pinnedRootHex`, guaranteeing 100% rejection of even a self-consistent majority flood of forged Byzantine cells.
- **Plang**: PLANARIA's structured C/Rust-like multi-stratum systems language (`programs/*.plang`), compiled by `src/compiler/` into `PVM-32` 32-bit machine code and `.hbin` binaries.
- **Progressive Holographic Instruction Stratification (PHIS)**: PLANARIA's core architectural paradigm: compiling functional organs into nested capability strata with strictly increasing Cauchy MDS thresholds ($k_0 < k_1 < k_2 < k_3$) coupled to runtime Control-Flow Anastomosis, eliminating the erasure cliff.
- **`PVM-32`**: PLANARIA's 32-bit fixed-width RISC register virtual machine (`src/vm/pvm32.js`) with 32 registers, 4,096-word sandboxed linear RAM, 160×120 framebuffer, 4-voice synth registers, and Anastomosis dispatch.
- **Reed-Solomon `RS(254, 238)`**: Inner byte-level algebraic error-correcting code over $\text{GF}(2^8)$ ($d_{\min} = 17$, $t = 8$ byte errors corrected per codeword).

### S–Z

- **Shared-Memory World-State ABI**: Fixed RAM contract (`MEM[0..511]`) standardized across all `.plang` species (global telemetry, player coordinates, 24 shared entities, particles, events), enabling live Cross-Species Xenografting.
- **Sovereignty Policy**: Non-xenograftability rule (`xenograftable = false`) enforced on Bundle 0 (`S0_STEM_NUCLEUS`) and Bundle 6 (`S3_GENOME_LEDGER`), preventing a donor binary from hijacking host execution sovereignty (formally proved in Theorem V.3).
- **Stem Nucleus (`S0_STEM_NUCLEUS`, Bundle 0)**: The ultra-redundant ($k=2, n=24$, 91.7% erasure tolerance) bootstrapping microkernel present in every `.hbin` binary.
- **Stratum (`S0`–`S3`)**: Capability tier in PLANARIA's 4-level viability lattice: `S0` (Stem Nucleus), `S1` (Vital Logic + Wireframe), `S2` (Cortex Render + Polyphonic Synth Audio), `S3` (Full Organism FX + Self-Regenerating Genome).
- **Super-Additive Synergistic Healing**: Phenomenon where two individually crippled sub-threshold shards (e.g., two thirds of a trisected binary capped at `S2`) heal back to full `S3` bit-exact integrity upon raw OS byte concatenation (`cat A B > fused`), formally proved in Theorem III.4 and Theorem II.7.
- **Syndrome Recheck**: Mandatory post-correction evaluation of all 16 Reed-Solomon syndromes inside `rsDecode()` to guarantee uncorrectable ($> 8$-error) cells fail cleanly rather than silently misdecoding.
- **Xenografting (Executable Xenografting)**: Splicing raw bytes from a foreign compiled `.hbin` species onto an amputated host binary so the host's Anastomosis loader transplants ABI-matching donor organs (`RENDERER`, `AUDIO`, `FX`, `LOGIC`) live at runtime.
