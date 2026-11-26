# ADR-0002: Depth-8 Domain-Separated SHA-256-128 Merkle Quarantine & Fail-Closed Quorum

- **Status:** Accepted
- **Date:** 2026-11-19 (hardened 2026-11-25)

## Context

Outer Cauchy MDS linear decoding over $\mathrm{GF}(2^8)$ is catastrophically sensitive to **Byzantine poisoning**: a single forged cell that passes inner `RS(254, 238)` parity corrupts every recovered byte of its bundle via dense matrix inversion.

## Decision

1. Embed an 8-level (`128`-byte) Merkle authentication path inside every `512`-byte cell using domain-separated FIPS 180-4 SHA-256 truncated to 128 bits (`0x00` live leaf prefix, `0x01` internal node prefix, `0x02 || "PLN\0"` empty leaf sentinel).
2. Quarantine every decoded cell by its implied root before Cauchy inversion (`Planaria.Byzantine.merkle_quarantine_zero_contamination`).
3. Require `pinnedRootHex` for full Byzantine resistance; when unpinned, elect a primary root via `electUnpinnedQuorum()` requiring `>= 2` unique cells, a unique strict maximum, and fail-closed rejection on ties (`Planaria.Byzantine.unpinned_quorum_tie_fail_closed`).
4. Require live host (`bundles[0].viable`, proved in `Planaria.Xenograft.xenograft_dead_host_refused`), sovereign protection (`B0`/`B6` immutable), strict host ABI matching, and explicit opt-in (`--allow-unpinned-xenograft` in CLI) before any cross-species graft.

## Consequences

- **Positive:** 0% Byzantine poisoning across all tested Trojan counts (`1..192`) under pinned roots (`Suite 08`, `Planaria.Byzantine`).
- **Negative / Trade-off:** 128 bytes per cell (25% of gross cell size) are dedicated to authentication proofs; 128-bit truncation provides 128-bit second-preimage resistance and 64-bit birthday collision resistance; unpinned decoding cannot defend against $>50\%$ Sybil flooding (`Planaria.Byzantine.unpinned_quorum_sybil_counterexample`).
