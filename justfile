# PLANARIA v2.3.0 — One-Word Task Runner (Build Standard A31, A36, B01)
set shell := ["bash", "-euo", "pipefail", "-c"]

default:
  @just --list

setup:
  ./scripts/dev.sh setup

build:
  ./scripts/dev.sh build

test:
  ./scripts/dev.sh test

mutate:
  node scripts/mutation-test.mjs

lint:
  ./scripts/dev.sh lint

bench:
  ./scripts/dev.sh bench

lean:
  ./scripts/dev.sh lean

paper:
  ./scripts/dev.sh paper

pages:
  node scripts/build-pages.mjs

citations:
  node scripts/check-citations.mjs

manifest:
  node scripts/gen-manifest.mjs

reproduce:
  ./scripts/dev.sh reproduce

audit:
  ./scripts/audit-repo.sh

serve:
  node server.mjs

deploy:
  node scripts/build-pages.mjs
  @echo "Static GitHub Pages site staged in _site/. Push to main or run: gh workflow run pages.yml"

rollback tag="v2.2.0":
  @echo "Rolling back live Pages deployment to tagged release {{tag}}..."
  git checkout "{{tag}}" -- src/web programs artifacts results
  node scripts/build-pages.mjs
  @echo "Rollback bundle staged in _site/. Review git diff and commit to main to redeploy."

release version:
  ./scripts/dev.sh release "{{version}}"
