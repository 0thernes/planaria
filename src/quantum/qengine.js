/**
 * PLANARIA v2.2 — Real Multi-Qubit Quantum Mechanics & Wavefield Engine
 *
 * Implements exact complex-amplitude quantum mechanics (zero dependencies, little-endian qubit indexing):
 *   1. 4-Qubit (16-amplitude) Complex Statevector Register |psi> in C^16
 *      with exact unitary gates: H, X, Y, Z, RX, RY, RZ, CNOT, CZ, SWAP
 *   2. Exact Born-rule projective measurement & post-measurement collapse (zero-norm/NaN-safe)
 *   3. Exact rotation-invariant Horodecki CHSH Bell correlator S_max = 2*sqrt(lambda_1 + lambda_2)
 *      achieving Tsirelson bound |S| = 2*sqrt(2) ~= 2.8284 on ALL 4 Bell states & local unitaries,
 *      plus exact 4-qubit Mermin correlator M_4 (reaching 4.0 on 4-qubit GHZ vs classical limit 2.0)
 *   4. Werner isotropic depolarizing visibility tracker V in [0, 1] & purity Tr(rho^2) = (1 + (d-1)V^2)/d
 *   5. WKB Quantum Tunneling transmission probability T = exp(-2 * kappa * d)
 *   6. Heisenberg Uncertainty Stance tradeoff (Delta_x * Delta_p = 0.5 exact saturation)
 *   7. Quantum Zeno Observer Effect (frequent observation suppresses unitary transition)
 *   8. Real-time 2D/3D multi-source coherent wave-interference field |sum A_k exp(i(k*r - w*t + phi))|^2
 */

/** Exact 3x3 real symmetric matrix eigenvalues via cyclic Jacobi iterations (returns descending [l0, l1, l2]). */
function sym3Eigenvalues(m) {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (!Number.isFinite(m[i][j])) return [0, 0, 0];
    }
  }
  const a = [
    [m[0][0], m[0][1], m[0][2]],
    [m[1][0], m[1][1], m[1][2]],
    [m[2][0], m[2][1], m[2][2]],
  ];
  for (let iter = 0; iter < 18; iter++) {
    let p = 0, q = 1;
    let maxOff = Math.abs(a[0][1]);
    if (Math.abs(a[0][2]) > maxOff) { maxOff = Math.abs(a[0][2]); p = 0; q = 2; }
    if (Math.abs(a[1][2]) > maxOff) { maxOff = Math.abs(a[1][2]); p = 1; q = 2; }
    if (!Number.isFinite(maxOff) || maxOff < 1e-14) break;
    const app = a[p][p], aqq = a[q][q], apq = a[p][q];
    const tau = (aqq - app) / (2 * apq);
    const t = tau >= 0 ? 1 / (tau + Math.sqrt(1 + tau * tau)) : -1 / (-tau + Math.sqrt(1 + tau * tau));
    const c = 1 / Math.sqrt(1 + t * t);
    const s = t * c;
    const r = 3 - p - q;
    const arp = a[r][p], arq = a[r][q];
    a[p][p] = app - t * apq;
    a[q][q] = aqq + t * apq;
    a[p][q] = a[q][p] = 0;
    a[r][p] = a[p][r] = c * arp - s * arq;
    a[r][q] = a[q][r] = s * arp + c * arq;
  }
  return [a[0][0], a[1][1], a[2][2]].sort((x, y) => y - x);
}

export class QuantumRegister {
  constructor(numQubits = 4) {
    if (!Number.isInteger(numQubits) || numQubits < 1 || numQubits > 16) {
      throw new RangeError(`numQubits must be an integer in 1..16, got ${numQubits}`);
    }
    this.n = numQubits;
    this.dim = 1 << numQubits;
    this.re = new Float64Array(this.dim);
    this.im = new Float64Array(this.dim);
    this.coherence = 1.0; // Werner depolarizing visibility V in [0.0 .. 1.0]
    this._gateCounter = 0;
    this.reset();
  }

