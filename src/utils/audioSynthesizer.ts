/**
 * Audio Synthesizer and Audio Stream Manager
 * Creates formant-synthesized speech audio to simulate realistic human vs AI voice streams,
 * and manages microphone & uploaded audio file playback through Web Audio API AnalyserNode.
 */

export interface SpeechVocalTract {
  f0: number; // fundamental pitch in Hz
  jitterAmount: number; // micro-variation in pitch (0.001 to 0.03)
  shimmerAmount: number; // micro-variation in amplitude
  formants: [number, number, number]; // F1, F2, F3 resonance frequencies
  bandwidthCutoff: number; // e.g. 7500 Hz for synthetic vocoder cutoff vs 16000 Hz for human
  isRoboticPhase: boolean;
}

export class StreamAudioManager {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private sourceNode: AudioNode | null = null;
  private stream: MediaStream | null = null;
  private isSynthesizing = false;
  private synthInterval: number | null = null;
  private gainNode: GainNode | null = null;

  initContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (!this.analyser) {
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 1024;
      this.analyser.smoothingTimeConstant = 0.65;
    }
    if (!this.gainNode) {
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.gainNode.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  getAudioContext(): AudioContext | null {
    return this.ctx;
  }

  /**
   * Starts capturing from microphone stream.
   */
  async startMicrophone(): Promise<MediaStream> {
    this.stopCurrentStream();
    const ctx = this.initContext();
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });
    this.stream = stream;
    const micSource = ctx.createMediaStreamSource(stream);
    micSource.connect(this.analyser!);
    // Do not connect mic to destination speaker to prevent acoustic feedback loop!
    this.sourceNode = micSource;
    return stream;
  }

  /**
   * Plays an uploaded audio file buffer.
   */
  async playAudioBuffer(buffer: AudioBuffer, onEnded?: () => void): Promise<void> {
    this.stopCurrentStream();
    const ctx = this.initContext();
    const bufferSource = ctx.createBufferSource();
    bufferSource.buffer = buffer;

    bufferSource.connect(this.analyser!);
    this.analyser!.connect(this.gainNode!);
    bufferSource.onended = () => {
      if (onEnded) onEnded();
    };

    bufferSource.start(0);
    this.sourceNode = bufferSource;
  }

  /**
   * Generates continuous formant synthesized audio corresponding to Human, AI, or Mixed profile.
   */
  startSpeechPreset(
    profileType: 'human' | 'ai' | 'mixed',
    onTick?: (currentTime: number) => void
  ): void {
    this.stopCurrentStream();
    const ctx = this.initContext();
    this.isSynthesizing = true;

    let timeElapsed = 0;
    const stepDuration = 0.28; // phoneme step duration

    // Phoneme vowel formant presets [F1, F2, F3]
    const vowelFormants: [number, number, number][] = [
      [730, 1090, 2440], // /a/
      [270, 2290, 3010], // /i/
      [300, 870, 2240],  // /u/
      [530, 1840, 2480], // /e/
      [570, 840, 2410],  // /o/
    ];

    const generatePhoneme = () => {
      if (!this.isSynthesizing || !this.ctx) return;

      const now = this.ctx.currentTime;
      let isAiPhase = false;

      if (profileType === 'ai') {
        isAiPhase = true;
      } else if (profileType === 'human') {
        isAiPhase = false;
      } else {
        // Mixed: switch every 4 seconds
        isAiPhase = (Math.floor(timeElapsed / 3.8) % 2) === 1;
      }

      // Pick formant configuration
      const vowelIdx = Math.floor(Math.random() * vowelFormants.length);
      const formants = vowelFormants[vowelIdx];

      // Fundamental pitch F0
      let baseF0 = isAiPhase ? 185.0 : 135.0; // AI often consistent high or rigid pitch
      if (isAiPhase) {
        // AI has almost zero micro-jitter, very rigid pitch
        baseF0 += (Math.random() - 0.5) * 0.4;
      } else {
        // Human voice has natural vocal fold jitter (1.2% - 2.0%)
        const vibrato = Math.sin(timeElapsed * 18.0) * 4.5;
        const microJitter = (Math.random() - 0.5) * 6.0;
        baseF0 += vibrato + microJitter;
      }

      // Create primary glottal pulse oscillator (sawtooth/pulse)
      const osc = this.ctx.createOscillator();
      osc.type = isAiPhase ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(baseF0, now);

      // Create formant bandpass resonance filters (F1, F2, F3)
      const filter1 = this.ctx.createBiquadFilter();
      filter1.type = 'bandpass';
      filter1.frequency.setValueAtTime(formants[0], now);
      filter1.Q.setValueAtTime(isAiPhase ? 7.0 : 4.0, now);

      const filter2 = this.ctx.createBiquadFilter();
      filter2.type = 'bandpass';
      filter2.frequency.setValueAtTime(formants[1], now);
      filter2.Q.setValueAtTime(isAiPhase ? 8.0 : 5.0, now);

      const filter3 = this.ctx.createBiquadFilter();
      filter3.type = 'bandpass';
      filter3.frequency.setValueAtTime(formants[2], now);
      filter3.Q.setValueAtTime(isAiPhase ? 9.0 : 6.0, now);

      // Artificial vocoder cutoff filter for AI (HiFi-GAN/WaveNet cutoff above 7.6 kHz)
      const vocoderFilter = this.ctx.createBiquadFilter();
      if (isAiPhase) {
        vocoderFilter.type = 'lowpass';
        vocoderFilter.frequency.setValueAtTime(7400, now);
        vocoderFilter.Q.setValueAtTime(2.0, now);
      } else {
        vocoderFilter.type = 'allpass';
      }

      // Envelope gain node
      const envGain = this.ctx.createGain();
      envGain.gain.setValueAtTime(0.001, now);
      envGain.gain.linearRampToValueAtTime(0.18, now + 0.04);
      envGain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration - 0.02);

      // Connect pipeline
      osc.connect(filter1);
      osc.connect(filter2);
      osc.connect(filter3);

      filter1.connect(vocoderFilter);
      filter2.connect(vocoderFilter);
      filter3.connect(vocoderFilter);

      vocoderFilter.connect(envGain);
      envGain.connect(this.analyser!);
      envGain.connect(this.gainNode!);

      osc.start(now);
      osc.stop(now + stepDuration);

      timeElapsed += stepDuration;
      if (onTick) {
        onTick(Math.round(timeElapsed * 10) / 10);
      }
    };

    // Run first phoneme immediately, then loop
    generatePhoneme();
    this.synthInterval = window.setInterval(generatePhoneme, stepDuration * 1000);
  }

  stopCurrentStream(): void {
    this.isSynthesizing = false;
    if (this.synthInterval !== null) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    if (this.sourceNode) {
      try {
        (this.sourceNode as AudioBufferSourceNode).stop?.();
      } catch {
        // ignore
      }
      try {
        this.sourceNode.disconnect();
      } catch {
        // ignore
      }
      this.sourceNode = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
  }

  setVolume(volume: number): void {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime);
    }
  }

  isStreamActive(): boolean {
    return this.isSynthesizing || !!this.stream || !!this.sourceNode;
  }
}

export const audioManager = new StreamAudioManager();
