# ADR-0004: Non-Commercial Cosmogonic License vs. OSI Open-Source Dilemma

- **Status:** Accepted (Owner Decision — Precedence Rule `R8`)
- **Date:** 2026-11-25
- **Finding Class:** `dilemma`

## Context

Several downstream academic and open-source ecosystems (JOSS, Mathlib upstreaming, OSI-certified package registries, and Zenodo open-source filters) require an OSI-approved license (such as MIT or Apache-2.0). However, the repository owner explicitly specified the **Cosmogonic License — Non-Commercial Research & Play** (matching the spirit of PolyForm Noncommercial 1.0.0) in the initial project directive to preserve commercial and patent rights while granting broad non-commercial research, study, reproduction, and modification rights.

## Decision

Retain the **Cosmogonic License — Non-Commercial Research & Play** in [`LICENSE`](../../LICENSE) (removing any unformed LLC wording and attributing copyright cleanly to Alexander Stephen Donahue / 0thernes), while transparently documenting the non-OSI trade-off in `LICENSE`, `LEGAL.md`, `LIMITATIONS.md`, `CITATION.cff` (`license: "NOASSERTION"`), and `.zenodo.json`.

## Consequences

- **Positive:** Honors the owner's explicit directive (`Build Standard Hard Rule R8`), allows unrestricted academic audit, replication, teaching, and non-commercial experimentation, and protects commercial rights cleanly.
- **Negative / Trade-off:** Ineligible for JOSS submission, Mathlib upstreaming, or OSI-only distributions without a future dual-license or relicensing decision by the owner.
