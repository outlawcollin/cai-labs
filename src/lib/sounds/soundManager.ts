"use client";

// Sound effect types
export type SoundEffect =
  | "glitch"
  | "pop"
  | "whoosh"
  | "portal-open"
  | "portal-consume"
  | "success";

// Sound file paths
const SOUND_PATHS: Record<SoundEffect, string> = {
  glitch: "/sounds/glitch.mp3",
  pop: "/sounds/pop.mp3",
  whoosh: "/sounds/whoosh.mp3",
  "portal-open": "/sounds/portal-open.mp3",
  "portal-consume": "/sounds/portal-consume.mp3",
  success: "/sounds/success.mp3",
};

// Default volumes for each sound (can be adjusted)
const SOUND_VOLUMES: Record<SoundEffect, number> = {
  glitch: 0.3,
  pop: 0.4,
  whoosh: 0.35,
  "portal-open": 0.4,
  "portal-consume": 0.35,
  success: 0.5,
};

const MUTE_STORAGE_KEY = "cai-labs-sound-muted";

class SoundManager {
  private sounds: Map<SoundEffect, HTMLAudioElement[]> = new Map();
  private muted: boolean = false;
  private initialized: boolean = false;
  private masterVolume: number = 1.0;
  private poolSize: number = 3; // Number of audio instances per sound for overlapping

  constructor() {
    // Check for stored mute preference
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(MUTE_STORAGE_KEY);
      this.muted = stored === "true";
    }
  }

  /**
   * Initialize and preload all sound effects
   * Should be called once on app mount
   */
  async preload(): Promise<void> {
    if (this.initialized || typeof window === "undefined") return;

    const loadPromises: Promise<void>[] = [];

    for (const [name, path] of Object.entries(SOUND_PATHS)) {
      const soundName = name as SoundEffect;
      const audioPool: HTMLAudioElement[] = [];

      // Create a pool of audio elements for each sound
      for (let i = 0; i < this.poolSize; i++) {
        const audio = new Audio(path);
        audio.volume = SOUND_VOLUMES[soundName] * this.masterVolume;
        audio.preload = "auto";
        audioPool.push(audio);

        // Only wait for the first instance to load
        if (i === 0) {
          loadPromises.push(
            new Promise((resolve, reject) => {
              audio.addEventListener("canplaythrough", () => resolve(), { once: true });
              audio.addEventListener("error", () => {
                console.warn(`Failed to load sound: ${path}`);
                resolve(); // Don't block on failed sounds
              }, { once: true });
            })
          );
        }
      }

      this.sounds.set(soundName, audioPool);
    }

    await Promise.all(loadPromises);
    this.initialized = true;
  }

  /**
   * Play a sound effect
   * @param name - The sound effect to play
   * @param volumeMultiplier - Optional multiplier for this specific play (0-1)
   */
  play(name: SoundEffect, volumeMultiplier: number = 1): void {
    if (this.muted || typeof window === "undefined") return;

    const audioPool = this.sounds.get(name);
    if (!audioPool || audioPool.length === 0) {
      console.warn(`Sound not found: ${name}`);
      return;
    }

    // Find an audio element that's not currently playing
    let audio = audioPool.find((a) => a.paused || a.ended);

    // If all are playing, use the first one (will restart)
    if (!audio) {
      audio = audioPool[0];
    }

    // Reset and play
    audio.currentTime = 0;
    audio.volume = SOUND_VOLUMES[name] * this.masterVolume * volumeMultiplier;

    // Handle autoplay restrictions
    audio.play().catch((err) => {
      // Silently fail if autoplay is blocked
      if (err.name !== "NotAllowedError") {
        console.warn(`Failed to play sound: ${name}`, err);
      }
    });
  }

  /**
   * Toggle mute state
   * @returns New mute state
   */
  toggleMute(): boolean {
    this.muted = !this.muted;
    if (typeof window !== "undefined") {
      localStorage.setItem(MUTE_STORAGE_KEY, String(this.muted));
    }
    return this.muted;
  }

  /**
   * Set mute state
   */
  setMuted(muted: boolean): void {
    this.muted = muted;
    if (typeof window !== "undefined") {
      localStorage.setItem(MUTE_STORAGE_KEY, String(this.muted));
    }
  }

  /**
   * Get current mute state
   */
  isMuted(): boolean {
    return this.muted;
  }

  /**
   * Set master volume
   * @param volume - Volume level (0-1)
   */
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));

    // Update all existing audio elements
    for (const [name, audioPool] of this.sounds) {
      for (const audio of audioPool) {
        audio.volume = SOUND_VOLUMES[name] * this.masterVolume;
      }
    }
  }

  /**
   * Get master volume
   */
  getMasterVolume(): number {
    return this.masterVolume;
  }
}

// Singleton instance
export const soundManager = new SoundManager();

// Convenience functions
export const playSound = (name: SoundEffect, volumeMultiplier?: number) =>
  soundManager.play(name, volumeMultiplier);

export const preloadSounds = () => soundManager.preload();

export const toggleSoundMute = () => soundManager.toggleMute();

export const isSoundMuted = () => soundManager.isMuted();

export const setSoundMuted = (muted: boolean) => soundManager.setMuted(muted);
