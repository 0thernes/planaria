# PLANARIA Architecture (`v2.3.0`)

## System Overview

PLANARIA replaces monolithic header-dependent executables with **headerless, spatially stratified holographic cellular binaries (`.hbin`)** paired with a fault-isolated register virtual machine (`PVM-32`) capable of autonomous multi-stratum control-flow anastomosis. Every byte of a compiled `98,304`-byte `.hbin` organism consists exclusively of `192` self-synchronizing `512`-byte cellular frames arranged via an arithmetic coprime scatter schedule so that arbitrary spatial cuts partition the organism with zero byte overlap while preserving full algebraic reconstructibility.

```text
  .plang Source (4 Living Species)
        │  src/compiler/{lexer,parser,codegen,isa}.js
        ▼
  7 Organ Bundles (B0..B6: Stem, CoreLogic, PrimaryGfx, HdFx, AudioSynth, StateSchema, Genome)
        │  src/core/{gf256,cauchy,rs,sha256,hbin}.js
        ▼
  4-Stratum Progressive Cauchy MDS Encoding over GF(2^8) [poly 0x11D]
    ├── Stratum 0 (B0, k=4)  -> 36 cells  [min survival: 2.08% ideal / ~12% spatial cut]
    ├── Stratum 1 (B1, k=8)  -> 40 cells  [min survival: 4.17% ideal / ~18% spatial cut]
    ├── Stratum 2 (B2, k=16) -> 48 cells  [min survival: 8.33% ideal / ~28% spatial cut]
    └── Stratum 3 (B3..B6)   -> 68 cells  [full HD/Audio/Genome regeneration at 50% mitosis]
        │  Each 512 B Cell = 4 B Sync ('PLN\xB7') + 2x Interleaved RS(254,238)
        │                  = 476 B Payload (Header + 332 B Cauchy Shard + 8x16 B Merkle Proof)
        ▼
  192-Cell Scatter-Scheduled .hbin Binary (98,304 B)
        │  decodeHbin() -> Sync Scan + Iterative Backward Flywheel + RS(254,238) Repair
        │               -> Depth-8 Domain-Separated SHA-256-128 Merkle Quarantine
        │               -> GF(2^8) Cauchy MDS Recovery + Optional ABI-Verified Xenografting
        ▼
  PVM-32 Sandboxed Virtual Machine (src/vm/pvm32.js)
    ├── 32x32-bit regs (r0=0, r1..r7 ABI, r8..r17 scratch, r18..r29 locals, r30/r31 frame)
    ├── 4,096-word RAM strictly masked (& 0xFFF), bounded instruction fuel per frame
    ├── ORGAN_CALL descending anastomosis (S3 -> S2 -> S1 -> S0 fallback)
    └── Live coupling to 4-Qubit Register + Temporal RingBuffer + WebGL2 3D + 48 kHz AudioWorklet
```

## Layer 1 — Coding Theory, Cryptography & Cellular Codec (`src/core/`)

| Module | Responsibility | Key Invariants |
|---|---|---|
| `gf256.js` | $\mathrm{GF}(2^8)$ arithmetic (`0x11D`, generator `0x02`) | Exhaustively verified over all $65{,}536$ pairs (`Suite 01`, `GF256.lean`) |
| `rs.js` | Interleaved `RS(254, 238)` Berlekamp–Massey / Chien / Forney | Repairs $\le 8$ random errors/lane ($16$ B contiguous burst per cell); strictly rejects $9+$ errors/lane (`Suite 02`) |
| `cauchy.js` | Systematic-free Cauchy MDS over $\mathrm{GF}(2^8)$ ($C_{i,j} = (x_i \oplus y_j)^{-1}$) | Any $k$ distinct `evalX` shards invert losslessly (`k <= 128`, deduplicated); 2x2 singularity impossible (`GF256.lean`) |
| `sha256.js` | Pure JS FIPS 180-4 SHA-256 + Depth-8 Merkle tree (`0x00` leaf / `0x01` internal) | Bit-exact parity with Node OpenSSL (`Suite 03`, `Suite 25`); second-preimage domain separation (`ByzantineImmune.lean`) |
| `hbin.js` | 192-cell scatter scheduler, self-sync scanner, backward flywheel, Merkle quarantine, xenograft engine | Zero-overlap exact/prime mitosis (`MitosisBounds.lean`), O(1) sync-flood rejection, dead-host xenograft refusal, lexical donor tie-break |
| `torture.js` | Deterministic damage injectors (bisection, trisection, bit-rot, burst, unaligned shift, Trojan, overlap-eclipse) | Exact seeded PRNG (`mulberry32`) for paired Monte Carlo comparisons |

### Scatter Schedule Geometry (`CELL_SCHEDULE`)

