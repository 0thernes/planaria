# PLANARIA Architecture (`v2.4.0`)

## System Overview

PLANARIA replaces monolithic header-dependent executables with **headerless, spatially stratified holographic cellular binaries (`.hbin`)** paired with a fault-isolated register virtual machine (`PVM-32`) capable of autonomous multi-stratum control-flow anastomosis. Every byte of a compiled `98,304`-byte `.hbin` organism consists exclusively of `192` self-synchronizing `512`-byte cellular frames arranged via an exact-integer low-discrepancy placement schedule (`PLACEMENT_SCHEDULE`) so that arbitrary 50/50 spatial cuts (including prime unaligned byte offsets) partition the organism with zero byte overlap while preserving full algebraic reconstructibility.

```text
  .plang Source (4 Living Species)
        │  src/compiler/{lexer,parser,codegen,isa}.js
        ▼
  7 Organ Bundles (exact BUNDLE_SPECS in src/core/hbin.js, total k=48, n=192):
    ├── Stratum 0: B0 S0_STEM_NUCLEUS   (k=2,  n=24, cap=664 B)   [sovereign, 91.7% loss tol]
    ├── Stratum 1: B1 S1_CORE_LOGIC     (k=4,  n=24, cap=1,328 B) [xenograftable]
    │              B2 S1_WIREFRAME      (k=4,  n=24, cap=1,328 B) [xenograftable]
    ├── Stratum 2: B3 S2_CORTEX_RENDER  (k=8,  n=32, cap=2,656 B) [xenograftable]
    │              B4 S2_SYNTH_AUDIO    (k=6,  n=24, cap=1,992 B) [xenograftable]
    └── Stratum 3: B5 S3_ORGANISM_FX    (k=16, n=40, cap=5,312 B) [xenograftable]
                   B6 S3_GENOME_LEDGER  (k=8,  n=24, cap=2,656 B) [sovereign, non-executable]
        │  Each 512 B Cell = 4 B Sync ('PLN\xB7') + 2x Interleaved RS(254,238) (508 B)
        │                  = 476 B Body (16 B Header + 332 B Cauchy Shard + 8x16 B Merkle Proof) + 32 B Parity
        ▼
  192-Cell Exact-Integer Placement Scheduled .hbin Binary (98,304 B)
        │  decodeHbin() -> Fuzzy Sync Scan (<=3b) + Dense-Flood Guard + ±512 B Cadence Flywheel
        │               -> 2x Interleaved RS(254,238) Repair (<=8 B/lane, 16 B burst)
        │               -> Depth-8 Domain-Separated SHA-256-128 Merkle Quarantine (0x00/0x01/0x02)
        │               -> GF(2^8) Cauchy MDS Recovery + Optional ABI-Verified Xenografting
        ▼
  PVM-32 Sandboxed Virtual Machine (src/vm/pvm32.js)
    ├── 32x32-bit regs (r0=0, r1..r7 ABI, r8..r17 scratch, r18..r31 callee/local frame)
    ├── 4,096-word RAM strictly masked (& 0xFFF), 16,000-insn default fuel + proportional blitter fuel
    ├── Transactional RAM & voice rollback on organ traps; ORGAN_CALL descending anastomosis
    └── Live coupling to 4-Qubit Register + Temporal RingBuffer + WebGL2 3D + 48 kHz AudioWorklet
```

## Layer 1 — Coding Theory, Cryptography & Cellular Codec (`src/core/`)