  _assertQubit(q) {
    if (!Number.isInteger(q) || q < 0 || q >= this.n) {
      throw new RangeError(`Qubit index ${q} out of range [0..${this.n - 1}]`);
    }
  }

  _assertDistinct(q1, q2) {
    this._assertQubit(q1);
    this._assertQubit(q2);
    if (q1 === q2) {
      throw new RangeError(`Two-qubit gate requires distinct qubits, got (${q1}, ${q2})`);
    }
  }

  reset() {
    this.re.fill(0);
    this.im.fill(0);
    this.re[0] = 1.0;
    this.coherence = 1.0;
    this._gateCounter = 0;
  }

  clone() {
    const q = new QuantumRegister(this.n);
    q.re.set(this.re);
    q.im.set(this.im);
    q.coherence = this.coherence;
    return q;
  }

  /** Total probability norm sum |alpha_k|^2 (exact unitary invariant = 1.0). */
  normSq() {
    let s = 0;
    for (let i = 0; i < this.dim; i++) {
      s += this.re[i] * this.re[i] + this.im[i] * this.im[i];
    }
    return s;
  }

  /** Renormalize statevector if floating-point rounding drifts away from unity. */
  renormalize() {
    const n2 = this.normSq();
    if (!Number.isFinite(n2) || n2 <= 0) {
      this.reset();
      return;
    }
    if (Math.abs(n2 - 1.0) > 1e-12) {
      const inv = 1 / Math.sqrt(n2);
      for (let i = 0; i < this.dim; i++) {
        this.re[i] *= inv;
        this.im[i] *= inv;
      }
    }
  }

  /** Probability P(k) = |alpha_k|^2 for basis state k. */
  prob(k) {
    if (!Number.isInteger(k) || k < 0 || k >= this.dim) return 0;
    return this.re[k] * this.re[k] + this.im[k] * this.im[k];
  }

  /** Marginal probability that qubit q is measured as |1>. */
  qubitProbOne(q) {
    this._assertQubit(q);
    const bit = 1 << q;
    let p = 0;
    for (let i = 0; i < this.dim; i++) {
      if (i & bit) p += this.re[i] * this.re[i] + this.im[i] * this.im[i];
    }
    return p;
  }

  /** Apply single-qubit 2x2 unitary matrix [[u00, u01], [u10, u11]] (complex pairs). */
  applySingle(q, u00r, u00i, u01r, u01i, u10r, u10i, u11r, u11i) {
    this._assertQubit(q);
    if (
      !Number.isFinite(u00r) || !Number.isFinite(u00i) ||
      !Number.isFinite(u01r) || !Number.isFinite(u01i) ||
      !Number.isFinite(u10r) || !Number.isFinite(u10i) ||
      !Number.isFinite(u11r) || !Number.isFinite(u11i)
    ) {
      throw new RangeError('Non-finite matrix entry in single-qubit gate');
    }
    const bit = 1 << q;
    for (let i = 0; i < this.dim; i++) {
      if (i & bit) continue;
      const j = i | bit;
      const ar = this.re[i], ai = this.im[i];
      const br = this.re[j], bi = this.im[j];

      this.re[i] = (u00r * ar - u00i * ai) + (u01r * br - u01i * bi);
      this.im[i] = (u00r * ai + u00i * ar) + (u01r * bi + u01i * br);
      this.re[j] = (u10r * ar - u10i * ai) + (u11r * br - u11i * bi);
      this.im[j] = (u10r * ai + u10i * ar) + (u11r * bi + u11i * br);
    }
    if ((++this._gateCounter & 255) === 0) this.renormalize();
  }

  /** Hadamard gate H (creates exact 50/50 quantum superposition). */
  H(q) {
    const invS2 = Math.SQRT1_2;
    this.applySingle(q, invS2, 0, invS2, 0, invS2, 0, -invS2, 0);
  }

  /** Pauli-X (bit flip). */
  X(q) {
    this.applySingle(q, 0, 0, 1, 0, 1, 0, 0, 0);
  }

