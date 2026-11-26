# THIRD_PARTY_NOTICES.md — Third-Party Software & Standards Attribution

**PLANARIA v2.3.0** ships with **zero third-party runtime npm dependencies** (`package.json` contains no `dependencies` or `devDependencies`!) and **zero Lean Mathlib dependencies** (`lean/lakefile.toml` depends exclusively on Lean 4.35.0 core `Init`).

All cryptographic, coding-theoretic, compiler, VM, quantum simulation, 3D WebGL2, and AudioWorklet components in `src/` are original implementations. The external toolchains and open standards used during development, verification, and typesetting are acknowledged below:

| Tool / Standard | License | Role in PLANARIA | Source |
| :--- | :--- | :--- | :--- |
| **Node.js** (`>= 20`) | MIT | JavaScript runtime & built-in `node:*` standard library for CLI, server, tests, and benchmarks | https://nodejs.org |
| **Lean 4 (`v4.35.0`)** (`lean`, `lake`, `leanchecker`, `leanchecker-paranoid`, `leanexport`) | Apache-2.0 | Formal proof assistant & reference typechecker | https://github.com/leanprover/lean4 |
| **lean4lean** (bundled in Lean 4.35.0 toolchain) | Apache-2.0 | Independent Lean-in-Lean kernel verifier | https://github.com/digama0/lean4lean |
| **nanoda_bin** (bundled in Lean 4.35.0 toolchain) | MIT / Apache-2.0 | Independent Rust Lean 4 kernel verifier | https://github.com/ammkrn/nanoda_lib |
| **con-leche / con-ron** (bundled in Lean 4.35.0 toolchain) | Apache-2.0 | Formally verified graded external Lean 4 kernels | Lean 4.35.0 distribution |
| **Tectonic** | MIT | Reproducible XeTeX/LaTeX typesetting engine for `paper/main.tex` | https://tectonic-typesetting.github.io |
| **FIPS PUB 180-4 (SHA-256)** | Public Domain (NIST) | Hash specification implemented in `src/core/sha256.js` and differential-tested against Node OpenSSL | https://doi.org/10.6028/NIST.FIPS.180-4 |
| **Build Standard for LLMs v1.2.0** | CC BY 4.0 | Repository audit framework (`docs/build-standard.md`, `scripts/audit-repo.sh`, `scripts/Audit-Repo.ps1`, `scripts/audit-checks.tsv`) | Author: Alex Donahue (`0thernes`) |

See [LICENSE](LICENSE), [LEGAL.md](LEGAL.md), and [NOTICE](NOTICE) for PLANARIA's own license and copyright terms.