Each of the `192` cells `(bundleId, shardIdx)` receives a deterministic sort key `key = (73 * idx + 19 * bundleId + 11) mod 192` and is placed in ascending lexicographic order of `(key, bundleId, shardIdx)`. Because `gcd(73, 192) = 1`, the schedule is a bijection (`MitosisBounds.lean: planaria_schedule_nodup_and_sorted_halves`). Every bundle's parity shards distribute uniformly across both the left half (`slots 0..95`) and right half (`slots 96..191`), guaranteeing that EVERY bundle has at least `k` shards on BOTH sides of any exact half-cut (`Suite 04` and `MitosisBounds.lean: planaria_zero_overlap_mitosis`).

## Layer 2 — Plang Compiler & `PVM-32` Virtual Machine (`src/compiler/`, `src/vm/`)

- **Plang Language (`lexer.js`, `parser.js`, `codegen.js`, `isa.js`):** Compiles structured 7-bundle living organisms (`programs/*.plang`) to fixed-width 32-bit RISC bytecode. Enforces `MAX_PARSE_DEPTH = 128`, `Map`-based symbol tables (immune to `Object.prototype` collisions), strict scratch-register overflow guard (`rR > 17`), deterministic `LI r1, 0` on bare `return;`, and unsigned 32-bit decimal/hex literal parsing with signed negation range checks.
- **`PVM-32` (`pvm32.js`):** Deterministic 32-bit virtual machine with `& 0xFFF` RAM address sandboxing, exact `BigInt` integer square root (`ISQRT`), bounded per-frame fuel preventing infinite loops, strict Bundle 6 non-execution (`bundleCode[6] === null`), and `ORGAN_CALL` vascular anastomosis.
- **Control Baseline (`linear-twin.js`):** `LINBIN01` traditional headered linear binary with SHA-256 integrity footer, plus equal-storage flat `RS(192, 48)` baseline in `scripts/benchmark.mjs` for rigorous ablation.

## Layer 3 — 4-Qubit Quantum Engine, Temporal Causality & WebGL2 Studio (`src/quantum/`, `src/world/`, `src/web/`)

- **Quantum Register (`qengine.js`):** Exact $2^4 = 16$-amplitude complex double-precision statevector supporting `X/Y/Z/H/S/T/RX/RY/RZ/CNOT/CZ/SWAP`, Werner depolarizing decoherence ($V = e^{-\gamma t} \to 0$), exact Horodecki $3\times 3$ correlation-tensor CHSH maximum $S_{\max} = 2\sqrt{\lambda_0 + \lambda_1}$ (reaching $2\sqrt{2}$ on Bell states), 4-qubit Mermin $|M_4|$ witness (reaching $8.0$ on $\mathrm{GHZ}_4$), WKB barrier tunneling, Heisenberg uncertainty, and Zeno suppression.
- **Temporal Engine (`temporal.js`):** $O(1)$ circular 360-frame `RingBuffer` recording full deterministic snapshots (player kinematics, HP, XP, skills, chrono-energy, active NPCs, delayed echo shots, scale override) enabling causality-consistent rewind with zero skill-point duplication exploits.
- **3D World & WebGL2 Renderer (`generator.js`, `game3d.js`, `renderer3d.js`, `audio-worklet.js`):** Deterministic 64-bit seeded 6-order stage & gear generator (`6.42T` reachable combinations), pure WebGL2 GLSL 300 es pipeline with CPU normal matrices and float64 phase reduction, plus a lock-free 48 kHz PolyBLEP `AudioWorklet` synthesizer coupled directly to `PVM-32` Bundle 4 registers.

## Layer 4 — CLI, Hardened HTTP Server & Static Pages (`bin/`, `server.mjs`, `scripts/`)

- **CLI (`bin/planaria.mjs`):** 9 subcommands (`compile`, `inspect`, `run`, `bisect`, `fuse`, `heal`, `damage`, `xenograft`, `disasm`), strict flag validation, explicit `--allow-unpinned-xenograft` opt-in, and exit code `3` on VM traps.
- **HTTP Server (`server.mjs`):** Zero-dependency static host bound to `127.0.0.1:4174` with `/healthz`, TOCTOU-safe `openSync`/`fstatSync`, symlink-escape protection, strict CSP, `X-Frame-Options: DENY`, `nosniff`, and static non-echoing 404 responses.
- **Static Pages Builder (`scripts/build-pages.mjs`):** Assembles a subpath-safe `_site/` bundle for GitHub Pages with zero root-anchored asset URLs.

## Layer 5 — 6-Kernel Pure Lean 4.35.0 Proofs (`lean/`, `formalization.yaml`)

Six zero-Mathlib `module` files (`GF256`, `MitosisBounds`, `StratumAnastomosis`, `ByzantineImmune`, `XenograftABI`, `QuantumTemporal`) prove **70 theorems** using only Lean's standard axioms `[propext, Classical.choice, Quot.sound]`, exported via Palomar `Challenge.lean` / `Solution.lean` / `comparator.json` and independently checked across 6 distinct kernels (`lean4`, `leanchecker`, `leanchecker-paranoid`, `nanoda_bin`, `con-leche`, `con-ron`, plus `lean4lean` & `lake comparator --paranoid` in Ubuntu Linux CI).
