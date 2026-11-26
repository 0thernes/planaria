# UPGRADING.md — Version Migration & Breaking-Change Guide

PLANARIA follows Semantic Versioning (`MAJOR.MINOR.PATCH`). The binary `.hbin` wire format (`PLN\xB7` v1, 192 × 512 B cells) has remained wire-compatible across `v1.0.0` through `v2.4.0`.

## Upgrading from `v2.3.0` to `v2.4.0`

### Breaking / Behavioral Tightening (Security, Fidelity & Determinism)
1. **Plang Unsigned Decimal Literals (`src/compiler/parser.js`):**
   Decimal integer literals exceeding signed 32-bit `2147483647` (such as `2654435761`) now throw a `SyntaxError` unless written explicitly in hexadecimal (`0x9e3779b1`) or negated within signed int32 bounds (`-2147483648`). Built-in constant shadowing (`const KERNEL = ...`) and compile-time `organ_call(KERNEL/GENOME, ...)` are also rejected at compile time.
2. **Unpinned Quorum Strictness (`src/core/hbin.js`):**
   Single-cell unpinned streams (`bestUnique < 2`) now unconditionally fail closed (`primaryRootHex === null`, `stats.quorumAmbiguous === true`), matching Lean 4 `electUnpinnedQuorum` bit-for-bit.
3. **Empty-Bundle Viability & Xenograft ABI Fidelity (`src/core/hbin.js`, `src/vm/linear-twin.js`):**
   Executable bundles `B0..B5` now require `origLen >= 4 && origLen % 4 === 0` (`origLen > 0` for `B6`), preventing empty optional bundles from inflating `maxViableStratum` or blocking future xenografts. Surviving sub-threshold host cells preserve their header `abiSig` and enforce strict donor ABI equality.
4. **PVM-32 Proportional Blitter Fuel & Transactional Trap Rollback (`src/vm/pvm32.js`):**
   Heavy graphics syscalls (`GLOW`: 128, `CLEAR`: 64, `TRI`: 4, `LINE`: 2, filled `RECT`/`CIRCLE`: `ceil(pixels/256)`) now deduct proportional frame fuel, and trapping organs roll back partial RAM/voice mutations cleanly.
5. **Deterministic 3D Simulation & Full Inventory Rewind (`src/world/game3d.js`, `src/quantum/temporal.js`):**
   All unseeded `Math.random()` calls in `ChronoQuantumWorld` have been replaced with a snapshotted Mulberry32 PRNG; temporal rewind now restores `weapons`, `armors`, indices, `recentLoot`, `playerProfile`, and RNG state deterministically.
6. **Lean 4.35.0 Strictness (`lean/`):**
   `lean/lakefile.toml` now enables `autoImplicit = false` and `relaxedAutoImplicit = false`; `lean/VerifyAxioms.lean` adds line-1 `module`; `merkle_path_collision_free_binding`, `unpinned_quorum_honest_majority`, and `unpinned_quorum_tie_fail_closed` have strengthened universal signatures; `PlanariaProofs/AdversarialTests.lean` adds 8 formal refutations (total **85** audited theorems).

### Non-Breaking Additions
- Clean-room Python 3 cross-language differential oracle (`reference/planaria_oracle.py`).
- Deterministic 2,000-case adversarial fuzzer (`npm run fuzz`).
- Interactive Lean 4.35.0 Proof Blueprint (`blueprint/index.html`, served at `/blueprint/` and GitHub Pages `./blueprint/`).
- Live Crossref DOI + retraction verifier (`npm run check:citations -- --live`) and README verbatim axiom checker (`npm run check:axioms`).
- CLI flags `--allow-partial` (`heal`/`xenograft`) and `--include-sync` (`damage`), plus `16 MiB` bounded file reads and distinct-output guards.

## Upgrading from `v2.2.0` to `v2.3.0`

1. **CLI Unpinned Xenografting & Trap Exit Code:** Added `--allow-unpinned-xenograft` opt-in and exit code `3` on VM traps (`planaria run`).
2. **Compiler & Lean 4.35.0 Module System:** Enforced `Map`-based symbol tables, `rR > 17` spill check, `LI r1, 0` on empty `return;`, Lean 4.35.0 `module` syntax, bit-exact `viabilityLevel`, and relative subpath-safe Studio URLs.

## Deprecation Policy
Deprecated CLI flags or JS API options are documented here and kept functional with a stderr notice for at least one minor release before removal.
