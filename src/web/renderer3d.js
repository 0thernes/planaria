/**
 * PLANARIA v2.0 — Custom Zero-Dependency WebGL2 (GLSL 300 es) 3D Temporal-Quantum Renderer
 *
 * Features:
 *   - Multi-layer sky gradient & relativistic scale-order atmosphere shader (6 Orders: 10^-15m -> 10^9m)
 *   - Live GPU-evaluated multi-source Schrödinger wave-interference 3D arena floor
 *   - Procedural 3D meshes (Octahedron, Pyramid, Cube, Diamond, Icosahedron, Torus Ring, Cylinder Pillar, Sphere)
 *   - 192 live orbiting 3D .hbin Holographic Cell Crystals reflecting real byte-level damage/RS-heal/quarantine/xenograft
 *   - Real-time Stratum visual metamorphosis: S3 Full Volumetric -> S2 Shaded -> S1 3D Wireframe -> S0 Ghost Point-Cloud
 *   - Bell/GHZ Entanglement Filaments, Retrocausal Future-Cones, Past-Timeline Echo Clones, Spherical Chrono-Wells
 *   - Interactive 360-degree orbit + zoom + dynamic camera banking + temporal-rewind chromatic shift
 */

import { PLACEMENT_SCHEDULE, BUNDLE_SPECS } from '../core/hbin.js';

// ============================================================================
// MINIMAL 4x4 MATRIX & VECTOR MATH (ZERO DEPENDENCIES)
// ============================================================================
function mat4Identity(out = new Float32Array(16)) {
  out.fill(0);
  out[0] = out[5] = out[10] = out[15] = 1;
  return out;
}

function mat4Perspective(fovyRad, aspect, near, far) {
  const f = 1.0 / Math.tan(fovyRad / 2);
  const nf = 1 / (near - far);
  const out = new Float32Array(16);
  out[0] = f / aspect;
  out[5] = f;
  out[10] = (far + near) * nf;
  out[11] = -1;
  out[14] = 2 * far * near * nf;
  return out;
}

function mat4LookAt(eye, target, up) {
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

  const out = new Float32Array(16);
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

// ============================================================================
// PROCEDURAL 3D MESH BUILDERS (POS + FLAT/SMOOTH NORMALS)
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

function makeOctahedron() {
  const v = [[0, 1, 0], [1, 0, 0], [0, 0, 1], [-1, 0, 0], [0, 0, -1], [0, -1, 0]];
  const t = [0, 2, 1, 0, 3, 2, 0, 4, 3, 0, 1, 4, 5, 1, 2, 5, 2, 3, 5, 3, 4, 5, 4, 1];
  return buildTriangleBuffer(v, t);
}

function makePyramid() {
  const v = [[0, 0, 1.35], [-0.85, -0.35, -0.8], [0.85, -0.35, -0.8], [0, 0.55, -0.55]];
  const t = [0, 1, 3, 0, 3, 2, 0, 2, 1, 1, 2, 3];
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
    // Side quad (y: 0..1)
    out.push(
      c0, 0, s0, nx, 0, nz,  c1, 0, s1, nx, 0, nz,  c1, 1, s1, nx, 0, nz,
      c0, 0, s0, nx, 0, nz,  c1, 1, s1, nx, 0, nz,  c0, 1, s0, nx, 0, nz,
      // Cap top
      0, 1, 0, 0, 1, 0,  c0, 1, s0, 0, 1, 0,  c1, 1, s1, 0, 1, 0
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
      out.push(...p00, ...p10, ...p11, ...p00, ...p11, ...p01);
    }
  }
  return new Float32Array(out);
}

