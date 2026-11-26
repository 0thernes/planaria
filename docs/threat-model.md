# Threat Model — PLANARIA (`v2.3.0`)

## Scope & Trust Boundaries

PLANARIA processes **potentially corrupted, truncated, reordered, or maliciously forged `.hbin` byte streams**, compiles untrusted `.plang` source files, executes bytecode inside `PVM-32`, and serves its interactive WebGL2 Studio via a local HTTP server (`server.mjs`).

```text
  [Untrusted Byte Stream / .plang Source / Browser HTTP Request]
         │
         ├── Boundary 1: Cellular Decoder (`src/core/hbin.js`)
         │     • Sync-flood DoS filter (O(1) rejected candidates)
         │     • Inner RS(254,238) tight error ceiling (<=8B/lane)
         │     • Depth-8 domain-separated SHA-256-128 Merkle verification
         │     • Pinned lineage root OR fail-closed unpinned quorum
         │
         ├── Boundary 2: Compiler (`src/compiler/`)
         │     • MAX_PARSE_DEPTH = 128 recursion cap
         │     • Map-based symbol tables (no Object.prototype pollution)
         │     • Scratch register cap (rR <= 17) preventing r18 clobber
         │
         ├── Boundary 3: PVM-32 Runtime (`src/vm/pvm32.js`)
         │     • RAM strictly masked (& 0xFFF -> 4,096 32-bit words)
         │     • Per-organ instruction fuel budget (BUDGET_EXCEEDED trap)
         │     • Bundle 6 (GENOME) never loaded into executable code slots
         │     • Sovereign B0/B6 non-xenograftable; ABI tag match required
         │
         └── Boundary 4: HTTP Studio Server (`server.mjs`)
               • Allowlisted read-only paths + realpath symlink containment
               • TOCTOU-safe openSync/fstatSync
               • Strict CSP, DENY framing, static non-echoing 404/403 bodies
```

## STRIDE Analysis

| Threat Class | Concrete Attack Vector | Mitigation & Code Location | Verification / Proof |
|---|---|---|---|
| **Spoofing** | Forged RS-valid Trojan cells claiming an existing `lineageRootHex` to poison Cauchy MDS inversion | Depth-8 domain-separated (`0x00`/`0x01`) SHA-256-128 Merkle quarantine in `src/core/hbin.js`; 128-bit collision/second-preimage resistance | `Suite 08`, `ByzantineImmune.lean` (`merkle_quarantine_zero_poisoning`), `M01` |
| **Spoofing (Unpinned Sybil)** | Attacker injects majority of RS-valid cells for a rival forged Merkle root when caller does NOT supply `pinnedRootHex` | `electUnpinnedQuorum()` requires `>= 2` cells, unique strict maximum, and fails closed on ties. **Explicitly documented limit:** unpinned decoding CANNOT resist $>50\%$ Byzantine flooding; high-assurance callers MUST supply `pinnedRootHex`. | `Suite 12`, `ByzantineImmune.lean` (`unpinned_quorum_sybil_counterexample`) |
| **Tampering (Overlap-Eclipse)** | Attacker overwrites authentic cells with valid-RS cells from a rival root to eclipse host shards | Quarantine separates lineages; when `pinnedRootHex` is set, rival cells are isolated into `donorGroups` and never mixed into host Cauchy matrix; xenografting requires live host (`bundles[0].viable`) + ABI match + explicit opt-in | `Suite 08`, `Suite 10`, `Suite 26`, `M02` |
| **Tampering (Xenograft Hijack)** | Malicious donor attempts to replace host Kernel (`B0`) or Genome (`B6`), or graft onto a dead host | Sovereign bundles `{0, 6}` are hard-blocked (`XenograftABI.lean: sovereign_bundles_never_xenografted`); live-host gate `bundles[0].viable` enforced; CLI requires `--allow-unpinned-xenograft` | `Suite 10`, `Suite 22`, `Suite 26`, `XenograftABI.lean` |
| **Repudiation** | Unverifiable benchmark numbers or tampered frozen PDFs | Deterministic builds (`artifacts/manifest.json`), `MANIFEST.sha256`, `data/MANIFEST.sha256`, Ed25519 attestation (`results/attestation.json`), GitHub SLSA `attest-build-provenance` | `Suite 24`, `ci.yml`, `release.yml` |
| **Information Disclosure** | Path traversal (`/../package.json`, `%2e%2e`, dotfiles, symlinks) or reflected XSS in `server.mjs` | Canonical `path.resolve` + `fs.realpathSync` prefix containment, dotfile block, explicit allowlist of served directories, static `text/plain` error bodies | `Suite 23` |
| **Denial of Service** | 16 KiB back-to-back `PLN\xB7` sync-flood; deeply nested `.plang` AST; infinite `while` loop in bytecode | O(1) sync-flood bypass (`src/core/hbin.js`), `MAX_PARSE_DEPTH = 128` (`parser.js`), per-organ fuel cap (`pvm32.js`), `projectiles.length <= 240` cap (`game3d.js`) | `Suite 18`, `Suite 20`, `Suite 21`, `Suite 26` |
| **Elevation of Privilege** | Out-of-bounds RAM write in `PVM-32`, prototype pollution via `.plang` identifiers (`constructor`/`__proto__`), or scratch overflow clobbering locals | `& 0xFFF` RAM mask (`pvm32.js`), `Map`-based symbol tables (`codegen.js`), `rR > 17` overflow error (`codegen.js`) | `Suite 26`, `XenograftABI.lean` (`pvm32_ram_address_bounded`), `M06`, `M07` |

## Explicit Out-of-Scope Threats

- **Confidentiality / Encryption:** `.hbin` provides integrity and erasure resilience, NOT confidentiality; payloads are readable by any holder of $k$ shards.
- **Public Internet Exposure of `server.mjs`:** `server.mjs` has no TLS termination, rate limiter, or authentication; it is intended for localhost (`127.0.0.1`) or static GitHub Pages hosting.
- **Physical Side Channels:** The JavaScript SHA-256 and $\mathrm{GF}(2^8)$ lookup tables are designed for deterministic portability, not constant-time resistance against local hardware cache-timing attackers.
