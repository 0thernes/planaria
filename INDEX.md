# PLANARIA — Master Index & Complete Table of Contents (`v2.4.0`)

Cross-referenced directory of every manuscript, governance document, academic dossier, source module, compiled `.hbin` organism, clean-room Python 3 oracle, interactive Proof Blueprint, 6-kernel Lean 4.35.0 proof module, verification suite, example, and empirical benchmark artifact in **PLANARIA v2.4.0**.

---

## 1. Research Manuscripts, Academic Dossiers & Build Standard Governance

| File | Role | Key Contents |
|---|---|---|
| [`README.md`](README.md) | Flagship Overview | 5-second verbatim `#print axioms` audit (`85/85`), interactive Blueprint link, 5 phenomena, quickstart, CLI & runnable examples, 4-architecture statistical benchmarks |
| [`SUMMARY.md`](SUMMARY.md) | Executive Summary Paper | Standalone technical overview, equal-storage comparison table & honest `0/1,900` Mega-Atlas verdict |
| [`paper/main.tex`](paper/main.tex) | AMS-LaTeX Source Manuscript | Standalone Tectonic LaTeX source with native TikZ/PGFPlots vector figures, `C01`–`C10` Claims Ledger, Fidelity Table & 22 Crossref-verified references |
| [`dist/Donahue_2026_planaria.pdf`](dist/Donahue_2026_planaria.pdf) | Frozen Release PDF | Compiled publication-grade white paper PDF (`v2.4.0`) archived in `0thernes-research-archive` |
| [`dist/arxiv_submission.tar.gz`](dist/arxiv_submission.tar.gz) | Standalone LaTeX Bundle | Verified self-contained compilation bundle (`main.tex`) |
| [`paper/WHITE_PAPER.md`](paper/WHITE_PAPER.md) | Markdown White Paper | Full 12-section research white paper |
| [`docs/MASTER_REPORT.md`](docs/MASTER_REPORT.md) | Comprehensive Master Report | Byte-level engineering audit, compiler/VM deep dive, failure modes & operations manual |
| [`CLAIMS.md`](CLAIMS.md) & [`LIMITATIONS.md`](LIMITATIONS.md) | Epistemic Governance | Numbered falsifiable claims ledger (`C01`–`C10`), storage overhead ratios & real-vs-metaphor boundaries |
| [`docs/MEGA_ATLAS_CROSSCHECK.md`](docs/MEGA_ATLAS_CROSSCHECK.md) | Mega-Atlas Audit Dossier | Programmatic scan of all 1,900 Mega-Atlas open problems (`0 / 1,900` solved, top 19 nearest neighbors verbatim) |
| [`docs/LITERATURE_SEARCH.md`](docs/LITERATURE_SEARCH.md) | Prior-Art Search Log | Dated IEEE/ACM/arXiv/Crossref search log & prior-art differentiation matrix |
| [`docs/SUBMISSION_READINESS.md`](docs/SUBMISSION_READINESS.md) | Release Readiness Dossier | 43-item Playbook v1.3 scorecard, ACM/NeurIPS checklists, Export-Control self-screen & artifact datasheet |
| [`REPLICATION.md`](REPLICATION.md) & [`VERIFICATION.md`](VERIFICATION.md) | Reproducibility & Auth | Clean-clone reproduction playbook, replication log, SHA-256 & Ed25519 protocols |
| [`docs/index.md`](docs/index.md) | Engineering Docs Hub | `architecture.md`, `adr/0001..0004`, `configuration.md`, `operations.md`, `threat-model.md`, `benchmarks.md`, `preregistration.md`, `faq.md`, `glossary.md`, `run-log.md`, `build-standard.md` |
| [`docs/reviews/2026-11-25-10-pass-red-team-audit.md`](docs/reviews/2026-11-25-10-pass-red-team-audit.md) | Multi-Cycle Red-Team Audit | Complete 10-pass & 3-cycle audit across all 10 finding classes (242 cumulative findings resolved), Statement-Fidelity Audit Table & Aaronson checklist |
| [`repo.yaml`](repo.yaml) & [`formalization.yaml`](formalization.yaml) | Machine-Readable Manifests | Build Standard v1.2.0 manifest (`repo-standard.schema.json`) & Palomar 6-kernel formalization metadata |
| [`AGENTS.md`](AGENTS.md) & [`llms.txt`](llms.txt) | Agent Entry Points | Canonical instructions (`CLAUDE.md`, `GEMINI.md`, `.cursor/rules/build-standard.mdc`, `llms-full.txt`) |
| [`LICENSE`](LICENSE), [`LEGAL.md`](LEGAL.md), [`NOTICE`](NOTICE), [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) | Legal & Attribution | Cosmogonic Non-Commercial License (with Section 6 CC BY 4.0 carve-out), Export-Control self-screen, AI copyrightability disclosure |
| [`CITATION.cff`](CITATION.cff), [`.zenodo.json`](.zenodo.json), [`CHANGELOG.md`](CHANGELOG.md), [`VERSION`](VERSION) | Citation & Releases | Valid CFF v1.2.0 metadata, Zenodo metadata, full `v1.0.0` → `v2.4.0` changelog, single version source `2.4.0` |
| [`ROADMAP.md`](ROADMAP.md), [`SUPPORT.md`](SUPPORT.md), [`UPGRADING.md`](UPGRADING.md), [`ERRATA.md`](ERRATA.md), [`DEVIATIONS.md`](DEVIATIONS.md) | Lifecycle & Transparency | Milestone roadmap, support channels, upgrade guide, formal errata + withdrawal policy & Build Standard deviations |

