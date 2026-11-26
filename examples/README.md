# PLANARIA Runnable Examples

Three self-contained, zero-dependency Node.js (`>=20`) examples demonstrating the core PLANARIA `.hbin` protocol primitives.

| Example | What It Demonstrates | Run Command |
| :--- | :--- | :--- |
| [01-mitosis-roundtrip.mjs](01-mitosis-roundtrip.mjs) | Compile `aegis_drift.plang` → unaligned 50/50 prime-offset bisection (byte 49,177) → zero-overlap bit-exact SHA-256 regeneration of BOTH halves | `node examples/01-mitosis-roundtrip.mjs` |
| [02-byzantine-quarantine.mjs](02-byzantine-quarantine.mjs) | Inject 36 RS-valid forged Byzantine Trojan cells → verify 100% Merkle Immune quarantine + bit-exact regeneration | `node examples/02-byzantine-quarantine.mjs` |
| [03-xenograft-chimera.mjs](03-xenograft-chimera.mjs) | Amputate `AEGIS_DRIFT` S2 Renderer & Synth → splice `SYNTH_REACTOR` donor organs via ABI-verified Cross-Species Xenograft → execute 30 live PVM-32 frames with 0 traps | `node examples/03-xenograft-chimera.mjs` |
