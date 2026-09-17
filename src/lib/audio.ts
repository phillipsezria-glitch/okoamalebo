/**
 * Okoa Malebo - Audio System
 * Web Audio API for recovery interaction sounds
 */

type SoundEffect = 
  | 'button_click' 
  | 'victory';

class AudioManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;
  private masterVolume: number = 0.5;
  private soundBuffers: Map<string, AudioBuffer> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudioContext();
      this.loadSettings();
    }
  }

  private async initAudioContext(): Promise<void> {
    try {
      const audioWindow = window as Window & typeof globalThis & {
        webkitAudioContext?: typeof AudioContext;
      };
      const AudioContextClass = window.AudioContext || audioWindow.webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
      }
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  private loadSettings(): void {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('okoa_settings');
      if (saved) {
        try {
          const settings = JSON.parse(saved);
          this.enabled = settings.soundEnabled ?? true;
        } catch {}
      }
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  setVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  private async ensureAudioContext(): Promise<AudioContext | null> {
    if (!this.audioContext) {
      await this.initAudioContext();
    }
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume();
    }
    return this.audioContext;
  }

  // Generate synthetic sounds using Web Audio API
  private createOscillatorSound(
    frequency: number | number[],
    duration: number,
    volume: number = 0.3,
    frequencyEnd?: number
  ): AudioBuffer | null {
    const ctx = this.audioContext;
    if (!ctx) return null;

    const sampleRate = ctx.sampleRate;
    const length = sampleRate * duration;
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    const freqArray = Array.isArray(frequency) ? frequency : [frequency];
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const progress = t / duration;
      
      // Frequency interpolation
      let freq = freqArray[0];
      if (freqArray.length > 1) {
        freq = freqArray[0] + (freqArray[1] - freqArray[0]) * progress;
      } else if (frequencyEnd) {
        freq = freqArray[0] + (frequencyEnd - freqArray[0]) * progress;
      }

      // Envelope (attack, decay)
      let envelope = 1;
      const attackTime = 0.01;
      const decayTime = duration * 0.8;
      
      if (t < attackTime) {
        envelope = t / attackTime;
      } else if (t > duration - decayTime) {
        envelope = (duration - t) / decayTime;
      }

      data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * volume * this.masterVolume;
    }

    return buffer;
  }

  // Pre-generate the sound effects used by recovery interactions.
  async preloadSounds(): Promise<void> {
    const ctx = await this.ensureAudioContext();
    if (!ctx) return;

    this.soundBuffers.set('button_click', this.createOscillatorSound(600, 0.05, 0.15, 400) || 
      ctx.createBuffer(1, 1, ctx.sampleRate));
    this.soundBuffers.set('victory', this.createOscillatorSound([523, 659, 784, 1047, 1319], 1, 0.25) || 
      ctx.createBuffer(1, 1, ctx.sampleRate));
  }

  play(sound: SoundEffect): void {
    if (!this.enabled || !this.audioContext) return;

    const buffer = this.soundBuffers.get(sound);
    if (!buffer) return;

    try {
      const source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = this.masterVolume;
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      source.start(0);
    } catch (error) {
      console.warn(`Failed to play sound ${sound}:`, error);
    }
  }

  // Cleanup
  dispose(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.soundBuffers.clear();
  }
}

// Singleton instance
export const audioManager = new AudioManager();
