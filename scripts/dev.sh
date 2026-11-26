#!/usr/bin/env bash
# PLANARIA v2.4.0 — Developer task script (zero external dependencies beyond Node.js >=20, optional Lean 4 / Python 3 / Tectonic).
# Usage: scripts/dev.sh <detect|setup|build|test|mutate|fuzz|oracle|blueprint|axioms|lint|bench|lean|paper|reproduce|pages|audit|run|clean|release VERSION>
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
  local today; today="$(date +%F)"
  [ -f CITATION.cff ] && sed -i.bak -E "s/^version: .*/version: \"$v\"/; s/^date-released: .*/date-released: \"$today\"/" CITATION.cff && rm -f CITATION.cff.bak
  [ -f .zenodo.json ] && node -e "const fs=require('fs');const j=JSON.parse(fs.readFileSync('.zenodo.json','utf8'));j.version=process.argv[1];j.publication_date=process.argv[2];fs.writeFileSync('.zenodo.json',JSON.stringify(j,null,2)+'\n');" "$v" "$today"
  [ -f package.json ] && node -e "const fs=require('fs');const j=JSON.parse(fs.readFileSync('package.json','utf8'));j.version=process.argv[1];fs.writeFileSync('package.json',JSON.stringify(j,null,2)+'\n');" "$v"
  [ -f package-lock.json ] && node -e "const fs=require('fs');const j=JSON.parse(fs.readFileSync('package-lock.json','utf8'));j.version=process.argv[1];if(j.packages&&j.packages[''])j.packages[''].version=process.argv[1];fs.writeFileSync('package-lock.json',JSON.stringify(j,null,2)+'\n');" "$v"
  [ -f formalization.yaml ] && sed -i.bak -E "s/^version: .*/version: \"$v\"/" formalization.yaml && rm -f formalization.yaml.bak
  [ -f lean/lakefile.toml ] && sed -i.bak -E "s/^version = .*/version = \"$v\"/" lean/lakefile.toml && rm -f lean/lakefile.toml.bak
  git add VERSION CITATION.cff .zenodo.json package.json package-lock.json formalization.yaml lean/lakefile.toml CHANGELOG.md
  git commit -m "Release v$v" || { note "git commit failed (check git status)"; exit 1; }
  git tag -a "v$v" -m "v$v"
  git push origin HEAD:main --follow-tags
}

case "$ACTION" in
  detect)
    echo "node=$(has node && echo true || echo false)"
    echo "python3=$(has python3 && echo true || echo false)"
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
  fuzz)      run npm run fuzz ;;
  oracle)
    if has python3; then
      run python3 reference/planaria_oracle.py
    elif has python; then
      run python reference/planaria_oracle.py
    else
      note "skip oracle: python3 not installed"
    fi
    ;;
  blueprint) run npm run blueprint && run npm run check:blueprint ;;
  axioms)    run npm run check:axioms ;;
  lint)      run npm run lint && run npm run check:citations ;;
  bench)     run npm run benchmark ;;
  pages)     run npm run pages ;;
  lean)
    if has lake; then
      run bash -c 'cd lean && lake build && lake build Challenge && lake env lean VerifyAxioms.lean'
    else
      note "skip lean: lake not installed (see lean/lean-toolchain)"
    fi
    ;;
  paper)
    if has tectonic; then
      run bash -c 'tectonic -X compile paper/main.tex --outdir dist && mv -f dist/main.pdf dist/Donahue_2026_planaria.pdf'
    else
      note "skip paper: tectonic not installed"
    fi
    ;;
  reproduce)
    run npm run build
    run npm test
    run npm run mutate
    run npm run fuzz
    if has python3; then run python3 reference/planaria_oracle.py; elif has python; then run python reference/planaria_oracle.py; fi
    if has lake; then run bash -c 'cd lean && lake build && lake build Challenge && lake env lean VerifyAxioms.lean'; fi
    run npm run check:axioms
    run npm run check:blueprint
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
