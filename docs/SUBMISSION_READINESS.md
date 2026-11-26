# Submission Readiness Dossier, Playbook v1.3 Scorecard & Artifact Datasheet (`PLANARIA v2.4.0`)

- **Date:** 2026-11-25
- **Author:** Alexander Stephen Donahue (Independent Researcher, 0thernes project, ORCID `0009-0006-8168-9648`)
- **Target Standards:** Build Standard for LLMs `v1.2.0` (90 items) + Defensible Independent AI Research Playbook `v1.3` (43 Gold Standard Release Checklist items) + NeurIPS / ACM Artifact Evaluation Badging criteria.

---

## 1. Playbook v1.3 Gold Standard Release Checklist (43 Items — Honest Scorecard)

| # | Playbook v1.3 Item | Status | Evidence / Honest Scope Note |
|---|---|---|---|
| 1 | Real independent-researcher identity & ORCID | **DONE** | Alexander Stephen Donahue, ORCID `0009-0006-8168-9648`, zero unformed LLC claims. |
| 2 | Explicit scope & non-claims (`0/1,900` Mega-Atlas) | **DONE** | `LIMITATIONS.md`, `docs/MEGA_ATLAS_CROSSCHECK.md`, `CLAIMS.md`, `paper/main.tex`. |
| 3 | Pinned Lean 4 toolchain (`lean/lean-toolchain`) | **DONE** | `leanprover/lean4:v4.35.0`, zero Mathlib, reproducible `lake-manifest.json`. |
| 4 | Line-1 `module` header on EVERY `.lean` file | **DONE** | All 12 `.lean` files (incl. `VerifyAxioms.lean`), enforced by `scripts/lint-check.mjs`. |
| 5 | `autoImplicit = false` & `relaxedAutoImplicit = false` | **DONE** | Enabled globally in `lean/lakefile.toml`; 0 warnings/errors across all 85 theorems. |
| 6 | Zero `sorry` / `admit` / `native_decide` / custom axioms in proofs | **DONE** | Enforced by Lean kernel, `scripts/lint-check.mjs`, `scripts/check-readme-axioms.mjs`, and CI. |
| 7 | Isolated `Challenge.lean` / `Solution.lean` / `comparator.json` | **DONE** | `Challenge.lean` imports ONLY zero-proof `PlanariaProofs.Spec`. |
| 8 | Non-vacuity witnesses for major quantified theorems | **DONE** | 10 explicit machine-checked witnesses across all modules (`GF256`, `Mitosis`, `Anastomosis`, `Byzantine`, `Xenograft`, `QuantumTemporal`). |
| 9 | Verbatim `#print axioms` audit strictly in `{propext, Classical.choice, Quot.sound}` | **DONE** | `results/lean4-audit.txt` (85/85 lines, 15 zero-axiom pure proofs), checked by `npm run check:axioms`. |
| 10 | Multi-kernel verification (`lean4`, `leanchecker-paranoid`, `lean4lean`, `nanoda`, `con-leche`, `con-ron`) | **DONE** | Automated on `ubuntu-latest` via `lake check --paranoid` & `lake comparator --paranoid`. |
| 11 | Interactive Proof Blueprint (`blueprint/index.html` + `blueprint.json`) | **DONE** | Zero-CDN interactive SVG DAG + table verified 1:1 via `npm run check:blueprint`, served at `/blueprint/` & Pages. |
| 12 | Adversarial false-variant tests + live CI negative comparator test | **DONE** | 8 formal refutations in `lean/PlanariaProofs/AdversarialTests.lean` + negative tamper-rejection step in `.github/workflows/ci.yml`. |
| 13 | README verbatim axiom parity enforcement | **DONE** | `scripts/check-readme-axioms.mjs` verifies README block + SHA-256 of `results/lean4-audit.txt`. |
| 14 | Statement-Fidelity Audit (Lean vs. JS runtime) | **DONE** | Full table in `docs/reviews/2026-11-25-10-pass-red-team-audit.md` + `LIMITATIONS.md`. |
| 15 | Dated Literature Search & Prior-Art Log | **DONE** | `docs/LITERATURE_SEARCH.md` (with live Crossref verification). |
| 16 | Live Crossref DOI resolution & retraction check (0 retractions) | **DONE** | `npm run check:citations -- --live` -> `results/citation-audit.json` (fixed `forney1965` DOI!). |
| 17 | Clean-room cross-language differential oracle | **DONE** | `reference/planaria_oracle.py` (Python 3 stdlib, 768 `.hbin` cells + mitosis + 4Q CHSH/Mermin). |
| 18 | Deterministic seeded adversarial fuzzer | **DONE** | `scripts/fuzz.mjs` (2,000 cases across `decodeHbin`, `Plang`, `RS`, `PVM32`). |
| 19 | Surgical mutation testing (100% kill rate) | **DONE** | `scripts/mutation-test.mjs` (**12/12 mutants KILLED = 100.0%**). |
| 20 | Property-based & metamorphic tests | **DONE** | Suites 25 & 27 in `test/verify.mjs` (30 suites total). |
| 21 | Pre-registered hypotheses & honest deviation log | **DONE** | `docs/preregistration.md` + `DEVIATIONS.md` (`DEV-05` honestly discloses exploratory v1.0–v2.2 history). |
| 22 | Equal-storage ablation control + Wilson 95% CIs + McNemar + Cohen's $h$ + Holm–Bonferroni | **DONE** | `scripts/benchmark.mjs` -> `results/benchmarks.json` (`PLANARIA-BENCHMARKS-1.2`). |
| 23 | Performance tracking history over releases | **DONE** | `results/bench-history.csv` + `docs/benchmarks.md`. |
| 24 | Bit-exact golden artifacts & SHA-256 manifests | **DONE** | `artifacts/manifest.json`, `MANIFEST.sha256`, `data/MANIFEST.sha256`. |
| 25 | Standalone compilable arXiv source tarball | **DONE** | `dist/arxiv_submission.tar.gz`, verified in isolated clean directory via Tectonic. |
| 26 | AMS-LaTeX PDF visual & typographic inspection (0 overfull `\hbox`) | **DONE** | `dist/Donahue_2026_planaria.pdf` inspected page-by-page. |
| 27 | 1:1 Claim-to-Evidence parity (`CLAIMS.md` ↔ `paper/main.tex` Table 1) | **DONE** | `C01`–`C10` aligned 1:1 with explicit falsification criteria. |
| 28 | Transparent AI-assistance & CRediT / COI disclosure | **DONE** | `paper/main.tex`, `LEGAL.md`, `README.md`, `docs/run-log.md`. |
| 29 | Export-Control & Dual-Use self-screen (15 CFR § 734.8) | **DONE** | `LEGAL.md` & Section 3 below. |
| 30 | License clarity & third-party carve-out (no false patent marking) | **DONE** | `LICENSE` (hedged patent notice + Section 6 CC BY 4.0 carve-out) & `THIRD_PARTY_NOTICES.md`. |
| 31 | Valid `CITATION.cff` & `.zenodo.json` (no invalid `NOASSERTION` enum) | **DONE** | `CITATION.cff` (license-url only), `.zenodo.json` (`v2.4.0`). |
| 32 | Cross-platform CI (`ubuntu`, `macos`, `windows`) + security scans | **DONE** | `.github/workflows/ci.yml` (`gitleaks`, `osv-scanner`, Python oracle, fuzzer, 6-kernel Lean, Tectonic). |
| 33 | SLSA Build Provenance + `SHA256SUMS` on GitHub Release | **DONE** | `.github/workflows/release.yml` (includes `lean4-audit.txt` & `lean4-multi-kernel.txt` as SLSA subjects). |
| 34 | Live interactive web demo + Blueprint on GitHub Pages | **DONE** | `.github/workflows/pages.yml` (`_site/` with `/` Studio + `/blueprint/`). |
| 35 | Accessibility (WCAG 2.2 AA) & CSP hardening | **DONE** | Meta CSP, skip-link, keyboard tissue/3D controls, `aria-valuetext`, `reduced-motion`, 7.7:1 contrast. |
| 36 | Multi-cycle red-team audit log | **DONE** | `docs/reviews/2026-11-25-10-pass-red-team-audit.md` + `docs/run-log.md`. |
| 37 | Published Errata & Withdrawal Policy | **DONE** | `ERRATA.md` (single `R7` class per row + 48-hour withdrawal/corrigendum commitment). |
| 38 | Clean-clone replication protocol | **DONE** | `REPLICATION.md` (`just reproduce` / `./scripts/dev.sh reproduce`). |
| 39 | Master archive registration (`0thernes-research-archive`) | **DONE** | `0TH-BUILD-002` pinned submodule + frozen PDF + SHA-256 verification. |
| 40 | Software Heritage archival snapshot | **PARTIAL** | `v2.1.0` archived (`swh:1:rev:f88e339ba86667df92c3e9f635da250410b9d0c8`); `v2.4.0` queued for Save Code Now after tag push (never fabricated!). |
| 41 | External third-party human replication | **PENDING** | Explicitly disclosed in `REPLICATION.md` as awaiting community submission. |
| 42 | Independent human peer review | **PENDING** | Explicitly disclosed in `LEGAL.md`, `paper/main.tex`, and `README.md` as an unrefereed technical preprint. |
| 43 | External archive deposition (arXiv / Zenodo / OSF / Palomar) | **READY** | Self-contained `dist/arxiv_submission.tar.gz`, `.zenodo.json`, `formalization.yaml` prepared; requires human owner account click/endorsement (never forged). |

