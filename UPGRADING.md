# UPGRADING.md — Version Migration & Breaking-Change Guide

PLANARIA follows Semantic Versioning (`MAJOR.MINOR.PATCH`). The binary `.hbin` wire format (`PLN\xB7` v1, 192 × 512 B cells) has remained wire-compatible across `v1.0.0` through `v2.3.0`.

## Upgrading from `v2.2.0` to `v2.3.0`

### Breaking / Behavioral Changes (Security & Correctness Tightening)
1. **CLI `inspect` / `run` / `heal` Unpinned Xenografting:**
   `bin/planaria.mjs` now requires explicit `--allow-unpinned-xenograft` when combining `--xenograft` without `--pin-root`. Previously, unpinned `--xenograft` implicitly allowed donor selection without pinning the host lineage.
2. **CLI `run` Exit Code on VM Traps:**
   `planaria run` now exits with status code `3` if the organism triggers one or more PVM-32 runtime traps (`vm.traps > 0`), making script automation fail-closed.
3. **Plang Compiler Strictness (`src/compiler/`):**
   - Duplicate `const` declarations now throw a `SyntaxError`.
   - Negated decimal literals exceeding signed 32-bit range (e.g., `-4294967295`) now throw a `SyntaxError` instead of silently wrapping to `+1` (unsigned 32-bit constants like `2654435761` remain valid).
   - Deeply right-nested runtime expressions that exhaust scratch registers `r12..r17` now throw a diagnostic error instead of clobbering local register `r18`.
   - Empty `return;` statements now deterministically return `0` in `r1`.
4. **Lean 4 Formal Proofs (`lean/`):**
   - All Lean files now use Lean 4.35.0's `module` system (`public import`, `@[expose] public def`, `public theorem`).
   - `Planaria.Anastomosis.viabilityLevel` was updated to match `src/core/hbin.js` Step 4 bit-for-bit (S2/S3 no longer falsely require `b2 >= 4`; S1 accepts `b3 >= 8`).
   - `Planaria.Byzantine.unpinned_quorum_honest_majority` now quantifies over the executable `electUnpinnedQuorum` function rather than raw arithmetic inequalities.
5. **Web Studio Asset Paths:**
   `src/web/index.html` and `src/web/app.js` now resolve relative URLs (`./src/web/...` and `import.meta.url`) so the Studio works identically on `http://127.0.0.1:4174/` and GitHub Pages subpaths (`/planaria/`).

### Non-Breaking Additions
- `GET /healthz` JSON health endpoint on `server.mjs`.
- Equal-storage flat `RS(192,48)` baseline + Wilson 95% CIs + exact McNemar + Holm–Bonferroni stats in `results/benchmarks.json` (`PLANARIA-BENCHMARKS-1.2`).
- Standalone `lean/Challenge.lean`, `lean/Solution.lean`, `lean/comparator.json`, and `formalization.yaml`.

## Deprecation Policy
Deprecated CLI flags or JS API options are documented here and kept functional with a stderr notice for at least one minor release before removal.
