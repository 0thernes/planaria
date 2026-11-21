/**
 * Lock-Free 48 kHz 4-Voice Polyphonic PVM-32 AudioWorklet DSP Processor
 *
 * Directly synthesizes PCM audio from PVM-32's 4 hardware synth voice registers:
 *   wave: 0=off, 1=sine, 2=triangle, 3=sawtooth (PolyBLEP), 4=square (PolyBLEP), 5=white-noise
 * Features:
 *   - Strict finite input sanitization (immune to Infinity/NaN latch poisoning)
 *   - Sample-rate-invariant click-free amplitude slewing even across wave=0 cutoffs
 *   - PolyBLEP anti-aliasing on sawtooth & square oscillators
 *   - Per-voice one-pole lowpass filter with denormal flush & master DC-blocking highpass
 */

function polyBlep(t, dt) {
  if (dt <= 0) return 0;
  if (t < dt) {
    const x = t / dt;
    return x + x - x * x - 1.0;
  }
  if (t > 1.0 - dt) {
    const x = (t - 1.0) / dt;
    return x * x + x + x + 1.0;
  }
  return 0.0;
}

class PlanariaSynthProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.voices = Array.from({ length: 4 }, () => ({
      wave: 0,
      activeWave: 1,
      freqHz: 0,
      targetVol: 0,
      vol: 0,
      detune: 0,
      filter: 2000,
      phase: 0,
      lpState: 0,
    }));
    this.noiseState = 0x12345678;
    this.masterGain = 0.24;
    this.dcPrevInL = 0;
    this.dcPrevOutL = 0;
    this.dcPrevInR = 0;
    this.dcPrevOutR = 0;

    this.port.onmessage = (e) => {
      const msg = e.data;
      if (!msg) return;
      if (msg.type === 'voices' && Array.isArray(msg.voices)) {
        for (let i = 0; i < 4; i++) {
          const src = msg.voices[i];
          const dst = this.voices[i];
          if (!src) continue;
          const w = Math.max(0, Math.min(5, src.wave | 0));
          const f = Number(src.freqHz);
          const vol = Number(src.vol);
          const det = Number(src.detune);
          const flt = Number(src.filter);

          dst.wave = w;
          if (w > 0) dst.activeWave = w;
          dst.freqHz = Number.isFinite(f) ? Math.max(0, Math.min(8000, f)) : 0;
          dst.targetVol = (w === 0 || !Number.isFinite(vol)) ? 0 : Math.max(0, Math.min(1, vol));
          dst.detune = Number.isFinite(det) ? Math.max(-2400, Math.min(2400, det)) : 0;
          dst.filter = Number.isFinite(flt) ? Math.max(120, Math.min(14000, flt)) : 2000;
        }
      } else if (msg.type === 'mute') {
        for (const v of this.voices) v.targetVol = 0;
      }
    };
  }

  nextNoise() {
    let x = this.noiseState;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    this.noiseState = x >>> 0;
    return (this.noiseState / 2147483648) - 1;
  }

  process(_inputs, outputs) {
    const out = outputs[0];
    if (!out || out.length === 0) return true;
    const chL = out[0];
    const chR = out[1] || out[0];
    const sr = Number.isFinite(sampleRate) && sampleRate > 0 ? sampleRate : 48000;
    const twoPi = Math.PI * 2;
    const maxNyquist = Math.min(8000, sr * 0.45);
    const slew = 1 - Math.exp(-1 / (0.0026 * sr)); // ~2.6ms time constant, sample-rate invariant

    for (let i = 0; i < chL.length; i++) {
      let mixL = 0;
      let mixR = 0;

      for (let vIdx = 0; vIdx < 4; vIdx++) {
        const v = this.voices[vIdx];
        v.vol += (v.targetVol - v.vol) * slew;
        if (!Number.isFinite(v.vol)) v.vol = 0;
        if (v.vol < 0.0004) {
          if (v.targetVol === 0) {
            v.vol = 0;
            v.lpState = 0;
          }
          continue;
        }
        if (v.freqHz <= 0 && v.activeWave !== 5) {
          v.lpState *= 0.98;
          continue;
        }

        const rawFreq = v.freqHz * Math.pow(2, v.detune / 1200);
        const freq = Number.isFinite(rawFreq) ? Math.max(20, Math.min(maxNyquist, rawFreq)) : 20;
        const dt = freq / sr;
        v.phase += dt;
        if (!Number.isFinite(v.phase)) v.phase = 0;
        if (v.phase >= 1) v.phase -= Math.floor(v.phase);

        let s = 0;
        switch (v.activeWave) {
          case 1: // Sine
            s = Math.sin(v.phase * twoPi);
            break;
          case 2: // Triangle
            s = 4 * Math.abs(v.phase - 0.5) - 1;
            break;
          case 3: // PolyBLEP Sawtooth
            s = (2 * v.phase - 1) - polyBlep(v.phase, dt);
            break;
          case 4: { // PolyBLEP Square
            const sq = v.phase < 0.5 ? 1.0 : -1.0;
            const halfPhase = v.phase < 0.5 ? v.phase + 0.5 : v.phase - 0.5;
            s = 0.85 * (sq + polyBlep(v.phase, dt) - polyBlep(halfPhase, dt));
            break;
          }
          case 5: // White noise
            s = this.nextNoise();
            break;
          default:
            s = 0;
        }

        // One-pole lowpass resonant smoothing with NaN & denormal guard
        const alpha = Math.min(0.95, (twoPi * v.filter) / (sr + twoPi * v.filter));
        v.lpState += alpha * (s - v.lpState);
        if (!Number.isFinite(v.lpState) || Math.abs(v.lpState) < 1e-15) v.lpState = 0;

        const amp = v.lpState * v.vol;
        const pan = (vIdx - 1.5) * 0.25;
        mixL += amp * (0.7 - pan * 0.3);
        mixR += amp * (0.7 + pan * 0.3);
      }

      // Soft tanh saturation limiter + master DC-blocking highpass (R = 0.995)
      const satL = Math.tanh(mixL * this.masterGain);
      const outL = satL - this.dcPrevInL + 0.995 * this.dcPrevOutL;
      this.dcPrevInL = satL;
      this.dcPrevOutL = Number.isFinite(outL) && Math.abs(outL) >= 1e-15 ? outL : 0;
      chL[i] = this.dcPrevOutL;

      if (chR !== chL) {
        const satR = Math.tanh(mixR * this.masterGain);
        const outR = satR - this.dcPrevInR + 0.995 * this.dcPrevOutR;
        this.dcPrevInR = satR;
        this.dcPrevOutR = Number.isFinite(outR) && Math.abs(outR) >= 1e-15 ? outR : 0;
        chR[i] = this.dcPrevOutR;
      }
    }
    return true;
  }
}

registerProcessor('planaria-synth', PlanariaSynthProcessor);
