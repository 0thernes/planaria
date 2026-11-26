# Configuration Reference (`v2.4.0`)

PLANARIA requires **zero secrets, zero API keys, and zero external configuration files** to build, test, fuzz, benchmark, or run the interactive Studio. All runtime configuration is optional and documented below alongside [`.env.example`](../.env.example).

## Environment Variables

| Variable | Component | Default | Allowed Values / Range | Effect |
|---|---|---|---|---|
| `HOST` | `server.mjs` | `127.0.0.1` | Any local IPv4/IPv6 bind address | Interface on which `server.mjs` listens. Keep `127.0.0.1` for local workstation safety; do not expose directly to the public internet without a reverse proxy. |
| `PORT` | `server.mjs` | `4174` | `0` or `1..65535` (`0` = OS ephemeral port) | TCP listen port for the Surgical Vivisection Studio, `/blueprint/`, and `/healthz` endpoint. |
| `PLANARIA_SIGNING_KEY_PEM` | `scripts/benchmark.mjs` | *(unset -> ephemeral key)* | PKCS#8 Ed25519 private key PEM | When set, signs `results/attestation.json` with a persistent key (`signatureMode: "persistent-key"`); when unset, generates an explicitly labeled `ephemeral-self-consistency-seal`. |

## CLI Flags (`bin/planaria.mjs`)

All input files are capped at `16 MiB` (`readBoundedFile`) and all output flags enforce distinct paths from input files (`assertDistinctOutput`).

| Subcommand | Exact Flags & Defaults | Notes |
|---|---|---|
| `compile <in.plang> -o <out.hbin>` | `-o <path>` (required) | Compiles a `.plang` organism deterministically into a `98,304`-byte `.hbin` binary. |
| `inspect <file.hbin>` | `--pin-root <hex32>`, `--xenograft`, `--allow-unpinned-xenograft`, `--no-immune` | Decodes, quarantines Byzantine cells, and prints stratum viability, Merkle root, and regeneration status. |
| `run <file.hbin>` | `--frames <N>` (default `60`), `--seed <int>` (default `2026`), `--pin-root <hex32>`, `--xenograft`, `--allow-unpinned-xenograft` | Boots the organism in `PVM-32`. Exits `2` if non-bootable, `3` if any VM trap occurs. |
| `bisect <in.hbin> <L> <R>` | `--offset <bytes>` (default `49152`) | Performs zero-overlap spatial bisection (supports arbitrary prime/unaligned byte offsets). |
| `fuse <A> <B> -o <out>` | `--gap <bytes>` (default `0`), `--seed <int>` | Concatenates arbitrary byte shards with optional garbage gap padding. |
| `heal <in.hbin> -o <out>` | `--pin-root <hex32>`, `--xenograft`, `--allow-unpinned-xenograft`, `--allow-partial`, `--name <str>` | Regenerates a canonical `98,304`-byte `.hbin` (requires full 7-bundle viability unless `--allow-partial` is passed). |
| `damage <in.hbin> -o <out>` | `--shred <0..1>`, `--bitrot <0..64>`, `--burst`, `--include-sync`, `--amputate <b1,b2>`, `--trojans <N>`, `--shift <N>`, `--shuffle`, `--seed <int>` | Deterministic fault injection for falsification experiments. |
| `xenograft <host> <donor> -o <out>` | `--amputate <b1,b2,...>` (bundles `0` and `6` forbidden), `--allow-unpinned-xenograft`, `--allow-partial`, `--name <str>` | Amputates non-sovereign host organs and performs ABI-checked cross-species grafting. |
| `disasm <file.hbin>` | `--bundle <0..6>` (default `0`), `--pin-root <hex32>` | Disassembles executable `PVM-32` bundles or prints decoded Bundle 6 Genome metadata. |

## Verification, Fuzzing & Build Script Options

| Command | Flags | Behavior |
|---|---|---|
| `node scripts/benchmark.mjs` | `--attest-only` | Re-computes SHA-256 digests and refreshes `results/attestation.json` without re-running the 25-point Monte Carlo sweep. |
| `node scripts/check-citations.mjs` | `--live` | Verifies citation parity offline; `--live` queries Crossref REST API for every DOI & checks retraction status, writing `results/citation-audit.json`. |
| `node scripts/fuzz.mjs` | *(none)* | Runs 2,000 deterministic seeded adversarial fuzz cases (`decodeHbin`, `compilePlangToHbin`, `RS`, `PVM32`). |
| `python3 reference/planaria_oracle.py` | *(none)* | Runs the clean-room Python 3 cross-language differential oracle on all 4 `.hbin` artifacts + 4-qubit CHSH/Mermin. |
| `node scripts/build-blueprint.mjs` | *(none)* | Generates `blueprint/blueprint.json`, `index.html`, `blueprint.css`, and `blueprint.js`. |
| `node scripts/build-pages.mjs` | *(none)* | Stages subpath-safe static Studio + Blueprint bundle into `_site/` for GitHub Pages. |
| `node scripts/gen-manifest.mjs` | *(none)* | Rebuilds `MANIFEST.sha256` and `data/MANIFEST.sha256`. |

## Compiler & VM Hard-Coded Safety Limits

| Limit | Value | Location | Purpose |
|---|---|---|---|
| `TOTAL_HBIN_BYTES` | `98,304` (`192 × 512` B) | `src/core/hbin.js` | Fixed canonical organism size |
| `MAX_PARSE_DEPTH` / `MAX_AST_DEPTH` | `128` / `256` | `src/compiler/parser.js`, `codegen.js` | Prevents stack overflow on adversarial nested ASTs, `else if`, `?:`, and flat sums |
| Register windowing | `r0=0`, `r1..r7` ABI, `r8..r17` scratch (`rR <= 17`), `r18..r31` locals | `src/compiler/codegen.js` | Prevents expression evaluation from clobbering locals `r18..r31` |
| `PVM-32` RAM mask | `addr & 0xFFF` (`4,096` words) | `src/vm/pvm32.js` | Total memory isolation; out-of-bounds access wraps deterministically |
| Frame instruction budget | `16,000` instructions/frame (`maxInsnBudget`) + proportional blitter fuel | `src/vm/pvm32.js` | Halts infinite loops and blitter DoS with `BUDGET_EXCEEDED` trap & transactional RAM rollback |
| HTTP server methods | `GET` / `HEAD` only | `server.mjs` | Rejects `POST`/`PUT`/`DELETE` with HTTP `405` |

## Studio Accessibility & Motion Settings

- **Reduced Motion:** Automatically honors browser `prefers-reduced-motion: reduce`; also toggleable live via the header **Motion** button (`#btnMotion`, `aria-pressed`) without reloading.
- **Keyboard Navigation:** Skip-to-main link, Arrow keys / `Home` / `End` switch WAI-ARIA tabs, `Arrow`/`Delete` keys inspect/excise cells on `#canvasTissue`, `J`/`L`/`I`/`K`/`+`/`-` orbit/zoom the 3D WebGL2 camera, and `WASD`/`Q`/`E`/`R`/`V`/`X`/`F` control gameplay using layout-independent `KeyboardEvent.code`.
