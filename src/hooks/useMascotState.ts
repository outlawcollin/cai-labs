"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { EyeState, getCollisionState } from "@/lib/mascots/states";
import { MascotConfig } from "@/lib/mascots/registry";
import { useBlink } from "./useBlink";
import { useEyeTracking } from "./useEyeTracking";

interface Vector2 {
  x: number;
  y: number;
}

interface UseMascotStateConfig {
  mascotConfig: MascotConfig;
  isExpressive: boolean;
}

interface UseMascotStateReturn {
  eyeState: EyeState;
  eyeOffset: Vector2;
  squashStretch: Vector2;
  updateState: (
    mascotPosition: Vector2,
    mousePosition: Vector2,
    velocity: Vector2,
    isBeingDragged: boolean
  ) => void;
  handleCollision: (intensity: number) => void;
  handleGrab: () => void;
  handleRelease: (velocity: Vector2) => void;
}

// Breathing animation
function breathingPulse(time: number): Vector2 {
  const breath = 1 + 0.015 * Math.sin(time * 0.003);
  return { x: breath, y: breath };
}

// Calculate squash/stretch from velocity
function getSquashStretch(velocity: Vector2, time: number): Vector2 {
  const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
  const maxStretch = 0.12;

  if (speed < 1) {
    return breathingPulse(time);
  }

  const stretchFactor = Math.min(speed / 25, maxStretch);

  if (Math.abs(velocity.y) > Math.abs(velocity.x)) {
    return {
      x: 1 - stretchFactor * 0.4,
      y: 1 + stretchFactor,
    };
  }

  return {
    x: 1 + stretchFactor,
    y: 1 - stretchFactor * 0.4,
  };
}

export function useMascotState(config: UseMascotStateConfig): UseMascotStateReturn {
  const { mascotConfig, isExpressive } = config;

  const [squashStretch, setSquashStretch] = useState<Vector2>({ x: 1, y: 1 });
  const [overrideState, setOverrideState] = useState<EyeState | null>(null);

  const stateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const followUpTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timeRef = useRef(Date.now());

  // Blink system
  const { currentEyeState: blinkState, setBaseState, triggerBlink } = useBlink({
    blinkDuration: mascotConfig.blinkDuration,
    enabled: isExpressive,
  });

  // Eye tracking
  const { updateEyeOffset, resetEyeOffset } = useEyeTracking({
    maxOffset: mascotConfig.eyeOffsetMax,
    trackingRadius: 200,
    lerpFactor: 0.12,
  });

  const eyeOffsetRef = useRef<Vector2>({ x: 0, y: 0 });

  // Clear timeouts
  const clearTimeouts = useCallback(() => {
    if (stateTimeoutRef.current) {
      clearTimeout(stateTimeoutRef.current);
      stateTimeoutRef.current = null;
    }
    if (followUpTimeoutRef.current) {
      clearTimeout(followUpTimeoutRef.current);
      followUpTimeoutRef.current = null;
    }
  }, []);

  // Set temporary state with auto-revert
  const setTemporaryState = useCallback(
    (state: EyeState, duration: number, followUp?: { state: EyeState; delay: number }) => {
      clearTimeouts();
      setOverrideState(state);

      stateTimeoutRef.current = setTimeout(() => {
        if (followUp) {
          setOverrideState(followUp.state);
          followUpTimeoutRef.current = setTimeout(() => {
            setOverrideState(null);
            setBaseState("neutral");
          }, followUp.delay);
        } else {
          setOverrideState(null);
          setBaseState("neutral");
        }
      }, duration);
    },
    [clearTimeouts, setBaseState]
  );

  // Handle collision
  const handleCollision = useCallback(
    (intensity: number) => {
      if (!isExpressive) return;

      const reaction = getCollisionState(intensity);
      if (reaction.duration > 0) {
        setTemporaryState(
          reaction.state,
          reaction.duration,
          reaction.followUpState
            ? { state: reaction.followUpState, delay: reaction.followUpDelay || 1000 }
            : undefined
        );
        triggerBlink();
      }
    },
    [isExpressive, setTemporaryState, triggerBlink]
  );

  // Handle grab start
  const handleGrab = useCallback(() => {
    if (!isExpressive) return;
    setTemporaryState("wide", 5000); // Will be cleared on release
  }, [isExpressive, setTemporaryState]);

  // Handle release
  const handleRelease = useCallback(
    (velocity: Vector2) => {
      if (!isExpressive) return;
      clearTimeouts();

      const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
      if (speed > 8) {
        // Fast release - brief wide eyes
        setTemporaryState("wide", 300);
      } else {
        setOverrideState(null);
      }
    },
    [isExpressive, clearTimeouts, setTemporaryState]
  );

  // Update state each frame
  const updateState = useCallback(
    (
      mascotPosition: Vector2,
      mousePosition: Vector2,
      velocity: Vector2,
      isBeingDragged: boolean
    ) => {
      timeRef.current = Date.now();

      // Update eye offset
      if (isExpressive && !isBeingDragged) {
        eyeOffsetRef.current = updateEyeOffset(mascotPosition, mousePosition);
      } else if (isBeingDragged) {
        // Reset eyes to center when being dragged
        eyeOffsetRef.current = {
          x: eyeOffsetRef.current.x * 0.9,
          y: eyeOffsetRef.current.y * 0.9,
        };
      }

      // Update squash/stretch
      const newSquash = getSquashStretch(velocity, timeRef.current);
      setSquashStretch(newSquash);
    },
    [isExpressive, updateEyeOffset]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeouts();
    };
  }, [clearTimeouts]);

  // Determine final eye state
  const eyeState = overrideState || blinkState;

  return {
    eyeState,
    eyeOffset: eyeOffsetRef.current,
    squashStretch,
    updateState,
    handleCollision,
    handleGrab,
    handleRelease,
  };
}

export default useMascotState;
