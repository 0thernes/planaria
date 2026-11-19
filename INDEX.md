# PLANARIA — Master Index & Complete Table of Contents

Cross-referenced directory of every research document, source module, compiled `.hbin` organism, formal Lean 4 theorem, verification suite, and empirical benchmark artifact in **PLANARIA v1.0.0**.

---

## 1. Research Manuscripts & Governance Documents

| File | Role | Key Contents |
|---|---|---|
| [`README.md`](README.md) | Flagship Overview | Architecture diagram, 5 phenomena, 5 theorems, quickstart, CLI & Studio guide |
| [`SUMMARY.md`](SUMMARY.md) | Executive Summary Paper | Standalone 2-page technical overview, headline comparison table & novelty verdict |
| [`paper/WHITE_PAPER.md`](paper/WHITE_PAPER.md) | Publication-Grade White Paper | 12-section formal systems paper, byte-exact `.hbin` spec, benchmarks & 16 primary citations |
| [`docs/MASTER_REPORT.md`](docs/MASTER_REPORT.md) | Comprehensive Master Report | Byte-level engineering audit, compiler/VM deep dive, failure modes, operations manual |
| [`VERIFICATION.md`](VERIFICATION.md) | Verification & Authentication Protocol | Provable / Falsifiable / Verifiable / Authenticated checklist, exact SHA-256 & Ed25519 checks |
| [`GLOSSARY.md`](GLOSSARY.md) | A–Z Technical Glossary | 50+ rigorous definitions across binary formats, coding theory, crypto, VM & Lean 4 |
| [`lean/README.md`](lean/README.md) | Lean 4 Proof Library Guide | Complete 31-theorem catalog, axiom audit summary & scope boundaries |
| [`LICENSE`](LICENSE) | Legal License | Cosmogonic License — Non-Commercial Research & Play (0thernes LLC) |
| [`LEGAL.md`](LEGAL.md) | Legal & Authorship Notice | Ownership, Alexander S. Donahue ORCID, AI disclosure, patent/trademark & proof boundaries |
| [`NOTICE`](NOTICE) | Dependency Disclosure | Zero runtime dependencies & external toolchain inventory |
| [`CITATION.cff`](CITATION.cff) | Machine-Readable Citation | CFF v1.2.0 metadata for academic & independent citation |
| [`CHANGELOG.md`](CHANGELOG.md) | Release History | Full v1.0.0 feature & verification inventory |
| [`VERSION`](VERSION) | Release Tag | `1.0.0` |

---

## 2. Source Code Architecture (`src/`, `bin/`, `scripts/`, `test/`)

### 2.1 Core Coding, Cryptography & `.hbin` Cellular Engine (`src/core/`)
- [`src/core/gf256.js`](src/core/gf256.js) — Exact $\text{GF}(2^8)$ finite-field arithmetic (`0x11D`), tables, direct multiply, polynomial algebra.
- [`src/core/rs.js`](src/core/rs.js) — Exact inner `RS(254, 238)` encoder, Berlekamp-Massey + Chien + Forney decoder + syndrome recheck, and 2-way interleaved 508B cell armor (16B contiguous burst tolerance).
- [`src/core/cauchy.js`](src/core/cauchy.js) — Pure Cauchy-matrix MDS erasure encoder $C_{i,j} = (x_i \oplus y_j)^{-1}$ & exact $\text{GF}(2^8)$ Gauss-Jordan matrix inverter.
- [`src/core/sha256.js`](src/core/sha256.js) — Zero-dep synchronous FIPS 180-4 SHA-256 & domain-separated Depth-8 binary Merkle tree.
- [`src/core/hbin.js`](src/core/hbin.js) — `.hbin` v1.0 512-byte cell format, low-discrepancy placement schedule, fuzzy Barker sync correlator, Byzantine Merkle quarantine, full bit-exact regeneration, and ABI-verified Xenograft splicer.
- [`src/core/torture.js`](src/core/torture.js) — Real raw-byte surgical operators (`bisectBinary`, `splitBinary`, `shredCells`, `irradiateCells`, `amputateBundles`, `shiftAndShuffle`, `injectByzantineTrojans`, `concatShards`).

### 2.2 `Plang` Multi-Stratum Compiler (`src/compiler/`)
- [`src/compiler/isa.js`](src/compiler/isa.js) — `PVM-32` 32-bit ISA opcodes, 20 hardware syscalls, instruction encoders, disassembler.
- [`src/compiler/lexer.js`](src/compiler/lexer.js) — Plang tokenizer.
- [`src/compiler/parser.js`](src/compiler/parser.js) — Recursive-descent multi-stratum AST parser (`program`, `const`, `bundle`, `fn`, `organ_call`, `mem[...]`, ternary).
- [`src/compiler/codegen.js`](src/compiler/codegen.js) — Lexical block register allocator, direct-to-ABI call emitter, immediate/memory folder, conditional branch lowerer.
- [`src/compiler/compile.js`](src/compiler/compile.js) — End-to-end `.plang` → `.hbin` compilation pipeline.

### 2.3 Virtual Machines (`src/vm/`)
- [`src/vm/pvm32.js`](src/vm/pvm32.js) — `PVM-32` 32-bit register VM, 4,096-word sandboxed RAM, 160×120 RGBA framebuffer with phosphor glow, 4-voice synth register bank, hot-swappable Anastomosis Dispatch Table (ADT).
- [`src/vm/linear-twin.js`](src/vm/linear-twin.js) — Monolithic `LINBIN01` ELF-style control binary for side-by-side falsification experiments.