  /** Pauli-Y (bit + phase flip: [[0, -i], [i, 0]]). */
  Y(q) {
    this.applySingle(q, 0, 0, 0, -1, 0, 1, 0, 0);
  }

  /** Pauli-Z (phase flip). */
  Z(q) {
    this.applySingle(q, 1, 0, 0, 0, 0, 0, -1, 0);
  }

  /** Rotation around X axis by angle theta. */
  RX(q, theta) {
    if (!Number.isFinite(theta)) throw new RangeError(`RX angle must be finite, got ${theta}`);
    const c = Math.cos(theta * 0.5);
    const s = Math.sin(theta * 0.5);
    this.applySingle(q, c, 0, 0, -s, 0, -s, c, 0);
  }

  /** Rotation around Y axis by angle theta. */
  RY(q, theta) {
    if (!Number.isFinite(theta)) throw new RangeError(`RY angle must be finite, got ${theta}`);
    const c = Math.cos(theta * 0.5);
    const s = Math.sin(theta * 0.5);
    this.applySingle(q, c, 0, -s, 0, s, 0, c, 0);
  }

  /** Rotation around Z axis by angle phi (quantum phase evolution). */
  RZ(q, phi) {
    if (!Number.isFinite(phi)) throw new RangeError(`RZ angle must be finite, got ${phi}`);
    const c = Math.cos(phi * 0.5);
    const s = Math.sin(phi * 0.5);
    this.applySingle(q, c, -s, 0, 0, 0, 0, c, s);
  }

  /** Controlled-NOT (CNOT) entangling gate (little-endian: bit 1<<q). */
  CNOT(ctrl, targ) {
    this._assertDistinct(ctrl, targ);
    const cBit = 1 << ctrl;
    const tBit = 1 << targ;
    for (let i = 0; i < this.dim; i++) {
      if ((i & cBit) && !(i & tBit)) {
        const j = i | tBit;
        const tr = this.re[i], ti = this.im[i];
        this.re[i] = this.re[j]; this.im[i] = this.im[j];
        this.re[j] = tr;         this.im[j] = ti;
      }
    }
  }

  /** Controlled-Z entangling phase gate. */
  CZ(q1, q2) {
    this._assertDistinct(q1, q2);
    const mask = (1 << q1) | (1 << q2);
    for (let i = 0; i < this.dim; i++) {
      if ((i & mask) === mask) {
        this.re[i] = -this.re[i];
        this.im[i] = -this.im[i];
      }
    }
  }

  /** Two-qubit SWAP gate exchanging qubits q1 and q2. */
  SWAP(q1, q2) {
    this._assertDistinct(q1, q2);
    const b1 = 1 << q1;
    const b2 = 1 << q2;
    for (let i = 0; i < this.dim; i++) {
      if ((i & b1) && !(i & b2)) {
        const j = (i ^ b1) | b2;
        const tr = this.re[i], ti = this.im[i];
        this.re[i] = this.re[j]; this.im[i] = this.im[j];
        this.re[j] = tr;         this.im[j] = ti;
      }
    }
  }

  /** Prepare maximal Bell pair |Phi+> = (|00> + |11>)/sqrt(2) on qubits (q0, q1). */
  prepareBellPair(q0 = 0, q1 = 1) {
    this._assertDistinct(q0, q1);
    this.reset();
    this.H(q0);
    this.CNOT(q0, q1);
  }

  /** Prepare 4-qubit GHZ entangled state (|0000> + |1111>)/sqrt(2). */
  prepareGHZ() {
    this.reset();
    this.H(0);
    for (let q = 1; q < this.n; q++) this.CNOT(0, q);
  }

