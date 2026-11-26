# DEVIATIONS.md — Explicit Deviations from External Conventions

Per Hard Rule `R8` (*owner's explicit instruction > hard rules > standard items > ecosystem conventions*), the following deliberate deviations are recorded transparently:

1. **Non-Commercial Research & Play License (`LICENSE`):**
   Retains the owner's Turn-1 explicit *Cosmogonic License — Non-Commercial Research & Play* rather than an OSI-approved license (MIT/Apache-2.0). Trade-offs regarding JOSS and Mathlib eligibility are documented in [LIMITATIONS.md](LIMITATIONS.md) and [ADR-0004](docs/adr/0004-non-commercial-license-vs-osi-dilemma.md).
2. **Zero External Runtime Dependencies (`package-lock.json` with 0 packages):**
   PLANARIA intentionally installs zero third-party npm packages for security and longevity. `package-lock.json` is committed (`lockfileVersion: 3`, empty package tree) to satisfy Build Standard `B02` cleanly while preserving zero-dependency purity.
3. **Committed Deterministic Artifacts (`artifacts/*.hbin`, `dist/Donahue_2026_planaria.pdf`):**
   All 4 compiled `.hbin` binaries (98,304 B each, ~384 KiB total) and the frozen academic PDF (< 400 KiB) are tracked intentionally as versioned golden artifacts verified by Suite 24 and `MANIFEST.sha256` (all well under the 5 MiB `A24` hygiene limit).
4. **Windows Local Multi-Kernel Verification vs. Linux CI Sandbox (`bwrap`):**
   Lean 4.35.0's `lake check --paranoid` and `lake comparator --paranoid` require Linux `bubblewrap` (`bwrap`). On Windows development machines, `leanchecker`, `leanchecker-paranoid`, `nanoda_bin`, `con-leche --verified`, and `con-ron --verified` run directly against exported NDJSON; full 6-kernel sandboxed verification (`+ lean4lean` inside `bwrap`) executes automatically on `ubuntu-latest` in `.github/workflows/ci.yml`.
