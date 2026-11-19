# PLANARIA Pure Lean 4 (`v4.35.0`) Formal Proof Library

**Toolchain:** `leanprover/lean4:v4.35.0` (core Lean 4 only — **zero Mathlib dependency**, **zero `sorryAx`**, **zero `native_decide` / `Lean.trustCompiler`**, **zero custom axioms**).  
**Audit Log:** [results/lean4-audit.txt](../results/lean4-audit.txt) — 31 audited declarations across 5 modules, clean-building in ~7.4 seconds.

## Quick Verification

```bash
cd lean
lake clean
lake build
```

Inspect the `#print axioms` output at the end of `PlanariaProofs.lean`: every single theorem depends ONLY on standard Lean 4 kernel axioms (`propext`, `Quot.sound`, `Classical.choice` — or **no axioms at all** for constructive proofs!).

---

## Complete 31-Theorem Catalog

| # | Module | Theorem / Declaration | Core Formal Guarantee | Axioms Used |
|---|---|---|---|---|
| 1 | `GF256.lean` | `gfAdd_comm` | $\text{GF}(2^8)$ addition (XOR) commutativity | `propext, Quot.sound` |
| 2 | `GF256.lean` | `gfAdd_self` | Characteristic-2 self-inverse ($a \oplus a = 0$) | `propext, Quot.sound` |
| 3 | `GF256.lean` | `gfMul_zero_right` | Zero annihilation under Russian-peasant `0x11D` multiply | `propext` |
| 4 | `GF256.lean` | `gfMul_one_right` | Multiplicative identity for all bytes $a < 256$ | `propext, Classical.choice, Quot.sound` |
| 5 | `GF256.lean` | `gfMul_inv_exact` | **Exhaustive kernel proof:** $\forall a \in \{1..255\}, a \cdot a^{-1} = 1$ in $\text{GF}(2^8)$ | `propext, Quot.sound` |
| 6 | `GF256.lean` | `gfMul_comm_sample_verified` | Kernel-checked commutativity over core $16 \times 16$ Cauchy indices | `propext` |
| 7 | `GF256.lean` | `gf_cauchy2_nonzero_det` | **Universal Theorem I:** 2×2 Cauchy determinant $\neq 0$ over **ALL** char-2 fields! | **None (constructive)** |
| 8 | `GF256.lean` | `cauchy2_exact_roundtrip` | Bit-exact 2-cell Stratum-0 Cauchy encode→decode roundtrip | `propext` |
| 9 | `MitosisBounds.lean` | `mitosis_exact_sufficient` | **Theorem II.1:** $N \ge 2k \implies$ balanced disjoint halves both satisfy $\ge k$ | `propext, Classical.choice, Quot.sound` |
| 10 | `MitosisBounds.lean` | `mitosis_strict_impossibility` | **Theorem II.2 (Tight Bound):** $N < 2k \implies \neg\exists$ dual-regenerating split | `propext, Quot.sound` |
| 11 | `MitosisBounds.lean` | `mitosis_unaligned_cut_guarantee` | **Theorem II.3:** $N \ge 2k + 2 \implies$ dual mitosis survives arbitrary unaligned cuts | `propext, Classical.choice, Quot.sound` |
| 12 | `MitosisBounds.lean` | `planaria_all_7_bundles_mitosis_safe` | All 7 `.hbin` v1.0 bundles satisfy $n_b \ge 2k_b + 4$ | **None** |
| 13 | `MitosisBounds.lean` | `planaria_total_cells_exact` | $\sum n_b = 192 \le 2^8$ (Depth-8 Merkle fit) & $192 \times 512 = 98{,}304$ B | **None** |
| 14 | `MitosisBounds.lean` | `pigeonhole_two_way` | Two-way fragmentation survival pigeonhole law | `propext, Quot.sound` |
| 15 | `MitosisBounds.lean` | `trisection_synergy_recovery` | Bundle 5 `(13, 13, 14)` trisection: every third $< 16$, every pair $\ge 26 \ge 16$ | `propext, Classical.choice, Quot.sound` |
| 16 | `StratumAnastomosis.lean` | `anastomosis_zero_crash_safety` | **Theorem III.1:** $b_0 \ge 2 \implies$ `resolveRenderer` NEVER returns `.deadCrash` | `propext, Quot.sound` |
| 17 | `StratumAnastomosis.lean` | `anastomosis_monotonicity` | Adding cells monotonically preserves or upgrades resolved stratum | `propext, Quot.sound` |
| 18 | `StratumAnastomosis.lean` | `fusion_dominates_parents` | Raw shard union $A \cup B$ dominates $\max(\text{viability}(A), \text{viability}(B))$ | `propext, Classical.choice, Quot.sound` |
| 19 | `StratumAnastomosis.lean` | `fusion_strict_synergy_exists` | Constructive proof of strict super-additive shard healing (`S1 + S1 -> S3`) | **None** |
| 20 | `StratumAnastomosis.lean` | `zero_cliff_strict_separation` | Constructive proof: at 23/192 cells (12%), RS-cliff is dead while PLANARIA boots | **None** |
| 21 | `ByzantineImmune.lean` | `rs254_238_unique_decoding_radius` | `RS(254, 238)` Singleton distance $d_{\min} = 17$, unique radius $t = 8$ | `propext, Classical.choice, Quot.sound` |
| 22 | `ByzantineImmune.lean` | `rs_unique_correction_ball_disjoint` | Metric triangle-inequality proof of unambiguous bounded-distance decoding | `propext, Quot.sound` |
| 23 | `ByzantineImmune.lean` | `interleaved_burst_16_even_odd_bound` | **Theorem IV.3:** Any contiguous burst $L \le 16$ puts $\le 8$ errors in BOTH lanes | `propext, Classical.choice, Quot.sound` |
| 24 | `ByzantineImmune.lean` | `merkle_quarantine_zero_contamination` | **Theorem IV.4:** Under Merkle binding, 0% forged cells reach Cauchy decoder | `propext` |
| 25 | `ByzantineImmune.lean` | `merkle_quarantine_preserves_authentic` | Zero false-rejection of authentic cells under arbitrary Byzantine flood | `propext` |
| 26 | `ByzantineImmune.lean` | `unauthenticated_poisoning_exists` | Counterexample proving 1 Trojan poisons unauthenticated Cauchy window | `propext, Quot.sound` |
| 27 | `XenograftABI.lean` | `pvm32_ram_bounds_invariant` | **Theorem V.1:** Masked `PVM-32` RAM access is unconditionally $< 4096$ | **None** |
| 28 | `XenograftABI.lean` | `pvm32_bounded_termination` | **Theorem V.2:** Every organ call terminates in $\le \text{budget}$ steps | `propext, Quot.sound` |
| 29 | `XenograftABI.lean` | `xenograft_preserves_sovereignty` | Kernel (B0) & Genome (B6) cannot be replaced by foreign donors | `propext` |
| 30 | `XenograftABI.lean` | `xenograft_abi_safety` | Xenografts preserve ABI signature & reject incompatible donors | `propext, Quot.sound` |
| 31 | `XenograftABI.lean` | `xenograft_improves_amputated_host` | Valid ABI-matched donor restores viability of an amputated host slot | `propext, Classical.choice, Quot.sound` |

## Formal Verification Scope Boundary

The Lean 4 kernel formally verifies all algebraic, combinatorial, safety, isolation, and termination theorems stated above. Concrete JavaScript implementation equivalence (`src/core/*.js`, `src/vm/pvm32.js`), Berlekamp-Massey / Forney polynomial runtime decoding, synchronous SHA-256 bit-equivalence against OpenSSL, and live Monte Carlo survival rates are separately verified by [test/verify.mjs](../test/verify.mjs) and [scripts/benchmark.mjs](../scripts/benchmark.mjs).
