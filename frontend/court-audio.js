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
    
    // Voice & Language Settings (Issue 5: Hindi / English + Sarvam AI)
    this.language = localStorage.getItem('lexora_voice_lang') || 'en-IN'; // 'en-IN' or 'hi-IN'
    this.sarvamApiKey = localStorage.getItem('lexora_sarvam_api_key') || '';
    this.currentAudio = null;
    this.backendUrl = 'http://localhost:8000';
    this.lastVoiceEngine = 'browser'; // 'sarvam' or 'browser'
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
    if (this.isMuted) {
      if (this.currentAudio) {
        try { this.currentAudio.pause(); } catch(e) {}
      }
      if (this.speechSynth) {
        this.speechSynth.cancel();
      }
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

  setLanguage(langCode) {
    if (langCode === 'hi' || langCode === 'hi-IN') {
      this.language = 'hi-IN';
    } else {
      this.language = 'en-IN';
    }
    localStorage.setItem('lexora_voice_lang', this.language);
    return this.language;
  }

  getLanguage() {
    return this.language;
  }

  setSarvamApiKey(key) {
    this.sarvamApiKey = (key || '').trim();
    localStorage.setItem('lexora_sarvam_api_key', this.sarvamApiKey);
    return this.sarvamApiKey;
  }

  getSarvamApiKey() {
    return this.sarvamApiKey;
  }

  getVoiceEngineStatus() {
    return this.sarvamApiKey ? 'Sarvam AI Neural TTS' : 'Browser Speech Synthesis (Set Sarvam Key for Ultra-Realistic)';
  }

  /**
   * Speak judicial pronouncements using Sarvam AI (with Web Speech fallback)
   * Supports both English (en-IN) and Hindi (hi-IN)
   */
  async speak(text, onComplete = null) {
    if (this.isMuted) {
      if (onComplete) onComplete();
      return;
    }

    // Stop any ongoing audio playback
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch (e) {}
      this.currentAudio = null;
    }
    if (this.speechSynth) {
      this.speechSynth.cancel();
    }

    // 1. Try Sarvam AI via Backend Endpoint
    let playedSarvam = false;
    try {
      const resp = await fetch(`${this.backendUrl}/api/ai/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text,
          language_code: this.language,
          speaker: 'aditya',
          sarvam_api_key: this.sarvamApiKey || undefined
        })
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data.success && data.audio_base64) {
          const audio = new Audio(`data:audio/wav;base64,${data.audio_base64}`);
          this.currentAudio = audio;
          this.lastVoiceEngine = 'sarvam';
          audio.onended = () => {
            this.currentAudio = null;
            if (onComplete) onComplete();
          };
          audio.onerror = () => {
            this.currentAudio = null;
            this.speakWithBrowserFallback(text, onComplete);
          };
          await audio.play();
          playedSarvam = true;
          return;
        }
      }
    } catch (e) {
      // Backend not running or network issue, proceed to direct client Sarvam attempt
    }

    // 2. Direct Sarvam API call from browser if client API key is provided
    if (!playedSarvam && this.sarvamApiKey) {
      try {
        let speechText = text.trim();
        if (this.language === 'hi-IN') {
          speechText = this.translateLegalToHindi(speechText);
        }

        // Chunk text into sentences (max 380 chars per chunk)
        const chunks = this.chunkTextIntoSentences(speechText, 380);

        const directResp = await fetch('https://api.sarvam.ai/text-to-speech', {
          method: 'POST',
          headers: {
            'api-subscription-key': this.sarvamApiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            inputs: chunks,
            target_language_code: this.language,
            speaker: 'aditya',
            pitch: 0,
            pace: 0.95,
            loudness: 1.5,
            speech_sample_rate: 22050,
            enable_preprocessing: true,
            model: 'bulbul:v3'
          })
        });

        if (directResp.ok) {
          const sData = await directResp.json();
          if (sData.audios && sData.audios[0]) {
            const audio = new Audio(`data:audio/wav;base64,${sData.audios[0]}`);
            this.currentAudio = audio;
            this.lastVoiceEngine = 'sarvam';
            audio.onended = () => {
              this.currentAudio = null;
              if (onComplete) onComplete();
            };
            audio.onerror = () => {
              this.currentAudio = null;
              this.speakWithBrowserFallback(text, onComplete);
            };
            await audio.play();
            return;
          }
        }
      } catch (err) {
        console.warn('Direct Sarvam TTS call failed, falling back to browser:', err);
      }
    }

    // 3. Browser Speech Synthesis Fallback
    this.speakWithBrowserFallback(text, onComplete);
  }

  /**
   * Translates legal text, courtroom pleadings, and rulings to formal Hindi
   */
  translateLegalToHindi(text) {
    if (!text) return '';
    let str = text;

    const rules = [
      [/\border in the court\b/gi, 'अदालत में शांति बनाए रखें।'],
      [/\bcourt is now in session\b/gi, 'माननीय न्यायालय की कार्यवाही प्रारंभ होती है।'],
      [/\ball rise for the final judgment\b/gi, 'लेक्सोरा उच्च न्यायिक न्यायाधिकरण के अंतिम फैसले के लिए सभी उपस्थित जन सम्मानपूर्वक खड़े हो जाएं।'],
      [/\bguilty as charged\b/gi, 'अभियुक्त को सभी आरोपों में दोषी करार दिया जाता है।'],
      [/\bacquitted of all charges\b/gi, 'अभियुक्त को सभी आरोपों से ससम्मान बरी किया जाता है।'],
      [/\bthe court has reached a verdict\b/gi, 'माननीय न्यायाधिकरण अंतिम निर्णय पर पहुंच गया है।'],
      [/\benglish judicial voice activated\b/gi, 'अंग्रेजी न्यायिक स्वर सक्रिय है।'],
      [/\bYour Honour,\b/gi, 'माननीय न्यायाधीश महोदय,'],
      [/\bthe accused issued Cheque No\.?\s*(\d+)/gi, 'अभियुक्त ने चेक संख्या $1'],
      [/\bfor INR ([\d,]+)/gi, 'राशि रुपये $1 का जारी किया'],
      [/\btowards a legally enforceable debt\b/gi, 'कानूनी रूप से देनदारी के भुगतान हेतु'],
      [/\backnowledged in writing on (\d+ \w+ \d+)/gi, 'जिसकी लिखित स्वीकारोक्ति दिनांक $1 को की गई थी।'],
      [/\bThe cheque was dishonoured for insufficient funds on (\d+ \w+ \d+)/gi, 'उक्त चेक बैंक खाते में अपर्याप्त राशि होने के कारण अनादरित हुआ दिनांक $1 को'],
      [/\band a legal notice was served on (\d+ \w+ \d+)/gi, 'तथा कानूनी नोटिस प्रेषित किया गया दिनांक $1 को।'],
      [/\bThe accused failed to pay within (\d+) days/gi, 'अभियुक्त $1 दिनों की वैधानिक अवधि में भुगतान करने में पूरी तरह विफल रहा।'],
      [/\bAll ingredients of Section 138 NI Act are established by the bank memo, the legal notice and the loan acknowledgement/gi, 'परक्राम्य लिखित अधिनियम की धारा 138 के सभी आवश्यक कानूनी तत्व बैंक अनादर मेमो, विधिक सूचना पत्र तथा ऋण स्वीकारोक्ति द्वारा पूर्णतः सिद्ध होते हैं।'],
      [/\bThe Court admits the statement tendered by Prosecution/gi, 'माननीय न्यायालय अभियोजन पक्ष द्वारा प्रस्तुत वक्तव्य को आधिकारिक रिकॉर्ड पर स्वीकार करता है।'],
      [/\bProbative weight assessed as (\w+) on the evidentiary balance/gi, 'साक्ष्यीय संतुलन के आधार पर विश्वसनीयता का मूल्यांकन $1 के रूप में किया गया है।'],
      [/\bThe AI Bench evaluated the submission content and corroborative clarity/gi, 'एआई पीठ ने प्रस्तुत साक्ष्यों की सामग्री तथा सहायक स्पष्टता का सूक्ष्म विश्लेषण किया'],
      [/\bawarding a ([\d.]+)% shift on evidentiary merit/gi, 'तथा साक्ष्यीय योग्यता के आधार पर न्याय तराजू में $1 प्रतिशत का परिवर्तन प्रदान किया।'],
      [/\bThe Court\b/gi, 'माननीय न्यायालय'],
      [/\bProsecution\b/gi, 'अभियोजन पक्ष'],
      [/\bDefense\b/gi, 'प्रतिरक्षा पक्ष'],
      [/\bAccused\b/gi, 'अभियुक्त'],
      [/\bComplainant\b/gi, 'शिकायतकर्ता'],
      [/\bSection 138\b/gi, 'धारा 138'],
      [/\bNegotiable Instruments Act\b/gi, 'परक्राम्य लिखित अधिनियम'],
      [/\bBank Memo\b/gi, 'बैंक अनादर मेमो'],
      [/\bLegal Notice\b/gi, 'कानूनी नोटिस']
    ];

    for (const [pattern, repl] of rules) {
      str = str.replace(pattern, repl);
    }
    return str;
  }

  /**
   * Chunks long text into sentences max 380 chars per chunk
   */
  chunkTextIntoSentences(text, maxChars = 380) {
    if (!text || text.length <= maxChars) return [text || ''];
    const sentences = text.match(/[^.!?|।]+[.!?|।]+/g) || [text];
    const chunks = [];
    let curr = '';
    for (const s of sentences) {
      const sClean = s.trim();
      if (!sClean) continue;
      if ((curr + ' ' + sClean).length <= maxChars) {
        curr = (curr + ' ' + sClean).trim();
      } else {
        if (curr) chunks.push(curr);
        curr = sClean;
      }
    }
    if (curr) chunks.push(curr);
    return chunks.length > 0 ? chunks : [text.slice(0, maxChars)];
  }

  /**
   * Browser Speech Synthesis fallback supporting English & Hindi
   * Properly waits for voices to load before speaking (fixes Hindi voice not working)
   */
  speakWithBrowserFallback(text, onComplete = null) {
    if (this.isMuted || !this.speechSynth) {
      if (onComplete) onComplete();
      return;
    }

    this.lastVoiceEngine = 'browser';
    this.speechSynth.cancel();

    let speakText = text;
    if (this.language === 'hi-IN') {
      speakText = this.translateLegalToHindi(speakText);
    }

    const doSpeak = (voices) => {
      const utterance = new SpeechSynthesisUtterance(speakText);
      utterance.rate = 0.92;
      utterance.pitch = 0.85;
      utterance.volume = 1.0;

      if (this.language === 'hi-IN') {
        utterance.lang = 'hi-IN';
        // Prefer: Hindi named voices, then Indian voices, then any hi- locale
        const hindiVoice = voices.find(v =>
          v.lang === 'hi-IN' ||
          v.lang === 'hi' ||
          v.name.toLowerCase().includes('hindi') ||
          v.name.toLowerCase().includes('हिन्दी') ||
          v.name.toLowerCase().includes('lekha') ||
          v.name.toLowerCase().includes('google हिन्दी') ||
          v.lang.startsWith('hi')
        );
        if (hindiVoice) {
          utterance.voice = hindiVoice;
        }
        // If no Hindi voice found, speakText is still Hindi unicode — browser will try
      } else {
        utterance.lang = 'en-IN';
        const indianEnVoice = voices.find(v =>
          v.lang === 'en-IN' ||
          v.name.includes('Rishi') ||
          v.name.includes('Heera') ||
          v.name.includes('India')
        );
        const enVoice = indianEnVoice ||
          voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) ||
          voices.find(v => v.name.includes('Daniel') || v.name.includes('David') || v.name.includes('Natural')) ||
          voices.find(v => v.lang.startsWith('en'));
        if (enVoice) utterance.voice = enVoice;
      }

      if (onComplete) {
        utterance.onend = onComplete;
        utterance.onerror = () => {
          console.warn('SpeechSynthesis error, ignoring.');
          if (onComplete) onComplete();
        };
      }
      this.speechSynth.speak(utterance);
    };

    // Voices may not be loaded yet — wait for them
    const voices = this.speechSynth.getVoices();
    if (voices && voices.length > 0) {
      doSpeak(voices);
    } else {
      // Wait for voices to be available (async in Chrome/Edge)
      const handler = () => {
        this.speechSynth.removeEventListener('voiceschanged', handler);
        doSpeak(this.speechSynth.getVoices());
      };
      this.speechSynth.addEventListener('voiceschanged', handler);
      // Timeout fallback: speak anyway after 800ms
      setTimeout(() => {
        this.speechSynth.removeEventListener('voiceschanged', handler);
        doSpeak(this.speechSynth.getVoices());
      }, 800);
    }
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
