#!/usr/bin/env node
/**
 * PLANARIA — GitHub Pages Static Site Builder (`_site/`)
 *
 * Stages a self-contained static bundle that runs the live 3D WebGL2 Studio,
 * interactive Lean 4.35.0 Proof Blueprint (`/blueprint/`), downloadable `.hbin` artifacts,
 * benchmark JSON, Lean Challenge/Spec sources, and White Paper PDF cleanly at ANY subpath
 * (e.g. `https://0thernes.github.io/planaria/`).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, '_site');

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

function copyRec(srcRel, dstRel = srcRel, required = true) {
  const src = path.join(ROOT, srcRel);
  const dst = path.join(OUT, dstRel);
  if (!fs.existsSync(src)) {
    if (required) throw new Error(`[PAGES] Missing required asset: ${srcRel}`);
    return;
  }
  fs.cpSync(src, dst, { recursive: true });
}

// Stage root index.html directly from src/web/index.html (uses ./src/web/... relative paths!)
copyRec('src/web/index.html', 'index.html', true);
copyRec('src', 'src', true);
// Remove duplicate _site/src/web/index.html so visitors cannot land on broken relative links
fs.rmSync(path.join(OUT, 'src/web/index.html'), { force: true });
copyRec('programs', 'programs', true);
copyRec('artifacts', 'artifacts', true);
copyRec('blueprint', 'blueprint', true);
copyRec('results/benchmarks.json', 'results/benchmarks.json', true);
copyRec('results/attestation.json', 'results/attestation.json', true);
copyRec('results/lean4-audit.txt', 'results/lean4-audit.txt', true);
copyRec('results/lean4-multi-kernel.txt', 'results/lean4-multi-kernel.txt', true);
copyRec('results/citation-audit.json', 'results/citation-audit.json', false);
copyRec('lean/Challenge.lean', 'lean/Challenge.lean', true);
copyRec('lean/PlanariaProofs/Spec.lean', 'lean/PlanariaProofs/Spec.lean', true);
copyRec('lean/comparator.json', 'lean/comparator.json', true);
copyRec('dist/Donahue_2026_planaria.pdf', 'paper/Donahue_2026_planaria.pdf', true);
copyRec('docs/media', 'docs/media', false);
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');

console.log(`[PAGES] Built static GitHub Pages bundle at ${OUT}`);
