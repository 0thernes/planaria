# PLANARIA Pure Lean 4.35.0 Multi-Kernel Formal Proof Library (`v2.4.0`)

**Toolchain:** `leanprover/lean4:v4.35.0` (`module` system across ALL 12 `.lean` files, **`autoImplicit = false`**, **`relaxedAutoImplicit = false`**, core Lean 4 only — **zero Mathlib**, **zero errors/warnings**, **zero `sorryAx`**, **zero `native_decide` / `Lean.ofReduceBool` / `Lean.trustCompiler` / `_native`**, **zero custom axioms**).  
**Standalone Palomar Spec & Solution:** [`PlanariaProofs/Spec.lean`](PlanariaProofs/Spec.lean) (pure shared definitions, 0 proofs, 0 `sorry`) · [`Challenge.lean`](Challenge.lean) (0 proof imports, 85 theorem specs) · [`Solution.lean`](Solution.lean) (0 `sorry`) · [`VerifyAxioms.lean`](VerifyAxioms.lean) (`module` header) · [`comparator.json`](comparator.json) · [`../formalization.yaml`](../formalization.yaml).  
**Interactive Blueprint & Audit Logs:** [`../blueprint/index.html`](../blueprint/index.html) (`../blueprint/blueprint.json`) · [`../results/lean4-audit.txt`](../results/lean4-audit.txt) (85 lines, pure Unix LF, 15 zero-axiom pure-kernel proofs) · [`../results/lean4-multi-kernel.txt`](../results/lean4-multi-kernel.txt) (6 independent kernels).

## Quick Verification

```bash
cd lean
lake build
lake build Challenge
lake env lean VerifyAxioms.lean
lake env leanchecker --fresh Solution
lake env leanchecker-paranoid --fresh Solution
# Full 6-kernel sandboxed verification + Challenge/Solution comparator (Linux with bubblewrap):
lake check --paranoid
lake comparator --config comparator.json --paranoid
```

---

## Complete 85-Theorem Catalog (`v2.4.0` — 7 Pure Modules)

### Module 1 — `GF256.lean` (16 Audited Declarations)
| # | Declaration | Core Formal Guarantee | Axioms |
|---:|---|---|---|
| 1–12 | `gfAdd_comm` .. `cauchy2_exact_roundtrip` | Complete $\mathrm{GF}(2^8)$ mod `0x11D` field laws: all 65,536 comm pairs, all 16,777,216 assoc triples, all 255 inverses, concrete roundtrips | `propext` / standard 3 |
| 13 | `gf_cauchy2_nonzero_det` | **Universal Theorem I:** 2×2 Cauchy determinant $\neq 0$ over **ALL** char-2 fields | **None (0)** |
| 14 | `cauchy2_exact_decode` | **Universal Cauchy 2×2 Decoding:** `decode(encode(d0, d1)) = (d0, d1)` over ANY `Char2Field` | **None (0)** |
| 15 | `gf256_cauchy2_exact_decode` | Concrete instantiation on `gf256Field : Char2Field (Fin 256)` for ALL `(x0, x1, d0, d1)` | standard 3 |
| 16 | `gf256_cauchy2_nonvacuous_witness` | **Non-vacuity witness:** explicit distinct coordinates & nontrivial decode roundtrip | standard 3 |

### Module 2 — `MitosisBounds.lean` (14 Audited Declarations)
| # | Declaration | Core Formal Guarantee | Axioms |
|---:|---|---|---|
| 17–19 | `mitosis_exact_sufficient`, `mitosis_strict_impossibility`, **`mitosis_strict_impossibility_witness`** | Tight iff mitosis bounds ($N \ge 2k$ / $N < 2k$) + explicit non-vacuity witness (`N=3, k=2`) | `propext, Quot.sound` / standard 3 |
| 20–24 | `mitosis_unaligned_cut_guarantee`, `planaria_all_7_bundles_mitosis_safe`, `planaria_total_cells_exact`, `planaria_schedule_exact_halves`, `planaria_schedule_nodup_and_sorted_halves` | Unaligned margin $N \ge 2k+2$, exact 192-cell integer `PLACEMENT_SCHEDULE` true `List.Nodup` + sorted half split `< 3360 <` | **None (0)** / `propext, Quot.sound` |
| 25–30 | `planaria_cell_byte_budget_exact`, `planaria_cauchy_coord_disjoint`, `planaria_payload_capacity_exact`, `pigeonhole_two_way`, **`pigeonhole_two_way_witness`**, `trisection_synergy_recovery` | Exact 512 B / 15,936 B budgets, disjoint Cauchy coords, two-way pigeonhole + witness, Bundle 5 `(13,13,14)` trisection synergy | **None (0)** / standard 3 |

### Module 3 — `StratumAnastomosis.lean` (8 Audited Declarations)
| # | Declaration | Core Formal Guarantee | Axioms |
|---:|---|---|---|
| 31–34 | `anastomosis_zero_crash_safety`, `resolveOrgan_zero_crash_safety`, `anastomosis_monotonicity`, **`anastomosis_monotonicity_witness`** | Zero-crash safety ($b_0 \ge 2$), B0/B6 dispatch exclusion, monotonicity + concrete rank upgrade witness | `propext, Quot.sound` |
| 35–38 | `fusion_dominates_parents`, `fusion_strict_synergy_exists`, `zero_cliff_strict_separation`, `viability_s3_without_b2_matches_hbin` | Fusion dominance & strict synergy, separation vs. BOTH `RS(40,16)` and equal-storage `RS(192,48)`, bit-exact `hbin.js` Step 4 match | **None (0)** / standard 3 |

