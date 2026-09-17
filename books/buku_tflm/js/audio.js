/**
 * AUDIO & SPEECH SYNTHESIS ENGINE
 * Web Audio API procedural sound effects + Indonesian Text-to-Speech
 */

class AudioEngine {
  constructor() {
    this.audioCtx = null;
    this.soundEnabled = true;
    this.speechSynth = window.speechSynthesis || null;
    this.isSpeaking = false;
    this.currentUtterance = null;
    this.selectedVoice = null;

    this.initAudioContext();
    this.initVoices();
  }

  initAudioContext() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
    }
  }

  resumeAudioContext() {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  initVoices() {
    if (!this.speechSynth) return;
    const loadVoices = () => {
      const voices = this.speechSynth.getVoices();
      this.selectedVoice = voices.find(v => v.lang.startsWith('id') || v.lang.startsWith('in')) 
                        || voices.find(v => v.lang.startsWith('ms'))
                        || voices[0];
    };
    loadVoices();
    if (this.speechSynth.onvoiceschanged !== undefined) {
      this.speechSynth.onvoiceschanged = loadVoices;
    }
  }

  playPageTurnSound() {
    if (!this.soundEnabled || !this.audioCtx) return;
    this.resumeAudioContext();

    try {
      const now = this.audioCtx.currentTime;
      const bufferSize = Math.floor(this.audioCtx.sampleRate * 0.18);
      const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
      }

      const noiseSource = this.audioCtx.createBufferSource();
      noiseSource.buffer = buffer;

      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.Q.setValueAtTime(1.2, now);

      const gain = this.audioCtx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.exponentialRampToValueAtTime(0.45, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(this.audioCtx.destination);

      noiseSource.start(now);
      noiseSource.stop(now + 0.18);
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }

  playClickSound() {
    if (!this.soundEnabled || !this.audioCtx) return;
    this.resumeAudioContext();

    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {}
  }

  playSuccessSound() {
    if (!this.soundEnabled || !this.audioCtx) return;
    this.resumeAudioContext();

    try {
      const now = this.audioCtx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        const start = now + idx * 0.08;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.25, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(start);
        osc.stop(start + 0.35);
      });
    } catch (e) {}
  }

  speakText(text, onEndCallback) {
    if (!this.speechSynth) return;
    this.stopSpeaking();

    const cleanText = text.replace(/<[^>]*>?/gm, ' ')
                          .replace(/[*_#`]/g, '')
                          .replace(/\s+/g, ' ')
                          .trim();

    this.currentUtterance = new SpeechSynthesisUtterance(cleanText);
    if (this.selectedVoice) {
      this.currentUtterance.voice = this.selectedVoice;
    }
    this.currentUtterance.lang = 'id-ID';
    this.currentUtterance.rate = 1.0;
    this.currentUtterance.pitch = 1.0;

    this.currentUtterance.onstart = () => {
      this.isSpeaking = true;
    };

    this.currentUtterance.onend = () => {
      this.isSpeaking = false;
      if (onEndCallback) onEndCallback();
    };

    this.currentUtterance.onerror = () => {
      this.isSpeaking = false;
      if (onEndCallback) onEndCallback();
    };

    this.speechSynth.speak(this.currentUtterance);
  }

  stopSpeaking() {
    if (this.speechSynth && (this.speechSynth.speaking || this.speechSynth.pending)) {
      this.speechSynth.cancel();
      this.isSpeaking = false;
    }
  }

  toggleMute() {
    this.soundEnabled = !this.soundEnabled;
    return this.soundEnabled;
  }
}

window.appAudio = new AudioEngine();
