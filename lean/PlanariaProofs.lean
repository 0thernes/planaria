import PlanariaProofs.GF256
import PlanariaProofs.MitosisBounds
import PlanariaProofs.StratumAnastomosis
import PlanariaProofs.ByzantineImmune
import PlanariaProofs.XenograftABI
import PlanariaProofs.QuantumTemporal

/-!
# PLANARIA Formal Verification Audit Entrypoint

Audits every core theorem across all five modules to verify:
  - Zero `sorryAx`
  - Zero custom axioms (only standard Lean 4 kernel axioms `propext`, `Quot.sound`, `Classical.choice` / `Lean.ofReduceBool` if applicable; we avoid `native_decide` so NOT EVEN `Lean.trustCompiler` is used!)
-/

#print axioms Planaria.GF256.gfAdd_comm
#print axioms Planaria.GF256.gfAdd_self
#print axioms Planaria.GF256.gfMul_zero_right
#print axioms Planaria.GF256.gfMul_one_right
#print axioms Planaria.GF256.gfMul_inv_exact
#print axioms Planaria.GF256.gfMul_comm_sample_verified
#print axioms Planaria.GF256.gf_cauchy2_nonzero_det
#print axioms Planaria.GF256.cauchy2_exact_roundtrip

#print axioms Planaria.Mitosis.mitosis_exact_sufficient
#print axioms Planaria.Mitosis.mitosis_strict_impossibility
#print axioms Planaria.Mitosis.mitosis_unaligned_cut_guarantee
#print axioms Planaria.Mitosis.planaria_all_7_bundles_mitosis_safe
#print axioms Planaria.Mitosis.planaria_total_cells_exact
#print axioms Planaria.Mitosis.pigeonhole_two_way
#print axioms Planaria.Mitosis.trisection_synergy_recovery

#print axioms Planaria.Anastomosis.anastomosis_zero_crash_safety
#print axioms Planaria.Anastomosis.anastomosis_monotonicity
#print axioms Planaria.Anastomosis.fusion_dominates_parents
#print axioms Planaria.Anastomosis.fusion_strict_synergy_exists
#print axioms Planaria.Anastomosis.zero_cliff_strict_separation

#print axioms Planaria.Byzantine.rs254_238_unique_decoding_radius
#print axioms Planaria.Byzantine.rs_unique_correction_ball_disjoint
#print axioms Planaria.Byzantine.interleaved_burst_16_even_odd_bound
#print axioms Planaria.Byzantine.merkle_quarantine_zero_contamination
#print axioms Planaria.Byzantine.merkle_quarantine_preserves_authentic
#print axioms Planaria.Byzantine.unauthenticated_poisoning_exists

#print axioms Planaria.Xenograft.pvm32_ram_bounds_invariant
#print axioms Planaria.Xenograft.pvm32_bounded_termination
#print axioms Planaria.Xenograft.xenograft_preserves_sovereignty
#print axioms Planaria.Xenograft.xenograft_abi_safety
#print axioms Planaria.Xenograft.xenograft_improves_amputated_host

#print axioms Planaria.QuantumTemporal.pauliX_preserves_normSq
#print axioms Planaria.QuantumTemporal.pauliZ_preserves_normSq
#print axioms Planaria.QuantumTemporal.cnot_preserves_normSq
#print axioms Planaria.QuantumTemporal.hadamard_scaled_normSq
#print axioms Planaria.QuantumTemporal.temporal_rewind_exact_left_inv
#print axioms Planaria.QuantumTemporal.temporal_rewind_exact_right_inv
#print axioms Planaria.QuantumTemporal.combinatorial_1of1_space_exceeds_6_trillion