| Module | Responsibility | Key Invariants |
|---|---|---|
| `gf256.js` | $\mathrm{GF}(2^8)$ arithmetic (`0x11D`, generator `0x02`) | Exhaustively verified over all $65{,}536$ pairs & $16{,}777{,}216$ triples (`Suite 01`, `Planaria.GF256`) |
| `rs.js` | 2-way interleaved `RS(254, 238)` Berlekamp–Massey / Chien / Forney | Repairs $\le 8$ random errors/lane ($16$ B contiguous burst per cell); strictly rejects $9+$ errors/lane (`Suite 02`, `Planaria.Byzantine`) |
| `cauchy.js` | Systematic-free Cauchy MDS over $\mathrm{GF}(2^8)$ ($C_{i,j} = (x_i \oplus y_j)^{-1}$) | Any $k$ distinct `evalX` shards invert losslessly (`k <= 128`, deduplicated); $2\times 2$ non-singularity proved universally (`Planaria.GF256.gf256_cauchy2_exact_decode`) |
| `sha256.js` | Pure JS FIPS 180-4 SHA-256 + Depth-8 Merkle tree (`0x00` leaf / `0x01` internal / `0x02 \|\| "PLN\0"` empty) | Bit-exact parity with Node OpenSSL & Python `hashlib` (`Suite 03`, `reference/planaria_oracle.py`); full-path commitment (`Planaria.Byzantine.merkle_path_collision_free_binding`) |
| `hbin.js` | 192-cell `PLACEMENT_SCHEDULE`, fuzzy sync scanner, dense-flood guard, ±512 B flywheel, Merkle quarantine, xenograft engine | Zero-overlap exact/prime mitosis (`Planaria.Mitosis`), 1-cell unpinned fail-closed quorum, dead-host xenograft refusal (`Planaria.Xenograft.xenograft_dead_host_refused`), deterministic code-point donor tie-break |
| `torture.js` | Deterministic damage injectors (bisection, trisection, bit-rot, burst, unaligned shift, Trojan, overlap-eclipse, flywheel amputation) | Exact seeded Mulberry32 PRNG for paired Monte Carlo comparisons |

### Exact-Integer Placement Schedule (`PLACEMENT_SCHEDULE`)

Every cell `(bundleId b, cellInBundle i)` across all 7 bundles `(k, n_b) ∈ {(2,24),(4,24),(4,24),(8,32),(6,24),(16,40),(8,24)}` receives the exact integer numerator:

```text
posNum(b, i, n_b) = (14 * i + 2 * b + 1) * (480 / n_b)  ∈ (0, 6720)
```

Cells are placed in strictly ascending lexicographic order of `(posNum, b, i)` (zero IEEE-754 tie-break drift). Because `480 % n_b == 0` for every bundle and `posNum != 3360` for all 192 cells, slots `0..95` contain **exactly** `n_b / 2 >= k_b + 2` cells of every bundle and slots `96..191` contain **exactly** `n_b / 2 >= k_b + 2` cells (`Planaria.Mitosis.planaria_schedule_exact_halves`, `Planaria.Mitosis.planaria_schedule_nodup_and_sorted_halves`).

## Layer 2 — Plang Compiler & `PVM-32` Virtual Machine (`src/compiler/`, `src/vm/`)

- **Plang Language (`lexer.js`, `parser.js`, `codegen.js`, `isa.js`):** Compiles structured 7-bundle living organisms (`programs/*.plang`) to fixed-width 32-bit RISC bytecode. Enforces `MAX_PARSE_DEPTH = 128` across blocks, `else if`, and ternary chains, iterative AST `containsCall` + `MAX_AST_DEPTH = 256`, `Map`-based symbol tables (immune to `Object.prototype` collisions), strict scratch-register overflow guard (`rR > 17`), built-in constant/organ protection, deterministic `LI r1, 0` on bare `return;`, and strict signed 32-bit decimal range checks (hex `0x...` required for bit-patterns `> 2147483647`).
- **`PVM-32` (`pvm32.js`):** Deterministic 32-bit virtual machine with `& 0xFFF` RAM address sandboxing, exact `BigInt` integer square root (`ISQRT`), default `16,000`-instruction per-frame budget + proportional blitter fuel (`GLOW` 128, `CLEAR` 64, `TRI` 4, `LINE` 2), transactional RAM/voice rollback on organ traps, strict Bundle 6 non-execution (`bundleCode[6] === null`), and `ORGAN_CALL` vascular anastomosis.
- **Control Baselines (`linear-twin.js`, `scripts/benchmark.mjs`):** `LINBIN01` traditional headered linear binary with SHA-256 footer, plus single-stratum `RS(40,16)` and equal-storage flat `RS(192,48)` monolithic archive baselines.

## Layer 3 — 4-Qubit Quantum Engine, Temporal Causality & WebGL2 Studio (`src/quantum/`, `src/world/`, `src/web/`)

