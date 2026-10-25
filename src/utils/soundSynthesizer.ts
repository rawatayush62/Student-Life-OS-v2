// Web Audio API Procedural Ambient Soundscape Synthesizer
// Completely offline, no external audio files required!

class SoundscapeManager {
  private ctx: AudioContext | null = null;
  private currentType: string | null = null;
  private gainNode: GainNode | null = null;
  private activeNodes: (AudioNode | number)[] = [];
  private isPlaying = false;
  private volume = 0.25;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentType(): string | null {
    return this.currentType;
  }

  public stop() {
    if (!this.isPlaying) return;
    try {
      this.activeNodes.forEach(node => {
        if (typeof node === 'number') {
          clearInterval(node);
        } else if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
          (node as AudioScheduledSourceNode).stop();
        } else if ('disconnect' in node) {
          node.disconnect();
        }
      });
      this.activeNodes = [];
      this.isPlaying = false;
      this.currentType = null;
    } catch (e) {
      console.warn('Error stopping soundscape:', e);
    }
  }

  public play(type: 'rain' | 'binaural' | 'whitenoise' | 'stream') {
    this.initContext();
    if (!this.ctx) return;

    if (this.isPlaying && this.currentType === type) {
      return; // Already playing this
    }

    this.stop();
    this.isPlaying = true;
    this.currentType = type;

    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    this.gainNode.connect(this.ctx.destination);

    switch (type) {
      case 'rain':
        this.generateRain();
        break;
      case 'binaural':
        this.generateBinaural();
        break;
      case 'whitenoise':
        this.generateWhiteNoise();
        break;
      case 'stream':
        this.generateStream();
        break;
    }
  }

  private generateRain() {
    if (!this.ctx || !this.gainNode) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to simulate soothing rain
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, this.ctx.currentTime);

    // Highpass to remove harsh rumble
    const hpFilter = this.ctx.createBiquadFilter();
    hpFilter.type = 'highpass';
    hpFilter.frequency.setValueAtTime(150, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(hpFilter);
    hpFilter.connect(this.gainNode);

    whiteNoise.start();
    this.activeNodes.push(whiteNoise, filter, hpFilter);
  }

  private generateBinaural() {
    if (!this.ctx || !this.gainNode) return;
    // 210Hz Left, 200Hz Right => 10Hz Alpha Waves for Deep Concentration
    const merger = this.ctx.createChannelMerger(2);

    const oscLeft = this.ctx.createOscillator();
    oscLeft.type = 'sine';
    oscLeft.frequency.setValueAtTime(210, this.ctx.currentTime);

    const oscRight = this.ctx.createOscillator();
    oscRight.type = 'sine';
    oscRight.frequency.setValueAtTime(200, this.ctx.currentTime);

    const gainL = this.ctx.createGain();
    gainL.gain.setValueAtTime(0.4, this.ctx.currentTime);

    const gainR = this.ctx.createGain();
    gainR.gain.setValueAtTime(0.4, this.ctx.currentTime);

    oscLeft.connect(gainL);
    oscRight.connect(gainR);

    gainL.connect(merger, 0, 0);
    gainR.connect(merger, 0, 1);

    merger.connect(this.gainNode);

    oscLeft.start();
    oscRight.start();
    this.activeNodes.push(oscLeft, oscRight, gainL, gainR, merger);
  }

  private generateWhiteNoise() {
    if (!this.ctx || !this.gainNode) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    // Brown noise (softer than white noise)
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }

    const brownNoise = this.ctx.createBufferSource();
    brownNoise.buffer = noiseBuffer;
    brownNoise.loop = true;

    brownNoise.connect(this.gainNode);
    brownNoise.start();
    this.activeNodes.push(brownNoise);
  }

  private generateStream() {
    if (!this.ctx || !this.gainNode) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const streamNoise = this.ctx.createBufferSource();
    streamNoise.buffer = noiseBuffer;
    streamNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(650, this.ctx.currentTime);
    filter.Q.setValueAtTime(3.0, this.ctx.currentTime);

    // LFO to create gentle wave modulation
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.2, this.ctx.currentTime);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(250, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    streamNoise.connect(filter);
    filter.connect(this.gainNode);

    lfo.start();
    streamNoise.start();
    this.activeNodes.push(streamNoise, filter, lfo, lfoGain);
  }
}

export const soundscape = new SoundscapeManager();
