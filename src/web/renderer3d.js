/**
 * PLANARIA v2.2 — Custom Zero-Dependency WebGL2 (GLSL 300 es) 3D Temporal-Quantum Renderer
 *
 * Features:
 *   - Multi-layer sky gradient & relativistic scale-order atmosphere shader (6 Orders: 10^-15m -> 10^9m)
 *   - Live GPU-evaluated multi-source Schrödinger wave-interference 3D arena floor with real per-source phase
 *   - Procedural 3D meshes with outward CCW winding, inverse-transpose normal matrices, and clean wireframe EBOs
 *   - 192 live orbiting 3D .hbin Holographic Cell Crystals reflecting real byte-level damage/RS-heal/quarantine/xenograft
 *   - Real-time Stratum visual metamorphosis: S3 Full Volumetric -> S2 Shaded -> S1 3D Wireframe -> S0 Ghost Point-Cloud
 *   - Bell/GHZ Entanglement Filaments, Retrocausal Future-Cones, Past-Timeline Echo Clones, Spherical Chrono-Wells
 *   - Context-loss recovery, explicit opaque/translucent pass separation, and full GPU resource disposal
 */

import { PLACEMENT_SCHEDULE, BUNDLE_SPECS } from '../core/hbin.js';

// ============================================================================
// MINIMAL 4x4 MATRIX & VECTOR MATH (ZERO DEPENDENCIES)
// ============================================================================
function mat4Perspective(fovyRad, aspect, near, far, out = new Float32Array(16)) {
  out.fill(0);
  const f = 1.0 / Math.tan(fovyRad / 2);
  const nf = 1 / (near - far);
  out[0] = f / aspect;
  out[5] = f;
  out[10] = (far + near) * nf;
  out[11] = -1;
  out[14] = 2 * far * near * nf;
  return out;
}

function mat4LookAt(eye, target, up, out = new Float32Array(16)) {
  let zx = eye[0] - target[0], zy = eye[1] - target[1], zz = eye[2] - target[2];
  let len = Math.hypot(zx, zy, zz) || 1;
  zx /= len; zy /= len; zz /= len;

  let xx = up[1] * zz - up[2] * zy;
  let xy = up[2] * zx - up[0] * zz;
  let xz = up[0] * zy - up[1] * zx;
  len = Math.hypot(xx, xy, xz) || 1;
  xx /= len; xy /= len; xz /= len;

  const yx = zy * xz - zz * xy;
  const yy = zz * xx - zx * xz;
  const yz = zx * xy - zy * xx;

  out[0] = xx; out[1] = yx; out[2] = zx; out[3] = 0;
  out[4] = xy; out[5] = yy; out[6] = zy; out[7] = 0;
  out[8] = xz; out[9] = yz; out[10] = zz; out[11] = 0;
  out[12] = -(xx * eye[0] + xy * eye[1] + xz * eye[2]);
  out[13] = -(yx * eye[0] + yy * eye[1] + yz * eye[2]);
  out[14] = -(zx * eye[0] + zy * eye[1] + zz * eye[2]);
  out[15] = 1;
  return out;
}

function mat4Mul(a, b, out = new Float32Array(16)) {
  for (let c = 0; c < 4; c++) {
    const c4 = c * 4;
    const b0 = b[c4], b1 = b[c4 + 1], b2 = b[c4 + 2], b3 = b[c4 + 3];
    out[c4 + 0] = a[0] * b0 + a[4] * b1 + a[8] * b2 + a[12] * b3;
    out[c4 + 1] = a[1] * b0 + a[5] * b1 + a[9] * b2 + a[13] * b3;
    out[c4 + 2] = a[2] * b0 + a[6] * b1 + a[10] * b2 + a[14] * b3;
    out[c4 + 3] = a[3] * b0 + a[7] * b1 + a[11] * b2 + a[15] * b3;
  }
  return out;
}

function mat4TRS(tx, ty, tz, rx, ry, rz, sx, sy, sz, out = new Float32Array(16)) {
  const cx = Math.cos(rx), sxr = Math.sin(rx);
  const cy = Math.cos(ry), syr = Math.sin(ry);
  const cz = Math.cos(rz), szr = Math.sin(rz);

  // R = Ry * Rx * Rz
  const m00 = cy * cz + syr * sxr * szr;
  const m01 = cx * szr;
  const m02 = -syr * cz + cy * sxr * szr;

  const m10 = -cy * szr + syr * sxr * cz;
  const m11 = cx * cz;
  const m12 = syr * szr + cy * sxr * cz;

  const m20 = syr * cx;
  const m21 = -sxr;
  const m22 = cy * cx;

  out[0] = m00 * sx; out[1] = m01 * sx; out[2] = m02 * sx; out[3] = 0;
  out[4] = m10 * sy; out[5] = m11 * sy; out[6] = m12 * sy; out[7] = 0;
  out[8] = m20 * sz; out[9] = m21 * sz; out[10] = m22 * sz; out[11] = 0;
  out[12] = tx;      out[13] = ty;      out[14] = tz;      out[15] = 1;
  return out;
}

/**
 * Compute inverse-transpose of the upper-left 3x3 of column-major 4x4 matrix `m`.
 * Falls back safely to identity if `m` is degenerate (|det| < 1e-12), avoiding GPU NaN.
 */
function mat3NormalFromMat4(m, out = new Float32Array(9)) {
  const a00 = m[0], a01 = m[1], a02 = m[2];
  const a10 = m[4], a11 = m[5], a12 = m[6];
  const a20 = m[8], a21 = m[9], a22 = m[10];

  const b01 = a22 * a11 - a12 * a21;
  const b11 = -a22 * a10 + a12 * a20;
  const b21 = a21 * a10 - a11 * a20;

  const det = a00 * b01 + a01 * b11 + a02 * b21;
  if (!Number.isFinite(det) || Math.abs(det) < 1e-12) {
    out[0] = 1; out[1] = 0; out[2] = 0;
    out[3] = 0; out[4] = 1; out[5] = 0;
    out[6] = 0; out[7] = 0; out[8] = 1;
    return out;
  }
  const invDet = 1.0 / det;
  // Column-major inverse-transpose = cofactor matrix / det
  out[0] = b01 * invDet;
  out[1] = b11 * invDet;
  out[2] = b21 * invDet;
  out[3] = (-a22 * a01 + a02 * a21) * invDet;
  out[4] = (a22 * a00 - a02 * a20) * invDet;
  out[5] = (-a21 * a00 + a01 * a20) * invDet;
  out[6] = (a12 * a01 - a02 * a11) * invDet;
  out[7] = (-a12 * a00 + a02 * a10) * invDet;
  out[8] = (a11 * a00 - a01 * a10) * invDet;
  return out;
}

