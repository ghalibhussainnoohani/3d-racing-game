/**
 * Procedural Web Audio API Sound Synthesizer
 * Generates realistic laboratory sounds offline without external audio files.
 */
export class SoundManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.centrifugeOsc = null;
    this.centrifugeGain = null;
  }

  ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleAudio() {
    this.enabled = !this.enabled;
    if (!this.enabled && this.centrifugeGain) {
      this.centrifugeGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
    return this.enabled;
  }

  playBeep(freq = 1200, duration = 0.08) {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio error:', e);
    }
  }

  playSlide(duration = 0.35) {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      // Noise buffer for mechanical sliding friction
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);
      filter.Q.setValueAtTime(3, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start();
    } catch (e) {
      console.warn('Slide audio error:', e);
    }
  }

  playCentrifugeSpin() {
    if (!this.enabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      if (this.centrifugeOsc) {
        this.stopCentrifugeSpin();
      }

      const now = this.ctx.currentTime;
      this.centrifugeOsc = this.ctx.createOscillator();
      this.centrifugeGain = this.ctx.createGain();

      this.centrifugeOsc.type = 'triangle';
      // Ramp frequency from 120Hz to 680Hz (high-speed rotor pitch)
      this.centrifugeOsc.frequency.setValueAtTime(120, now);
      this.centrifugeOsc.frequency.exponentialRampToValueAtTime(680, now + 3.0);

      this.centrifugeGain.gain.setValueAtTime(0.001, now);
      this.centrifugeGain.gain.exponentialRampToValueAtTime(0.04, now + 1.5);

      this.centrifugeOsc.connect(this.centrifugeGain);
      this.centrifugeGain.connect(this.ctx.destination);

      this.centrifugeOsc.start();
    } catch (e) {
      console.warn('Centrifuge audio error:', e);
    }
  }

  stopCentrifugeSpin() {
    if (!this.centrifugeOsc || !this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      this.centrifugeOsc.frequency.exponentialRampToValueAtTime(80, now + 2.5);
      this.centrifugeGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

      const oldOsc = this.centrifugeOsc;
      setTimeout(() => {
        try {
          oldOsc.stop();
          oldOsc.disconnect();
        } catch (_) {}
      }, 2600);

      this.centrifugeOsc = null;
      this.centrifugeGain = null;
    } catch (e) {
      console.warn('Centrifuge stop error:', e);
    }
  }
}
