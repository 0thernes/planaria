# PLANARIA Pure Lean 4.35.0 Multi-Kernel Formal Proof Library

**Toolchain:** `leanprover/lean4:v4.35.0` (`module` system, core Lean 4 only — **zero Mathlib**, **zero errors/warnings**, **zero `sorryAx`**, **zero `native_decide` / `Lean.ofReduceBool` / `Lean.trustCompiler`**, **zero custom axioms**).  
**Standalone Palomar Spec & Solution:** [`Challenge.lean`](Challenge.lean) (0 project imports, 70 theorem statements) · [`Solution.lean`](Solution.lean) (0 `sorry`) · [`comparator.json`](comparator.json) · [`../formalization.yaml`](../formalization.yaml).  
**Audit Transcripts:** [`../results/lean4-audit.txt`](../results/lean4-audit.txt) (70 lines, pure Unix LF, 12 zero-axiom constructive proofs) · [`../results/lean4-multi-kernel.txt`](../results/lean4-multi-kernel.txt) (6 independent kernels).

## Quick Verification

```bash
cd lean
lake build
lake build Challenge
lake env lean VerifyAxioms.lean
leanchecker --fresh Solution
leanchecker-paranoid --fresh Solution
# Full 6-kernel sandboxed verification + Challenge/Solution comparator (Linux with bubblewrap):
lake check --paranoid
lake comparator --config comparator.json --paranoid
```

---

## Complete 70-Theorem Catalog (`v2.3.0`)

### Module 1 — `GF256.lean` (16 Audited Declarations)
| # | Declaration | Core Formal Guarantee | Axioms |
|---:|---|---|---|
| 1 | `gfAdd_comm` | $\mathrm{GF}(2^8)$ addition (XOR) commutativity | `propext, Quot.sound` |
| 2 | `gfAdd_self` | Characteristic-2 self-inverse ($a \oplus a = 0$) | `propext, Quot.sound` |
| 3 | `gfAdd_assoc` | Associativity of $\mathrm{GF}(2^8)$ addition on `[0, 256)` | `propext, Quot.sound` |
| 4 | `xtime_xor` | $\mathbb{F}_2$-linearity of `xtime` modulo `0x11D` | `propext, Quot.sound` |
| 5 | `gfMul_lt_256` | Closure of Russian-peasant `gfMul` in `[0, 256)` | `propext, Quot.sound` |
| 6 | `gfMul_zero_right` | Zero annihilation under `0x11D` multiplication | `propext` |
| 7 | `gfMul_one_right` | Multiplicative identity for all bytes $a < 256$ | `propext, Quot.sound` |
| 8 | `gfMul_comm` | **Exhaustive ALL 65,536 pairs:** $\forall a,b < 256,\, ab = ba$ via $\mathbb{F}_2$-bilinearity | `propext, Classical.choice, Quot.sound` |
| 9 | `gfMul_assoc` | **Exhaustive ALL 16,777,216 triples:** $\forall a,b,c < 256,\, (ab)c = a(bc)$ | `propext, Classical.choice, Quot.sound` |
| 10 | `gfMul_add_right` | Full distributivity $a(b \oplus c) = ab \oplus ac$ | `propext, Quot.sound` |
| 11 | `gfMul_inv_exact` | **Exhaustive 255 nonzero bytes:** $\forall a \in \{1..255\},\, a \cdot a^{-1} = 1$ | `propext, Quot.sound` |
| 12 | `cauchy2_exact_roundtrip` | Concrete Stratum-0 2-cell Cauchy encode→decode roundtrips | `propext` |
| 13 | `gf_cauchy2_nonzero_det` | **Universal Theorem I:** 2×2 Cauchy determinant $\neq 0$ over **ALL** char-2 fields | **None (constructive)** |
| 14 | `cauchy2_exact_decode` | **Universal Cauchy 2×2 Decoding:** `decode(encode(d0, d1)) = (d0, d1)` over ANY `Char2Field` | **None (constructive)** |
| 15 | `gf256_cauchy2_exact_decode` | Concrete instantiation on `gf256Field : Char2Field (Fin 256)` for ALL `(x0, x1, d0, d1)` | `propext, Classical.choice, Quot.sound` |
| 16 | `gf256_cauchy2_nonvacuous_witness` | **Non-vacuity witness:** explicit concrete distinct coordinates & nontrivial decode roundtrip | `propext, Classical.choice, Quot.sound` |