  /**
   * Projective Born-rule measurement of qubit q (exact p0/p1 normalization, zero-norm & NaN-safe).
   * Returns { outcome: 0|1, probability: number } and collapses statevector in place.
   */
  measureQubit(q, rand01 = Math.random()) {
    this._assertQubit(q);
    const r = Number.isFinite(rand01) ? Math.max(0, Math.min(1 - Number.EPSILON, rand01)) : Math.random();
    const bit = 1 << q;
    let p0 = 0;
    let p1 = 0;
    for (let i = 0; i < this.dim; i++) {
      const m2 = this.re[i] * this.re[i] + this.im[i] * this.im[i];
      if (i & bit) p1 += m2;
      else p0 += m2;
    }
    const total = p0 + p1;
    if (!Number.isFinite(total) || total <= 0) {
      this.reset();
      return { outcome: 0, probability: 1.0 };
    }
    const outcome = p1 <= 0 ? 0 : (p0 <= 0 ? 1 : (r < p1 / total ? 1 : 0));
    const keepProb = outcome === 1 ? p1 : p0;
    const invNorm = 1 / Math.sqrt(keepProb);

    for (let i = 0; i < this.dim; i++) {
      const hasBit = (i & bit) ? 1 : 0;
      if (hasBit === outcome) {
        this.re[i] *= invNorm;
        this.im[i] *= invNorm;
      } else {
        this.re[i] = 0;
        this.im[i] = 0;
      }
    }
    return { outcome, probability: keepProb / total };
  }

  /** Compute exact Pauli product expectation <sigma_a^(qA) \otimes sigma_b^(qB)> for a,b in {0:X, 1:Y, 2:Z}. */
  _pauliCorr(qA, qB, opA, opB) {
    const bA = 1 << qA;
    const bB = 1 << qB;
    let acc = 0;
    for (let i = 0; i < this.dim; i++) {
      // Apply sigma_a^(qA) * sigma_b^(qB) to basis state |i> -> phase * |j>
      let j = i;
      let pr = 1, pi = 0; // phase = pr + i*pi
      if (opA === 0) {
        j ^= bA;
      } else if (opA === 1) {
        j ^= bA;
        // Y|0> = i|1>, Y|1> = -i|0>
        if (i & bA) { const t = pr; pr = pi; pi = -t; } // * (-i)
        else        { const t = pr; pr = -pi; pi = t; } // * (+i)
      } else if (i & bA) {
        pr = -pr; pi = -pi;
      }
      if (opB === 0) {
        j ^= bB;
      } else if (opB === 1) {
        j ^= bB;
        if (i & bB) { const t = pr; pr = pi; pi = -t; }
        else        { const t = pr; pr = -pi; pi = t; }
      } else if (i & bB) {
        pr = -pr; pi = -pi;
      }
      // Contribution Re(<psi|j> * phase * <i|psi>) = Re(conj(psi_j) * phase * psi_i)
      const xr = this.re[i], xi = this.im[i];
      const yr = this.re[j], yi = this.im[j];
      const pxr = pr * xr - pi * xi;
      const pxi = pr * xi + pi * xr;
      acc += yr * pxr + yi * pxi;
    }
    return acc;
  }

