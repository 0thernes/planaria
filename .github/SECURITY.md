# Security Policy & Byzantine Threat Model

## Scope

**PLANARIA** is a progressive holographic binary research platform and interactive virtual machine studio. Its security model explicitly covers:

- **Cryptographic cellular authentication** via Depth-8 domain-separated SHA-256-128 Merkle trees (`src/core/sha256.js`, `src/core/hbin.js`);
- **Byzantine quarantine isolation** preventing forged RS-valid cells from poisoning outer GF($2^8$) Cauchy linear decoding;
- **`PVM-32` execution sandboxing** (4,096-word `& 0xFFF` masked linear RAM, bounded instruction fuel, non-xenograftable Kernel/Genome sovereignty, strict ABI signature verification, explicit `--allow-unpinned-xenograft` opt-in);
- **Local HTTP server containment** (`server.mjs`: TOCTOU-safe `openSync`/`fstatSync`, symlink-escape blocking, strict CSP, `X-Frame-Options: DENY`, `nosniff`, RFC 9110 URL normalization, static 404 bodies preventing reflected XSS).

See [docs/threat-model.md](../docs/threat-model.md) for the complete STRIDE analysis, trust boundaries, and Sybil/DoS threat bounds.

## Reporting Vulnerabilities or Cryptographic Bypasses

If you discover a Byzantine quarantine bypass, Merkle second-preimage/malleability flaw, `PVM-32` sandbox escape, or local HTTP server path traversal:

- Email **Alexander Stephen Donahue (0thernes)** directly at `0_0@0thernes.art` with `[SECURITY][PLANARIA]` in the subject (target acknowledgement within 72 hours), or
- For non-sensitive academic counterexamples to formal bounds, open a **Falsification / Counterexample / Security Audit Report** using the issue template.