### Module 4 — `ByzantineImmune.lean` (18 Audited Declarations)
| # | Declaration | Core Formal Guarantee | Axioms |
|---:|---|---|---|
| 39–42 | `hammingDist_triangle`, `rs254_238_unique_decoding_radius`, `rs_unique_correction_ball_disjoint`, **`rs_unique_correction_ball_nonvacuous`** | Byte-list Hamming metric triangle, $d_{\min}=17, t=8$ disjoint decoding balls + concrete 17-byte witness | standard 3 |
| 43–46 | `rs_interleaved_lane_geometry`, `interleaved_burst_16_even_odd_bound`, `interleaved_burst_17_exceeds_radius`, `interleaved_burst_18_both_lanes_exceed` | Exact 508 B lane geometry, 16 B burst guarantee, tight negative 17 B / 18 B lower bounds | standard 3 |
| 47–51 | **`merkle_path_collision_free_binding` (strengthened dual-path)**, `pow2Pair_injective`, `merkle_quarantine_zero_contamination`, `merkle_quarantine_preserves_authentic`, `hashBinding_mixed_nonvacuous` | Full dual-path commitment (`leaf1 = leaf2 ∧ path1 = path2`) under injective `hashPair`, 0% contamination, 100% authentic preservation + witnesses | `propext` / standard 3 |
| 52–56 | **`unpinned_quorum_honest_majority` (arbitrary position)**, **`unpinned_quorum_honest_majority_witness`**, **`unpinned_quorum_tie_fail_closed` (arbitrary list)**, `unpinned_quorum_sybil_counterexample`, `unauthenticated_poisoning_exists` | Order-independent majority election at ANY list index, arbitrary-list fail-closed ties, Sybil counterexample & unauthenticated poisoning counterexample | **None (0)** / `propext, Quot.sound` |

### Module 5 — `XenograftABI.lean` (9 Audited Declarations)
| # | Declaration | Core Formal Guarantee | Axioms |
|---:|---|---|---|
| 57–63 | `pvm32_ram_bounds_invariant`, `pvm32_bounded_termination`, `xenograft_preserves_sovereignty`, `xenograft_sovereign_b0_b6_immutable`, `xenograft_abi_safety`, `xenograft_improves_amputated_host`, `xenograft_improves_amputated_host_witness` | Signed `BitVec 32` `< 4096` RAM mask, bounded fuel, non-vacuous B0/B6 sovereignty, ABI equality, therapeutic restoration + witness | `propext` / `propext, Quot.sound` |
| 64–65 | **`xenograft_dead_host_refused`**, **`xenograft_dead_host_witness`** | Dead-host refusal (`applyXenograftWithStem false host donor = host`), directly formalizing `hbin.js` Step 3 `bundles[0].viable` gate | **None (0)** |

### Module 6 — `QuantumTemporal.lean` (12 Audited Declarations)
| # | Declaration | Core Formal Guarantee | Axioms |
|---:|---|---|---|
| 66–77 | `pauliX4Q`..`swap4Q_preserves_normSq4`, `cnot4Q_nonvacuous_witness`, `temporal_rewind_exact_left_inv`, `temporal_rewind_exact_right_inv`, `snapshot_buffer_capacity_and_exact_pop`, `combinatorial_1of1_space_exceeds_6_trillion` | Full 4-qubit 16-amplitude complex unitarity across 7 gates, exact bijective rewind, 360-frame bounded buffer, exact `6,421,059,993,600` reachable build space | **None (0)** / `propext, Quot.sound` |

### Module 7 — `AdversarialTests.lean` (8 Formal False-Variant Refutations — Playbook #12)
| # | Declaration | Deliberately False Variant Formally Refuted (`¬ P`) | Axioms |
|---:|---|---|---|
| 78 | `refute_mitosis_below_2k` | Weakening mitosis threshold from $N \ge 2k$ to $N \ge 2k - 1$ | `propext, Quot.sound` |
| 79 | `refute_unaligned_cut_without_margin` | Dropping $+2$ unaligned boundary margin from $N \ge 2k + 2$ | `propext, Quot.sound` |
| 80 | `refute_interleaved_burst_17_safe` | Claiming 17-byte contiguous bursts stay within radius $t = 8$ | standard 3 |
| 81 | `refute_anastomosis_dead_stem_safe` | Removing $b_0 \ge 2$ stem-viability precondition from `resolveRenderer` | **None (0)** |
| 82 | `refute_unpinned_quorum_tie_elects` | Claiming tied unpinned root buckets elect any winner | `propext, Quot.sound` |
| 83 | `refute_xenograft_replaces_b0` | Claiming any donor can ever transplant sovereign Bundle 0 (`KERNEL`) | `propext` |
| 84 | `refute_hadamard_preserves_unscaled_norm` | Claiming unscaled integer Hadamard preserves `normSq4` (without $\times 2$) | `propext, Quot.sound` |
| 85 | `refute_gf256_zero_invertible` | Dropping $1 \le a$ precondition on $\mathrm{GF}(2^8)$ multiplicative inverse | `propext, Quot.sound` |