  /**
   * Compute exact rotation-invariant maximal CHSH Bell correlator between qubits (qA, qB)
   * via the Horodecki Criterion (Phys. Lett. A 200, 1995):
   *   S_max = 2 * sqrt(lambda_1 + lambda_2) * V
   * where lambda_1 >= lambda_2 are the two largest eigenvalues of M = T^T T
   * for the 3x3 Pauli correlation tensor T_{ab} = <sigma_a^(qA) \otimes sigma_b^(qB)>.
   *
   * Properties:
   *   - Exact Tsirelson bound 2*sqrt(2) ~= 2.828427 on ALL 4 Bell states (|Phi+->, |Psi+->)
   *     and invariant under arbitrary local unitary rotations (RX, RY, RZ)!
   *   - Exact classical limit <= 2.0 on every separable / product state.
   */
  computeCHSH(qA = 0, qB = 1) {
    this._assertDistinct(qA, qB);
    const n2 = this.normSq();
    if (!Number.isFinite(n2) || n2 <= 0) return 0;
    const invNorm = 1 / n2;
    const T = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];
    for (let a = 0; a < 3; a++) {
      for (let b = 0; b < 3; b++) {
        T[a][b] = this._pauliCorr(qA, qB, a, b) * invNorm;
      }
    }
    // M = T^T * T (symmetric 3x3 positive semidefinite)
    const M = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        M[i][j] = T[0][i] * T[0][j] + T[1][i] * T[1][j] + T[2][i] * T[2][j];
      }
    }
    const [l0, l1] = sym3Eigenvalues(M);
    const maxRaw = 2 * Math.sqrt(Math.max(0, l0 + l1));
    return Number.isFinite(maxRaw) ? maxRaw * this.coherence : 0;
  }

  /**
   * Exact 4-Qubit Mermin-Klyshko Genuine Multipartite Nonlocality Correlator M_4:
   *   M_4 = (1/2) * <XXXX - XXYY - XYXY - XYYX - YXXY - YXYX - YYXX + YYYY>
   * Local-realistic bound: |M_4| <= 2.0.
   * 4-Qubit GHZ state (|0000> + |1111>)/sqrt(2): |M_4| = 4.0 (2x classical limit!).
   */
  computeMermin4() {
    if (this.n < 4) return 0;
    const n2 = this.normSq();
    if (!Number.isFinite(n2) || n2 <= 0) return 0;
    const invNorm = 1 / n2;
    const terms = [
      [0, 0, 0, 0, +1],
      [0, 0, 1, 1, -1],
      [0, 1, 0, 1, -1],
      [0, 1, 1, 0, -1],
      [1, 0, 0, 1, -1],
      [1, 0, 1, 0, -1],
      [1, 1, 0, 0, -1],
      [1, 1, 1, 1, +1],
    ];
    let sum = 0;
    for (const [o0, o1, o2, o3, sign] of terms) {
      let exp = 0;
      for (let i = 0; i < this.dim; i++) {
        // Every X and Y flips the bit -> j = i ^ 0b1111
        const j = i ^ 0x0f;
        let pr = 1, pi = 0;
        const ops = [o0, o1, o2, o3];
        for (let q = 0; q < 4; q++) {
          if (ops[q] === 1) {
            if (i & (1 << q)) { const t = pr; pr = pi; pi = -t; }
            else              { const t = pr; pr = -pi; pi = t; }
          }
        }
        const xr = this.re[i], xi = this.im[i];
        const yr = this.re[j], yi = this.im[j];
        exp += yr * (pr * xr - pi * xi) + yi * (pr * xi + pi * xr);
      }
      sum += sign * exp;
    }
    const val = 0.5 * sum * invNorm * this.coherence;
    return Number.isFinite(val) ? val : 0;
  }

  /** Computational-basis Shannon entropy H = -sum p_i log2(p_i) in [0, n]. */
  basisEntropy() {
    let h = 0;
    const n2 = this.normSq();
    const inv = n2 > 0 ? 1 / n2 : 1;
    for (let i = 0; i < this.dim; i++) {
      const p = (this.re[i] * this.re[i] + this.im[i] * this.im[i]) * inv;
      if (p > 1e-12 && p < 1.0) h -= p * Math.log2(p);
    }
    return Math.max(0, h);
  }

  /** Werner-state purity Tr(rho^2) = (1 + (dim - 1) * V^2) / dim in [1/dim, 1]. */
  purity() {
    return (1 + (this.dim - 1) * this.coherence * this.coherence) / this.dim;
  }

  /** Apply environmental Werner isotropic depolarizing decay on visibility V in [0, 1] (gammaDt >= 0). */
  applyDecoherence(gammaDt) {
    if (!Number.isFinite(gammaDt) || gammaDt <= 0) return;
    this.coherence = Math.max(0.0, Math.min(1.0, this.coherence * Math.exp(-gammaDt)));
  }

  /** Stabilize / re-purify Werner coherence visibility V in [0, 1] via quantum error-correction skills. */
  restoreCoherence(amount) {
    if (!Number.isFinite(amount)) return;
    this.coherence = Math.max(0.0, Math.min(1.0, this.coherence + amount));
  }
}

/**
 * Exact WKB Quantum Tunneling Transmission Coefficient:
 *   T(E, V0, d) = exp(-2 * d * sqrt(2m(V0 - E)) / hbar)  for E < V0, else 1.0
 */
