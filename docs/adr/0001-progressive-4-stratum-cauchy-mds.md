# ADR-0001: Progressive 4-Stratum Cauchy MDS + Interleaved Inner RS(254, 238)

- **Status:** Accepted
- **Date:** 2026-11-19 (hardened 2026-11-25)

## Context

Conventional executable formats (`ELF`, `PE`, `Mach-O`, `WASM`) rely on contiguous file headers and uncoded instruction streams, causing catastrophic failure under single-bit header corruption or partial truncation. Conversely, flat all-or-nothing erasure codes (such as Equal-Storage `RS(192, 48)`) exhibit a sharp recovery cliff: if surviving shards fall even one cell below $k = 48$, zero functionality boots.

## Decision

Encode every `98,304`-byte `.hbin` binary as `192` self-synchronizing `512`-byte cells arranged via the exact-integer `PLACEMENT_SCHEDULE` (`posNum(b, i, n_b) = (14 * i + 2 * b + 1) * (480 / n_b)`) across **4 progressive Cauchy MDS strata / 7 bundles** over $\mathrm{GF}(2^8)$ (`0x11D`):
- **S0:** `B0 S0_STEM_NUCLEUS` (`k=2, n=24`)
- **S1:** `B1 S1_CORE_LOGIC` (`k=4, n=24`), `B2 S1_WIREFRAME` (`k=4, n=24`)
- **S2:** `B3 S2_CORTEX_RENDER` (`k=8, n=32`), `B4 S2_SYNTH_AUDIO` (`k=6, n=24`)
- **S3:** `B5 S3_ORGANISM_FX` (`k=16, n=40`), `B6 S3_GENOME_LEDGER` (`k=8, n=24`)

Each cell is armored internally by two byte-interleaved `RS(254, 238)` codewords (correcting up to `8` random byte errors/lane or `16`-byte contiguous bursts).

## Consequences

- **Positive:** Survives `88%` random spatial obliteration in Stratum 0 ("12% Ghost"), guarantees zero-overlap 50/50 bit-exact dual mitosis across arbitrary prime cuts (proved in `Planaria.Mitosis.planaria_schedule_nodup_and_sorted_halves`), and repairs simultaneous 16-byte bursts across all 192 cells.
- **Negative / Trade-off:** `98,304` B represents a `4.0×` cell expansion (`6.17×` vs. `15,936 B` payload capacity; `24.6×–57.7×` vs. compiled species bytecode), and full 100%-organ regeneration requires surviving Stratum 3's threshold (`B5: k=16/40`) rather than flat `RS(192, 48)`'s 25% all-or-nothing cliff. Both regimes are measured side-by-side in `docs/benchmarks.md`.