### Module 2 — `MitosisBounds.lean` (12 Audited Declarations)
| # | Declaration | Core Formal Guarantee | Axioms |
|---:|---|---|---|
| 17 | `mitosis_exact_sufficient` | $N \ge 2k \implies$ balanced disjoint halves both satisfy $\ge k$ | `propext, Classical.choice, Quot.sound` |
| 18 | `mitosis_strict_impossibility` | Tight lower bound: $N < 2k \implies \neg\exists$ dual-regenerating split | `propext, Quot.sound` |
| 19 | `mitosis_unaligned_cut_guarantee` | $N \ge 2k + 2 \implies$ dual mitosis survives arbitrary unaligned byte cuts | `propext, Classical.choice, Quot.sound` |
| 20 | `planaria_all_7_bundles_mitosis_safe` | All 7 `.hbin` v1.0 bundles satisfy $n_b \ge 2k_b + 4$ | **None** |
| 21 | `planaria_total_cells_exact` | $\sum n_b = 192 \le 2^8$ & $192 \times 512 = 98{,}304$ B | **None** |
| 22 | `planaria_schedule_exact_halves` | Exact integer `posNum(b,i,n_b)` puts $n_b/2 \ge k_b+2$ cells strictly on each side with 0 midpoint ties | `propext` |
| 23 | `planaria_schedule_nodup_and_sorted_halves` | **Fidelity Gap #3 Closed:** proves true `all192LexKeys.Nodup` via `msortFuel_perm` AND sorted slots `0..95` `< 3360` vs `96..191` `> 3360` | `propext, Quot.sound` |
| 24 | `planaria_cell_byte_budget_exact` | Exact 512 B cell partition (`4+508=512`, `2×254=508`, `2×238=476`, `16+332+128=476`) | **None** |
| 25 | `planaria_cauchy_coord_disjoint` | Disjoint Cauchy sets $Y=[0,k)$, $X=[k,k+n)$ fitting strictly inside $\mathrm{GF}(2^8)$ | **None** |
| 26 | `planaria_payload_capacity_exact` | Total source chunks $\sum k_b = 48$ (`15,936 B` capacity, exact 4× expansion) | **None** |
| 27 | `pigeonhole_two_way` | Two-way fragmentation survival pigeonhole law | `propext, Quot.sound` |
| 28 | `trisection_synergy_recovery` | Bundle 5 `(13, 13, 14)` trisection super-additive synergy | `propext, Classical.choice, Quot.sound` |

### Module 3 — `StratumAnastomosis.lean` (7 Audited Declarations)
| # | Declaration | Core Formal Guarantee | Axioms |
|---:|---|---|---|
| 29 | `anastomosis_zero_crash_safety` | $b_0 \ge 2 \implies$ `resolveRenderer` NEVER returns `.deadCrash` | `propext, Quot.sound` |
| 30 | `resolveOrgan_zero_crash_safety` | General 6-organ `resolveOrgan` never crashes & never dispatches B0/B6 | `propext, Quot.sound` |
| 31 | `anastomosis_monotonicity` | Adding cells monotonically preserves or upgrades resolved stratum | `propext, Quot.sound` |
| 32 | `fusion_dominates_parents` | Raw shard union $A \cup B$ dominates $\max(\mathrm{viability}(A), \mathrm{viability}(B))$ | `propext, Classical.choice, Quot.sound` |
| 33 | `fusion_strict_synergy_exists` | Constructive strict synergy (`S1 + S1 → S3` & `canFullRegenerate = true` incl. B6) | **None** |
| 34 | `zero_cliff_strict_separation` | At 23/192 cells (12%), BOTH `RS(40,16)` and equal-storage flat `RS(192,48)` die while PLANARIA boots | **None** |
| 35 | `viability_s3_without_b2_matches_hbin` | **Fidelity Gap #1 Closed:** matches `src/core/hbin.js` Step 4 bit-for-bit when B3 is viable without B2 | **None** |

### Module 4 — `ByzantineImmune.lean` (16 Audited Declarations)
| # | Declaration | Core Formal Guarantee | Axioms |
|---:|---|---|---|
| 36 | `hammingDist_triangle` | Real byte-list Hamming distance triangle inequality | `propext, Classical.choice, Quot.sound` |
| 37 | `rs254_238_unique_decoding_radius` | `RS(254, 238)` Singleton distance $d_{\min} = 17$, unique radius $t = 8$ | `propext, Classical.choice, Quot.sound` |
| 38 | `rs_unique_correction_ball_disjoint` | Unambiguous bounded-distance decoding balls over real byte lists | `propext, Classical.choice, Quot.sound` |
| 39 | `rs_interleaved_lane_geometry` | Exact 508 B even/odd partition into two 254 B `RS(254,238)` lanes | `propext, Classical.choice, Quot.sound` |
| 40 | `interleaved_burst_16_even_odd_bound` | Any contiguous burst $L \le 16$ puts $\le 8$ errors in BOTH lanes | `propext, Classical.choice, Quot.sound` |
| 41 | `interleaved_burst_17_exceeds_radius` | Tight lower bound: any 17 B burst exceeds $t=8$ in at least one lane | `propext, Classical.choice, Quot.sound` |
| 42 | `interleaved_burst_18_both_lanes_exceed` | Any 18 B burst drives BOTH lanes to 9 errors ($> t = 8$) | `propext, Classical.choice, Quot.sound` |
| 43 | `merkle_path_collision_free_binding` | Explicit binary Merkle path leaf commitment under injective compression | `propext` |
| 44 | `pow2Pair_injective` | **Non-vacuity witness:** explicit injective pairing model satisfying Merkle hypothesis | `propext, Classical.choice, Quot.sound` |
| 45 | `merkle_quarantine_zero_contamination` | Under Merkle binding, 0% forged cells reach Cauchy decoder | `propext` |
| 46 | `merkle_quarantine_preserves_authentic` | Zero false-rejection of authentic cells under arbitrary Byzantine flood | `propext` |
| 47 | `hashBinding_mixed_nonvacuous` | **Non-vacuity witness:** mixed authentic+forged pool filters cleanly | `propext` |
| 48 | `unpinned_quorum_honest_majority` | **Fidelity Gap #2 Closed:** honest majority ($\ge 2$ & unique strict max) wins `electUnpinnedQuorum` | `propext, Quot.sound` |
| 49 | `unpinned_quorum_tie_fail_closed` | Exact multi-root tie fails closed (`none`) in `electUnpinnedQuorum` | `propext, Quot.sound` |
| 50 | `unpinned_quorum_sybil_counterexample` | Explicit counterexample: majority Sybil flood hijacks unpinned quorum (motivates pinned roots) | **None** |
| 51 | `unauthenticated_poisoning_exists` | Counterexample: 1 forged Trojan poisons unauthenticated Cauchy window | `propext, Quot.sound` |