function makeArenaFloor(gridN = 64, halfExtent = 36) {
  const out = [];
  const step = (halfExtent * 2) / gridN;
  for (let gz = 0; gz < gridN; gz++) {
    const z0 = -halfExtent + gz * step;
    const z1 = z0 + step;
    for (let gx = 0; gx < gridN; gx++) {
      const x0 = -halfExtent + gx * step;
      const x1 = x0 + step;
      out.push(
        x0, z0, x1, z0, x1, z1,
        x0, z0, x1, z1, x0, z1
      );
    }
  }
  return new Float32Array(out);
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
  vec3 col = mix(uSkyHorizon, uSkyTop, pow(h, 0.65));
  // Subtle relativistic quantum horizon band & star dust
  float horizonGlow = exp(-abs(h - 0.36) * 14.0);
  vec3 accent = uXeno > 0.5 ? vec3(0.91, 0.47, 0.98) : uAccent;
  col += accent * horizonGlow * (0.28 + 0.08 * sin(uTime * 1.4));

  // Procedural starfield / quantum vacuum sparkles
  vec2 g = floor(vUv * vec2(180.0, 100.0));
  float rnd = fract(sin(dot(g, vec2(12.9898, 78.233))) * 43758.5453);
  if (rnd > 0.992 && h > 0.32) {
    float tw = 0.5 + 0.5 * sin(uTime * 3.5 + rnd * 90.0);
    col += mix(vec3(0.7, 0.9, 1.0), accent, 0.4) * tw * 0.65;
  }

  // Stratum 0/1 dark surgical aesthetic & Temporal Rewind chromatic invert pulse
  if (uStratum < 0.5) col *= 0.25;
  if (uRewind > 0.5) {
    col = mix(col, vec3(0.05, 0.25, 0.42) + col.bgr * 0.65, 0.55);
  }
  fragColor = vec4(col, 1.0);
}`;

const FLOOR_VS = `#version 300 es
layout(location = 0) in vec2 aXZ;
uniform mat4 uViewProj;
uniform float uTime;
uniform vec4 uWaveSrc[5];   // (x, z, k, omega)
uniform float uWaveAmp[5];
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
    float ph = uWaveSrc[i].z * r - uWaveSrc[i].w * uTime + float(i) * 1.1;
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

  vec2 grid = abs(fract(vWorldPos.xz * 0.5 - 0.5) - 0.5) / max(fwidth(vWorldPos.xz * 0.5), vec2(0.001));
  float line = 1.0 - min(min(grid.x, grid.y), 1.0);

  // Polar concentric depth margins every 8m
  float ring = smoothstep(0.18, 0.0, abs(fract(r / 8.0) - 0.5));
  float rim = smoothstep(32.5, 35.2, r);

  vec3 gCol = uXeno > 0.5 ? mix(uGridColor, vec3(0.91, 0.47, 0.98), 0.65) : uGridColor;
  vec3 base = vec3(0.02, 0.04, 0.07);

  // Constructive interference glowing ridges!
  float ridge = smoothstep(0.9, 2.4, vWaveI);
  vec3 col = base
    + gCol * line * (uStratum < 0.5 ? 0.35 : 0.48)
    + uAccent * ridge * (uStratum >= 2.5 ? 0.65 : 0.35)
    + gCol * ring * 0.28
    + uAccent * rim * 0.9;

  if (uStratum < 0.5) {
    col = vec3(0.98, 0.75, 0.14) * (0.3 + 0.7 * line);
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
out vec3 vWorldPos;
out vec3 vNormal;

void main() {
  vec4 wp = uModel * vec4(aPos, 1.0);
  vWorldPos = wp.xyz;
  vNormal = normalize(mat3(uModel) * aNorm);
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
  vec3 N = normalize(vNormal);
  vec3 V = normalize(uCameraPos - vWorldPos);
  vec3 L1 = normalize(vec3(0.45, 0.85, 0.35));
  vec3 L2 = normalize(vec3(-0.6, 0.3, -0.7));

  float diff = max(dot(N, L1), 0.0) * 0.78 + max(dot(N, L2), 0.0) * 0.32 + 0.22;
  vec3 H = normalize(L1 + V);
  float spec = pow(max(dot(N, H), 0.0), 28.0) * 0.55;
  float fresnel = pow(1.0 - max(dot(N, V), 0.0), max(1.0, uFresnelPow));

  vec3 col = uColor * diff + uEmissive * (0.55 + fresnel * 1.15) + vec3(spec);
  float dist = length(uCameraPos - vWorldPos);
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
    this.canvas = canvas;
    const gl = canvas.getContext('webgl2', { antialias: true, alpha: false, powerPreference: 'high-performance' });
    if (!gl) throw new Error('WebGL2 not supported in this browser.');
    this.gl = gl;

    this.camYaw = 0.45;
    this.camPitch = 0.52;
    this.camDist = 30.0;
    this.targetX = 0;
    this.targetZ = 0;

    this._initPrograms();
    this._initMeshes();
    this._modelMat = new Float32Array(16);
    this._lineData = new Float32Array(12000 * 7);
    this._pointData = new Float32Array(600 * 8);
  }

  _compileShader(type, src) {
    const gl = this.gl;
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      throw new Error(`Shader compile error: ${gl.getShaderInfoLog(s)}`);
    }
    return s;
  }

  _linkProgram(vsSrc, fsSrc) {
    const gl = this.gl;
    const p = gl.createProgram();
    gl.attachShader(p, this._compileShader(gl.VERTEX_SHADER, vsSrc));
    gl.attachShader(p, this._compileShader(gl.FRAGMENT_SHADER, fsSrc));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      throw new Error(`Program link error: ${gl.getProgramInfoLog(p)}`);
    }
    return p;
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
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, floatArr, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 24, 12);
    gl.bindVertexArray(null);
    return { vao, count: floatArr.length / 6 };
  }

  _initMeshes() {
    const gl = this.gl;
    this.emptyVao = gl.createVertexArray();

    // Arena Wave-Interference Floor VAO
    const floorData = makeArenaFloor(64, 36);
    this.floorVao = gl.createVertexArray();
    gl.bindVertexArray(this.floorVao);
    const fb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, fb);
    gl.bufferData(gl.ARRAY_BUFFER, floorData, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 8, 0);
    this.floorCount = floorData.length / 2;
    gl.bindVertexArray(null);

    this.meshes = {
      OCTA: this._uploadMesh(makeOctahedron()),
      PYRAMID: this._uploadMesh(makePyramid()),
      CUBE: this._uploadMesh(makeCube()),
      ICO: this._uploadMesh(makeIcosahedron()),
      DIAMOND: this._uploadMesh(makeOctahedron()),
      SPIKE: this._uploadMesh(makePyramid()),
      TORUS: this._uploadMesh(makeTorus(1.0, 0.22, 24, 8)),
      BOSS: this._uploadMesh(makeIcosahedron()),
      RING: this._uploadMesh(makeTorus(1.0, 0.011, 48, 6)),
      PILLAR: this._uploadMesh(makeCylinder(8)),
    };

    // Dynamic Line Buffer VAO (pos3 + rgba4)
    this.lineVao = gl.createVertexArray();
    gl.bindVertexArray(this.lineVao);
    this.lineVbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.lineVbo);
    gl.bufferData(gl.ARRAY_BUFFER, 12000 * 7 * 4, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 28, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 28, 12);
    gl.bindVertexArray(null);

    // Dynamic Point Buffer VAO (pos3 + rgba4 + size1)
    this.pointVao = gl.createVertexArray();
    gl.bindVertexArray(this.pointVao);
    this.pointVbo = gl.createBuffer();
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
    gl.uniformMatrix4fv(this.uMesh.model, false, this._modelMat);
    gl.uniform3fv(this.uMesh.color, col);
    gl.uniform3fv(this.uMesh.emissive, em);
    gl.uniform1f(this.uMesh.alpha, alpha);
    gl.uniform1f(this.uMesh.fresnel, fresnel);
    gl.bindVertexArray(mesh.vao);
    gl.drawArrays(drawMode !== null ? drawMode : gl.TRIANGLES, 0, mesh.count);
  }

  /** Render one complete 60 FPS frame of the 3D Temporal-Quantum Holographic Universe! */
  render(world, decodedHbin) {
    const gl = this.gl;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(320, Math.floor(this.canvas.clientWidth * dpr));
    const h = Math.max(240, Math.floor(this.canvas.clientHeight * dpr));
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
    const stratum = world.hbinState.bootable ? Math.max(0, world.hbinState.maxStratum) : -1;
    const t = world.temporal.worldTime;
    const xeno = world.hbinState.xenografts > 0 ? 1.0 : 0.0;
    const rewind = world.temporal.rewinding ? 1.0 : 0.0;

    // Smoothly track player position with orbit camera
    this.targetX += (world.player.x * 0.55 - this.targetX) * 0.08;
    this.targetZ += (world.player.z * 0.55 - this.targetZ) * 0.08;
    const eye = [
      this.targetX + Math.sin(this.camYaw) * Math.cos(this.camPitch) * this.camDist,
      Math.max(2.5, Math.sin(this.camPitch) * this.camDist),
      this.targetZ + Math.cos(this.camYaw) * Math.cos(this.camPitch) * this.camDist,
    ];
    const proj = mat4Perspective((52 * Math.PI) / 180, w / h, 0.2, 220);
    const view = mat4LookAt(eye, [this.targetX, 1.4, this.targetZ], [0, 1, 0]);
    const vp = mat4Mul(proj, view);

    gl.clearColor(0.02, 0.03, 0.05, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // 1. MULTI-ORDER RELATIVISTIC SKY DOME
    gl.depthMask(false);
    gl.useProgram(this.skyProg);
    gl.uniform3fv(this.uSky.top, realm.skyTop);
    gl.uniform3fv(this.uSky.horizon, realm.skyHorizon);
    gl.uniform3fv(this.uSky.accent, realm.accentColor);
    gl.uniform1f(this.uSky.time, t);
    gl.uniform1f(this.uSky.rewind, rewind);
    gl.uniform1f(this.uSky.stratum, stratum);
    gl.uniform1f(this.uSky.xeno, xeno);
    gl.bindVertexArray(this.emptyVao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.depthMask(true);

    // If Stratum 0 is DEAD (Cellular Extinction), render flat red void
    if (stratum < 0) return;

    // Live PLANARIA Stratum Geometric Primitive Mode!
    // S3/S2 = Full 3D Shaded Polygons | S1 = Glowing 3D Wireframe Matrix | S0 = Ghost Stem Point-Cloud!
    const primMode = stratum >= 2 ? gl.TRIANGLES : (stratum === 1 ? gl.LINES : gl.POINTS);

    // 2. LIVE SCHRÖDINGER MULTI-SLIT WAVE-INTERFERENCE 3D FLOOR
    gl.useProgram(this.floorProg);
    gl.uniformMatrix4fv(this.uFloor.vp, false, vp);
    gl.uniform1f(this.uFloor.time, t);
    const srcFlat = new Float32Array(20);
    const ampFlat = new Float32Array(5);
    const srcs = world.stageSpec.waveSources;
    for (let i = 0; i < 5; i++) {
      if (i < srcs.length) {
        srcFlat[i * 4 + 0] = srcs[i].x;
        srcFlat[i * 4 + 1] = srcs[i].z;
        srcFlat[i * 4 + 2] = srcs[i].k;
        srcFlat[i * 4 + 3] = srcs[i].omega;
        ampFlat[i] = srcs[i].amp;
      }
    }
    gl.uniform4fv(this.uFloor.waveSrc, srcFlat);
    gl.uniform1fv(this.uFloor.waveAmp, ampFlat);
    gl.uniform3fv(this.uFloor.gridCol, realm.gridColor);
    gl.uniform3fv(this.uFloor.accent, realm.accentColor);
    gl.uniform3fv(this.uFloor.fogCol, realm.skyHorizon);
    gl.uniform3fv(this.uFloor.camPos, eye);
    gl.uniform1f(this.uFloor.stratum, stratum);
    gl.uniform1f(this.uFloor.xeno, xeno);
    gl.uniform1f(this.uFloor.rewind, rewind);
    gl.bindVertexArray(this.floorVao);
    gl.drawArrays(stratum === 0 ? gl.POINTS : (stratum === 1 ? gl.LINES : gl.TRIANGLES), 0, this.floorCount);

    // 3. 3D MESH PASS (WORLD ARCHITECTURE, 192 .hbin CELLS, PLAYER, ARMOR, NPCs, PROJECTILES)
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
        0.88, 2.2, primMode
      );
    }

    // 3b. Orbital Astrolabe Scale-Order Megastructure Rings overhead (Stratum >= 1)
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

    // 3c. ALL 192 LIVE .hbin HOLOGRAPHIC CELL CRYSTALS ORBITING THE ARENA!!
    const slotMap = decodedHbin?.slotMap || [];
    for (let slot = 0; slot < 192; slot++) {
      const entry = slotMap[slot];
      if (!entry) continue; // Shredded / necrotic cells physically vanish from 3D space!
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
        c, [c[0] * 0.85, c[1] * 0.85, c[2] * 0.85], 0.92, 1.8, primMode
      );
    }

    // 3d. PLAYER AVATAR + EQUIPPED 1/1 ARMOR PLATES + HADAMARD SUPERPOSITION CLONE
    const pl = world.player;
    const pCol = world.equippedWeapon.color;
    const arm = world.equippedArmor;
    const drawPlayerAt = (px, py, pz, yaw, alpha, tint) => {
      this._drawMesh(
        this.meshes.PYRAMID, px, py, pz, 0, yaw, 0,
        1.15, 1.0, 1.35, tint, [tint[0] * 0.8, tint[1] * 0.8, tint[2] * 0.8], alpha, 2.0, primMode
      );
      // Orbiting 1/1 Armor Barrier Plates!
      const plateCnt = stratum === 0 ? 2 : arm.plates;
      for (let k = 0; k < plateCnt; k++) {
        const a = (k / plateCnt) * Math.PI * 2 + t * 2.1;
        const ax = px + Math.cos(a) * 1.85;
        const az = pz + Math.sin(a) * 1.85;
        this._drawMesh(
          this.meshes.CUBE, ax, py + Math.sin(a * 2 + t) * 0.25, az,
          0, -a, 0, 0.16, 0.42, 0.32,
          arm.color, [arm.color[0] * 0.75, arm.color[1] * 0.75, arm.color[2] * 0.75],
          alpha * 0.85, 1.8, primMode
        );
      }
    };

    if (pl.superposeTimer > 0) {
      // Twin Hadamard Superposed Player States!
      const sep = 1.45;
      drawPlayerAt(pl.x + Math.cos(pl.yaw) * sep, pl.y, pl.z - Math.sin(pl.yaw) * sep, pl.yaw, 0.72, [0.13, 0.83, 0.93]);
      drawPlayerAt(pl.x - Math.cos(pl.yaw) * sep, pl.y, pl.z + Math.sin(pl.yaw) * sep, pl.yaw, 0.72, [0.91, 0.47, 0.98]);
    } else {
      drawPlayerAt(pl.x, pl.y, pl.z, pl.yaw, 0.98, pCol);
    }

    // 3e. PAST-TIMELINE ECHO CLONES (Chrono-Fork Allies!)
    for (const echo of world.temporal.echoClones) {
      this._drawMesh(
        this.meshes.PYRAMID, echo.x, echo.y, echo.z, 0, echo.yaw, 0,
        1.05, 0.9, 1.2, echo.color, echo.color, 0.58, 1.4, gl.LINES
      );
    }

    // 3f. ALL ENDLESS 1/1 NPCs & SINGULARITY BOSSES
    for (const n of world.npcs) {
      const mKey = n.archetype?.mesh || 'OCTA';
      const mesh = this.meshes[mKey] || this.meshes.OCTA;
      const col = n.zenoFreeze > 0.3 ? [0.13, 0.83, 0.93] : n.color;
      const em = [col[0] * 0.75, col[1] * 0.75, col[2] * 0.75];
      this._drawMesh(
        mesh, n.x, n.y, n.z, n.phase * 0.4, n.phase, n.phase * 0.3,
        n.radius, n.radius, n.radius, col, em, 0.95, 2.2, primMode
      );
      if (n.isBoss) {
        // Rotating Boss Singularity Crown Ring
        this._drawMesh(
          this.meshes.RING, n.x, n.y, n.z,
          t * 0.8, t * 1.1, 0, n.radius * 1.75, n.radius * 1.75, n.radius * 1.75,
          [0.98, 0.75, 0.14], [0.98, 0.75, 0.14], 0.75, 1.5, primMode
        );
      }
      if (n.mutation === 'SUPERPOSED') {
        // Superposed Quantum Ghost Offset!
        const gx = n.x + Math.cos(n.superposeAngle) * 2.2;
        const gz = n.z + Math.sin(n.superposeAngle) * 2.2;
        this._drawMesh(
          mesh, gx, n.y, gz, n.phase * 0.4, -n.phase, 0,
          n.radius * 0.92, n.radius * 0.92, n.radius * 0.92,
          [0.13, 0.83, 0.93], [0.13, 0.83, 0.93], 0.38, 1.3, gl.LINES
        );
      }
    }

    // 3g. PROJECTILES (Plasma Bolts, Chakrams, Beams)
    for (const p of world.projectiles) {
      const ang = Math.atan2(p.vx, p.vz);
      this._drawMesh(
        this.meshes.OCTA, p.x, p.y, p.z, 0, ang, 0,
        p.radius * 0.7, p.radius * 0.7, p.radius * 2.2,
        p.color, p.color, 0.98, 1.2, primMode
      );
    }

    // 3h. SPHERICAL 3D CHRONO-WELLS (Translucent Time-Dilation Bubbles!)
    gl.depthMask(false);
    for (const well of world.temporal.chronoWells) {
      const fade = Math.min(1, well.life / 1.2);
      const pulse = 1 + Math.sin(t * 4) * 0.03;
      this._drawMesh(
        this.meshes.ICO, well.x, well.y, well.z, t * 0.3, t * 0.5, 0,
        well.radius * pulse, well.radius * 0.55 * pulse, well.radius * pulse,
        [0.13, 0.83, 0.93], [0.98, 0.75, 0.14], 0.18 * fade, 1.2, gl.LINES
      );
    }
    gl.depthMask(true);

    // 4. 3D LINES PASS: BELL ENTANGLEMENT TETHERS, RETROCAUSAL FUTURE-CONES, TIMELINE TRAIL, ZENO GAZE
    let lOff = 0;
    const pushLine = (x0, y0, z0, x1, y1, z1, r, g, b, a) => {
      if (lOff + 14 >= this._lineData.length) return;
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

    // Player Past-Timeline Trail (visible Chrono-Fork ribbon!)
    const trail = world.temporal.playerTrail;
    for (let i = Math.max(1, trail.length - 90); i < trail.length; i += 2) {
      const p0 = trail[i - 1], p1 = trail[i];
      const frac = (i - Math.max(0, trail.length - 90)) / 90;
      pushLine(p0.x, p0.y - 0.3, p0.z, p1.x, p1.y - 0.3, p1.z, 0.13, 0.83, 0.93, frac * 0.55);
    }

    // Active Entangled Bell-State Filaments + Retrocausal Future-Cone Vectors!
    for (const n of world.npcs) {
      // Retrocausal 1.1s Future Projection Vector (amber)
      const fut = world.temporal.predictFuturePosition(n, 1.1);
      pushLine(n.x, n.y, n.z, fut.x, fut.y, fut.z, 0.98, 0.75, 0.14, 0.45);
      // Entanglement Tether (vibrating magenta-gold Bell wave!)
      if (n.entangledWith !== null) {
        const partner = world.npcs.find((o) => o.id === n.entangledWith);
        if (partner && n.id < partner.id) {
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

    // Active Bell Collapse Flash Beams
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

    // 5. ADDITIVE 3D QUANTUM PARTICLE SPARKS
    if (world.particles.length > 0) {
      let pOff = 0;
      const pd = this._pointData;
      const cnt = Math.min(600, world.particles.length);
      for (let i = 0; i < cnt; i++) {
        const pt = world.particles[i];
        pd[pOff++] = pt.x; pd[pOff++] = pt.y; pd[pOff++] = pt.z;
        pd[pOff++] = pt.color[0]; pd[pOff++] = pt.color[1]; pd[pOff++] = pt.color[2];
        pd[pOff++] = Math.min(1, pt.life / pt.maxLife);
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
