# PLANARIA Documentation Index (`v2.3.0`)

Welcome to the documentation for **PLANARIA** — a progressive holographic executable architecture (`.hbin`), Plang compiler, `PVM-32` vascular anastomosis virtual machine, 4-qubit temporal-quantum 3D WebGL2 Studio, and 6-kernel pure Lean 4.35.0 formal verification suite.

## Core Architecture & Engineering

- [Architecture Overview](architecture.md) — 5-layer stack, `.hbin` cellular layout, Cauchy MDS stratification, `PVM-32` ISA & vascular anastomosis, 4-qubit/temporal engine, WebGL2 & AudioWorklet pipeline
- [Architecture Decision Records (ADRs)](adr/README.md) — Key irreversible design decisions and trade-offs (`ADR-0001` through `ADR-0004`)
- [Configuration Reference](configuration.md) — Environment variables, CLI flags, compiler budgets, server flags, and Studio query/control options
- [Operations, Health, Backups & Offsite Mirror](operations.md) — Running the hardened HTTP Studio server, `/healthz` observability, GitHub Pages deployment/rollback, and offsite `git bundle` + Software Heritage archiving
- [Threat Model (STRIDE)](threat-model.md) — Cryptographic boundaries, Merkle quarantine, Sybil/eclipse limits, `PVM-32` sandboxing, DoS budgets, and HTTP traversal/XSS defenses

## Scientific Verification, Benchmarks & Governance

- [Claims Ledger](../CLAIMS.md) — Numbered formal, empirical, and architectural claims with falsification conditions
- [Limitations & Real-vs-Metaphor Boundaries](../LIMITATIONS.md) — Explicit epistemic boundaries and honest `0 / 1,900` Mega-Atlas audit
- [Pre-Registration of Experimental Hypotheses](preregistration.md) — Formal hypotheses `H1`–`H4`, paired seed design, statistical tests, and refutation rules
- [Statistical Benchmarks & Performance Budgets](benchmarks.md) — 4-architecture Monte Carlo curves (including Equal-Storage `RS(192,48)`), Wilson 95% CIs, exact paired McNemar p-values, Cohen's $h$, Holm–Bonferroni $p_{\text{Holm}}$, and latency budgets
- [Replication Protocol](../REPLICATION.md) — Clean-clone reproduction guide and independent replication log
- [10-Pass Red-Team Audit & Mega-Atlas Report](reviews/2026-11-25-10-pass-red-team-audit.md) — Complete 3-cycle audit across all 10 finding classes, Aaronson checklist, Statement-Fidelity Audit Table, and 1,900-problem Mega-Atlas verification
- [Chronological Audit Run Log](run-log.md) — Session-by-session history of hardening passes and verifications
- [Master Technical Report](MASTER_REPORT.md) — Deep systems engineering synthesis
- [Build Standard for LLMs v1.2.0](build-standard.md) — Repository engineering standard audited by `scripts/audit-repo.sh` and `scripts/Audit-Repo.ps1`

## Reference

- [FAQ](faq.md) — Frequently asked technical, licensing, and scientific questions
- [Glossary](glossary.md) — Formal definitions of coding-theoretic, cryptographic, VM, quantum, and architectural terms
- [AMS-LaTeX White Paper](../paper/main.tex) | [Compiled PDF](../dist/Donahue_2026_planaria.pdf) | [Markdown Edition](../paper/WHITE_PAPER.md)
