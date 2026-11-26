# AGENTS.md

Canonical instructions for every coding agent working in `0thernes/planaria`.
`CLAUDE.md`, `GEMINI.md`, `.cursor/rules/build-standard.mdc`, and `llms.txt` point here. Edit this file, never the pointers.
Full standard: [docs/build-standard.md](docs/build-standard.md) (Build Standard for LLMs v1.2.0, 90 items).

## Project

- **Name:** PLANARIA (`v2.4.0`)
- **Purpose:** Progressive holographic executable architecture (`.hbin`), Plang compiler, PVM-32 vascular anastomosis VM, 4-qubit/temporal 3D WebGL2 Studio, clean-room Python 3 differential oracle, interactive Proof Blueprint, and 6-kernel pure Lean 4.35.0 formal verification suite.
- **Owner:** Alexander Stephen Donahue (`0thernes`, ORCID `0009-0006-8168-9648`, `0_0@0thernes.art`, Independent Researcher, Spokane, WA, USA — NOT an LLC).
- **Manifest:** [repo.yaml](repo.yaml) (schema: [repo-standard.schema.json](repo-standard.schema.json)) and [formalization.yaml](formalization.yaml).
- **Stack:** Zero-dependency ES2022 JavaScript (`Node.js >= 20`, WebGL2 GLSL 300 es, 48 kHz AudioWorklet), pure Python 3 stdlib differential oracle, pure Lean 4.35.0 (`module` system, `autoImplicit = false`, zero Mathlib), AMS-LaTeX (`tectonic`).
- **Layout:**
  - `src/core/` — GF(2^8), interleaved RS(254,238), Cauchy MDS, FIPS 180-4 SHA-256, Depth-8 Merkle, `.hbin` codec, torture suite
  - `src/compiler/` — Plang ISA, lexer, recursive-descent parser, register-windowed codegen, compiler entrypoint
  - `src/vm/` — PVM-32 sandboxed VM (`& 0xFFF` RAM, bounded budgets + proportional blitter fuel, transactional trap rollback, 6-organ anastomosis) & LINBIN01 linear control twin
  - `src/quantum/` — 4-qubit complex statevector (`qengine.js`: Horodecki CHSH, Mermin GHZ, WKB, Heisenberg, Zeno) & `TemporalEngine` (`temporal.js`: O(1) 360-frame RingBuffer)
  - `src/world/` — Deterministic 6.42T combinatorial generator (`generator.js`) & seeded Mulberry32 3D simulation (`game3d.js`)
  - `src/web/` — WebGL2 3D renderer, 2D visualizers, 48 kHz AudioWorklet synth, Studio UI (`index.html`, `app.js`, `styles.css`)
  - `programs/` — 4 living `.plang` species (`quantum_chronicle`, `aegis_drift`, `synth_reactor`, `cipher_vault`)
  - `artifacts/` — Deterministic compiled 98,304 B `.hbin` binaries + `manifest.json`
  - `reference/` — Clean-room Python 3 cross-language differential oracle (`planaria_oracle.py`)
  - `lean/` — 7 pure Lean 4.35.0 `module` proof files (`autoImplicit = false`, incl. `AdversarialTests.lean`) + `Spec.lean`, `PlanariaProofs.lean`, `VerifyAxioms.lean`, `Challenge.lean`, `Solution.lean`, `comparator.json` (**85 theorems**)
  - `blueprint/` — Interactive zero-CDN SVG Proof Blueprint (`index.html`, `blueprint.json`, `blueprint.css`, `blueprint.js`)
  - `test/` — 30-suite verification, property-based, metamorphic, AudioWorklet DSP & regression harness (`verify.mjs`)
  - `examples/` — 3 runnable zero-dependency scripts (`01-mitosis`, `02-byzantine`, `03-xenograft`)
  - `scripts/` — Build, statistical benchmark, 12-mutant tester, 2,000-case fuzzer, Blueprint builder/checker, README axiom verifier, linter (with cross-doc theorem checker), Crossref citation verifier, Pages builder, manifest generator, repo audit
  - `paper/` & `dist/` — AMS-LaTeX white paper (`main.tex`), Markdown edition, frozen PDF & arXiv tarball
  - `docs/` — Architecture, ADRs, benchmarks, configuration, operations, threat model, preregistration, Mega-Atlas cross-check, literature search log, submission readiness dossier, FAQ, glossary, run log, 10-pass red-team review
- **Status:** active

## Commands