### Module 5 — `XenograftABI.lean` (7 Audited Declarations)
| # | Declaration | Core Formal Guarantee | Axioms |
|---:|---|---|---|
| 52 | `pvm32_ram_bounds_invariant` | Signed `BitVec 32` masked RAM access `(base + offset) &&& 0xFFF#32` is unconditionally $< 4096$ | `propext, Quot.sound` |
| 53 | `pvm32_bounded_termination` | Every organ call terminates in $\le \text{budget}$ steps | `propext, Quot.sound` |
| 54 | `xenograft_preserves_sovereignty` | Any slot with `xenograftable = false` cannot be replaced | `propext` |
| 55 | `xenograft_sovereign_b0_b6_immutable` | Non-vacuous B0 (Kernel) & B6 (Genome) sovereignty even under forged `xenograftable = true` | `propext` |
| 56 | `xenograft_abi_safety` | Xenografts preserve `abiSig` & `bundleId` and reject mismatched donors | `propext, Quot.sound` |
| 57 | `xenograft_improves_amputated_host` | Valid ABI-matched donor restores viability of amputated host slot (`1..5`) | `propext, Quot.sound` |
| 58 | `xenograft_improves_amputated_host_witness` | **Non-vacuity witness:** concrete host+donor restoration instance | `propext, Quot.sound` |

### Module 6 — `QuantumTemporal.lean` (12 Audited Declarations)
| # | Declaration | Core Formal Guarantee | Axioms |
|---:|---|---|---|
| 59 | `pauliX4Q_preserves_normSq4` | Full 4-qubit 16-amplitude complex Pauli-X unitarity ($\forall q \in \mathrm{Fin}\,4$) | `propext, Quot.sound` |
| 60 | `pauliY4Q_preserves_normSq4` | Full 4-qubit 16-amplitude complex Pauli-Y unitarity ($\forall q \in \mathrm{Fin}\,4$) | `propext, Quot.sound` |
| 61 | `pauliZ4Q_preserves_normSq4` | Full 4-qubit 16-amplitude complex Pauli-Z unitarity ($\forall q \in \mathrm{Fin}\,4$) | `propext, Quot.sound` |
| 62 | `hadamardScaled4Q_normSq4` | Full 4-qubit 16-amplitude complex scaled Hadamard $\|\sqrt{2} H_q \psi\|^2 = 2\|\psi\|^2$ | `propext, Quot.sound` |
| 63 | `cnot4Q_preserves_normSq4` | Full 4-qubit 16-amplitude complex CNOT unitarity (all 12 distinct pairs) | `propext, Quot.sound` |
| 64 | `cnot4Q_nonvacuous_witness` | **Non-vacuity witness:** explicit nontrivial Bell-pair entangling action | `propext` |
| 65 | `cz4Q_preserves_normSq4` | Full 4-qubit 16-amplitude complex CZ unitarity (all 16 pairs) | `propext, Quot.sound` |
| 66 | `swap4Q_preserves_normSq4` | Full 4-qubit 16-amplitude complex SWAP unitarity (all 16 pairs) | `propext, Quot.sound` |
| 67 | `temporal_rewind_exact_left_inv` | `chronoRewind (chronoAdvance s) = s` (zero-drift rewind) | `propext, Quot.sound` |
| 68 | `temporal_rewind_exact_right_inv` | `chronoAdvance (chronoRewind s) = s` (exact bijection) | `propext, Quot.sound` |
| 69 | `snapshot_buffer_capacity_and_exact_pop` | Bounded 360-frame snapshot buffer length $\le 360$ & exact lossless pop | `propext` |
| 70 | `combinatorial_1of1_space_exceeds_6_trillion` | Exact reachable 1/1 space `80640 × 3072 × 25920 = 6,421,059,993,600 > 6.4 × 10^{12}` | **None (constructive)** |
