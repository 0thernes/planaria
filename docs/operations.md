# Operations, Observability, Deployment & Offsite Mirror (`v2.3.0`)

## Running the Local Studio Service (`server.mjs`)

PLANARIA ships a zero-dependency local HTTP server (`server.mjs`) bound exclusively to `127.0.0.1:4174` by default.

```bash
# Start Studio on default http://127.0.0.1:4174/
npm start

# Override port cleanly
PORT=8080 HOST=127.0.0.1 node server.mjs
```

### Health Check & Observability (`A34`)

- **Liveness endpoint:** `GET /healthz` returns `HTTP 200 OK` with `Content-Type: application/json; charset=utf-8` and body:
  ```json
  {"status":"ok","service":"planaria","version":"2.3.0","uptimeSec":12.34}
  ```
- **Structured logging:** Startup banner and any internal I/O errors write cleanly to `stdout`/`stderr` without leaking stack traces or filesystem paths to HTTP clients.
- **Security headers on every response:** `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, `Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Resource-Policy: same-origin`.

## Static Deployment & One-Command Rollback (`A27`, `A36`)

PLANARIA's interactive Studio is deployed automatically to GitHub Pages via [`.github/workflows/pages.yml`](../.github/workflows/pages.yml) on every push to `main`:

```bash
# Local preview build of the exact GitHub Pages bundle (_site/)
just deploy     # runs: npm run build && npm run pages

# Verify static bundle locally
npx --yes serve _site   # or open _site/index.html via server.mjs
```

**One-Command Rollback (`just rollback`):**
Because GitHub Pages deploys directly from `main`, rolling back a faulty deployment requires a single non-destructive revert commit pushed to `main` (per Hard Rule `R2`, never `git push --force`):

```bash
just rollback   # creates a clean revert commit of HEAD and pushes to main
```

GitHub Actions automatically rebuilds and redeploys the reverted `_site/` bundle within ~60 seconds.

## Data Integrity, Backups & Offsite Repository Mirror (`A35`)

PLANARIA stores zero user databases or mutable runtime state. All deterministic artifacts (`artifacts/*.hbin`, `results/*.json`, `results/lean4-audit.txt`, `dist/Donahue_2026_planaria.pdf`, `dist/arxiv_submission.tar.gz`) are versioned in Git and anchored by SHA-256 digests in [`MANIFEST.sha256`](../MANIFEST.sha256) and [`data/MANIFEST.sha256`](../data/MANIFEST.sha256).

### Creating a Complete Offline Git Bundle Backup

Create a single self-contained, cryptographically verifiable archive of all commits and tags for cold storage:

```bash
git bundle create "../planaria-backup-$(date +%F).bundle" --all
git bundle verify "../planaria-backup-$(date +%F).bundle"
sha256sum "../planaria-backup-$(date +%F).bundle" > "../planaria-backup-$(date +%F).bundle.sha256"
```

Restore from an offline bundle on any air-gapped machine:

```bash
git clone planaria-backup-YYYY-MM-DD.bundle planaria-restored
cd planaria-restored && npm test
```

### Independent Offsite Mirrors & Archival Preservation

1. **Primary Remote:** `https://github.com/0thernes/planaria`
2. **Master Research Archive Submodule & Frozen Mirror:** `https://github.com/0thernes/0thernes-research-archive` (`0TH-BUILD-002`, pins exact commit hash, frozen PDF, pure-LF Lean audit, arXiv tarball, and SHA-256 checksums)
3. **Software Heritage Permanent Archive:** Archived via Save Code Now (`https://archive.softwareheritage.org/browse/origin/?origin_url=https://github.com/0thernes/planaria`) for independent SWHID preservation outside GitHub.
