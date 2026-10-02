/**
 * LEXORA Courtroom Audio Engine
 * Pure Web Audio API Synthesizer & Voice Recorder
 * Provides realistic wooden gavel strikes, judicial chimes, courtroom ambiance,
 * and live microphone recording for witness depositions.
 */

class CourtAudioEngine {
  constructor() {
    this.audioCtx = null;
    this.isMuted = false;
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.isRecording = false;
    this.speechSynth = window.speechSynthesis || null;
  }

  init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.speechSynth) {
      this.speechSynth.cancel();
    }
    return this.isMuted;
  }

  /**
   * Synthesize an authentic acoustic wooden gavel strike
   */
  playGavelStrike() {
    if (this.isMuted) return;
    this.init();
    if (!this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    // 1. Initial Impact transient (sharp burst)
    const bufferSize = ctx.sampleRate * 0.05;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(800, now);
    noiseFilter.Q.setValueAtTime(3, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.8, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);

    // 2. Heavy wooden desk resonance (low fundamental ~120Hz)
    const osc1 = ctx.createOscillator();
    const osc1Gain = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(140, now);
    osc1.frequency.exponentialRampToValueAtTime(45, now + 0.25);

    osc1Gain.gain.setValueAtTime(1.0, now);
    osc1Gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(osc1Gain);
    osc1Gain.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // 3. Wooden block body tone (~340Hz)
    const osc2 = ctx.createOscillator();
    const osc2Gain = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(360, now);
    osc2.frequency.exponentialRampToValueAtTime(180, now + 0.15);

    osc2Gain.gain.setValueAtTime(0.5, now);
    osc2Gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc2.connect(osc2Gain);
    osc2Gain.connect(ctx.destination);
    osc2.start(now);
    osc2.stop(now + 0.2);
  }

  /**
   * Triple gavel strike for courtroom call-to-order and final verdict
   */
  playTripleGavel() {
    if (this.isMuted) return;
    this.playGavelStrike();
    setTimeout(() => this.playGavelStrike(), 280);
    setTimeout(() => this.playGavelStrike(), 580);
  }

  /**
   * Judicial status chime (harmonic celestial chime)
   */
  playChime(isPositive = true) {
    if (this.isMuted) return;
    this.init();
    if (!this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;
    const freqs = isPositive ? [523.25, 659.25, 783.99, 1046.50] : [440, 415.3, 370];

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.15, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.85);
    });
  }

  /**
   * Speak judicial pronouncements using dignified magistrate voice
   */
  speak(text, onComplete = null) {
    if (this.isMuted || !this.speechSynth) {
      if (onComplete) onComplete();
      return;
    }
    this.speechSynth.cancel(); // Stop any pending speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 0.9;
    utterance.volume = 1.0;

    // Select suitable English voice if available
    const voices = this.speechSynth.getVoices();
    const preferredVoice = voices.find(v => 
      (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('David') || v.name.includes('Daniel') || v.name.includes('Oliver') || v.lang.startsWith('en'))
    );
    if (preferredVoice) utterance.voice = preferredVoice;

    if (onComplete) {
      utterance.onend = onComplete;
      utterance.onerror = onComplete;
    }
    this.speechSynth.speak(utterance);
  }

  /**
   * Start live microphone recording for witness testimony
   */
  async startMicrophoneRecording(onAudioReady, onError) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      if (onError) onError('Microphone recording is not supported in this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.recordedChunks = [];
      this.mediaRecorder = new MediaRecorder(stream);
      this.isRecording = true;

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.recordedChunks.push(e.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.isRecording = false;
        const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(blob);
        // Stop stream tracks
        stream.getTracks().forEach(track => track.stop());
        if (onAudioReady) onAudioReady(blob, audioUrl);
      };

      this.mediaRecorder.start();
    } catch (err) {
      this.isRecording = false;
      if (onError) onError(err.message || 'Microphone access denied or unavailable.');
    }
  }

  /**
   * Stop active microphone recording
   */
  stopMicrophoneRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
    }
  }
}

// Global instance
window.courtAudio = new CourtAudioEngine();
