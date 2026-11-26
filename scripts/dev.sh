#!/usr/bin/env bash
# PLANARIA v2.3.0 — Developer task script (zero external dependencies beyond Node.js >=20, optional Lean 4 / Tectonic).
# Usage: scripts/dev.sh <detect|setup|build|test|mutate|lint|bench|lean|paper|reproduce|pages|audit|run|clean|release VERSION>
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1

ACTION="${1:-help}"; shift || true
STATUS=0

has() { command -v "$1" >/dev/null 2>&1; }
note() { printf '[dev] %s\n' "$*"; }
run() { note "\$ $*"; "$@" || { note "failed ($?): $*"; STATUS=1; }; }

release() {
  local v="${1:-}"
  [[ "$v" =~ ^[0-9]+\.[0-9]+\.[0-9]+([-+][0-9A-Za-z.-]+)?$ ]] || { note "usage: scripts/dev.sh release X.Y.Z"; exit 2; }
  if git rev-parse "v$v" >/dev/null 2>&1; then note "tag v$v already exists"; exit 2; fi
  grep -Eq "^## \[$v\]" CHANGELOG.md || { note "CHANGELOG.md has no '## [$v]' section; update CHANGELOG.md first"; exit 2; }
  printf '%s\n' "$v" > VERSION
  [ -f CITATION.cff ] && sed -i.bak -E "s/^version: .*/version: \"$v\"/; s/^date-released: .*/date-released: \"$(date +%F)\"/" CITATION.cff && rm -f CITATION.cff.bak
  git add VERSION CITATION.cff CHANGELOG.md
  git commit -m "Release v$v" || true
  git tag -a "v$v" -m "v$v"
  git push origin HEAD:main --follow-tags
}

case "$ACTION" in
  detect)
    echo "node=$(has node && echo true || echo false)"
    echo "lean4=$(has lake && echo true || echo false)"
    echo "tectonic=$(has tectonic && echo true || echo false)"
    ;;
  setup)
    run node -v
    run npm run build
    ;;
  build)     run npm run build ;;
  test)      run npm test ;;
  mutate)    run npm run mutate ;;
  lint)      run npm run lint && run npm run check:citations ;;
  bench)     run npm run benchmark ;;
  pages)     run npm run pages ;;
  lean)
    if has lake; then
      (cd lean && run lake build && run lake env lean VerifyAxioms.lean)
    else
      note "skip lean: lake not installed (see lean/lean-toolchain)"
    fi
    ;;
  paper)
    if has tectonic; then
      run tectonic -X compile paper/main.tex --outdir dist
    else
      note "skip paper: tectonic not installed"
    fi
    ;;
  reproduce)
    run npm run build
    run npm test
    run npm run mutate
    run npm run lint
    run npm run check:citations
    run npm run benchmark
    run node scripts/gen-manifest.mjs
    ;;
  audit)     run bash scripts/audit-repo.sh . ;;
  run)       run node server.mjs "$@" ;;
  clean)     run rm -rf _site ;;
  release)   release "${1:-}" ;;
  help|-h|--help) sed -n '2,3p' "$0"; exit 0 ;;
  *)         sed -n '2,3p' "$0" >&2; note "unknown command '$ACTION'"; exit 2 ;;
esac
exit $STATUS