---

## 2. Source Code, Oracle, Blueprint, Examples & Scripts (`src/`, `reference/`, `blueprint/`, `bin/`, `examples/`, `scripts/`, `test/`)

- **Core Coding, Crypto & `.hbin` (`src/core/`):** `gf256.js`, `rs.js`, `cauchy.js`, `sha256.js`, `hbin.js`, `torture.js`
- **`Plang` Compiler & VMs (`src/compiler/`, `src/vm/`):** `isa.js`, `lexer.js`, `parser.js`, `codegen.js`, `compile.js`, `pvm32.js`, `linear-twin.js`
- **Quantum, Temporal & 3D World (`src/quantum/`, `src/world/`):** `qengine.js`, `temporal.js`, `generator.js`, `game3d.js`
- **Studio UI, WebGL2 & 48 kHz Audio (`src/web/`, `server.mjs`, `bin/`):** `renderer3d.js`, `visuals.js`, `audio.js`, `audio-worklet.js`, `index.html`, `app.js`, `styles.css`, `server.mjs`, `bin/planaria.mjs`
- **Clean-Room Cross-Language Oracle (`reference/`):** `reference/planaria_oracle.py` (pure Python 3 stdlib: GF(2^8), RS(254,238), Cauchy, Merkle, 4 species / 768 cells + mitosis + 4Q CHSH/Mermin)
- **Interactive Lean 4.35.0 Proof Blueprint (`blueprint/`):** `blueprint/index.html`, `blueprint/blueprint.json`, `blueprint/blueprint.css`, `blueprint/blueprint.js`
- **Runnable Examples (`examples/`):** `01-mitosis-roundtrip.mjs`, `02-byzantine-quarantine.mjs`, `03-xenograft-chimera.mjs`
- **Testing & Tooling (`test/`, `scripts/`):** `test/verify.mjs` (30 suites), `scripts/mutation-test.mjs` (12 mutants), `scripts/fuzz.mjs` (2,000 cases), `scripts/benchmark.mjs` (`v1.2`), `scripts/build-artifacts.mjs`, `scripts/build-blueprint.mjs`, `scripts/check-blueprint.mjs`, `scripts/check-readme-axioms.mjs`, `scripts/build-pages.mjs`, `scripts/lint-check.mjs`, `scripts/check-citations.mjs`, `scripts/gen-manifest.mjs`, `scripts/build-llms-full.mjs`, `scripts/audit-repo.sh`, `scripts/Audit-Repo.ps1`, `scripts/dev.sh`

---

## 3. Compiled Living Programs & Formal Proofs (`programs/`, `artifacts/`, `lean/`, `results/`)

- **4 Living Species:** `quantum_chronicle` (`426` insns), `aegis_drift` (`1,000` insns), `synth_reactor` (`645` insns), `cipher_vault` (`534` insns) + `artifacts/manifest.json`
- **Lean 4.35.0 Multi-Kernel Suite (`lean/`):** `Challenge.lean`, `Solution.lean`, `PlanariaProofs.lean`, `VerifyAxioms.lean`, `comparator.json`, `lakefile.toml` (`autoImplicit = false`), `lean-toolchain`, and `PlanariaProofs/{Spec,GF256,MitosisBounds,StratumAnastomosis,ByzantineImmune,XenograftABI,QuantumTemporal,AdversarialTests}.lean` (**85 audited theorems**)
- **Empirical & Cryptographic Evidence:** `results/benchmarks.json`, `results/bench-history.csv`, `results/citation-audit.json`, `results/attestation.json` (71 files), `results/lean4-audit.txt` (85 theorems), `results/lean4-multi-kernel.txt` (6 kernels), `MANIFEST.sha256`, `data/MANIFEST.sha256`

---

## 4. GitHub Workflows & Governance (`.github/`)

- `.github/workflows/ci.yml` — Cross-platform Node + Python oracle matrix (`ubuntu`/`macos`/`windows`), 2,000-case fuzzer, README axiom & Blueprint checks, Ubuntu `bubblewrap` 6-kernel Lean 4.35.0 + Palomar comparator + live negative tampering test, Tectonic PDF + standalone arXiv build, `SHA256SUMS` + SLSA provenance, report-only `audit-repo.sh`, `gitleaks` & `osv-scanner`
- `.github/workflows/release.yml` — Tag-triggered GitHub Release with `check:citations`, `SHA256SUMS` & SLSA provenance (including `lean4-audit.txt` & `lean4-multi-kernel.txt`)
- `.github/workflows/pages.yml` — Subpath-safe static Studio + `/blueprint/` deployment to GitHub Pages
- `.github/labels.tsv` (18 labels incl. all 10 finding classes), `.github/ISSUE_TEMPLATE/{bug,feature,falsification,question,config}.yml`, `.github/{SECURITY,CONTRIBUTING,CODE_OF_CONDUCT}.md`
