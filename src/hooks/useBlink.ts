"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { EyeState, getRandomBlinkDelay } from "@/lib/mascots/states";

interface UseBlinkConfig {
  blinkDuration: number;       // How long blink lasts in ms
  doubleBinkChance?: number;   // Chance of double-blink (0-1)
  doubleBinkGap?: number;      // Gap between double-blinks in ms
  enabled?: boolean;           // Whether blinking is enabled
}

interface UseBlinkReturn {
  isBlinking: boolean;
  triggerBlink: () => void;
  currentEyeState: EyeState;
  setBaseState: (state: EyeState) => void;
}

export function useBlink(config: UseBlinkConfig): UseBlinkReturn {
  const {
    blinkDuration,
    doubleBinkChance = 0.15,
    doubleBinkGap = 150,
    enabled = true,
  } = config;

  const [isBlinking, setIsBlinking] = useState(false);
  const [baseState, setBaseState] = useState<EyeState>("neutral");

  const lastBlinkTimeRef = useRef(Date.now());
  const nextBlinkDelayRef = useRef(getRandomBlinkDelay());
  const blinkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const doubleBlinkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeouts
  const clearTimeouts = useCallback(() => {
    if (blinkTimeoutRef.current) {
      clearTimeout(blinkTimeoutRef.current);
      blinkTimeoutRef.current = null;
    }
    if (doubleBlinkTimeoutRef.current) {
      clearTimeout(doubleBlinkTimeoutRef.current);
      doubleBlinkTimeoutRef.current = null;
    }
  }, []);

  // Trigger a single blink
  const doBlink = useCallback(() => {
    setIsBlinking(true);

    blinkTimeoutRef.current = setTimeout(() => {
      setIsBlinking(false);
      lastBlinkTimeRef.current = Date.now();
      nextBlinkDelayRef.current = getRandomBlinkDelay();
    }, blinkDuration);
  }, [blinkDuration]);

  // Trigger blink (with possible double-blink)
  const triggerBlink = useCallback(() => {
    // Don't blink while in certain states
    if (["wide", "dizzy", "blink"].includes(baseState)) {
      return;
    }

    doBlink();

    // Possibly trigger double-blink
    if (Math.random() < doubleBinkChance) {
      doubleBlinkTimeoutRef.current = setTimeout(() => {
        doBlink();
      }, blinkDuration + doubleBinkGap);
    }
  }, [baseState, doBlink, blinkDuration, doubleBinkChance, doubleBinkGap]);

  // Automatic blink timer
  useEffect(() => {
    if (!enabled) return;

    const checkBlink = () => {
      const timeSinceLastBlink = Date.now() - lastBlinkTimeRef.current;

      if (timeSinceLastBlink >= nextBlinkDelayRef.current) {
        triggerBlink();
      }
    };

    // Check every 100ms
    const interval = setInterval(checkBlink, 100);

    return () => {
      clearInterval(interval);
      clearTimeouts();
    };
  }, [enabled, triggerBlink, clearTimeouts]);

  // Cleanup on unmount
  useEffect(() => {
    return clearTimeouts;
  }, [clearTimeouts]);

  // Get current eye state
  const currentEyeState: EyeState = isBlinking ? "blink" : baseState;

  return {
    isBlinking,
    triggerBlink,
    currentEyeState,
    setBaseState,
  };
}

export default useBlink;
