# PLANARIA Pure Lean 4 (`v4.35.0`) Formal Proof Library

**Toolchain:** `leanprover/lean4:v4.35.0` (core Lean 4 only — **zero Mathlib dependency**, **zero errors/warnings**, **zero `sorryAx`**, **zero `native_decide` / `Lean.ofReduceBool` / `Lean.trustCompiler`**, **zero custom axioms**).  
**Audit Log:** [results/lean4-audit.txt](../results/lean4-audit.txt) — **62 audited declarations** across 6 modules, enforced by a strict Python axiom allowlist parser in `.github/workflows/ci.yml`.

## Quick Verification

```bash
cd lean
lake clean
lake build
```

Inspect the `#print axioms` output at the end of `PlanariaProofs.lean`: every single theorem depends ONLY on standard Lean 4 kernel axioms (`propext`, `Quot.sound`, `Classical.choice` — or **no axioms at all** for 10 purely constructive proofs!).

---

## Complete 62-Theorem Catalog

### Module 1 — `GF256.lean` (15 Audited Declarations)
| # | Declaration | Core Formal Guarantee | Axioms |
|---:|---|---|---|
| 1 | `gfAdd_comm` | $\text{GF}(2^8)$ addition (XOR) commutativity | `propext, Quot.sound` |
| 2 | `gfAdd_self` | Characteristic-2 self-inverse ($a \oplus a = 0$) | `propext, Quot.sound` |
| 3 | `gfAdd_assoc` | Associativity of $\text{GF}(2^8)$ addition on `[0, 256)` | `propext, Quot.sound` |
| 4 | `xtime_xor` | $\mathbb{F}_2$-linearity of `xtime` modulo `0x11D` | `propext, Quot.sound` |
| 5 | `gfMul_lt_256` | Closure of Russian-peasant `gfMul` in `[0, 256)` | `propext, Quot.sound` |
| 6 | `gfMul_zero_right` | Zero annihilation under `0x11D` multiplication | `propext` |
| 7 | `gfMul_one_right` | Multiplicative identity for all bytes $a < 256$ | `propext, Classical.choice, Quot.sound` |
| 8 | `gfMul_comm` | **Exhaustive ALL 65,536 pairs:** $\forall a,b < 256,\, ab = ba$ via $\mathbb{F}_2$-bilinearity | `propext, Classical.choice, Quot.sound` |
| 9 | `gfMul_assoc` | **Exhaustive ALL 16,777,216 triples:** $\forall a,b,c < 256,\, (ab)c = a(bc)$ | `propext, Classical.choice, Quot.sound` |
| 10 | `gfMul_add_right` | Full distributivity $a(b \oplus c) = ab \oplus ac$ | `propext, Quot.sound` |
| 11 | `gfMul_inv_exact` | **Exhaustive 255 nonzero bytes:** $\forall a \in \{1..255\},\, a \cdot a^{-1} = 1$ | `propext, Quot.sound` |
| 12 | `cauchy2_exact_roundtrip` | Concrete Stratum-0 2-cell Cauchy encode→decode roundtrips | `propext` |
| 13 | `gf_cauchy2_nonzero_det` | **Universal Theorem I:** 2×2 Cauchy determinant $\neq 0$ over **ALL** char-2 fields | **None (constructive)** |
| 14 | `cauchy2_exact_decode` | **Universal Cauchy 2×2 Decoding:** `decode(encode(d0, d1)) = (d0, d1)` over ANY `Char2Field` | **None (constructive)** |
| 15 | `gf256_cauchy2_exact_decode` | Concrete instantiation on `gf256Field : Char2Field (Fin 256)` for ALL `(x0, x1, d0, d1)` | `propext, Classical.choice, Quot.sound` |

