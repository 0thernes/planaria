# SUPPORT.md — Getting Help & Reporting Findings

## Where to Go

- **Usage questions, architecture questions, or replication reports:** Open a GitHub Issue using the **Question / Discussion** form at [github.com/0thernes/planaria/issues](https://github.com/0thernes/planaria/issues).
- **Bugs, test failures, proof discrepancies, or documentation errors:** Open a GitHub Issue using the **Bug Report** form and include your OS, `node --version`, exact command run, and terminal output.
- **Security vulnerabilities:** Please follow [SECURITY.md](SECURITY.md) rather than posting public exploit details in an issue.
- **Direct author contact:** Alexander Stephen Donahue — `0_0@0thernes.art` (ORCID [`0009-0006-8168-9648`](https://orcid.org/0009-0006-8168-9648)).

## Before Opening an Issue

1. Check [docs/faq.md](docs/faq.md) and [LIMITATIONS.md](LIMITATIONS.md).
2. Confirm you are running **Node.js >= 20.0.0** (and Lean `v4.35.0` if verifying `lean/`).
3. Run `npm run build && npm test` to verify your local checkout matches expected baseline behavior.

## Maintenance Expectations

PLANARIA is maintained by a single independent researcher on a best-effort basis (`Status: active`). Issues carrying reproducible test cases or Lean counterexamples are prioritized first.
