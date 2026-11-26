# ADR-0001: Progressive 4-Stratum Cauchy MDS + Interleaved Inner RS(254, 238)

- **Status:** Accepted
- **Date:** 2026-11-19 (hardened 2026-11-25)

## Context

Conventional executable formats (`ELF`, `PE`, `Mach-O`, `WASM`) rely on contiguous file headers and uncoded instruction streams, causing catastrophic failure under single-bit header corruption or partial truncation. Conversely, flat all-or-nothing erasure codes (such as `RS(192, 48)`) exhibit a sharp recovery cliff: if surviving shards fall even one cell below $k$, zero functionality boots.

## Decision

Encode every `98,304`-byte `.hbin` binary as `192` self-synchronizing `512`-byte cells arranged via a coprime scatter bijection across **4 progressive Cauchy MDS strata** over $\mathrm{GF}(2^8)$ (`S0: k=4/36`, `S1: k=8/40`, `S2: k=16/48`, `S3: B3..B6 across 68 cells`), with each cell protected internally by two byte-interleaved `RS(254, 238)` codewords (correcting up to `8` random byte errors/lane or `16`-byte contiguous bursts).

## Consequences

- **Positive:** Survives `88%` random spatial obliteration in Stratum 0 ("12% Ghost"), guarantees zero-overlap 50/50 bit-exact dual mitosis across arbitrary prime cuts, and repairs simultaneous 14-byte bursts across all 192 cells.
- **Negative / Trade-off:** `98,304` B represents a fixed storage expansion relative to raw bytecode (`~4–12 KB`), and full 100%-organ regeneration requires surviving Stratum 3's threshold (~50% spatial cut) rather than an equal-storage flat `RS(192, 48)` code's 25% all-or-nothing cliff. Both regimes are measured side-by-side in `docs/benchmarks.md`.
