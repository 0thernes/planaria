/**
 * Lock-Free 48 kHz 4-Voice Polyphonic PVM-32 AudioWorklet DSP Processor
 *
 * Directly synthesizes PCM audio from PVM-32's 4 hardware synth voice registers:
 *   wave: 0=off, 1=sine, 2=triangle, 3=sawtooth, 4=square, 5=white-noise
 * Includes smooth de-zippered amplitude slewing and per-voice one-pole lowpass filter.
 */

class PlanariaSynthProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.voices = Array.from({ length: 4 }, () => ({
      wave: 0,
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

    this.port.onmessage = (e) => {
      const msg = e.data;
      if (!msg) return;
      if (msg.type === 'voices' && Array.isArray(msg.voices)) {
        for (let i = 0; i < 4; i++) {
          const src = msg.voices[i];
          const dst = this.voices[i];
          if (!src) continue;
          dst.wave = src.wave | 0;
          dst.freqHz = Number(src.freqHz) || 0;
          dst.targetVol = Number(src.vol) || 0;
          dst.detune = Number(src.detune) || 0;
          dst.filter = Math.max(120, Math.min(14000, Number(src.filter) || 2000));
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
    const sr = sampleRate;
    const twoPi = Math.PI * 2;

    for (let i = 0; i < chL.length; i++) {
      let mixL = 0;
      let mixR = 0;

      for (let vIdx = 0; vIdx < 4; vIdx++) {
        const v = this.voices[vIdx];
        // Smooth amplitude slewing (prevents clicks on live organ amputation/regrowth!)
        v.vol += (v.targetVol - v.vol) * 0.008;
        if (v.vol < 0.0004 || v.wave === 0) continue;

        const freq = Math.max(20, Math.min(8000, v.freqHz * Math.pow(2, v.detune / 1200)));
        v.phase += freq / sr;
        if (v.phase >= 1) v.phase -= 1;

        let s = 0;
        switch (v.wave) {
          case 1: // Sine
            s = Math.sin(v.phase * twoPi);
            break;
          case 2: // Triangle
            s = 4 * Math.abs(v.phase - 0.5) - 1;
            break;
          case 3: // Sawtooth
            s = 2 * v.phase - 1;
            break;
          case 4: // Square
            s = v.phase < 0.5 ? 0.85 : -0.85;
            break;
          case 5: // White noise
            s = this.nextNoise();
            break;
          default:
            s = 0;
        }

        // One-pole lowpass resonant smoothing
        const alpha = Math.min(0.95, (twoPi * v.filter) / (sr + twoPi * v.filter));
        v.lpState += alpha * (s - v.lpState);

        const amp = v.lpState * v.vol;
        // Subtle stereo field spread across the 4 channels
        const pan = (vIdx - 1.5) * 0.25;
        mixL += amp * (0.7 - pan * 0.3);
        mixR += amp * (0.7 + pan * 0.3);
      }

      // Soft tanh saturation limiter
      chL[i] = Math.tanh(mixL * this.masterGain);
      if (chR !== chL) chR[i] = Math.tanh(mixR * this.masterGain);
    }
    return true;
  }
}

registerProcessor('planaria-synth', PlanariaSynthProcessor);