- **Quantum Register (`qengine.js`):** Exact $2^4 = 16$-amplitude complex double-precision statevector supporting `X/Y/Z/H/S/T/RX/RY/RZ/CNOT/CZ/SWAP`, Werner depolarizing decoherence ($V = e^{-\gamma t} \to 0$) honored during projective readout, exact Horodecki $3\times 3$ correlation-tensor CHSH maximum $S_{\max} = 2\sqrt{\lambda_0 + \lambda_1}$ (reaching $2\sqrt{2} \approx 2.8284$ on Bell states), 4-qubit Mermin $|M_4|$ witness (reaching **$|M_4| = 4.0$** on $\mathrm{GHZ}_4$), WKB barrier tunneling, Heisenberg uncertainty, and Zeno suppression.
- **Temporal Engine (`temporal.js`):** $O(1)$ circular 360-frame `RingBuffer` recording full deep-copied world snapshots (player kinematics, HP, XP, skills, weapons, armors, indices, recent loot, player profile, deterministic Mulberry32 RNG state, quantum amplitudes & gate counter, active NPCs, delayed echo shots, chrono wells, echo clones) enabling causality-consistent rewind with zero inventory or skill-point exploits.
- **3D World & WebGL2 Renderer (`generator.js`, `game3d.js`, `renderer3d.js`, `audio-worklet.js`):** Deterministic 64-bit seeded 6-realm stage & gear generator spanning 24 orders of magnitude (`6,421,059,993,600` reachable discrete combinations), pure WebGL2 GLSL 300 es pipeline with organ-amputation degradation (`S0`–`S3`), plus a lock-free 48 kHz PolyBLEP `AudioWorklet` synthesizer coupled to `PVM-32` Bundle 4.

## Layer 4 — CLI, Hardened HTTP Server, Python Oracle & Static Pages (`bin/`, `server.mjs`, `reference/`, `scripts/`)

- **CLI (`bin/planaria.mjs`):** 9 subcommands (`compile`, `inspect`, `run`, `bisect`, `fuse`, `heal`, `damage`, `xenograft`, `disasm`), 16 MiB bounded file reader, distinct-output guards, `--allow-partial`, `--include-sync`, `--allow-unpinned-xenograft`, exit code `2` on non-bootable organism, exit code `3` on VM traps.
- **HTTP Server (`server.mjs`):** Zero-dependency static host bound to `127.0.0.1:4174` serving `/` (Studio), `/blueprint/` (Interactive Lean Blueprint), and `/healthz`, with TOCTOU-safe `openSync`/`fstatSync`, symlink-escape protection, strict CSP, `X-Frame-Options: DENY`, `nosniff`, `/src/web/index.html -> /` 302 redirect, and graceful `SIGINT`/`SIGTERM` shutdown.
- **Clean-Room Python 3 Oracle (`reference/planaria_oracle.py`):** Independent pure-Python stdlib implementation decoding all 4 `.hbin` binaries (768 cells), unaligned mitosis (`49,177 B`), and 4-qubit CHSH/Mermin invariants.

## Layer 5 — 6-Kernel Pure Lean 4.35.0 Proofs & Interactive Blueprint (`lean/`, `blueprint/`, `formalization.yaml`)

Seven zero-Mathlib `module` files (`GF256`, `MitosisBounds`, `StratumAnastomosis`, `ByzantineImmune`, `XenograftABI`, `QuantumTemporal`, `AdversarialTests`) built with `autoImplicit = false` & `relaxedAutoImplicit = false` prove **85 theorems** (15 axiom-free, 12 `[propext]` only, 40 `[propext, Quot.sound]`, 18 `[propext, Classical.choice, Quot.sound]`), exported via Palomar `Challenge.lean` / `Solution.lean` / `comparator.json` and checked by six kernel checks in CI (`lean4`, `leanchecker`, `leanchecker-paranoid`, `nanoda_bin`, `con-leche`, `con-ron`, `lean4lean`; Lean default and paranoid share the Lean C++ kernel), plus `lake comparator --paranoid` and a negative tampering check in Ubuntu Linux CI and visualized in `blueprint/index.html`.
