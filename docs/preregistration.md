# Pre-Registration of Experimental Hypotheses (`v2.4.0`)

**Document Date:** 2026-11-25 (authored prior to locking `v2.3.0`/`v2.4.0` Equal-Storage `RS(192,48)` paired ablation results; exploratory prototyping occurred in `v1.0.0`–`v2.2.0`, disclosed in [`DEVIATIONS.md`](../DEVIATIONS.md) `DEV-05`)  
**Investigator:** Alexander Stephen Donahue (`0thernes`, ORCID `0009-0006-8168-9648`)  
**Scope:** Empirical falsification protocol executed by `scripts/benchmark.mjs` (`PLANARIA-BENCHMARKS-1.2`).

## Pre-Registered Hypotheses

### `H1` — Bootable Survival Advantage Over Traditional Headered Linear Executables
- **Null ($H_{0,1}$):** Under uniform random cell erasure across loss percentages $p \in \{4\%, 8\%, \dots, 96\%\}$ (`dropPct = 0, 4, 8, ..., 96`), PLANARIA `.hbin` bootability rate equals `LINBIN01` linear binary bootability rate.
- **Alternative ($H_{1,1}$):** PLANARIA `.hbin` achieves strictly higher bootability than `LINBIN01` across $p \in [4\%, 88\%]$ with paired McNemar Holm–Bonferroni adjusted $p_{\text{Holm}} < 0.001$ and Cohen's $h > 1.0$.
- **Falsification Criterion:** Any trial where `LINBIN01` boots under $\ge 4\%$ erasure while PLANARIA fails, or any $p \in [4\%, 80\%]$ where PLANARIA bootability drops below $95\%$.

### `H2` — Progressive Stratification Advantage Over Equal-Storage Flat `RS(192, 48)` Baseline
- **Control Rationale:** Comparing a `98,304`-byte `.hbin` only against an uncoded `LINBIN01` conflates redundancy overhead with progressive stratification. Therefore, we pre-register an **equal-storage, equal-cell-count flat MDS control** (`RS(192, 48)`, 192 cells × 512 B = `98,304` B, $k = 48$ flat threshold = 25% minimum survival for all-or-nothing boot, evaluated via the exact MDS rank predicate `authenticCells >= 48` on the identical paired erasure pattern).
- **Null ($H_{0,2}$):** In the severe-obliteration regime $p \in \{76\%, 80\%, 84\%, 88\%\}$ (where surviving fraction $1 - p < 25\%$), PLANARIA Stratum-0 bootability equals Equal-Storage `RS(192, 48)` bootability.
- **Alternative ($H_{1,2}$):** At $p \in \{76\%, 80\%, 84\%, 88\%\}$, Equal-Storage `RS(192, 48)` drops to $0\%$ (all-or-nothing cliff at $75\%$), whereas PLANARIA maintains progressive Stratum-0 viability ($p_{\text{Holm}} < 0.001$ at $p \in \{76\%, 80\%, 84\%\}$), demonstrating that the extreme-loss gain arises from **progressive stratification**, not merely total byte budget.
- **Honest Trade-Off Acknowledgement:** For full-fidelity 100% recovery (all 7 bundles), Equal-Storage `RS(192, 48)` can recover up to $75\%$ erasure whereas PLANARIA's full-regeneration threshold is bounded by Stratum 3's $k/n$ ratio ($\approx 50\%$ spatial cut / $60\%$ uniform erasure on `B5: k=16/40`). Both regimes are reported transparently.

### `H3` — Zero-Leakage Byzantine Quarantine Under RS-Valid Trojan Flooding
- **Null ($H_{0,3}$):** Active RS-valid Trojan cells with forged Merkle proofs poison outer $\mathrm{GF}(2^8)$ Cauchy reconstruction at rates $> 0\%$ when Merkle quarantine is enabled with pinned lineage root.
- **Alternative ($H_{1,3}$):** Across all Trojan counts tested (`1, 5, 20, 60, 192` forged RS-valid cells appended alongside authentic shards), Merkle quarantine rejects $100\%$ of forged cells (`0` false acceptances) while quarantine-disabled decoding suffers catastrophic Bundle-0 corruption.

### `H4` — Determinism & Bounded Execution Latency
- **Criterion:** All 4 `.plang` species (`QUANTUM_CHRONICLE`, `AEGIS_DRIFT`, `SYNTH_REACTOR`, `CIPHER_VAULT`) compile bit-identically across runs, match the independent Python 3 oracle bit-for-bit, execute `60` PVM-32 frames with `0` traps, and decode within median latency $< 25\text{ ms}$ (p95 $< 60\text{ ms}$) on standard desktop Node.js $\ge 20$.

## Sample Size, Pairing & Statistical Analysis Plan

- **Trials per loss threshold:** $N = 40$ deterministic paired seeds (`seed = 10000 + dropPct * 100 + t`, `t = 0..39`) evaluated identically across all 4 architectures (`LINBIN01`, `RS(40,16)`, Equal-Storage `RS(192,48)`, `PLANARIA .hbin`) at 25 erasure points ($0\%, 4\%, 8\%, \dots, 96\%$, total $1{,}000$ paired multi-architecture evaluations = $4{,}000$ architecture outcomes).
- **Uncertainty:** Wilson score 95% confidence intervals (exact coverage near $0\%$ and $100\%$ boundaries).
- **Hypothesis Test:** Exact two-sided paired McNemar binomial test on discordant pairs $(b, c)$.
- **Effect Size:** Risk difference $\Delta = \hat{p}_1 - \hat{p}_2$ and Cohen's $h = 2\arcsin(\sqrt{\hat{p}_1}) - 2\arcsin(\sqrt{\hat{p}_2})$.
- **Multiple-Comparison Correction:** Step-down Holm–Bonferroni adjustment ($p_{\text{Holm}}$) across all 25 erasure thresholds per pairwise comparison.
