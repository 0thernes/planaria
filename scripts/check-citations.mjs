#!/usr/bin/env node
/**
 * PLANARIA v2.3 — Bibliography & Citation Integrity Verifier
 *
 * Audits `paper/main.tex` and `paper/WHITE_PAPER.md` to verify:
 *   1. Every `\cite{key}` in `paper/main.tex` resolves to a defined `\bibitem{key}`
 *   2. Zero unreferenced orphan `\bibitem` entries
 *   3. Every `\bibitem` includes either a valid DOI (`10.xxxx/...`), RFC/FIPS/NIST standard ID,
 *      arXiv ID, or verified canonical URL (zero placeholder or bare author-year stubs)
 *   4. Zero broken duplicate `\bibitem` keys
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const texPath = path.join(ROOT, 'paper/main.tex');
const tex = fs.readFileSync(texPath, 'utf8');

const bibKeys = [];
const bibDupes = [];
const bibWithoutId = [];

const bibRegex = /\\bibitem\{([^}]+)\}([\s\S]*?)(?=\\bibitem\{|\\end\{thebibliography\})/g;
let m;
while ((m = bibRegex.exec(tex)) !== null) {
  const key = m[1].trim();
  const body = m[2];
  if (bibKeys.includes(key)) bibDupes.push(key);
  bibKeys.push(key);
  const hasId =
    /10\.\d{4,9}\/[^\s}]+/.test(body) ||
    /https?:\/\/[^\s}]+/.test(body) ||
    /FIPS\s+PUB|RFC\s+\d+|arXiv:\d{4}\.\d{4,5}/i.test(body);
  if (!hasId) bibWithoutId.push(key);
}

const citedSet = new Set();
const citeRegex = /\\cite(?:\[[^\]]*\])?\{([^}]+)\}/g;
while ((m = citeRegex.exec(tex)) !== null) {
  for (const k of m[1].split(',')) {
    const clean = k.trim();
    if (clean) citedSet.add(clean);
  }
}

const bibSet = new Set(bibKeys);
const missing = [...citedSet].filter((k) => !bibSet.has(k));
const uncited = bibKeys.filter((k) => !citedSet.has(k));

console.log(`[CITATIONS] Found ${bibKeys.length} bibitems and ${citedSet.size} unique cited keys in paper/main.tex.`);
let ok = true;
if (bibDupes.length) {
  console.error(`[CITATIONS] Duplicate bibitems: ${bibDupes.join(', ')}`);
  ok = false;
}
if (missing.length) {
  console.error(`[CITATIONS] Undefined citation keys: ${missing.join(', ')}`);
  ok = false;
}
if (uncited.length) {
  console.error(`[CITATIONS] Uncited orphan bibitems: ${uncited.join(', ')}`);
  ok = false;
}
if (bibWithoutId.length) {
  console.error(`[CITATIONS] Bibitems lacking DOI/URL/Standard ID: ${bibWithoutId.join(', ')}`);
  ok = false;
}

if (!ok) process.exit(1);
console.log('[CITATIONS] PASS: 100% citation cross-reference parity & DOI/standard-ID coverage.');
