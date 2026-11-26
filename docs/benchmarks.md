# Empirical Benchmarks & Performance Budgets (`v2.3.0`)

All measurements below are generated deterministically by [`scripts/benchmark.mjs`](../scripts/benchmark.mjs) (`schema: PLANARIA-BENCHMARKS-1.2`, pre-registered in [`docs/preregistration.md`](preregistration.md)) and stored verbatim in [`results/benchmarks.json`](../results/benchmarks.json).

**Reference Machine:** Node.js `v25.8.2` on Windows x64, Intel Core Ultra 9 275HX (24 cores), 47.4 GiB RAM.

---

## 1. Paired 4-Architecture Random Erasure Survival Curve (`N = 40` Paired Seeds / Point)

Compares `AEGIS_DRIFT.hbin` (`98,304` B) against three baselines evaluated on the **exact same 40 deterministic random seeds** per erasure threshold:
1. **`LINBIN01`**: Monolithic headered linear executable with SHA-256 footer.
2. **`RS(40, 16)` Cliff**: Single-stratum flat erasure code ($40$ cells, $k = 16$).
3. **Equal-Storage Flat `RS(192, 48)`**: Exact same `98,304` B file size and `192 × 512` B cell count as PLANARIA, using a flat $k = 48$ all-or-nothing threshold (`25%` cliff) to isolate **progressive stratification** from total byte budget.

| Erasure (%) | `LINBIN01` (%) [95% CI] | `RS(40,16)` (%) | Equal-Storage `RS(192,48)` (%) [95% CI] | **PLANARIA `.hbin`** (%) [95% CI] | Mean Cap. (%) | Stratum (`S3/S2/S1/S0`) | vs. `RS(192,48)` Cohen's $h$ | vs. `RS(192,48)` $p_{\text{Holm}}$ |
|---:|---:|---:|---:|---:|---:|:---:|---:|---:|
| 0% | 100.0 `[91.2, 100.0]` | 100.0 | 100.0 `[91.2, 100.0]` | **100.0** `[91.2, 100.0]` | 100.0 | `40/0/0/0` | `0.000` | `1.000` |
| 12% | 32.5 `[20.1, 48.0]` | 100.0 | 100.0 `[91.2, 100.0]` | **100.0** `[91.2, 100.0]` | 100.0 | `40/0/0/0` | `0.000` | `1.000` |
| 44% | 0.0 `[0.0, 8.8]` | 100.0 | 100.0 `[91.2, 100.0]` | **100.0** `[91.2, 100.0]` | 100.0 | `40/0/0/0` | `0.000` | `1.000` |
| 60% | 0.0 `[0.0, 8.8]` | 57.5 | 100.0 `[91.2, 100.0]` | **100.0** `[91.2, 100.0]` | 88.8 | `22/18/0/0` | `0.000` | `1.000` |
| 72% | 0.0 `[0.0, 8.8]` | 2.5 | 100.0 `[91.2, 100.0]` | **100.0** `[91.2, 100.0]` | 72.5 | `0/36/4/0` | `0.000` | `1.000` |
| **76%** | **0.0** `[0.0, 8.8]` | **0.0** | **0.0** `[0.0, 8.8]` *(Cliff)* | **100.0** `[91.2, 100.0]` | **65.6** | `0/25/15/0` | **`3.142`** | **`4.55e-11`** |
| **80%** | **0.0** `[0.0, 8.8]` | **0.0** | **0.0** `[0.0, 8.8]` | **95.0** `[83.5, 98.6]` | **55.6** | `0/13/25/0` | **`2.691`** | **`1.75e-10`** |
| **84%** | **0.0** `[0.0, 8.8]` | **0.0** | **0.0** `[0.0, 8.8]` | **87.5** `[73.9, 94.5]` | **39.4** | `0/3/22/10` | **`2.419`** | **`1.34e-9`** |
| **88%** | **0.0** `[0.0, 8.8]` | **0.0** | **0.0** `[0.0, 8.8]` | **82.5** `[68.1, 91.3]` | **31.3** | `0/1/15/17` | **`2.278`** | **`5.12e-9`** |
| **92%** | **0.0** `[0.0, 8.8]` | **0.0** | **0.0** `[0.0, 8.8]` | **65.0** `[49.5, 77.9]` | **19.4** | `0/0/5/21` | **`1.875`** | **`6.26e-7`** |
| **96%** | **0.0** `[0.0, 8.8]` | **0.0** | **0.0** `[0.0, 8.8]` | **32.5** `[20.1, 48.0]` | **8.1** | `0/0/0/13` | **`1.213`** | **`4.88e-3`** |

