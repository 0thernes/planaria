#!/usr/bin/env node
/**
 * PLANARIA — Bibliography, Citation Cross-Reference & Optional Live Crossref DOI/Retraction Verifier
 *
 * Audits `paper/main.tex` and `paper/WHITE_PAPER.md` to verify:
 *   1. Strips LaTeX `%` comments (preserving `\%`) before parsing `\bibitem` & `\cite`
 *   2. Supports optional `\bibitem[label]{key}` forms and asserts `bibKeys.length > 0`
 *   3. Every `\cite{key}` resolves to a defined `\bibitem{key}`, with ZERO orphans or duplicate keys
 *   4. Every `\bibitem` carries a valid DOI (`10.xxxx/...`), RFC/FIPS/NIST standard ID, arXiv ID, or verified URL
 *   5. Every DOI referenced in `paper/WHITE_PAPER.md` matches a DOI in `paper/main.tex` (zero stale/mismatched DOIs)
 *   6. With `--live`: resolves every DOI via the live Crossref REST API (`https://api.crossref.org/works/<doi>`),
 *      checks HTTP 200 + zero retraction notices, and writes `results/citation-audit.json`
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LIVE = process.argv.includes('--live');
const texPath = path.join(ROOT, 'paper/main.tex');
const rawTex = fs.readFileSync(texPath, 'utf8');

// Strip unescaped LaTeX comments line-by-line so commented-out \bibitem / \cite never count
const tex = rawTex
  .split(/\r?\n/)
  .map((line) => line.replace(/(^|[^\\])%.*/g, '$1'))
  .join('\n');

const bibKeys = [];
const bibDupes = [];
const bibWithoutId = [];
const texDois = new Map(); // key -> doi

const bibRegex = /\\bibitem(?:\[[^\]]*\])?\{([^}]+)\}([\s\S]*?)(?=\\bibitem(?:\[[^\]]*\])?\{|\\end\{thebibliography\})/g;
let m;
while ((m = bibRegex.exec(tex)) !== null) {
  const key = m[1].trim();
  const body = m[2];
  if (bibKeys.includes(key)) bibDupes.push(key);
  bibKeys.push(key);
  const doiMatch = body.match(/10\.\d{4,9}\/[^\s},;]+/);
  if (doiMatch) {
    const cleanDoi = doiMatch[0].replace(/\.$/, '').replace(/\\_/g, '_');
    texDois.set(key, cleanDoi);
  }
  const hasId =
    Boolean(doiMatch) ||
    /https?:\/\/[^\s}]+/.test(body) ||
    /FIPS\s+PUB|RFC\s+\d+|arXiv:\d{4}\.\d{4,5}|OCLC[~ ]+\d+/i.test(body);
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

console.log(`[CITATIONS] Found ${bibKeys.length} bibitems (${texDois.size} DOIs) and ${citedSet.size} unique cited keys in paper/main.tex.`);
let ok = true;
if (bibKeys.length === 0) {
  console.error('[CITATIONS] ERROR: 0 bibitems parsed from paper/main.tex.');
  ok = false;
}
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

// Cross-check paper/WHITE_PAPER.md DOIs against paper/main.tex DOIs
const wpPath = path.join(ROOT, 'paper/WHITE_PAPER.md');
if (fs.existsSync(wpPath)) {
  const wpText = fs.readFileSync(wpPath, 'utf8');
  const texDoiLower = new Set([...texDois.values()].map((d) => d.toLowerCase()));
  const wpMatches = wpText.match(/10\.\d{4,9}\/[^\s,;\]`>]+/g) || [];
  const mismatchedWp = [];
  for (const raw of wpMatches) {
    let clean = raw.replace(/\.$/, '');
    while (clean.endsWith(')') && (clean.match(/\)/g) || []).length > (clean.match(/\(/g) || []).length) {
      clean = clean.slice(0, -1);
    }
    if (!texDoiLower.has(clean.toLowerCase())) {
      mismatchedWp.push(clean);
    }
  }
  if (mismatchedWp.length > 0) {
    console.error(`[CITATIONS] paper/WHITE_PAPER.md contains DOI(s) not in paper/main.tex: ${[...new Set(mismatchedWp)].join(', ')}`);
    ok = false;
  }
}

if (!ok) process.exit(1);

if (LIVE) {
  console.log(`[CITATIONS] --live: querying Crossref REST API for ${texDois.size} DOIs...`);
  const results = [];
  let liveFail = 0;
  for (const [key, doi] of texDois.entries()) {
    const url = `https://api.crossref.org/works/${encodeURIComponent(doi)}`;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(url, {
        headers: { 'User-Agent': 'PLANARIA-Citation-Audit/2.4 (mailto:0_0@0thernes.art)' },
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!res.ok) {
        liveFail++;
        results.push({ citeKey: key, doi, status: res.status, resolved: false, retracted: null });
        console.error(`  [FAIL] ${key}: ${doi} -> HTTP ${res.status}`);
        continue;
      }
      const data = await res.json();
      const msg = data.message || {};
      const title = Array.isArray(msg.title) ? msg.title[0] : (msg.title || '');
      const year =
        msg.issued?.['date-parts']?.[0]?.[0] ??
        msg.published?.['date-parts']?.[0]?.[0] ??
        null;
      const firstAuthor = msg.author?.[0]?.family || msg.editor?.[0]?.family || '';
      const updates = Array.isArray(msg['update-to']) ? msg['update-to'] : [];
      const relations = msg.relation || {};
      const retracted =
        updates.some((u) => /retract/i.test(String(u.type || ''))) ||
        Boolean(relations['is-retracted-by']) ||
        /\bretracted\b/i.test(title);
      if (retracted) {
        liveFail++;
        console.error(`  [RETRACTED] ${key}: ${doi} (${title})`);
      }
      results.push({ citeKey: key, doi, status: res.status, resolved: true, retracted, year, firstAuthor, title });
    } catch (err) {
      liveFail++;
      results.push({ citeKey: key, doi, status: 0, resolved: false, retracted: null, error: String(err.message || err) });
      console.error(`  [ERROR] ${key}: ${doi} -> ${err.message || err}`);
    }
  }
  const auditReport = {
    schema: 'PLANARIA-CITATION-AUDIT-1.0',
    auditedAt: new Date().toISOString(),
    totalBibitems: bibKeys.length,
    totalDoisChecked: texDois.size,
    resolvedCount: results.filter((r) => r.resolved).length,
    retractedCount: results.filter((r) => r.retracted).length,
    entries: results,
  };
  fs.mkdirSync(path.join(ROOT, 'results'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'results/citation-audit.json'), JSON.stringify(auditReport, null, 2) + '\n', 'utf8');
  console.log(`[CITATIONS] Wrote results/citation-audit.json (${auditReport.resolvedCount}/${auditReport.totalDoisChecked} resolved, ${auditReport.retractedCount} retracted).`);
  if (liveFail > 0) process.exit(1);
}

console.log('[CITATIONS] PASS: 100% citation cross-reference parity & DOI/standard-ID coverage.');
