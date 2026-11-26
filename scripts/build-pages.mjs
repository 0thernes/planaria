#!/usr/bin/env node
/**
 * PLANARIA v2.3 — GitHub Pages Static Site Builder (`_site/`)
 *
 * Stages a self-contained static bundle that runs the live 3D WebGL2 Studio,
 * downloadable artifacts, benchmark JSON, Lean Challenge spec, and White Paper PDF
 * cleanly at ANY subpath (e.g. `https://0thernes.github.io/planaria/`).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, '_site');

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

function copyRec(srcRel, dstRel = srcRel) {
  const src = path.join(ROOT, srcRel);
  const dst = path.join(OUT, dstRel);
  if (!fs.existsSync(src)) return;
  fs.cpSync(src, dst, { recursive: true });
}

// Stage root index.html directly from src/web/index.html (uses ./src/web/... relative paths!)
copyRec('src/web/index.html', 'index.html');
copyRec('src', 'src');
copyRec('programs', 'programs');
copyRec('artifacts', 'artifacts');
copyRec('results/benchmarks.json', 'results/benchmarks.json');
copyRec('results/attestation.json', 'results/attestation.json');
copyRec('results/lean4-audit.txt', 'results/lean4-audit.txt');
copyRec('lean/Challenge.lean', 'lean/Challenge.lean');
copyRec('lean/comparator.json', 'lean/comparator.json');
copyRec('dist/Donahue_2026_planaria.pdf', 'paper/Donahue_2026_planaria.pdf');
copyRec('docs/media', 'docs/media');
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');

console.log(`[PAGES] Built static GitHub Pages bundle at ${OUT}`);