### Module 2 — `MitosisBounds.lean` (11 Audited Declarations)
| # | Declaration | Core Formal Guarantee | Axioms |
|---:|---|---|---|
| 16 | `mitosis_exact_sufficient` | $N \ge 2k \implies$ balanced disjoint halves both satisfy $\ge k$ | `propext, Classical.choice, Quot.sound` |
| 17 | `mitosis_strict_impossibility` | Tight lower bound: $N < 2k \implies \neg\exists$ dual-regenerating split | `propext, Quot.sound` |
| 18 | `mitosis_unaligned_cut_guarantee` | $N \ge 2k + 2 \implies$ dual mitosis survives arbitrary unaligned byte cuts | `propext, Classical.choice, Quot.sound` |
| 19 | `planaria_all_7_bundles_mitosis_safe` | All 7 `.hbin` v1.0 bundles satisfy $n_b \ge 2k_b + 4$ | **None** |
| 20 | `planaria_total_cells_exact` | $\sum n_b = 192 \le 2^8$ & $192 \times 512 = 98{,}304$ B | **None** |
| 21 | `planaria_schedule_exact_halves` | Exact integer `posNum(b,i,n_b)` puts $n_b/2 \ge k_b+2$ cells strictly on each side with 0 midpoint ties & 192 distinct lexicographic keys | `propext` |
| 22 | `planaria_cell_byte_budget_exact` | Exact 512B cell partition (`4+508=512`, `2×254=508`, `2×238=476`, `16+332+128=476`) | **None** |
| 23 | `planaria_cauchy_coord_disjoint` | Disjoint Cauchy sets $Y=[0,k)$, $X=[k,k+n)$ fitting strictly inside $\text{GF}(2^8)$ | **None** |
| 24 | `planaria_payload_capacity_exact` | Total source chunks $\sum k_b = 48$ (`15,936 B` capacity, exact 4× expansion) | **None** |
| 25 | `pigeonhole_two_way` | Two-way fragmentation survival pigeonhole law | `propext, Quot.sound` |
| 26 | `trisection_synergy_recovery` | Bundle 5 `(13, 13, 14)` trisection super-additive synergy | `propext, Classical.choice, Quot.sound` |

### Module 3 — `StratumAnastomosis.lean` (6 Audited Declarations)
| # | Declaration | Core Formal Guarantee | Axioms |
|---:|---|---|---|
| 27 | `anastomosis_zero_crash_safety` | $b_0 \ge 2 \implies$ `resolveRenderer` NEVER returns `.deadCrash` | `propext, Quot.sound` |
| 28 | `resolveOrgan_zero_crash_safety` | General 6-organ `resolveOrgan` never crashes & never dispatches B0/B6 | `propext, Quot.sound` |
| 29 | `anastomosis_monotonicity` | Adding cells monotonically preserves or upgrades resolved stratum | `propext, Quot.sound` |
| 30 | `fusion_dominates_parents` | Raw shard union $A \cup B$ dominates $\max(\text{viability}(A), \text{viability}(B))$ | `propext, Classical.choice, Quot.sound` |
| 31 | `fusion_strict_synergy_exists` | Constructive strict synergy (`S1 + S1 → S3` & `canFullRegenerate = true` incl. B6) | **None** |
| 32 | `zero_cliff_strict_separation` | At 23/192 cells (12%), BOTH `RS(40,16)` and equal-storage flat `RS(192,48)` die while PLANARIA boots | **None** |

### Module 4 — `ByzantineImmune.lean` (13 Audited Declarations)
| # | Declaration | Core Formal Guarantee | Axioms |
|---:|---|---|---|
| 33 | `hammingDist_triangle` | Real byte-list Hamming distance triangle inequality | `propext, Classical.choice, Quot.sound` |
| 34 | `rs254_238_unique_decoding_radius` | `RS(254, 238)` Singleton distance $d_{\min} = 17$, unique radius $t = 8$ | `propext, Classical.choice, Quot.sound` |
| 35 | `rs_unique_correction_ball_disjoint` | Unambiguous bounded-distance decoding balls over real byte lists | `propext, Classical.choice, Quot.sound` |
| 36 | `rs_interleaved_lane_geometry` | Exact 508B even/odd partition into two 254B `RS(254,238)` lanes | `propext, Classical.choice, Quot.sound` |
| 37 | `interleaved_burst_16_even_odd_bound` | Any contiguous burst $L \le 16$ puts $\le 8$ errors in BOTH lanes | `propext, Classical.choice, Quot.sound` |
| 38 | `interleaved_burst_17_exceeds_radius` | Tight lower bound: any 17B burst exceeds $t=8$ in at least one lane | `propext, Classical.choice, Quot.sound` |
| 39 | `interleaved_burst_18_both_lanes_exceed` | Any 18B burst drives BOTH lanes to 9 errors ($> t = 8$) | `propext, Classical.choice, Quot.sound` |
| 40 | `merkle_path_collision_free_binding` | Explicit binary Merkle path leaf commitment under injective compression | `propext` |
| 41 | `merkle_quarantine_zero_contamination` | Under Merkle binding, 0% forged cells reach Cauchy decoder | `propext` |
| 42 | `merkle_quarantine_preserves_authentic` | Zero false-rejection of authentic cells under arbitrary Byzantine flood | `propext` |
| 43 | `unpinned_quorum_honest_majority` | Honest majority ($\ge 2$ & strictly exceeding max Sybil bucket) wins unpinned quorum | `propext, Classical.choice, Quot.sound` |
| 44 | `unpinned_quorum_sybil_counterexample` | Explicit counterexample: majority Sybil flood hijacks unpinned quorum (motivates pinned roots) | `propext, Quot.sound` |
| 45 | `unauthenticated_poisoning_exists` | Counterexample: 1 forged Trojan poisons unauthenticated Cauchy window | `propext, Quot.sound` |

