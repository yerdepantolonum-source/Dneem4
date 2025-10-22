export class AudioManager {
  private sounds: Map<string, HTMLAudioElement>;
  private isMuted: boolean;

  constructor() {
    this.sounds = new Map();
    this.isMuted = false;
    this.loadSounds();
  }

  private async loadSounds(): Promise<void> {
    const soundFiles = [
      { name: 'hit', path: '/sounds/hit.mp3' },
      { name: 'success', path: '/sounds/success.mp3' },
      { name: 'background', path: '/sounds/background.mp3' }
    ];

    soundFiles.forEach(({ name, path }) => {
      const audio = new Audio(path);
      audio.volume = 0.3;
      this.sounds.set(name, audio);
    });
  }

  playSound(name: string): void {
    if (this.isMuted) return;

    const sound = this.sounds.get(name);
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(() => {
        // Ignore errors (autoplay restrictions, etc.)
      });
    }
  }

  playBackgroundMusic(): void {
    if (this.isMuted) return;

    const music = this.sounds.get('background');
    if (music) {
      music.loop = true;
      music.volume = 0.1;
      music.play().catch(() => {
        // Ignore errors
      });
    }
  }

  stopBackgroundMusic(): void {
    const music = this.sounds.get('background');
    if (music) {
      music.pause();
      music.currentTime = 0;
    }
  }

  setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (muted) {
      this.stopBackgroundMusic();
    }
  }

  toggleMute(): void {
    this.setMuted(!this.isMuted);
  }
}