### 2.4 Interactive Surgical Vivisection Studio & CLI (`src/web/`, `bin/`, `server.mjs`)
- [`server.mjs`](server.mjs) — Zero-dependency local HTTP server (`http://127.0.0.1:4174`).
- [`bin/planaria.mjs`](bin/planaria.mjs) — Standalone CLI (`compile`, `inspect`, `run`, `bisect`, `heal`, `damage`, `xenograft`, `disasm`).
- [`src/web/index.html`](src/web/index.html) & [`src/web/styles.css`](src/web/styles.css) — Cyber-biological Surgical Vivisection Studio interface.
- [`src/web/app.js`](src/web/app.js) — Live 60 FPS dual-VM operating theater, surgical dock, Mitosis split-screen, Chimera splicer, live in-browser Plang compiler.
- [`src/web/visuals.js`](src/web/visuals.js) — 192-cell tissue surgery canvas, live Organ Vascular Anastomosis graph, empirical survival curve renderer.
- [`src/web/audio-worklet.js`](src/web/audio-worklet.js) & [`src/web/audio.js`](src/web/audio.js) — Lock-free 48 kHz 4-voice WebAudio synthesizer.

---

## 3. Compiled Living Programs & Reproducible Artifacts

| Source (`programs/`) | Compiled Binary (`artifacts/`) | Description |
|---|---|---|
| [`programs/aegis_drift.plang`](programs/aegis_drift.plang) | [`artifacts/aegis_drift.hbin`](artifacts/aegis_drift.hbin) | Playable 60 FPS vector starfighter survival arcade (958 insns, 96 KiB) |
| [`programs/synth_reactor.plang`](programs/synth_reactor.plang) | [`artifacts/synth_reactor.hbin`](artifacts/synth_reactor.hbin) | 4-voice Lydian FM/subtractive synth & Lissajous plasma reactor (621 insns, 96 KiB) |
| [`programs/cipher_vault.plang`](programs/cipher_vault.plang) | [`artifacts/cipher_vault.hbin`](artifacts/cipher_vault.hbin) | 12-lane ARX stream-cipher & cryptographic avalanche matrix (526 insns, 96 KiB) |
| — | [`artifacts/manifest.json`](artifacts/manifest.json) | Deterministic artifact catalog, Lineage Roots & SHA-256 digests |

---

## 4. Formal Proofs, Verification Suites & Experimental Data

| Path | Description |
|---|---|
| [`lean/PlanariaProofs.lean`](lean/PlanariaProofs.lean) | Master Lean 4 (`v4.35.0`) `#print axioms` audit entrypoint |
| [`lean/PlanariaProofs/GF256.lean`](lean/PlanariaProofs/GF256.lean) | Theorem I: Exhaustive $\text{GF}(2^8)$ inverses & universal zero-axiom Cauchy 2×2 nonsingularity |
| [`lean/PlanariaProofs/MitosisBounds.lean`](lean/PlanariaProofs/MitosisBounds.lean) | Theorem II: Tight Mitosis iff bounds, unaligned cuts, 7-bundle safety & trisection synergy |
| [`lean/PlanariaProofs/StratumAnastomosis.lean`](lean/PlanariaProofs/StratumAnastomosis.lean) | Theorem III: Zero-crash anastomosis safety, monotonicity, synergy & zero-cliff separation |
| [`lean/PlanariaProofs/ByzantineImmune.lean`](lean/PlanariaProofs/ByzantineImmune.lean) | Theorem IV: `RS(254,238)` $t=8$ radius, 16B burst recovery, Merkle zero-contamination |
| [`lean/PlanariaProofs/XenograftABI.lean`](lean/PlanariaProofs/XenograftABI.lean) | Theorem V: `PVM-32` RAM bounds, bounded termination, sovereignty & Xenograft ABI safety |
| [`test/verify.mjs`](test/verify.mjs) | 12-suite executable verification & Popperian falsification harness |
| [`scripts/build-artifacts.mjs`](scripts/build-artifacts.mjs) | Deterministic `.plang` → `.hbin` build script |
| [`scripts/benchmark.mjs`](scripts/benchmark.mjs) | Monte Carlo survival curve, radiation sweep, Byzantine audit & Ed25519 attestation runner |
| [`results/benchmarks.json`](results/benchmarks.json) | Complete reproducible empirical benchmark tables |
| [`results/attestation.json`](results/attestation.json) | SHA-256 + Ed25519 cryptographically signed repository attestation |
| [`results/lean4-audit.txt`](results/lean4-audit.txt) | Verbatim Lean 4 `lake build` & `#print axioms` verification log |

---

## 5. GitHub Governance & CI (`.github/`)

- [`.github/workflows/ci.yml`](.github/workflows/ci.yml) — Automated Node build/test/CLI/benchmark + Lean 4 zero-`sorryAx` CI pipeline
- [`.github/ISSUE_TEMPLATE/falsification.yml`](.github/ISSUE_TEMPLATE/falsification.yml) — Falsification, counterexample & security audit template
- [`.github/ISSUE_TEMPLATE/bug.yml`](.github/ISSUE_TEMPLATE/bug.yml) · [`.github/ISSUE_TEMPLATE/feature.yml`](.github/ISSUE_TEMPLATE/feature.yml) · [`.github/ISSUE_TEMPLATE/config.yml`](.github/ISSUE_TEMPLATE/config.yml)
- [`.github/SECURITY.md`](.github/SECURITY.md) · [`.github/CONTRIBUTING.md`](.github/CONTRIBUTING.md) · [`.github/CODE_OF_CONDUCT.md`](.github/CODE_OF_CONDUCT.md)