// ============================================================================
// PROCEDURAL 3D MESH BUILDERS (OUTWARD CCW WINDING + DEDUP WIREFRAME EDGES)
// ============================================================================
function buildTriangleBuffer(verts, tris) {
  const out = [];
  for (let t = 0; t < tris.length; t += 3) {
    const a = verts[tris[t]];
    const b = verts[tris[t + 1]];
    const c = verts[tris[t + 2]];
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
    const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    let nx = uy * vz - uz * vy;
    let ny = uz * vx - ux * vz;
    let nz = ux * vy - uy * vx;
    const l = Math.hypot(nx, ny, nz) || 1;
    nx /= l; ny /= l; nz /= l;
    out.push(
      a[0], a[1], a[2], nx, ny, nz,
      b[0], b[1], b[2], nx, ny, nz,
      c[0], c[1], c[2], nx, ny, nz
    );
  }
  return new Float32Array(out);
}

/**
 * Extract deduplicated triangle boundary edges as an index array into a
 * 6-float-per-vertex (pos3 + norm3) triangle vertex buffer.
 */
function buildWireframeEdges(floatArr) {
  const vertCount = floatArr.length / 6;
  const seen = new Set();
  const indices = [];
  const keyOf = (vi) => {
    const o = vi * 6;
    return `${Math.round(floatArr[o] * 1000)},${Math.round(floatArr[o + 1] * 1000)},${Math.round(floatArr[o + 2] * 1000)}`;
  };
  const pushEdge = (i0, i1) => {
    const k0 = keyOf(i0);
    const k1 = keyOf(i1);
    if (k0 === k1) return;
    const ek = k0 < k1 ? `${k0}|${k1}` : `${k1}|${k0}`;
    if (seen.has(ek)) return;
    seen.add(ek);
    indices.push(i0, i1);
  };
  for (let i = 0; i + 2 < vertCount; i += 3) {
    pushEdge(i, i + 1);
    pushEdge(i + 1, i + 2);
    pushEdge(i + 2, i);
  }
  return vertCount <= 65535 ? new Uint16Array(indices) : new Uint32Array(indices);
}

function makeOctahedron() {
  const v = [[0, 1, 0], [1, 0, 0], [0, 0, 1], [-1, 0, 0], [0, 0, -1], [0, -1, 0]];
  const t = [0, 2, 1, 0, 3, 2, 0, 4, 3, 0, 1, 4, 5, 1, 2, 5, 2, 3, 5, 3, 4, 5, 4, 1];
  return buildTriangleBuffer(v, t);
}

function makePyramid() {
  const v = [[0, 0, 1.35], [-0.85, -0.35, -0.8], [0.85, -0.35, -0.8], [0, 0.55, -0.55]];
  // Outward-facing CCW triangle winding for all 4 faces
  const t = [0, 3, 1, 0, 2, 3, 0, 1, 2, 1, 3, 2];
  return buildTriangleBuffer(v, t);
}

function makeCube() {
  const v = [
    [-0.7, -0.7, -0.7], [0.7, -0.7, -0.7], [0.7, 0.7, -0.7], [-0.7, 0.7, -0.7],
    [-0.7, -0.7,  0.7], [0.7, -0.7,  0.7], [0.7, 0.7,  0.7], [-0.7, 0.7,  0.7],
  ];
  const t = [
    4, 5, 6, 4, 6, 7, 1, 0, 3, 1, 3, 2,
    0, 4, 7, 0, 7, 3, 5, 1, 2, 5, 2, 6,
    3, 7, 6, 3, 6, 2, 0, 1, 5, 0, 5, 4,
  ];
  return buildTriangleBuffer(v, t);
}

