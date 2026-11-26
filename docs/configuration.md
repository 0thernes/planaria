# Configuration Reference (`v2.3.0`)

PLANARIA requires **zero secrets, zero API keys, and zero external configuration files** to build, test, benchmark, or run the interactive Studio. All runtime configuration is optional and documented below alongside [`.env.example`](../.env.example).

## Environment Variables (`server.mjs`)

| Variable | Default | Allowed Values / Range | Effect |
|---|---|---|---|
| `HOST` | `127.0.0.1` | Any local IPv4/IPv6 bind address | Interface on which `server.mjs` listens. Keep `127.0.0.1` for local workstation safety; do not expose directly to the public internet without a reverse proxy. |
| `PORT` | `4174` | `0` or `1..65535` (`0` = OS ephemeral port) | TCP listen port for the Surgical Vivisection Studio and `/healthz` endpoint. |

## CLI Flags (`bin/planaria.mjs`)

| Subcommand | Flags & Defaults | Notes |
|---|---|---|
| `compile <in.plang> -o <out.hbin>` | `-o <path>` (required) | Compiles a `.plang` organism deterministically into a `98,304`-byte `.hbin` binary. |
| `inspect <file.hbin>` | `--pinned <hex32>`, `--allow-unpinned-xenograft` | Decodes, quarantines Byzantine cells, and prints stratum viability, Merkle root, and regeneration status. |
| `run <file.hbin>` | `--frames <N>` (default `60`), `--seed <int>` (default `2026`), `--pinned <hex32>` | Boots the organism in `PVM-32`. Exits with code `3` if any VM trap occurs. |
| `bisect <in.hbin> <L> <R>` | `--offset <bytes>` (default `49152`) | Performs zero-overlap spatial bisection (supports arbitrary prime/unaligned byte offsets). |
| `fuse <A> <B> -o <out>` | `--gap <bytes>` (default `0`) | Concatenates arbitrary byte shards with optional garbage gap padding. |
| `heal <in.hbin> -o <out>` | `--pinned <hex32>` | Regenerates a canonical `98,304`-byte `.hbin` when `canFullRegenerate` holds. |
| `damage <in.hbin> -o <out>` | `--bitrot <0..100>`, `--burst`, `--shift <N>`, `--seed <int>` | Deterministic fault injection for falsification experiments. |
| `xenograft <host> <donor> -o <out>` | `--amputate <b1,b2,...>` (required; bundles `0` and `6` forbidden), `--allow-unpinned-xenograft` | Amputates non-sovereign host organs and performs ABI-checked cross-species grafting. |
| `disasm <file.hbin>` | `--bundle <0..6>` (default `0`) | Disassembles executable `PVM-32` bundles or prints decoded Bundle 6 Genome metadata. |

## Benchmark & Build Script Options

| Command | Flags | Behavior |
|---|---|---|
| `node scripts/benchmark.mjs` | `--attest-only` | Re-computes SHA-256 digests and refreshes `results/attestation.json` without re-running the 25-point Monte Carlo sweep. |
| `node scripts/build-pages.mjs` | *(none)* | Copies subpath-safe static Studio files into `_site/` for GitHub Pages deployment. |
| `node scripts/gen-manifest.mjs` | *(none)* | Rebuilds `MANIFEST.sha256` and `data/MANIFEST.sha256`. |

## Compiler & VM Hard-Coded Safety Limits

| Limit | Value | Location | Purpose |
|---|---|---|---|
| `TOTAL_HBIN_BYTES` | `98,304` (`192 × 512` B) | `src/core/hbin.js` | Fixed canonical organism size |
| `MAX_PARSE_DEPTH` | `128` | `src/compiler/parser.js` | Prevents stack overflow on adversarial nested ASTs |
| Scratch register cap | `r12..r17` (`rR <= 17`) | `src/compiler/codegen.js` | Prevents expression evaluation from clobbering local `r18..r29` |
| `PVM-32` RAM mask | `addr & 0xFFF` (`4,096` words) | `src/vm/pvm32.js` | Total memory isolation; out-of-bounds access wraps deterministically |
| Frame instruction budget | `12,000` instructions/organ | `src/vm/pvm32.js` | Halts infinite loops with `BUDGET_EXCEEDED` trap |
| HTTP server max body | N/A (GET/HEAD only) | `server.mjs` | Rejects `POST`/`PUT`/`DELETE` with HTTP `405` |

## Studio Accessibility & Motion Settings

- **Reduced Motion:** Automatically honors browser `prefers-reduced-motion: reduce`; also toggleable live via the header **Motion** button (`#btnMotion`, `aria-pressed`) without reloading.
- **Keyboard Navigation:** Arrow keys / `Home` / `End` switch WAI-ARIA tabs; `WASD` / Arrows move, `Q`/`E`/`R`/`V`/`X`/`F` trigger quantum-temporal abilities using layout-independent `KeyboardEvent.code`.
