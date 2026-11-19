# Security Policy & Byzantine Threat Model

## Scope

**PLANARIA** is an experimental holographic binary research platform and interactive virtual machine studio. Its security model explicitly studies:
- **Cryptographic cellular authentication** via Depth-8 domain-separated SHA-256-128 Merkle trees (`src/core/sha256.js`, `src/core/hbin.js`);
- **Byzantine quarantine isolation** preventing forged RS-valid cells from poisoning outer GF($2^8$) Cauchy linear decoding;
- **`PVM-32` execution sandboxing** (4,096-word masked linear RAM, bounded instruction fuel, non-xenograftable Kernel/Genome sovereignty, strict ABI signature verification);
- **Path-traversal containment** in `server.mjs`.

## Reporting Vulnerabilities or Cryptographic Bypasses

If you discover a Byzantine quarantine bypass, Merkle second-preimage/malleability flaw, `PVM-32` sandbox escape, or local HTTP server path traversal:
- Email **0thernes LLC** directly at `0_0@0thernes.art` with `[SECURITY][PLANARIA]` in the subject, or
- For non-sensitive academic counterexamples to formal bounds, open a **Falsification / Counterexample / Security Audit Report** using the issue template.
