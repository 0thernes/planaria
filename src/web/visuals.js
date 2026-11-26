/**
 * PLANARIA v2.2 Interactive Visualizations:
 *   1. 192-Cell Holographic Tissue Map Canvas (clickable & draggable live surgery!)
 *   2. Live Organ Vascular Anastomosis Call-Graph Canvas
 *   3. Empirical Survival Phase-Transition Curve (Linear vs RS-Cliff vs PLANARIA 4-Stratum)
 */

import { PLACEMENT_SCHEDULE, BUNDLE_SPECS } from '../core/hbin.js';

const STRATUM_COLORS = [
  '#fbbf24', // S0 Stem Nucleus (Gold)
  '#22d3ee', // S1 Vital Organs (Cyan)
  '#10f5a8', // S2 Cortex & Synth (Emerald)
  '#a855f7', // S3 Full Organism & Genome (Violet)
];

function colorWithAlpha(color, alpha) {
  const a = Math.max(0, Math.min(1, Number.isFinite(alpha) ? alpha : 1));
  if (typeof color === 'string' && color.startsWith('#')) {
    const hex = color.slice(1);
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${a.toFixed(3)})`;
    }
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      return `rgba(${r}, ${g}, ${b}, ${a.toFixed(3)})`;
    }
  }
  return color;
}

function prepareHiDpiCanvas(canvas) {
  if (!canvas || typeof canvas.getContext !== 'function') return null;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  if (!canvas._planariaLogicalW) {
    canvas._planariaLogicalW = canvas.width || 600;
    canvas._planariaLogicalH = canvas.height || 200;
  }
  const W = canvas._planariaLogicalW;
  const H = canvas._planariaLogicalH;
  const dpr = Math.min(typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1, 2);
  const targetW = Math.round(W * dpr);
  const targetH = Math.round(H * dpr);
  if (canvas.width !== targetW || canvas.height !== targetH) {
    canvas.width = targetW;
    canvas.height = targetH;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, W, H, dpr };
}

/**
 * Draw the 24x8 (192-cell) Holographic Cellular Tissue Map.
 * Returns logical layout metrics for pointer hit-testing.
 */
export function drawTissueMap(canvas, decoded, selectedSlot = -1, cutSlot = -1) {
  const prep = prepareHiDpiCanvas(canvas);
  if (!prep) return null;
  const { ctx, W, H } = prep;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#070c11';
  ctx.fillRect(0, 0, W, H);

  const cols = 24;
  const rows = 8;
  const padX = 10;
  const padY = 10;
  const cellW = (W - padX * 2) / cols;
  const cellH = (H - padY * 2) / rows;
  const slotMap = decoded?.slotMap || [];

  for (let slot = 0; slot < 192; slot++) {
    const c = slot % cols;
    const r = Math.floor(slot / cols);
    const x = padX + c * cellW + 2;
    const y = padY + r * cellH + 2;
    const w = cellW - 4;
    const h = cellH - 4;

    const sched = PLACEMENT_SCHEDULE[slot];
    const spec = BUNDLE_SPECS[sched.bundleId];
    const entry = slotMap[slot];

    if (!entry) {
      ctx.fillStyle = '#10161e';
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.25)';
      ctx.beginPath();
      ctx.moveTo(x + 2, y + 2);
      ctx.lineTo(x + w - 2, y + h - 2);
      ctx.stroke();
    } else if (entry.status === 'QUARANTINED') {
      ctx.fillStyle = 'rgba(244, 63, 94, 0.25)';
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
      ctx.fillStyle = '#fda4af';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('!', x + w / 2, y + h / 2 + 0.5);
    } else if (entry.status === 'XENOGRAFT') {
      ctx.fillStyle = 'rgba(232, 121, 249, 0.35)';
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = '#e879f9';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
      ctx.fillStyle = '#f5d0fe';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('X', x + w / 2, y + h / 2 + 0.5);
    } else {
      const col = STRATUM_COLORS[spec.stratum] || '#10f5a8';
      ctx.fillStyle = entry.status === 'REPAIRED' ? 'rgba(251, 191, 36, 0.32)' : `${col}30`;
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = entry.status === 'REPAIRED' ? '#fbbf24' : col;
      ctx.lineWidth = entry.status === 'REPAIRED' ? 1.5 : 1;
      ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);

      ctx.fillStyle = entry.status === 'REPAIRED' ? '#fde68a' : col;
      ctx.font = '8px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        entry.status === 'REPAIRED' ? `+${entry.rsErrorsFixed}` : `S${spec.stratum}`,
        x + w / 2,
        y + h / 2 + 0.5
      );
    }

    if (slot === selectedSlot) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 1, y - 1, w + 2, h + 2);
    }
  }

  if (cutSlot >= 0 && cutSlot < 192) {
    const cutY = padY + Math.floor(cutSlot / cols) * cellH;
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(padX, cutY);
    ctx.lineTo(W - padX, cutY);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  return { cols, rows, padX, padY, cellW, cellH, logicalWidth: W, logicalHeight: H };
}

/**
 * Draw the live Organ Vascular Anastomosis Call-Graph showing real-time routing
 * from KERNEL (S0) through all 7 bundles and fallback stubs.
 */
export function drawAnastomosisGraph(canvas, decoded, routes = [], tick = 0) {
  const prep = prepareHiDpiCanvas(canvas);
  if (!prep) return;
  const { ctx, W, H } = prep;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#070c11';
  ctx.fillRect(0, 0, W, H);

  const nodes = [
    { id: 0, label: 'S0:STEM KERNEL', x: W * 0.14, y: H * 0.50, k: 2, n: 24, stratum: 0 },
    { id: 1, label: 'S1:CORE LOGIC',  x: W * 0.44, y: H * 0.18, k: 4, n: 24, stratum: 1 },
    { id: 2, label: 'S1:WIREFRAME',   x: W * 0.44, y: H * 0.42, k: 4, n: 24, stratum: 1 },
    { id: 3, label: 'S2:CORTEX VIS',  x: W * 0.78, y: H * 0.34, k: 8, n: 32, stratum: 2 },
    { id: 4, label: 'S2:SYNTH AUDIO', x: W * 0.44, y: H * 0.68, k: 6, n: 24, stratum: 2 },
    { id: 5, label: 'S3:ORGANISM FX', x: W * 0.78, y: H * 0.62, k: 16, n: 40, stratum: 3 },
    { id: 6, label: 'S3:GENOME DNA',  x: W * 0.78, y: H * 0.86, k: 8, n: 24, stratum: 3 },
  ];

  const bundles = decoded?.bundles || [];
  const activeBundleSet = new Set(routes.map((r) => r.resolvedBundle));

  // True vascular routing topology: S0 Kernel dispatches directly to each organ bundle
  // (S2 Cortex anastomoses down to S1 Wireframe if amputated — S1 Wireframe never calls S2!)
  const edges = [
    [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6],
  ];

  for (const [a, b] of edges) {
    const na = nodes[a];
    const nb = nodes[b];
    const bunA = bundles[a];
    const bunB = bundles[b];
    const bothViable = Boolean(bunA?.viable && bunB?.viable);
    const isActive = bothViable && activeBundleSet.has(b);
    const isXeno = bunB?.source === 'XENOGRAFT';

    ctx.beginPath();
    ctx.moveTo(na.x, na.y);
    ctx.lineTo(nb.x, nb.y);
    if (!bothViable) {
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.22)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.2;
    } else if (isXeno) {
      ctx.strokeStyle = '#e879f9';
      ctx.setLineDash([]);
      ctx.lineWidth = isActive ? 2.5 : 1.5;
    } else if (isActive) {
      ctx.strokeStyle = STRATUM_COLORS[nb.stratum];
      ctx.setLineDash([]);
      ctx.lineWidth = 2.4;
    } else {
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
      ctx.setLineDash([]);
      ctx.lineWidth = 1.2;
    }
    ctx.stroke();
    ctx.setLineDash([]);

    if (isActive) {
      const t = ((tick * 0.03 + b * 0.17) % 1);
      const px = na.x + (nb.x - na.x) * t;
      const py = na.y + (nb.y - na.y) * t;
      ctx.fillStyle = isXeno ? '#f5d0fe' : '#ffffff';
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  for (const node of nodes) {
    const bun = bundles[node.id];
    const alive = Boolean(bun?.viable);
    const xeno = bun?.source === 'XENOGRAFT';
    const active = alive && activeBundleSet.has(node.id);
    const col = !alive ? '#f43f5e' : xeno ? '#e879f9' : STRATUM_COLORS[node.stratum];

    const bw = 128;
    const bh = 34;
    const x = node.x - bw / 2;
    const y = node.y - bh / 2;

    ctx.fillStyle = '#091018';
    ctx.fillRect(x, y, bw, bh);
    ctx.fillStyle = alive ? (active ? `${col}26` : '#0d151f') : 'rgba(244, 63, 94, 0.14)';
    ctx.fillRect(x, y, bw, bh);
    ctx.strokeStyle = col;
    ctx.lineWidth = active ? 2 : 1;
    ctx.strokeRect(x, y, bw, bh);

    ctx.fillStyle = alive ? '#f1f5f9' : '#fca5a5';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(node.label, node.x, y + 13);

    const found = bun ? bun.cellsFound : 0;
    const tag = xeno
      ? 'XENO'
      : alive
        ? (node.id === 6 ? 'MOUNTED' : (active ? 'LIVE' : 'STANDBY'))
        : 'AMPUTATED';
    ctx.fillStyle = col;
    ctx.font = '9px monospace';
    ctx.fillText(`rank ${found}/${node.k} · ${tag}`, node.x, y + 26);
  }
}

/**
 * Plot the Empirical Survival Phase-Transition Curve comparing:
 *   - Traditional Linear Binary (crimson)
 *   - Single-Stratum RS(40,16) Cliff Binary (amber dashed)
 *   - PLANARIA 4-Stratum Progressive Holographic Binary (emerald)
 */
export function drawSurvivalCurve(canvas, curveData, currentDropPct = 0) {
  const prep = prepareHiDpiCanvas(canvas);
  if (!prep) return;
  const { ctx, W, H } = prep;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#070c11';
  ctx.fillRect(0, 0, W, H);

  const mL = 46, mR = 18, mT = 30, mB = 34;
  const pW = W - mL - mR;
  const pH = H - mT - mB;
  const clampPct = (v) => Math.max(0, Math.min(100, Number.isFinite(v) ? v : 0));

  ctx.strokeStyle = '#182433';
  ctx.lineWidth = 1;
  for (let p = 0; p <= 100; p += 20) {
    const y = mT + pH - (p / 100) * pH;
    ctx.beginPath();
    ctx.moveTo(mL, y);
    ctx.lineTo(mL + pW, y);
    ctx.stroke();
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`${p}%`, mL - 6, y + 3);
  }
  for (let d = 0; d <= 100; d += 20) {
    const x = mL + (d / 100) * pW;
    ctx.beginPath();
    ctx.moveTo(x, mT);
    ctx.lineTo(x, mT + pH);
    ctx.stroke();
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'center';
    ctx.fillText(`${d}%`, x, mT + pH + 15);
  }
  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('TOTAL BINARY DESTRUCTION / ERASURE (%)', mL + pW / 2, H - 5);

  if (!curveData || curveData.length === 0) return;

  function plotSeries(key, color, dash = [], fillAlpha = 0) {
    ctx.beginPath();
    curveData.forEach((pt, idx) => {
      const x = mL + (clampPct(pt.dropPct) / 100) * pW;
      const y = mT + pH - (clampPct(pt[key]) / 100) * pH;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.4;
    ctx.setLineDash(dash);
    ctx.stroke();
    ctx.setLineDash([]);

    if (fillAlpha > 0) {
      const first = curveData[0];
      const last = curveData[curveData.length - 1];
      ctx.lineTo(mL + (clampPct(last.dropPct) / 100) * pW, mT + pH);
      ctx.lineTo(mL + (clampPct(first.dropPct) / 100) * pW, mT + pH);
      ctx.closePath();
      ctx.fillStyle = colorWithAlpha(color, fillAlpha);
      ctx.fill();
    }
  }

  plotSeries('planariaSurvivalPct', '#10f5a8', [], 0.14);
  plotSeries('meanCapabilityScore', '#22d3ee', [3, 3], 0);
  if (curveData.some((pt) => Number.isFinite(pt.rsEqualStorageSurvivalPct))) {
    plotSeries('rsEqualStorageSurvivalPct', '#a855f7', [2, 3], 0);
  }
  plotSeries('rsCliffSurvivalPct', '#fbbf24', [6, 4], 0);
  plotSeries('linearSurvivalPct', '#f43f5e', [], 0);

  const cx = mL + (clampPct(currentDropPct) / 100) * pW;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.lineWidth = 1.2;
  ctx.setLineDash([2, 2]);
  ctx.beginPath();
  ctx.moveTo(cx, mT);
  ctx.lineTo(cx, mT + pH);
  ctx.stroke();
  ctx.setLineDash([]);

  const items = [
    ['PLANARIA Bootable', '#10f5a8'],
    ['Mean Stratum', '#22d3ee'],
    ...(curveData.some((pt) => Number.isFinite(pt.rsEqualStorageSurvivalPct))
      ? [['RS(192,48) Flat', '#a855f7']]
      : []),
    ['RS(40,16) Cliff', '#fbbf24'],
    ['Linear Binary', '#f43f5e'],
  ];
  let lx = mL;
  for (const [label, col] of items) {
    ctx.fillStyle = col;
    ctx.fillRect(lx, 10, 10, 4);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(label, lx + 14, 15);
    lx += ctx.measureText(label).width + 28;
  }
}
