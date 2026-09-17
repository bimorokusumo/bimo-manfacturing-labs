class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = true;
    this.bgmOsc1 = null;
    this.weldingNoise = null;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.init();
    this.muted = !this.muted;
    
    if (!this.muted) {
      this.startBGM();
      this.playSuccess(); // Play a sound to confirm it's on
    } else {
      this.stopBGM();
      this.stopWelding();
    }
    
    return this.muted;
  }

  playTone(freq, type, duration, vol = 0.1) {
    if (this.muted || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playClick() {
    this.playTone(600, 'sine', 0.1, 0.05);
  }

  playHover() {
    this.playTone(800, 'sine', 0.05, 0.02);
  }

  playSuccess() {
    if (this.muted || !this.ctx) return;
    this.playTone(523.25, 'sine', 0.2, 0.08); // C5
    setTimeout(() => this.playTone(659.25, 'sine', 0.2, 0.08), 100); // E5
    setTimeout(() => this.playTone(783.99, 'sine', 0.4, 0.08), 200); // G5
  }

  playError() {
    if (this.muted || !this.ctx) return;
    this.playTone(300, 'sawtooth', 0.3, 0.05);
    setTimeout(() => this.playTone(250, 'sawtooth', 0.4, 0.05), 150);
  }

  startWelding() {
    if (this.muted || !this.ctx || this.weldingNoise) return;
    const bufferSize = this.ctx.sampleRate * 2; 
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    this.weldingNoise = this.ctx.createBufferSource();
    this.weldingNoise.buffer = buffer;
    this.weldingNoise.loop = true;
    
    this.weldingFilter = this.ctx.createBiquadFilter();
    this.weldingFilter.type = 'lowpass';
    this.weldingFilter.frequency.value = 800;

    this.weldingGain = this.ctx.createGain();
    this.weldingGain.gain.value = 0.1;

    this.weldingNoise.connect(this.weldingFilter);
    this.weldingFilter.connect(this.weldingGain);
    this.weldingGain.connect(this.ctx.destination);
    this.weldingNoise.start();
  }

  stopWelding() {
    if (this.weldingNoise) {
      this.weldingNoise.stop();
      this.weldingNoise.disconnect();
      this.weldingNoise = null;
    }
  }

  startBGM() {
    if (this.muted || !this.ctx || this.bgmOsc1) return;
    
    // Industrial ambient drone
    this.bgmOsc1 = this.ctx.createOscillator();
    this.bgmOsc2 = this.ctx.createOscillator();
    this.bgmGain = this.ctx.createGain();
    
    this.bgmOsc1.type = 'triangle';
    this.bgmOsc1.frequency.value = 65; // C2
    
    this.bgmOsc2.type = 'sawtooth';
    this.bgmOsc2.frequency.value = 65.5; // detune
    
    this.lfo = this.ctx.createOscillator();
    this.lfo.type = 'sine';
    this.lfo.frequency.value = 0.1; // very slow pulse
    this.lfoGain = this.ctx.createGain();
    this.lfoGain.gain.value = 100;
    
    this.bgmGain.gain.value = 0.015; // keep it quiet
    
    this.bgmFilter = this.ctx.createBiquadFilter();
    this.bgmFilter.type = 'lowpass';
    this.bgmFilter.frequency.value = 300;
    
    this.lfo.connect(this.lfoGain);
    this.lfoGain.connect(this.bgmFilter.frequency);
    
    this.bgmOsc1.connect(this.bgmFilter);
    this.bgmOsc2.connect(this.bgmFilter);
    this.bgmFilter.connect(this.bgmGain);
    this.bgmGain.connect(this.ctx.destination);
    
    this.bgmOsc1.start();
    this.bgmOsc2.start();
    this.lfo.start();
  }

  startMotorSound(rpm = 800) {
    if (this.muted || !this.ctx || this.motorOsc) return;
    try {
      this.motorOsc = this.ctx.createOscillator();
      this.motorGain = this.ctx.createGain();
      this.motorFilter = this.ctx.createBiquadFilter();

      const freq = Math.max(30, Math.min(180, rpm / 12));
      this.motorOsc.type = 'triangle';
      this.motorOsc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      this.motorFilter.type = 'lowpass';
      this.motorFilter.frequency.setValueAtTime(250, this.ctx.currentTime);

      this.motorGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.motorGain.gain.exponentialRampToValueAtTime(0.04, this.ctx.currentTime + 0.3);

      this.motorOsc.connect(this.motorFilter);
      this.motorFilter.connect(this.motorGain);
      this.motorGain.connect(this.ctx.destination);
      this.motorOsc.start();
    } catch (e) {
      console.warn('Audio motor start error:', e);
    }
  }

  stopMotorSound() {
    if (this.motorOsc && this.ctx) {
      try {
        this.motorGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.2);
        setTimeout(() => {
          if (this.motorOsc) {
            this.motorOsc.stop();
            this.motorOsc.disconnect();
            this.motorOsc = null;
          }
        }, 250);
      } catch {
        this.motorOsc = null;
      }
    }
  }

  startCuttingSound() {
    if (this.muted || !this.ctx || this.cuttingNoise) return;
    try {
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.5);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.3;
      }
      this.cuttingNoise = this.ctx.createBufferSource();
      this.cuttingNoise.buffer = buffer;
      this.cuttingNoise.loop = true;

      this.cuttingFilter = this.ctx.createBiquadFilter();
      this.cuttingFilter.type = 'bandpass';
      this.cuttingFilter.frequency.value = 1400;
      this.cuttingFilter.Q.value = 3;

      this.cuttingGain = this.ctx.createGain();
      this.cuttingGain.gain.value = 0.05;

      this.cuttingNoise.connect(this.cuttingFilter);
      this.cuttingFilter.connect(this.cuttingGain);
      this.cuttingGain.connect(this.ctx.destination);
      this.cuttingNoise.start();
    } catch (e) {
      console.warn('Audio cutting start error:', e);
    }
  }

  stopCuttingSound() {
    if (this.cuttingNoise) {
      try {
        this.cuttingNoise.stop();
        this.cuttingNoise.disconnect();
      } catch {
        // ignore
      }
      this.cuttingNoise = null;
    }
  }

  // Realistic Heat Treatment Audio Synthesizers
  playQuenchHiss() {
    this.init();
    if (this.muted || !this.ctx) return;
    try {
      const duration = 2.5;
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        // White noise with exponential decay & bubbling modulation
        const t = i / this.ctx.sampleRate;
        const bubbleMod = 1 + 0.3 * Math.sin(t * 40);
        data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 1.2) * bubbleMod;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2600, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(700, this.ctx.currentTime + duration);
      filter.Q.value = 1.8;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start();
    } catch (e) {
      console.warn('Quench sound error:', e);
    }
  }

  playMetalClank() {
    this.init();
    if (this.muted || !this.ctx) return;
    try {
      this.playTone(1150, 'triangle', 0.1, 0.07);
      setTimeout(() => this.playTone(720, 'sine', 0.22, 0.04), 25);
    } catch (e) {
      console.warn('Metal clank error:', e);
    }
  }
}

export const sound = new SoundEngine();