function makeIcosahedron() {
  const phi = (1 + Math.sqrt(5)) / 2;
  const raw = [
    [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
    [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
    [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1],
  ];
  const v = raw.map(([x, y, z]) => {
    const l = Math.hypot(x, y, z);
    return [x / l, y / l, z / l];
  });
  const t = [
    0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11,
    1, 5, 9, 5, 11, 4, 11, 10, 2, 10, 7, 6, 7, 1, 8,
    3, 9, 4, 3, 4, 2, 3, 2, 6, 3, 6, 8, 3, 8, 9,
    4, 9, 5, 2, 4, 11, 6, 2, 10, 8, 6, 7, 9, 8, 1,
  ];
  return buildTriangleBuffer(v, t);
}

function makeCylinder(segs = 8) {
  const out = [];
  for (let i = 0; i < segs; i++) {
    const a0 = (i / segs) * Math.PI * 2;
    const a1 = ((i + 1) / segs) * Math.PI * 2;
    const c0 = Math.cos(a0), s0 = Math.sin(a0);
    const c1 = Math.cos(a1), s1 = Math.sin(a1);
    const nx = Math.cos((a0 + a1) * 0.5), nz = Math.sin((a0 + a1) * 0.5);
    // Outward-facing CCW winding for side quad + top cap
    out.push(
      c0, 0, s0, nx, 0, nz,  c1, 1, s1, nx, 0, nz,  c1, 0, s1, nx, 0, nz,
      c0, 0, s0, nx, 0, nz,  c0, 1, s0, nx, 0, nz,  c1, 1, s1, nx, 0, nz,
      0, 1, 0, 0, 1, 0,  c1, 1, s1, 0, 1, 0,  c0, 1, s0, 0, 1, 0
    );
  }
  return new Float32Array(out);
}

function makeTorus(R = 1.0, r = 0.14, uSegs = 28, vSegs = 8) {
  const out = [];
  const pt = (u, v) => {
    const cu = Math.cos(u), su = Math.sin(u);
    const cv = Math.cos(v), sv = Math.sin(v);
    const rr = R + r * cv;
    return [rr * cu, r * sv, rr * su, cv * cu, sv, cv * su];
  };
  for (let i = 0; i < uSegs; i++) {
    const u0 = (i / uSegs) * Math.PI * 2;
    const u1 = ((i + 1) / uSegs) * Math.PI * 2;
    for (let j = 0; j < vSegs; j++) {
      const v0 = (j / vSegs) * Math.PI * 2;
      const v1 = ((j + 1) / vSegs) * Math.PI * 2;
      const p00 = pt(u0, v0), p10 = pt(u1, v0), p11 = pt(u1, v1), p01 = pt(u0, v1);
      // Outward-facing CCW winding matching analytic outward surface normals
      out.push(...p00, ...p11, ...p10, ...p00, ...p01, ...p11);
    }
  }
  return new Float32Array(out);
}

function makeArenaFloor(gridN = 64, halfExtent = 36) {
  const verts = [];
  const step = (halfExtent * 2) / gridN;
  const cols = gridN + 1;
  for (let gz = 0; gz <= gridN; gz++) {
    const z = -halfExtent + gz * step;
    for (let gx = 0; gx <= gridN; gx++) {
      const x = -halfExtent + gx * step;
      verts.push(x, z);
    }
  }
  const triIndices = [];
  const lineIndices = [];
  for (let gz = 0; gz < gridN; gz++) {
    for (let gx = 0; gx < gridN; gx++) {
      const i00 = gz * cols + gx;
      const i10 = i00 + 1;
      const i01 = i00 + cols;
      const i11 = i01 + 1;
      triIndices.push(i00, i10, i11, i00, i11, i01);
      lineIndices.push(i00, i10, i00, i01);
      if (gx === gridN - 1) lineIndices.push(i10, i11);
      if (gz === gridN - 1) lineIndices.push(i01, i11);
    }
  }
  return {
    vertices: new Float32Array(verts),
    triIndices: new Uint16Array(triIndices),
    lineIndices: new Uint16Array(lineIndices),
    pointCount: cols * cols,
  };
}

// ============================================================================
// GLSL 300 ES SHADERS
// ============================================================================
const SKY_VS = `#version 300 es
out vec2 vUv;
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  vUv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.9999, 1.0);
}`;

const SKY_FS = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform vec3 uSkyTop;
uniform vec3 uSkyHorizon;
uniform vec3 uAccent;
uniform float uTime;
uniform float uRewind;
uniform float uStratum;
uniform float uXeno;

void main() {
  float h = clamp(vUv.y, 0.0, 1.0);
  vec3 col = mix(uSkyHorizon, uSkyTop, pow(max(h, 1e-5), 0.65));
  float horizonGlow = exp(-abs(h - 0.36) * 14.0);
  vec3 accent = uXeno > 0.5 ? vec3(0.91, 0.47, 0.98) : uAccent;
  col += accent * horizonGlow * (0.28 + 0.08 * sin(uTime * 1.4));

  vec2 g = floor(vUv * vec2(180.0, 100.0));
  float rnd = fract(sin(dot(g, vec2(12.9898, 78.233))) * 43758.5453);
  if (rnd > 0.992 && h > 0.32) {
    float tw = 0.5 + 0.5 * sin(uTime * 3.5 + rnd * 90.0);
    col += mix(vec3(0.7, 0.9, 1.0), accent, 0.4) * tw * 0.65;
  }

  if (uStratum < 0.5) col *= 0.25;
  if (uRewind > 0.5) {
    col = mix(col, vec3(0.05, 0.25, 0.42) + col.bgr * 0.65, 0.55);
  }
  fragColor = vec4(col, 1.0);
}`;

const FLOOR_VS = `#version 300 es
layout(location = 0) in vec2 aXZ;
uniform mat4 uViewProj;
uniform vec4 uWaveSrc[5];   // (x, z, k, omega)
uniform float uWaveAmp[5];
uniform float uWavePhase[5]; // CPU float64-reduced (phase - omega * t) mod 2pi
uniform float uStratum;
out vec3 vWorldPos;
out float vWaveI;

void main() {
  float sr = 0.0;
  float si = 0.0;
  for (int i = 0; i < 5; i++) {
    vec2 d = aXZ - uWaveSrc[i].xy;
    float r = sqrt(dot(d, d) + 0.35);
    float a = uWaveAmp[i] / (1.0 + 0.08 * r);
    float ph = uWaveSrc[i].z * r + uWavePhase[i];
    sr += a * cos(ph);
    si += a * sin(ph);
  }
  float intensity = sr * sr + si * si;
  float y = (uStratum >= 1.5 ? 0.42 : 0.14) * clamp(intensity - 0.6, -0.7, 2.2);
  vec3 wp = vec3(aXZ.x, y, aXZ.y);
  vWorldPos = wp;
  vWaveI = intensity;
  gl_Position = uViewProj * vec4(wp, 1.0);
  gl_PointSize = 2.5;
}`;

const FLOOR_FS = `#version 300 es
precision highp float;
in vec3 vWorldPos;
in float vWaveI;
out vec4 fragColor;
uniform vec3 uGridColor;
uniform vec3 uAccent;
uniform vec3 uFogColor;
uniform vec3 uCameraPos;
uniform float uTime;
uniform float uStratum;
uniform float uXeno;
uniform float uRewind;

void main() {
  float r = length(vWorldPos.xz);
  if (r > 35.5) discard;

  // Uniform branch avoids undefined fwidth() derivatives on GL_LINES / GL_POINTS (S1 / S0)
  float line = 1.0;
  if (uStratum >= 1.5) {
    vec2 grid = abs(fract(vWorldPos.xz * 0.5 - 0.5) - 0.5) / max(fwidth(vWorldPos.xz * 0.5), vec2(0.001));
    line = 1.0 - min(min(grid.x, grid.y), 1.0);
  }

  float ring = smoothstep(0.18, 0.0, abs(fract(r / 8.0) - 0.5));
  float rim = smoothstep(32.5, 35.2, r);

  vec3 gCol = uXeno > 0.5 ? mix(uGridColor, vec3(0.91, 0.47, 0.98), 0.65) : uGridColor;
  vec3 base = vec3(0.02, 0.04, 0.07);

  float ridge = smoothstep(0.9, 2.4, vWaveI);
  vec3 col = base
    + gCol * line * (uStratum < 0.5 ? 0.35 : 0.48)
    + uAccent * ridge * (uStratum >= 2.5 ? 0.65 : 0.35)
    + gCol * ring * 0.28
    + uAccent * rim * 0.9;

  if (uStratum < 0.5) {
    col = vec3(0.98, 0.75, 0.14) * (0.45 + 0.55 * ridge);
  }
  if (uRewind > 0.5) {
    col = mix(col, vec3(0.13, 0.83, 0.93), 0.25);
  }

  float dist = length(uCameraPos - vWorldPos);
  float fog = 1.0 - exp(-dist * 0.013);
  col = mix(col, uFogColor, clamp(fog, 0.0, 0.88));
  fragColor = vec4(col, 0.94);
}`;

const MESH_VS = `#version 300 es
layout(location = 0) in vec3 aPos;
layout(location = 1) in vec3 aNorm;
uniform mat4 uViewProj;
uniform mat4 uModel;
uniform mat3 uNormalMat;
out vec3 vWorldPos;
out vec3 vNormal;

void main() {
  vec4 wp = uModel * vec4(aPos, 1.0);
  vWorldPos = wp.xyz;
  vec3 wn = uNormalMat * aNorm;
  vNormal = length(wn) > 1e-6 ? normalize(wn) : vec3(0.0, 1.0, 0.0);
  gl_Position = uViewProj * wp;
  gl_PointSize = 3.5;
}`;

const MESH_FS = `#version 300 es
precision highp float;
in vec3 vWorldPos;
in vec3 vNormal;
out vec4 fragColor;
uniform vec3 uColor;
uniform vec3 uEmissive;
uniform vec3 uCameraPos;
uniform vec3 uFogColor;
uniform float uAlpha;
uniform float uFresnelPow;

void main() {
  vec3 N = length(vNormal) > 1e-6 ? normalize(vNormal) : vec3(0.0, 1.0, 0.0);
  vec3 toCam = uCameraPos - vWorldPos;
  vec3 V = length(toCam) > 1e-6 ? normalize(toCam) : vec3(0.0, 0.0, 1.0);
  vec3 L1 = normalize(vec3(0.45, 0.85, 0.35));
  vec3 L2 = normalize(vec3(-0.6, 0.3, -0.7));

  float diff = max(dot(N, L1), 0.0) * 0.78 + max(dot(N, L2), 0.0) * 0.32 + 0.22;
  vec3 hv = L1 + V;
  vec3 H = length(hv) > 1e-6 ? normalize(hv) : N;
  float spec = pow(max(dot(N, H), 1e-5), 28.0) * 0.55;
  float fresnel = pow(clamp(1.0 - max(dot(N, V), 0.0), 1e-5, 1.0), max(1.0, uFresnelPow));

  vec3 col = uColor * diff + uEmissive * (0.55 + fresnel * 1.15) + vec3(spec);
  float dist = length(toCam);
  float fog = 1.0 - exp(-dist * 0.011);
  col = mix(col, uFogColor, clamp(fog, 0.0, 0.78));
  fragColor = vec4(col, uAlpha);
}`;

const LINE_VS = `#version 300 es
layout(location = 0) in vec3 aPos;
layout(location = 1) in vec4 aCol;
uniform mat4 uViewProj;
out vec4 vCol;
void main() {
  vCol = aCol;
  gl_Position = uViewProj * vec4(aPos, 1.0);
  gl_PointSize = 4.0;
}`;

const LINE_FS = `#version 300 es
precision highp float;
in vec4 vCol;
out vec4 fragColor;
void main() {
  fragColor = vCol;
}`;

const POINT_VS = `#version 300 es
layout(location = 0) in vec3 aPos;
layout(location = 1) in vec4 aCol;
layout(location = 2) in float aSize;
uniform mat4 uViewProj;
out vec4 vCol;
void main() {
  vCol = aCol;
  vec4 p = uViewProj * vec4(aPos, 1.0);
  gl_Position = p;
  gl_PointSize = clamp(aSize * 260.0 / max(1.0, p.w), 2.0, 26.0);
}`;

const POINT_FS = `#version 300 es
precision highp float;
in vec4 vCol;
out vec4 fragColor;
void main() {
  vec2 d = gl_PointCoord - 0.5;
  float r = dot(d, d);
  if (r > 0.25) discard;
  float glow = exp(-r * 14.0);
  fragColor = vec4(vCol.rgb * (0.7 + glow * 0.9), vCol.a * glow);
}`;

const STRATUM_RGB = [
  [0.98, 0.75, 0.14], // S0 Gold
  [0.13, 0.83, 0.93], // S1 Cyan
  [0.06, 0.96, 0.66], // S2 Emerald
  [0.66, 0.33, 0.97], // S3 Violet
];

export class Renderer3D {
  constructor(canvas) {
    if (!canvas) throw new Error('Renderer3D requires a valid canvas element.');
    this.canvas = canvas;
    const gl = canvas.getContext('webgl2', { antialias: true, alpha: false, powerPreference: 'high-performance' });
    if (!gl) throw new Error('WebGL2 not supported in this browser.');
    this.gl = gl;

    this.camYaw = 0.45;
    this.camPitch = 0.52;
    this.camDist = 30.0;
    this.targetX = 0;
    this.targetZ = 0;

    this._contextLost = false;
    this._disposed = false;
    this._programs = [];
    this._vaos = [];
    this._buffers = [];

    this._modelMat = new Float32Array(16);
    this._normalMat = new Float32Array(9);
    this._projMat = new Float32Array(16);
    this._viewMat = new Float32Array(16);
    this._vpMat = new Float32Array(16);
    this._lastRenderMs = typeof performance !== 'undefined' ? performance.now() : 0;
    this.onContextStateChange = null;
    this._waveSrcFlat = new Float32Array(20);
    this._waveAmpFlat = new Float32Array(5);
    this._wavePhaseFlat = new Float32Array(5);
    this._lineData = new Float32Array(12000 * 7);
    this._pointData = new Float32Array(600 * 8);

    this._cssW = canvas.clientWidth || 640;
    this._cssH = canvas.clientHeight || 360;
    this._resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined') {
      this._resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const cr = entry.contentRect;
          if (cr.width > 0 && cr.height > 0) {
            this._cssW = cr.width;
            this._cssH = cr.height;
          }
        }
      });
      this._resizeObserver.observe(canvas);
    }

    this._onContextLost = (e) => {
      e.preventDefault();
      this._contextLost = true;
      if (typeof this.onContextStateChange === 'function') this.onContextStateChange(true);
    };
    this._onContextRestored = () => {
      if (this._disposed) return;
      this._programs = [];
      this._vaos = [];
      this._buffers = [];
      try {
        this._initPrograms();
        this._initMeshes();
        this._contextLost = false;
        if (typeof this.onContextStateChange === 'function') this.onContextStateChange(false);
      } catch {
        this._contextLost = true;
        if (typeof this.onContextStateChange === 'function') this.onContextStateChange(true);
      }
    };
    canvas.addEventListener('webglcontextlost', this._onContextLost, false);
    canvas.addEventListener('webglcontextrestored', this._onContextRestored, false);

    try {
      this._initPrograms();
      this._initMeshes();
    } catch (err) {
      this.dispose();
      throw err;
    }
  }

  _compileShader(type, src) {
    const gl = this.gl;
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(s);
      gl.deleteShader(s);
      throw new Error(`Shader compile error: ${log}`);
    }
    return s;
  }

  _linkProgram(vsSrc, fsSrc) {
    const gl = this.gl;
    const vs = this._compileShader(gl.VERTEX_SHADER, vsSrc);
    let fs = null;
    let p = null;
    try {
      fs = this._compileShader(gl.FRAGMENT_SHADER, fsSrc);
      p = gl.createProgram();
      gl.attachShader(p, vs);
      gl.attachShader(p, fs);
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
        const log = gl.getProgramInfoLog(p);
        gl.deleteProgram(p);
        p = null;
        throw new Error(`Program link error: ${log}`);
      }
      this._programs.push(p);
      return p;
    } finally {
      if (p) {
        if (vs) gl.detachShader(p, vs);
        if (fs) gl.detachShader(p, fs);
      }
      if (vs) gl.deleteShader(vs);
      if (fs) gl.deleteShader(fs);
    }
  }

  _initPrograms() {
    const gl = this.gl;
    this.skyProg = this._linkProgram(SKY_VS, SKY_FS);
    this.floorProg = this._linkProgram(FLOOR_VS, FLOOR_FS);
    this.meshProg = this._linkProgram(MESH_VS, MESH_FS);
    this.lineProg = this._linkProgram(LINE_VS, LINE_FS);
    this.pointProg = this._linkProgram(POINT_VS, POINT_FS);

    this.uSky = {
      top: gl.getUniformLocation(this.skyProg, 'uSkyTop'),
      horizon: gl.getUniformLocation(this.skyProg, 'uSkyHorizon'),
      accent: gl.getUniformLocation(this.skyProg, 'uAccent'),
      time: gl.getUniformLocation(this.skyProg, 'uTime'),
      rewind: gl.getUniformLocation(this.skyProg, 'uRewind'),
      stratum: gl.getUniformLocation(this.skyProg, 'uStratum'),
      xeno: gl.getUniformLocation(this.skyProg, 'uXeno'),
    };
    this.uFloor = {
      vp: gl.getUniformLocation(this.floorProg, 'uViewProj'),
      time: gl.getUniformLocation(this.floorProg, 'uTime'),
      waveSrc: gl.getUniformLocation(this.floorProg, 'uWaveSrc'),
      waveAmp: gl.getUniformLocation(this.floorProg, 'uWaveAmp'),
      wavePhase: gl.getUniformLocation(this.floorProg, 'uWavePhase'),
      gridCol: gl.getUniformLocation(this.floorProg, 'uGridColor'),
      accent: gl.getUniformLocation(this.floorProg, 'uAccent'),
      fogCol: gl.getUniformLocation(this.floorProg, 'uFogColor'),
      camPos: gl.getUniformLocation(this.floorProg, 'uCameraPos'),
      stratum: gl.getUniformLocation(this.floorProg, 'uStratum'),
      xeno: gl.getUniformLocation(this.floorProg, 'uXeno'),
      rewind: gl.getUniformLocation(this.floorProg, 'uRewind'),
    };
    this.uMesh = {
      vp: gl.getUniformLocation(this.meshProg, 'uViewProj'),
      model: gl.getUniformLocation(this.meshProg, 'uModel'),
      normalMat: gl.getUniformLocation(this.meshProg, 'uNormalMat'),
      color: gl.getUniformLocation(this.meshProg, 'uColor'),
      emissive: gl.getUniformLocation(this.meshProg, 'uEmissive'),
      camPos: gl.getUniformLocation(this.meshProg, 'uCameraPos'),
      fogCol: gl.getUniformLocation(this.meshProg, 'uFogColor'),
      alpha: gl.getUniformLocation(this.meshProg, 'uAlpha'),
      fresnel: gl.getUniformLocation(this.meshProg, 'uFresnelPow'),
    };
    this.uLineVP = gl.getUniformLocation(this.lineProg, 'uViewProj');
    this.uPointVP = gl.getUniformLocation(this.pointProg, 'uViewProj');
  }

  _uploadMesh(floatArr) {
    const gl = this.gl;
    const edges = buildWireframeEdges(floatArr);
    const vbo = gl.createBuffer();
    const ebo = gl.createBuffer();
    const vao = gl.createVertexArray();
    this._buffers.push(vbo, ebo);
    this._vaos.push(vao);

    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, floatArr, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 24, 12);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, edges, gl.STATIC_DRAW);
    gl.bindVertexArray(null);

    return {
      vao,
      count: floatArr.length / 6,
      edgeCount: edges.length,
      edgeType: edges instanceof Uint32Array ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT,
    };
  }

  _initMeshes() {
    const gl = this.gl;
    this.emptyVao = gl.createVertexArray();
    this._vaos.push(this.emptyVao);

    // Arena Wave-Interference Floor VAOs (shared vertex buffer + clean tri & grid line EBOs)
    const floor = makeArenaFloor(64, 36);
    const floorVbo = gl.createBuffer();
    const floorTriEbo = gl.createBuffer();
    const floorLineEbo = gl.createBuffer();
    this._buffers.push(floorVbo, floorTriEbo, floorLineEbo);

    gl.bindBuffer(gl.ARRAY_BUFFER, floorVbo);
    gl.bufferData(gl.ARRAY_BUFFER, floor.vertices, gl.STATIC_DRAW);

    this.floorTriVao = gl.createVertexArray();
    this._vaos.push(this.floorTriVao);
    gl.bindVertexArray(this.floorTriVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, floorVbo);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 8, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, floorTriEbo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, floor.triIndices, gl.STATIC_DRAW);
    this.floorTriCount = floor.triIndices.length;

    this.floorLineVao = gl.createVertexArray();
    this._vaos.push(this.floorLineVao);
    gl.bindVertexArray(this.floorLineVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, floorVbo);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 8, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, floorLineEbo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, floor.lineIndices, gl.STATIC_DRAW);
    this.floorLineCount = floor.lineIndices.length;
    this.floorPointCount = floor.pointCount;
    gl.bindVertexArray(null);

    // Deduplicated procedural meshes (shared VAOs for identical base geometries)
    const octa = this._uploadMesh(makeOctahedron());
    const pyramid = this._uploadMesh(makePyramid());
    const cube = this._uploadMesh(makeCube());
    const ico = this._uploadMesh(makeIcosahedron());
    const torus = this._uploadMesh(makeTorus(1.0, 0.22, 24, 8));
    const ring = this._uploadMesh(makeTorus(1.0, 0.011, 48, 6));
    const pillar = this._uploadMesh(makeCylinder(8));

    this.meshes = {
      OCTA: octa,
      DIAMOND: octa,
      PYRAMID: pyramid,
      SPIKE: pyramid,
      CUBE: cube,
      ICO: ico,
      BOSS: ico,
      TORUS: torus,
      RING: ring,
      PILLAR: pillar,
    };

    // Dynamic Line Buffer VAO (pos3 + rgba4)
    this.lineVao = gl.createVertexArray();
    this.lineVbo = gl.createBuffer();
    this._vaos.push(this.lineVao);
    this._buffers.push(this.lineVbo);
    gl.bindVertexArray(this.lineVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.lineVbo);
    gl.bufferData(gl.ARRAY_BUFFER, 12000 * 7 * 4, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 28, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 28, 12);
    gl.bindVertexArray(null);

    // Dynamic Point Buffer VAO (pos3 + rgba4 + size1)
    this.pointVao = gl.createVertexArray();
    this.pointVbo = gl.createBuffer();
    this._vaos.push(this.pointVao);
    this._buffers.push(this.pointVbo);
    gl.bindVertexArray(this.pointVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.pointVbo);
    gl.bufferData(gl.ARRAY_BUFFER, 600 * 8 * 4, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 32, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 32, 12);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 1, gl.FLOAT, false, 32, 28);
    gl.bindVertexArray(null);
  }

  _drawMesh(mesh, tx, ty, tz, rx, ry, rz, sx, sy, sz, col, em, alpha = 1.0, fresnel = 2.4, drawMode = null) {
    const gl = this.gl;
    mat4TRS(tx, ty, tz, rx, ry, rz, sx, sy, sz, this._modelMat);
    mat3NormalFromMat4(this._modelMat, this._normalMat);
    gl.uniformMatrix4fv(this.uMesh.model, false, this._modelMat);
    gl.uniformMatrix3fv(this.uMesh.normalMat, false, this._normalMat);
    gl.uniform3fv(this.uMesh.color, col);
    gl.uniform3fv(this.uMesh.emissive, em);
    gl.uniform1f(this.uMesh.alpha, alpha);
    gl.uniform1f(this.uMesh.fresnel, fresnel);
    gl.bindVertexArray(mesh.vao);
    const mode = drawMode !== null ? drawMode : gl.TRIANGLES;
    if (mode === gl.LINES) {
      gl.drawElements(gl.LINES, mesh.edgeCount, mesh.edgeType, 0);
    } else {
      gl.drawArrays(mode, 0, mesh.count);
    }
  }

  /** Release all WebGL2 resources, observers, and event listeners. */
  dispose() {
    if (this._disposed) return;
    this._disposed = true;
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
    this.canvas.removeEventListener('webglcontextlost', this._onContextLost);
    this.canvas.removeEventListener('webglcontextrestored', this._onContextRestored);
    const gl = this.gl;
    if (gl && !gl.isContextLost()) {
      for (const vao of this._vaos) gl.deleteVertexArray(vao);
      for (const buf of this._buffers) gl.deleteBuffer(buf);
      for (const prog of this._programs) gl.deleteProgram(prog);
    }
    this._vaos = [];
    this._buffers = [];
    this._programs = [];
  }

  /** Render one complete 60 FPS frame of the 3D Temporal-Quantum Holographic Universe! */
  render(world, decodedHbin) {
    const gl = this.gl;
    if (this._disposed || this._contextLost || gl.isContextLost()) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = this.canvas.clientWidth || this._cssW || 640;
    const cssH = this.canvas.clientHeight || this._cssH || 360;
    const w = Math.max(320, Math.round(cssW * dpr));
    const h = Math.max(240, Math.round(cssH * dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }

    gl.viewport(0, 0, w, h);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const realm = world.activeRealm;
    const rawStratum = world.hbinState.bootable ? Math.max(0, world.hbinState.maxStratum) : -1;
    // Live per-organ anastomosis coupling:
    //   - Amputating BOTH B2 (Wireframe) & B3 (Cortex) degrades 3D to S0 emergency beacon!
    //   - Amputating B3 (Cortex) degrades to S1 wireframe!
    //   - Amputating B5 (S3 Organism FX) caps visual flourish at S2!
    let stratum = rawStratum;
    if (rawStratum >= 1 && world.hbinState.hasCortexRender === false && world.hbinState.hasWireframe === false) {
      stratum = 0;
    } else if (rawStratum >= 2 && world.hbinState.hasCortexRender === false) {
      stratum = 1;
    } else if (rawStratum >= 3 && world.hbinState.hasOrganismFx === false) {
      stratum = 2;
    }
    const t = world.temporal.worldTime;
    const xeno = world.hbinState.xenografts > 0 ? 1.0 : 0.0;
    const rewind = world.temporal.rewinding ? 1.0 : 0.0;

    // If Stratum 0 is DEAD (Cellular Extinction), render flat crimson void!
    if (stratum < 0) {
      gl.depthMask(true);
      gl.clearColor(0.18, 0.02, 0.05, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      return;
    }

    // Clamp orbit camera parameters defensively + frame-rate-independent smoothing
    this.camPitch = Math.max(0.12, Math.min(1.42, this.camPitch));
    this.camDist = Math.max(10, Math.min(85, this.camDist));

    const nowMs = typeof performance !== 'undefined' ? performance.now() : this._lastRenderMs + 16.67;
    const rdt = Math.min(0.05, Math.max(0.001, (nowMs - this._lastRenderMs) / 1000));
    this._lastRenderMs = nowMs;
    const camAlpha = 1 - Math.exp(-5.0 * rdt);
    this.targetX += (world.player.x * 0.55 - this.targetX) * camAlpha;
    this.targetZ += (world.player.z * 0.55 - this.targetZ) * camAlpha;
    const eye = [
      this.targetX + Math.sin(this.camYaw) * Math.cos(this.camPitch) * this.camDist,
      Math.max(2.5, Math.sin(this.camPitch) * this.camDist),
      this.targetZ + Math.cos(this.camYaw) * Math.cos(this.camPitch) * this.camDist,
    ];
    mat4Perspective((52 * Math.PI) / 180, w / h, 0.2, 220, this._projMat);
    mat4LookAt(eye, [this.targetX, 1.4, this.targetZ], [0, 1, 0], this._viewMat);
    const vp = mat4Mul(this._projMat, this._viewMat, this._vpMat);

    gl.clearColor(0.02, 0.03, 0.05, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Wrap float32 shader time cleanly to prevent trigonometric precision drift over long sessions
    const TWO_PI = Math.PI * 2;
    const skyTime = t % (TWO_PI * 1024);

    // 1. MULTI-ORDER RELATIVISTIC SKY DOME
    gl.depthMask(false);
    gl.useProgram(this.skyProg);
    gl.uniform3fv(this.uSky.top, realm.skyTop);
    gl.uniform3fv(this.uSky.horizon, realm.skyHorizon);
    gl.uniform3fv(this.uSky.accent, realm.accentColor);
    gl.uniform1f(this.uSky.time, skyTime);
    gl.uniform1f(this.uSky.rewind, rewind);
    gl.uniform1f(this.uSky.stratum, stratum);
    gl.uniform1f(this.uSky.xeno, xeno);
    gl.bindVertexArray(this.emptyVao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.depthMask(true);

    // Live PLANARIA Stratum Geometric Primitive Mode!
    // S3/S2 = Full 3D Shaded Polygons | S1 = Clean Wireframe EBO | S0 = Ghost Stem Point-Cloud!
    const primMode = stratum >= 2 ? gl.TRIANGLES : (stratum === 1 ? gl.LINES : gl.POINTS);

    // 2. LIVE SCHRÖDINGER MULTI-SLIT WAVE-INTERFERENCE 3D FLOOR
    gl.useProgram(this.floorProg);
    gl.uniformMatrix4fv(this.uFloor.vp, false, vp);
    this._waveSrcFlat.fill(0);
    this._waveAmpFlat.fill(0);
    this._wavePhaseFlat.fill(0);
    const srcs = world.stageSpec.waveSources;
    for (let i = 0; i < 5; i++) {
      if (i < srcs.length) {
        this._waveSrcFlat[i * 4 + 0] = srcs[i].x;
        this._waveSrcFlat[i * 4 + 1] = srcs[i].z;
        this._waveSrcFlat[i * 4 + 2] = srcs[i].k;
        this._waveSrcFlat[i * 4 + 3] = srcs[i].omega;
        this._waveAmpFlat[i] = srcs[i].amp;
        const basePh = Number.isFinite(srcs[i].phase) ? srcs[i].phase : i * 1.1;
        this._wavePhaseFlat[i] = (((basePh - srcs[i].omega * t) % TWO_PI) + TWO_PI) % TWO_PI;
      }
    }
    gl.uniform4fv(this.uFloor.waveSrc, this._waveSrcFlat);
    gl.uniform1fv(this.uFloor.waveAmp, this._waveAmpFlat);
    gl.uniform1fv(this.uFloor.wavePhase, this._wavePhaseFlat);
    gl.uniform3fv(this.uFloor.gridCol, realm.gridColor);
    gl.uniform3fv(this.uFloor.accent, realm.accentColor);
    gl.uniform3fv(this.uFloor.fogCol, realm.skyHorizon);
    gl.uniform3fv(this.uFloor.camPos, eye);
    gl.uniform1f(this.uFloor.stratum, stratum);
    gl.uniform1f(this.uFloor.xeno, xeno);
    gl.uniform1f(this.uFloor.rewind, rewind);
    if (stratum === 0) {
      gl.bindVertexArray(this.floorTriVao);
      gl.drawArrays(gl.POINTS, 0, this.floorPointCount);
    } else if (stratum === 1) {
      gl.bindVertexArray(this.floorLineVao);
      gl.drawElements(gl.LINES, this.floorLineCount, gl.UNSIGNED_SHORT, 0);
    } else {
      gl.bindVertexArray(this.floorTriVao);
      gl.drawElements(gl.TRIANGLES, this.floorTriCount, gl.UNSIGNED_SHORT, 0);
    }

    // 3. OPAQUE 3D MESH PASS (DEPTH WRITE ON)
    gl.depthMask(true);
    gl.useProgram(this.meshProg);
    gl.uniformMatrix4fv(this.uMesh.vp, false, vp);
    gl.uniform3fv(this.uMesh.camPos, eye);
    gl.uniform3fv(this.uMesh.fogCol, realm.skyHorizon);

    // 3a. Stage Pillars (WKB Quantum Tunneling Barriers!)
    for (const pil of world.stageSpec.pillars) {
      const glow = 0.25 + 0.15 * Math.sin(t * 2 + pil.phase);
      const pCol = stratum === 0 ? [0.98, 0.75, 0.14] : realm.gridColor;
      this._drawMesh(
        this.meshes.PILLAR, pil.x, 0, pil.z, 0, pil.phase + t * 0.1, 0,
        pil.radius, pil.height, pil.radius,
        [pCol[0] * 0.4, pCol[1] * 0.4, pCol[2] * 0.4],
        [pCol[0] * glow, pCol[1] * glow, pCol[2] * glow],
        0.95, 2.2, primMode
      );
    }

    // 3b. ALL 192 LIVE .hbin HOLOGRAPHIC CELL CRYSTALS ORBITING THE ARENA
    const slotMap = decodedHbin?.slotMap || [];
    for (let slot = 0; slot < 192; slot++) {
      const entry = slotMap[slot];
      if (!entry) continue;
      const sched = PLACEMENT_SCHEDULE[slot];
      const spec = BUNDLE_SPECS[sched.bundleId];
      const ang = (slot / 192) * Math.PI * 2 + t * (0.12 + spec.stratum * 0.04);
      const rad = 32.5 + spec.stratum * 1.4;
      const y = 3.2 + spec.stratum * 2.1 + Math.sin(t * 2.2 + slot * 0.3) * 0.65;

      let c = STRATUM_RGB[spec.stratum];
      let sc = 0.46;
      if (entry.status === 'REPAIRED') { c = [0.98, 0.75, 0.14]; sc = 0.62; }
      else if (entry.status === 'QUARANTINED') { c = [0.96, 0.25, 0.37]; sc = 0.72; }
      else if (entry.status === 'XENOGRAFT') { c = [0.91, 0.47, 0.98]; sc = 0.64; }

      this._drawMesh(
        this.meshes.OCTA, Math.cos(ang) * rad, y, Math.sin(ang) * rad,
        t + slot, t * 1.4 + slot, 0, sc, sc * 1.35, sc,
        c, [c[0] * 0.85, c[1] * 0.85, c[2] * 0.85], 0.96, 1.8, primMode
      );
    }

    // 3c. PLAYER AVATAR + EQUIPPED 1/1 ARMOR PLATES
    const pl = world.player;
    const pCol = world.equippedWeapon.color;
    const arm = world.equippedArmor;
    const drawPlayerAt = (px, py, pz, yaw, alpha, tint) => {
      this._drawMesh(
        this.meshes.PYRAMID, px, py, pz, 0, yaw, 0,
        1.15, 1.0, 1.35, tint, [tint[0] * 0.8, tint[1] * 0.8, tint[2] * 0.8], alpha, 2.0, primMode
      );
      const plateCnt = stratum === 0 ? 2 : arm.plates;
      for (let k = 0; k < plateCnt; k++) {
        const a = (k / plateCnt) * Math.PI * 2 + t * 2.1;
        const ax = px + Math.cos(a) * 1.85;
        const az = pz + Math.sin(a) * 1.85;
        this._drawMesh(
          this.meshes.CUBE, ax, py + Math.sin(a * 2 + t) * 0.25, az,
          0, -a, 0, 0.16, 0.42, 0.32,
          arm.color, [arm.color[0] * 0.75, arm.color[1] * 0.75, arm.color[2] * 0.75],
          alpha * 0.9, 1.8, primMode
        );
      }
    };

    if (pl.superposeTimer <= 0) {
      drawPlayerAt(pl.x, pl.y, pl.z, pl.yaw, 0.99, pCol);
    }

    // 3d. ALL ENDLESS 1/1 NPCs & SINGULARITY BOSSES (opaque bodies)
    for (const n of world.npcs) {
      const mKey = n.archetype?.mesh || 'OCTA';
      const mesh = this.meshes[mKey] || this.meshes.OCTA;
      const col = n.zenoFreeze > 0.3 ? [0.13, 0.83, 0.93] : n.color;
      const em = [col[0] * 0.75, col[1] * 0.75, col[2] * 0.75];
      this._drawMesh(
        mesh, n.x, n.y, n.z, n.phase * 0.4, n.phase, n.phase * 0.3,
        n.radius, n.radius, n.radius, col, em, 0.98, 2.2, primMode
      );
      if (n.isBoss) {
        this._drawMesh(
          this.meshes.RING, n.x, n.y, n.z,
          t * 0.8, t * 1.1, 0, n.radius * 1.75, n.radius * 1.75, n.radius * 1.75,
          [0.98, 0.75, 0.14], [0.98, 0.75, 0.14], 0.9, 1.5, primMode
        );
      }
    }

    // 3e. PROJECTILES (Plasma Bolts, Chakrams, Beams)
    for (const p of world.projectiles) {
      const ang = Math.atan2(p.vx, p.vz);
      this._drawMesh(
        this.meshes.OCTA, p.x, p.y, p.z, 0, ang, 0,
        p.radius * 0.7, p.radius * 0.7, p.radius * 2.2,
        p.color, p.color, 0.99, 1.2, primMode
      );
    }

    // 4. TRANSLUCENT 3D MESH PASS (DEPTH WRITE OFF so glass/ghosts never occlude background)
    gl.depthMask(false);

    // 4a. Orbital Astrolabe Scale-Order Megastructure Rings overhead (Stratum >= 1)
    if (stratum >= 1) {
      for (let r = 0; r < realm.ringCount; r++) {
        const rad = 28 + r * 8.5;
        const speed = (r % 2 === 0 ? 1 : -1) * (0.14 + r * 0.05);
        this._drawMesh(
          this.meshes.RING, 0, 14.5 + r * 4.2, 0,
          Math.sin(t * speed) * 0.22 + r * 0.14, t * speed, Math.cos(t * speed) * 0.14,
          rad, rad, rad,
          realm.accentColor,
          [realm.accentColor[0] * 0.75, realm.accentColor[1] * 0.75, realm.accentColor[2] * 0.75],
          0.55, 1.8, primMode
        );
      }
    }

    // 4b. Hadamard Superposed Twin Player States
    if (pl.superposeTimer > 0) {
      const sep = 1.45;
      drawPlayerAt(pl.x + Math.cos(pl.yaw) * sep, pl.y, pl.z - Math.sin(pl.yaw) * sep, pl.yaw, 0.72, [0.13, 0.83, 0.93]);
      drawPlayerAt(pl.x - Math.cos(pl.yaw) * sep, pl.y, pl.z + Math.sin(pl.yaw) * sep, pl.yaw, 0.72, [0.91, 0.47, 0.98]);
    }

    // 4c. Superposed Quantum Ghost Offsets on NPCs
    for (const n of world.npcs) {
      if (n.mutation === 'SUPERPOSED') {
        const mKey = n.archetype?.mesh || 'OCTA';
        const mesh = this.meshes[mKey] || this.meshes.OCTA;
        const gx = n.x + Math.cos(n.superposeAngle) * 2.2;
        const gz = n.z + Math.sin(n.superposeAngle) * 2.2;
        this._drawMesh(
          mesh, gx, n.y, gz, n.phase * 0.4, -n.phase, 0,
          n.radius * 0.92, n.radius * 0.92, n.radius * 0.92,
          [0.13, 0.83, 0.93], [0.13, 0.83, 0.93], 0.38, 1.3, gl.LINES
        );
      }
    }

    // 4d. PAST-TIMELINE ECHO CLONES (Chrono-Fork Allies!)
    for (const echo of world.temporal.echoClones) {
      this._drawMesh(
        this.meshes.PYRAMID, echo.x, echo.y, echo.z, 0, echo.yaw, 0,
        1.05, 0.9, 1.2, echo.color, echo.color, 0.58, 1.4, gl.LINES
      );
    }

    // 4e. SPHERICAL 3D CHRONO-WELLS (Translucent Time-Dilation Bubbles!)
    for (const well of world.temporal.chronoWells) {
      const fade = Math.min(1, well.life / 1.2);
      const pulse = 1 + Math.sin(t * 4) * 0.03;
      this._drawMesh(
        this.meshes.ICO, well.x, well.y, well.z, t * 0.3, t * 0.5, 0,
        well.radius * pulse, well.radius * 0.55 * pulse, well.radius * pulse,
        [0.13, 0.83, 0.93], [0.98, 0.75, 0.14], 0.22 * fade, 1.2, gl.LINES
      );
    }
    gl.depthMask(true);

    // 5. 3D LINES PASS: BELL/GHZ ENTANGLEMENT TETHERS, RETROCAUSAL FUTURE-CONES, TIMELINE TRAIL, ZENO GAZE
    let lOff = 0;
    const pushLine = (x0, y0, z0, x1, y1, z1, r, g, b, a) => {
      if (lOff + 14 > this._lineData.length) return;
      const d = this._lineData;
      d[lOff++] = x0; d[lOff++] = y0; d[lOff++] = z0; d[lOff++] = r; d[lOff++] = g; d[lOff++] = b; d[lOff++] = a;
      d[lOff++] = x1; d[lOff++] = y1; d[lOff++] = z1; d[lOff++] = r; d[lOff++] = g; d[lOff++] = b; d[lOff++] = a;
    };

    // Player Quantum Zeno Sightline
    pushLine(
      pl.x, pl.y, pl.z,
      pl.x + Math.sin(pl.yaw) * 18, pl.y, pl.z + Math.cos(pl.yaw) * 18,
      0.13, 0.83, 0.93, 0.35
    );

    // Player Past-Timeline Trail (zero-allocation circular ring traversal!)
    if (typeof world.temporal.forEachTrailSegment === 'function') {
      world.temporal.forEachTrailSegment(90, (p0, p1, frac) => {
        pushLine(p0.x, p0.y - 0.3, p0.z, p1.x, p1.y - 0.3, p1.z, 0.13, 0.83, 0.93, frac * 0.55);
      });
    } else {
      const trail = world.temporal.playerTrail;
      const trailStart = Math.max(1, trail.length - 90);
      for (let i = trailStart; i < trail.length; i += 2) {
        const p0 = trail[i - 1], p1 = trail[i];
        const frac = (i - Math.max(0, trail.length - 90)) / 90;
        pushLine(p0.x, p0.y - 0.3, p0.z, p1.x, p1.y - 0.3, p1.z, 0.13, 0.83, 0.93, frac * 0.55);
      }
    }

    // Active Entangled Bell/GHZ Filaments (O(1) map + Set deduplication) + Retrocausal Future-Cones
    const npcById = new Map();
    for (const n of world.npcs) npcById.set(n.id, n);
    const drawnTethers = new Set();

    for (const n of world.npcs) {
      const fut = world.temporal.predictFuturePosition(n, 1.1);
      pushLine(n.x, n.y, n.z, fut.x, fut.y, fut.z, 0.98, 0.75, 0.14, 0.45);
      if (n.entangledWith !== null) {
        const partner = npcById.get(n.entangledWith);
        if (partner && partner.id !== n.id) {
          const edgeKey = n.id < partner.id ? `${n.id}:${partner.id}` : `${partner.id}:${n.id}`;
          if (!drawnTethers.has(edgeKey)) {
            drawnTethers.add(edgeKey);
            const segs = 10;
            for (let s = 0; s < segs; s++) {
              const f0 = s / segs, f1 = (s + 1) / segs;
              const w0 = Math.sin(f0 * Math.PI * 3 + t * 9) * 0.55 * Math.sin(f0 * Math.PI);
              const w1 = Math.sin(f1 * Math.PI * 3 + t * 9) * 0.55 * Math.sin(f1 * Math.PI);
              pushLine(
                n.x + (partner.x - n.x) * f0, n.y + (partner.y - n.y) * f0 + w0, n.z + (partner.z - n.z) * f0,
                n.x + (partner.x - n.x) * f1, n.y + (partner.y - n.y) * f1 + w1, n.z + (partner.z - n.z) * f1,
                0.91, 0.47, 0.98, 0.9
              );
            }
          }
        }
      }
    }

    for (const b of world.bellBeams) {
      pushLine(b.x0, b.y0, b.z0, b.x1, b.y1, b.z1, b.color[0], b.color[1], b.color[2], Math.min(1, b.life * 2));
    }

    if (lOff > 0) {
      gl.useProgram(this.lineProg);
      gl.uniformMatrix4fv(this.uLineVP, false, vp);
      gl.bindVertexArray(this.lineVao);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.lineVbo);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, this._lineData.subarray(0, lOff));
      gl.drawArrays(gl.LINES, 0, lOff / 7);
    }

    // 6. ADDITIVE 3D QUANTUM PARTICLE SPARKS
    if (world.particles.length > 0) {
      let pOff = 0;
      const pd = this._pointData;
      const cnt = Math.min(600, world.particles.length);
      for (let i = 0; i < cnt; i++) {
        const pt = world.particles[i];
        pd[pOff++] = pt.x; pd[pOff++] = pt.y; pd[pOff++] = pt.z;
        pd[pOff++] = pt.color[0]; pd[pOff++] = pt.color[1]; pd[pOff++] = pt.color[2];
        pd[pOff++] = Math.min(1, pt.life / Math.max(0.01, pt.maxLife));
        pd[pOff++] = pt.size;
      }
      gl.depthMask(false);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      gl.useProgram(this.pointProg);
      gl.uniformMatrix4fv(this.uPointVP, false, vp);
      gl.bindVertexArray(this.pointVao);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.pointVbo);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, pd.subarray(0, pOff));
      gl.drawArrays(gl.POINTS, 0, cnt);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.depthMask(true);
    }

    gl.bindVertexArray(null);
  }
}
