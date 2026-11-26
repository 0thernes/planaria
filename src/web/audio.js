/**
 * WebAudio Host Bridge for PVM-32 48 kHz AudioWorklet Synthesizer
 *
 * Hardened against Safari/Chrome autoplay gesture expiration, double-click races,
 * non-secure contexts lacking AudioWorklet, and suspend/mute audio clicks.
 */

export class PlanariaAudio {
  constructor() {
    this.ctx = null;
    this.node = null;
    this.enabled = false;
    this.ready = false;
    this._inFlight = null;
    this._suspendTimer = null;
  }

  async toggle() {
    if (this._inFlight) return this._inFlight;
    this._inFlight = this._toggleImpl().finally(() => {
      this._inFlight = null;
    });
    return this._inFlight;
  }

  async _toggleImpl() {
    if (this._suspendTimer) {
      clearTimeout(this._suspendTimer);
      this._suspendTimer = null;
    }

    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = null;
      this.node = null;
      this.ready = false;
      this.enabled = false;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) {
        throw new Error('WebAudio AudioContext is not supported in this browser.');
      }
      let ctx;
      try {
        ctx = new AudioCtx({ sampleRate: 48000 });
      } catch {
        ctx = new AudioCtx();
      }
      if (!ctx.audioWorklet) {
        await ctx.close().catch(() => {});
        throw new Error('AudioWorklet requires a secure context (HTTPS or localhost).');
      }
      // Resume synchronously inside the user-gesture turn BEFORE awaiting addModule!
      const resumePromise = ctx.resume().catch(() => {});
      try {
        const workletUrl = new URL('./audio-worklet.js', import.meta.url);
        await ctx.audioWorklet.addModule(workletUrl);
        const node = new AudioWorkletNode(ctx, 'planaria-synth', {
          numberOfOutputs: 1,
          outputChannelCount: [2],
        });
        node.onprocessorerror = () => {
          this.enabled = false;
          this.ready = false;
        };
        node.connect(ctx.destination);
        await resumePromise;
        this.ctx = ctx;
        this.node = node;
        this.ready = true;
        this.enabled = true;
        return true;
      } catch (err) {
        await ctx.close().catch(() => {});
        this.ctx = null;
        this.node = null;
        this.ready = false;
        this.enabled = false;
        throw err;
      }
    }

    if (this.enabled) {
      this.enabled = false;
      if (this.node) this.node.port.postMessage({ type: 'mute' });
      // Allow 35 ms for the AudioWorklet envelope to ramp smoothly to zero before suspending
      const ctxRef = this.ctx;
      this._suspendTimer = setTimeout(() => {
        this._suspendTimer = null;
        if (!this.enabled && ctxRef && ctxRef.state === 'running') {
          ctxRef.suspend().catch(() => {});
        }
      }, 35);
    } else {
      await this.ctx.resume();
      this.enabled = true;
    }
    return this.enabled;
  }

  pushVoices(voices) {
    if (!this.enabled || !this.ready || !this.node) return;
    this.node.port.postMessage({ type: 'voices', voices });
  }

  mute() {
    this.enabled = false;
    if (this.node) this.node.port.postMessage({ type: 'mute' });
  }
}
