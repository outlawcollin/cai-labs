"use client";

import { useRef, useCallback } from "react";

interface Vector2 {
  x: number;
  y: number;
}

interface UseEyeTrackingConfig {
  maxOffset: number;        // Max pixels eyes can move
  trackingRadius: number;   // How close cursor must be to trigger tracking
  lerpFactor?: number;      // Smoothing factor (higher = snappier)
  deadzone?: number;        // Min movement before update
}

interface UseEyeTrackingReturn {
  eyeOffset: Vector2;
  updateEyeOffset: (mascotPosition: Vector2, mousePosition: Vector2) => Vector2;
  resetEyeOffset: () => void;
}

// Linear interpolation
function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}

export function useEyeTracking(config: UseEyeTrackingConfig): UseEyeTrackingReturn {
  const {
    maxOffset,
    trackingRadius,
    lerpFactor = 0.15,
    deadzone = 30,
  } = config;

  const eyeOffsetRef = useRef<Vector2>({ x: 0, y: 0 });
  const lastMousePositionRef = useRef<Vector2>({ x: 0, y: 0 });

  const updateEyeOffset = useCallback(
    (mascotPosition: Vector2, mousePosition: Vector2): Vector2 => {
      // Check if mouse has moved enough (deadzone)
      const mouseDx = mousePosition.x - lastMousePositionRef.current.x;
      const mouseDy = mousePosition.y - lastMousePositionRef.current.y;
      const mouseMovement = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy);

      if (mouseMovement > deadzone) {
        lastMousePositionRef.current = mousePosition;
      }

      const currentMouse = lastMousePositionRef.current;

      // Calculate distance from mascot to cursor
      const dx = currentMouse.x - mascotPosition.x;
      const dy = currentMouse.y - mascotPosition.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      let targetX = 0;
      let targetY = 0;

      // Only track if within radius
      if (distance <= trackingRadius && distance > 0) {
        // Calculate direction
        const dirX = dx / distance;
        const dirY = dy / distance;

        // Intensity based on proximity (closer = stronger)
        const intensity = 1 - distance / trackingRadius;

        // Target offset
        targetX = dirX * maxOffset * intensity;
        targetY = dirY * maxOffset * intensity;
      }

      // Smooth transition using lerp
      const current = eyeOffsetRef.current;
      const newOffset = {
        x: lerp(current.x, targetX, lerpFactor),
        y: lerp(current.y, targetY, lerpFactor),
      };

      // Only update if change is significant (prevents unnecessary renders)
      if (
        Math.abs(newOffset.x - current.x) >= 0.1 ||
        Math.abs(newOffset.y - current.y) >= 0.1
      ) {
        eyeOffsetRef.current = newOffset;
      }

      return eyeOffsetRef.current;
    },
    [maxOffset, trackingRadius, lerpFactor, deadzone]
  );

  const resetEyeOffset = useCallback(() => {
    eyeOffsetRef.current = { x: 0, y: 0 };
  }, []);

  return {
    eyeOffset: eyeOffsetRef.current,
    updateEyeOffset,
    resetEyeOffset,
  };
}

export default useEyeTracking;
