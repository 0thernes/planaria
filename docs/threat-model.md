# Threat Model — PLANARIA (`v2.4.0`)

## Scope & Trust Boundaries

PLANARIA processes **potentially corrupted, truncated, reordered, or maliciously forged `.hbin` byte streams**, compiles untrusted `.plang` source files, executes bytecode inside `PVM-32`, and serves its interactive WebGL2 Studio and Proof Blueprint via a local HTTP server (`server.mjs`).

```text
  [Untrusted Byte Stream / .plang Source / Browser HTTP Request]
         │
         ├── Boundary 1: Cellular Decoder (`src/core/hbin.js`)
         │     • Sliding-window fuzzy dense-flood DoS filter (exact & 1-bit/stride-5 floods)
         │     • Scan caps: maxInputBytes (8 MiB), maxSyncCandidates (32,768), maxRsFailures (16,384)
         │     • Inner RS(254,238) tight error ceiling (<=8 B/lane, 16 B burst)
         │     • Depth-8 domain-separated SHA-256-128 Merkle verification (0x00 / 0x01 / 0x02||"PLN\0")
         │     • Pinned lineage root OR fail-closed unpinned quorum (>=2 cells, unique max, tie -> null)
         │
         ├── Boundary 2: Compiler (`src/compiler/`)
         │     • MAX_PARSE_DEPTH = 128 (blocks, else-if, ternaries) & MAX_AST_DEPTH = 256 (iterative containsCall)
         │     • Map-based symbol tables (no Object.prototype pollution); built-in constants & KERNEL/GENOME protected
         │     • Scratch register cap (rR <= 17) preventing r18..r31 clobber
         │
         ├── Boundary 3: PVM-32 Runtime (`src/vm/pvm32.js`)
         │     • RAM strictly masked (& 0xFFF -> 4,096 32-bit words)
         │     • Bounded frame fuel (16,000 insns default) + proportional blitter fuel (GLOW 128, CLEAR 64)
         │     • Transactional RAM & voice rollback on trapped organ fallback
         │     • Bundle 6 (GENOME) never loaded into executable code slots
         │     • Sovereign B0/B6 non-xenograftable; dead-host graft refusal; host ABI signature match required
         │
         └── Boundary 4: HTTP Studio Server (`server.mjs`)
               • Allowlisted read-only directories (`src`, `programs`, `artifacts`, `results`, `blueprint`)
               • Canonical realpath symlink containment + forbidden-segment check (`..`, dotfiles, `\`, `\0`, `:`)
               • TOCTOU-safe openSync/fstatSync + strict CSP + X-Frame-Options: DENY + non-echoing 404/403
```

## STRIDE Analysis