---

## 2. ACM Artifact Badging & NeurIPS Reproducibility Checklist

- **ACM Artifacts Available:** All code, 4 compiled `.hbin` binaries, 85 Lean proofs, Python oracle, Blueprint, benchmarks, and LaTeX sources are archived publicly in Git + GitHub Releases (`SHA256SUMS` + SLSA provenance).
- **ACM Artifacts Functional & Reusable:** Zero external npm/pip/Mathlib dependencies; one-command `just reproduce` or `npm run verify:all`; deterministic outputs verified across Linux, macOS, and Windows CI.
- **ACM Results Reproduced:** Automated clean-clone CI reproduces all 30 test suites, 12/12 mutants, 2,000 fuzz cases, 768 Python-oracle cells, 85 6-kernel Lean theorems, and Tectonic PDF build on every push.
- **NeurIPS Checklist Highlights:** Explicit statistical uncertainty (Wilson 95% CIs, exact paired McNemar, Cohen's $h$, Holm–Bonferroni across all 25 thresholds), single-machine compute specs recorded in `results/benchmarks.json`, full limitations & real-vs-metaphor boundaries in `LIMITATIONS.md`, zero personal/human-subjects data (`personal_data: false`), zero trained ML models (`ml: false`).

---

## 3. Datasheet for `artifacts/` & `results/benchmarks.json`

- **Composition:** 4 compiled deterministic `98,304 B` `.hbin` organisms (`quantum_chronicle`, `aegis_drift`, `synth_reactor`, `cipher_vault`), `artifacts/manifest.json`, `results/benchmarks.json` (`PLANARIA-BENCHMARKS-1.2`, 1,000 paired multi-architecture Monte Carlo trials = 4,000 outcomes, 12 burst levels, 5 Byzantine levels, 6 mitosis offsets, 5 xenograft pairs), `results/lean4-audit.txt`, `results/lean4-multi-kernel.txt`, `results/citation-audit.json`, `results/bench-history.csv`, and `results/attestation.json`.
- **Collection & Generation:** 100% synthetic, deterministic, seeded locally (`scripts/build-artifacts.mjs`, `scripts/benchmark.mjs`, `lean/VerifyAxioms.lean`). Zero personally identifiable information, zero scraped web datasets, zero copyrighted third-party corpora.
- **Integrity & Maintenance:** Verified via `data/MANIFEST.sha256`, `MANIFEST.sha256`, Suite 24, `reference/planaria_oracle.py`, and GitHub Release `SHA256SUMS`. Maintained by Alexander Stephen Donahue (`0_0@0thernes.art`).

---

## 4. Recommended Human-Owner External Submission Order

1. **Software Heritage Save Code Now:** Submit `https://github.com/0thernes/planaria` right after `v2.4.0` tag push and record the resulting `swh:1:rev:...` SWHID in `README.md` and `0thernes-research-archive`.
2. **Zenodo GitHub Release Deposit:** Mint a versioned DOI for `v2.4.0` using `.zenodo.json` (remembering Zenodo's transparent AI-assistance disclosure policy — already satisfied in `.zenodo.json` `notes`).
3. **OSF / Preprint Registration:** Archive `docs/preregistration.md`, `dist/Donahue_2026_planaria.pdf`, and `formalization.yaml`.
4. **arXiv (`cs.OS` / `cs.CR` / `cs.LO`):** Upload `dist/arxiv_submission.tar.gz` once endorsement is obtained (respecting arXiv's authorship and AI-disclosure attestation).
5. **Palomar Formalization Index:** Submit `formalization.yaml` + `lean/Challenge.lean` + `lean/Solution.lean` + `lean/comparator.json` (all 12 `.lean` files have `module` on line 1, `autoImplicit = false`, and pass 6-kernel `lake comparator --paranoid`).
