import { Howl } from 'howler';
import { AUDIO_TRACKS, VOLUME, FADE_DURATION } from './constants';

export class AudioManager {
  private static instance: AudioManager;
  private sound: Howl | null = null;
  private retryCount = 0;
  private readonly maxRetries = 3;
  public previousVolume = VOLUME.DEFAULT;
  private isFading = false;

  private constructor() {}

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.sound) {
        this.sound.unload();
      }

      this.sound = new Howl({
        src: [AUDIO_TRACKS.AMBIENT],
        loop: true,
        volume: 0,
        autoplay: false,
        html5: true,
        preload: true,
        format: ['mp3'],
        onload: () => {
          console.log('Audio loaded successfully:', AUDIO_TRACKS.AMBIENT);
          this.retryCount = 0;
          resolve();
        },
        onloaderror: (id, error) => {
          console.error('Audio load error:', error);
          this.handleLoadError(reject);
        }
      });
    });
  }

  private handleLoadError(reject: (reason?: any) => void): void {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      setTimeout(() => {
        this.initialize().then(() => reject('Retrying...'));
      }, 2000 * this.retryCount);
    } else if (this.sound?.src()[0] !== AUDIO_TRACKS.FALLBACK) {
      this.retryCount = 0;
      this.sound?.unload();
      this.sound = new Howl({
        src: [AUDIO_TRACKS.FALLBACK],
        loop: true,
        volume: 0,
        autoplay: false,
        html5: true,
        preload: true,
        format: ['mp3']
      });
    } else {
      reject('Failed to load audio');
    }
  }

  setVolume(volume: number, isMuted: boolean): void {
    if (!this.sound) return;

    const targetVolume = isMuted ? 0 : Math.max(VOLUME.MIN, Math.min(volume, VOLUME.MAX));
    
    if (this.sound.playing() && targetVolume === 0) {
      this.pause();
    }
    
    this.sound.volume(targetVolume);
    
    if (targetVolume > 0 && !this.sound.playing()) {
      this.play();
    }
  }

  getCurrentVolume(): number {
    return this.sound?.volume() ?? 0;
  }

  getPreviousVolume(): number {
    return this.previousVolume;
  }

  isPlaying(): boolean {
    return this.sound?.playing() ?? false;
  }

  cleanup(): void {
    this.sound?.unload();
    this.sound = null;
  }

  play(): void {
    if (!this.sound) return;
    try {
      if (!this.sound.playing()) {
        this.sound.play();
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }

  pause(): void {
    if (!this.sound) return;
    this.sound.pause();
  }
}