**Honest Trade-Off Note:** Between `52%` and `72%` random erasure, Equal-Storage `RS(192, 48)` recovers 100% of all bytes (full Stratum 3) whenever $\ge 48/192$ cells survive, whereas PLANARIA gracefully steps down to Stratum 2 (`S2`) and Stratum 1 (`S1`) as higher-rate bundles drop below their thresholds. Above `75%` erasure, Equal-Storage `RS(192, 48)` suffers an instantaneous cliff to `0.0%` availability, while PLANARIA remains bootable with statistically overwhelming superiority ($p_{\text{Holm}} \le 4.88 \times 10^{-3}$ across every threshold `76%..96%`).

---

## 2. Radiation Burst Sweep, Byzantine Quarantine & Unaligned Mitosis

- **Contiguous Burst Radiation in ALL 192 Cells Simultaneously:**
  - `0..16 B/cell` (up to `3,072` corrupted bytes = `3.13%` file-wide): **192/192 cells repaired (100% SHA-256 exact regeneration)**; `LINBIN01` dies at `2 B/cell`.
  - `18..22 B/cell` (past tight interleaved RS bound $2t = 16$): **0/192 cells repaired, 0 silent miscorrections** (confirms Theorem IV.5–IV.6).
- **Byzantine Trojan Flood (`1, 5, 20, 60, 192` forged RS-valid cells prepended):**
  - **Merkle Quarantine ON:** `100%` quarantined (`1/1`, `5/5`, `20/20`, `60/60`, `192/192`), `100%` exact SHA-256 match.
  - **Merkle Quarantine OFF:** Even **1 single Trojan** poisons `470 / 472` bytes (`99.6%`) of `S0_STEM_NUCLEUS` (`469–472 B` across `1..192` Trojans).
- **Zero-Overlap Unaligned 50/50 Bisection (`49152, 49153, 49177, 48701, 49597, 49000`):**
  - **100% (6/6 cut offsets)** regenerate SHA-256 bit-exact `98,304`-byte parent binaries from **BOTH** disjoint halves in `12.57–14.21 ms` combined.
- **Full 5-Chimera Cross-Species Xenograft Matrix (`60` frames each):**
  - `AEGIS_DRIFT × SYNTH_REACTOR (S2 Render+Audio)` — Bootable S3, Host B0 Sovereign, **0 traps**
  - `AEGIS_DRIFT × CIPHER_VAULT (S2 Render+Audio)` — Bootable S3, Host B0 Sovereign, **0 traps**
  - `AEGIS_DRIFT × QUANTUM_CHRONICLE (S1 Logic)` — Bootable S3, Host B0 Sovereign, **0 traps**
  - `QUANTUM_CHRONICLE × SYNTH_REACTOR (S2 Render+Audio)` — Bootable S3, Host B0 Sovereign, **0 traps**
  - `SYNTH_REACTOR × CIPHER_VAULT (S2 Render+Audio)` — Bootable S3, Host B0 Sovereign, **0 traps**

---

## 3. Performance Budgets & Latency Tracking (`A37`, `B27`)

| Metric | Target Budget (`A37`) | Measured `v2.3.0` | Spread (`IQR` / `p95`) | Status |
|---|---:|---:|---:|:---:|
| Compile all 4 `.plang` species (`npm run build`) | `< 200 ms` | **40.3 ms** | — | PASS |
| Full `.hbin` decode (`n = 40`) | median `< 25 ms`, p95 `< 60 ms` | **5.994 ms** (mean `5.998 ms`) | IQR `0.268 ms`, p95 `6.526 ms` | PASS |
| Dual 50/50 mitosis decode + regenerate | `< 40 ms` | **12.57–14.21 ms** | across 6 offsets | PASS |
| `PVM-32` single frame execution (`n = 400`) | median `< 1.0 ms` (60 FPS = `16.67 ms`) | **0.041 ms** (mean `0.052 ms`) | IQR `0.006 ms`, p95 `0.111 ms` | PASS (`42.85 MIPS`) |
| 16 KiB `PLN\xB7` sync-flood DoS decode (`Suite 26`) | `< 250 ms` | **< 10 ms** | O(1) bypass | PASS |
| 28-suite verification harness (`npm test`) | `< 15 s` | **~1.9 s** | — | PASS |
| 10-mutant mutation suite (`npm run mutate`) | `< 60 s`, `10/10` killed | **~20.2 s**, **10/10 (100.0%)** | — | PASS |

**Historical Trend (Report-Only Tracking, `B27`):**
- `v2.2.0`: Mean decode `8.96 ms`, `PVM-32` `27.02 MIPS` (`0.082 ms/frame`), 24 suites, 62 Lean theorems.
- `v2.3.0`: Median decode `5.994 ms` (`-33.1%`), `PVM-32` `42.85 MIPS` (`0.041 ms/frame` median, `+58.6%`), 28 suites, `10/10` mutants killed, 70 Lean theorems across 6 kernels. Every Ubuntu CI push uploads `results/benchmarks.json` as a build artifact for ongoing regression comparison.
