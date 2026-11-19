/**
 * WebAudio Host Bridge for PVM-32 48 kHz AudioWorklet Synthesizer
 */

export class PlanariaAudio {
  constructor() {
    this.ctx = null;
    this.node = null;
    this.enabled = false;
    this.ready = false;
  }

  async toggle() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx({ sampleRate: 48000 });
      await this.ctx.audioWorklet.addModule('/src/web/audio-worklet.js');
      this.node = new AudioWorkletNode(this.ctx, 'planaria-synth', {
        numberOfOutputs: 1,
        outputChannelCount: [2],
      });
      this.node.connect(this.ctx.destination);
      this.ready = true;
    }
    if (this.enabled) {
      this.enabled = false;
      this.node.port.postMessage({ type: 'mute' });
      await this.ctx.suspend();
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
    if (this.node) this.node.port.postMessage({ type: 'mute' });
  }
}