Every command works from a clean clone (see `justfile` and `scripts/dev.sh`):

- `just setup` — verify Node.js >=20 and compile artifacts (zero npm runtime deps)
- `just build` — deterministically compile all 4 `.plang` species to `artifacts/*.hbin`
- `just test` — run all 30 verification, property-based, DSP, regression, and example suites (`npm test`)
- `just mutate` — run 12 surgical mutants (`scripts/mutation-test.mjs`; target 12/12 killed)
- `just fuzz` — run 2,000 deterministic adversarial fuzz cases (`scripts/fuzz.mjs`)
- `just oracle` — run clean-room Python 3 cross-language differential oracle (`reference/planaria_oracle.py`)
- `just blueprint` — rebuild & verify interactive Lean 4.35.0 Proof Blueprint (`blueprint/`)
- `just axioms` — verify verbatim README axiom parity & strict `{propext, Classical.choice, Quot.sound}` allowlist
- `just lint` — report-only syntax, security-sink, Lean-header, cross-doc theorem, placeholder, entity, and citation checks
- `just bench` — run 4-architecture Monte Carlo + Wilson 95% CI + McNemar + Holm–Bonferroni benchmarks (`npm run benchmark`)
- `just lean` — build Lean 4.35.0 proofs (`autoImplicit = false`) and run multi-kernel verification (`leanchecker`, `leanchecker-paranoid`, `nanoda_bin`, `con-leche`, `con-ron`, `lake check --paranoid`, `lake comparator --paranoid`)
- `just paper` — compile `paper/main.tex` via Tectonic into `dist/Donahue_2026_planaria.pdf`
- `just reproduce` — clean end-to-end build -> test -> mutate -> fuzz -> oracle -> Lean -> axioms -> blueprint -> lint -> bench -> manifest
- `just audit` — score this repo against Build Standard v1.2.0 (`scripts/audit-repo.sh` / `Audit-Repo.ps1`)
- `just deploy` / `just rollback` — build static GitHub Pages bundle (`_site/`) / revert latest Pages release commit
- `just release X.Y.Z` — bump version manifests, commit to `main`, create plain tag `vX.Y.Z`, push

## Hard rules

- **R1.** Nothing may gate, block, or slow a commit or push. No branch protection, no required status checks, no commit/tag signing, no git hooks, no blocking lint/SAST/SBOM gates (report-only only).
- **R2.** Commit and push straight to `main`. No PRs, no feature branches. Fixes for red CI are follow-up commits to `main`.
- **R3.** CI is informational.
- **R4.** Banned: Dependabot, Renovate, PR templates, CodeRabbit, `.github/copilot-instructions.md`, `FUNDING.yml`.
- **R5.** One-person lean, not corporate.
- **R6.** Never fabricate any claim, number, badge, DOI, screenshot, or test result. Unverified means labeled unverified.
- **R7.** Classify every finding as exactly one of the 10 classes: `bug`, `error`, `issue`, `problem`, `concern`, `dilemma`, `conflict`, `gap`, `hole`, `blindspot`.
- **R8.** Precedence: owner's explicit instruction > hard rules > Build Standard items > ecosystem conventions.

## Known traps

- **PowerShell bracketed paths:** The canonical workspace path contains `[Vibe Coded (AI)]`; always pass `-LiteralPath` to PowerShell file cmdlets.
- **CRLF vs LF in `results/lean4-audit.txt`:** Always write `results/lean4-audit.txt` with pure Unix LF (`\n`) so SHA-256 digests match Linux CI.
- **No fabricated LLC entity:** Author affiliation is `Independent Researcher (0thernes project), Spokane, WA, USA` — never claim an unformed LLC corporate entity.
- **AEGIS_DRIFT S1_CORE_LOGIC budget:** Bundle 1 (`S1_CORE_LOGIC`) has a hard 1,328-byte limit (332 PVM-32 instructions). Always verify `npm run build` after any `codegen.js` change.
- **Lean 4.35.0 `module` + `autoImplicit = false`:** EVERY `.lean` file (including `VerifyAxioms.lean`) must start with `module` on line 1; keep spec defs `@[expose] public`, bind all variables explicitly, and keep `Challenge` out of `defaultTargets` so `lake check --paranoid` sees zero `sorryAx`.
- **GitHub Pages subpaths:** Never use root-anchored `/src/...` or `/programs/...` paths in `src/web/` or `blueprint/`; always resolve relative paths (`./src/web/...`, `./blueprint/`, `new URL('../../...', import.meta.url)`).
