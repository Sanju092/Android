/**
 * Audio Engine for MetroTrack Hyderabad
 * Supports Web Audio API synthesized tones, pre-rendered chime presets,
 * and persistent user-uploaded custom music files.
 */

class MetroAudioEngine {
  constructor() {
    this.audioCtx = null;
    this.customAudioElement = null;
    this.customAudioUrl = null;
    this.volume = 0.8;
  }

  getAudioContext() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.customAudioElement) {
      this.customAudioElement.volume = this.volume;
    }
  }

  /**
   * Plays a pleasant multi-tone sequence using Web Audio oscillator
   */
  playToneSequence(notes, durationPerNote = 0.22, type = 'sine') {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, now + idx * durationPerNote);

        gain.gain.setValueAtTime(0.001, now + idx * durationPerNote);
        gain.gain.exponentialRampToValueAtTime(0.35 * this.volume, now + idx * durationPerNote + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + (idx + 1) * durationPerNote);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * durationPerNote);
        osc.stop(now + (idx + 1) * durationPerNote);
      });
    } catch (err) {
      console.warn('Web Audio playback error:', err);
    }
  }

  /**
   * Signature 3-tone Metro Station Ding (F4, A4, C5)
   */
  playMetroChime() {
    this.playToneSequence([349.23, 440.0, 523.25], 0.25, 'triangle');
  }

  /**
   * Distinct Double-Ping for Interchange Stations (High energy warning)
   */
  playInterchangeAlert() {
    this.playToneSequence([587.33, 880.0, 587.33, 880.0], 0.18, 'sine');
  }

  /**
   * Triumphant Destination Fanfare (C4, E4, G4, C5 chord progression)
   */
  playDestinationArrival() {
    this.playToneSequence([523.25, 659.25, 783.99, 1046.5], 0.3, 'sine');
  }

  /**
   * Intermediate station gentle chime
   */
  playStationApproach() {
    this.playToneSequence([440.0, 554.37], 0.2, 'sine');
  }

  /**
   * Loads custom music from a file or data URL
   */
  loadCustomAudio(dataUrl) {
    this.customAudioUrl = dataUrl;
    if (this.customAudioElement) {
      this.customAudioElement.pause();
      this.customAudioElement.src = '';
    }
    this.customAudioElement = new Audio(dataUrl);
    this.customAudioElement.volume = this.volume;
  }

  /**
   * Plays the custom user uploaded music
   */
  playCustomAudio() {
    if (!this.customAudioElement && this.customAudioUrl) {
      this.loadCustomAudio(this.customAudioUrl);
    }
    if (this.customAudioElement) {
      this.customAudioElement.currentTime = 0;
      this.customAudioElement.play().catch((err) => {
        console.warn('Could not autoplay custom audio:', err);
        // Fallback to synth tone if browser blocked audio element
        this.playDestinationArrival();
      });
    } else {
      // Fallback
      this.playDestinationArrival();
    }
  }

  stopCustomAudio() {
    if (this.customAudioElement) {
      this.customAudioElement.pause();
      this.customAudioElement.currentTime = 0;
    }
  }

  /**
   * Dispatches the appropriate alert sound based on settings and event type
   */
  triggerAlertSound(type, settings) {
    if (!settings || !settings.soundEnabled) return;

    if (settings.useCustomMusic && this.customAudioUrl) {
      // User chose custom music mode!
      if (type === 'DESTINATION' || (type === 'INTERCHANGE' && settings.customMusicForInterchange)) {
        this.playCustomAudio();
        return;
      }
    }

    // Built-in presets
    switch (type) {
      case 'DESTINATION':
        this.playDestinationArrival();
        break;
      case 'INTERCHANGE':
        this.playInterchangeAlert();
        break;
      case 'UPCOMING':
      default:
        this.playMetroChime();
        break;
    }
  }
}

export const metroAudio = new MetroAudioEngine();
