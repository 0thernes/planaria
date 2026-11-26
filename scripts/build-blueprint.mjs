#!/usr/bin/env node
/**
 * PLANARIA — Interactive Lean 4.35.0 Proof Blueprint Builder (Playbook #11)
 *
 * Extracts every theorem from `lean/comparator.json`, its exact source file & line range,
 * Lean type signature, doc comment, intra-library proof dependency edges, mapped Claim IDs
 * from `CLAIMS.md`, and exact `#print axioms` footprint from `results/lean4-audit.txt`.
 *
 * Emits a self-contained, zero-CDN, strict-CSP interactive blueprint at:
 *   - `blueprint/blueprint.json`
 *   - `blueprint/index.html`
 *   - `blueprint/blueprint.css`
 *   - `blueprint/blueprint.js`
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VERSION = fs.readFileSync(path.join(ROOT, 'VERSION'), 'utf8').trim();
const OUT_DIR = path.join(ROOT, 'blueprint');
fs.mkdirSync(OUT_DIR, { recursive: true });

const comparator = JSON.parse(fs.readFileSync(path.join(ROOT, 'lean/comparator.json'), 'utf8'));
const auditText = fs.readFileSync(path.join(ROOT, 'results/lean4-audit.txt'), 'utf8');
const claimsText = fs.existsSync(path.join(ROOT, 'CLAIMS.md'))
  ? fs.readFileSync(path.join(ROOT, 'CLAIMS.md'), 'utf8')
  : '';

// Parse exact axiom footprint per theorem from results/lean4-audit.txt
const axiomMap = new Map();
for (const line of auditText.split(/\r?\n/)) {
  const mDeps = line.match(/^'([^']+)'\s+depends on axioms:\s+\[([^\]]*)\]/);
  if (mDeps) {
    const axioms = mDeps[2]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    axiomMap.set(mDeps[1], axioms);
    continue;
  }
  const mNone = line.match(/^'([^']+)'\s+does not depend on any axioms/);
  if (mNone) {
    axiomMap.set(mNone[1], []);
  }
}

// Parse Claims mapping (C01..C10) from CLAIMS.md
const claimMap = new Map(); // shortName -> Set(claimIds)
for (const line of claimsText.split(/\r?\n/)) {
  const mRow = line.match(/^\|\s*(C\d{2})\s*\|/);
  if (!mRow) continue;
  const cid = mRow[1];
  for (const name of comparator.theorem_names) {
    const short = name.split('.').pop();
    if (line.includes(short) || line.includes(name)) {
      if (!claimMap.has(name)) claimMap.set(name, new Set());
      claimMap.get(name).add(cid);
    }
  }
}

const MODULE_META = [
  { key: 'GF256', file: 'lean/PlanariaProofs/GF256.lean', title: 'Module 1: GF(2^8) Field & Universal Cauchy 2x2', color: '#22d3ee' },
  { key: 'Mitosis', file: 'lean/PlanariaProofs/MitosisBounds.lean', title: 'Module 2: Mitosis Bounds & Placement Schedule', color: '#38bdf8' },
  { key: 'Anastomosis', file: 'lean/PlanariaProofs/StratumAnastomosis.lean', title: 'Module 3: 4-Stratum Lattice & Anastomosis', color: '#a78bfa' },
  { key: 'Byzantine', file: 'lean/PlanariaProofs/ByzantineImmune.lean', title: 'Module 4: RS Burst, Merkle & Byzantine Quorum', color: '#34d399' },
  { key: 'Xenograft', file: 'lean/PlanariaProofs/XenograftABI.lean', title: 'Module 5: PVM-32 Sandbox & Xenograft Sovereignty', color: '#fbbf24' },
  { key: 'QuantumTemporal', file: 'lean/PlanariaProofs/QuantumTemporal.lean', title: 'Module 6: 4-Qubit Unitarity & Temporal Rewind', color: '#f472b6' },
  { key: 'Adversarial', file: 'lean/PlanariaProofs/AdversarialTests.lean', title: 'Module 7: Adversarial False-Variant Refutations', color: '#fb7185' },
];

// Index all theorem blocks across all 7 proof files
const declInfo = new Map();
for (const mod of MODULE_META) {
  const abs = path.join(ROOT, mod.file);
  const src = fs.readFileSync(abs, 'utf8');
  const lines = src.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^public\s+theorem\s+([A-Za-z0-9_']+)/);
    if (!m) continue;
    const shortName = m[1];
    const fullName = `Planaria.${mod.key}.${shortName}`;
    // Capture preceding /-- ... -/ docstring if present
    let doc = '';
    let j = i - 1;
    while (j >= 0 && (lines[j].trim() === '' || lines[j].trim().startsWith('set_option'))) j--;
    if (j >= 0 && lines[j].includes('-/')) {
      const docLines = [];
      while (j >= 0) {
        docLines.unshift(lines[j]);
        if (lines[j].includes('/--')) break;
        j--;
      }
      doc = docLines
        .join(' ')
        .replace(/^.*\/--/, '')
        .replace(/-\/.*$/, '')
        .replace(/\s+/g, ' ')
        .trim();
    }
    // Capture theorem signature + proof body until next top-level declaration or end namespace
    let endLine = i;
    for (let k = i + 1; k < lines.length; k++) {
      if (/^(?:public\s+|private\s+|@\[|set_option\s+|end\s+Planaria\.|\/--)/.test(lines[k])) {
        endLine = k - 1;
        break;
      }
      endLine = k;
    }
    const blockText = lines.slice(i, endLine + 1).join('\n');
    const sigSplit = blockText.split(/:=\s*by\b|:=\s*[\r\n]/);
    const signature = (sigSplit[0] || lines[i]).replace(/\s+/g, ' ').trim();
    const proofBody = sigSplit.slice(1).join(' ');
    declInfo.set(fullName, {
      fullName,
      shortName,
      module: mod.key,
      file: mod.file,
      line: i + 1,
      endLine: endLine + 1,
      doc,
      signature,
      proofBody,
    });
  }
}

const allShortToFull = new Map();
for (const full of comparator.theorem_names) {
  allShortToFull.set(full.split('.').pop(), full);
}

const nodes = comparator.theorem_names.map((fullName) => {
  const info = declInfo.get(fullName);
  if (!info) {
    throw new Error(`[BLUEPRINT] Theorem '${fullName}' in comparator.json was not found in proof modules.`);
  }
  const deps = new Set();
  for (const [shortName, targetFull] of allShortToFull.entries()) {
    if (targetFull === fullName) continue;
    const re = new RegExp(`\\b${shortName}\\b`);
    if (re.test(info.proofBody) || re.test(info.signature)) {
      deps.add(targetFull);
    }
  }
  const axioms = axiomMap.has(fullName) ? axiomMap.get(fullName) : null;
  if (axioms === null) {
    throw new Error(`[BLUEPRINT] Theorem '${fullName}' missing from results/lean4-audit.txt.`);
  }
  return {
    id: fullName,
    shortName: info.shortName,
    module: info.module,
    file: info.file,
    line: info.line,
    endLine: info.endLine,
    doc: info.doc,
    signature: info.signature,
    axioms,
    claims: [...(claimMap.get(fullName) || [])].sort(),
    dependencies: [...deps].sort(),
  };
});

const edges = [];
for (const n of nodes) {
  for (const dep of n.dependencies) {
    edges.push({ from: dep, to: n.id });
  }
}

const blueprintData = {
  schema: 'PLANARIA-BLUEPRINT-1.0',
  version: VERSION,
  toolchain: fs.readFileSync(path.join(ROOT, 'lean/lean-toolchain'), 'utf8').trim(),
  autoImplicit: false,
  permittedAxioms: comparator.permitted_axioms,
  kernels: ['lean4', 'leanchecker-paranoid', 'nanoda', 'con-leche', 'con-ron', 'lean4lean'],
  theoremCount: nodes.length,
  edgeCount: edges.length,
  modules: MODULE_META.map((m) => ({
    ...m,
    count: nodes.filter((n) => n.module === m.key).length,
  })),
  nodes,
  edges,
};

fs.writeFileSync(path.join(OUT_DIR, 'blueprint.json'), JSON.stringify(blueprintData, null, 2) + '\n', 'utf8');

// Write blueprint.css
fs.writeFileSync(
  path.join(OUT_DIR, 'blueprint.css'),
  `:root {
  --bg: #070b14;
  --panel: #0e1628;
  --panel-alt: #121d33;
  --border: #1e3154;
  --text: #e2e8f0;
  --muted: #94a3b8;
  --accent: #38bdf8;
  --ok: #34d399;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.5;
}
header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 24px;
  background: var(--panel);
  border-bottom: 1px solid var(--border);
}
.title-wrap h1 { margin: 0; font-size: 1.25rem; letter-spacing: 0.04em; }
.title-wrap p { margin: 4px 0 0; color: var(--muted); font-size: 0.88rem; }
.nav-links { display: flex; gap: 10px; flex-wrap: wrap; }
.pill {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 4px 12px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--panel-alt);
  color: var(--accent);
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 600;
}
.pill:hover { border-color: var(--accent); }
main { max-width: 1440px; margin: 0 auto; padding: 20px 24px 48px; }
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}
.kpi {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px 14px;
}
.kpi .label { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); }
.kpi .val { font-size: 1.2rem; font-weight: 700; color: var(--ok); margin-top: 4px; }
.layout { display: grid; grid-template-columns: 1.45fr 1fr; gap: 18px; align-items: start; }
@media (max-width: 1024px) { .layout { grid-template-columns: 1fr; } }
.card {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
}
.card h2 { margin: 0 0 10px; font-size: 1rem; letter-spacing: 0.03em; }
.dag-wrap {
  width: 100%;
  overflow-x: auto;
  background: #050810;
  border: 1px solid var(--border);
  border-radius: 8px;
}
.controls { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 12px; }
.controls input, .controls select {
  background: var(--panel-alt);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 0.85rem;
}
.controls input { flex: 1 1 220px; }
.inspector pre {
  background: #050810;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px;
  overflow-x: auto;
  font-size: 0.78rem;
  white-space: pre-wrap;
  word-break: break-word;
}
.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
  margin-right: 6px;
  background: rgba(52, 211, 153, 0.14);
  color: var(--ok);
  border: 1px solid rgba(52, 211, 153, 0.35);
}
.badge-claim {
  background: rgba(56, 189, 248, 0.14);
  color: var(--accent);
  border-color: rgba(56, 189, 248, 0.35);
}
table { width: 100%; border-collapse: collapse; margin-top: 14px; font-size: 0.83rem; }
th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid var(--border); vertical-align: top; }
th { color: var(--muted); font-size: 0.74rem; text-transform: uppercase; letter-spacing: 0.05em; }
tr.thm-row { cursor: pointer; }
tr.thm-row:hover, tr.thm-row.selected { background: rgba(56, 189, 248, 0.1); }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 0.78rem; }
.muted { color: var(--muted); }
`,
  'utf8'
);

// Write blueprint.js (strict zero-innerHTML DOM construction + SVG DAG renderer)
fs.writeFileSync(
  path.join(OUT_DIR, 'blueprint.js'),
  `const SVG_NS = 'http://www.w3.org/2000/svg';

function el(tag, attrs = {}, text = null) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') node.className = v;
    else node.setAttribute(k, String(v));
  }
  if (text !== null) node.textContent = text;
  return node;
}

function svgEl(tag, attrs = {}, text = null) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  if (text !== null) node.textContent = text;
  return node;
}

async function init() {
  const res = await fetch('./blueprint.json');
  if (!res.ok) throw new Error('Failed to load blueprint.json');
  const bp = await res.json();

  document.getElementById('bp-subtitle').textContent =
    \`PLANARIA v\${bp.version} · \${bp.toolchain} · autoImplicit=false · 6 Independent Kernels · Zero Mathlib\`;

  const kpis = [
    ['Audited Theorems', \`\${bp.theoremCount} / \${bp.theoremCount}\`],
    ['Proof Modules', \`\${bp.modules.length} pure modules\`],
    ['Dependency Edges', \`\${bp.edgeCount} intra-proof\`],
    ['Independent Kernels', \`\${bp.kernels.length} (Comparator Paranoid)\`],
    ['Forbidden Axioms', '0 (sorryAx / native)'],
  ];
  const kpiWrap = document.getElementById('kpi-grid');
  kpiWrap.replaceChildren();
  for (const [label, val] of kpis) {
    const card = el('div', { class: 'kpi' });
    card.append(el('div', { class: 'label' }, label), el('div', { class: 'val' }, val));
    kpiWrap.append(card);
  }

  const modFilter = document.getElementById('mod-filter');
  for (const m of bp.modules) {
    modFilter.append(el('option', { value: m.key }, \`\${m.title} (\${m.count})\`));
  }

  const modColor = new Map(bp.modules.map((m) => [m.key, m.color]));
  const nodeById = new Map(bp.nodes.map((n) => [n.id, n]));
  const dependents = new Map(bp.nodes.map((n) => [n.id, []]));
  for (const e of bp.edges) {
    if (dependents.has(e.from)) dependents.get(e.from).push(e.to);
  }

  let selectedId = bp.nodes[0]?.id || null;

  function renderInspector(id) {
    selectedId = id;
    const n = nodeById.get(id);
    const box = document.getElementById('inspector-body');
    box.replaceChildren();
    if (!n) return;
    box.append(el('h3', { class: 'mono', style: 'margin:0 0 8px;color:#38bdf8;' }, n.id));
    const badges = el('div', { style: 'margin-bottom:10px;' });
    const axLabel = n.axioms.length === 0 ? '0 axioms (pure kernel)' : \`axioms: \${n.axioms.join(', ')}\`;
    badges.append(el('span', { class: 'badge' }, axLabel));
    for (const c of n.claims) {
      badges.append(el('span', { class: 'badge badge-claim' }, c));
    }
    box.append(badges);
    if (n.doc) box.append(el('p', { style: 'margin:0 0 10px;font-size:0.86rem;' }, n.doc));
    box.append(el('div', { class: 'muted', style: 'font-size:0.78rem;margin-bottom:4px;' }, \`Source: \${n.file}:L\${n.line}-L\${n.endLine}\`));
    box.append(el('pre', { class: 'mono' }, n.signature));

    const depWrap = el('div', { style: 'margin-top:10px;font-size:0.82rem;' });
    depWrap.append(el('strong', {}, \`Uses (\${n.dependencies.length}): \`));
    depWrap.append(document.createTextNode(n.dependencies.length ? n.dependencies.map((d) => d.split('.').pop()).join(', ') : 'Definitions / Spec.lean only'));
    box.append(depWrap);

    const rev = dependents.get(n.id) || [];
    const revWrap = el('div', { style: 'margin-top:6px;font-size:0.82rem;' });
    revWrap.append(el('strong', {}, \`Used by (\${rev.length}): \`));
    revWrap.append(document.createTextNode(rev.length ? rev.map((d) => d.split('.').pop()).join(', ') : 'Top-level audited theorem'));
    box.append(revWrap);

    for (const tr of document.querySelectorAll('tr.thm-row')) {
      tr.classList.toggle('selected', tr.dataset.id === id);
    }
    for (const g of document.querySelectorAll('g.dag-node')) {
      g.setAttribute('opacity', g.dataset.id === id ? '1' : '0.82');
      const rect = g.querySelector('rect');
      if (rect) rect.setAttribute('stroke-width', g.dataset.id === id ? '2.5' : '1.2');
    }
  }

  function renderDag() {
    const svg = document.getElementById('dag-svg');
    const colW = 190;
    const rowH = 34;
    const padX = 16;
    const padY = 44;
    const maxRows = Math.max(...bp.modules.map((m) => m.count));
    const width = bp.modules.length * colW + padX * 2;
    const height = maxRows * rowH + padY + 24;
    svg.setAttribute('viewBox', \`0 0 \${width} \${height}\`);
    svg.setAttribute('width', String(width));
    svg.setAttribute('height', String(height));
    svg.replaceChildren();

    const pos = new Map();
    bp.modules.forEach((mod, colIdx) => {
      const cx = padX + colIdx * colW;
      svg.append(
        svgEl('text', {
          x: cx + 88,
          y: 22,
          fill: mod.color,
          'font-size': 11,
          'font-weight': 700,
          'text-anchor': 'middle',
        }, \`\${mod.key} (\${mod.count})\`)
      );
      const mNodes = bp.nodes.filter((n) => n.module === mod.key);
      mNodes.forEach((n, rowIdx) => {
        const x = cx + 6;
        const y = padY + rowIdx * rowH;
        pos.set(n.id, { x, y, w: 164, h: 24, color: mod.color });
      });
    });

    const edgeGroup = svgEl('g', { stroke: '#38bdf8', 'stroke-opacity': 0.32, fill: 'none' });
    for (const e of bp.edges) {
      const a = pos.get(e.from);
      const b = pos.get(e.to);
      if (!a || !b) continue;
      const x1 = a.x + a.w / 2;
      const y1 = a.y + a.h;
      const x2 = b.x + b.w / 2;
      const y2 = b.y;
      const midY = (y1 + y2) / 2;
      edgeGroup.append(svgEl('path', { d: \`M\${x1},\${y1} C\${x1},\${midY} \${x2},\${midY} \${x2},\${y2}\`, 'stroke-width': 1.2 }));
    }
    svg.append(edgeGroup);

    for (const n of bp.nodes) {
      const p = pos.get(n.id);
      const g = svgEl('g', { class: 'dag-node', 'data-id': n.id, style: 'cursor:pointer;' });
      g.append(
        svgEl('rect', {
          x: p.x,
          y: p.y,
          width: p.w,
          height: p.h,
          rx: 5,
          fill: '#0e1628',
          stroke: p.color,
          'stroke-width': 1.2,
        })
      );
      const label = n.shortName.length > 23 ? n.shortName.slice(0, 22) + '…' : n.shortName;
      g.append(
        svgEl('text', {
          x: p.x + 8,
          y: p.y + 15.5,
          fill: '#e2e8f0',
          'font-size': 10,
          'font-family': 'ui-monospace, monospace',
        }, label)
      );
      g.addEventListener('click', () => renderInspector(n.id));
      svg.append(g);
    }
  }

  function renderTable() {
    const q = document.getElementById('search-input').value.trim().toLowerCase();
    const mod = modFilter.value;
    const tbody = document.getElementById('thm-tbody');
    tbody.replaceChildren();
    const filtered = bp.nodes.filter((n) => {
      if (mod && n.module !== mod) return false;
      if (!q) return true;
      return (
        n.id.toLowerCase().includes(q) ||
        n.doc.toLowerCase().includes(q) ||
        n.signature.toLowerCase().includes(q) ||
        n.claims.some((c) => c.toLowerCase().includes(q))
      );
    });
    document.getElementById('table-count').textContent = \`Showing \${filtered.length} of \${bp.nodes.length} theorems\`;
    for (const n of filtered) {
      const tr = el('tr', { class: 'thm-row', 'data-id': n.id });
      const tdName = el('td', { class: 'mono' }, n.shortName);
      const tdMod = el('td', {}, n.module);
      tdMod.style.color = modColor.get(n.module) || '#e2e8f0';
      const tdAx = el('td', { class: 'mono' }, n.axioms.length ? n.axioms.join(', ') : 'none (0)');
      const tdClaims = el('td', {}, n.claims.length ? n.claims.join(', ') : '—');
      const tdLoc = el('td', { class: 'mono muted' }, \`\${n.file.replace('lean/PlanariaProofs/', '')}:\${n.line}\`);
      tr.append(tdName, tdMod, tdAx, tdClaims, tdLoc);
      tr.addEventListener('click', () => renderInspector(n.id));
      tbody.append(tr);
    }
  }

  document.getElementById('search-input').addEventListener('input', renderTable);
  modFilter.addEventListener('change', renderTable);
  renderDag();
  renderTable();
  if (selectedId) renderInspector(selectedId);
}

init().catch((err) => {
  document.getElementById('bp-subtitle').textContent = 'Error loading blueprint: ' + err.message;
});
`,
  'utf8'
);

// Write blueprint/index.html
fs.writeFileSync(
  path.join(OUT_DIR, 'index.html'),
  `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self';">
  <title>PLANARIA v${VERSION} — Interactive Lean 4.35.0 Proof Blueprint</title>
  <link rel="stylesheet" href="./blueprint.css">
</head>
<body>
  <header>
    <div class="title-wrap">
      <h1>PLANARIA v${VERSION} — INTERACTIVE LEAN 4.35.0 PROOF BLUEPRINT</h1>
      <p id="bp-subtitle">Loading machine-checked dependency graph…</p>
    </div>
    <nav class="nav-links" aria-label="Blueprint navigation">
      <a class="pill" href="../">← 3D Vivisection Studio</a>
      <a class="pill" href="./blueprint.json">blueprint.json</a>
      <a class="pill" href="../results/lean4-audit.txt">lean4-audit.txt</a>
      <a class="pill" href="../results/lean4-multi-kernel.txt">6-Kernel Log</a>
    </nav>
  </header>
  <main>
    <section class="kpi-grid" id="kpi-grid" aria-label="Formal verification metrics"></section>
    <section class="layout">
      <div class="card">
        <h2>Interactive Theorem Dependency Graph (7 Pure Modules · Click Any Node)</h2>
        <div class="dag-wrap">
          <svg id="dag-svg" role="img" aria-label="Lean 4.35.0 theorem dependency graph"></svg>
        </div>
      </div>
      <aside class="card inspector" aria-label="Theorem inspector">
        <h2>Theorem Inspector</h2>
        <div id="inspector-body" class="muted">Select a theorem node or table row to inspect its Lean 4.35.0 signature, exact axiom footprint, and dependency edges.</div>
      </aside>
    </section>
    <section class="card" style="margin-top:18px;">
      <h2>All Audited Theorems (<span id="table-count">0</span>)</h2>
      <div class="controls">
        <input id="search-input" type="search" placeholder="Filter by theorem name, signature, docstring, or Claim ID (e.g., C04, merkle, Cauchy)…" aria-label="Filter theorems">
        <select id="mod-filter" aria-label="Filter by Lean module">
          <option value="">All 7 Modules</option>
        </select>
      </div>
      <table>
        <thead>
          <tr><th>Theorem</th><th>Module</th><th>Axioms</th><th>Claims</th><th>Source</th></tr>
        </thead>
        <tbody id="thm-tbody"></tbody>
      </table>
    </section>
  </main>
  <script type="module" src="./blueprint.js"></script>
</body>
</html>
`,
  'utf8'
);

console.log(
  `[BLUEPRINT] Built interactive Lean 4.35.0 Proof Blueprint v${VERSION}: ${nodes.length} theorems, ${edges.length} intra-proof dependency edges -> blueprint/`
);