export function wkbTunnelingProbability(energy, barrierHeight, barrierWidth, mass = 1.0) {
  if (
    !Number.isFinite(energy) ||
    !Number.isFinite(barrierHeight) ||
    !Number.isFinite(mass) ||
    mass <= 0 ||
    Number.isNaN(barrierWidth) ||
    barrierWidth < 0
  ) {
    return 0.0;
  }
  if (barrierWidth === 0 || energy >= barrierHeight) return 1.0;
  if (!Number.isFinite(barrierWidth)) return 0.0;
  const kappa = Math.sqrt(Math.max(0, 2 * mass * (barrierHeight - energy)));
  return Math.exp(-2 * kappa * barrierWidth);
}

/**
 * Heisenberg Uncertainty Stance Resolver (Delta_x * Delta_p = 0.5 exact saturation):
 *   stance in [0..1]:
 *     0.0 -> Position-Squeezed (tight hitbox defense, razor precision lock, slower spread shots)
 *     0.5 -> Balanced Coherent State
 *     1.0 -> Momentum-Squeezed (massive hyper-velocity railgun crits, blurred probabilistic dodge!)
 */
export function heisenbergStance(stance01) {
  const raw = Number.isFinite(stance01) ? stance01 : 0.5;
  const s = Math.max(0, Math.min(1, raw));
  const deltaX = 0.35 + s * 1.65;       // spatial blur [0.35 .. 2.00]
  const deltaP = 0.5 / deltaX;          // exact minimum-uncertainty product Delta_x * Delta_p = 0.5!
  return {
    stance: s,
    deltaX,
    deltaP,
    product: deltaX * deltaP,
    critMultiplier: 1.0 + s * 1.45,     // up to 2.45x momentum crits
    evasionChance: s * 0.58,            // spatial smear [0..0.58] makes hits miss probabilistically!
    aimPrecision: 1.0 - s * 0.45,       // lower spatial blur = tighter aim cone
    shieldDensity: 1.55 - s * 0.75,     // position-squeezed = denser barrier
  };
}

/**
 * Quantum Zeno Effect Suppression Factor:
 *   If an entity is continuously observed at measurement rate nu, its effective unitary
 *   evolution rate slows as 1 / (1 + (nu * tau_Z)^2).
 */
export function zenoSuppressionFactor(observedIntensity, zenoStrength = 3.2) {
  if (!Number.isFinite(observedIntensity) || !Number.isFinite(zenoStrength)) return 1.0;
  const x = Math.max(0, observedIntensity) * Math.max(0, zenoStrength);
  return 1 / (1 + x * x);
}

/**
 * Multi-Source Coherent Wave-Interference Amplitude Evaluator (Double/Multi-Slit Field):
 * Computes real constructive/destructive interference intensity |sum_k A_k exp(i(k*r - w*t + phi_k))|^2
 * at any 3D floor coordinate (x, z).
 */
export function evalWaveInterference(x, z, time, sources) {
  if (!Array.isArray(sources) || !Number.isFinite(x) || !Number.isFinite(z) || !Number.isFinite(time)) {
    return 0;
  }
  let sumRe = 0;
  let sumIm = 0;
  for (let i = 0; i < sources.length; i++) {
    const s = sources[i];
    if (
      !s ||
      !Number.isFinite(s.x) ||
      !Number.isFinite(s.z) ||
      !Number.isFinite(s.amp) ||
      !Number.isFinite(s.k) ||
      !Number.isFinite(s.omega)
    ) {
      continue;
    }
    const dx = x - s.x;
    const dz = z - s.z;
    const r = Math.sqrt(dx * dx + dz * dz + 0.35);
    const amp = s.amp / (1 + 0.08 * r);
    const ph = Number.isFinite(s.phase) ? s.phase : 0;
    const phase = s.k * r - s.omega * time + ph;
    sumRe += amp * Math.cos(phase);
    sumIm += amp * Math.sin(phase);
  }
  return sumRe * sumRe + sumIm * sumIm;
}