| Threat Class | Concrete Attack Vector | Mitigation & Code Location | Verification / Proof |
|---|---|---|---|
| **Spoofing** | Forged RS-valid Trojan cells claiming an existing `lineageRootHex` to poison Cauchy MDS inversion | Depth-8 domain-separated (`0x00`/`0x01`/`0x02 \|\| "PLN\0"`) SHA-256-128 Merkle quarantine in `src/core/hbin.js`; **128-bit second-preimage resistance** and **64-bit birthday collision resistance** | `Suite 08`, `Planaria.Byzantine.merkle_quarantine_zero_contamination`, `Planaria.Byzantine.merkle_path_collision_free_binding`, `M01` |
| **Spoofing (Unpinned Sybil)** | Attacker injects majority of RS-valid cells for a rival forged Merkle root when caller does NOT supply `pinnedRootHex` | `electUnpinnedQuorum()` requires `>= 2` unique cells, unique strict maximum, and fails closed on ties (`none`). **Explicitly documented limit:** unpinned decoding CANNOT resist $>50\%$ Byzantine flooding; high-assurance callers MUST supply `pinnedRootHex`. | `Suite 12`, `Suite 26`, `Planaria.Byzantine.unpinned_quorum_honest_majority`, `Planaria.Byzantine.unpinned_quorum_tie_fail_closed`, `Planaria.Byzantine.unpinned_quorum_sybil_counterexample` |
| **Tampering (Overlap-Eclipse)** | Attacker injects a bogus `PLN\xB7` sync word 1–511 bytes immediately before an authentic cell to trick naive `+512` stride scanners into skipping and eclipsing the real cell | Byte-granular sliding-window scan with ±512 B cadence flywheel fallback (`src/core/hbin.js`) recovers the eclipsed authentic cell and quarantines the forged cell | `Suite 08`, `Suite 18`, `M03` |
| **Tampering (Xenograft Hijack)** | Malicious donor attempts to replace host Kernel (`B0`) or Genome (`B6`), graft onto a dead host, or inject an ABI-mismatched bundle | Sovereign bundles `{0, 6}` are hard-blocked (`Planaria.Xenograft.xenograft_sovereign_b0_b6_immutable`); live-host gate `bundles[0].viable` enforced (`Planaria.Xenograft.xenograft_dead_host_refused`); surviving sub-threshold host cells lock `abiSig`; CLI requires `--allow-unpinned-xenograft` | `Suite 10`, `Suite 22`, `Suite 26`, `Planaria.Xenograft.xenograft_abi_safety`, `M02` |
| **Repudiation** | Unverifiable benchmark numbers, tampered PDFs, or tampered Lean specifications | Deterministic builds (`artifacts/manifest.json`), `MANIFEST.sha256`, `data/MANIFEST.sha256`, Ed25519 attestation (`results/attestation.json`), GitHub SLSA `attest-build-provenance`, 6-kernel `lake comparator --paranoid` + negative tamper CI check | `Suite 24`, `Suite 30`, `ci.yml`, `release.yml` |
| **Information Disclosure** | Path traversal (`/../package.json`, `%2e%2e`, `\`, `\0`, `:`, dotfiles, symlinks) or reflected XSS in `server.mjs` | Canonical `path.resolve` + `fs.realpathSync` prefix containment, `hasForbiddenSegment`, allowlisted public roots, static `text/plain` error bodies | `Suite 23`, `M11` |
| **Denial of Service** | Exact or 1-bit-flipped stride-5 `PLN\xB7` sync-flood; deep `else if` / `?:` / 20k-`+` `.plang` AST; `GLOW`/`CLEAR` blitter loop or infinite `while` loop in bytecode | Sliding-window fuzzy dense-flood bypass (`src/core/hbin.js`), `MAX_PARSE_DEPTH = 128` + `MAX_AST_DEPTH = 256` (`parser.js`, `codegen.js`), proportional blitter fuel & per-frame cap (`pvm32.js`), `projectiles.length <= 240` cap (`game3d.js`), `16 MiB` CLI file cap (`bin/planaria.mjs`) | `Suite 18`, `Suite 20`, `Suite 21`, `Suite 26`, `scripts/fuzz.mjs` (2,000 cases) |
| **Elevation of Privilege** | Out-of-bounds RAM write in `PVM-32`, prototype pollution via `.plang` identifiers (`constructor`/`__proto__`), or scratch overflow clobbering locals | `& 0xFFF` RAM mask (`pvm32.js`), `Map`-based symbol tables (`codegen.js`), `rR > 17` overflow error (`codegen.js`), transactional RAM rollback on organ trap | `Suite 26`, `Planaria.Xenograft.pvm32_ram_bounds_invariant`, `M06`, `M07` |

## Explicit Out-of-Scope Threats

- **Confidentiality / Encryption:** `.hbin` provides integrity and erasure resilience, NOT confidentiality; payloads are readable by any holder of $k$ shards.
- **Public Internet Exposure of `server.mjs`:** `server.mjs` has no TLS termination, rate limiter, or authentication; it is intended for localhost (`127.0.0.1`) or static GitHub Pages hosting.
- **Physical Side Channels:** The JavaScript SHA-256 and $\mathrm{GF}(2^8)$ lookup tables are designed for deterministic portability, not constant-time resistance against local hardware cache-timing attackers.
