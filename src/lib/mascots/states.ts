// Mascot State Machine - Manages eye expressions and states

export type EyeState =
  | 'neutral'    // Default, looking around
  | 'blink'      // Brief blink animation
  | 'wide'       // Surprised (grabbed, collision)
  | 'happy'      // Content (gentle interaction)
  | 'dizzy'      // After hard collision
  | 'sleepy';    // When idle for long time

export interface MascotState {
  eyeState: EyeState;
  isTracking: boolean;        // Whether eyes should follow cursor
  eyeOffset: { x: number; y: number };  // Current eye layer offset
  lastBlinkTime: number;
  nextBlinkDelay: number;     // Randomized delay until next blink
}

export interface StateTransition {
  from: EyeState;
  to: EyeState;
  duration?: number;  // Auto-revert after this duration (ms)
}

// Generate random blink delay (2500-4500ms)
export function getRandomBlinkDelay(): number {
  return 2500 + Math.random() * 2000;
}

// Initial mascot state
export function createInitialState(): MascotState {
  return {
    eyeState: 'neutral',
    isTracking: true,
    eyeOffset: { x: 0, y: 0 },
    lastBlinkTime: Date.now(),
    nextBlinkDelay: getRandomBlinkDelay(),
  };
}

// Get the eye asset key for current state with fallback
export function getEyeAssetKey(state: EyeState, availableStates: string[]): string {
  // Direct match
  if (availableStates.includes(state)) {
    return state;
  }

  // Fallbacks
  switch (state) {
    case 'happy':
    case 'sleepy':
      return 'neutral';
    case 'dizzy':
      return availableStates.includes('wide') ? 'wide' : 'neutral';
    default:
      return 'neutral';
  }
}

// State transition helpers
export function shouldBlink(state: MascotState): boolean {
  // Don't blink while in certain states
  if (['wide', 'dizzy', 'blink'].includes(state.eyeState)) {
    return false;
  }

  const timeSinceLastBlink = Date.now() - state.lastBlinkTime;
  return timeSinceLastBlink >= state.nextBlinkDelay;
}

// Calculate collision intensity from velocity
export function getCollisionIntensity(velocity: { x: number; y: number }): number {
  return Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
}

// Determine state after collision
export function getCollisionState(intensity: number): {
  state: EyeState;
  duration: number;
  followUpState?: EyeState;
  followUpDelay?: number;
} {
  if (intensity > 10) {
    // Hard collision: wide -> dizzy -> neutral
    return {
      state: 'wide',
      duration: 200,
      followUpState: 'dizzy',
      followUpDelay: 1300,
    };
  } else if (intensity > 5) {
    // Medium collision: wide -> neutral
    return {
      state: 'wide',
      duration: 400,
    };
  }
  // Light collision: no change
  return { state: 'neutral', duration: 0 };
}
