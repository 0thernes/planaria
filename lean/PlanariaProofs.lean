module

public import PlanariaProofs.GF256
public import PlanariaProofs.MitosisBounds
public import PlanariaProofs.StratumAnastomosis
public import PlanariaProofs.ByzantineImmune
public import PlanariaProofs.XenograftABI
public import PlanariaProofs.QuantumTemporal

/-!
# PLANARIA v2.3 Formal Verification Audit Entrypoint

Audits every core theorem and non-vacuity witness across ALL SIX pure Lean 4.35.0
`module` files (zero Mathlib, zero `sorry`, zero `native_decide` / `Lean.ofReduceBool` /
`Lean.trustCompiler`) verifying that EVERY theorem depends ONLY on standard Lean 4 kernel
axioms `[propext, Classical.choice, Quot.sound]`.
-/

-- Module 1: GF(2^8) Concrete Field, Universal Cauchy 2x2 Decoding & Non-Vacuity Witness (16 audited theorems)
#print axioms Planaria.GF256.gfAdd_comm
#print axioms Planaria.GF256.gfAdd_self
#print axioms Planaria.GF256.gfAdd_assoc
#print axioms Planaria.GF256.xtime_xor
#print axioms Planaria.GF256.gfMul_lt_256
#print axioms Planaria.GF256.gfMul_zero_right
#print axioms Planaria.GF256.gfMul_one_right
#print axioms Planaria.GF256.gfMul_comm
#print axioms Planaria.GF256.gfMul_assoc
#print axioms Planaria.GF256.gfMul_add_right
#print axioms Planaria.GF256.gfMul_inv_exact
#print axioms Planaria.GF256.cauchy2_exact_roundtrip
#print axioms Planaria.GF256.gf_cauchy2_nonzero_det
#print axioms Planaria.GF256.cauchy2_exact_decode
#print axioms Planaria.GF256.gf256_cauchy2_exact_decode
#print axioms Planaria.GF256.gf256_cauchy2_nonvacuous_witness

-- Module 2: Mitosis Bounds, Integer Placement Schedule (True Nodup + Sorted Halves) & Byte Budgets (12 audited theorems)
#print axioms Planaria.Mitosis.mitosis_exact_sufficient
#print axioms Planaria.Mitosis.mitosis_strict_impossibility
#print axioms Planaria.Mitosis.mitosis_unaligned_cut_guarantee
#print axioms Planaria.Mitosis.planaria_all_7_bundles_mitosis_safe
#print axioms Planaria.Mitosis.planaria_total_cells_exact
#print axioms Planaria.Mitosis.planaria_schedule_exact_halves
#print axioms Planaria.Mitosis.planaria_schedule_nodup_and_sorted_halves
#print axioms Planaria.Mitosis.planaria_cell_byte_budget_exact
#print axioms Planaria.Mitosis.planaria_cauchy_coord_disjoint
#print axioms Planaria.Mitosis.planaria_payload_capacity_exact
#print axioms Planaria.Mitosis.pigeonhole_two_way
#print axioms Planaria.Mitosis.trisection_synergy_recovery

-- Module 3: 4-Stratum Lattice (Bit-Exact hbin.js Fidelity), 6-Organ Anastomosis & Zero-Cliff Separation (7 audited theorems)
#print axioms Planaria.Anastomosis.anastomosis_zero_crash_safety
#print axioms Planaria.Anastomosis.resolveOrgan_zero_crash_safety
#print axioms Planaria.Anastomosis.anastomosis_monotonicity
#print axioms Planaria.Anastomosis.fusion_dominates_parents
#print axioms Planaria.Anastomosis.fusion_strict_synergy_exists
#print axioms Planaria.Anastomosis.zero_cliff_strict_separation
#print axioms Planaria.Anastomosis.viability_s3_without_b2_matches_hbin

-- Module 4: Byte-List Hamming, Tight Burst Bounds, Merkle, Executable Quorum & Witnesses (16 audited theorems)
#print axioms Planaria.Byzantine.hammingDist_triangle
#print axioms Planaria.Byzantine.rs254_238_unique_decoding_radius
#print axioms Planaria.Byzantine.rs_unique_correction_ball_disjoint
#print axioms Planaria.Byzantine.rs_interleaved_lane_geometry
#print axioms Planaria.Byzantine.interleaved_burst_16_even_odd_bound
#print axioms Planaria.Byzantine.interleaved_burst_17_exceeds_radius
#print axioms Planaria.Byzantine.interleaved_burst_18_both_lanes_exceed
#print axioms Planaria.Byzantine.merkle_path_collision_free_binding
#print axioms Planaria.Byzantine.pow2Pair_injective
#print axioms Planaria.Byzantine.merkle_quarantine_zero_contamination
#print axioms Planaria.Byzantine.merkle_quarantine_preserves_authentic
#print axioms Planaria.Byzantine.hashBinding_mixed_nonvacuous
#print axioms Planaria.Byzantine.unpinned_quorum_honest_majority
#print axioms Planaria.Byzantine.unpinned_quorum_tie_fail_closed
#print axioms Planaria.Byzantine.unpinned_quorum_sybil_counterexample
#print axioms Planaria.Byzantine.unauthenticated_poisoning_exists

-- Module 5: BitVec 32 Sandboxing, Bounded Fuel, B0/B6 Sovereignty & Witness (7 audited theorems)
#print axioms Planaria.Xenograft.pvm32_ram_bounds_invariant
#print axioms Planaria.Xenograft.pvm32_bounded_termination
#print axioms Planaria.Xenograft.xenograft_preserves_sovereignty
#print axioms Planaria.Xenograft.xenograft_sovereign_b0_b6_immutable
#print axioms Planaria.Xenograft.xenograft_abi_safety
#print axioms Planaria.Xenograft.xenograft_improves_amputated_host
#print axioms Planaria.Xenograft.xenograft_improves_amputated_host_witness

-- Module 6: Full 4-Qubit Complex Unitarity, 360-Frame Rewind, 6.42T Space & Witness (12 audited theorems)
#print axioms Planaria.QuantumTemporal.pauliX4Q_preserves_normSq4
#print axioms Planaria.QuantumTemporal.pauliY4Q_preserves_normSq4
#print axioms Planaria.QuantumTemporal.pauliZ4Q_preserves_normSq4
#print axioms Planaria.QuantumTemporal.hadamardScaled4Q_normSq4
#print axioms Planaria.QuantumTemporal.cnot4Q_preserves_normSq4
#print axioms Planaria.QuantumTemporal.cnot4Q_nonvacuous_witness
#print axioms Planaria.QuantumTemporal.cz4Q_preserves_normSq4
#print axioms Planaria.QuantumTemporal.swap4Q_preserves_normSq4
#print axioms Planaria.QuantumTemporal.temporal_rewind_exact_left_inv
#print axioms Planaria.QuantumTemporal.temporal_rewind_exact_right_inv
#print axioms Planaria.QuantumTemporal.snapshot_buffer_capacity_and_exact_pop
#print axioms Planaria.QuantumTemporal.combinatorial_1of1_space_exceeds_6_trillion
