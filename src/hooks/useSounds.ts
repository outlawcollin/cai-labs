"use client";

import { useEffect, useState, useCallback } from "react";
import {
  soundManager,
  playSound,
  preloadSounds,
  SoundEffect,
} from "@/lib/sounds/soundManager";

/**
 * Hook for using sound effects in components
 * Handles preloading and provides play/mute functions
 */
export function useSounds() {
  const [isMuted, setIsMuted] = useState(soundManager.isMuted());
  const [isLoaded, setIsLoaded] = useState(false);

  // Preload sounds on mount
  useEffect(() => {
    preloadSounds().then(() => {
      setIsLoaded(true);
    });
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const newMuted = soundManager.toggleMute();
    setIsMuted(newMuted);
    return newMuted;
  }, []);

  // Set mute state
  const setMuted = useCallback((muted: boolean) => {
    soundManager.setMuted(muted);
    setIsMuted(muted);
  }, []);

  // Play a sound
  const play = useCallback((name: SoundEffect, volumeMultiplier?: number) => {
    playSound(name, volumeMultiplier);
  }, []);

  return {
    play,
    playSound: play, // Alias
    isMuted,
    isLoaded,
    toggleMute,
    setMuted,
  };
}

export default useSounds;