### Module 5 — `XenograftABI.lean` (6 Audited Declarations)
| # | Declaration | Core Formal Guarantee | Axioms |
|---:|---|---|---|
| 46 | `pvm32_ram_bounds_invariant` | Signed `BitVec 32` masked RAM access `(base + offset) &&& 0xFFF#32` is unconditionally $< 4096$ | `propext, Quot.sound` |
| 47 | `pvm32_bounded_termination` | Every organ call terminates in $\le \text{budget}$ steps | `propext, Quot.sound` |
| 48 | `xenograft_preserves_sovereignty` | Any slot with `xenograftable = false` cannot be replaced | `propext` |
| 49 | `xenograft_sovereign_b0_b6_immutable` | Non-vacuous B0 (Kernel) & B6 (Genome) sovereignty even under forged `xenograftable = true` | `propext` |
| 50 | `xenograft_abi_safety` | Xenografts preserve `abiSig` & `bundleId` and reject mismatched donors | `propext, Quot.sound` |
| 51 | `xenograft_improves_amputated_host` | Valid ABI-matched donor restores viability of amputated host slot (`1..5`) | `propext, Classical.choice, Quot.sound` |

### Module 6 — `QuantumTemporal.lean` (11 Audited Declarations)
| # | Declaration | Core Formal Guarantee | Axioms |
|---:|---|---|---|
| 52 | `pauliX4Q_preserves_normSq4` | Full 4-qubit 16-amplitude complex Pauli-X unitarity ($\forall q \in \text{Fin } 4$) | `propext, Quot.sound` |
| 53 | `pauliY4Q_preserves_normSq4` | Full 4-qubit 16-amplitude complex Pauli-Y unitarity ($\forall q \in \text{Fin } 4$) | `propext, Classical.choice, Quot.sound` |
| 54 | `pauliZ4Q_preserves_normSq4` | Full 4-qubit 16-amplitude complex Pauli-Z unitarity ($\forall q \in \text{Fin } 4$) | `propext, Classical.choice, Quot.sound` |
| 55 | `hadamardScaled4Q_normSq4` | Full 4-qubit 16-amplitude complex scaled Hadamard $\| \sqrt{2} H_q \psi \|^2 = 2\|\psi\|^2$ | `propext, Classical.choice, Quot.sound` |
| 56 | `cnot4Q_preserves_normSq4` | Full 4-qubit 16-amplitude complex CNOT unitarity (all 12 distinct pairs) | `propext, Classical.choice, Quot.sound` |
| 57 | `cz4Q_preserves_normSq4` | Full 4-qubit 16-amplitude complex CZ unitarity (all 16 pairs) | `propext, Classical.choice, Quot.sound` |
| 58 | `swap4Q_preserves_normSq4` | Full 4-qubit 16-amplitude complex SWAP unitarity (all 16 pairs) | `propext, Classical.choice, Quot.sound` |
| 59 | `temporal_rewind_exact_left_inv` | `chronoRewind (chronoAdvance s) = s` (zero-drift rewind) | `propext, Quot.sound` |
| 60 | `temporal_rewind_exact_right_inv` | `chronoAdvance (chronoRewind s) = s` (exact bijection) | `propext, Quot.sound` |
| 61 | `snapshot_buffer_capacity_and_exact_pop` | Bounded 360-frame snapshot buffer length $\le 360$ & exact lossless pop | `propext` |
| 62 | `combinatorial_1of1_space_exceeds_6_trillion` | Exact reachable 1/1 space `80640 × 3072 × 25920 = 6,421,059,993,600 > 6.4 × 10^{12}` | **None (constructive)** |

## Formal Verification Scope Boundary

The Lean 4 kernel formally verifies all 62 algebraic, combinatorial, safety, isolation, termination, and 4-qubit unitarity theorems stated above. Concrete JavaScript implementation equivalence (`src/core/*.js`, `src/vm/pvm32.js`), Berlekamp-Massey / Forney polynomial runtime decoding, synchronous SHA-256 bit-equivalence against OpenSSL, HTTP/CLI security hardening, and live Monte Carlo survival rates are separately verified by [test/verify.mjs](../test/verify.mjs) (24 suites) and [scripts/benchmark.mjs](../scripts/benchmark.mjs).
