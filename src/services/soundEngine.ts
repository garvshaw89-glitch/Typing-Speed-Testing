import { SoundPack } from '../types';

// Web Audio API Synthesizer with Multi-Sound Pack Engine
// Supports Mechanical, Typewriter, Soft, Thock, and Bubble sound packs
// All generated client-side using pure Web Audio synthesis (zero network latency, offline ready)

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private enabled: boolean = true;
  private soundPack: SoundPack = 'mechanical';
  private volume: number = 0.8;
  private noiseBuffer: AudioBuffer | null = null;

  constructor() {
    // AudioContext is lazily initialized on user interaction
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setSoundPack(pack: SoundPack) {
    this.soundPack = pack;
  }

  public getSoundPack(): SoundPack {
    return this.soundPack;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.ctx && this.masterGain) {
      try {
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      } catch {
        // Ignore audio errors
      }
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  private initCtx(): AudioContext | null {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    if (this.ctx && !this.noiseBuffer) {
      this.initNoiseBuffer(this.ctx);
    }
    return this.ctx;
  }

  // Pre-generate 0.5s of white/pink noise for transient clicks and mechanical strikes
  private initNoiseBuffer(ctx: AudioContext) {
    try {
      const bufferSize = ctx.sampleRate * 0.5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        data[i] = (b0 + b1 + b2 + white * 0.5362) * 0.12;
      }
      this.noiseBuffer = buffer;
    } catch {
      // Noise buffer failure fallback
    }
  }

  // Small random pitch variation (±4%) to simulate organic finger strike variance
  private getRandomJitter(): number {
    return 1 + (Math.random() - 0.5) * 0.08;
  }

  // -------------------------------------------------------------
  // KEYBOARD SOUND PACK DISPATCHER
  // -------------------------------------------------------------
  public playKeyClick(char?: string, packOverride?: SoundPack) {
    if (!this.enabled) return;
    const ctx = this.initCtx();
    if (!ctx || !this.masterGain) return;

    const pack = packOverride || this.soundPack;
    const isSpace = char === ' ';
    const isReturn = char === '\n';
    const jitter = this.getRandomJitter();

    try {
      switch (pack) {
        case 'mechanical':
          this.synthesizeMechanical(ctx, isSpace, isReturn, jitter);
          break;
        case 'typewriter':
          this.synthesizeTypewriter(ctx, isSpace, isReturn, jitter);
          break;
        case 'soft':
          this.synthesizeSoft(ctx, isSpace, isReturn, jitter);
          break;
        case 'thock':
          this.synthesizeThock(ctx, isSpace, isReturn, jitter);
          break;
        case 'bubble':
          this.synthesizeBubble(ctx, isSpace, isReturn, jitter);
          break;
        default:
          this.synthesizeMechanical(ctx, isSpace, isReturn, jitter);
          break;
      }
    } catch {
      // Ignore audio synthesis errors
    }
  }

  public playBackspaceSound(packOverride?: SoundPack) {
    if (!this.enabled) return;
    const ctx = this.initCtx();
    if (!ctx || !this.masterGain) return;

    const pack = packOverride || this.soundPack;
    const jitter = this.getRandomJitter();

    try {
      switch (pack) {
        case 'typewriter':
          this.synthesizeTypewriterBackspace(ctx, jitter);
          break;
        case 'bubble':
          this.synthesizeBubbleBackspace(ctx, jitter);
          break;
        case 'thock':
          this.synthesizeThock(ctx, false, false, jitter * 1.15);
          break;
        case 'soft':
          this.synthesizeSoft(ctx, false, false, jitter * 1.1);
          break;
        case 'mechanical':
        default:
          this.synthesizeMechanical(ctx, false, false, jitter * 1.2);
          break;
      }
    } catch {
      // Ignore errors
    }
  }

  // -------------------------------------------------------------
  // SOUND PACK 1: MECHANICAL (Tactile Clicky Switch / Cherry MX Blue)
  // -------------------------------------------------------------
  private synthesizeMechanical(
    ctx: AudioContext,
    isSpace: boolean,
    isReturn: boolean,
    jitter: number
  ) {
    const now = ctx.currentTime;
    const duration = isSpace || isReturn ? 0.045 : 0.032;

    // 1. Click leaf snap (noise burst through bandpass filter)
    if (this.noiseBuffer) {
      const noise = ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime((isSpace ? 2600 : 3400) * jitter, now);
      filter.Q.setValueAtTime(3.2, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime((isSpace ? 0.12 : 0.16), now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.012);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.masterGain!);

      noise.start(now);
      noise.stop(now + 0.012);
    }

    // 2. Housing bottom-out thud
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = isSpace ? 'triangle' : 'sine';
    const startFreq = (isSpace ? 150 : isReturn ? 190 : 250) * jitter;
    const endFreq = (isSpace ? 60 : 85) * jitter;

    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

    const initialGain = isSpace ? 0.14 : 0.09;
    gain.gain.setValueAtTime(initialGain, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(now);
    osc.stop(now + duration);
  }

  // -------------------------------------------------------------
  // SOUND PACK 2: TYPEWRITER (Vintage Cast-Iron Clack & Bell)
  // -------------------------------------------------------------
  private synthesizeTypewriter(
    ctx: AudioContext,
    isSpace: boolean,
    isReturn: boolean,
    jitter: number
  ) {
    const now = ctx.currentTime;

    // If Return key is pressed, play the classic carriage return bell!
    if (isReturn) {
      this.synthesizeTypewriterBell(ctx);
      return;
    }

    if (isSpace) {
      // Heavy mechanical carriage escapement advance thunk
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(175 * jitter, now);
      osc.frequency.exponentialRampToValueAtTime(55 * jitter, now + 0.05);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(now);
      osc.stop(now + 0.05);

      // Metal pawl click
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = 'square';
      clickOsc.frequency.setValueAtTime(1350 * jitter, now);
      clickGain.gain.setValueAtTime(0.08, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);
      clickOsc.connect(clickGain);
      clickGain.connect(this.masterGain!);
      clickOsc.start(now);
      clickOsc.stop(now + 0.015);
      return;
    }

    // Regular strike: Metal type bar hitting platen
    // 1. Sharp metallic impact
    const impOsc = ctx.createOscillator();
    const impGain = ctx.createGain();
    impOsc.type = 'triangle';
    impOsc.frequency.setValueAtTime(2300 * jitter, now);
    impOsc.frequency.exponentialRampToValueAtTime(600 * jitter, now + 0.018);

    impGain.gain.setValueAtTime(0.19, now);
    impGain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);

    impOsc.connect(impGain);
    impGain.connect(this.masterGain!);
    impOsc.start(now);
    impOsc.stop(now + 0.018);

    // 2. Hollow cast iron chassis ring
    const chassis = ctx.createOscillator();
    const chassisGain = ctx.createGain();
    chassis.type = 'sine';
    chassis.frequency.setValueAtTime(460 * jitter, now);
    chassis.frequency.exponentialRampToValueAtTime(220 * jitter, now + 0.045);

    chassisGain.gain.setValueAtTime(0.11, now);
    chassisGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    chassis.connect(chassisGain);
    chassisGain.connect(this.masterGain!);
    chassis.start(now);
    chassis.stop(now + 0.045);
  }

  private synthesizeTypewriterBackspace(ctx: AudioContext, jitter: number) {
    const now = ctx.currentTime;
    // Rapid mechanical ratchet tick-tick
    [0, 0.018].forEach((delay, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime((idx === 0 ? 1900 : 1600) * jitter, now + delay);
      gain.gain.setValueAtTime(0.09, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.012);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(now + delay);
      osc.stop(now + delay + 0.012);
    });
  }

  private synthesizeTypewriterBell(ctx: AudioContext) {
    const now = ctx.currentTime;
    // Classic G6 typewriter margin bell chime (1568 Hz)
    const bell = ctx.createOscillator();
    const bellGain = ctx.createGain();
    bell.type = 'sine';
    bell.frequency.setValueAtTime(1567.98, now);

    bellGain.gain.setValueAtTime(0.18, now);
    bellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    bell.connect(bellGain);
    bellGain.connect(this.masterGain!);
    bell.start(now);
    bell.stop(now + 0.45);

    // Add metallic clack base
    const thud = ctx.createOscillator();
    const thudGain = ctx.createGain();
    thud.type = 'triangle';
    thud.frequency.setValueAtTime(240, now);
    thud.frequency.exponentialRampToValueAtTime(80, now + 0.06);
    thudGain.gain.setValueAtTime(0.12, now);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    thud.connect(thudGain);
    thudGain.connect(this.masterGain!);
    thud.start(now);
    thud.stop(now + 0.06);
  }

  // -------------------------------------------------------------
  // SOUND PACK 3: SOFT (Muted Laptop Chiclet / Quiet Scissor-Switch)
  // -------------------------------------------------------------
  private synthesizeSoft(
    ctx: AudioContext,
    isSpace: boolean,
    _isReturn: boolean,
    jitter: number
  ) {
    const now = ctx.currentTime;
    const duration = isSpace ? 0.038 : 0.026;

    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime((isSpace ? 650 : 850) * jitter, now);

    osc.type = 'sine';
    const startFreq = (isSpace ? 210 : 310) * jitter;
    const endFreq = (isSpace ? 85 : 125) * jitter;

    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

    // Smooth soft attack (2ms) so there's zero harsh snap
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(isSpace ? 0.11 : 0.075, now + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(now);
    osc.stop(now + duration);
  }

  // -------------------------------------------------------------
  // SOUND PACK 4: THOCK (Deep, Creamy Lubed Linear / POM Plate)
  // -------------------------------------------------------------
  private synthesizeThock(
    ctx: AudioContext,
    isSpace: boolean,
    _isReturn: boolean,
    jitter: number
  ) {
    const now = ctx.currentTime;
    const duration = isSpace ? 0.048 : 0.036;

    // Resonant lowpass filter creates that signature deep "wooden / marbly" acoustic resonance
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime((isSpace ? 320 : 420) * jitter, now);
    filter.Q.setValueAtTime(2.6, now);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    const startFreq = (isSpace ? 135 : 190) * jitter;
    const endFreq = (isSpace ? 48 : 65) * jitter;

    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

    gain.gain.setValueAtTime(isSpace ? 0.22 : 0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(now);
    osc.stop(now + duration);
  }

  // -------------------------------------------------------------
  // SOUND PACK 5: BUBBLE POP (Playful, Modern Melodic Drops)
  // -------------------------------------------------------------
  private synthesizeBubble(
    ctx: AudioContext,
    isSpace: boolean,
    _isReturn: boolean,
    jitter: number
  ) {
    const now = ctx.currentTime;
    const duration = isSpace ? 0.038 : 0.024;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const startFreq = (isSpace ? 230 : 360) * jitter;
    const peakFreq = (isSpace ? 560 : 860) * jitter;

    // Upward sweep creates the bubbling "pop"
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(peakFreq, now + duration * 0.45);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 0.8, now + duration);

    gain.gain.setValueAtTime(isSpace ? 0.14 : 0.095, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(now);
    osc.stop(now + duration);
  }

  private synthesizeBubbleBackspace(ctx: AudioContext, jitter: number) {
    const now = ctx.currentTime;
    // Downward pop for backspace
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(740 * jitter, now);
    osc.frequency.exponentialRampToValueAtTime(260 * jitter, now + 0.03);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start(now);
    osc.stop(now + 0.03);
  }

  // -------------------------------------------------------------
  // ERROR SOUND (Styled slightly by sound pack)
  // -------------------------------------------------------------
  public playErrorSound(packOverride?: SoundPack) {
    if (!this.enabled) return;
    const ctx = this.initCtx();
    if (!ctx || !this.masterGain) return;

    const pack = packOverride || this.soundPack;
    const now = ctx.currentTime;

    try {
      if (pack === 'soft') {
        // Muted low double-tap
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(210, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.06);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(now);
        osc.stop(now + 0.06);
      } else if (pack === 'typewriter') {
        // Metallic lock / clunk
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.type = 'sawtooth';
        osc2.type = 'square';
        osc1.frequency.setValueAtTime(220, now);
        osc2.frequency.setValueAtTime(293.66, now); // Dissonant minor 3rd
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.masterGain!);
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.07);
        osc2.stop(now + 0.07);
      } else if (pack === 'bubble') {
        // Low comical bubble blip
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.07);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(now);
        osc.stop(now + 0.07);
      } else {
        // Classic mechanical error buzzer
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.08);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(now);
        osc.stop(now + 0.08);
      }
    } catch {
      // Ignore audio errors
    }
  }

  // -------------------------------------------------------------
  // PREVIEW HELPER (For Settings Menu)
  // Plays a charming 3-keystroke preview sequence: [char, char, space]
  // -------------------------------------------------------------
  public previewSoundPack(pack: SoundPack) {
    const ctx = this.initCtx();
    if (!ctx) return;

    // Temporarily ensure masterGain is unmuted for preview
    const originalGain = this.masterGain?.gain.value ?? this.volume;
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(Math.max(0.4, this.volume), ctx.currentTime);
    }

    // Play 3 rapid keystrokes to give an instant realistic preview
    this.playKeyClick('a', pack);
    setTimeout(() => {
      this.playKeyClick('b', pack);
    }, 90);
    setTimeout(() => {
      this.playKeyClick(' ', pack);
      if (this.masterGain) {
        this.masterGain.gain.setValueAtTime(originalGain, ctx.currentTime + 0.1);
      }
    }, 180);
  }

  // -------------------------------------------------------------
  // COUNTDOWN, FANFARES, WARMUP & METRONOME (Preserved & Enhanced)
  // -------------------------------------------------------------
  public playCountdownBeep(isFinal: boolean = false) {
    if (!this.enabled) return;
    const ctx = this.initCtx();
    if (!ctx || !this.masterGain) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      const freq = isFinal ? 880 : 440;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const duration = isFinal ? 0.25 : 0.12;
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Ignore audio errors
    }
  }

  public playSuccessChime(isHighscore: boolean = false) {
    if (!this.enabled) return;
    const ctx = this.initCtx();
    if (!ctx || !this.masterGain) return;

    try {
      const notes = isHighscore ? [523.25, 659.25, 783.99, 1046.50] : [523.25, 659.25, 783.99];
      notes.forEach((freq, i) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.1);

        gain.gain.setValueAtTime(0.15, this.ctx.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.1 + 0.3);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(this.ctx.currentTime + i * 0.1);
        osc.stop(this.ctx.currentTime + i * 0.1 + 0.3);
      });
    } catch {
      // Ignore audio errors
    }
  }

  public playTrophyFanfare() {
    if (!this.enabled) return;
    const ctx = this.initCtx();
    if (!ctx || !this.masterGain) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      notes.forEach((freq, i) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = i === notes.length - 1 ? 'triangle' : 'sine';
        const startTime = this.ctx.currentTime + i * 0.09;
        const noteDuration = i === notes.length - 1 ? 0.6 : 0.22;

        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.18, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(startTime);
        osc.stop(startTime + noteDuration);
      });
    } catch {
      // Ignore audio errors
    }
  }

  public playWarmupKeyClick() {
    if (!this.enabled) return;
    const ctx = this.initCtx();
    if (!ctx || !this.masterGain) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // Ignore audio errors
    }
  }

  public playWarmupCompletionChime() {
    if (!this.enabled) return;
    const ctx = this.initCtx();
    if (!ctx || !this.masterGain) return;

    try {
      const chord = [349.23, 440.0, 523.25, 659.25];
      chord.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.07);

        gain.gain.setValueAtTime(0.1, this.ctx.currentTime + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.07 + 0.45);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(this.ctx.currentTime + idx * 0.07);
        osc.stop(this.ctx.currentTime + idx * 0.07 + 0.45);
      });
    } catch {
      // Ignore audio errors
    }
  }

  public playMetronomeTick(isAccent: boolean = false) {
    if (!this.enabled) return;
    const ctx = this.initCtx();
    if (!ctx || !this.masterGain) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(isAccent ? 800 : 500, ctx.currentTime);

      gain.gain.setValueAtTime(isAccent ? 0.05 : 0.025, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(ctx.currentTime + 0.02);
    } catch {
      // Ignore audio errors
    }
  }
}

export const soundEngine = new SoundEngine();
