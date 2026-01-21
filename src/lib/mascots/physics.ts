// Physics helpers for mascot animations

interface Vector2 {
  x: number;
  y: number;
}

// Calculate squash and stretch based on velocity
export function getSquashStretch(velocity: Vector2, time: number): Vector2 {
  const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
  const maxStretch = 0.15; // 15% maximum deformation

  if (speed < 1) {
    // Idle: subtle breathing animation
    return breathingPulse(time);
  }

  // Calculate stretch along velocity direction
  const stretchFactor = Math.min(speed / 20, maxStretch);

  // Moving mostly vertically (falling/rising)
  if (Math.abs(velocity.y) > Math.abs(velocity.x)) {
    return {
      x: 1 - stretchFactor * 0.5,  // Squeeze horizontally
      y: 1 + stretchFactor,         // Stretch vertically
    };
  }

  // Moving mostly horizontally
  return {
    x: 1 + stretchFactor,
    y: 1 - stretchFactor * 0.5,
  };
}

// Subtle breathing animation when idle
export function breathingPulse(time: number): Vector2 {
  // Gentle oscillation between 1.0 and 1.02
  const breath = 1 + 0.02 * Math.sin(time * 0.002);
  return { x: breath, y: breath };
}

// Calculate eye offset based on cursor position
export function calculateEyeOffset(
  mascotPosition: Vector2,
  mousePosition: Vector2,
  config: {
    maxOffset: number;
    trackingRadius: number;
    lerpFactor?: number;
  },
  currentOffset: Vector2
): Vector2 {
  const { maxOffset, trackingRadius, lerpFactor = 0.15 } = config;

  // Calculate distance from mascot to cursor
  const dx = mousePosition.x - mascotPosition.x;
  const dy = mousePosition.y - mascotPosition.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // If cursor is outside tracking radius, return to center
  if (distance > trackingRadius) {
    return {
      x: lerp(currentOffset.x, 0, lerpFactor),
      y: lerp(currentOffset.y, 0, lerpFactor),
    };
  }

  // Calculate direction and intensity
  const dirX = dx / distance || 0;
  const dirY = dy / distance || 0;

  // Intensity based on proximity (closer = stronger)
  const intensity = 1 - distance / trackingRadius;

  // Target offset
  const targetX = dirX * maxOffset * intensity;
  const targetY = dirY * maxOffset * intensity;

  // Smooth transition using lerp
  return {
    x: lerp(currentOffset.x, targetX, lerpFactor),
    y: lerp(currentOffset.y, targetY, lerpFactor),
  };
}

// Linear interpolation
function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor;
}

// Check if offset change is significant enough to update
export function isSignificantChange(
  current: Vector2,
  next: Vector2,
  threshold: number = 0.5
): boolean {
  return (
    Math.abs(next.x - current.x) >= threshold ||
    Math.abs(next.y - current.y) >= threshold
  );
}

// Impact squash effect for landing/collision
export function getImpactSquash(impactVelocity: number): Vector2 {
  const squashFactor = Math.min(impactVelocity / 15, 0.3);
  return {
    x: 1 + squashFactor,
    y: 1 - squashFactor,
  };
}

// Recover from squash to normal
export function recoverFromSquash(
  current: Vector2,
  recoveryFactor: number = 0.1
): Vector2 {
  return {
    x: lerp(current.x, 1, recoveryFactor),
    y: lerp(current.y, 1, recoveryFactor),
  };
}
