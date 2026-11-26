const SVG_NS = 'http://www.w3.org/2000/svg';

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
    `PLANARIA v${bp.version} · ${bp.toolchain} · autoImplicit=false · 6 Independent Kernels · Zero Mathlib`;

  const kpis = [
    ['Audited Theorems', `${bp.theoremCount} / ${bp.theoremCount}`],
    ['Proof Modules', `${bp.modules.length} pure modules`],
    ['Dependency Edges', `${bp.edgeCount} intra-proof`],
    ['Independent Kernels', `${bp.kernels.length} (Comparator Paranoid)`],
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
    modFilter.append(el('option', { value: m.key }, `${m.title} (${m.count})`));
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
    const axLabel = n.axioms.length === 0 ? '0 axioms (pure kernel)' : `axioms: ${n.axioms.join(', ')}`;
    badges.append(el('span', { class: 'badge' }, axLabel));
    for (const c of n.claims) {
      badges.append(el('span', { class: 'badge badge-claim' }, c));
    }
    box.append(badges);
    if (n.doc) box.append(el('p', { style: 'margin:0 0 10px;font-size:0.86rem;' }, n.doc));
    box.append(el('div', { class: 'muted', style: 'font-size:0.78rem;margin-bottom:4px;' }, `Source: ${n.file}:L${n.line}-L${n.endLine}`));
    box.append(el('pre', { class: 'mono' }, n.signature));

    const depWrap = el('div', { style: 'margin-top:10px;font-size:0.82rem;' });
    depWrap.append(el('strong', {}, `Uses (${n.dependencies.length}): `));
    depWrap.append(document.createTextNode(n.dependencies.length ? n.dependencies.map((d) => d.split('.').pop()).join(', ') : 'Definitions / Spec.lean only'));
    box.append(depWrap);

    const rev = dependents.get(n.id) || [];
    const revWrap = el('div', { style: 'margin-top:6px;font-size:0.82rem;' });
    revWrap.append(el('strong', {}, `Used by (${rev.length}): `));
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
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
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
        }, `${mod.key} (${mod.count})`)
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
      edgeGroup.append(svgEl('path', { d: `M${x1},${y1} C${x1},${midY} ${x2},${midY} ${x2},${y2}`, 'stroke-width': 1.2 }));
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
    document.getElementById('table-count').textContent = `Showing ${filtered.length} of ${bp.nodes.length} theorems`;
    for (const n of filtered) {
      const tr = el('tr', { class: 'thm-row', 'data-id': n.id });
      const tdName = el('td', { class: 'mono' }, n.shortName);
      const tdMod = el('td', {}, n.module);
      tdMod.style.color = modColor.get(n.module) || '#e2e8f0';
      const tdAx = el('td', { class: 'mono' }, n.axioms.length ? n.axioms.join(', ') : 'none (0)');
      const tdClaims = el('td', {}, n.claims.length ? n.claims.join(', ') : '—');
      const tdLoc = el('td', { class: 'mono muted' }, `${n.file.replace('lean/PlanariaProofs/', '')}:${n.line}`);
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
